// Simple calculator logic with keyboard support

const displayEl = document.getElementById('display');
const keysEl = document.querySelector('.keys');

let current = ''; // current expression string
let lastResult = null;

function updateDisplay(text) {
  displayEl.textContent = text === '' ? '0' : text;
}

function append(value) {
  // Prevent multiple leading zeros
  if (current === '0' && value === '0') return;
  // Avoid starting expression with an operator except minus
  if (current === '' && isOperator(value) && value !== '-') return;
  current += value;
  updateDisplay(current);
}

function isOperator(ch) {
  return ['+', '-', '×', '÷', '*', '/'].includes(ch);
}

function clearAll() {
  current = '';
  lastResult = null;
  updateDisplay('0');
}

function backspace() {
  if (current.length > 0) {
    current = current.slice(0, -1);
    updateDisplay(current);
  }
}

function applyPercent() {
  // Convert "number%" to "(number/100)"
  current = current.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
  // If there is no trailing number, just append %
  if (!/%/.test(current)) {
    current += '%';
  }
  updateDisplay(current);
}

function sanitizeExpression(expr) {
  // Replace fancy operators with JS ones
  let s = expr.replace(/×/g, '*').replace(/÷/g, '/');

  // Convert percent occurrences like "50%" to "(50/100)"
  s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

  // Allow only numbers, operators, parentheses, dot, and spaces
  // If anything else appears, throw to prevent evaluation
  if (/[^0-9+\-*/().\s]/.test(s)) {
    throw new Error('Invalid characters in expression');
  }
  return s;
}

function evaluateExpression() {
  if (current.trim() === '') return;
  try {
    const expr = sanitizeExpression(current);
    // Using Function to evaluate sanitized arithmetic expression
    const result = Function('"use strict";return (' + expr + ')')();
    if (!isFinite(result)) throw new Error('Math error');
    // Format result to avoid long floating artifacts
    const formatted = Number.isInteger(result) ? result : parseFloat(result.toPrecision(12));
    lastResult = String(formatted);
    current = lastResult;
    updateDisplay(lastResult);
  } catch (err) {
    updateDisplay('Error');
    current = '';
    lastResult = null;
    setTimeout(() => updateDisplay('0'), 1000);
  }
}

// Handle clicks
keysEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === 'clear') {
    clearAll();
  } else if (action === 'backspace') {
    backspace();
  } else if (action === 'percent') {
    applyPercent();
  } else if (action === 'equals') {
    evaluateExpression();
  } else if (value) {
    append(value);
  }
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  // Allow digits and operators
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    append(e.key);
    e.preventDefault();
    return;
  }

  if (['+', '-', '*', '/'].includes(e.key)) {
    const map = {'*':'×','/':'÷'};
    append(map[e.key] || e.key);
    e.preventDefault();
    return;
  }

  if (e.key === 'Enter' || e.key === '=') {
    evaluateExpression();
    e.preventDefault();
    return;
  }

  if (e.key === 'Backspace') {
    backspace();
    e.preventDefault();
    return;
  }

  if (e.key === 'Escape') {
    clearAll();
    e.preventDefault();
    return;
  }

  if (e.key === '%') {
    applyPercent();
    e.preventDefault();
    return;
  }

  // Parentheses
  if (e.key === '(' || e.key === ')') {
    append(e.key);
    e.preventDefault();
    return;
  }
});

// Initialize
updateDisplay('0');
