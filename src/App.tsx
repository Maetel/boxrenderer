import { Canvas } from "@react-three/fiber";
import Renderer from "./Renderer";
import Requester from "./Requester";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useStats } from "./useStats";

function App() {
  // useStats();

  return (
    <main className="w-dvw h-dvh relative">
      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={(state) => {
          const camera = state.camera;
          camera.position.set(0, 100, 100);
          camera.lookAt(0, 0, 0);
        }}
      >
        <Renderer />
        <OrbitControls />
        <Perf position="bottom-left"></Perf>
      </Canvas>
      <Requester />
    </main>
  );
}

export default App;
