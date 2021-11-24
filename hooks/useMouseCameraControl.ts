import { mat4, vec3, vec4 } from "gl-matrix";
import React, { useCallback, useRef } from "react";
import { applyTransformationToCamera, Camera } from "types/Camera";
import { Program } from "types/Program";
import { CAMERA_DISTANCE } from "utils/constants";

type MouseEventName = "onMouseDown" | "onMouseMove";

export default function useMouseCameraControl(
  program: Program | undefined,
  updateProgram: (program: Program) => void
): Record<MouseEventName, (e: React.MouseEvent) => void> {
  /** Position the user last put their mouse down */
  const lastMousePos = useRef<{
    x: number;
    y: number;
    camera: Camera | undefined;
  }>({
    x: 0,
    y: 0,
    camera: undefined,
  });
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      lastMousePos.current = {
        x: e.clientX,
        y: e.clientY,
        camera: program?.camera,
      };
    },
    [program]
  );

  // credit to https://stackoverflow.com/a/8427966/4932372 for inspiration on
  // this implementation
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const initialCamera = lastMousePos.current.camera;
      if (program === undefined || initialCamera === undefined) return; // webgl not initialized
      if (e.buttons === 0) return; // mouse not clicked
      const theta = -(e.clientX - lastMousePos.current.x) / 100;
      const phi = -(e.clientY - lastMousePos.current.y) / 100;

      // start with identity
      const transformation = mat4.create();

      // apply rotation from mouse movement
      mat4.rotateY(transformation, transformation, theta);
      mat4.rotateX(transformation, transformation, phi);

      updateProgram({
        ...program,
        camera: applyTransformationToCamera(initialCamera, transformation),
      });
    },
    [program, updateProgram]
  );

  return {
    onMouseDown,
    onMouseMove,
  };
}
