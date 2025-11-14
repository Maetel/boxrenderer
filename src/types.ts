export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 워커가 관리하는 각 박스의 전체 상태
 */
export interface BoxState {
  // 메인 스레드로 전송될 데이터
  id: number;
  position: Vector3;
  dimensions: { w: number; h: number; l: number };
  rotationY: number;
  trajectory: Vector3[]; // 현재 주기의 누적 궤적

  // --- 워커 내부 시뮬레이션용 상태 ---
  // step: number; // 현재 주기에서 몇 번째 프레임인지 (0 ~ 99)
  // velocity: Vector3; // 프레임당 이동 속도
  // initialPosition: Vector3; // 주기가 시작된 위치 (리셋용)
}
