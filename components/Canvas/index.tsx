import { useCallback, useEffect, useState } from "react";
import { Program } from "types/Program";
import { CANVAS_ID } from "utils/constants";
import initializeProgram from "utils/WebGL/initializeProgram";
import { render } from "utils/WebGL/render";

import styles from "./Canvas.module.css";

/**
 * Creates a WebGL canvas and manages WebGL objects.
 */
export default function Canvas() {
  const [program, setProgram] = useState<Program | undefined>();
  const [error, setError] = useState<string | undefined>();

  const onErrorCallback = useCallback((errorInfo: string) => {
    setError(errorInfo);
  }, []);

  const renderCallback = useCallback(() => {
    if (program !== undefined) {
      render(program, onErrorCallback);
    }
  }, [program, onErrorCallback]);

  // initialize program
  useEffect(() => {
    setProgram(initializeProgram(onErrorCallback));
  }, [onErrorCallback]);

  // render on change
  useEffect(() => {
    console.log("render program", program);
    renderCallback();
    setError(undefined);
  }, [onErrorCallback, program, renderCallback]);

  useEffect(() => {
    window.addEventListener("resize", renderCallback);

    return () => window.removeEventListener("resize", renderCallback);
  }, [renderCallback]);

  return (
    <>
      <canvas
        id={CANVAS_ID}
        className={styles.canvas}
        width="640"
        height="480"
      />
      {error !== undefined && <div className={styles.error}>{error}</div>}
    </>
  );
}
