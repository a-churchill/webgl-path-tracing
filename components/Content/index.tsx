import Page from "components/Page";
import ProgramControls from "components/ProgramControls";
import { Program } from "types/Program";

import styles from "./Content.module.css";
interface Props {
  program: Program | undefined;
  setProgram: (program: Program | undefined) => void;
}

export default function Content(props: Props) {
  return (
    <div className={styles.content}>
      <Page className={styles.primaryPage}>
        <h1 className={styles.title}>Path Tracing</h1>

        <p className={styles.description}>
          Path tracing algorithm for global illumination implemented in WebGL.
        </p>
      </Page>

      <Page>
        <ProgramControls
          program={props.program}
          updateProgram={props.setProgram}
        />
      </Page>
    </div>
  );
}
