precision mediump float;

// CONSTANTS
const int MAX_LIGHTS = 5;
const int MAX_PLANES = 6;
const int MAX_SPHERES = 5;

const int MAX_BOUNCES = 5;

const float MIN_TIME = 0.1;
const float MAX_TIME = 10000.0;

const float PLANE_SIZE = 1.0;
const float ATTENUATION = 1.0;
const float REFLECTANCE = 0.2;

const float PI = 3.14159;

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
  vec3 color;
};

// used to cache a repeated computation
struct Illumination {
  vec3 dirToLight;
  float distToLight;
};

struct Light {
  vec3 origin;
  vec3 color;
};

// represents a stop along the path we are tracing
struct PathBounce {
  vec3 normal;
  vec3 outgoingRay;
};

struct Plane {
  vec3 normal;
  float d;
  vec3 color;
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Sphere {
  vec3 center;
  float radius;
  vec3 color;
};

// INPUTS

uniform Camera camera;
uniform Light lights[MAX_LIGHTS];
uniform Plane planes[MAX_PLANES];
uniform Sphere spheres[MAX_SPHERES];
uniform float seed;

// this is the previous frame (in particular, the average of the previous `renderCount`
// frames)
uniform sampler2D prevFrame;
// we average the current frame with the previous `renderCount` frames
uniform int renderCount;
// this is random noise, provided from a PNG
uniform sampler2D randomNoise;

// this is the xy position of the current point, in clip space coordinates.
varying vec2 position;

// HELPER FUNCTIONS

// gets a random normalized vector from an input vector.
// credit to https://www.shadertoy.com/view/4djSRW
vec3 rand(vec3 inVec) {
  vec3 pos3 = fract(vec3(inVec.xyx) * vec3(.1031, .1030, .0973) * seed * 1500.0);
  pos3 += dot(pos3, pos3.yzx + 33.33);
  vec2 pos = fract((pos3.xx + pos3.yz) * pos3.zy);

  return texture2D(randomNoise, pos).xyz;
}

// Gets the position of the given ray at the given time, in world space
vec3 rayAtTime(Ray ray, float time) {
  return ray.origin + (time * ray.direction);
}

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
  if(dot(plane.normal, ray.direction) > 0.0) {
    // ignore plane if we're on the wrong side of it
    return hit;
  }
  float time = (plane.d - dot(plane.normal, ray.origin)) / dot(plane.normal, ray.direction);
  if(MIN_TIME < time && time < hit.time) {
    vec3 pointOnPlane = rayAtTime(ray, time);
    vec3 centerOfPlane = plane.normal * (plane.d / abs(plane.d)) * sqrt(abs(plane.d));
    vec3 difference = pointOnPlane - centerOfPlane;
    if(abs(difference.x) > PLANE_SIZE || abs(difference.y) > PLANE_SIZE || abs(difference.z) > PLANE_SIZE) {
      return hit;
    }

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
  // ray.origin = ray.origin + sphere.center;
  if(t < hit.time) {
    hit.time = t;
    hit.normal = normalize(rayAtTime(ray, t));
    hit.color = sphere.color;
  }
  return hit;
}

// Checks the ray's intersection with all primitives
HitRecord intersectRay(Ray ray) {
  HitRecord hit;
  hit.time = MAX_TIME;
  hit.color = vec3(0.0, 0.0, 0.0);

  for(int i = 0; i < MAX_PLANES; i++) {
    hit = intersectRayWithPrimitive(ray, planes[i], hit);
  }

  for(int i = 0; i < MAX_SPHERES; i++) {
    hit = intersectRayWithPrimitive(ray, spheres[i], hit);
  }

  return hit;
}

// Checks if the current position is shadowed from the given light by another primitive
// in the scene.
bool isPositionInShadow(vec3 hitPos, Illumination illumination) {
  Ray rayToLight = Ray(hitPos + 0.001 * illumination.dirToLight, illumination.dirToLight);

  HitRecord shadowHit = intersectRay(rayToLight);
  if(shadowHit.time >= MAX_TIME) {
    return false;
  }

  float distToClosestPrimitive = distance(rayAtTime(rayToLight, shadowHit.time), hitPos);
  return distToClosestPrimitive < illumination.distToLight;
}

// Gets the color contribution from the given light. Does not compute shadows.
vec3 getColorFromLight(Light light, Illumination illumination, vec3 normal, vec3 color) {
  vec3 intensity = (light.color /
    (ATTENUATION * illumination.distToLight * illumination.distToLight));
  return max(dot(illumination.dirToLight, normal), 0.0) * intensity * color;
}

// Gets the contribution to the current pixel's color from direct light rays. Assumes
// the `HitRecord` passed is valid.
vec3 getColorFromLights(Ray ray, HitRecord hit) {
  vec3 result = vec3(0.0);
  vec3 hitPos = rayAtTime(ray, hit.time);
  for(int i = 0; i < MAX_LIGHTS; i++) {
    vec3 dirToLight = normalize(lights[i].origin - hitPos);
    float distToLight = distance(lights[i].origin, hitPos);

    Illumination illumination = Illumination(dirToLight, distToLight);

    if(isPositionInShadow(hitPos, illumination)) {
      continue;
    }

    result = result + getColorFromLight(lights[i], illumination, hit.normal, hit.color);
  }
  return result;
}

// Gets the contribution to the current pixel's color from global illumination, computed
// using a bounce. Computes illumination baseed on the incoming light, computed
// recursively `MAX_BOUNCES` times.
vec3 getColorFromGlobalIllumination(Ray ray, HitRecord hit) {
  PathBounce bounces[MAX_BOUNCES];

  // contributions from lights (not global illumination)
  vec3 lightColors[MAX_BOUNCES];

  // store number of valid bounces - we want to ignore bounces after the ray doesn't
  // hit any primitives
  int validBounces = 0;

  for(int i = 0; i < MAX_BOUNCES; i++) {
    vec3 hitPos = rayAtTime(ray, hit.time);
    vec3 normal = hit.normal;
    vec3 randomDirection = rand(hitPos);

    // constrain random vector to hemisphere of normal
    if(dot(hit.normal, randomDirection) < 0.0) {
      randomDirection = -randomDirection;
    }
    bounces[i] = PathBounce(normal, randomDirection);

    // offset a bit in direction of ray, to avoid self hits
    ray = Ray(hitPos + 0.001 * randomDirection, randomDirection);
    hit = intersectRay(ray);
    if(hit.time >= MAX_TIME) {
      // nothing else to bounce off of
      break;
    }
    lightColors[i] = getColorFromLights(ray, hit);
    validBounces++;
  }

  // bookkeeping for recursive color calculations
  vec3 colors[MAX_BOUNCES];

  // work backwards to compute color - we need to do this backwards because bounce i
  // relies on bounce i+1
  for(int i = MAX_BOUNCES - 1; i >= 0; i--) {
    if(i >= validBounces) {
      continue;
    }
    vec3 hitNormal = bounces[i].normal;
    vec3 outgoingRay = bounces[i].outgoingRay;
    vec3 incomingLight = lightColors[i];

    // protect from array out-of-bounds errors
    if(i < MAX_BOUNCES - 1) {
      incomingLight += colors[i + 1];
    }

    // apply rendering equation (2pi factor is to account for the fact we're only
    // sampling one point in an entire hemisphere)
    float brdf = (REFLECTANCE / PI);
    colors[i] = incomingLight * brdf * dot(outgoingRay, hitNormal) * 2.0 * PI;
  }

  return colors[0];
}

// Returns the color of the pixel based on all lights, as well as global illumination.
vec3 tracePath(Ray ray) {
  HitRecord hit = intersectRay(ray);
  if(hit.time >= MAX_TIME) {
    return vec3(0.0);
  }
  // return getColorFromGlobalIllumination(ray, hit);
  return getColorFromLights(ray, hit) + getColorFromGlobalIllumination(ray, hit);
}

// MAIN FUNCTION

void main() {
  vec2 uvPosition = position * 0.5 + vec2(0.5); // [-1, 1] x [-1, 1] -> [0, 1] x [0, 1]
  vec4 prevFramePixel = texture2D(prevFrame, uvPosition);
  gl_FragColor = (float(renderCount - 1) * prevFramePixel + vec4(tracePath(generateRay(position)), 1.0)) / float(renderCount);
}