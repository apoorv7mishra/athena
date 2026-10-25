/**
 * Centralized Configuration Constants for Athena Assessment System
 */

export const EXAM_CONFIG = {
  // Duration in milliseconds (default 60 minutes)
  DEFAULT_DURATION_MS: 60 * 60 * 1000,

  // Camera proctor snapshot capture frequency (ms)
  SNAPSHOT_INTERVAL_MS: 4000,

  // Image capture quality settings
  IMAGE_MIME_TYPE: "image/jpeg",
  IMAGE_QUALITY: 0.9,

  // Examination security rules displayed before start
  RULES: [
    "Do not open any new applications or tabs during the session.",
    "Suspicious activity or leaving kiosk mode may invalidate results.",
    "Camera snapshots will be captured every 4 seconds and stored locally for audit.",
    "All questions can be navigated freely before final submission.",
  ],

  // Storage directory identifier
  CAMERA_FEED_DIR_NAME: "cameraFeed",

  // Local storage keys
  STORAGE_KEYS: {
    EXAM_STATE: "athena_exam_state",
    ANSWERS: "athena_exam_answers",
  },
};
