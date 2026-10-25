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
  onSelectIndex,
}) {
  const answeredCount = Object.keys(answers).length;

  return (
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
        {questions.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = Boolean(answers[index]);

          return (
            <button
              key={item.id || item.prompt || index}
              className={`question-jump${isCurrent ? " is-current" : ""}${
                isAnswered ? " is-answered" : ""
              }`}
              onClick={() => onSelectIndex(index)}
              aria-label={`Go to question ${index + 1}${
                isAnswered ? ", answered" : ", unanswered"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default QuestionTracker;
