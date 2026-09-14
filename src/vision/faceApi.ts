import type { Expressions } from '../mood/classify';

type FaceApi = typeof import('@vladmandic/face-api');

let cached: Promise<FaceApi> | null = null;

/**
 * face-api re-exports the TensorFlow runtime as `.tf`, but its bundled types
 * only re-export tensor *types* — not the runtime backend functions, which do
 * exist. This names the two we actually call.
 */
type TfRuntime = {
  setBackend(name: string): Promise<boolean>;
  ready(): Promise<void>;
};

/**
 * Loads face-api and its weights once, lazily.
 *
 * The weights are served from this app's own /models directory (copied out of
 * node_modules at install time by scripts/copy-models.mjs) rather than from a
 * CDN. That is the whole reason the kiosk survives a dead wifi connection.
 *
 * The import is dynamic so the idle screen paints immediately instead of
 * waiting on a couple of megabytes of TensorFlow.
 */
export function loadFaceApi(): Promise<FaceApi> {
  cached ??= (async () => {
    const faceapi = await import('@vladmandic/face-api');

    const tf = faceapi.tf as unknown as TfRuntime;
    await tf.setBackend('webgl');
    await tf.ready();

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
    ]);

    // Run one throwaway inference while the visitor is still reading the
    // consent screen. Without it the first real frame stalls for a beat —
    // right at the "ah, there you are" moment, which is the worst possible
    // place in the story to drop frames.
    await warmUp(faceapi);

    return faceapi;
  })();
  return cached;
}

export type FaceBox = { x: number; y: number; width: number; height: number };

export type Detection = {
  expressions: Expressions;
  /** Face box normalised 0..1 against the video frame. */
  box: FaceBox;
};

/**
 * inputSize 320 is the sweet spot here: 224 starts losing faces at kiosk
 * distance (roughly an arm's length), 416 costs frames for no gain.
 */
export async function detect(
  faceapi: FaceApi,
  video: HTMLVideoElement,
): Promise<Detection | null> {
  if (video.readyState < 2 || video.videoWidth === 0) return null;

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
  const result = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks(true)
    .withFaceExpressions();

  if (!result) return null;

  const { box } = result.detection;
  const e = result.expressions;
  return {
    expressions: {
      neutral: e.neutral,
      happy: e.happy,
      sad: e.sad,
      angry: e.angry,
      fearful: e.fearful,
      disgusted: e.disgusted,
      surprised: e.surprised,
    },
    box: {
      x: box.x / video.videoWidth,
      y: box.y / video.videoHeight,
      width: box.width / video.videoWidth,
      height: box.height / video.videoHeight,
    },
  };
}

/** Compiles the shaders and allocates the tensors ahead of the first face. */
async function warmUp(faceapi: FaceApi) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 320, 320);
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });
    await faceapi.detectSingleFace(canvas, options).withFaceLandmarks(true).withFaceExpressions();
  } catch {
    /* warm-up is an optimisation, never a reason to fail the session */
  }
}
