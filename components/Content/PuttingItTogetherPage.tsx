import Page from "components/Page";

import styles from "./Content.module.css";
import ScrollIndicator from "./ScrollIndicator";

export default function PuttingItTogetherPage() {
  return (
    <Page className={styles.primaryPage}>
      <h2>Putting it All Together</h2>

      <p>
        Now we can put it all together: the ray tracing for direct illumination,
        and the path tracing for indirect illumination. What you see on the
        right is a pretty realistic scene.
      </p>

      <p>
        We&apos;ve come a long way since our simple ray tracer! But our result
        still is not perfect. For example, check out the glass ball on the
        right. It should be focusing the light onto the ground below it,
        creating a bright spot (known as a <strong>caustic</strong> in the
        industry). But the odds of the ray we shoot out from the ground hitting
        the light at the top of the room are quite slim - and so we just see a
        spot the same color as the rest of the ground. So while we&apos;ve got a
        lot more realistic already, perfect accuracy will take even more work.
      </p>

      <ScrollIndicator pageNumber={7} />
    </Page>
  );
}
