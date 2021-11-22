/** A program in GLSL we will load into the WebGL context */
type GLSLProgramSource = string;

declare module "*.glsl" {
  const value: GLSLProgramSource;
  export default value;
}
