import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './app.css';
import { Stage } from './kiosk/Stage';
import { usePress } from './kiosk/usePress';
import { useIdleTimeout } from './kiosk/useIdleTimeout';
import { Backdrop } from './backdrop/Backdrop';
import { IDLE_TINT, MOODS, type MoodId } from './mood/moods';
import { EXERCISES, ROUND_TIMEOUT_MS, moodFromExercises, type Attempt } from './mood/classify';
import { pickFood } from './recommend/pickFood';
import { canPress, freshSession, reduce, type SceneId } from './story/machine';
import { useVision } from './vision/useVision';
import { CameraView } from './scenes/CameraView';
import { Idle } from './scenes/Idle';
import { Consent } from './scenes/Consent';
import { Warmup } from './scenes/Warmup';
import { Exercises } from './scenes/Exercises';
import { Reading } from './scenes/Reading';
import { MoodReveal } from './scenes/MoodReveal';
import { Encouragement } from './scenes/Encouragement';
import { FoodPick } from './scenes/FoodPick';
import { Thanks } from './scenes/Thanks';
import { DebugPanel } from './kiosk/DebugPanel';

/** How long a face has to be held before we believe we have found someone. */
const FACE_STABLE_MS = 1800;
/** Give up looking and move on rather than stranding someone on a dead screen. */
const WARMUP_TIMEOUT_MS = 12_000;

/** How long the flash and "got it" beat hold before the next round starts. */
const ROUND_SETTLE_MS = 1100;

const READING_MS = 2200;
const THANKS_MS = 14_000;
const IDLE_TIMEOUT_MS = 45_000;

/**
 * Only these scenes are waiting on a person, so only these can be abandoned.
 * Everything else either drives itself to the next beat on a bounded timer or
 * is already home.
 */
const WAITS_FOR_A_HUMAN: ReadonlySet<SceneId> = new Set<SceneId>([
  'consent',
  'mood',
  'encouragement',
  'food',
]);

