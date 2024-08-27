document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.querySelector('.login-screen');
    const startScreen = document.querySelector('.start-screen');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !email || !password) {
            alert('Please fill the login form properly.');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            alert('Please write your email properly.');
            return;
        }

        const passwordPattern = /^(?=.*[!@#$%^&*])(?=.*[A-Za-z]).{8,}$/;
        if (!passwordPattern.test(password)) {
            alert('Must write at least 8 characters and use one special character for making your password strong.');
            return;
        }

        // Hide login screen and show start screen
        loginScreen.classList.add('hide');
        startScreen.classList.remove('hide');
    });

    // Quiz Logic
    const startBtn = document.querySelector(".start"),
        numQuestions = document.querySelector("#num-questions"),
        category = document.querySelector("#category"),
        difficulty = document.querySelector("#difficulty"),
        timePerQuestion = document.querySelector("#time"),
        quiz = document.querySelector(".quiz"),
        endScreen = document.querySelector(".end-screen"),
        submitBtn = document.querySelector(".submit"),
        nextBtn = document.querySelector(".next"),
        finalScore = document.querySelector("#finalScore"),
        totalScore = document.querySelector("#totalScore"),
        progressBar = document.querySelector(".progress-bar"),
        progressText = document.querySelector(".progress-text");

    let questions = [],
        time = 30,
        score = 0,
        currentQuestion = 0,
        timer;

    const startQuiz = () => {
        const num = numQuestions.value;
        const cat = category.value;
        const diff = difficulty.value;
        const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                questions = data.results;
                startScreen.classList.add("hide");
                quiz.classList.remove("hide");
                score = 0;
                currentQuestion = 0;
                showQuestion();
            });
    };

    const showQuestion = () => {
        if (currentQuestion < questions.length) {
            const question = questions[currentQuestion];
            document.querySelector(".question").innerHTML = question.question;
            const answersWrapper = document.querySelector(".answer-wrapper");

            // Define the answers array with the correct answer in the "D" section
            const answers = [
                question.incorrect_answers[0],
                question.incorrect_answers[1],
                question.incorrect_answers[2],
                question.correct_answer
            ];

            // Shuffle the answers but keep the correct answer at index 3 (D section)
            answers.sort(() => Math.random() - 0.5);
            answers[3] = question.correct_answer; // Ensure correct answer is in the D section

            answersWrapper.innerHTML = "";
            answers.forEach((answer, index) => {
                const answerDiv = document.createElement("div");
                answerDiv.classList.add("answer");
                answerDiv.innerHTML = `
                    <span class="text">${answer}</span>
                    <span class="checkbox">
                        <span class="icon">√</span>
                    </span>`;
                answersWrapper.appendChild(answerDiv);

                answerDiv.addEventListener("click", () => {
                    if (!answerDiv.classList.contains("checked")) {
                        document.querySelectorAll(".answer").forEach((ans) => ans.classList.remove("selected"));
                        answerDiv.classList.add("selected");
                        submitBtn.disabled = false;
                    }
                });
            });

            document.querySelector(".number .current").textContent = currentQuestion + 1;
            document.querySelector(".number .total").textContent = questions.length;

            time = parseInt(timePerQuestion.value);
            startTimer();
            submitBtn.disabled = true;
            nextBtn.classList.add("hide");
            submitBtn.classList.remove("hide");
        } else {
            showScore();
        }
    };

    const startTimer = () => {
        clearInterval(timer);
        timer = setInterval(() => {
            if (time > 0) {
                time--;
                progress(time);
            } else {
                clearInterval(timer);
                checkAnswer();
            }
        }, 1000);
    };

    const progress = (value) => {
        const percentage = ((parseInt(timePerQuestion.value) - value) / parseInt(timePerQuestion.value)) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = value;
    };

    const checkAnswer = () => {
        clearInterval(timer);
        const selectedAnswer = document.querySelector(".answer.selected");
        const correctAnswer = questions[currentQuestion].correct_answer;

        if (selectedAnswer) {
            const answerText = selectedAnswer.querySelector(".text").textContent;
            if (answerText === correctAnswer) {
                score++;
                selectedAnswer.classList.add("correct");
            } else {
                selectedAnswer.classList.add("wrong");
            }
        }

        document.querySelectorAll(".answer").forEach((answer) => {
            const answerText = answer.querySelector(".text").textContent;
            if (answerText === correctAnswer) {
                answer.classList.add("correct");
            }
            answer.classList.add("checked");
        });

        submitBtn.classList.add("hide");
        nextBtn.classList.remove("hide");
    };

    const showScore = () => {
        endScreen.classList.remove("hide");
        quiz.classList.add("hide");
        finalScore.textContent = score;
        totalScore.textContent = `/${questions.length}`;

        let feedback = "";
        if (score === questions.length) {
            feedback = "Feedback: Congratulations! You answered all the questions correctly. 🥳🥳";
        } else if (score >= 3 && score < questions.length) {
            feedback = "Feedback: Very good, you did well. 😊😊";
        } else {
            feedback = "Feedback: You should prepare before coming to the quiz game. 😒😒";
        }
        document.getElementById("feedback").textContent = feedback;
    };

    const nextQuestion = () => {
        currentQuestion++;
        showQuestion();
    };

    startBtn.addEventListener("click", startQuiz);
    submitBtn.addEventListener("click", checkAnswer);
    nextBtn.addEventListener("click", nextQuestion);

    const restartBtn = document.querySelector(".restart");
    restartBtn.addEventListener("click", () => {
        window.location.reload();
    });
});
