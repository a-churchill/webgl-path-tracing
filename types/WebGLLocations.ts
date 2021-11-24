/** Locations of variables used in a compiled WebGL program */
export type WebGLLocations<VariableNames extends string = string> = Record<
  VariableNames,
  number
>;
