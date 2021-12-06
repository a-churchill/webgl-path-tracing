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

  textures: WebGLTexture[];
}

export const PROGRAM_ATTRIBUTES = ["vertexPosition"] as const;

/** Attributes used in our WebGL program */
export type Attributes = WebGLLocations<typeof PROGRAM_ATTRIBUTES[number]>;

type CameraUniformNames = `camera.${"center" | "direction" | "fov" | "up"}`;
type PointLightUniformNames = `pointLights[${number}].${
  | "brightness"
  | "color"
  | "origin"}`;
type PlaneUniformNames = `planes[${number}].${
  | "color"
  | "d"
  | "emittance"
  | "materialType"
  | "normal"
  | "sideLength"
  | "up"}`;
type SphereUniformNames = `spheres[${number}].${
  | "center"
  | "color"
  | "emittance"
  | "materialType"
  | "radius"}`;

type OtherUniformNames =
  | "prevFrame"
  | "randomNoise"
  | "renderCount"
  | "seed"
  | "seed2";

/** Uniforms we need to define to give plane locations */
export const PROGRAM_UNIFORMS: (
  | CameraUniformNames
  | OtherUniformNames
  | PlaneUniformNames
  | PointLightUniformNames
  | SphereUniformNames
)[] = [
  "prevFrame",
  "randomNoise",
  "renderCount",
  "seed",
  "seed2",

  "camera.center",
  "camera.direction",
  "camera.fov",
  "camera.up",

  "pointLights[0].origin",
  "pointLights[0].color",
  "pointLights[0].brightness",
  "pointLights[1].origin",
  "pointLights[1].color",
  "pointLights[1].brightness",
  "pointLights[2].origin",
  "pointLights[2].color",
  "pointLights[2].brightness",
  "pointLights[3].origin",
  "pointLights[3].color",
  "pointLights[3].brightness",
  "pointLights[4].origin",
  "pointLights[4].color",
  "pointLights[4].brightness",

  "planes[0].normal",
  "planes[0].d",
  "planes[0].color",
  "planes[0].emittance",
  "planes[0].sideLength",
  "planes[0].up",
  "planes[0].materialType",
  "planes[1].normal",
  "planes[1].d",
  "planes[1].color",
  "planes[1].emittance",
  "planes[1].sideLength",
  "planes[1].up",
  "planes[1].materialType",
  "planes[2].normal",
  "planes[2].d",
  "planes[2].color",
  "planes[2].emittance",
  "planes[2].sideLength",
  "planes[2].up",
  "planes[2].materialType",
  "planes[3].normal",
  "planes[3].d",
  "planes[3].color",
  "planes[3].emittance",
  "planes[3].sideLength",
  "planes[3].up",
  "planes[3].materialType",
  "planes[4].normal",
  "planes[4].d",
  "planes[4].color",
  "planes[4].emittance",
  "planes[4].sideLength",
  "planes[4].up",
  "planes[4].materialType",
  "planes[5].normal",
  "planes[5].d",
  "planes[5].color",
  "planes[5].emittance",
  "planes[5].sideLength",
  "planes[5].up",
  "planes[5].materialType",
  "planes[6].normal",
  "planes[6].d",
  "planes[6].color",
  "planes[6].emittance",
  "planes[6].sideLength",
  "planes[6].up",
  "planes[6].materialType",
  "planes[7].normal",
  "planes[7].d",
  "planes[7].color",
  "planes[7].emittance",
  "planes[7].sideLength",
  "planes[7].up",
  "planes[7].materialType",
  "planes[8].normal",
  "planes[8].d",
  "planes[8].color",
  "planes[8].emittance",
  "planes[8].sideLength",
  "planes[8].up",
  "planes[8].materialType",
  "planes[9].normal",
  "planes[9].d",
  "planes[9].color",
  "planes[9].emittance",
  "planes[9].sideLength",
  "planes[9].up",
  "planes[9].materialType",

  "spheres[0].center",
  "spheres[0].radius",
  "spheres[0].color",
  "spheres[0].emittance",
  "spheres[0].materialType",
  "spheres[1].center",
  "spheres[1].radius",
  "spheres[1].color",
  "spheres[1].emittance",
  "spheres[1].materialType",
  "spheres[2].center",
  "spheres[2].radius",
  "spheres[2].color",
  "spheres[2].emittance",
  "spheres[2].materialType",
  "spheres[3].center",
  "spheres[3].radius",
  "spheres[3].color",
  "spheres[3].emittance",
  "spheres[3].materialType",
  "spheres[4].center",
  "spheres[4].radius",
  "spheres[4].color",
  "spheres[4].emittance",
  "spheres[4].materialType",
];

/** Uniforms used in our WebGL program */
export type Uniforms = WebGLLocations<typeof PROGRAM_UNIFORMS[number]>;

export type Program = GenericProgram<Attributes, Uniforms>;
