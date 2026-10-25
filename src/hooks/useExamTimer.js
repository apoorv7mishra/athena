import { useState, useEffect, useCallback } from "react";
import { formatTimeLeft } from "../utils/timeFormatter";

/**
 * Custom React hook for exam countdown and synchronization with Electron main process
 * @param {boolean} isStarted - Whether exam has officially begun
 * @param {() => void} [onTimeExpired] - Optional callback when time runs out
 */
export function useExamTimer(isStarted, onTimeExpired) {
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);

  const syncRemainingTime = useCallback(async () => {
    if (typeof window.electronAPI?.getRemainingTime !== "function") return;
    try {
      const remaining = await window.electronAPI.getRemainingTime();
      setTimeRemainingMs(remaining);

      if (remaining <= 0 && isStarted && typeof onTimeExpired === "function") {
        onTimeExpired();
      }
    } catch (err) {
      console.error("Failed to sync remaining exam time:", err);
    }
  }, [isStarted, onTimeExpired]);

  useEffect(() => {
    if (!isStarted) return;

    // Initial sync
    syncRemainingTime();

    // 1-second interval
    const interval = setInterval(syncRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [isStarted, syncRemainingTime]);

  return {
    timeRemainingMs,
    formattedTime: formatTimeLeft(timeRemainingMs),
    syncRemainingTime,
  };
}
