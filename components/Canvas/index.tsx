import fsSource from "shaders/simple-fragment-shader.glsl";
import vsSource from "shaders/simple-vertex-shader.glsl";

import { mat4 } from "gl-matrix";
import useMouseCameraControl from "hooks/useMouseCameraControl";
import { useCallback, useEffect, useRef } from "react";
import { ProgramInfo } from "types/ProgramInfo";
import { CAMERA_DISTANCE } from "utils/constants";
import { WebGLError } from "utils/errors";

type SimpleProgram = ProgramInfo<
  Record<"vertexPosition", number>,
  Record<"projectionMatrix" | "modelMatrix" | "viewMatrix", number>
>;

const CANVAS_ID = "webgl-canvas";
const FIELD_OF_VIEW = (45 * Math.PI) / 180; // radians
const Z_NEAR = 0.1;
const Z_FAR = 100;
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
): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // create the shader program
  const program = gl.createProgram();
  if (program === null) {
    throw new WebGLError("Could not create shader program");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // make sure link was successful
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const logs = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new WebGLError(`Unable to initialize the shader program: ${logs}`);
  }

  return program;
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
function initializeProgramInfo<A extends string, U extends string>(
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
function initializeBuffers(
  gl: WebGLRenderingContext,
  programInfo: SimpleProgram
) {
  /** Buffer to hold object positions */
  const positionBuffer = gl.createBuffer();
  if (positionBuffer === null) {
    throw new WebGLError("Could not create buffer");
  }

  // apply all buffer operations to array buffer from now on
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    -1.0,
    1.0,
    0.1, // vertex 1
    1.0,
    1.0,
    -0.1, // vertex 2
    -1.0,
    -1.0,
    0.1, // vertex 3
    1.0,
    -1.0,
    -0.1, // vertex 4
  ];

  // load positions into webgl
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  /** Buffer to hold indices */
  const indexBuffer = gl.createBuffer();
  if (indexBuffer === null) {
    throw new WebGLError("Could not create buffer");
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  const indices = [
    1,
    0,
    2, // first triangle
    1,
    2,
    3, // second triangle
  ];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // set up webgl to pass in values to program

  const numComponents = 3; // 3 floats per vertex
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

  // now bind to `positionArray` is set; we can reuse `gl.ARRAY_BUFFER` bind point
}

function initialize(gl: WebGLRenderingContext): SimpleProgram {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.enable(gl.CULL_FACE);

  try {
    const shaderProgram = initializeShaderProgram(gl, vsSource, fsSource);

    const programInfo = initializeProgramInfo(
      gl,
      shaderProgram,
      ["vertexPosition"],
      ["projectionMatrix", "modelMatrix", "viewMatrix"]
    );

    initializeBuffers(gl, programInfo);

    return programInfo;
  } catch (e) {
    if (e instanceof WebGLError) {
      alert(e.message);
    }
    throw e;
  }
}

function render(
  gl: WebGLRenderingContext,
  viewMatrix: mat4,
  programInfo: SimpleProgram
) {
  gl.clear(gl.COLOR_BUFFER_BIT);

  try {
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      FIELD_OF_VIEW,
      aspectRatio,
      Z_NEAR,
      Z_FAR
    );

    // set up webgl render process

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelMatrix,
      false,
      mat4.create()
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.viewMatrix,
      false,
      viewMatrix
    );

    // render

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  } catch (e) {
    if (e instanceof WebGLError) {
      alert(e.message);
      throw e;
    }
  }
}

/**
 * Creates a WebGL canvas and manages WebGL objects.
 */
export default function Canvas() {
  const contextRef = useRef<WebGLRenderingContext>();
  const viewMatrixRef = useRef<mat4>(
    mat4.invert(
      mat4.create(),
      mat4.fromTranslation(mat4.create(), [0.0, 0.0, CAMERA_DISTANCE])
    )
  );
  const programInfoRef = useRef<SimpleProgram>();

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

    programInfoRef.current = initialize(gl);
    render(gl, viewMatrixRef.current, programInfoRef.current);
  }, []);

  const renderCallback = useCallback(() => {
    if (
      contextRef.current === undefined ||
      programInfoRef.current === undefined
    )
      return;
    render(contextRef.current, viewMatrixRef.current, programInfoRef.current);
  }, []);

  const mouseListeners = useMouseCameraControl(
    contextRef,
    viewMatrixRef,
    renderCallback
  );

  return <canvas id={CANVAS_ID} {...mouseListeners} width="640" height="480" />;
}
