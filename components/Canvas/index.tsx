import ProgramControls from "components/ProgramControls";
import useMouseCameraControl from "hooks/useMouseCameraControl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Program } from "types/Program";
import { CANVAS_ID, IMAGE_SIZE } from "utils/constants";
import initializeProgram from "utils/WebGL/initializeProgram";
import { render } from "utils/WebGL/render";

import styles from "./Canvas.module.css";

interface Props {
  program: Program | undefined;
  setProgram: (program: Program | undefined) => void;
}

/**
 * Creates a WebGL canvas and manages WebGL objects.
 */
export default function Canvas({ program, setProgram }: Props) {
  const [error, setError] = useState<string | undefined>();
  const renderCountRef = useRef(1);

  const onErrorCallback = useCallback((errorInfo: string) => {
    setError(errorInfo);
  }, []);

  /**
   * Resets the render process, starting previous frame data over
   */
  const rerenderCallback = useCallback(() => {
    renderCountRef.current = 1;
  }, []);

  // initialize program
  useEffect(() => {
    setProgram(initializeProgram(onErrorCallback));
  }, [onErrorCallback, setProgram]);

  // set up main render loop
  useEffect(() => {
    let frameToCancel: number;
    function renderLoop(): void {
      if (program !== undefined) {
        render(program, renderCountRef.current, onErrorCallback);
        renderCountRef.current = renderCountRef.current + 1;

        frameToCancel = requestAnimationFrame(renderLoop);
      }
    }
    frameToCancel = requestAnimationFrame(renderLoop);

    // clean up current render loop when program changes
    return () => cancelAnimationFrame(frameToCancel);
  }, [onErrorCallback, program]);

  // reset render on program change
  useEffect(() => {
    rerenderCallback();
  }, [program, rerenderCallback]);

  // allow moving camera around
  const eventListeners = useMouseCameraControl(program, setProgram);

  // make sure to rerender when screen size changes
  useEffect(() => {
    window.addEventListener("resize", rerenderCallback);

    return () => window.removeEventListener("resize", rerenderCallback);
  }, [rerenderCallback]);

  return (
    <>
      <canvas
        {...eventListeners}
        id={CANVAS_ID}
        className={styles.canvas}
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
      />
      <ProgramControls program={program} updateProgram={setProgram} />
      {error !== undefined && <div className={styles.error}>{error}</div>}
    </>
  );
}
