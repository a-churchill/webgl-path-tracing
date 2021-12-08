import Page from "components/Page";

import styles from "./Content.module.css";
import ScrollIndicator from "./ScrollIndicator";

export default function RayTracingFeaturesPage() {
  return (
    <Page className={styles.primaryPage}>
      <h2>Features of Ray Tracing</h2>

      <p>Here is a more interesting scene. We have added a few things:</p>

      <ul>
        <li>
          Instead of one light, there are now three point lights in this scene
        </li>

        <li>
          There are two spheres in the scene - one diffuse, one reflective
        </li>
      </ul>

      <p>
        Notice that the spheres have shadows. Remember how we said that for each
        ray we cast into the scene, we then cast a ray to the light? We can
        safely ignore any light if we encounter a different object in the scene
        first - that&apos;s how we render shadows.
      </p>

      <p>
        We also have a reflective sphere! It turns out to be quite easy to
        render reflective materials with a ray tracer - instead of stopping the
        ray at the first place it hits, just reflect it and return that result
        instead!
      </p>

      <p>
        We can render even cooler scenes using our newfound ability to handle
        mirrors...
      </p>

      <ScrollIndicator pageNumber={3} />
    </Page>
  );
}
