import Page from "components/Page";

import ScrollIndicator from "./ScrollIndicator";

export default function RayTracingProblemsPage() {
  return (
    <Page>
      <h2>Limitations of Ray Tracing</h2>

      <p>
        Now this is cool! We replaced our four diffuse walls with mirrors, and
        now we see the power of the ray tracer at work.
      </p>
      <p>
        The reflection is not infinite - we need to cap the number of bounces,
        to avoid an infinite loop! On the right, we limit to 5 bounces.
      </p>

      <p>
        But as it turns out, our ray tracer is actually limited. The problem is
        simple: until now, we have been working with a{" "}
        <strong>backwards ray tracer</strong>. We&apos;re working backwards from
        how it works in reality!
      </p>

      <p>
        In the real world, light comes from a light source to our eye. But in
        our ray tracer, we trace a ray from our eye (the camera) to the light.
        But why is this a problem?
      </p>
      <ScrollIndicator pageNumber={4} />
    </Page>
  );
}
