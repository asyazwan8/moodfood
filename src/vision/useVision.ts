import { useCallback, useEffect, useRef, useState } from 'react';
import { detect, loadFaceApi, type FaceBox } from './faceApi';
import { EMPTY_EXPRESSIONS, READ_CHANNELS, type Exercise, type Expressions } from '../mood/classify';

export type CameraState = 'off' | 'requesting' | 'live' | 'denied' | 'error';

export type VisionState = {
  cameraState: CameraState;
  modelsReady: boolean;
  faceFound: boolean;
  /** Live probabilities. The active round reads its own channel out of this. */
  expressions: Expressions;
  box: FaceBox | null;
  errorMessage: string | null;
};

/** What one exercise round produced. */
export type RoundResult = {
  exerciseId: string;
  /** Highest the round's channel reached. */
  peak: number;
  /** ms to cross the threshold, or null if it never did. */
  timeToHit: number | null;
  /** The frame captured at the round's strongest moment. */
  photo: string | null;
};

const INITIAL: VisionState = {
  cameraState: 'off',
  modelsReady: false,
  faceFound: false,
  expressions: EMPTY_EXPRESSIONS,
  box: null,
  errorMessage: null,
};

/** Detection cadence. 12/sec is plenty for a face that is barely moving. */
const TICK_MS = 80;

/**
 * Which channel a ?mock=1 read pretends to see. `?show=angry` overrides it, so
 * every mood can be walked through without a face.
 */
const mockReadChannel = ((): keyof Expressions => {
  const asked = new URLSearchParams(window.location.search).get('show');
  const allowed = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted'] as const;
  return (allowed as readonly string[]).includes(asked ?? '')
    ? (asked as keyof Expressions)
    : 'happy';
})();

/**
 * Owns the camera, the detection loop, the exercise rounds and the photos.
 *
 * PRIVACY: frames never leave this hook. Nothing is uploaded, nothing is
 * written to storage. `stop()` hard-releases the camera track and drops the
 * captured photo, and it is called every time the kiosk returns to idle, so
 * one visitor's face is gone before the next one walks up.
 */
