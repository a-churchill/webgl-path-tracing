import { useCallback } from "react";
import { DEFAULT_CAMERA } from "types/Camera";
import { Program } from "types/Program";

import styles from "./ProgramControls.module.css";

interface Props {
  program: Program | undefined;
  updateProgram: (program: Program) => void;
}

export default function ProgramControls({ program, updateProgram }: Props) {
  const resetProgram = useCallback(() => {
    if (program === undefined) return;
    updateProgram({ ...program, camera: DEFAULT_CAMERA });
  }, [program, updateProgram]);

  return (
    <div className={styles.controls}>
      <button onClick={resetProgram}>Reset</button>
    </div>
  );
}
