/** Locations of variables used in a compiled WebGL program */
export type WebGLLocations = {
  /** Location, as returned by `gl.getAttribLocation` or `gl.getUniformLocation` */
  [variableName: string]: number;
};
