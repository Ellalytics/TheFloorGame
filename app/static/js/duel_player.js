let isComplete = false;

let timer1Left = 45000; // 45 seconds
let timer2Left = 45000; // 45 seconds

let currentPlayer = 1;
let msLeft = timer1Left;
let timerId = 'timer1';
let currentQuestion = {
    answerText: "?",
};

function switchPlayer() {
    document.getElementById(timerId).style.color = "grey";

    if (currentPlayer === 1) {
        currentPlayer = 2;
        timer1Left = msLeft;
        msLeft = timer2Left;
        timerId = 'timer2'
    } else {
        currentPlayer = 1;
        timer2Left = msLeft;
        msLeft = timer1Left;
        timerId = 'timer1'
    }

    document.getElementById(timerId).style.color = "green";
}

async function loadQuestion() {
    try {
        const response = await fetch('/question/next');
        const data = await response.json();
        document.getElementById('questionImage').src = data.image_url;
        currentQuestion.answerText = data.answer_text;
    } catch (error) {
        console.error('Error fetching the next question:', error);
    }
}

function runTimer() {
    const timer = setInterval(() => {
        msLeft = msLeft - 100; // count down 100ms at a time
        let secLeft = Math.ceil(msLeft / 1000);
        document.getElementById(timerId).textContent = `00:${secLeft.toString().padStart(2, '0')}`;

        if (msLeft <= 0) {
            clearInterval(timer); // Stop the timer when it reaches 0
            isComplete = true;
            document.getElementById(timerId).style.color = "red";
        }
    }, 100);
    return timer
}

function pauseTimer(timer) {
    clearInterval(timer)
}

async function showAnswerFor1Sec() {
    document.getElementById('answerText').textContent = currentQuestion.answerText;
    if (!isComplete) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        document.getElementById('answerText').textContent = "?";
    }
}

async function getQuestionStatus() {
    try {
        const response = await fetch('/question/status');
        const data = await response.json();
        return data.status
    } catch (error) {
        console.error('Error fetching the next question:', error);
    }
}

async function runduel() {
    switchPlayer()
    while (msLeft > 0 && !isComplete) {
        await loadQuestion();
        let timer = runTimer();
        let status = await getQuestionStatus();
        pauseTimer(timer);
        await showAnswerFor1Sec();
        if (status === "CORRECT") {
            switchPlayer()
        }
    }
}

document.addEventListener('DOMContentLoaded', runduel);
