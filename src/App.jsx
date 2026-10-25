import { useState, useCallback } from "react";
import "./App.css";
import { defaultQuestions as questions } from "./data/questions";
import { useExamTimer } from "./hooks/useExamTimer";
import { useProctorCamera } from "./hooks/useProctorCamera";
import { HelpDialog } from "./components/Modals/HelpDialog";
import { ConfirmSubmitDialog } from "./components/Modals/ConfirmSubmitDialog";
import { PermissionScreen } from "./components/Setup/PermissionScreen";
import { ExamHeader } from "./components/Exam/ExamHeader";
import { QuestionTracker } from "./components/Exam/QuestionTracker";
import { QuestionCard } from "./components/Exam/QuestionCard";
import { ExamResult } from "./components/Exam/ExamResult";

function App() {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);



  // Custom Camera Proctor Hook
  const {
    videoRef,
    cameraReady,
    cameraPermissionBlocked,
    captureMessage,
    captureDirectory,
    requestCamera,
    openCameraSettings,
    stopCamera,
  } = useProctorCamera(started && !submitted);

  // Time-up handler
  const handleTimeExpired = useCallback(() => {
    setSubmitted(true);
    setStarted(false);
    stopCamera();
  }, [stopCamera]);

  // Custom Exam Timer Hook
  const { formattedTime, syncRemainingTime } = useExamTimer(
    started && !submitted,
    handleTimeExpired,
  );

  async function getFullscreen() {
    if (typeof window.electronAPI?.setFullScreen === "function") {
      await window.electronAPI.setFullScreen();
    }
  }

  async function startTest() {
    if (typeof window.electronAPI?.showExamRules === "function") {
      const accepted = await window.electronAPI.showExamRules();
      if (accepted !== 1) return;
    }

    setQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);

    if (typeof window.electronAPI?.startTest === "function") {
      await window.electronAPI.startTest();
    }
    await syncRemainingTime();
    setStarted(true);
  }

  function selectAnswer(answer) {
    setAnswers((current) => ({
      ...current,
      [questionIndex]: answer,
    }));
  }

  function finishTest() {
    setConfirmSubmitOpen(true);
  }

  function handleConfirmSubmit() {
    setConfirmSubmitOpen(false);
    setSubmitted(true);
    setStarted(false);
    stopCamera();
  }

  function toggleFlagQuestion(index) {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  function handleRestart() {

    setSubmitted(false);
    setStarted(false);
    setQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions({});
    setConfirmSubmitOpen(false);
  }

  // Active or Completed Exam View
  if (started || submitted) {
    const question = questions[questionIndex];
    const score = questions.reduce(
      (total, item, idx) => total + (answers[idx] === item.answer ? 1 : 0),
      0,
    );

    return (
      <main className="exam-page">
        <div className="exam-container">
          <ExamHeader
            submitted={submitted}
            formattedTime={formattedTime}
            onFinishTest={finishTest}
          />

          {submitted ? (
            <ExamResult
              score={score}
              totalQuestions={questions.length}
              onRestart={handleRestart}
            />
          ) : (
            <>
              <QuestionTracker
                questions={questions}
                currentIndex={questionIndex}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                onSelectIndex={setQuestionIndex}
              />

              <QuestionCard
                question={question}
                questionIndex={questionIndex}
                totalQuestions={questions.length}
                selectedAnswer={answers[questionIndex]}
                isFlagged={Boolean(flaggedQuestions[questionIndex])}
                onToggleFlag={() => toggleFlagQuestion(questionIndex)}
                onSelectAnswer={selectAnswer}
                onPrevious={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                onNext={() =>
                  setQuestionIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                onFinishTest={finishTest}
              />
            </>
          )}

          <ConfirmSubmitDialog
            isOpen={confirmSubmitOpen}
            answeredCount={Object.keys(answers).length}
            totalQuestions={questions.length}
            onConfirm={handleConfirmSubmit}
            onCancel={() => setConfirmSubmitOpen(false)}
          />

          {captureMessage && <p className="capture-status">{captureMessage}</p>}

          {captureDirectory && (
            <p className="capture-status">
              Camera snapshots are saved locally every 4 seconds in: {captureDirectory}
            </p>
          )}
        </div>
      </main>
    );
  }

  // Setup / Permissions Screen
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cameraReady && !started ? "video-preview" : "hidden-video"}
      />

      <PermissionScreen
        onStartTest={startTest}
        onOpenHelp={() => setHelpOpen(true)}
        cameraReady={cameraReady}
        cameraPermissionBlocked={cameraPermissionBlocked}
        onRequestCamera={requestCamera}
        onOpenSettings={openCameraSettings}
        onFullscreen={getFullscreen}
        captureDirectory={captureDirectory}
        captureMessage={captureMessage}
      />

      <HelpDialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

export default App;
