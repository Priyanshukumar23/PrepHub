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
function runCode() {
    const editor = document.getElementById('codeEditor');
    const code = editor.value;
    const outputPanel = document.getElementById('outputPanel');

    outputPanel.innerHTML = '<div style="color: #fbbf24;">Running...</div>';

    // 1. Syntax Check (Mock Linter)
    const errors = lintCode(code);

    if (errors.length > 0) {
        outputPanel.innerHTML = '<div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Compilation Error:</div>';
        errors.forEach(err => {
            outputPanel.innerHTML += `<div style="color: #ef4444;">Line ${err.line}: ${err.msg}</div>`;
        });
        return;
    }

    // 2. Real Execution Engine
    // Execute immediately (microtask) to allow UI 'Running...' to render if needed, but practically instant
    requestAnimationFrame(async () => {
        const results = await runTestCases();
        renderTestResults(results);
    });
}

// Simple Mock Linter
function lintCode(code) {
    const lines = code.split('\n');
    const errors = [];
    // Basic heuristics only
    return errors;
    // Disabled strict linter temporarily to avoid false positives with valid JS syntax that looks like Java errors
    // or let runTestCases handle errors naturally
}

// Actual logic runner
async function runTestCases() {
    const editor = document.getElementById('codeEditor');
    const rawCode = editor.value;
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = parseInt(urlParams.get('id'));
    const question = questions.find(q => q.id === questionId);

    if (!question) return [];

    // 1. Transpile to JS
    let jsCode;
    try {
        jsCode = transpileToJS(rawCode);
    } catch (e) {
        return [{
            name: "Transpilation Error",
            passed: false,
            details: e.message
        }];
    }

    // Debug: detailed logging could go here or to console
    console.log("Transpiled:", jsCode);

    try {
        const wrappedCode = `
            ${jsCode}
            return new Solution();
        `;
        const solutionInstance = new Function(wrappedCode)();

        if (typeof solutionInstance.solve !== 'function') {
            throw new Error("Could not find 'solve' method in Solution class.");
        }

        const userFn = solutionInstance.solve.bind(solutionInstance);

        // 2. Run Test Cases
        const results = question.testCases.map(test => {
            try {
                const args = eval(`[${test.input}]`);
                // Time Execution
                const startT = performance.now();
                const rawResult = userFn(...args);
                const endT = performance.now();

                if (endT - startT > 1000) throw new Error("Time Limit Exceeded (Real)");

                let actualString = JSON.stringify(rawResult);

                const expectedVal = eval(`(${test.expected})`);
                const expectedString = JSON.stringify(expectedVal);

                const passed = actualString === expectedString;

                return {
                    name: `Input: ${test.input.substring(0, 20)}`,
                    passed: passed,
                    details: passed ? 'Passed' : `Expected ${test.expected}, Got ${actualString}`
                };
            } catch (e) {
                return {
                    name: `Input: ${test.input}`,
                    passed: false,
                    details: `Runtime Error: ${e.message}`
                };
            }
        });

        return results;

    } catch (e) {
        return [{
            name: "Compilation/Transpilation",
            passed: false,
            details: `Error parsing code: ${e.message}. \nTranspiled: ${jsCode}`
        }];
    }
}

