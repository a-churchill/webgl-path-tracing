import { useCallback } from "react";
import { DEFAULT_CAMERA } from "types/Camera";
import { Primitive } from "types/Primitive";
import { Program } from "types/Program";
import {
  CORNELL_BOX_AREA_LIGHT,
  CORNELL_BOX_THREE_POINT_LIGHTS,
} from "utils/presetPrograms";

import styles from "./ProgramControls.module.css";

interface Props {
  program: Program | undefined;
  updateProgram: (program: Program) => void;
}

export default function ProgramControls({ program, updateProgram }: Props) {
  const setPrimitives = useCallback(
    (primitives: Primitive[]) => {
      if (program === undefined) return;
      updateProgram({ ...program, primitives });
    },
    [program, updateProgram]
  );

  const resetProgram = useCallback(() => {
    if (program === undefined) return;
    updateProgram({ ...program, camera: DEFAULT_CAMERA });
  }, [program, updateProgram]);

  return (
    <div className={styles.controls}>
      <button
        className={styles.primary}
        onClick={() => setPrimitives(CORNELL_BOX_AREA_LIGHT)}
      >
        One Light
      </button>
      <button
        className={styles.primary}
        onClick={() => setPrimitives(CORNELL_BOX_THREE_POINT_LIGHTS)}
      >
        Three Lights
      </button>
      <button onClick={resetProgram}>Reset</button>
    </div>
  );
}
