import { mat4, vec3 } from "gl-matrix";
import { CAMERA_DISTANCE, CAMERA_FOV } from "utils/constants";

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

export const DEFAULT_CAMERA = Camera(
  vec3.fromValues(0, 0, CAMERA_DISTANCE),
  vec3.fromValues(0, 0, -1),
  CAMERA_FOV,
  vec3.fromValues(0, 1, 0)
);

/**
 * Applies transformation to camera and returns a new camera. Does not mutate the passed
 * camera.
 */
export function applyTransformationToCamera(
  camera: Camera,
  transformation: mat4
): Camera {
  const center = vec3.transformMat4(
    vec3.create(),
    camera.center,
    transformation
  );
  const direction = vec3.transformMat4(
    vec3.create(),
    camera.direction,
    transformation
  );
  const up = vec3.transformMat4(vec3.create(), camera.up, transformation);

  return Camera(center, direction, camera.fov, up);
}
