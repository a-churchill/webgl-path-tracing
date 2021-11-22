import { mat4 } from "gl-matrix";
import { useEffect, useRef } from "react";
import { ProgramInfo } from "../../types/ProgramInfo";
import { WebGLError } from "../../utils/errors";
import vsSource from "../../shaders/simple-vertex-shader.glsl";
import fsSource from "../../shaders/simple-fragment-shader.glsl";

const CANVAS_ID = "webgl-canvas";

// const vsSource: GLSLProgramSource = `
//   attribute vec4 vertexPosition;

//   uniform mat4 modelViewMatrix;
//   uniform mat4 projectionMatrix;

//   void main() {
//     gl_Position = projectionMatrix * modelViewMatrix * vertexPosition;
//   }
// `;

// const fsSource: GLSLProgramSource = `
//   void main() {
//     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
//   }
// `;

/**
 * Initializes the shader program.
 *
 * Credit to [MDN tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL).
 *
 * @param gl webgl rendering context
 * @param vsSource vertex shader source code
 * @param fsSource fragment shader source code
 */
function initializeShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: GLSLProgramSource,
  fsSource: GLSLProgramSource
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // create the shader program
  const shaderProgram = gl.createProgram();
  if (shaderProgram === null) {
    throw new WebGLError("Could not create shader program");
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // make sure link was successful
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new WebGLError(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
  }

  return shaderProgram;
}

/**
 * Creates a shader of the given type, uploads the source, and compiles it.
 *
 * Credit to [MDN tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL).
 *
 * @param gl webgl rendering context
 * @param type shader type to create
 * @param source source code for given shader
 * @returns shader program
 */
function loadShader(
  gl: WebGLRenderingContext,
  type: number,
  source: GLSLProgramSource
): WebGLShader {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new WebGLError(`Could not create shader of type ${type}`);
  }

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const logs = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new WebGLError(`An error occurred compiling the shaders: ${logs}`);
  }

  return shader;
}

/**
 * Creates the program info for a given program.
 *
 * @param gl webgl rendering context
 * @param program program to initialize info for
 * @param attribNames names of attributes used in the program
 * @param uniformNames names of uniform variables used in the program
 * @returns program info for the given program
 */
function createProgramInfo<A extends string, U extends string>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  attribNames: A[],
  uniformNames: U[]
): ProgramInfo<Record<A, number>, Record<U, number>> {
  return {
    program,
    attribLocations: Object.fromEntries(
      attribNames.map((a) => [a, gl.getAttribLocation(program, a)])
    ) as Record<A, number>,
    uniformLocations: Object.fromEntries(
      uniformNames.map((u) => [u, gl.getUniformLocation(program, u)])
    ) as Record<U, number>,
  };
}

/**
 * Initializes the buffers used to communicate with the WebGL program.
 *
 * @param gl webgl rendering context
 * @returns
 */
function initializeBuffers(gl: WebGLRenderingContext) {
  /** Buffer to hold object positions */
  const positionBuffer = gl.createBuffer();
  if (positionBuffer === null) {
    throw new WebGLError("Could not create buffer");
  }

  // apply all buffer operations to array buffer from now on
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -1.0,
    1.0, // vertex 1
    1.0,
    1.0, // vertex 2
    -1.0,
    -1.0, // vertex 3
    1.0,
    -1.0, // vertex 4
  ];

  // load positions into webgl
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

/**
 * Draws a scene.
 *
 * Credit to [MDN tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL).
 *
 * @param gl webgl rendering context
 */
function drawScene(gl: WebGLRenderingContext) {
  const shaderProgram = initializeShaderProgram(gl, vsSource, fsSource);

  const programInfo = createProgramInfo(
    gl,
    shaderProgram,
    ["vertexPosition"],
    ["projectionMatrix", "modelViewMatrix"]
  );

  const buffers = initializeBuffers(gl);

  // create projection matrix

  const fieldOfView = (45 * Math.PI) / 180; // radians
  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, zNear, zFar);

  // create model view matrix

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -4.0]);

  // set up webgl render process

  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  /** Set to 0 to compute directly from `type` and `numComponents` */
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  gl.useProgram(programInfo.program);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  // render

  const drawOffset = 0;
  const vertexCount = 4;

  gl.drawArrays(gl.TRIANGLE_STRIP, drawOffset, vertexCount);
}

/**
 * Creates a WebGL canvas and manages WebGL objects.
 */
export default function Canvas() {
  const contextRef = useRef<WebGLRenderingContext>();

  // initialize canvas to black, store rendering context
  useEffect(() => {
    const canvas = document.querySelector(
      `#${CANVAS_ID}`
    ) as HTMLCanvasElement | null;
    // Initialize the GL context
    const gl = canvas?.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === undefined || gl === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      return;
    }

    contextRef.current = gl;

    // set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    try {
      drawScene(gl);
    } catch (e) {
      if (e instanceof WebGLError) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }, []);

  return <canvas id={CANVAS_ID} width="640" height="480"></canvas>;
}
