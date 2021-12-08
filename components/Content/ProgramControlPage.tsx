import Page from "components/Page";
import ProgramControls from "components/ProgramControls";
import React from "react";
import { Program } from "types/Program";

import styles from "./Content.module.css";

interface Props {
  program: Program | undefined;
  setProgram: React.Dispatch<React.SetStateAction<Program | undefined>>;
}
export default function ProgramControlPage({ program, setProgram }: Props) {
  return (
    <Page className={styles.centerPage}>
      <h2>Try it Yourself</h2>

      <p>
        Have fun playing around with the path tracing! You can try out different
        scenes, or turn global and local illumination on/off.
      </p>

      <ProgramControls program={program} setProgram={setProgram} />
    </Page>
  );
}
