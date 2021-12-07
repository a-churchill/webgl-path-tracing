#version 300 es

precision mediump float;

// CONSTANTS
const int MAX_LIGHTS = 5;
const int MAX_PLANES = 8;
const int MAX_SPHERES = 5;

const int MAX_BOUNCES = 8;

const float EPSILON = 0.0001;
const float MAX_TIME = 10000.0;

const float ATTENUATION = 1.0;
const float REFLECTANCE = 0.5;
const float AIR_INDEX_OF_REFRACTION = 1.0;
const float GLASS_INDEX_OF_REFRACTION = 1.45;

const int DIFFUSE_MATERIAL_TYPE = 0;
const int REFLECTIVE_MATERIAL_TYPE = 1;
const int REFRACTIVE_MATERIAL_TYPE = 2;

const float IMAGE_SIZE = 400.0;
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
  float emittance;
  int materialType;
};

// used to cache a repeated computation
struct Illumination {
  vec3 dirToLight;
  float distToLight;
};

struct PointLight {
  vec3 origin;
  vec3 color;
  float brightness;
};

// represents a stop along the path we are tracing
struct PathBounce {
  vec3 normal;
  vec3 outgoingRay;
};

struct Plane {
  vec3 normal;
  float d;
  vec3 up;
  float sideLength;
  vec3 color;
  float emittance;
  int materialType;
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct RefractedRay {
  Ray ray;
  vec3 normal;
};

struct Sphere {
  vec3 center;
  float radius;
  vec3 color;
  float emittance;
  int materialType;
};

// INPUTS

uniform Camera camera;
uniform PointLight pointLights[MAX_LIGHTS];
uniform Plane planes[MAX_PLANES];
uniform Sphere spheres[MAX_SPHERES];
uniform float seed;
uniform float seed2;

// this is the previous frame (in particular, the average of the previous `renderCount`
// frames)
uniform sampler2D prevFrame;
// we average the current frame with the previous `renderCount` frames
uniform int renderCount;
// this is random noise, provided from a PNG
uniform sampler2D randomNoise;

// true if we should render global illumination, false otherwise
uniform int renderMode;

// this is the xy position of the current point, in clip space coordinates.
in vec2 position;

out vec4 outputColor;

// HELPER FUNCTIONS

// gets a random number in [-1, 1].
// credit to https://www.shadertoy.com/view/4djSRW
float rand1(vec3 inVec, float seed) {
  vec3 pos3 = fract(vec3(inVec.xyx) * vec3(.1031, .1030, .0973) * seed * 1500.0);
  pos3 += dot(pos3, pos3.yzx + 33.33);
  vec2 pos = fract((pos3.xx + pos3.yz) * pos3.zy);

  return texture(randomNoise, pos).x * 2.0 - 1.0;
}

// gets a random normalized vector from an input vector.
// credit to https://www.shadertoy.com/view/4djSRW
vec3 rand(vec3 inVec) {
  vec3 pos3 = fract(vec3(inVec.xyx) * vec3(.1031, .1030, .0973) * seed * 1500.0);
  pos3 += dot(pos3, pos3.yzx + 33.33);
  vec2 pos = fract((pos3.xx + pos3.yz) * pos3.zy);

  return normalize(texture(randomNoise, pos).xyz * 2.0 - vec3(1.0));
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

  float jitterX = position.x + (rand1(vec3(position, seed), seed) * 2.0 / IMAGE_SIZE);
  float jitterY = position.y + (rand1(vec3(position, seed2), seed2) * 2.0 / IMAGE_SIZE);
  vec3 newDir = normalize((d * camera.direction) + (jitterX * horizontal) + (jitterY * camera.up));
  return Ray(camera.center, newDir);
}

// Get the center point of a plane.
vec3 getCenterOfPlane(vec3 normal, float d) {
  return normal * sign(d) * sqrt(abs(d));
}

vec3 computeVectorToLight(vec3 hitPos, PointLight light) {
  return light.origin - hitPos;
}

vec3 computeVectorToLight(vec3 hitPos, Plane light) {
  // compute random position on plane
  vec3 basis1 = light.up;
  vec3 basis2 = cross(light.normal, light.up);

  float offset1 = rand1(hitPos, seed) * light.sideLength;
  float offset2 = rand1(hitPos, seed2) * light.sideLength;

  vec3 posOnPlane = getCenterOfPlane(light.normal, light.d) + (basis1 * offset1) + (basis2 * offset2);
  return posOnPlane - hitPos;
}

vec3 computeVectorToLight(vec3 hitPos, Sphere light) {
  // compute random postion on sphere
  vec3 posOnSphere = rand(hitPos) * light.radius + light.center;

  return posOnSphere - hitPos;
}

Illumination getIllumination(vec3 vecToLight) {
  return Illumination(normalize(vecToLight), length(vecToLight));
}

HitRecord intersectRayWithPrimitive(Ray ray, Plane plane, HitRecord hit, bool ignoreEmitters) {
  if(dot(plane.normal, ray.direction) > 0.0) {
    // ignore plane if we're on the wrong side of it
    return hit;
  }
  if(ignoreEmitters && plane.emittance >= EPSILON) {
    return hit;
  }
  float time = (plane.d - dot(plane.normal, ray.origin)) / dot(plane.normal, ray.direction);
  if(EPSILON < time && time < hit.time) {
    vec3 pointOnPlane = rayAtTime(ray, time);
    vec3 centerOfPlane = getCenterOfPlane(plane.normal, plane.d);
    vec3 difference = pointOnPlane - centerOfPlane;
    if(abs(difference.x) > plane.sideLength || abs(difference.y) > plane.sideLength || abs(difference.z) > plane.sideLength) {
      return hit;
    }

    hit.time = time;
    hit.normal = plane.normal;
    hit.color = plane.color;
    hit.emittance = plane.emittance;
    hit.materialType = plane.materialType;
  }
  return hit;
}

HitRecord intersectRayWithPrimitive(Ray ray, Sphere sphere, HitRecord hit, bool ignoreEmitters) {
  if(ignoreEmitters && sphere.emittance >= EPSILON) {
    return hit;
  }

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
  if(t_minus < EPSILON && t_plus < EPSILON) {
    return hit;
  }
  float t = t_minus < EPSILON ? t_plus : t_minus;

  if(t < hit.time) {
    hit.time = t;
    hit.normal = normalize(rayAtTime(ray, t));
    hit.color = sphere.color;
    hit.emittance = sphere.emittance;
    hit.materialType = sphere.materialType;
  }
  return hit;
}

// Computes refraction of ray through sphere. Returns the original ray if this ray does
// not intersect the given sphere. Assumes `prevHit` is valid.
RefractedRay refractRay(Ray incomingRay, HitRecord prevHit) {
  vec3 nextDir = refract(incomingRay.direction, prevHit.normal, AIR_INDEX_OF_REFRACTION / GLASS_INDEX_OF_REFRACTION);
  Ray nextRay = Ray(rayAtTime(incomingRay, prevHit.time) + EPSILON * nextDir, nextDir);

  HitRecord hit;
  hit.time = MAX_TIME;
  for(int i = 0; i < MAX_SPHERES; i++) {
    hit = intersectRayWithPrimitive(nextRay, spheres[i], hit, false);
  }
  if(hit.time >= MAX_TIME) {
    return RefractedRay(incomingRay, prevHit.normal);
  }

  vec3 finalDir = refract(nextRay.direction, -hit.normal, GLASS_INDEX_OF_REFRACTION / AIR_INDEX_OF_REFRACTION);

  Ray result = Ray(rayAtTime(nextRay, hit.time) + EPSILON * finalDir, finalDir);
  return RefractedRay(result, hit.normal);
}

// Checks the ray's intersection with all primitives
HitRecord intersectRay(Ray ray, bool ignoreEmitters) {
  HitRecord hit;
  hit.time = MAX_TIME;

  for(int i = 0; i < MAX_PLANES; i++) {
    hit = intersectRayWithPrimitive(ray, planes[i], hit, ignoreEmitters);
  }

  for(int i = 0; i < MAX_SPHERES; i++) {
    hit = intersectRayWithPrimitive(ray, spheres[i], hit, ignoreEmitters);
  }

  return hit;
}

// Checks if the current position is shadowed from the given light by another primitive
// in the scene.
bool isPositionInShadow(vec3 hitPos, Illumination illumination) {
  Ray rayToLight = Ray(hitPos + EPSILON * illumination.dirToLight, illumination.dirToLight);

  HitRecord shadowHit = intersectRay(rayToLight, true);
  if(shadowHit.time >= MAX_TIME) {
    return false;
  }

  // handle caustics if applicable
  if(shadowHit.materialType == REFRACTIVE_MATERIAL_TYPE) {
    RefractedRay refracted = refractRay(rayToLight, shadowHit);

    // check if refracted ray hits light directly
    HitRecord causticHit = intersectRay(refracted.ray, false);
    if(causticHit.emittance > 0.0) {
      // admittedly a bit hacky - we're not checking it's intersecting the light we care
      // about, just that it's intersecting any light
      return false;
    }
  }

  float distToClosestPrimitive = distance(rayAtTime(rayToLight, shadowHit.time), hitPos);
  return distToClosestPrimitive < illumination.distToLight;
}

// Gets the color contribution from the given light. Does not compute shadows.
vec3 getColorFromLight(vec3 lightColor, Illumination illumination, HitRecord hit) {
  vec3 intensity = lightColor /
    pow(illumination.distToLight, 2.0);
  return max(dot(illumination.dirToLight, hit.normal), 0.0) * intensity * hit.color;
}

// Gets the contribution to the current pixel's color from direct light rays. Assumes
// the `HitRecord` passed is valid. The `includeBounces` parameter allows us to specify
// the behavior if we intersect a material that will reflect/refract the ray. If it is
// true, we will follow the bounces (up to `MAX_BOUNCES`). If it is false, we just
// return (0.0, 0.0, 0.0).
vec3 getColorFromLights(Ray ray, HitRecord hit, bool includeBounces) {
  vec3 hitPos = rayAtTime(ray, hit.time);

  // handle reflective material
  if(!includeBounces && hit.materialType != DIFFUSE_MATERIAL_TYPE) {
    return vec3(0.0);
  }

  int reflectCount = 0;
  vec3 hitColor = hit.color;

  for(int i = 0; i < MAX_BOUNCES; i++) {
    vec3 newDir = vec3(0.0);
    vec3 newOrigin = vec3(0.0);
    if(hit.materialType == REFLECTIVE_MATERIAL_TYPE) {
      newOrigin = hitPos;
      newDir = reflect(ray.direction, hit.normal);
    } else if(hit.materialType == REFRACTIVE_MATERIAL_TYPE) {
      RefractedRay refracted = refractRay(ray, hit);
      newOrigin = refracted.ray.origin;
      newDir = refracted.ray.direction;
    } else {
      break;
    }
    ray = Ray(newOrigin + EPSILON * newDir, newDir);
    hit = intersectRay(ray, false);

    if(hit.time >= MAX_TIME) {
      return vec3(0.0);
    }

    hitPos = rayAtTime(ray, hit.time);
    hitColor = hitColor * hit.color;
    reflectCount = reflectCount + 1;
  }

  if(reflectCount == MAX_BOUNCES) {
    return vec3(0.0);
  }

  vec3 result = hit.emittance * hitColor;

  // compute point lights
  for(int i = 0; i < MAX_LIGHTS; i++) {
    vec3 vecToLight = computeVectorToLight(hitPos, pointLights[i]);
    Illumination illumination = getIllumination(vecToLight);

    if(isPositionInShadow(hitPos, illumination)) {
      continue;
    }
    result = result + getColorFromLight(pointLights[i].color * pointLights[i].brightness, illumination, hit);
  }

  // compute plane lights
  for(int i = 0; i < MAX_PLANES; i++) {
    Plane plane = planes[i];
    if(plane.emittance <= EPSILON) {
      continue;
    }

    vec3 vecToLight = computeVectorToLight(hitPos, plane);
    Illumination illumination = getIllumination(vecToLight);

    if(isPositionInShadow(hitPos, illumination)) {
      continue;
    }
    result = result + getColorFromLight(plane.color * plane.emittance, illumination, hit);
  }

  // compute sphere lights
  for(int i = 0; i < MAX_SPHERES; i++) {
    Sphere sphere = spheres[i];
    if(sphere.emittance <= EPSILON) {
      continue;
    }

    vec3 vecToLight = computeVectorToLight(hitPos, sphere);
    Illumination illumination = getIllumination(vecToLight);

    if(isPositionInShadow(hitPos, illumination)) {
      continue;
    }
    result = result + getColorFromLight(sphere.color * sphere.emittance, illumination, hit);
  }
  return result;
}

// Gets the contribution to the current pixel's color from global illumination, computed
// using a bounce. Computes illumination based on the incoming light, computed
// recursively `MAX_BOUNCES` times.
vec3 getColorFromGlobalIllumination(Ray ray, HitRecord hit) {
  vec3 initialColor = hit.color;
  PathBounce bounces[MAX_BOUNCES];

  // contributions from lights (not global illumination)
  vec3 lightColors[MAX_BOUNCES];

  // store number of valid bounces - we want to ignore bounces after the ray doesn't
  // hit any primitives
  int validBounces = 0;

  for(int i = 0; i < MAX_BOUNCES; i++) {
    vec3 hitPos = rayAtTime(ray, hit.time);
    vec3 normal = hit.normal;
    vec3 randomDirection = vec3(0.0);
    if(hit.materialType == DIFFUSE_MATERIAL_TYPE) {
      randomDirection = rand(hitPos);
      // constrain random vector to hemisphere of normal
      if(dot(hit.normal, randomDirection) < 0.0) {
        randomDirection = -randomDirection;
      }
    } else if(hit.materialType == REFLECTIVE_MATERIAL_TYPE) {
      randomDirection = reflect(ray.direction, hit.normal);
    } else if(hit.materialType == REFRACTIVE_MATERIAL_TYPE) {
      RefractedRay refracted = refractRay(ray, hit);
      hitPos = refracted.ray.origin;
      randomDirection = refracted.ray.direction;
      normal = refracted.normal;
    }
    bounces[i] = PathBounce(normal, randomDirection);

    // offset a bit in direction of ray, to avoid self hits
    ray = Ray(hitPos + EPSILON * randomDirection, randomDirection);
    hit = intersectRay(ray, false);
    if(hit.time >= MAX_TIME) {
      // nothing else to bounce off of
      break;
    }
    lightColors[i] = getColorFromLights(ray, hit, false);
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
    float brdf = REFLECTANCE / PI;
    colors[i] = incomingLight * brdf * dot(outgoingRay, hitNormal) * 2.0 * PI;
  }

  return colors[0] * initialColor;
}

// Returns the color of the pixel based on all lights, as well as global illumination.
vec3 tracePath(Ray ray) {
  HitRecord hit = intersectRay(ray, false);
  if(hit.time >= MAX_TIME) {
    return vec3(0.0);
  }

  if(renderMode == 3) {
    return getColorFromLights(ray, hit, true) + getColorFromGlobalIllumination(ray, hit);
  }

  if(renderMode == 2) {
    return getColorFromGlobalIllumination(ray, hit);
  }

  if(renderMode == 1) {
    return getColorFromLights(ray, hit, true);
  }

  return vec3(0.0);
}

// MAIN FUNCTION

void main() {
  vec2 uvPosition = position * 0.5 + vec2(0.5); // [-1, 1] x [-1, 1] -> [0, 1] x [0, 1]
  vec4 prevFramePixel = texture(prevFrame, uvPosition);
  outputColor = (float(renderCount - 1) * prevFramePixel + vec4(tracePath(generateRay(position)), 1.0)) / float(renderCount);
}