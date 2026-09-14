#version 300 es
precision highp float;

/*
 * Lava lamp.
 *
 * Seven blobs on a metaball field, drifting on slow convection currents. The
 * colours are uniforms rather than constants because the whole field morphs
 * into the visitor's mood palette during the `reading` beat — that colour
 * change IS the reveal, so it has to be driven from JS.
 */

uniform vec2  uRes;
uniform float uTime;
uniform vec3  uColA;      // blob colour, low end of the vertical gradient
uniform vec3  uColB;      // blob colour, high end
uniform vec3  uColC;      // hot core colour, shows where blobs overlap
uniform vec3  uBgA;       // ground, bottom
uniform vec3  uBgB;       // ground, top
uniform float uIntensity; // 0 = calm idle, 1 = "reading you" — faster and hotter

out vec4 fragColor;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
  // Aspect-correct, centred. On a 9:16 screen uv.y runs to about +/- 0.89.
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  float speedUp = 1.0 + uIntensity * 1.6;
  float t = uTime * speedUp;

  float field = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float seedA = hash(fi + 1.0);
    float seedB = hash(fi + 17.0);
    float seedC = hash(fi + 43.0);

    float speed = 0.075 + 0.065 * seedA;
    float phase = fi * 2.399 + seedB * 6.283;

    // Rise and fall, with a slower lateral sway so blobs never march in step.
    float y = sin(t * speed + phase) * (0.60 + 0.34 * seedB);
    float x = sin(t * speed * 0.63 + phase * 1.7) * (0.30 + 0.26 * seedC);

    float r = 0.115 + 0.085 * seedC;
    vec2 c = vec2(x, y);
    vec2 d = uv - c;
    field += (r * r) / (dot(d, d) + 0.0007);
  }

  // Where the field crosses 1.0 is the blob surface; below that is the halo.
  float surface = smoothstep(0.92, 1.42, field);
  float halo = smoothstep(0.16, 1.05, field);
  float core = smoothstep(2.4, 7.0, field);

  float vertical = clamp(uv.y * 0.62 + 0.5 + 0.16 * sin(uTime * 0.11), 0.0, 1.0);
  vec3 blob = mix(uColA, uColB, vertical);
  blob = mix(blob, uColC, core * 0.55);

  vec3 bg = mix(uBgA, uBgB, clamp(uv.y * 0.7 + 0.5, 0.0, 1.0));

  vec3 col = bg + blob * halo * (0.20 + 0.30 * uIntensity);
  col = mix(col, blob, surface);

  // Vignette — pulls the eye to the centre of a tall screen.
  float vig = 1.0 - 0.32 * dot(uv, uv);
  col *= vig;

  // Grain. Gradients this wide band badly on a big panel without it.
  float g = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 91.7, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.022;

  fragColor = vec4(col, 1.0);
}
