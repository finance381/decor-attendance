import { useState } from 'react';

export default function QuizView({ questions, onSubmit, lang }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    setSubmitted(true);
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_index) score++;
    });
    // Auto-proceed after 3 seconds
    setTimeout(() => onSubmit(answers, score), 3000);
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">{lang === 'hi' ? '📝 क्विज़' : '📝 Quiz'}</h2>

      {questions.map((q, qi) => (
        <div key={qi} className="quiz-question">
          <p className="quiz-q-text">
            <strong>Q{qi + 1}.</strong> {q.question}
          </p>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              let cls = 'quiz-option';
              if (answers[qi] === oi) cls += ' selected';
              if (submitted) {
                if (oi === q.correct_index) cls += ' correct';
                else if (answers[qi] === oi && oi !== q.correct_index) cls += ' wrong';
              }
              return (
                <button key={oi} className={cls} disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}>
                  <span className="quiz-option-marker">{submitted && oi === q.correct_index ? '✅' : submitted && answers[qi] === oi ? '❌' : '○'}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && answers[qi] !== q.correct_index && (
            <p className="quiz-wrong-msg">{lang === 'hi' ? '❌ गलत जवाब' : '❌ Wrong answer'}</p>
          )}
          {submitted && answers[qi] === q.correct_index && (
            <p className="quiz-correct-msg">{lang === 'hi' ? '✅ सही!' : '✅ Correct!'}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button className="auth-btn primary" disabled={!allAnswered} onClick={handleSubmit}>
          {lang === 'hi' ? '📤 जमा करें' : '📤 Submit'}
        </button>
      ) : (
        <p className="quiz-proceeding">{lang === 'hi' ? '⏳ पंच रिकॉर्ड हो रहा है...' : '⏳ Recording punch...'}</p>
      )}
    </div>
  );
}