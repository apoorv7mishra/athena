import { useEffect } from "react";

/**
 * Accessible Modal dialog for pre-exam instructions and troubleshooting guidance
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export function HelpDialog({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="help-backdrop" onClick={onClose} role="presentation">
      <section
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="help-close"
          onClick={onClose}
          aria-label="Close help modal"
        >
          ×
        </button>

        <h2 id="help-title">Before You Start</h2>

        <p>
          Allow camera access, then select <strong>Go To Test</strong>.
          Your camera snapshots will be securely saved locally while the quiz is active.
        </p>

        <p>
          If camera access is blocked, check your system privacy settings and allow access
          for Athena. You can freely navigate between questions and revise answers before
          submitting.
        </p>

        <button className="end-test-btn" onClick={onClose}>
          Got it
        </button>
      </section>
    </div>
  );
}

export default HelpDialog;
