import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';

const Practice = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const filteredQuestions = filter === 'All' 
    ? questions 
    : questions.filter(q => q.difficulty === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: '4rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Premium Top Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
        padding: '3rem 2rem 6rem 2rem', 
        borderBottomLeftRadius: '2.5rem', 
        borderBottomRightRadius: '2.5rem', 
        marginBottom: '-4rem', 
        boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.3), 0 10px 10px -5px rgba(79, 70, 229, 0.2)' 
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
            <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.03em', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            Coding Practice
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: '650px', lineHeight: 1.6 }}>
            Master data structures and algorithms with our curated list of {questions.length} essential challenges. Filter by difficulty, start coding, and ace your interviews.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        {/* Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2.5rem', 
          background: '#1e293b', 
          padding: '0.5rem', 
          borderRadius: '1rem', 
          width: 'max-content', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)', 
          border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          {['All', 'Easy', 'Medium', 'Hard'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: filter === cat ? '#4f46e5' : 'transparent',
                color: filter === cat ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '0.6rem 1.75rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: filter === cat ? '0 4px 6px -1px rgba(79, 70, 229, 0.4)' : 'none'
              }}
              onMouseOver={(e) => { if (filter !== cat) e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseOut={(e) => { if (filter !== cat) e.currentTarget.style.color = '#94a3b8'; }}
            >
              {cat === 'All' ? 'All Problems' : cat}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQuestions.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#1e293b', borderRadius: '1.25rem', border: '2px dashed #334155' }}>
               <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.3 }}></i>
               <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: '#94a3b8' }}>No questions found</h3>
               <p style={{ margin: 0 }}>Try changing your filter to see more problems.</p>
             </div>
          ) : (
            filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1.25rem 1.75rem', 
                  background: '#1e293b', 
                  borderRadius: '1.25rem', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)';
                  e.currentTarget.style.background = '#24324a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.background = '#1e293b';
                }}
              >
                {/* ID Badge */}
                <div style={{ 
                  width: '45px', 
                  height: '45px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#64748b', 
                  fontWeight: '700', 
                  marginRight: '1.5rem', 
                  fontSize: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {q.id}
                </div>
                
                {/* Title and Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.01em' }}>{q.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-book-open" style={{ marginRight: '0.3rem', fontSize: '0.8rem' }}></i> Algorithms
                    </span>
                  </div>
                </div>

                {/* Actions and Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <span style={{ 
                    padding: '0.4rem 1.2rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    background: q.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)' : q.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: q.difficulty === 'Easy' ? '#4ade80' : q.difficulty === 'Medium' ? '#facc15' : '#f87171',
                    border: `1px solid ${q.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' : q.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {q.difficulty}
                  </span>
                  
                  <Link 
                    to={`/solve/${q.id}`} 
                    style={{ 
                      padding: '0.7rem 1.5rem', 
                      fontSize: '0.95rem', 
                      fontWeight: 600,
                      textDecoration: 'none', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(79, 70, 229, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.3)';
                    }}
                  >
                    Solve <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem', marginLeft: '0.2rem' }}></i>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;
