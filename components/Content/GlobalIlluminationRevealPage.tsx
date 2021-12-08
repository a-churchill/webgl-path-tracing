import Page from "components/Page";

import ScrollIndicator from "./ScrollIndicator";

export default function GlobalIlluminationRevealPage() {
  return (
    <Page>
      <h2>Global Illumination</h2>

      <p>
        On the right, you can see the global illumination in the scene.
        We&apos;ve also added the balls from the original scene back.
      </p>

      <p>
        The first thing you may notice is how noisy the scene is. It will smooth
        out over time, but then if you drag the scene it goes right back to
        being noisy!
      </p>

      <p>
        This is because of the <strong>randomness</strong> inherent to Monte
        Carlo path tracing. The entire idea is to get a lot of quick and dirty
        results, and average them together to get a slow and clean result.
      </p>

      <p>
        Why does the scene get so noisy every time you drag it? Because we need
        to start computing the global illumination again from scratch -
        there&apos;s no way of using the global illumination from one scene in
        another one.
      </p>

      <p>
        Notice how the global illumination takes light bouncing into account. If
        you reset the camera (by clicking the Reset button below the scene), the
        top left part of the ceiling has a red tint, and the top right has a
        blue tint. You can scroll back up to convince yourself that the ray
        tracer does not have this same property!
      </p>
      <ScrollIndicator pageNumber={6} />
    </Page>
  );
}
