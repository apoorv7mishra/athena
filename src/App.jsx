import { useEffect, useRef, useState } from "react";
import "./App.css";
import { defaultQuestions as questions } from "./data/questions";
import { formatTimeLeft } from "./utils/timeFormatter";


function App() {
  const videoRef = useRef(null);

  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [captureMessage, setCaptureMessage] = useState("");
  const [captureDirectory, setCaptureDirectory] = useState("");
  const [cameraPermissionBlocked, setCameraPermissionBlocked] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!helpOpen) return;

    function closeOnEscape(event) {
      if (event.key === "Escape") setHelpOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [helpOpen]);

  async function getElapsedTime() {
    const currTime = await window.electronAPI.getRemainingTime();
    setTime(currTime);
  }

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(getElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [started]);

  async function getCamera() {
    let videoData;
    try {
      setCameraPermissionBlocked(false);
      const permission = await window.electronAPI.requestCameraAccess();
      if (!permission.granted) {
        setCameraPermissionBlocked(true);
        throw new Error(
          `macOS camera access is ${permission.status}. Enable camera access for Electron in System Settings > Privacy & Security > Camera, then try again.`,
        );
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not available in this app environment.");
      }

      videoData = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (!videoRef.current) {
        throw new Error("Camera preview is not ready.");
      }

      videoRef.current.srcObject = videoData;
      await videoRef.current.play();

      setCameraReady(true);
      setCaptureMessage("");
    } catch (error) {
      videoData?.getTracks().forEach((track) => track.stop());
      setCaptureMessage(`Could not access the camera: ${error.message}`);
    }
  }

  async function openCameraSettings() {
    if (typeof window.electronAPI?.openCameraSettings !== "function") {
      setCaptureMessage(
        "This app window was opened with an older Electron preload. Quit the app completely with Cmd+Q, then start it again with npm start.",
      );
      return;
    }

    try {
      await window.electronAPI.openCameraSettings();
    } catch (error) {
      setCaptureMessage(`Could not open camera settings: ${error.message}`);
    }
  }

  async function clickPhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      throw new Error("Camera video is not ready yet.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create an image from the camera.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (imageBlob) => {
          if (imageBlob) resolve(imageBlob);
          else reject(new Error("Could not capture an image from the camera."));
        },
        "image/jpeg",
        0.9,
      );
    });
    const buffer = await blob.arrayBuffer();
    const savedPhoto = await window.electronAPI.savePhoto(buffer);
    setCaptureDirectory(savedPhoto.directory);
    setCaptureMessage(`Latest camera snapshot saved at ${savedPhoto.filePath}`);
  }

  useEffect(() => {
    if (!started || !cameraReady) return;

    let timeoutId;
    let cancelled = false;
    const capture = async () => {
      try {
        await clickPhoto();
      } catch (error) {
        if (!cancelled) {
          setCaptureMessage(`Could not save camera snapshot: ${error.message}`);
        }
      }
      if (!cancelled) timeoutId = setTimeout(capture, 4000);
    };
    timeoutId = setTimeout(capture, 4000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [started, cameraReady]);

  useEffect(
    () => () => {
      videoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  function stopCamera() {
    videoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  }

  async function getFullscreen() {
    await window.electronAPI.setFullScreen();
  }

  async function startTest() {
    const accepted = await window.electronAPI.showExamRules();
    if (accepted !== 1) return;

    setQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    await window.electronAPI.startTest();
    await getElapsedTime();
    setStarted(true);
  }




  function selectAnswer(answer) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answer,
    }));
  }

  function finishTest() {
    setSubmitted(true);
    setStarted(false);
    stopCamera();
  }

  if (started || submitted) {
    const question = questions[questionIndex];
    const answeredCount = Object.keys(answers).length;
    const score = questions.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0,
    );

    return (
      <main className="exam-page">
        <div className="exam-container">
          <header className="exam-header">
            <h3>{submitted ? "Quiz complete" : "Multiple-choice quiz"}</h3>
            {!submitted && (
              <div className="exam-header-actions">
                <span>Time left: {formatTimeLeft(time)}</span>
                <button onClick={finishTest} className="end-test-btn">
                  Finish quiz
                </button>
              </div>
            )}
          </header>

          {submitted ? (
            <section className="question-card result-card">
              <h2>Your result</h2>
              <p>
                You scored {score} out of {questions.length}.
              </p>
              <button
                className="end-test-btn"
                onClick={() => {
                  setSubmitted(false);
                  setStarted(false);
                }}
              >
                Back to setup
              </button>
            </section>
          ) : (
            <>
              <nav className="question-tracker" aria-label="Question navigation">
                <div className="question-tracker-heading">
                  <span>Questions</span>
                  <span>
                    {answeredCount} of {questions.length} answered
                  </span>
                </div>
                <progress
                  className="answer-progress"
                  value={answeredCount}
                  max={questions.length}
                  aria-label={`${answeredCount} of ${questions.length} questions answered`}
                />
                <div className="question-jump-list">
                  {questions.map((item, index) => (
                    <button
                      className={`question-jump${
                        index === questionIndex ? " is-current" : ""
                      }${answers[index] ? " is-answered" : ""}`}
                      key={item.prompt}
                      onClick={() => setQuestionIndex(index)}
                      aria-label={`Go to question ${index + 1}${
                        answers[index] ? ", answered" : ", unanswered"
                      }`}
                      aria-current={index === questionIndex ? "step" : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </nav>

              <section className="question-card">
                <h2>
                  Question {questionIndex + 1} of {questions.length}
                </h2>
                <p>{question.prompt}</p>
                <div role="radiogroup" aria-label={question.prompt}>
                  {question.options.map((option) => (
                    <label className="option-row" key={option}>
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        checked={answers[questionIndex] === option}
                        onChange={() => selectAnswer(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <div className="navigation-buttons">
                  <button
                    onClick={() => setQuestionIndex((index) => index - 1)}
                    disabled={questionIndex === 0}
                  >
                    Previous
                  </button>
                  {questionIndex === questions.length - 1 ? (
                    <button onClick={finishTest}>Submit answers</button>
                  ) : (
                    <button onClick={() => setQuestionIndex((index) => index + 1)}>
                      Next
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
          {captureMessage && <p className="capture-status">{captureMessage}</p>}
          {captureDirectory && (
            <p className="capture-status">
              Camera snapshots are saved locally every 4 seconds in:{" "}
              {captureDirectory}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        className={cameraReady && !started ? "video-preview" : "hidden-video"}
      />

      <div className="page-container">
        <div className="header-section">
          <h1>Hi User!</h1>
          <p>Kindly Allow the following Permissions to Start the test:</p>
        </div>

        <div className="card-container">
          <div className="permission-item">
            <div className="permission-icon">↗</div>
            <div className="permission-content">
              <h3>Configure Camera</h3>
              <p>
                Camera snapshots will be saved locally every 4 seconds while
                the quiz is active.
              </p>
              <div className="action-row">
                <button onClick={getCamera} className="btn btn-dark">
                  Get Camera Access
                </button>
                {cameraPermissionBlocked && (
                  <button
                    onClick={openCameraSettings}
                    className="btn btn-outline"
                  >
                    Open Camera Settings
                  </button>
                )}
              </div>
              {cameraReady && <div className="camera-space" />}
            </div>
          </div>

          <div className="divider" />

          {/* Fullscreen */}

          <div className="permission-item">
            <div className="permission-icon">⛶</div>

            <div className="permission-content">
              <h3>Switch to full screen</h3>

              <p>Kindly close all tabs and switch to full screen.</p>

              <button onClick={getFullscreen} className="btn btn-light-blue">
                Give Full Screen Permissions
              </button>
            </div>
          </div>
        </div>

        <div className="bottom-actions">
          <button
            onClick={startTest}
            className="btn btn-light-blue"
            disabled={!cameraReady}
          >
            Go To Test
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setHelpOpen(true)}
          >
            Need Help?
          </button>
        </div>
        {helpOpen && (
          <div className="help-backdrop" onClick={() => setHelpOpen(false)}>
            <section
              className="help-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="help-close"
                onClick={() => setHelpOpen(false)}
                aria-label="Close help"
              >
                ×
              </button>
              <h2 id="help-title">Before you start</h2>
              <p>
                Allow camera access, then choose <strong>Go To Test</strong>.
                Your camera snapshots are saved on this computer while the quiz
                is active.
              </p>
              <p>
                If camera access is blocked, open your system privacy settings
                and allow access for Athena. You can move between questions and
                change an answer before submitting.
              </p>
              <button
                className="end-test-btn"
                onClick={() => setHelpOpen(false)}
              >
                Got it
              </button>
            </section>
          </div>
        )}
        {captureDirectory && (
          <p className="capture-status">Snapshots folder: {captureDirectory}</p>
        )}
        {captureMessage && <p className="capture-status">{captureMessage}</p>}
      </div>
    </>
  );
}

export default App;
