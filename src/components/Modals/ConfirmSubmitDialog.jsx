/**
 * Confirmation dialog before final exam submission
 * @param {{
 *   isOpen: boolean,
 *   answeredCount: number,
 *   totalQuestions: number,
 *   onConfirm: () => void,
 *   onCancel: () => void
 * }} props
 */
export function ConfirmSubmitDialog({
  isOpen,
  answeredCount,
  totalQuestions,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div className="help-backdrop" onClick={onCancel} role="presentation">
      <section
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-submit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="help-close"
          onClick={onCancel}
          aria-label="Cancel submission"
        >
          ×
        </button>

        <h2 id="confirm-submit-title">Submit Assessment?</h2>

        <p>
          You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
        </p>

        {unansweredCount > 0 ? (
          <p style={{ color: "#d32f2f", fontWeight: 500 }}>
            ⚠️ Notice: You still have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}.
          </p>
        ) : (
          <p style={{ color: "#2e7d32", fontWeight: 500 }}>
            ✓ All questions answered! You are ready to submit.
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button className="end-test-btn" onClick={onConfirm}>
            Yes, Submit Now
          </button>
          <button className="btn btn-outline" onClick={onCancel}>
            Continue Quiz
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmSubmitDialog;
