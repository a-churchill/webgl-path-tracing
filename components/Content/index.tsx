import { useEffect, useRef } from "react";
import { Program } from "types/Program";
import { DEFAULT_PROGRAM } from "utils/defaults";
import {
  CORNELL_BOX_AREA_LIGHT,
  CORNELL_BOX_AREA_LIGHT_EMPTY,
  CORNELL_BOX_EMPTY,
  CORNELL_BOX_THREE_POINT_LIGHTS,
  CORNELL_BOX_THREE_POINT_LIGHTS_REFLECTIVE,
} from "utils/presetPrograms";

import styles from "./Content.module.css";
import GlobalIlluminationIntroPage from "./GlobalIlluminationIntroPage";
import GlobalIlluminationRevealPage from "./GlobalIlluminationRevealPage";
import ImplementationPage from "./ImplementationPage";
import IntroPage from "./IntroPage";
import ProgramControlPage from "./ProgramControlPage";
import PuttingItTogetherPage from "./PuttingItTogetherPage";
import RayTracingFeaturesPage from "./RayTracingFeaturesPage";
import RayTracingProblemsPage from "./RayTracingProblemsPage";
import TitlePage from "./TitlePage";

interface Props {
  program: Program | undefined;
  setProgram: React.Dispatch<React.SetStateAction<Program | undefined>>;
}
/** Gets current page (1-indexed) based on scroll position. */
function getPage() {
  return Math.floor(window.scrollY / window.innerHeight + 1 / 3) + 1;
}

export default function Content(props: Props) {
  const { program, setProgram } = props;
  const prevPageRef = useRef<number>(1);

  useEffect(() => {
    const listener = () => {
      const currentPage = getPage();
      if (currentPage !== prevPageRef.current) {
        switch (currentPage) {
          case 1:
            setProgram((program) =>
              program === undefined
                ? program
                : { ...program, ...DEFAULT_PROGRAM }
            );
            break;
          case 2:
            setProgram((program) =>
              program === undefined
                ? program
                : {
                    ...program,
                    ...DEFAULT_PROGRAM,
                    primitives: CORNELL_BOX_EMPTY,
                    options: {
                      directIllumination: true,
                      globalIllumination: false,
                    },
                  }
            );
            break;
          case 3:
            setProgram((program) =>
              program === undefined
                ? program
                : {
                    ...program,
                    ...DEFAULT_PROGRAM,
                    primitives: CORNELL_BOX_THREE_POINT_LIGHTS,
                    options: {
                      directIllumination: true,
                      globalIllumination: false,
                    },
                  }
            );
            break;
          case 4:
            setProgram((program) =>
              program === undefined
                ? program
                : {
                    ...program,
                    ...DEFAULT_PROGRAM,
                    primitives: CORNELL_BOX_THREE_POINT_LIGHTS_REFLECTIVE,
                    options: {
                      directIllumination: true,
                      globalIllumination: false,
                    },
                  }
            );
            break;
          case 5:
            setProgram((program) =>
              program === undefined
                ? program
                : {
                    ...program,
                    ...DEFAULT_PROGRAM,
                    primitives: CORNELL_BOX_AREA_LIGHT_EMPTY,
                    options: {
                      directIllumination: true,
                      globalIllumination: false,
                    },
                  }
            );
            break;
          case 6:
            setProgram((program) =>
              program === undefined
                ? program
                : {
                    ...program,
                    ...DEFAULT_PROGRAM,
                    primitives: CORNELL_BOX_AREA_LIGHT,
                    options: {
                      directIllumination: false,
                      globalIllumination: true,
                    },
                  }
            );
            break;
          case 7:
            setProgram((program) =>
              program === undefined
                ? program
                : {
                    ...program,
                    ...DEFAULT_PROGRAM,
                    primitives: CORNELL_BOX_AREA_LIGHT,
                    options: {
                      directIllumination: true,
                      globalIllumination: true,
                    },
                  }
            );
            break;
        }

        prevPageRef.current = currentPage;
      }
    };

    window.addEventListener("scroll", listener);

    return () => window.removeEventListener("scroll", listener);
  }, [setProgram]);
  return (
    <div className={styles.content}>
      <TitlePage />

      <IntroPage />

      <RayTracingFeaturesPage />

      <RayTracingProblemsPage />

      <GlobalIlluminationIntroPage />

      <GlobalIlluminationRevealPage />

      <PuttingItTogetherPage />

      <ImplementationPage />

      <ProgramControlPage program={program} setProgram={setProgram} />
    </div>
  );
}
