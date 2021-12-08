import Content from "components/Content";
import Footer from "components/Footer";
import type { NextPage } from "next";
import Head from "next/head";
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
        <div className={styles.content}>
          <Content program={program} setProgram={setProgram} />
          <Footer />
        </div>

        <div className={styles.canvas}>
          <Canvas program={program} setProgram={setProgram} />
        </div>
      </main>
    </div>
  );
};

export default Home;
