import { vec3 } from "gl-matrix";

export const CAMERA_FOV = Math.PI / 4;
export const CAMERA_DISTANCE = 1 + 1 / Math.tan(CAMERA_FOV / 2);
export const CANVAS_ID = "webgl-canvas";
export const MAX_LIGHTS = 5;
export const MAX_PLANES = 6;
export const MAX_SPHERES = 5;

// colors
export const RED = vec3.fromValues(1.0, 0.5, 0.5);
export const GREEN = vec3.fromValues(0.5, 1.0, 0.5);
export const BLUE = vec3.fromValues(0.5, 0.5, 1.0);
export const WHITE = vec3.fromValues(0.95, 0.95, 0.95);
