/**
 * Exam header displaying current phase, remaining countdown, and finish trigger
 * @param {{ submitted: boolean, formattedTime: string, onFinishTest: () => void }} props
 */
export function ExamHeader({ submitted, formattedTime, onFinishTest }) {
  return (
    <header className="exam-header">
      <h3>{submitted ? "Quiz complete" : "Multiple-choice quiz"}</h3>
      {!submitted && (
        <div className="exam-header-actions">
          <span>Time left: {formattedTime}</span>
          <button onClick={onFinishTest} className="end-test-btn">
            Finish quiz
          </button>
        </div>
      )}
    </header>
  );
}

export default ExamHeader;
