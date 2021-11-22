export class WebGLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GLSLGenerationError";
  }
}
