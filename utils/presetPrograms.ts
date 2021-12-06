import { vec3 } from "gl-matrix";
import { Plane, PointLight, Sphere } from "types/Primitive";

import { BLUE, GREEN, RED, WHITE, YELLOW } from "./constants";

export const BALLS_COLORFUL = [
  Sphere(vec3.fromValues(0.55, -0.7, 0.1), 0.3, RED), // right sphere on ground
  Sphere(vec3.fromValues(-0.55, -0.7, -0.2), 0.3, BLUE), // left sphere on ground
];

export const BALLS_STANDARD = [
  Sphere(vec3.fromValues(0.55, -0.7, 0.1), 0.3, WHITE), // right sphere on ground
  Sphere(vec3.fromValues(-0.55, -0.7, -0.2), 0.3, WHITE), // left sphere on ground
];

export const LIGHTS_AREA = [
  Plane(
    vec3.fromValues(0, -1, 0),
    -0.9999,
    vec3.fromValues(0, 0, 1),
    0.35,
    WHITE,
    1.5
  ), // light on ceiling
];

export const LIGHTS_THREE_POINT = [
  PointLight(vec3.fromValues(0.5, 0.5, 0.5), WHITE, 0.6), // light in corner
  PointLight(vec3.fromValues(0, 0, -0.3), WHITE, 0.3), // halo light from behind
  PointLight(vec3.fromValues(-0.5, 0, 0.5), WHITE, 0.1), // secondary light
];

export const WALLS_COLORFUL = [
  Plane(vec3.fromValues(1, 0, 0), -1, vec3.fromValues(0, 1, 0), 1.0, RED), // left wall
  Plane(vec3.fromValues(-1, 0, 0), -1, vec3.fromValues(0, 1, 0), 1.0, BLUE), // right wall
  Plane(vec3.fromValues(0, 1, 0), -1, vec3.fromValues(0, 0, 1), 1.0, WHITE), // floor
  Plane(vec3.fromValues(0, -1, 0), -1, vec3.fromValues(0, 0, 1), 1.0, WHITE), // ceiling
  Plane(vec3.fromValues(0, 0, 1), -1, vec3.fromValues(0, 1, 0), 1.0, GREEN), // back wall
  Plane(vec3.fromValues(0, 0, -1), -1, vec3.fromValues(0, 1, 0), 1.0, YELLOW), // front wall
];

export const WALLS_STANDARD = [
  Plane(vec3.fromValues(1, 0, 0), -1, vec3.fromValues(0, 1, 0), 1.0, RED), // left wall
  Plane(vec3.fromValues(-1, 0, 0), -1, vec3.fromValues(0, 1, 0), 1.0, BLUE), // right wall
  Plane(vec3.fromValues(0, 1, 0), -1, vec3.fromValues(0, 0, 1), 1.0, WHITE), // floor
  Plane(vec3.fromValues(0, -1, 0), -1, vec3.fromValues(0, 0, 1), 1.0, WHITE), // ceiling
  Plane(vec3.fromValues(0, 0, 1), -1, vec3.fromValues(0, 1, 0), 1.0, WHITE), // back wall
  Plane(vec3.fromValues(0, 0, -1), -1, vec3.fromValues(0, 1, 0), 1.0, WHITE), // front wall
];

export const CORNELL_BOX_AREA_LIGHT = [
  ...WALLS_STANDARD,
  ...BALLS_STANDARD,
  ...LIGHTS_AREA,
];

export const CORNELL_BOX_THREE_POINT_LIGHTS = [
  ...WALLS_COLORFUL,
  ...BALLS_COLORFUL,
  ...LIGHTS_THREE_POINT,
];
