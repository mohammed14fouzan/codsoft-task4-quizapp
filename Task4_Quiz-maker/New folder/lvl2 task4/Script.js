// --- 1. GLOBAL VARIABLES (Must be at the top) ---
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;

// --- 2. AUTHENTICATION ---
function toggleAuth(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (!loginForm || !registerForm) return;

    if (mode === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

function handleLogin() {
    const user = document.getElementById('loginUser').value;
    if (user) {
        localStorage.setItem('currentUser', user);
        window.location.href = 'Index.HTML';
    } else {
        alert("Please enter a username");
    }
}

// --- 3. QUIZ CREATION ---
function addQuestion() {
    const container = document.getElementById('questions-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'question-block glass-card';
    div.style.marginTop = "20px";
    div.innerHTML = `
        <input type="text" class="q-text" placeholder="Enter Question">
        <div class="options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
            <input type="text" class="opt" placeholder="Option A">
            <input type="text" class="opt" placeholder="Option B">
            <input type="text" class="opt" placeholder="Option C">
            <input type="text" class="opt" placeholder="Option D">
        </div>
        <select class="correct-ans">
            <option value="0">Correct: A</option>
            <option value="1">Correct: B</option>
            <option value="2">Correct: C</option>
            <option value="3">Correct: D</option>
        </select>
    `;
    container.appendChild(div);
}

function saveFullQuiz() {
    const title = document.getElementById('quizTitle').value;
    const blocks = document.querySelectorAll('.question-block');
    let questions = [];

    blocks.forEach(block => {
        const qText = block.querySelector('.q-text').value;
        const opts = Array.from(block.querySelectorAll('.opt')).map(i => i.value);
        const correct = block.querySelector('.correct-ans').value;
        if (qText && opts[0]) questions.push({ qText, opts, correct });
    });

    if (!title || questions.length === 0) return alert("Fill all fields!");

    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    quizzes.push({ title, questions, id: Date.now() });
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    alert("Quiz Saved!");
    window.location.href = 'Index.HTML';
}


// --- 4. TAKE QUIZ (The logic you're having trouble with) ---
function startQuiz(index) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    currentQuestions = quizzes[index].questions;
    score = 0; // Reset score when starting
    currentQuestionIndex = 0; // Reset index

    document.getElementById('quiz-selection-list').classList.add('hidden');
    document.getElementById('active-quiz').classList.remove('hidden');
    showQuestion();
    startTimer();
}
function showQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('current-q-text').innerText = q.qText;
    const optionsDiv = document.getElementById('options-list');
    optionsDiv.innerHTML = '';

    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt;

        btn.onclick = () => checkAnswer(i);
        optionsDiv.appendChild(btn);
    });

    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + "%";
}
function checkAnswer(selected) {
    const correctIndex = parseInt(currentQuestions[currentQuestionIndex].correct);
    const optionsDiv = document.getElementById('options-list');
    const buttons = optionsDiv.getElementsByTagName('button');

    if (selected === correctIndex) {
        buttons[selected].classList.add('correct-flash'); // Turns Green
        score++;
    } else {
        buttons[selected].classList.add('wrong-flash');   // Turns Red
        buttons[correctIndex].classList.add('correct-flash'); // Show correct answer
    }

    // 2. Prevent extra clicks during the pause
    for (let btn of buttons) {
        btn.style.pointerEvents = 'none';
    }

    // 3. Pause for 1 second so the user sees the color
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1000);
}

function startTimer() {
    timeLeft = currentQuestions.length * 15;
    timerInterval = setInterval(() => {
        timeLeft--;
        const timerVal = document.getElementById('time-val');
        if (timerVal) timerVal.innerText = timeLeft;
        if (timeLeft <= 0) endQuiz();
    }, 1000);
}

function endQuiz() {
    clearInterval(timerInterval);
    localStorage.setItem('lastScore', score);
    localStorage.setItem('totalQs', currentQuestions.length);
    window.location.href = 'Result.HTML';
}

// --- 5. INITIALIZATION (Runs on page load) ---
window.onload = function () {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('index.html') || path.includes('main.html')) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const countEl = document.getElementById('created-count');
        const userEl = document.getElementById('user-display');
        if (countEl) countEl.innerText = quizzes.length;
        if (userEl) userEl.innerText = localStorage.getItem('currentUser') || 'Explorer';
    }
    if (path.includes('take.html')) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const list = document.getElementById('available-quizzes');
        if (list) {
            quizzes.forEach((q, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn-outline';
                btn.style.margin = "10px";
                btn.innerText = q.title;
                btn.onclick = () => startQuiz(index);
                list.appendChild(btn);
            });
        }
    }

    // Result Logic
    if (path.includes('result.html')) {
        // 1. Get the data from memory
        const finalScore = localStorage.getItem('lastScore');
        const total = localStorage.getItem('totalQs');

        // 2. Find the elements on the page
        const scoreEl = document.getElementById('final-score');
        const totalEl = document.getElementById('total-questions');
        const accuracyEl = document.getElementById('accuracy-percent');

        // 3. Inject the data ONLY if the elements exist
        if (scoreEl) {
            scoreEl.innerText = finalScore ? finalScore : "0";
        }
        if (totalEl) {
            totalEl.innerText = total ? total : "0";
        }

        // 4. Calculate Accuracy (Since this is working for you, we keep it)
        if (accuracyEl && total > 0) {
            const percent = Math.round((finalScore / total) * 100);
            accuracyEl.innerText = percent + "%";
        }
    }
};