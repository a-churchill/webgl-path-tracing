import { mat4, vec4 } from "gl-matrix";
import React, { useCallback, useRef } from "react";
import { CAMERA_DISTANCE } from "utils/constants";

type MouseEventName = "onMouseDown" | "onMouseMove";

export default function useMouseCameraControl(
  gl: React.MutableRefObject<WebGLRenderingContext | undefined>,
  viewMatrix: React.MutableRefObject<mat4>,
  render: () => void
): Record<MouseEventName, (e: React.MouseEvent) => void> {
  const lastMousePos = useRef<{ x: number; y: number; cameraMatrix: mat4 }>({
    x: 0,
    y: 0,
    cameraMatrix: viewMatrix.current,
  });
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      lastMousePos.current = {
        x: e.clientX,
        y: e.clientY,
        cameraMatrix: mat4.invert(mat4.create(), viewMatrix.current),
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
        lastMousePos.current.cameraMatrix
      );

      // start with rotation from last time
      const cameraMatrix = mat4.fromQuat(mat4.create(), rotation);

      // apply rotation from mouse movement
      mat4.rotateY(cameraMatrix, cameraMatrix, theta);
      mat4.rotateX(cameraMatrix, cameraMatrix, phi);

      // apply offset to move us away from square
      mat4.translate(cameraMatrix, cameraMatrix, [0, 0, CAMERA_DISTANCE]);

      // set view matrix to inverse of camera matrix
      mat4.invert(viewMatrix.current, cameraMatrix);

      requestAnimationFrame(render);
    },
    [gl, viewMatrix, render]
  );

  return {
    onMouseDown,
    onMouseMove,
  };
}