export function useVision({ mock = false }: { mock?: boolean } = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  /**
   * The round in progress. Holds its own peak and photo so each exercise is
   * scored and photographed independently.
   */
  const roundRef = useRef<
    | (RoundResult & { exercise: Exercise; startedAt: number })
    | null
  >(null);

  /**
   * The open read. Unlike a game round this watches every channel at once,
   * because the visitor chooses what to show rather than being given a target.
   */
  const readRef = useRef<{ peaks: Expressions; photo: string | null; best: number } | null>(null);

  /** Highest each channel reached across the whole session. Debug only. */
  const peaksRef = useRef<Expressions>({ ...EMPTY_EXPRESSIONS });

  const [state, setState] = useState<VisionState>(INITIAL);
  const mockStartRef = useRef(0);
  const mockReadStartRef = useRef(0);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (loopRef.current !== null) {
      window.clearTimeout(loopRef.current);
      loopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    roundRef.current = null;
    readRef.current = null;
    peaksRef.current = { ...EMPTY_EXPRESSIONS };
    setState(INITIAL);
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    if (mock) {
      mockStartRef.current = performance.now();
      setState((s) => ({ ...s, cameraState: 'live', modelsReady: true, errorMessage: null }));
      tickMock();
      return;
    }

    setState((s) => ({ ...s, cameraState: 'requesting', errorMessage: null }));

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (err) {
      runningRef.current = false;
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      setState((s) => ({
        ...s,
        cameraState: denied ? 'denied' : 'error',
        errorMessage: describeCameraError(err),
      }));
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* autoplay policies — the stream still renders once it can */
      }
    }
    setState((s) => ({ ...s, cameraState: 'live' }));

    try {
      await loadFaceApi();
      setState((s) => ({ ...s, modelsReady: true }));
    } catch (err) {
      setState((s) => ({
        ...s,
        cameraState: 'error',
        errorMessage: err instanceof Error ? err.message : 'Could not load the face models.',
      }));
      runningRef.current = false;
      return;
    }

    tickReal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock]);

  // ── the two loops ────────────────────────────────────────────────────────

  const tickReal = useCallback(async () => {
    if (!runningRef.current) return;
    const video = videoRef.current;

    if (video) {
      try {
        const faceapi = await loadFaceApi();
        const result = await detect(faceapi, video);
        if (!runningRef.current) return;

        if (result) {
          record(result.expressions, video, result.box);
          setState((s) => ({
            ...s,
            faceFound: true,
            expressions: result.expressions,
            box: result.box,
          }));
        } else {
          setState((s) => (s.faceFound ? { ...s, faceFound: false, box: null } : s));
        }
      } catch {
        /* a dropped frame is not worth ending the story over */
      }
    }

    if (runningRef.current) loopRef.current = window.setTimeout(tickReal, TICK_MS);
  }, []);

  const tickMock = useCallback(() => {
    if (!runningRef.current) return;
    const now = performance.now();
    const t = (now - mockStartRef.current) / 1000;
    const faceFound = t > 0.8;

    // Raise whichever channel the current round is watching, so a ?mock=1
    // walkthrough actually completes all four rounds instead of timing out of
    // every one of them. Ramps over ~1.6s from the round starting.
    const round = roundRef.current;
    const expressions: Expressions = { ...EMPTY_EXPRESSIONS, neutral: 0.7 };
    if (faceFound && readRef.current) {
      // Ramp one channel so a mock walkthrough produces a performed mood
      // rather than falling through to Steady.
      const since = (now - mockReadStartRef.current) / 1000;
      const ramp = Math.min(1, Math.max(0, since / 1.8));
      expressions[mockReadChannel] = ramp * 0.9;
      expressions.neutral = 0.7 * (1 - ramp);
    } else if (faceFound && round) {
      const since = (now - round.startedAt) / 1000;
      const ramp = Math.min(1, Math.max(0, since / 1.6));
      expressions[round.exercise.channel] = ramp * (round.exercise.threshold + 0.18);
      expressions.neutral = 0.7 * (1 - ramp);
    } else if (faceFound) {
      expressions.happy = 0.1;
    }

    if (faceFound) record(expressions, null, null);
    setState((s) => ({
      ...s,
      faceFound,
      expressions,
      box: faceFound ? { x: 0.3, y: 0.18, width: 0.4, height: 0.5 } : null,
    }));

    loopRef.current = window.setTimeout(tickMock, TICK_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock]);

  /**
   * Folds one detection into the session peaks and the round in progress.
   * Shared by both loops so mock and real behave identically downstream.
   */
  const record = useCallback(
    (expressions: Expressions, video: HTMLVideoElement | null, box: FaceBox | null) => {
      const peaks = peaksRef.current;
      for (const key of Object.keys(expressions) as (keyof Expressions)[]) {
        if (expressions[key] > peaks[key]) peaks[key] = expressions[key];
      }

      // The open read: keep every channel's peak, and photograph whenever the
      // strongest thing we have seen so far gets stronger.
      const active = readRef.current;
      if (active) {
        for (const channel of READ_CHANNELS) {
          if (expressions[channel] > active.peaks[channel]) active.peaks[channel] = expressions[channel];
        }
        const strongest = Math.max(...READ_CHANNELS.map((c) => expressions[c]));
        if (strongest > active.best) {
          active.best = strongest;
          const shot = mock ? mockPhoto() : video ? framePhoto(video, box) : null;
          if (shot) active.photo = shot;
        }
      }

      const round = roundRef.current;
      if (!round) return;

      const value = expressions[round.exercise.channel];
      if (value > round.peak) {
        round.peak = value;
        // Photograph the round at its strongest moment, so the strip shows the
        // best version of each face rather than whatever was on screen when
        // the threshold happened to tick over.
        if (value > round.exercise.threshold * 0.6) {
          const shot = mock ? mockPhoto() : video ? framePhoto(video, box) : null;
          if (shot) round.photo = shot;
        }
      }
      if (round.timeToHit === null && value >= round.exercise.threshold) {
        round.timeToHit = performance.now() - round.startedAt;
      }
    },
    [mock],
  );

  useEffect(() => stop, [stop]);

  // ── the bits the story drives ────────────────────────────────────────────

  /** Open the read. Every channel is watched; the visitor picks what to show. */
  const beginRead = useCallback(() => {
    readRef.current = { peaks: { ...EMPTY_EXPRESSIONS }, photo: null, best: 0 };
    mockReadStartRef.current = performance.now();
  }, []);

  /** Close the read and hand back the peaks and the photo. */
  const endRead = useCallback((): { peaks: Expressions; photo: string | null } => {
    const active = readRef.current;
    readRef.current = null;
    return active
      ? { peaks: active.peaks, photo: active.photo }
      : { peaks: { ...EMPTY_EXPRESSIONS }, photo: null };
  }, []);

  /** Open a game round. Everything recorded from here is scored against it. */
  const beginRound = useCallback((exercise: Exercise) => {
    roundRef.current = {
      exercise,
      exerciseId: exercise.id,
      startedAt: performance.now(),
      peak: 0,
      timeToHit: null,
      photo: null,
    };
  }, []);

  /** Close the round and hand back what it scored. */
  const endRound = useCallback((): RoundResult => {
    const round = roundRef.current;
    roundRef.current = null;
    if (!round) return { exerciseId: '', peak: 0, timeToHit: null, photo: null };
    return {
      exerciseId: round.exerciseId,
      peak: round.peak,
      timeToHit: round.timeToHit,
      photo: round.photo,
    };
  }, []);

  /** Session-wide channel peaks, for the secondary moods. */
  const sessionPeaks = useCallback(() => ({ ...peaksRef.current }), []);

  return { videoRef, state, start, stop, beginRead, endRead, beginRound, endRound, sessionPeaks };
}

