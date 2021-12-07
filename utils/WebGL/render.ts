import { vec3 } from "gl-matrix";
import { Plane, PointLight, PrimitiveType, Sphere } from "types/Primitive";
import { Program } from "types/Program";
import {
  IMAGE_SIZE,
  MAX_LIGHTS,
  MAX_PLANES,
  MAX_SPHERES,
  PREV_FRAME_TEXTURE_INDEX,
  RANDOM_NOISE_TEXTURE_INDEX,
} from "utils/constants";
import { unreachable, WebGLError } from "utils/errors";

/**
 * This is the main communication between our local JS state and WebGL.
 *
 * @param program current program state
 */
function copyProgramStateToBuffers(
  { camera, gl, options, primitives, shaderProgram, textures }: Program,
  renderCount: number
): void {
  gl.useProgram(shaderProgram.program);

  // set up utility values
  gl.uniform1i(shaderProgram.uniformLocations.renderCount, renderCount);
  gl.uniform1f(shaderProgram.uniformLocations.seed, Math.random());
  gl.uniform1f(shaderProgram.uniformLocations.seed2, Math.random());
  gl.uniform1i(
    shaderProgram.uniformLocations.renderMode,
    options.directIllumination && options.globalIllumination
      ? 3
      : options.globalIllumination
      ? 2
      : options.directIllumination
      ? 1
      : 0
  );

  // set up random noise texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[RANDOM_NOISE_TEXTURE_INDEX]);
  gl.uniform1i(
    shaderProgram.uniformLocations.randomNoise,
    RANDOM_NOISE_TEXTURE_INDEX
  );

  // set up previous frame texture
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[PREV_FRAME_TEXTURE_INDEX]);
  gl.uniform1i(
    shaderProgram.uniformLocations.prevFrame,
    PREV_FRAME_TEXTURE_INDEX
  );

  // set up camera properties
  gl.uniform3fv(shaderProgram.uniformLocations["camera.center"], camera.center);
  gl.uniform3fv(
    shaderProgram.uniformLocations["camera.direction"],
    camera.direction
  );
  gl.uniform1f(shaderProgram.uniformLocations["camera.fov"], camera.fov);
  gl.uniform3fv(shaderProgram.uniformLocations["camera.up"], camera.up);

  // set up primitives
  let pointLightIndex = 0;
  let planeIndex = 0;
  let sphereIndex = 0;
  for (const primitive of primitives) {
    switch (primitive.type) {
      case PrimitiveType.PointLight:
        setPointLightUniforms(gl, shaderProgram, primitive, pointLightIndex);
        pointLightIndex++;
        break;
      case PrimitiveType.Plane:
        setPlaneUniforms(gl, shaderProgram, primitive, planeIndex);
        planeIndex++;
        break;
      case PrimitiveType.Sphere:
        setSphereUniforms(gl, shaderProgram, primitive, sphereIndex);
        sphereIndex++;
        break;
      default:
        unreachable(primitive);
    }
  }

  // reset now unused primitives
  while (pointLightIndex < MAX_LIGHTS) {
    setPointLightUniforms(
      gl,
      shaderProgram,
      PointLight(vec3.create(), vec3.create(), 0),
      pointLightIndex
    );
    pointLightIndex++;
  }
  while (planeIndex < MAX_PLANES) {
    setPlaneUniforms(
      gl,
      shaderProgram,
      Plane(vec3.create(), 0, vec3.create(), 0, vec3.create()),
      planeIndex
    );
    planeIndex++;
  }
  while (sphereIndex < MAX_SPHERES) {
    setSphereUniforms(
      gl,
      shaderProgram,
      Sphere(vec3.create(), 0, vec3.create()),
      sphereIndex
    );
    sphereIndex++;
  }
}

// buffer size is 4 numbers per pixel (RGBA) * number of pixels
/**
 * Array holding current pixels, allocated once for better performance.
 */
const currentPixels = new Uint8Array(IMAGE_SIZE * IMAGE_SIZE * 4);

/**
 * Saves the current pixels in the WebGL frame to a texture, to use in
 * future renders.
 *
 * @param program current program state
 */
