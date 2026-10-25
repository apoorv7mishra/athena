import { EXAM_CONFIG } from "../constants/examConfig";

/**
 * Captures the current video frame onto an offscreen canvas and returns an ArrayBuffer
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<ArrayBuffer>}
 */
export async function captureVideoFrame(videoElement) {
  if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    throw new Error("Camera video is not ready yet.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not initialize 2D canvas context.");
  }

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (imageBlob) => {
        if (imageBlob) resolve(imageBlob);
        else reject(new Error("Could not capture an image blob from the camera."));
      },
      EXAM_CONFIG.IMAGE_MIME_TYPE,
      EXAM_CONFIG.IMAGE_QUALITY,
    );
  });

  return await blob.arrayBuffer();
}

/**
 * Captures frame from video and sends to Electron IPC save-photo
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<{ filePath: string, directory: string }>}
 */
export async function takeAndSaveSnapshot(videoElement) {
  if (typeof window.electronAPI?.savePhoto !== "function") {
    throw new Error("Electron savePhoto API is unavailable in this environment.");
  }

  const buffer = await captureVideoFrame(videoElement);
  return await window.electronAPI.savePhoto(buffer);
}