export function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const mock = params.get('mock') === '1';
  const forcedMood = (params.get('mood') as MoodId | null) ?? null;
  const [debug, setDebug] = useState(params.get('debug') === '1');

  const [session, dispatch] = useReducer(reduce, undefined, freshSession);
  const vision = useVision({ mock });

  // The scene timers read vision state from inside intervals. A ref keeps them
  // reading fresh values without tearing the timer down on every frame.
  const visionRef = useRef(vision.state);
  visionRef.current = vision.state;

  const { scene } = session;
  const [round, setRound] = useState({ index: 0, hit: false, escaped: false, flashing: false });

  useEffect(() => {
    document.body.dataset.debug = debug ? '1' : '0';
  }, [debug]);

  // Published on <body> so the kiosk's current beat is visible to anything
  // driving it from outside — the screenshot harness, or a wrapper app.
  useEffect(() => {
    document.body.dataset.scene = scene;
  }, [scene]);

  // ── returning to idle ────────────────────────────────────────────────────

  const goIdle = useCallback(() => {
    vision.stop();
    dispatch({ type: 'reset' });
  }, [vision]);

  useIdleTimeout(goIdle, IDLE_TIMEOUT_MS, WAITS_FOR_A_HUMAN.has(scene), scene);

  // ── press handling ───────────────────────────────────────────────────────

  const onPress = useCallback(() => {
    if (scene === 'idle') dispatch({ type: 'start' });
    else dispatch({ type: 'next' });
  }, [scene]);

  usePress(onPress, canPress(scene));

  // ── consent → warmup ─────────────────────────────────────────────────────

  const acceptCamera = useCallback(() => {
    void vision.start();
  }, [vision]);

  useEffect(() => {
    if (scene !== 'consent') return;
    // Wait for the models too, not just the stream: entering warmup before the
    // weights are ready means the "ah, there you are" beat fires against a
    // detector that cannot see anything yet.
    if (vision.state.cameraState === 'live' && vision.state.modelsReady) {
      dispatch({ type: 'cameraReady' });
    }
  }, [scene, vision.state.cameraState, vision.state.modelsReady]);

  // ── warmup: find the face ────────────────────────────────────────────────

  useEffect(() => {
    if (scene !== 'warmup') return;

    const started = performance.now();
    let faceSince: number | null = null;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      dispatch({ type: 'faceFound' });
    };

    const id = window.setInterval(() => {
      const now = performance.now();
      if (visionRef.current.faceFound) {
        faceSince ??= now;
        if (now - faceSince >= FACE_STABLE_MS) finish();
      } else {
        faceSince = null;
      }
      if (now - started >= WARMUP_TIMEOUT_MS) finish();
    }, 120);

    return () => window.clearInterval(id);
  }, [scene]);

  // ── the exercise rounds ──────────────────────────────────────────────────

  useEffect(() => {
    if (scene !== 'exercises') {
      setRound({ index: 0, hit: false, escaped: false, flashing: false });
      return;
    }

    let index = 0;
    let cancelled = false;
    let poll = 0;
    const attempts: Attempt[] = [];
    const shots: (string | null)[] = [];
    const timeouts: number[] = [];

    const closeRound = (escaped: boolean) => {
      const result = vision.endRound();
      attempts.push({
        exerciseId: result.exerciseId,
        peak: result.peak,
        timeToHit: result.timeToHit,
      });
      shots.push(result.photo);
      setRound({ index, hit: !escaped, escaped, flashing: !escaped });

      timeouts.push(
        window.setTimeout(() => {
          if (cancelled) return;
          index += 1;
          if (index >= EXERCISES.length) {
            dispatch({
              type: 'exercisesDone',
              mood:
                forcedMood ??
                moodFromExercises(attempts, vision.sessionPeaks(), session.daypart),
              shots,
            });
            return;
          }
          startRound();
        }, ROUND_SETTLE_MS),
      );
    };

    const startRound = () => {
      const exercise = EXERCISES[index];
      if (!exercise) return;
      vision.beginRound(exercise);
      setRound({ index, hit: false, escaped: false, flashing: false });

      const startedAt = performance.now();
      poll = window.setInterval(() => {
        if (cancelled) return;
        const value = visionRef.current.expressions[exercise.channel];
        const elapsed = performance.now() - startedAt;

        if (value >= exercise.threshold) {
          window.clearInterval(poll);
          closeRound(false);
        } else if (elapsed >= ROUND_TIMEOUT_MS) {
          // Not a failure. face-api genuinely struggles with angry and sad, so
          // plenty of people cannot trigger them however hard they try — and
          // being told you failed at having a feeling is a bad note to hit in
          // the middle of a shopping mall.
          window.clearInterval(poll);
          closeRound(true);
        }
      }, 90);
    };

    startRound();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      timeouts.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // ── reading → reveal ─────────────────────────────────────────────────────

  useEffect(() => {
    if (scene !== 'reading') return;
    const id = window.setTimeout(() => dispatch({ type: 'readingDone' }), READING_MS);
    return () => window.clearTimeout(id);
  }, [scene]);

  // ── food shortlist ───────────────────────────────────────────────────────

  useEffect(() => {
    if (scene !== 'food' || session.shortlist.length > 0) return;
    const mood = session.mood ?? 'steady';
    dispatch({ type: 'shortlist', outlets: pickFood(mood, session.daypart) });
  }, [scene, session.shortlist.length, session.mood, session.daypart]);

  // ── thanks → idle ────────────────────────────────────────────────────────

  useEffect(() => {
    if (scene !== 'thanks') return;
    // Release the camera the moment the story is over, not when the next
    // person walks up.
    vision.stop();
    const id = window.setTimeout(goIdle, THANKS_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // ── background ───────────────────────────────────────────────────────────

  const revealed =
    scene === 'reading' ||
    scene === 'mood' ||
    scene === 'encouragement' ||
    scene === 'food' ||
    scene === 'thanks';
  const tint = revealed && session.mood ? MOODS[session.mood].tint : IDLE_TINT;

  const intensity =
    scene === 'reading' ? 1 : scene === 'exercises' ? 0.3 : scene === 'mood' ? 0.35 : 0;

  const camera = cameraLayout(scene);
  const activeExercise = EXERCISES[round.index];
  const channelValue = activeExercise
    ? vision.state.expressions[activeExercise.channel]
    : 0;

  return (
    <>
      <Stage>
        <Backdrop tint={tint} intensity={intensity} />
        <CameraView
          videoRef={vision.videoRef}
          diameter={camera.diameter}
          top={camera.top}
          visible={camera.visible}
        />
        {renderScene()}
        {/* Long-press the top-left corner for three seconds to get the panel
            up on a kiosk with no keyboard attached. */}
        <CornerHotspot onTrigger={() => setDebug((d) => !d)} />
      </Stage>

      {debug && (
        <DebugPanel
          scene={scene}
          session={session}
          vision={vision.state}
          exerciseId={activeExercise?.id ?? null}
          channelValue={channelValue}
          threshold={activeExercise?.threshold ?? 0}
          onJump={(next) => jumpTo(next)}
          onReset={goIdle}
          onClose={() => setDebug(false)}
        />
      )}
    </>
  );

  function renderScene() {
    switch (scene) {
      case 'idle':
        return <Idle daypart={session.daypart} seed={session.seed} />;
      case 'consent':
        return (
          <Consent
            cameraState={vision.state.cameraState}
            errorMessage={vision.state.errorMessage}
            onAccept={acceptCamera}
            onSkip={() => dispatch({ type: 'cameraRefused' })}
          />
        );
      case 'warmup':
        return <Warmup faceFound={vision.state.faceFound} seed={session.seed} />;
      case 'exercises':
        return (
          <Exercises
            index={round.index}
            value={channelValue}
            progress={activeExercise ? channelValue / activeExercise.threshold : 0}
            hit={round.hit}
            escaped={round.escaped}
            flashing={round.flashing}
            seed={session.seed}
          />
        );
      case 'reading':
        return <Reading seed={session.seed} />;
      case 'mood':
        return <MoodReveal mood={session.mood ?? 'steady'} shots={session.shots} />;
      case 'encouragement':
        return <Encouragement mood={session.mood ?? 'steady'} seed={session.seed} />;
      case 'food': {
        const outlet = session.shortlist[session.foodIndex];
        if (!outlet) return null;
        return (
          <FoodPick
            outlet={outlet}
            seed={session.seed}
            blind={session.blind}
            canSwap={session.foodIndex + 1 < session.shortlist.length}
            onSwap={() => dispatch({ type: 'anotherFood' })}
          />
        );
      }
      case 'thanks':
        return <Thanks />;
    }
  }

  /** Debug-only shortcut so a scene can be inspected without walking the story. */
  function jumpTo(next: SceneId) {
    const mood = forcedMood ?? session.mood ?? 'bright';
    dispatch({ type: 'reset' });
    window.setTimeout(() => {
      dispatch({ type: 'start' });
      dispatch({ type: 'cameraReady' });
      if (next === 'warmup') return;
      dispatch({ type: 'faceFound' });
      if (next === 'exercises') return;
      dispatch({ type: 'exercisesDone', mood, shots: [null, null, null, null] });
      if (next === 'reading') return;
      dispatch({ type: 'readingDone' });
      if (next === 'mood') return;
      dispatch({ type: 'next' });
      if (next === 'encouragement') return;
      dispatch({ type: 'next' });
      if (next === 'food') return;
      dispatch({ type: 'next' });
    }, 0);
  }
}

/** Camera size and position per scene. Transitions are animated by CameraView. */
function cameraLayout(scene: SceneId): { diameter: number; top: number; visible: boolean } {
  switch (scene) {
    case 'warmup':
      return { diameter: 640, top: 560, visible: true };
    case 'exercises':
      // Centred inside the 700px meter ring, which sits at top: 420.
      return { diameter: 560, top: 490, visible: true };
    default:
      return { diameter: 560, top: 490, visible: false };
  }
}

/** Invisible 3-second long-press target for opening the debug panel on site. */
function CornerHotspot({ onTrigger }: { onTrigger: () => void }) {
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <div
      data-stop-press
      onPointerDown={() => {
        clear();
        timer.current = window.setTimeout(onTrigger, 3000);
      }}
      onPointerUp={clear}
      onPointerLeave={clear}
      style={{ position: 'absolute', left: 0, top: 0, width: 160, height: 160, zIndex: 50 }}
    />
  );
}
