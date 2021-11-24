precision mediump float;

// CONSTANTS
const int MAX_PLANES = 5;
const int MAX_SPHERES = 5;
const float MIN_TIME = 0.1;
const float MAX_TIME = 10000.0;

// TYPES
struct Camera {
  vec3 center;
  vec3 direction;
  vec3 up;
  float fov;
};

struct HitRecord {
  float time;
  vec3 normal;
  vec4 color;
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Plane {
  vec3 normal;
  float d;
  vec4 color;
};

struct Sphere {
  vec3 center;
  float radius;
  vec4 color;
};

// INPUTS

uniform Camera camera;
uniform Plane planes[MAX_PLANES];
uniform Sphere spheres[MAX_SPHERES];

// this is the xy position of the current point, in clip space coordinates.
varying vec2 position;

// HELPER FUNCTIONS

// Generates a ray from the camera to the given position in clip space ([-1, 1] x 
// [-1, 1]).
Ray generateRay(vec2 position) {
  // distance to view plane, based on field of view
  float d = 1.0 / tan(camera.fov / 2.0);
  vec3 horizontal = normalize(cross(camera.direction, camera.up));
  vec3 new_dir = normalize((d * camera.direction) + (position.x * horizontal) + (position.y * camera.up));
  return Ray(camera.center, new_dir);
}

HitRecord intersectRayWithPrimitive(Ray ray, Plane plane, HitRecord hit) {
  float time = (plane.d - dot(plane.normal, ray.origin)) / dot(plane.normal, ray.direction);
  if(MIN_TIME < time && time < hit.time) {
    hit.time = time;
    hit.normal = plane.normal;
    hit.color = plane.color;
  }
  return hit;
}

HitRecord intersectRayWithPrimitive(Ray ray, Sphere sphere, HitRecord hit) {
  // put sphere at center
  ray.origin = ray.origin - sphere.center;

  float a = dot(ray.direction, ray.direction);
  float b = 2.0 * dot(ray.direction, ray.origin);
  float c = dot(ray.origin, ray.origin) - (sphere.radius * sphere.radius);

  float d = (b * b) - (4.0 * a * c);
  if(d < 0.0) {
    return hit;
  }

  d = sqrt(d);
  float t_plus = (-b + d) / (2.0 * a);
  float t_minus = (-b - d) / (2.0 * a);
  if(t_minus < MIN_TIME && t_plus < MIN_TIME) {
    return hit;
  }
  float t = t_minus < MIN_TIME ? t_plus : t_minus;

  // remove sphere from center
  ray.origin = ray.origin + sphere.center;
  if(t < hit.time) {
    hit.time = t;
    hit.normal = normalize(ray.origin + (t * ray.direction));
    hit.color = sphere.color;
  }
  return hit;
}

// Checks the ray's intersection with all primitives
HitRecord intersectRay(Ray ray) {
  HitRecord hit;
  hit.time = MAX_TIME;
  hit.color = vec4(0.0, 0.0, 0.0, 1.0);

  for(int i = 0; i < MAX_PLANES; i++) {
    hit = intersectRayWithPrimitive(ray, planes[i], hit);
  }

  for(int i = 0; i < MAX_SPHERES; i++) {
    hit = intersectRayWithPrimitive(ray, spheres[i], hit);
  }

  return hit;
}

// MAIN FUNCTION

void main() {
  Ray ray = generateRay(position);
  HitRecord hit = intersectRay(ray);

  if(hit.time < MAX_TIME) {
    gl_FragColor = hit.color;
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}