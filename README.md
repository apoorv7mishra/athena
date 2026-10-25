# Athena - Proctored Examination Desktop Application

Athena is a modern desktop assessment environment built with **React 19**, **Vite**, and **Electron**. It provides an automated proctoring workflow designed to ensure integrity during online assessments.

## Key Features

- **Pre-Exam Validation**: Verifies macOS/OS camera permissions before permitting test entry.
- **Kiosk Mode Lock**: Requests and enforces full-screen kiosk mode via Electron IPC to deter distraction and unauthorized tab switching.
- **Automated Snapshot Proctoring**: Captures high-resolution video frames via HTML5 Canvas every 4 seconds and persists them securely to the application's local user storage (`userData/cameraFeed`).
- **Real-Time Timed Exam**: Manages countdown timers synchronizing state between Electron main process and React front-end.
- **Interactive MCQ Engine**: Step-by-step question navigation, responsive jump list, question completion tracking, and instant score computation.
- **Accessible Help System**: Built-in modal dialog providing clear pre-test instructions and troubleshooting steps for system permissions.

## Architecture

```
├── electron/
│   ├── main.cjs       # Electron main process (IPC handlers, kiosk, camera permissions, file storage)
│   └── preload.cjs    # Context isolation bridge exposing electronAPI to renderer
├── src/
│   ├── components/    # Reusable modular UI components
│   ├── constants/     # Exam configuration constants
│   ├── data/          # Assessment question banks
│   ├── hooks/         # Custom React hooks (timer, proctor camera)
│   ├── utils/         # Formatting and proctoring helper functions
│   ├── App.jsx        # Root assessment orchestrator
│   ├── App.css        # Application layout styling
│   └── main.jsx       # React application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Development Mode

1. Start the Vite React development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, launch the Electron application:
   ```bash
   npm start
   ```

### Production Build

```bash
npm run build
```

## Electron IPC API

Athena exposes secure IPC methods via `window.electronAPI`:

| Method | Description |
|---|---|
| `requestCameraAccess()` | Queries and requests OS-level media access permissions |
| `openCameraSettings()` | Directs the user to system privacy settings (macOS) |
| `setFullScreen()` | Locks the Electron window into kiosk full-screen mode |
| `startTest()` | Initializes the assessment timer in the main process |
| `getRemainingTime()` | Returns remaining milliseconds until test completion |
| `showExamRules()` | Displays native modal dialog outlining examination rules |
| `savePhoto(buffer)` | Saves periodic camera snapshots to disk |

## License

Private & Confidential - All Rights Reserved.