function transpileToJS(code) {
    let js = code;

    // 1. Remove standard C++/Java imports
    js = js.replace(/^#include.*$/gm, '');
    js = js.replace(/^import.*$/gm, '');
    js = js.replace(/^package.*$/gm, '');

    // 2. Remove access modifiers
    const modifiers = ['public', 'private', 'protected', 'static', 'final'];
    modifiers.forEach(mod => {
        js = js.replace(new RegExp(`\\b${mod}\\s+`, 'g'), '');
    });

    const simpleTypes = ['int', 'float', 'double', 'long', 'boolean', 'void', 'String', 'char'];

    // 3. Remove Return Types from Method Signatures
    simpleTypes.forEach(type => {
        const re = new RegExp(`\\b${type}\\s+([a-zA-Z0-9_]+)\\s*\\(`, 'g');
        js = js.replace(re, '$1(');
    });

    // 4. Handle "for" loops explicitly FIRST
    simpleTypes.forEach(type => {
        // Match "for" followed by optional space, parenthesis, optional space, Type, space
        const re = new RegExp(`(for|while|catch)\\s*\\(\\s*${type}\\s+`, 'g');
        js = js.replace(re, '$1(let ');
    });

    // 5. Handle Function Arguments (Clean types)
    simpleTypes.forEach(type => {
        js = js.replace(new RegExp(`\\(\\s*${type}\\s+`, 'g'), '(');
        js = js.replace(new RegExp(`,\\s*${type}\\s+`, 'g'), ', ');
    });

    // 6. Handle Generic Types
    js = js.replace(/\b(vector|List|ArrayList)\s*<[^>]+>\s+([a-zA-Z0-9_]+)/g, 'let $2');
    js = js.replace(/\b(Map|Set|HashMap|HashSet)\s*<[^>]+>\s+([a-zA-Z0-9_]+)/g, 'let $2');

    // 7. Handle Remaining Variable Declarations
    simpleTypes.forEach(type => {
        const re = new RegExp(`\\b${type}\\s+([a-zA-Z0-9_]+)`, 'g');
        js = js.replace(re, 'let $1');
    });

    // 8. Standard Library Conversions
    js = js.replace(/\.length\(\)/g, '.length');
    js = js.replace(/\.size\(\)/g, '.length');
    js = js.replace(/\.push_back\(/g, '.push(');
    js = js.replace(/\.add\(/g, '.push(');
    js = js.replace(/System\.out\.println/g, 'console.log');
    js = js.replace(/Integer\.MAX_VALUE/g, 'Infinity');
    js = js.replace(/Integer\.MIN_VALUE/g, '-Infinity');
    js = js.replace(/Math\.max/g, 'Math.max');
    js = js.replace(/Math\.min/g, 'Math.min');
    js = js.replace(/\bString\.valueOf\b/g, 'String');
    js = js.replace(/\.charAt\(/g, '.at(');

    // 9. Infinite Loop Guard Injection (Robust Lazy Match)
    // Normalize braces "){" -> ") {"
    js = js.replace(/\)\s*\{/g, ') {');

    // Inject at start of function (solve)
    js = js.replace(/(solve\s*\([^)]*\)\s*\{)/, '$1 let _ops = 0; ');

    // Inject loop checks
    // Use [^]+? (lazy match everything including newlines) until we see ") {"
    // This handles nested parens in condition better: for(i=0;i<f();i++)
    const guard = ` if(++_ops > 100000) throw new Error("Loop Limit Exceeded"); `;

    js = js.replace(/(for|while)\s*\(([\s\S]*?)\)\s*\{/g, (match, keyword, condition) => {
        return `${keyword}(${condition}) {${guard}`;
    });

    return js;
}

function renderTestResults(results) {
    const outputPanel = document.getElementById('outputPanel');
    outputPanel.innerHTML = '<div style="margin-bottom: 0.5rem; color: var(--text-light);">Test Results:</div>';

    let allPassed = true;

    results.forEach(res => {
        if (!res.passed) allPassed = false;
        outputPanel.innerHTML += `
            <div class="test-result-item">
                <i class="fas ${res.passed ? 'fa-check-circle status-pass' : 'fa-times-circle status-fail'} status-icon"></i>
                <div style="flex: 1;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>${res.name}</span>
                        <span class="status-${res.passed ? 'pass' : 'fail'}">
                            ${res.passed ? 'Passed' : 'Failed'}
                        </span>
                    </div>
                    ${!res.passed && res.details ? `<div style="font-size:0.8rem; color:#ef4444; margin-top:0.2rem;">${res.details}</div>` : ''}
                </div>
            </div>
        `;
    });

    if (allPassed) {
        outputPanel.innerHTML += '<div style="color: #22c55e; margin-top: 1rem; font-weight: bold;">Great Job! logic passed.</div>';

        // Save progress to localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const questionId = parseInt(urlParams.get('id')); // Already parsed at top, but safe to redo

            let solved = JSON.parse(localStorage.getItem('solvedQuestions')) || [];
            if (!solved.includes(questionId)) {
                solved.push(questionId);
                localStorage.setItem('solvedQuestions', JSON.stringify(solved));
            }
        }
    } else {
        outputPanel.innerHTML += '<div style="color: #ef4444; margin-top: 1rem;">Some test cases failed. check logic.</div>';
    }
}
