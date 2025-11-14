// Requester.tsx (효율적인 버전)
import { useEffect, useRef, useState } from "react";
import type { BoxState } from "./types";
import { useBox } from "./store";
import { MAX_BOXES } from "./constants";

export interface WorkerMessage {
  type: "frame";
  boxes: BoxState[];
}

// --- 시뮬레이션 설정 ---
const NUMBER_OF_BOXES = 1000;
const FRAMES_PER_SECOND = 30;

const useParams = () => {
  const params = new URLSearchParams(window.location.search);
  const boxParam = params.get("box") || NUMBER_OF_BOXES;
  const fpsParam = params.get("fps") || FRAMES_PER_SECOND;

  return { box: Number(boxParam), fps: Number(fpsParam) };
};

function App() {
  const { box, fps } = useParams();
  const workerRef = useRef<Worker | null>(null);
  const [numberOfBoxes, setNumberOfBoxes] = useState(box);
  const [framesPerSecond, setFramesPerSecond] = useState(fps);

  // --- 💡 [수정] ---
  // 이펙트를 2개로 분리합니다.

  // 1. 마운트/언마운트 시 워커를 생성/제거하는 이펙트 (한 번만 실행)
  useEffect(() => {
    // 1. 워커 인스턴스 생성
    const worker = new Worker(
      new URL("./simulation.worker.ts", import.meta.url),
      {
        type: "module",
      }
    );
    workerRef.current = worker;

    // 2. 워커로부터 메시지 수신
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === "frame") {
        useBox.getState().setBoxes(e.data.boxes);
      }
    };

    // 3. 컴포넌트 언마운트 시 워커 정리
    return () => {
      console.log("컴포넌트 언마운트. 워커 정리");
      worker.postMessage({ type: "stop" });
      worker.terminate();
      workerRef.current = null;
      useBox.getState().setBoxes([]); // 언마운트 시에도 스토어 정리
    };
  }, []); // 의존성 배열이 비어있음

  // 2. 파라미터가 변경될 때마다 워커에 'start' 메시지를 보내는 이펙트
  useEffect(() => {
    if (workerRef.current) {
      // 새 시뮬레이션 시작 전,
      // '유령' 박스가 남지 않도록 스토어를 즉시 비웁니다.
      useBox.getState().setBoxes([]);

      // 3. 워커에 시뮬레이션 시작/재시작 명령 전송
      workerRef.current.postMessage({
        type: "start",
        n: numberOfBoxes,
        fps: framesPerSecond,
      });
    }
  }, [numberOfBoxes, framesPerSecond]); // 파라미터가 변경될 때마다 실행

  // --- ----------------- ---

  return (
    <section className="absolute right-0 top-0 p-4 space-y-4 bg-white/30 backdrop-blur-md flex flex-col gap-2">
      {/* ... (JSX는 동일) ... */}
      <div>
        <label className="block mb-1 font-medium">
          Number of Boxes: {numberOfBoxes}
        </label>
        <input
          type="range"
          min="100"
          max={MAX_BOXES}
          step="100"
          value={numberOfBoxes}
          onChange={(e) => setNumberOfBoxes(Number(e.target.value))}
          className="w-full"
        />
        <input
          type="number"
          min="100"
          max={MAX_BOXES}
          step="100"
          value={numberOfBoxes}
          onChange={(e) => setNumberOfBoxes(Number(e.target.value))}
          className="w-full mt-1 p-1 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">
          Frames Per Second: {framesPerSecond}
        </label>
        <input
          type="range"
          min="1"
          max="60"
          step="1"
          value={framesPerSecond}
          onChange={(e) => setFramesPerSecond(Number(e.target.value))}
          className="w-full"
        />
        <input
          type="number"
          min="1"
          max="60"
          step="1"
          value={framesPerSecond}
          onChange={(e) => setFramesPerSecond(Number(e.target.value))}
          className="w-full mt-1 p-1 border rounded"
        />
      </div>
    </section>
  );
}

export default App;
