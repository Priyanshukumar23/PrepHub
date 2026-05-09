import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';

const Solve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionId = parseInt(id);
  const question = questions.find(q => q.id === questionId);

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('<div style="color: var(--text-dim);">Ready to run...</div>');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    setUser(loggedInUser);

    if (question) {
      setCode(getTemplate(question, language));
    }
  }, [id, navigate, question]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    if (window.confirm('Changing language will reset your code. Continue?')) {
      setLanguage(newLang);
      setCode(getTemplate(question, newLang));
    } else {
      e.target.value = language;
    }
  };

  const getTemplate = (q, lang) => {
    let inputs = [];
    let returnType = lang === 'cpp' ? 'void' : 'void';
    let defaultReturn = '';

    if (q.examples && q.examples.length > 0) {
      const exInput = q.examples[0].input.trim();
      const exOutput = q.examples[0].output.trim();

      const getRetType = (val) => {
        if (val === 'true' || val === 'false') return { cpp: 'bool', java: 'boolean', val: 'false' };
        if (val.startsWith('"') || val.startsWith("'")) return { cpp: 'string', java: 'String', val: '""' };
        if (val.startsWith('[')) return { cpp: 'vector<int>', java: 'int[]', val: lang === 'cpp' ? '{}' : 'new int[]{}' };
        if (!isNaN(parseFloat(val))) return { cpp: 'int', java: 'int', val: '0' };
        return { cpp: 'void', java: 'void', val: '' };
      };

      const rInfo = getRetType(exOutput);
      returnType = lang === 'cpp' ? rInfo.cpp : rInfo.java;
      defaultReturn = rInfo.val;

      if (exInput.includes('], [')) {
        inputs.push(lang === 'cpp' ? 'vector<int>& nums1' : 'int[] nums1');
        inputs.push(lang === 'cpp' ? 'vector<int>& nums2' : 'int[] nums2');
      } else if (exInput.match(/], \\d+/)) {
        inputs.push(lang === 'cpp' ? 'vector<int>& nums' : 'int[] nums');
        inputs.push('int target');
      } else if (exInput.startsWith('[')) {
        inputs.push(lang === 'cpp' ? 'vector<int>& nums' : 'int[] nums');
      } else if (exInput.startsWith('"') || exInput.startsWith("'")) {
        if (exInput.includes(',')) {
          inputs.push(lang === 'cpp' ? 'string s' : 'String s');
          inputs.push(lang === 'cpp' ? 'string t' : 'String t');
        } else {
          inputs.push(lang === 'cpp' ? 'string s' : 'String s');
        }
      } else if (!isNaN(parseInt(exInput))) {
        inputs.push('int n');
      }
    }

    const params = inputs.join(', ');
    const returnStmt = defaultReturn ? `\n        return ${defaultReturn};` : '';

    if (lang === 'cpp') {
      return `class Solution {\npublic:\n    // Solve ${q.title}\n    ${returnType} solve(${params}) {\n        // Your code here${returnStmt}\n    }\n};`;
    } else {
      return `class Solution {\n    // Solve ${q.title}\n    public ${returnType} solve(${params}) {\n        // Your code here${returnStmt}\n    }\n}`;
    }
  };

  const handleRunCode = async () => {
    if (!question) return;

    setOutput('<div style="color: #fbbf24;">Evaluating code with Gemini AI...</div>');

    try {
      const response = await fetch('/api/evaluate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          language: language,
          question: question
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setOutput(`<div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Error:</div><div style="color: #ef4444;">${result.error || 'Failed to evaluate code.'}</div>`);
        return;
      }

      renderAIFeedback(result);
    } catch (error) {
      setOutput(`<div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Error:</div><div style="color: #ef4444;">Failed to connect to the server for evaluation.</div>`);
      console.error("Evaluation error:", error);
    }
  };

  const renderAIFeedback = (result) => {
    let outHtml = '<div style="margin-bottom: 0.5rem; color: #e2e8f0; font-weight: bold;">AI Evaluation Results:</div>';
    
    const statusColor = result.passed ? '#22c55e' : '#ef4444';
    const statusIcon = result.passed ? 'fa-check-circle' : 'fa-times-circle';
    const statusText = result.passed ? 'Passed' : 'Needs Improvement';

    outHtml += `
        <div style="display: flex; align-items: center; margin-bottom: 1rem; color: ${statusColor}; font-size: 1.2rem; font-weight: bold;">
            <i class="fas ${statusIcon}" style="margin-right: 0.5rem;"></i>
            ${statusText}
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid ${statusColor}; color: #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${result.feedback}</div>
    `;

    if (result.idealCode) {
      outHtml += `
          <div style="margin-top: 1rem;">
              <div style="color: #818cf8; font-weight: bold; margin-bottom: 0.5rem;">Optimal Code Solution:</div>
              <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px;">
                  <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;"><code style="color: #a8b2d1; font-family: monospace;">${result.idealCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
              </div>
          </div>
      `;
    }

    if (result.passed) {
      outHtml += `
          <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #22c55e; font-weight: bold;">Great Job! You can now move to the next question.</span>
              <a href="/practice" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: bold; text-decoration: none;">Back to Problems</a>
          </div>
      `;

      if (user) {
        let solved = JSON.parse(localStorage.getItem(`solvedQuestions_${user.email}`)) || [];
        if (!solved.includes(questionId)) {
          solved.push(questionId);
          localStorage.setItem(`solvedQuestions_${user.email}`, JSON.stringify(solved));
        }
      }
    }

    setOutput(outHtml);
  };

  if (!question) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <h2>Question not found</h2>
        <Link to="/practice" className="nav-back">Back to Problems</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1600px', padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/practice" className="nav-back" style={{ marginBottom: 0, textDecoration: 'none', color: 'var(--text-dim)' }}>
          <i className="fas fa-arrow-left"></i> Back to Questions
        </Link>
        <div style={{ color: 'var(--text-dim)' }}>
          Coding as {user ? user.name : 'Guest'}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '1.5rem',
        height: 'calc(100vh - 100px)',
        marginTop: '1rem'
      }}>
        {/* Problem Description */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '1rem',
          padding: '2rem',
          overflowY: 'auto',
          border: '1px solid var(--border-color)'
        }}>
          <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`} style={{
            padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', 
            background: question.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)' : question.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: question.difficulty === 'Easy' ? '#22c55e' : question.difficulty === 'Medium' ? '#eab308' : '#ef4444'
          }}>{question.difficulty}</span>
          
          <h1 style={{ margin: '1rem 0', fontSize: '1.8rem' }}>{question.id}. {question.title}</h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>{question.description}</p>
          
          <h3 style={{ marginBottom: '1rem' }}>Examples</h3>
          {question.examples && question.examples.map((ex, i) => (
            <div key={i} style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
              <h4 style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Example {i + 1}</h4>
              <div><strong>Input:</strong> {ex.input}</div>
              <div><strong>Output:</strong> {ex.output}</div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <select value={language} onChange={handleLanguageChange} style={{ padding: '0.5rem 1rem', background: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button className="btn-primary" onClick={handleRunCode} style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <i className="fas fa-play"></i> Run Code
            </button>
          </div>

          <div style={{ flex: 1, position: 'relative', background: '#1e1e1e', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <textarea 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              placeholder="// Write your code here..."
              style={{ width: '100%', height: '100%', background: 'transparent', color: '#d4d4d4', fontFamily: "'Fira Code', monospace", fontSize: '16px', padding: '1.5rem', resize: 'none', border: 'none', lineHeight: 1.6, outline: 'none', tabSize: 4 }}
            />
          </div>

          <div style={{ height: '250px', background: '#000', borderRadius: '0.5rem', padding: '1rem', fontFamily: "'Fira Code', monospace", fontSize: '13px', overflowY: 'auto', border: '1px solid var(--border-color)' }} dangerouslySetInnerHTML={{ __html: output }}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solve;
