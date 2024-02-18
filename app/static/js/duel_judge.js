function loadQuestionAndAnswer() {
    fetch("/question/next")
        .then(response => response.json())
        .then(data => {
            document.getElementById('questionImage').src = data.image_url;
            document.getElementById('answerText').textContent = data.answer_text;
        })
        .catch(error => console.error('Error fetching the image:', error));
}

function startCategory() {
    let startButtonText = document.getElementById('startButton').textContent;
    if (startButtonText === "Start") {
        const category = document.getElementById('categorySelect').value;
        const url = `/category/start/${category}`;
        fetch(url)
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
        loadQuestionAndAnswer();
        document.getElementById('startButton').textContent = "Cancel duel";
    } else {
        fetch('/category/cancel')
            .then(r => location.reload());
    }
}

function submitStatus(status) {
    const url = `/question/status/${status}`;
    fetch(url, {method: 'POST'}) //  POST is to update status, thought it has no body.
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    loadQuestionAndAnswer();
}