/**
 * Single question card with accessible radio selection and step navigation controls
 * @param {{
 *   question: { prompt: string, options: string[] },
 *   questionIndex: number,
 *   totalQuestions: number,
 *   selectedAnswer?: string,
 *   onSelectAnswer: (answer: string) => void,
 *   onPrevious: () => void,
 *   onNext: () => void,
 *   onFinishTest: () => void
 * }} props
 */
export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onPrevious,
  onNext,
  onFinishTest,
}) {
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === totalQuestions - 1;

  return (
    <section className="question-card">
      <h2>
        Question {questionIndex + 1} of {totalQuestions}
      </h2>
      <p>{question.prompt}</p>

      <div role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option) => (
          <label className="option-row" key={option}>
            <input
              type="radio"
              name={`question-${questionIndex}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onSelectAnswer(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <div className="navigation-buttons">
        <button onClick={onPrevious} disabled={isFirst}>
          Previous
        </button>
        {isLast ? (
          <button onClick={onFinishTest}>Submit answers</button>
        ) : (
          <button onClick={onNext}>Next</button>
        )}
      </div>
    </section>
  );
}

export default QuestionCard;
