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
        const response = await fetch('/question/image-update');
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
async function checkStartSignal() {
    try {
        const response = await fetch('/question/start-signal');
        const data = await response.json();
        return data.start; // Assuming the response includes a "start" boolean flag
    } catch (error) {
        console.error('Error checking start signal:', error);
        return false; // Default to false if there's an error
    }
}
async function runduel() {
    let start = await checkStartSignal();
    while (!start) {
        // Wait for 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        start = await checkStartSignal();
    }
    await loadQuestion()  // load first question
    switchPlayer() // select a player
    let timer = runTimer();   // start the timer

    while (!isComplete) {
        let status = await getQuestionStatus();
        if (msLeft <= 0) {
            pauseTimer(timer);
            isComplete = true;
            break; // 如果时间耗尽或比赛结束，则退出循环
        }
        if (status === "CORRECT") {
            pauseTimer(timer); // 停止当前计时器
            await showAnswerFor1Sec(); // 显示答案并等待1秒
            switchPlayer()
            timer = runTimer(); // 重新开始计时
            await loadQuestion(); // 等答案显示完毕后加载新问题
            msLeft = currentPlayer === 1 ? timer1Left : timer2Left; // 重置剩余时间
        }
        else if (status === "PASS") {
                pauseTimer(timer); // 停止当前计时器
                await showAnswerFor1Sec(); // 显示答案并等待1秒
                timer = runTimer(); // 重新开始计时
                await loadQuestion();
            }
        // 短暂延迟再次检查，以避免过于频繁的请求

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

document.addEventListener('DOMContentLoaded', runduel);
