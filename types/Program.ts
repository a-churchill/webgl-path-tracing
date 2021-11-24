import { Camera } from "./Camera";
import { Primitive } from "./Primitive";
import { WebGLLocations } from "./WebGLLocations";
import { WebGLProgramMetadata } from "./WebGLProgramMetadata";

/**
 * `Program` is the JS-side representation of our program, holding context about scene
 * (e.g. primitives and camera) and WebGL program.
 */
interface GenericProgram<
  Attributes extends WebGLLocations,
  Uniforms extends WebGLLocations
> {
  /** Camera for the scene */
  camera: Camera;

  gl: WebGLRenderingContext;

  /** Primitives in the scene. */
  primitives: Primitive[];

  /** Metadata about the shader program, used to set up uniform and attribute values. */
  shaderProgram: WebGLProgramMetadata<Attributes, Uniforms>;
}

export const PROGRAM_ATTRIBUTES = ["vertexPosition"] as const;

/** Attributes used in our WebGL program */
export type Attributes = WebGLLocations<typeof PROGRAM_ATTRIBUTES[number]>;

type CameraUniformNames = `camera.${"center" | "direction" | "up" | "fov"}`;
type PlaneUniformNames = `planes[${number}].${"normal" | "d" | "color"}`;
type SphereUniformNames = `spheres[${number}].${"center" | "radius" | "color"}`;

/** Uniforms we need to define to give plane locations */
export const PROGRAM_UNIFORMS: (
  | CameraUniformNames
  | PlaneUniformNames
  | SphereUniformNames
)[] = [
  "camera.center",
  "camera.direction",
  "camera.fov",
  "camera.up",

  "planes[0].normal",
  "planes[0].d",
  "planes[0].color",
  "planes[1].normal",
  "planes[1].d",
  "planes[1].color",
  "planes[2].normal",
  "planes[2].d",
  "planes[2].color",
  "planes[3].normal",
  "planes[3].d",
  "planes[3].color",
  "planes[4].normal",
  "planes[4].d",
  "planes[4].color",

  "spheres[0].center",
  "spheres[0].radius",
  "spheres[0].color",
  "spheres[1].center",
  "spheres[1].radius",
  "spheres[1].color",
  "spheres[2].center",
  "spheres[2].radius",
  "spheres[2].color",
  "spheres[3].center",
  "spheres[3].radius",
  "spheres[3].color",
  "spheres[4].center",
  "spheres[4].radius",
  "spheres[4].color",
];

/** Uniforms used in our WebGL program */
export type Uniforms = WebGLLocations<typeof PROGRAM_UNIFORMS[number]>;

export type Program = GenericProgram<Attributes, Uniforms>;
