import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Program } from "types/Program";

import Canvas from "../components/Canvas";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [program, setProgram] = useState<Program | undefined>();

  return (
    <div className={styles.container}>
      <Head>
        <title>Path Tracing in WebGL</title>
        <meta
          name="description"
          content="Path tracing algorithm for global illumination implemented in WebGL"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Path Tracing</h1>

        <p className={styles.description}>
          Path tracing algorithm for global illumination implemented in WebGL.
        </p>

        <Canvas program={program} setProgram={setProgram} />
      </main>

      <footer className={styles.footer}>
        Created by{" "}
        <a
          href="https://achurchill.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className={styles.logo}
            src="/andrew-churchill.jpg"
            alt="Picture of author"
            width={24}
            height={24}
          />
        </a>
      </footer>
    </div>
  );
};

export default Home;
