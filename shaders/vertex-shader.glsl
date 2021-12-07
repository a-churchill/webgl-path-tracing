#version 300 es

precision mediump float;

in vec4 vertexPosition;

out vec2 position;

void main() {
  position = vertexPosition.xy;
  gl_Position = vertexPosition;
}