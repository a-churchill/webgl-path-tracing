import { vec3 } from "gl-matrix";

export enum PrimitiveType {
  Light = "light",
  Plane = "plane",
  Sphere = "sphere",
}

export interface Light {
  type: PrimitiveType.Light;
  origin: vec3;
  color: vec3;
}

export function Light(origin: vec3, color: vec3): Light {
  return {
    type: PrimitiveType.Light,
    origin,
    color,
  };
}

export interface Plane {
  type: PrimitiveType.Plane;
  normal: vec3;
  /** dot(v, normal) = d for any vector v in the plane. */
  d: number;
  color: vec3;
}

/** Factory function to create a plane primitive. */
export function Plane(normal: vec3, d: number, color: vec3): Plane {
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
  color: vec3;
}

/** Factory function to create a sphere primitive. */
export function Sphere(center: vec3, radius: number, color: vec3): Sphere {
  return {
    type: PrimitiveType.Sphere,
    center,
    radius,
    color,
  };
}

export type Primitive = Light | Plane | Sphere;
