// Renderer.tsx

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  BoxGeometry,
  Vector3,
  Quaternion,
  Euler,
} from "three";
import { useBox } from "./store";
import { MAX_BOXES } from "./constants";

const useTempObjects = () => {
  return useMemo(() => {
    return {
      matrix: new Matrix4(),
      position: new Vector3(),
      scale: new Vector3(),
      quaternion: new Quaternion(),
      euler: new Euler(),
    };
  }, []);
};

function Renderer() {
  const { boxes } = useBox();
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.5,
      }),
    []
  );
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);

  const temp = useTempObjects();

  useFrame(() => {
    if (!instancedMeshRef.current) return;

    instancedMeshRef.current.count = boxes.length;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];

      // 1. 위치 설정
      temp.position.set(box.position.x, box.position.y, box.position.z);

      // 2. 회전 설정 (Y축)
      temp.euler.set(0, box.rotationY, 0);
      temp.quaternion.setFromEuler(temp.euler);

      // 3. 크기 설정
      temp.scale.set(box.dimensions.w, box.dimensions.h, box.dimensions.l);

      // 4. 위치, 회전, 크기를 하나의 매트릭스로 조합
      temp.matrix.compose(temp.position, temp.quaternion, temp.scale);

      // InstancedMesh의 인스턴스 매트릭스 업데이트
      instancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef}
        args={[geometry, material, MAX_BOXES]}
      />
    </>
  );
}

export default Renderer;
