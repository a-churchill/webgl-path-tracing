export class WebGLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebGLError";
  }
}

/**
 * Useful to get compiler errors when there is a new type we haven't handled, e.g. in a
 * switch statement.
 */
export function unreachable(x: never) {
  throw Error(`Should be unreachable, but got ${x}`);
}
