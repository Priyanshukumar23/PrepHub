import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Interview = () => {
  const [screen, setScreen] = useState('setup'); // 'setup', 'active', 'result'
  const [category, setCategory] = useState('Full Stack Development');
  const [level, setLevel] = useState('Basic');
  
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // null or object { isCorrect, feedback, idealAnswer }

  const difficultyProgression = {
    'Basic': 'Advance',
    'Advance': 'Hard',
    'Hard': 'Hard',
    'Frequently Asked': 'Hard'
  };

  const startInterview = async () => {
    setScreen('active');
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setPreviousQuestions([]);
    setFeedback(null);
    setAnswer('');
    await fetchNextQuestion('Basic');
  };

  const fetchNextQuestion = async (currentLvl) => {
    setLoading(true);
    setFeedback(null);
    setAnswer('');
    
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          level: currentLvl || level,
          previousQuestions
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCurrentQuestion(data.question);
    } catch (error) {
      alert("Error: " + error.message);
      console.error(error);
      setScreen('setup');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please type an answer first.");
      return;
    }

    setEvaluating(true);

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          question: currentQuestion,
          answer: answer.trim()
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setFeedback(data);
      
      let nextLevel = level;
      if (data.isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        if (difficultyProgression[level]) {
          nextLevel = difficultyProgression[level];
          setLevel(nextLevel);
        }
      }

      setPreviousQuestions(prev => [...prev, currentQuestion]);
      setQuestionsAnswered(prev => prev + 1);

    } catch (error) {
      alert("Error: " + error.message);
      console.error(error);
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = async () => {
    if (questionsAnswered >= 10) {
      setScreen('result');
    } else {
      await fetchNextQuestion(level);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/dashboard" className="nav-back" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i> Back to Dashboard
      </Link>

      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Mock Interview</h1>
        <p className="subtitle" style={{ color: 'var(--text-dim)' }}>Practice dynamically generated interview questions evaluated by AI.</p>
      </header>

      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2rem' }}>
        
        {screen === 'setup' && (
          <div className="setup-screen">
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>Select Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="DevOps">DevOps</option>
                <option value="Data Science">Data Science</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>Select Initial Difficulty</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}>
                <option value="Basic">Basic</option>
                <option value="Advance">Advance</option>
                <option value="Hard">Hard</option>
                <option value="Frequently Asked">Frequently Asked</option>
              </select>
            </div>
            <button className="btn-primary" onClick={startInterview} style={{ width: '100%', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Start Interview</button>
          </div>
        )}

        {screen === 'active' && (
          <div className="active-interview">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>Question <span>{questionsAnswered + 1}</span> / 10</div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', textTransform: 'capitalize' }}>{level}</div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p style={{ marginTop: '1rem' }}>Generating question...</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.3rem', lineHeight: 1.6, marginBottom: '2rem' }}>{currentQuestion}</div>
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={evaluating || feedback !== null}
                  placeholder="Type your answer here..."
                  style={{ width: '100%', minHeight: '150px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', padding: '1rem', fontSize: '1rem', fontFamily: "'Inter', sans-serif", resize: 'vertical', marginBottom: '1rem' }}
                />

                {!feedback && !evaluating && (
                  <button className="btn-primary" onClick={submitAnswer} style={{ width: '100%', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Submit Answer</button>
                )}

                {evaluating && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--primary)' }}>
                    <i className="fas fa-spinner fa-spin"></i> Evaluating your answer...
                  </div>
                )}

                {feedback && (
                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', borderLeft: `4px solid ${feedback.isCorrect ? '#22c55e' : '#ef4444'}` }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', color: feedback.isCorrect ? '#22c55e' : '#ef4444' }}>
                      <i className={`fas ${feedback.isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '0.5rem' }}></i>
                      {feedback.isCorrect ? 'Good Answer!' : 'Needs Improvement'}
                    </h3>
                    <p style={{ marginBottom: '1rem', lineHeight: 1.5 }}>{feedback.feedback}</p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--primary)' }}>Ideal Answer:</strong>
                      <p style={{ marginTop: '0.5rem', lineHeight: 1.5, color: 'var(--text-dim)' }}>{feedback.idealAnswer}</p>
                    </div>
                    <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }} onClick={nextQuestion}>
                      {questionsAnswered >= 10 ? 'See Final Results' : 'Next Question'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {screen === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <h2>Interview Complete!</h2>
            <div style={{ textAlign: 'center', fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', margin: '2rem 0' }}>
              <span>{correctAnswers}</span><span style={{ fontSize: '2rem', color: 'var(--text-dim)' }}> / 10</span>
            </div>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-light)' }}>Here is how you performed overall.</p>
            <button className="btn-primary" onClick={() => setScreen('setup')} style={{ padding: '1rem 2rem', fontWeight: 'bold' }}>Start New Interview</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
