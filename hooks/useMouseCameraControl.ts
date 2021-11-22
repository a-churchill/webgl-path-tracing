import { mat4, ReadonlyVec3, vec3, vec4 } from "gl-matrix";
import React, { useCallback, useRef } from "react";
import { CAMERA_DISTANCE } from "utils/constants";

type MouseEventName = "onMouseDown" | "onMouseMove";

export default function useMouseCameraControl(
  gl: React.MutableRefObject<WebGLRenderingContext | undefined>,
  viewMatrix: React.MutableRefObject<mat4>,
  render: () => void
): Record<MouseEventName, (e: React.MouseEvent) => void> {
  const lastMousePos = useRef<{ x: number; y: number; viewMatrix: mat4 }>({
    x: 0,
    y: 0,
    viewMatrix: viewMatrix.current,
  });
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      lastMousePos.current = {
        x: e.clientX,
        y: e.clientY,
        viewMatrix: mat4.invert(mat4.create(), viewMatrix.current),
      };
    },
    [viewMatrix]
  );

  // credit to https://stackoverflow.com/a/8427966/4932372 for inspiration on
  // this implementation
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (gl.current === undefined) return; // webgl not initialized
      if (e.buttons === 0) return; // mouse not clicked
      const theta = -(e.clientX - lastMousePos.current.x) / 20;
      const phi = -(e.clientY - lastMousePos.current.y) / 100;

      const rotation = mat4.getRotation(
        vec4.create(),
        lastMousePos.current.viewMatrix
      );
      // start with rotation from last time
      mat4.fromQuat(viewMatrix.current, rotation);
      mat4.rotateY(viewMatrix.current, viewMatrix.current, theta);
      mat4.rotateX(viewMatrix.current, viewMatrix.current, phi);
      mat4.translate(viewMatrix.current, viewMatrix.current, [
        0,
        0,
        CAMERA_DISTANCE,
      ]);
      mat4.invert(viewMatrix.current, viewMatrix.current);
      // mat4.rotateY(viewMatrix.current, viewMatrix.current, theta);

      render();
      // requestAnimationFrame(render);
    },
    [gl, viewMatrix, render]
  );

  return {
    onMouseDown,
    onMouseMove,
  };
}
