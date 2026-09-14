import { useEffect, useRef, useState } from 'react';
import vertSrc from './lava.vert.glsl?raw';
import fragSrc from './lava.frag.glsl?raw';
import { type LavaPalette, type Rgb, type RgbPalette, toRgbPalette } from './palette';

const UNIFORMS = ['uRes', 'uTime', 'uColA', 'uColB', 'uColC', 'uBgA', 'uBgB', 'uIntensity'] as const;
type UniformName = (typeof UNIFORMS)[number];

/** How fast the field morphs into a new mood palette. Higher = snappier. */
const PALETTE_LERP = 1.6;
/** A 4K kiosk panel does not need 4K worth of blob shading. */
const MAX_DPR = 1.5;

/**
 * The lamp is rendered below screen resolution and scaled up.
 *
 * Every blob here is soft-edged and out of focus by design, so shading at full
 * 1080x1920 buys literally nothing you can see — while costing over three
 * times the fill rate. That matters because this is a fragment-bound effect
 * and we do not know what GPU the kiosk PC actually has.
 */
const BASE_RENDER_SCALE = 0.55;
const MIN_RENDER_SCALE = 0.3;
/** Frames slower than this mean the GPU is struggling and we should back off. */
const SLOW_FRAME_MS = 33;
/** Frames to watch before judging. */
const SAMPLE_FRAMES = 45;

/**
 * Full-bleed animated background. Sits behind the Stage at viewport size, so a
 * screen that isn't 9:16 reads as intentional rather than letterboxed.
 *
 * Falls back to a CSS blob field if WebGL2 is unavailable — an unbranded black
 * screen would be a worse demo than a slightly cheaper animation.
 */
export function LavaLamp({
  palette,
  intensity = 0,
}: {
  palette: LavaPalette;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // State, not a ref: the fallback has to trigger a re-render, or a machine
  // without WebGL2 would sit on a black screen forever.
  const [fallback, setFallback] = useState(false);

  // Read by the render loop without restarting it, so a palette change
  // animates instead of snapping.
  const target = useRef<RgbPalette>(toRgbPalette(palette));
  target.current = toRgbPalette(palette);
  const targetIntensity = useRef(intensity);
  targetIntensity.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      setFallback(true);
      return;
    }

    const program = buildProgram(gl, vertSrc, fragSrc);
    if (!program) {
      setFallback(true);
      return;
    }

    const loc = {} as Record<UniformName, WebGLUniformLocation | null>;
    for (const name of UNIFORMS) loc[name] = gl.getUniformLocation(program, name);

    // WebGL2 requires a bound VAO even when the vertex shader reads no
    // attributes, which this one does not — it builds the triangle from
    // gl_VertexID.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.useProgram(program);

    const current: RgbPalette = {
      a: [...target.current.a] as Rgb,
      b: [...target.current.b] as Rgb,
      c: [...target.current.c] as Rgb,
      bgA: [...target.current.bgA] as Rgb,
      bgB: [...target.current.bgB] as Rgb,
    };
    let currentIntensity = targetIntensity.current;

    let renderScale = BASE_RENDER_SCALE;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(window.innerWidth * dpr * renderScale));
      const h = Math.max(1, Math.round(window.innerHeight * dpr * renderScale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = performance.now();
    const start = last;

    // Adaptive quality. If the first second of frames is slow, drop the render
    // resolution rather than letting a weak GPU turn the whole kiosk into a
    // slideshow — a soft background is worth far less than a responsive one,
    // and a starved main thread delays every timer in the story.
    const frameTimes: number[] = [];
    let downgrades = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (downgrades < 2) {
        frameTimes.push(dt * 1000);
        if (frameTimes.length >= SAMPLE_FRAMES) {
          const sorted = [...frameTimes].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
          frameTimes.length = 0;
          if (median > SLOW_FRAME_MS && renderScale > MIN_RENDER_SCALE) {
            renderScale = Math.max(MIN_RENDER_SCALE, renderScale * 0.7);
            downgrades += 1;
            console.info(`[lava] ${median.toFixed(0)}ms frames — dropping render scale to ${renderScale.toFixed(2)}`);
          } else {
            downgrades = 2; // fast enough; stop sampling
          }
        }
      }

      resize();

      const k = 1 - Math.exp(-PALETTE_LERP * dt);
      for (const key of ['a', 'b', 'c', 'bgA', 'bgB'] as const) {
        const cur = current[key];
        const tgt = target.current[key];
        cur[0] += (tgt[0] - cur[0]) * k;
        cur[1] += (tgt[1] - cur[1]) * k;
        cur[2] += (tgt[2] - cur[2]) * k;
      }
      currentIntensity += (targetIntensity.current - currentIntensity) * k;

      gl.uniform2f(loc.uRes, canvas.width, canvas.height);
      gl.uniform1f(loc.uTime, (now - start) / 1000);
      gl.uniform1f(loc.uIntensity, currentIntensity);
      gl.uniform3fv(loc.uColA, current.a);
      gl.uniform3fv(loc.uColB, current.b);
      gl.uniform3fv(loc.uColC, current.c);
      gl.uniform3fv(loc.uBgA, current.bgA);
      gl.uniform3fv(loc.uBgB, current.bgB);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          display: fallback ? 'none' : 'block',
        }}
      />
      {fallback && <CssFallback palette={palette} />}
    </>
  );
}

function CssFallback({ palette }: { palette: LavaPalette }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        background: `radial-gradient(60% 40% at 30% 20%, ${palette.b}, transparent 70%),
                     radial-gradient(50% 35% at 70% 65%, ${palette.a}, transparent 70%),
                     radial-gradient(40% 30% at 45% 90%, ${palette.c}, transparent 70%),
                     linear-gradient(${palette.bgB}, ${palette.bgA})`,
        filter: 'blur(60px)',
      }}
    />
  );
}

function buildProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src.trim());
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[lava] shader failed to compile:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, vs);
  const fragment = compile(gl.FRAGMENT_SHADER, fs);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[lava] program failed to link:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}
