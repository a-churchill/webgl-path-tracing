import { WebGLLocations } from "./WebGLLocations";

/**
 * Information needed to use a WebGL program.
 */
export interface WebGLProgramMetadata<
  A extends WebGLLocations = WebGLLocations,
  U extends WebGLLocations = WebGLLocations
> {
  program: WebGLProgram;

  /** Locations for attributes (variables that will change for each vertex) */
  attribLocations: A;

  /** Locations for uniforms (variables that will not change between vertices) */
  uniformLocations: U;
}
