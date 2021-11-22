import { WebGLLocations } from "./WebGLLocations";

/**
 * Information needed to use a WebGL program.
 */
export interface ProgramInfo<
  A extends WebGLLocations = WebGLLocations,
  U extends WebGLLocations = WebGLLocations
> {
  program: WebGLProgram;
  /** Locations for attributes (variables that will change between iterations) */
  attribLocations: A;
  /** Locations for uniforms (variables that will not change between iterations) */
  uniformLocations: U;
}
