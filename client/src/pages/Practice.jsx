import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';

const Practice = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <Link to="/dashboard" className="nav-back" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i> Back to Dashboard
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Coding Practice</h1>
        <p className="subtitle" style={{ color: 'var(--text-dim)' }}>20 Essential coding challenges to sharpen your skills.</p>
      </header>

      <div className="content-wrapper" style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <ul className="question-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map(q => (
            <li key={q.id} className="question-item" style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="question-number" style={{ width: '30px', color: 'var(--text-dim)', fontWeight: 'bold' }}>{q.id}</span>
              <span className="question-text" style={{ flex: 1, fontWeight: '500' }}>{q.title}</span>
              <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`} style={{ marginLeft: 'auto', marginRight: '1rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', background: q.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)' : q.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: q.difficulty === 'Easy' ? '#22c55e' : q.difficulty === 'Medium' ? '#eab308' : '#ef4444' }}>
                {q.difficulty}
              </span>
              <Link to={`/solve/${q.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem' }}>
                <i className="fas fa-code"></i> Solve
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Practice;
