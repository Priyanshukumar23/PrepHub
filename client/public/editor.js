// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userInfo').textContent = `Coding as ${user.name}`;

    // Load Question
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = parseInt(urlParams.get('id'));
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        document.getElementById('problemPanel').innerHTML = '<h2>Question not found</h2>';
        return;
    }

    renderProblem(question);
    setupEditor(question);
});

// Render Problem Details
function renderProblem(question) {
    const panel = document.getElementById('problemPanel');

    let examplesHtml = '';
    if (question.examples) {
        examplesHtml = question.examples.map((ex, i) => `
            <div class="test-case">
                <h4>Example ${i + 1}</h4>
                <div><strong>Input:</strong> ${ex.input}</div>
                <div><strong>Output:</strong> ${ex.output}</div>
            </div>
        `).join('');
    }

    panel.innerHTML = `
        <span class="difficulty-badge ${question.difficulty.toLowerCase()}">${question.difficulty}</span>
        <h1 style="margin: 1rem 0; font-size: 1.8rem;">${question.id}. ${question.title}</h1>
        <p style="color: var(--text-dim); margin-bottom: 2rem;">${question.description}</p>
        
        <h3 style="margin-bottom: 1rem;">Examples</h3>
        ${examplesHtml}
    `;
}

// Setup Editor Defaults
// Setup Editor with Dynamic Templates
function setupEditor(question) {
    const select = document.getElementById('languageSelect');
    const editor = document.getElementById('codeEditor');

    // Initial load
    editor.value = getTemplate(question, select.value);

    // Change handler
    select.addEventListener('change', (e) => {
        if (confirm('Changing language will reset your code. Continue?')) {
            editor.value = getTemplate(question, e.target.value);
        } else {
            // Revert selection if cancelled
            e.target.value = e.target.value === 'cpp' ? 'java' : 'cpp';
        }
    });
}

function getTemplate(question, lang) {
    let inputs = [];
    let returnType = lang === 'cpp' ? 'void' : 'void';
    let defaultReturn = '';

    // Heuristic inference from first example
    if (question.examples && question.examples.length > 0) {
        const exInput = question.examples[0].input.trim();
        const exOutput = question.examples[0].output.trim();

        // --- Return Type Inference ---
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

        // --- Parameter Inference ---
        // Check for specific patterns first

        // 1. Two arrays (Merge Sorted Arrays)
        if (exInput.includes('], [')) {
            inputs.push(lang === 'cpp' ? 'vector<int>& nums1' : 'int[] nums1');
            inputs.push(lang === 'cpp' ? 'vector<int>& nums2' : 'int[] nums2');
        }
        // 2. Array and Target (Two Sum)
        else if (exInput.match(/], \d+/)) {
            inputs.push(lang === 'cpp' ? 'vector<int>& nums' : 'int[] nums');
            inputs.push('int target');
        }
        // 3. Simple Array
        else if (exInput.startsWith('[')) {
            inputs.push(lang === 'cpp' ? 'vector<int>& nums' : 'int[] nums');
        }
        // 4. String
        else if (exInput.startsWith('"') || exInput.startsWith("'")) {
            // Check if comma separator exists for multiple strings (Anagram)
            if (exInput.includes(',')) {
                inputs.push(lang === 'cpp' ? 'string s' : 'String s');
                inputs.push(lang === 'cpp' ? 'string t' : 'String t');
            } else {
                inputs.push(lang === 'cpp' ? 'string s' : 'String s');
            }
        }
        // 5. Integer (FizzBuzz, Factorial, etc)
        else if (!isNaN(parseInt(exInput))) {
            inputs.push('int n');
        }
    }

    const params = inputs.join(', ');
    const returnStmt = defaultReturn ? `\n        return ${defaultReturn};` : '';

    if (lang === 'cpp') {
        return `class Solution {
public:
    // Solve ${question.title}
    ${returnType} solve(${params}) {
        // Your code here${returnStmt}
    }
};`;
    } else {
        return `class Solution {
    // Solve ${question.title}
    public ${returnType} solve(${params}) {
        // Your code here${returnStmt}
    }
}`;
    }
}

// Run Code Logic
// Run Code Logic
// Run Code Logic using Gemini API
async function runCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value;
    const languageSelect = document.getElementById('languageSelect');
    const language = languageSelect.value;
    const outputPanel = document.getElementById('outputPanel');

    const urlParams = new URLSearchParams(window.location.search);
    const questionId = parseInt(urlParams.get('id'));
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        outputPanel.innerHTML = '<div style="color: #ef4444;">Question not found.</div>';
        return;
    }

    outputPanel.innerHTML = '<div style="color: #fbbf24;">Evaluating code with Gemini AI...</div>';

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
            outputPanel.innerHTML = `<div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Error:</div>
                                     <div style="color: #ef4444;">${result.error || 'Failed to evaluate code.'}</div>`;
            return;
        }

        renderAIFeedback(result, questionId);
    } catch (error) {
        outputPanel.innerHTML = `<div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Error:</div>
                                 <div style="color: #ef4444;">Failed to connect to the server for evaluation.</div>`;
        console.error("Evaluation error:", error);
    }
}

// Removed local mock linter, runTestCases and transpilation logic since we now use Gemini API for evaluation.

function renderAIFeedback(result, questionId) {
    const outputPanel = document.getElementById('outputPanel');
    outputPanel.innerHTML = '<div style="margin-bottom: 0.5rem; color: var(--text-light); font-weight: bold;">AI Evaluation Results:</div>';

    const statusColor = result.passed ? '#22c55e' : '#ef4444';
    const statusIcon = result.passed ? 'fa-check-circle' : 'fa-times-circle';
    const statusText = result.passed ? 'Passed' : 'Needs Improvement';

    outputPanel.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 1rem; color: ${statusColor}; font-size: 1.2rem; font-weight: bold;">
            <i class="fas ${statusIcon}" style="margin-right: 0.5rem;"></i>
            ${statusText}
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid ${statusColor}; color: var(--text-light); white-space: pre-wrap; line-height: 1.5;">${result.feedback}</div>
    `;

    if (result.idealCode) {
        outputPanel.innerHTML += `
            <div style="margin-top: 1rem;">
                <div style="color: var(--primary); font-weight: bold; margin-bottom: 0.5rem;">Optimal Code Solution:</div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px;">
                    <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;"><code style="color: #a8b2d1; font-family: monospace;">${result.idealCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>
            </div>
        `;
    }

    if (result.passed) {
        outputPanel.innerHTML += `
            <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #22c55e; font-weight: bold;">Great Job! You can now move to the next question.</span>
                <button onclick="window.location.href='solve.html'" style="background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: bold;">Back to Problems</button>
            </div>
        `;

        // Save progress to localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            let solved = JSON.parse(localStorage.getItem(`solvedQuestions_${user.email}`)) || [];
            if (!solved.includes(questionId)) {
                solved.push(questionId);
                localStorage.setItem(`solvedQuestions_${user.email}`, JSON.stringify(solved));
            }
        }
    }
}
