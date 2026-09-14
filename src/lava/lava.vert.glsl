#version 300 es
// Full-screen triangle. No attributes — the vertex is derived from gl_VertexID,
// which keeps the whole background to one draw call with zero buffers.
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