function saveCurrentFrameToTexture(program: Program): void {
  const { gl } = program;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, program.textures[PREV_FRAME_TEXTURE_INDEX]);

  console.time("readPixels");
  gl.readPixels(
    0,
    0,
    IMAGE_SIZE,
    IMAGE_SIZE,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    currentPixels
  );
  console.timeEnd("readPixels");
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    IMAGE_SIZE,
    IMAGE_SIZE,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    currentPixels
  );
}

/**
 * Set up uniforms for the given plane.
 */
export function setPlaneUniforms(
  gl: WebGLRenderingContext,
  shaderProgram: Program["shaderProgram"],
  plane: Plane,
  planeIndex: number
) {
  if (planeIndex >= MAX_PLANES) {
    throw new WebGLError("Too many planes");
  }
  gl.uniform3fv(
    shaderProgram.uniformLocations[`planes[${planeIndex}].normal`],
    plane.normal
  );
  gl.uniform3fv(
    shaderProgram.uniformLocations[`planes[${planeIndex}].up`],
    plane.up
  );
  gl.uniform1f(
    shaderProgram.uniformLocations[`planes[${planeIndex}].d`],
    plane.d
  );
  gl.uniform1f(
    shaderProgram.uniformLocations[`planes[${planeIndex}].sideLength`],
    plane.sideLength
  );
  gl.uniform1f(
    shaderProgram.uniformLocations[`planes[${planeIndex}].emittance`],
    plane.emittance
  );
  gl.uniform1i(
    shaderProgram.uniformLocations[`planes[${planeIndex}].materialType`],
    plane.materialType
  );
  gl.uniform3fv(
    shaderProgram.uniformLocations[`planes[${planeIndex}].color`],
    plane.color
  );
}

/**
 * Set up uniforms for the given point light.
 */
export function setPointLightUniforms(
  gl: WebGLRenderingContext,
  shaderProgram: Program["shaderProgram"],
  pointLight: PointLight,
  pointLightIndex: number
) {
  if (pointLightIndex >= MAX_LIGHTS) {
    throw new WebGLError("Too many lights");
  }
  gl.uniform3fv(
    shaderProgram.uniformLocations[`pointLights[${pointLightIndex}].origin`],
    pointLight.origin
  );
  gl.uniform3fv(
    shaderProgram.uniformLocations[`pointLights[${pointLightIndex}].color`],
    pointLight.color
  );
  gl.uniform1f(
    shaderProgram.uniformLocations[
      `pointLights[${pointLightIndex}].brightness`
    ],
    pointLight.brightness
  );
}

/**
 * Set up uniforms for the given point light.
 */
export function setSphereUniforms(
  gl: WebGLRenderingContext,
  shaderProgram: Program["shaderProgram"],
  sphere: Sphere,
  sphereIndex: number
) {
  if (sphereIndex >= MAX_SPHERES) {
    throw new WebGLError("Too many spheres");
  }
  gl.uniform3fv(
    shaderProgram.uniformLocations[`spheres[${sphereIndex}].center`],
    sphere.center
  );
  gl.uniform1f(
    shaderProgram.uniformLocations[`spheres[${sphereIndex}].radius`],
    sphere.radius
  );
  gl.uniform1f(
    shaderProgram.uniformLocations[`spheres[${sphereIndex}].emittance`],
    sphere.emittance
  );
  gl.uniform1i(
    shaderProgram.uniformLocations[`spheres[${sphereIndex}].materialType`],
    sphere.materialType
  );
  gl.uniform3fv(
    shaderProgram.uniformLocations[`spheres[${sphereIndex}].color`],
    sphere.color
  );
}

export function render(
  program: Program,
  renderCount: number,
  onError: (errorInfo: string) => void
): void {
  const { gl } = program;
  try {
    console.time("render");
    copyProgramStateToBuffers(program, renderCount);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    saveCurrentFrameToTexture(program);
    console.timeEnd("render");
  } catch (e) {
    if (e instanceof WebGLError) {
      onError(e.message);
    } else {
      throw e;
    }
  }
}
