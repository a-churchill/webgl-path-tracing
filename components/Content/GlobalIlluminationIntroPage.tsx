import Page from "components/Page";

import styles from "./Content.module.css";
import ScrollIndicator from "./ScrollIndicator";

export default function GlobalIlluminationIntroPage() {
  return (
    <Page className={styles.primaryPage}>
      <h2>Introduction to Path Tracing</h2>

      <p>
        Let&apos;s go back to our simple scene, this time with an area light
        instead of a point light.
      </p>

      <p>
        The problem is that we only consider one path from our eye to the light
        for each pixel. But there are actually tons of paths (infinite, in
        fact)! In real life, our eye just sums these. But on a computer,
        it&apos;s not so easy.
      </p>

      <p>
        The solution? <strong>Monte Carlo path tracing</strong>. Instead of
        trying to sample every single path to the light, we will just sample one
        randomly. So for each ray we send from the camera, when it hits
        something in the scene we will then randomly shoot off another ray, to
        sample the <strong>incoming</strong> light at that point. Then we do it
        over and over again - the first frame will look like a mess, but when
        averaged out with dozens or hundreds of other frames, we&apos;ll start
        to get a much cleaner result.
      </p>

      <p>
        Basically, instead of only ever considering the <strong>local</strong>{" "}
        illumination at any given point, we will also consider the{" "}
        <strong>global</strong> illumination
      </p>

      <p>Let&apos;s see what this global illumination looks like...</p>
      <ScrollIndicator pageNumber={5} />
    </Page>
  );
}
