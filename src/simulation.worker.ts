// simulation.worker.ts

// --- 데이터 구조 정의 ---

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 워커가 관리하는 각 박스의 전체 상태
 */
interface BoxState {
  // 메인 스레드로 전송될 데이터
  id: number;
  position: Vector3;
  dimensions: { w: number; h: number; l: number };
  rotationY: number;
  trajectory: Vector3[]; // 현재 주기의 누적 궤적

  // --- 워커 내부 시뮬레이션용 상태 ---
  step: number; // 현재 주기에서 몇 번째 프레임인지 (0 ~ 99)
  velocity: Vector3; // 프레임당 이동 속도
  initialPosition: Vector3; // 주기가 시작된 위치 (리셋용)
}

/**
 * 메인 스레드 -> 워커로 전달되는 메시지
 */
type WorkerCommand =
  | { type: "start"; n: number; fps: number }
  | { type: "stop" };

/**
 * 워커 -> 메인 스레드로 전달되는 메시지
 */
type WorkerMessage = {
  type: "frame";
  boxes: BoxState[]; // 가벼운 통신을 위해 BoxState에서 시뮬레이션용 내부 상태(step 등)를 제외하고 보낼 수도 있습니다.
};

// --- 워커 내부 변수 ---

let boxes: BoxState[] = [];
let intervalId: any = null; // NodeJS.Timeout 대신 'any' 또는 'number' 사용

// --- 헬퍼 함수 ---

/**
 * 최소-최대 범위 내 랜덤 숫자 생성
 */
const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/**
 * 새로운 박스를 생성하거나 기존 박스를 초기화합니다.
 */
function initializeBox(id: number): BoxState {
  const startPos: Vector3 = {
    x: rand(-50, 50),
    y: rand(0, 10),
    z: rand(-50, 50),
  };

  return {
    id,
    position: { ...startPos },
    dimensions: { w: rand(1, 5), h: rand(1, 5), l: rand(1, 5) },
    rotationY: rand(0, Math.PI * 2),
    trajectory: [startPos], // 궤적의 시작점
    step: 0,
    velocity: { x: rand(-0.1, 0.1), y: rand(-0.05, 0.05), z: rand(-0.1, 0.1) },
    initialPosition: startPos,
  };
}

/**
 * 단일 박스의 상태를 한 프레임 업데이트합니다.
 */
function updateBox(box: BoxState): BoxState {
  // 100번째 스텝(step 99)이 완료되면 초기화
  if (box.step >= 99) {
    return initializeBox(box.id);
  }

  // 위치 업데이트
  const newPos: Vector3 = {
    x: box.position.x + box.velocity.x,
    y: box.position.y + box.velocity.y,
    z: box.position.z + box.velocity.z,
  };

  return {
    ...box,
    position: newPos,
    rotationY: box.rotationY + 0.01, // 매 프레임 살짝 회전
    // trajectory: [...box.trajectory, newPos], // 궤적에 현재 위치 추가
    step: box.step + 1,
  };
}

/**
 * 전체 시뮬레이션 프레임을 실행하고 메인 스레드로 데이터를 전송합니다.
 */
function runSimulationFrame() {
  if (boxes.length === 0) return;

  // 모든 박스 상태 업데이트
  boxes = boxes.map(updateBox);

  // 메인 스레드로 현재 프레임 데이터 전송
  // 참고: 'boxes' 객체를 그대로 전송합니다 (구조화된 복제)
  const message: WorkerMessage = {
    type: "frame",
    boxes: boxes,
  };
  postMessage(message);
}

// --- 메인 스레드로부터 메시지 수신 ---

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const { type } = e.data;

  if (type === "start") {
    const { n, fps } = e.data;

    // 기존 시뮬레이션 중지
    if (intervalId) {
      clearInterval(intervalId);
    }

    console.log(`[Worker] 시뮬레이션 시작. N=${n}, FPS=${fps}`);

    // N개의 박스 초기화
    boxes = Array.from({ length: n }, (_, i) => initializeBox(i));

    // FPS에 맞춰 시뮬레이션 루프 시작
    const intervalMs = 1000 / fps;
    intervalId = setInterval(runSimulationFrame, intervalMs);
  } else if (type === "stop") {
    console.log("[Worker] 시뮬레이션 중지.");
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    boxes = []; // 상태 초기화
  }
};
