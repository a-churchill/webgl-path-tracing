import { vec3 } from "gl-matrix";

export interface Camera {
  /** Camera location */
  center: vec3;
  /** Direction camera is pointed in - objects in this direction will be on camera */
  direction: vec3;
  /** Field of view, in radians */
  fov: number;
  /**
   * Used to orient camera - this is the up direction (positive y direction in local frame)
   */
  up: vec3;
}

/** Factory function to create a camera */
export function Camera(
  center: vec3,
  direction: vec3,
  fov: number,
  up: vec3
): Camera {
  return {
    center,
    direction: vec3.normalize(vec3.create(), direction),
    fov,
    up: vec3.normalize(vec3.create(), up),
  };
}
