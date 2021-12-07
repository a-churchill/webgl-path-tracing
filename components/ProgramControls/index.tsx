import Toggle from "components/Toggle";
import { useCallback } from "react";
import { DEFAULT_CAMERA } from "types/Camera";
import { Primitive } from "types/Primitive";
import { Program, ProgramOptions } from "types/Program";
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
  const setOptions = useCallback(
    (options: ProgramOptions) => {
      if (program === undefined) return;
      updateProgram({ ...program, options });
    },
    [program, updateProgram]
  );
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
      <Toggle
        label={"Global Illumination"}
        description={"Sample global light at every pixel"}
        isChecked={program?.options.globalIllumination}
        onChange={() => {
          if (program === undefined) return;
          setOptions({
            ...program.options,
            globalIllumination: !program.options.globalIllumination,
          });
        }}
      />
      <Toggle
        label={"Direct Illumination"}
        description={"Trace rays directly from camera"}
        isChecked={program?.options.directIllumination}
        onChange={() => {
          if (program === undefined) return;
          setOptions({
            ...program.options,
            directIllumination: !program.options.directIllumination,
          });
        }}
      />
    </div>
  );
}
