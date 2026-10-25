/**
 * Result scorecard component displaying test completion metrics and reset action
 * @param {{
 *   score: number,
 *   totalQuestions: number,
 *   onRestart: () => void
 * }} props
 */
export function ExamResult({ score, totalQuestions, onRestart }) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassing = percentage >= 60;

  return (
    <section className="question-card result-card">
      <h2>Your result</h2>
      <p>
        You scored <strong>{score}</strong> out of <strong>{totalQuestions}</strong> ({percentage}%).
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "6px 14px",
          borderRadius: "var(--radius-full, 9999px)",
          marginBottom: "16px",
          fontSize: "14px",
          fontWeight: 600,
          backgroundColor: isPassing ? "#e8f5e9" : "#ffebee",
          color: isPassing ? "#2e7d32" : "#c62828",
        }}
      >
        {isPassing ? "Status: Passed" : "Status: Needs Improvement"}
      </div>

      <div>
        <button className="end-test-btn" onClick={onRestart}>
          Back to setup
        </button>
      </div>
    </section>
  );
}

export default ExamResult;
