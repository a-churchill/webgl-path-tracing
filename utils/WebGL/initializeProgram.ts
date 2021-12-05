import fsSource from "shaders/fragment-shader.glsl";
import vsSource from "shaders/vertex-shader.glsl";

import { DEFAULT_CAMERA } from "types/Camera";
import {
  Attributes,
  Program,
  PROGRAM_ATTRIBUTES,
  PROGRAM_UNIFORMS,
  Uniforms,
} from "types/Program";
import { CANVAS_ID } from "utils/constants";
import { WebGLError } from "utils/errors";
import { CORNELL_BOX_AREA_LIGHT } from "utils/presetPrograms";

/**
 * Initializes the buffers used to communicate with the WebGL program.
 *
 * The vertex information we load is very boring, because we're not actually using
 * rasterization, we're using ray tracing! So we just set up two triangles which take
 * up the entirety of the clip space of the WebGL canvas, and allow a `varying`
 * parameter to interpolate the actual positions for the fragment shader.
 *
 * @param gl webgl rendering context
 * @returns
 */
function initializeVertices(
  gl: WebGLRenderingContext,
  shaderProgram: Program["shaderProgram"]
) {
  // set up
  const positionBuffer = gl.createBuffer();
  if (positionBuffer === null) {
    throw new WebGLError("Could not create position buffer");
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

  /** Buffer to hold indices */
  const indexBuffer = gl.createBuffer();
  if (indexBuffer === null) {
    throw new WebGLError("Could not create index buffer");
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

  const numComponents = 2; // floats per vertex
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0; // set to 0 to compute directly from `type` and `numComponents`
  gl.vertexAttribPointer(
    shaderProgram.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    0
  );
  gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);
}

/**
 * Initializes the shader program, consisting of vertex and fragment shaders.
 *
 * Credit to [MDN tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL).
 *
 * @param gl webgl rendering context
 * @param vertexShaderSource vertex shader source code
 * @param fragmentShaderSource fragment shader source code
 */
function initializeShaderProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: GLSLProgramSource,
  fragmentShaderSource: GLSLProgramSource
): Program["shaderProgram"] {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

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

  return {
    program,
    attribLocations: Object.fromEntries(
      PROGRAM_ATTRIBUTES.map((a) => [a, gl.getAttribLocation(program, a)])
    ) as Attributes,
    uniformLocations: Object.fromEntries(
      PROGRAM_UNIFORMS.map((u) => [u, gl.getUniformLocation(program, u)])
    ) as Uniforms,
  };
}

/**
 * Initializes textures, loading images asynchronously if necessary
 * @param gl webgl rendering context
 * @returns texture objects
 */
function initializeTextures(gl: WebGLRenderingContext): WebGLTexture[] {
  const randomNoiseTexture = gl.createTexture();
  if (randomNoiseTexture === null) {
    throw new WebGLError("Could not create random noise texture");
  }
  const image = new Image();

  // bind image to texture when it loads
  image.addEventListener("load", () => {
    gl.bindTexture(gl.TEXTURE_2D, randomNoiseTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // turn off mips and set wrapping to clamp to edge
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  });

  // start image loading
  image.src = "noise.png";

  const prevSceneTexture = gl.createTexture();
  if (prevSceneTexture === null) {
    throw new WebGLError("Could not create previous scene texture");
  }
  gl.bindTexture(gl.TEXTURE_2D, prevSceneTexture);
  // turn off mips and set wrapping to clamp to edge
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return [randomNoiseTexture, prevSceneTexture];
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
 * Initializes our program, setting up our local state as well as the relevant WebGL
 * state.
 *
 * @param onError called with information if something fails while creating WebGL
 * program
 * @returns program if successfully created, otherwise `undefined`
 */
export default function initializeProgram(
  onError: (errorInfo: string) => void
): Program | undefined {
  const canvas = document.querySelector(
    `#${CANVAS_ID}`
  ) as HTMLCanvasElement | null;
  // Initialize the GL context
  const gl = canvas?.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === undefined || gl === null) {
    onError(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  try {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const shaderProgram = initializeShaderProgram(gl, vsSource, fsSource);
    initializeVertices(gl, shaderProgram);
    const textures = initializeTextures(gl);

    return {
      camera: DEFAULT_CAMERA,
      gl,
      primitives: CORNELL_BOX_AREA_LIGHT,
      shaderProgram,
      textures,
    };
  } catch (e) {
    if (e instanceof WebGLError) {
      onError(e.message);
      return undefined;
    } else {
      throw e;
    }
  }
}
