/**
 * Question navigation and completion tracker with interactive jump list
 * @param {{
 *   questions: Array<{ prompt: string }>,
 *   currentIndex: number,
 *   answers: Record<number, string>,
 *   onSelectIndex: (index: number) => void
 * }} props
 */
export function QuestionTracker({
  questions,
  currentIndex,
  answers,
  flaggedQuestions = {},
  onSelectIndex,
}) {
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;


  return (
    <nav className="question-tracker" aria-label="Question navigation">
      <div className="question-tracker-heading">
        <span>Questions</span>
        <span>
          {answeredCount} of {questions.length} answered
          {flaggedCount > 0 && ` (${flaggedCount} flagged)`}
        </span>
      </div>

      <progress
        className="answer-progress"
        value={answeredCount}
        max={questions.length}
        aria-label={`${answeredCount} of ${questions.length} questions answered`}
      />

      <div className="question-jump-list">
        {questions.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = Boolean(answers[index]);
          const isFlagged = Boolean(flaggedQuestions[index]);

          return (
            <button
              key={item.id || item.prompt || index}
              className={`question-jump${isCurrent ? " is-current" : ""}${
                isAnswered ? " is-answered" : ""
              }${isFlagged ? " is-flagged" : ""}`}
              onClick={() => onSelectIndex(index)}
              aria-label={`Go to question ${index + 1}${
                isAnswered ? ", answered" : ", unanswered"
              }${isFlagged ? ", flagged for review" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {index + 1}
              {isFlagged && <span className="flag-indicator">⚑</span>}
            </button>
          );
        })}
      </div>

    </nav>
  );
}

export default QuestionTracker;
