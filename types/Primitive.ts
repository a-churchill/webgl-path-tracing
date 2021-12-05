import { vec3 } from "gl-matrix";

export enum PrimitiveType {
  PointLight = "point_light",
  Plane = "plane",
  Sphere = "sphere",
}

export interface PointLight {
  type: PrimitiveType.PointLight;
  origin: vec3;
  color: vec3;
  /** Brightness, a float between 0 and 1 */
  brightness: number;
}

export function PointLight(
  origin: vec3,
  color: vec3,
  brightness: number
): PointLight {
  return {
    type: PrimitiveType.PointLight,
    origin,
    color,
    brightness,
  };
}

export interface Plane {
  type: PrimitiveType.Plane;
  normal: vec3;
  /** dot(v, normal) = d for any vector v in the plane. */
  d: number;
  /** Vector in the plane, pointing in up direction */
  up: vec3;
  sideLength: number;
  color: vec3;
  emittance: number;
}

/** Factory function to create a plane primitive. */
export function Plane(
  normal: vec3,
  d: number,
  up: vec3,
  sideLength: number,
  color: vec3,
  emittance = 0
): Plane {
  return {
    type: PrimitiveType.Plane,
    normal: vec3.normalize(vec3.create(), normal),
    d,
    up,
    sideLength,
    color,
    emittance,
  };
}

export interface Sphere {
  type: PrimitiveType.Sphere;
  center: vec3;
  radius: number;
  color: vec3;
  emittance: number;
}

/** Factory function to create a sphere primitive. */
export function Sphere(
  center: vec3,
  radius: number,
  color: vec3,
  emittance = 0
): Sphere {
  return {
    type: PrimitiveType.Sphere,
    center,
    radius,
    color,
    emittance,
  };
}

export type Primitive = Plane | PointLight | Sphere;
