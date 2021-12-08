import Page from "components/Page";

import ScrollIndicator from "./ScrollIndicator";

export default function ImplementationPage() {
  return (
    <Page>
      <h2>A Note about Implementation</h2>

      <p>
        If you don&apos;t know or don&apos;t care what rasterization is, you can
        safely skip this page. But it will hopefully be of interest to those
        curious about how this site works.
      </p>
      <p>
        This project is implemented in WebGL, which is wrapper around OpenGL,
        which is an interface that allows you to write code (called
        &ldquo;shaders&rdquo;) that is run on a GPU. OpenGL is written for{" "}
        <strong>rasterization</strong>, which is fundamentally different from
        ray tracing. How, then, can we do ray tracing? With carefully
        constructed shaders!
      </p>

      <p>
        There are two types of shaders: <strong>vertex</strong> shaders (called
        once per vertex of a 3D model) and <strong>fragment</strong> shaders
        (called once per pixel of the result image). The vertex shader for this
        program is very boring - it just passes the position along to the
        fragment shader. The fragment shader (which you can see the source code
        for{" "}
        <a
          href="https://github.com/a-churchill/webgl-path-tracing/blob/main/shaders/fragment-shader.glsl"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        ) is where all the action happens.
      </p>

      <p>
        All the communication between the browser and the shader is done by
        setting uniforms, which are global variables that can be referenced in
        the vertex shader.
      </p>

      <p>
        The rest of the site is built using React and Next.js, and hosted on
        Vercel.
      </p>

      <p>
        If any of this is interesting to you, I encourage you to check out the{" "}
        <a
          href="https://github.com/a-churchill/webgl-path-tracing"
          target="_blank"
          rel="noopener noreferrer"
        >
          source code
        </a>{" "}
        and see for yourself how it works!
      </p>

      <ScrollIndicator pageNumber={8} />
    </Page>
  );
}
