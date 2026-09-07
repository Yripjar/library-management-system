// Vertex shader
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 3.0 + uTime) * 0.05;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}   