// ── helpers ────────────────────────────────────────────────────────────────

/** Draws a mirrored, portrait-cropped still around the face. */
function framePhoto(video: HTMLVideoElement, box: FaceBox | null): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const OUT_W = 720;
  const OUT_H = 900;

  // Crop a 4:5 portrait around the face with generous headroom, falling back
  // to a centre crop if we have no box.
  let cropH = vh;
  let cropW = cropH * (OUT_W / OUT_H);
  let cx = vw / 2;
  let cy = vh / 2;

  if (box) {
    const faceH = box.height * vh;
    cropH = Math.min(vh, faceH * 2.6);
    cropW = cropH * (OUT_W / OUT_H);
    cx = (box.x + box.width / 2) * vw;
    cy = (box.y + box.height / 2) * vh - faceH * 0.1;
  }

  if (cropW > vw) {
    cropW = vw;
    cropH = cropW * (OUT_H / OUT_W);
  }

  const sx = clamp(cx - cropW / 2, 0, vw - cropW);
  const sy = clamp(cy - cropH / 2, 0, vh - cropH);

  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Mirrored, because a kiosk camera should behave like a mirror.
  ctx.translate(OUT_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, OUT_W, OUT_H);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/** A stand-in portrait so ?mock=1 walkthroughs still have something in the frame. */
function mockPhoto(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 720, 900);
  grad.addColorStop(0, '#E8ECFA');
  grad.addColorStop(1, '#CFD9F5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 720, 900);

  ctx.fillStyle = 'rgba(242, 246, 255, 0.16)';
  ctx.beginPath();
  ctx.arc(360, 360, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(360, 760, 240, 220, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(242, 246, 255, 0.5)';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('demo mode', 360, 860);
  return canvas.toDataURL('image/jpeg', 0.9);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function describeCameraError(err: unknown): string {
  if (!(err instanceof DOMException)) return 'The camera could not be started.';
  switch (err.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera permission was blocked for this screen.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found on this machine.';
    case 'NotReadableError':
      return 'The camera is already in use by something else.';
    default:
      return 'The camera could not be started.';
  }
}
