import Toggle from "components/Toggle";
import { useCallback } from "react";
import { Primitive } from "types/Primitive";
import { Program, ProgramOptions } from "types/Program";
import {
  CORNELL_BOX_AREA_LIGHT,
  CORNELL_BOX_AREA_LIGHT_REFLECTIVE,
  CORNELL_BOX_THREE_POINT_LIGHTS,
} from "utils/presetPrograms";

import styles from "./ProgramControls.module.css";

interface Props {
  program: Program | undefined;
  setProgram: React.Dispatch<React.SetStateAction<Program | undefined>>;
}

export default function ProgramControls({ program, setProgram }: Props) {
  const setOptions = useCallback(
    (options: ProgramOptions) => {
      setProgram((program) =>
        program === undefined ? program : { ...program, options }
      );
    },
    [setProgram]
  );
  const setPrimitives = useCallback(
    (primitives: Primitive[]) => {
      setProgram((program) =>
        program === undefined ? program : { ...program, primitives }
      );
    },
    [setProgram]
  );

  return (
    <div className={styles.controls}>
      <div className={styles.row}>
        <button
          className={styles.primary}
          onClick={() => setPrimitives(CORNELL_BOX_AREA_LIGHT)}
        >
          One Light
        </button>
        <button
          className={styles.primary}
          onClick={() => setPrimitives(CORNELL_BOX_AREA_LIGHT_REFLECTIVE)}
        >
          Reflective Walls
        </button>
        <button
          className={styles.primary}
          onClick={() => setPrimitives(CORNELL_BOX_THREE_POINT_LIGHTS)}
        >
          Three Lights
        </button>
      </div>

      <div className={styles.row}>
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
    </div>
  );
}
