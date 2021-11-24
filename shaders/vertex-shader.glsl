precision mediump float;

attribute vec4 vertexPosition;

varying vec2 position;

void main() {
  position = vertexPosition.xy;
  gl_Position = vertexPosition;
}