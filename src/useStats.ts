// hooks/useStats.js
import { useState, useEffect } from "react";
import Stats from "stats.js";

/**
 * mr. doob의 stats.js를 React 훅으로 관리합니다.
 * @param {number} showPanel 0: fps, 1: ms, 2: mb, 3+: custom
 * @returns {Stats} stats 인스턴스를 반환합니다.
 */
export const useStats = (showPanel = 0) => {
  // useState의 "lazy initial state" 기능을 사용해
  // Stats 인스턴스가 단 한 번만 생성되도록 합니다.
  const [stats] = useState(() => new Stats());

  useEffect(() => {
    // 표시할 패널을 설정합니다 (0: FPS, 1: MS, 2: MB)
    stats.showPanel(showPanel);

    // 스타일 설정 (보통 좌측 상단에 고정)
    stats.dom.style.position = "absolute";
    stats.dom.style.top = "0px";
    stats.dom.style.left = "0px";
    stats.dom.style.zIndex = "9999"; // 다른 요소에 가려지지 않도록

    // 컴포넌트 마운트 시 DOM에 추가
    document.body.appendChild(stats.dom);

    // 컴포넌트 언마운트 시 DOM에서 제거 (Cleanup)
    return () => {
      document.body.removeChild(stats.dom);
    };
  }, [stats, showPanel]); // showPanel이 변경되면 패널을 다시 설정

  // 훅은 생성된 stats 인스턴스를 반환합니다.
  return stats;
};
