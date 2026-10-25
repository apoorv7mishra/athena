import { useState, useEffect, useRef, useCallback } from "react";
import { EXAM_CONFIG } from "../constants/examConfig";
import { takeAndSaveSnapshot } from "../utils/cameraProctor";

/**
 * Custom hook to control camera permissions, preview, and periodic background snapshot proctoring
 * @param {boolean} isExamActive - True when student is taking the exam
 */
export function useProctorCamera(isExamActive) {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraPermissionBlocked, setCameraPermissionBlocked] = useState(false);
  const [captureMessage, setCaptureMessage] = useState("");
  const [captureDirectory, setCaptureDirectory] = useState("");

  const requestCamera = useCallback(async () => {
    let videoStream;
    try {
      setCameraPermissionBlocked(false);

      if (typeof window.electronAPI?.requestCameraAccess === "function") {
        const permission = await window.electronAPI.requestCameraAccess();
        if (!permission.granted) {
          setCameraPermissionBlocked(true);
          throw new Error(
            `macOS camera access is ${permission.status}. Enable camera access for Athena in System Settings > Privacy & Security > Camera.`,
          );
        }
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera hardware is not available in this environment.");
      }

      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (!videoRef.current) {
        throw new Error("Camera preview reference is not mounted.");
      }

      videoRef.current.srcObject = videoStream;
      await videoRef.current.play();

      setCameraReady(true);
      setCaptureMessage("");
    } catch (error) {
      videoStream?.getTracks().forEach((track) => track.stop());
      setCaptureMessage(`Could not access camera: ${error.message}`);
    }
  }, []);

  const openCameraSettings = useCallback(async () => {
    if (typeof window.electronAPI?.openCameraSettings !== "function") {
      setCaptureMessage(
        "Open System Preferences > Security & Privacy > Camera to enable permissions.",
      );
      return;
    }

    try {
      await window.electronAPI.openCameraSettings();
    } catch (err) {
      setCaptureMessage(`Failed to open camera settings: ${err.message}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  // Periodic Snapshot Proctoring
  useEffect(() => {
    if (!isExamActive || !cameraReady) return;

    let timeoutId;
    let isCancelled = false;

    const captureCycle = async () => {
      try {
        if (videoRef.current) {
          const savedPhoto = await takeAndSaveSnapshot(videoRef.current);
          if (!isCancelled) {
            setCaptureDirectory(savedPhoto.directory);
            setCaptureMessage(`Latest snapshot captured at ${savedPhoto.filePath}`);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setCaptureMessage(`Proctor capture notice: ${err.message}`);
        }
      }

      if (!isCancelled) {
        timeoutId = setTimeout(captureCycle, EXAM_CONFIG.SNAPSHOT_INTERVAL_MS);
      }
    };

    timeoutId = setTimeout(captureCycle, EXAM_CONFIG.SNAPSHOT_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isExamActive, cameraReady]);

  // Teardown tracks on unmount
  useEffect(() => {
    const activeVideo = videoRef.current;
    return () => {
      if (activeVideo?.srcObject) {
        activeVideo.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);


  return {
    videoRef,
    cameraReady,
    cameraPermissionBlocked,
    captureMessage,
    captureDirectory,
    requestCamera,
    openCameraSettings,
    stopCamera,
  };
}
