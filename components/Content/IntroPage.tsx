import Page from "components/Page";

import ScrollIndicator from "./ScrollIndicator";

export default function IntroPage() {
  return (
    <Page>
      <h2>Introduction to Ray Tracing</h2>

      <p>
        <strong>Ray tracing</strong> is an algorithm for rendering a digital
        scene. It is a fairly simple algorithm: for each pixel in the final
        image, shoot a ray from the camera, and render the color of the first
        object that ray hits.
      </p>

      <p>
        On the right, you can see a simple ray-traced scene. There are six
        walls, and a single point light in the middle of the &ldquo;room&rdquo;.
      </p>

      <p>
        For every pixel, the ray tracer casts a ray through the pixel, which
        hits one of the walls. Then, it casts a ray from that hit point to the
        light, to check how far away the light is from the hit point. Finally,
        it combines the color of the light with the color of the material at the
        hit point, making the color we see in the pixel.
      </p>

      <p>
        Try dragging the scene on the right around to interact with it! So far,
        it&apos;s not very interesting.
      </p>

      <ScrollIndicator pageNumber={2} />
    </Page>
  );
}
