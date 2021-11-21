import { useEffect, useRef } from "react";

const CANVAS_ID = "webgl-canvas";

export default function Canvas() {
  const contextRef = useRef<WebGLRenderingContext>();
  // initialize canvas
  useEffect(() => {
    const canvas = document.querySelector(
      `#${CANVAS_ID}`
    ) as HTMLCanvasElement | null;
    // Initialize the GL context
    const glContext = canvas?.getContext("webgl");

    // Only continue if WebGL is available and working
    if (glContext === undefined || glContext === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      return;
    }

    contextRef.current = glContext;

    // Set clear color to black, fully opaque
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    glContext.clear(glContext.COLOR_BUFFER_BIT);
  }, []);
  return <canvas id={CANVAS_ID} width="640" height="480"></canvas>;
}
