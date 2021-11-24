import ProgramControls from "components/ProgramControls";
import useMouseCameraControl from "hooks/useMouseCameraControl";
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

  const renderCallback = useCallback(
    (program: Program | undefined) => {
      requestAnimationFrame(() => {
        if (program !== undefined) {
          render(program, onErrorCallback);
        }
      });
    },
    [onErrorCallback]
  );

  // initialize program
  useEffect(() => {
    setProgram(initializeProgram(onErrorCallback));
  }, [onErrorCallback]);

  // render on change
  useEffect(() => {
    console.log("render program", program);
    renderCallback(program);
  }, [program, renderCallback]);

  // allow moving camera around
  const eventListeners = useMouseCameraControl(program, setProgram);

  useEffect(() => {
    const listener = () => renderCallback(program);
    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, [program, renderCallback]);

  return (
    <>
      <canvas
        {...eventListeners}
        id={CANVAS_ID}
        className={styles.canvas}
        width="480"
        height="480"
      />
      <ProgramControls program={program} updateProgram={setProgram} />
      {error !== undefined && <div className={styles.error}>{error}</div>}
    </>
  );
}
