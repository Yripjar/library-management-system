// Vertex shader
attribute float aSize;
uniform float uTime;
varying float vAlpha;

void main() {
  vec3 pos = position;
  pos.y += sin(uTime * 0.5 + position.x * 0.5) * 0.1;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (10.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  vAlpha = 0.6 + 0.4 * sin(uTime + position.x);
}