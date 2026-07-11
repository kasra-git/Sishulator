class Calculator {
    constructor() {
        this.input = document.getElementById('input');
        this.canUndo = true;
        
        this.operators = {
            PLUS: '+',
            MINUS: '-',
            MULTIPLY: '×',
            DIVIDE: '÷',
            POWER: '^'
        };
        
        this.allOperators = Object.values(this.operators);
        
        this.init();
    }

    init() {
        this.setupNumberButtons();
        this.setupOperatorButtons();
        this.setupSpecialButtons();
        this.setupKeyboardSupport();
    }
    
    // Checking the input for possible this.input.value === "Error"
    clearErrorIfNeeded() {
        if (this.input.value === 'Error') {
            this.input.value = '';
            this.canUndo = true;
            return true;
        }
        return false;
    }
    
    // Setting up number buttons [0-9 , . , ()]
    setupNumberButtons() {
        const buttons = document.querySelectorAll('.normal-btn');
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                this.handleNumberInput(button.value);
            });
        });
    }
    
    // Handling to many decimal points 
    handleNumberInput(value) {
        this.clearErrorIfNeeded();
        
        if (value === '.') {
            const lastNumber = this.input.value.split(/[\+\-\*\/\(\)\^]/).pop();
            if (lastNumber && lastNumber.includes('.')) {
                return;
            }
        }
        
        this.input.value += value;
        this.canUndo = true;
    }
    
    // Setting up operator buttons [+, -, ×, ÷]
    setupOperatorButtons() {
        const operators = [
            { id: 'plus-btn', symbol: this.operators.PLUS },
            { id: 'minus-btn', symbol: this.operators.MINUS },
            { id: 'multiply-btn', symbol: this.operators.MULTIPLY },
            { id: 'divide-btn', symbol: this.operators.DIVIDE }
        ];
        
        operators.forEach(({ id, symbol }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    this.handleOperatorInput(symbol);
                });
            }
        });
    }
    
    // Handling operator input with replacement logic
    handleOperatorInput(symbol) {
        this.clearErrorIfNeeded();
        
        const lastChar = this.input.value.slice(-1);
        
        if (this.allOperators.includes(lastChar)) {
            this.input.value = this.input.value.slice(0, -1) + symbol;
        } else if (this.input.value !== '') {
            this.input.value += symbol;
        }
        
        this.canUndo = true;
    }
    
    // Setting up special buttons [power, root, clear, undo, equal]
    setupSpecialButtons() {
        // Power button
        const powerBtn = document.getElementById('power-btn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => {
                this.handleOperatorInput('^');
            });
        }
        
        // Root button
        const rootBtn = document.getElementById('root-btn');
        if (rootBtn) {
            rootBtn.addEventListener('click', () => {
                this.clearErrorIfNeeded();
                
                if (!this.input.value.endsWith('√(')) {
                    this.input.value += '√(';
                    this.canUndo = true;
                }
            });
        }
        
        // Closing parenthesis
        const closeParenBtn = document.getElementById('close-paren-btn');
        if (closeParenBtn) {
            closeParenBtn.addEventListener('click', () => {
                this.clearErrorIfNeeded();
                
                this.input.value += ')';
                this.canUndo = true;
            });
        }
        
        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.input.value = '';
                this.canUndo = false;
            });
        }
        
        // Undo button
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.handleUndo();
            });
        }
        
        // Equal button
        const equalBtn = document.getElementById('equal-btn');
        if (equalBtn) {
            equalBtn.addEventListener('click', () => {
                this.calculate();
            });
        }
    }
    
    // Handling undo operation
    handleUndo() {
        if (this.input.value === 'Error') {
            this.input.value = '';
            this.canUndo = true;
            return;
        }
        
        if (!this.canUndo || this.input.value.length === 0) return;
        
        if (this.input.value.endsWith('√(')) {
            this.input.value = this.input.value.slice(0, -2);
        } else {
            this.input.value = this.input.value.slice(0, -1);
        }
        
        if (this.input.value.length === 0) {
            this.canUndo = false;
        }
    }
    
    // Setting up keyboard support
    setupKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            
            // Numbers
            if (/^[0-9.]$/.test(key)) {
                event.preventDefault();
                this.handleNumberInput(key);
                return;
            }
            
            // Operators
            if (['+', '-'].includes(key)) {
                event.preventDefault();
                this.handleOperatorInput(key);
                return;
            }
            
            if (key === '*') {
                event.preventDefault();
                this.handleOperatorInput(this.operators.MULTIPLY);
                return;
            }
            
            if (key === '/') {
                event.preventDefault();
                this.handleOperatorInput(this.operators.DIVIDE);
                return;
            }
            
            if (key === '^') {
                event.preventDefault();
                this.handleOperatorInput('^');
                return;
            }
            
            // Parentheses
            if (key === '(') {
                event.preventDefault();
                this.clearErrorIfNeeded();
                this.input.value += '(';
                this.canUndo = true;
                return;
            }
            
            if (key === ')') {
                event.preventDefault();
                this.clearErrorIfNeeded();
                this.input.value += ')';
                this.canUndo = true;
                return;
            }
            
            // Enter key
            if (key === 'Enter') {
                event.preventDefault();
                this.calculate();
                return;
            }
            
            // Backspace
            if (key === 'Backspace') {
                event.preventDefault();
                this.handleUndo();
                return;
            }
            
            // Escape key
            if (key === 'Escape') {
                event.preventDefault();
                this.input.value = '';
                this.canUndo = false;
                return;
            }
        });
    }
    
    // Calculating the result of the expression
    calculate() {
        try {
            if (this.input.value.trim() === '' || this.input.value === 'Error') {
                return;
            }
            
            const tokens = this.tokenize(this.input.value);
            
            if (tokens.length === 0) {
                return;
            }
            
            const postfix = this.infixToPostfix(tokens);
            const result = this.evaluatePostfix(postfix);
            
            const roundedResult = parseFloat(result.toFixed(10));
            this.input.value = roundedResult;
            this.canUndo = false;
            
        } catch (error) {
            this.input.value = 'Error';
            this.canUndo = false;
            console.error('Calculation error:', error.message);
        }
    }
    
    // Tokenizing the input expression
    tokenize(input) {
        const tokens = [];
        let number = '';
        let i = 0;
        
        while (i < input.length) {
            const char = input[i];
            
            // Handling root function
            if (char === '√' && i + 1 < input.length && input[i + 1] === '(') {
                let parenCount = 1;
                let j = i + 2;
                
                while (j < input.length && parenCount > 0) {
                    if (input[j] === '(') parenCount++;
                    else if (input[j] === ')') parenCount--;
                    if (parenCount > 0) j++;
                }
                
                const innerExpr = input.substring(i + 2, j);
                const innerTokens = this.tokenize(innerExpr);
                
                tokens.push('√');
                tokens.push(...innerTokens);
                
                i = j + 1;
                continue;
            }
            
            // Building numbers
            if (!isNaN(char) || char === '.') {
                number += char;
                i++;
            } else {
                if (number !== '') {
                    tokens.push(number);
                    number = '';
                }
                
                if ('+-×÷()^'.includes(char)) {
                    let token = char;
                    if (char === '×') token = '*';
                    else if (char === '÷') token = '/';
                    tokens.push(token);
                }
                i++;
            }
        }
        
        if (number !== '') {
            tokens.push(number);
        }
        
        return tokens;
    }
    
    // Converting infix expression to postfix notation
    infixToPostfix(tokens) {
        const output = [];
        const operators = [];
        
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3,
            '√': 4
        };
        
        for (const token of tokens) {
            if (!isNaN(token)) {
                output.push(token);
            } else if (token === '(') {
                operators.push(token);
            } else if (token === ')') {
                while (operators.length && operators[operators.length - 1] !== '(') {
                    output.push(operators.pop());
                }
                if (operators.length > 0 && operators[operators.length - 1] === '(') {
                    operators.pop();
                } else {
                    throw new Error('Mismatched parentheses');
                }
            } else if (token === '√') {
                operators.push(token);
            } else {
                while (
                    operators.length &&
                    operators[operators.length - 1] !== '(' &&
                    (precedence[operators[operators.length - 1]] > precedence[token] ||
                    (precedence[operators[operators.length - 1]] === precedence[token] && token !== '^'))
                ) {
                    output.push(operators.pop());
                }
                operators.push(token);
            }
        }
        
        while (operators.length) {
            const op = operators.pop();
            if (op === '(' || op === ')') {
                throw new Error('Mismatched parentheses');
            }
            output.push(op);
        }
        
        return output;
    }
    
    // Evaluating postfix expression
    evaluatePostfix(postfix) {
        const stack = [];
        
        for (const token of postfix) {
            if (!isNaN(token)) {
                stack.push(Number(token));
            } else if (token === '√') {
                if (stack.length < 1) {
                    throw new Error('Invalid expression');
                }
                const a = stack.pop();
                if (a < 0) {
                    throw new Error('Cannot take square root of negative number');
                }
                stack.push(Math.sqrt(a));
            } else {
                if (stack.length < 2) {
                    throw new Error('Invalid expression');
                }
                
                const b = stack.pop();
                const a = stack.pop();
                
                switch (token) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/':
                        if (b === 0) {
                            throw new Error('Division by zero');
                        }
                        stack.push(a / b);
                        break;
                    case '^': stack.push(Math.pow(a, b)); break;
                    default: throw new Error('Unknown operator');
                }
            }
        }
        
        if (stack.length !== 1) {
            throw new Error('Invalid expression');
        }
        
        return stack.pop();
    }
}

// Initializing the calculator when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});