import { vec3, vec4 } from "gl-matrix";

export enum PrimitiveType {
  Plane = "plane",
  Sphere = "sphere",
}

export interface Plane {
  type: PrimitiveType.Plane;
  normal: vec3;
  /** dot(v, normal) = d for any vector v in the plane. */
  d: number;
  color: vec4;
}

/** Factory function to create a plane primitive. */
export function Plane(normal: vec3, d: number, color: vec4): Plane {
  return {
    type: PrimitiveType.Plane,
    normal,
    d,
    color,
  };
}

export interface Sphere {
  type: PrimitiveType.Sphere;
  center: vec3;
  radius: number;
  color: vec4;
}

/** Factory function to create a sphere primitive. */
export function Sphere(center: vec3, radius: number, color: vec4): Sphere {
  return {
    type: PrimitiveType.Sphere,
    center,
    radius,
    color,
  };
}

export type Primitive = Plane | Sphere;
