import { useCallback, useEffect, useRef, useState } from 'react';
import { detect, loadFaceApi, type FaceBox } from './faceApi';
import { EMPTY_EXPRESSIONS, type Expressions, averageExpressions } from '../mood/classify';

export type CameraState = 'off' | 'requesting' | 'live' | 'denied' | 'error';

export type VisionState = {
  cameraState: CameraState;
  modelsReady: boolean;
  faceFound: boolean;
  /** Live "how big is that smile" signal, 0..1. Drives the smile meter. */
  smile: number;
  expressions: Expressions;
  box: FaceBox | null;
  errorMessage: string | null;
};

const INITIAL: VisionState = {
  cameraState: 'off',
  modelsReady: false,
  faceFound: false,
  smile: 0,
  expressions: EMPTY_EXPRESSIONS,
  box: null,
  errorMessage: null,
};

/** Detection cadence. 12/sec is plenty for a face that is barely moving. */
const TICK_MS = 80;

/**
 * Owns the camera, the detection loop, the candid mood sample and the photo.
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

  /** Candid samples, collected during `warmup` only — see classifyMood. */
  const candidRef = useRef<Expressions[] | null>(null);
  /** Best smiling frame seen during the smile gate, so the photo flatters. */
  const bestSmileFrameRef = useRef<{ smile: number; dataUrl: string } | null>(null);

  const [state, setState] = useState<VisionState>(INITIAL);
  const mockStartRef = useRef(0);

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
    candidRef.current = null;
    bestSmileFrameRef.current = null;
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
          candidRef.current?.push(result.expressions);
          rememberBestSmile(result.expressions.happy, video, result.box, bestSmileFrameRef);
          setState((s) => ({
            ...s,
            faceFound: true,
            smile: result.expressions.happy,
            expressions: result.expressions,
            box: result.box,
          }));
        } else {
          setState((s) => (s.faceFound ? { ...s, faceFound: false, smile: 0, box: null } : s));
        }
      } catch {
        /* a dropped frame is not worth ending the story over */
      }
    }

    if (runningRef.current) loopRef.current = window.setTimeout(tickReal, TICK_MS);
  }, []);

  const tickMock = useCallback(() => {
    if (!runningRef.current) return;
    const t = (performance.now() - mockStartRef.current) / 1000;

    // A face "appears" after a beat, then the smile swells and fades so the
    // smile gate can be walked through with no camera and no face.
    const faceFound = t > 0.8;
    const smile = faceFound ? Math.max(0, Math.sin((t - 0.8) * 1.1)) ** 0.7 : 0;
    const expressions: Expressions = {
      ...EMPTY_EXPRESSIONS,
      neutral: 0.62,
      happy: smile,
      sad: 0.12,
    };

    if (faceFound) candidRef.current?.push(expressions);
    setState((s) => ({
      ...s,
      faceFound,
      smile,
      expressions,
      box: faceFound ? { x: 0.3, y: 0.18, width: 0.4, height: 0.5 } : null,
    }));

    loopRef.current = window.setTimeout(tickMock, TICK_MS);
  }, []);

  useEffect(() => stop, [stop]);

  // ── the bits the story drives ────────────────────────────────────────────

  /** Start collecting the candid read. Called on entering `warmup`. */
  const beginCandid = useCallback(() => {
    candidRef.current = [];
  }, []);

  /** Close the candid window and hand back the averaged read. */
  const endCandid = useCallback((): Expressions => {
    const samples = candidRef.current ?? [];
    candidRef.current = null;
    return averageExpressions(samples);
  }, []);

  /**
   * The photo. Prefers the best smiling frame captured during the gate, so
   * nobody gets handed a picture of themselves mid-blink.
   */
  const capture = useCallback((): string | null => {
    if (mock) return mockPhoto();
    const remembered = bestSmileFrameRef.current;
    if (remembered) return remembered.dataUrl;
    const video = videoRef.current;
    return video ? framePhoto(video, null) : null;
  }, [mock]);

  return { videoRef, state, start, stop, beginCandid, endCandid, capture };
}

// ── helpers ────────────────────────────────────────────────────────────────

function rememberBestSmile(
  smile: number,
  video: HTMLVideoElement,
  box: FaceBox,
  ref: { current: { smile: number; dataUrl: string } | null },
) {
  // Only bother re-encoding when this is meaningfully the best frame so far.
  if (smile < 0.5) return;
  if (ref.current && smile <= ref.current.smile + 0.05) return;
  const dataUrl = framePhoto(video, box);
  if (dataUrl) ref.current = { smile, dataUrl };
}

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
