import { PrimitiveType } from "types/Primitive";
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
  { camera, gl, primitives, shaderProgram, textures }: Program,
  renderCount: number
): void {
  gl.useProgram(shaderProgram.program);

  // set up utility values
  gl.uniform1i(shaderProgram.uniformLocations.renderCount, renderCount);
  gl.uniform1f(shaderProgram.uniformLocations["seed"], Math.random());

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
  let lightIndex = 0;
  let planeIndex = 0;
  let sphereIndex = 0;
  for (const primitive of primitives) {
    switch (primitive.type) {
      case PrimitiveType.Light:
        if (lightIndex >= MAX_LIGHTS) {
          throw new WebGLError("Too many lights");
        }
        gl.uniform3fv(
          shaderProgram.uniformLocations[`lights[${lightIndex}].origin`],
          primitive.origin
        );
        gl.uniform3fv(
          shaderProgram.uniformLocations[`lights[${lightIndex}].color`],
          primitive.color
        );
        lightIndex++;
        break;
      case PrimitiveType.Plane:
        if (planeIndex >= MAX_PLANES) {
          throw new WebGLError("Too many planes");
        }
        gl.uniform3fv(
          shaderProgram.uniformLocations[`planes[${planeIndex}].normal`],
          primitive.normal
        );
        gl.uniform1f(
          shaderProgram.uniformLocations[`planes[${planeIndex}].d`],
          primitive.d
        );
        gl.uniform3fv(
          shaderProgram.uniformLocations[`planes[${planeIndex}].color`],
          primitive.color
        );
        planeIndex++;
        break;
      case PrimitiveType.Sphere:
        if (sphereIndex >= MAX_SPHERES) {
          throw new WebGLError("Too many spheres");
        }
        gl.uniform3fv(
          shaderProgram.uniformLocations[`spheres[${sphereIndex}].center`],
          primitive.center
        );
        gl.uniform1f(
          shaderProgram.uniformLocations[`spheres[${sphereIndex}].radius`],
          primitive.radius
        );
        gl.uniform3fv(
          shaderProgram.uniformLocations[`spheres[${sphereIndex}].color`],
          primitive.color
        );
        sphereIndex++;
        break;
      default:
        unreachable(primitive);
    }
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

  gl.readPixels(
    0,
    0,
    IMAGE_SIZE,
    IMAGE_SIZE,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    currentPixels
  );
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

export function render(
  program: Program,
  renderCount: number,
  onError: (errorInfo: string) => void
): void {
  const { gl } = program;
  try {
    copyProgramStateToBuffers(program, renderCount);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    saveCurrentFrameToTexture(program);
  } catch (e) {
    if (e instanceof WebGLError) {
      onError(e.message);
    } else {
      throw e;
    }
  }
}
