import { PrimitiveType } from "types/Primitive";
import { Program } from "types/Program";
import { MAX_LIGHTS, MAX_PLANES, MAX_SPHERES } from "utils/constants";
import { unreachable, WebGLError } from "utils/errors";

/**
 * This is the main communication between our local JS state and WebGL.
 *
 * @param program current program state
 */
function copyProgramStateToBuffers({
  camera,
  gl,
  primitives,
  shaderProgram,
  textures,
}: Program): void {
  gl.useProgram(shaderProgram.program);

  // activate textures
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(shaderProgram.uniformLocations.randomNoise, 0);

  gl.uniform1f(shaderProgram.uniformLocations["seed"], Math.random());
  gl.uniform3fv(shaderProgram.uniformLocations["camera.center"], camera.center);
  gl.uniform3fv(
    shaderProgram.uniformLocations["camera.direction"],
    camera.direction
  );
  gl.uniform1f(shaderProgram.uniformLocations["camera.fov"], camera.fov);
  gl.uniform3fv(shaderProgram.uniformLocations["camera.up"], camera.up);

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

export function render(
  program: Program,
  onError: (errorInfo: string) => void
): void {
  const { gl } = program;
  try {
    // gl.clear(gl.COLOR_BUFFER_BIT);
    copyProgramStateToBuffers(program);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  } catch (e) {
    if (e instanceof WebGLError) {
      onError(e.message);
    } else {
      throw e;
    }
  }
}
