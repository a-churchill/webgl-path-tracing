import { vec3 } from "gl-matrix";
import { Camera } from "types/Camera";
import { Program } from "types/Program";

import { CAMERA_DISTANCE, CAMERA_FOV } from "./constants";
import { CORNELL_BOX_AREA_LIGHT } from "./presetPrograms";

export const DEFAULT_PRIMITIVES = CORNELL_BOX_AREA_LIGHT;
export const DEFAULT_CAMERA = Camera(
  vec3.fromValues(0, 0, CAMERA_DISTANCE),
  vec3.fromValues(0, 0, -1),
  CAMERA_FOV,
  vec3.fromValues(0, 1, 0)
);
export const DEFAULT_OPTIONS: Program["options"] = {
  directIllumination: true,
  globalIllumination: true,
};

export const DEFAULT_PROGRAM: Pick<
  Program,
  "camera" | "options" | "primitives"
> = {
  camera: DEFAULT_CAMERA,
  options: DEFAULT_OPTIONS,
  primitives: DEFAULT_PRIMITIVES,
};
