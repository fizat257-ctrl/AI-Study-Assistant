// ==================================================
// START ASSISTANT
// ==================================================

function startAssistant() {

    const assistant =
        document.getElementById("assistant");

    if (assistant) {

        assistant.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// ==================================================
// STUDY ACTIVITY HELPER
// ==================================================

function addStudyActivity(icon, text) {

    const activities =
        JSON.parse(
            localStorage.getItem("studyActivity") || "[]"
        );

    activities.push({
        icon: icon,
        text: text,
        time: new Date().toLocaleString()
    });

    // Keep latest 20 activities
    const limitedActivities =
        activities.slice(-20);

    localStorage.setItem(
        "studyActivity",
        JSON.stringify(limitedActivities)
    );
}


// ==================================================
// AI TUTOR
// CONNECTED TO GEMINI BACKEND
// ==================================================

async function askAssistant() {

    const questionInput =
        document.getElementById("question");

    const answer =
        document.getElementById("answer");

    const askButton =
        document.getElementById("askButton");


    if (!questionInput || !answer) {
        return;
    }


    // ----------------------------------------------
    // GET QUESTION
    // ----------------------------------------------

    const originalQuestion =
        questionInput.value.trim();


    // ----------------------------------------------
    // CHECK EMPTY QUESTION
    // ----------------------------------------------

    if (originalQuestion === "") {

        answer.innerText =
            "Please enter a study question first.";

        return;
    }


    // ----------------------------------------------
    // SHOW LOADING
    // ----------------------------------------------

    answer.innerText =
        "🤖 AI Study Assistant is thinking...";


    if (askButton) {

        askButton.disabled = true;

        askButton.innerText =
            "Thinking...";

    }


    try {

        // ------------------------------------------
        // SEND QUESTION TO BACKEND
        // ------------------------------------------

        const response =
            await fetch(
                "/api/study",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                originalQuestion
                        })

                }
            );


        // ------------------------------------------
        // GET API RESPONSE
        // ------------------------------------------

        const data =
            await response.json();


        // ------------------------------------------
        // CHECK API RESPONSE
        // ------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Unable to get AI response."
            );

        }


        // ------------------------------------------
        // DISPLAY AI ANSWER
        // ------------------------------------------

        answer.innerText =
            data.answer ||
            "AI did not return an answer.";


        // ------------------------------------------
        // UPDATE TOPICS STUDIED
        // ------------------------------------------

        let topics =
            Number(
                localStorage.getItem(
                    "topicsStudied"
                )
            ) || 0;


        topics += 1;


        localStorage.setItem(
            "topicsStudied",
            topics
        );


        // ------------------------------------------
        // UPDATE AI TUTOR PROGRESS
        // ------------------------------------------

        let tutorProgress =
            Number(
                localStorage.getItem(
                    "tutorProgress"
                )
            ) || 0;


        tutorProgress =
            Math.min(
                tutorProgress + 10,
                100
            );


        localStorage.setItem(
            "tutorProgress",
            tutorProgress
        );


        // ------------------------------------------
        // ADD RECENT ACTIVITY
        // ------------------------------------------

        addStudyActivity(
            "🤖",
            "AI Tutor question: " +
            originalQuestion
        );


        // ------------------------------------------
        // OVERALL LEARNING PROGRESS
        // ------------------------------------------

        const flashcardProgress =
            Number(
                localStorage.getItem(
                    "flashcardProgress"
                )
            ) || 0;


        const overall =
            Math.round(
                (
                    tutorProgress +
                    flashcardProgress
                ) / 2
            );


        localStorage.setItem(
            "overallProgress",
            overall
        );


    } catch (error) {

        console.error(
            "AI TUTOR ERROR:",
            error
        );


        answer.innerText =
            "❌ Sorry, I could not get an AI answer.\n\n" +
            error.message;

    } finally {

        // ------------------------------------------
        // ENABLE BUTTON AGAIN
        // ------------------------------------------

        if (askButton) {

            askButton.disabled = false;

            askButton.innerText =
                "Ask AI";

        }

    }

}


// ==================================================
// NOTES SUMMARIZER
// ==================================================

function summarizeNotes() {

    const notesElement =
        document.getElementById("notesInput");

    const summary =
        document.getElementById("summary");


    if (!notesElement || !summary) {
        return;
    }


    const notes =
        notesElement.value.trim();


    if (notes === "") {

        summary.innerText =
            "Please paste your notes first.";

        return;
    }


    summary.innerText =
        "📝 Creating summary...";


    // Recent Activity

    addStudyActivity(
        "📝",
        "Notes summarized"
    );


    setTimeout(function () {

        const words =
            notes.split(/\s+/);


        let shortSummary =
            words
                .slice(0, 60)
                .join(" ");


        if (words.length > 60) {

            shortSummary += "...";

        }


        summary.innerText =
            "📝 Study Summary\n\n" +
            shortSummary +
            "\n\n" +
            "💡 Study Tip:\n" +
            "Review the main concepts and important " +
            "keywords from these notes.";

    }, 600);
}


// ==================================================
// QUIZ GENERATOR
// ==================================================

function generateQuiz() {

    const topicElement =
        document.getElementById("quizTopic");

    const quizContainer =
        document.getElementById("quizContainer");


    if (!topicElement || !quizContainer) {
        return;
    }


    const topic =
        topicElement.value.trim().toLowerCase();


    if (topic === "") {

        quizContainer.innerText =
            "Please enter a topic first.";

        return;
    }


    quizContainer.innerHTML =
        "🤖 Generating your quiz...";


    // Recent Activity

    addStudyActivity(
        "🧠",
        "Quiz generated: " + topic
    );


    setTimeout(function () {

        let quiz = "";


        if (
            topic.includes("loop") ||
            topic.includes("c++")
        ) {

            quiz = `

                <h3>📚 C++ Loops Quiz</h3>

                <p>
                    <strong>Question 1:</strong>
                </p>

                <p>
                    Which loop is commonly used when
                    the number of iterations is known?
                </p>

                <button onclick="showQuizResult('correct')">
                    A. for loop
                </button>

                <button onclick="showQuizResult('wrong')">
                    B. switch
                </button>

                <button onclick="showQuizResult('wrong')">
                    C. if statement
                </button>

                <br><br>

                <p>
                    <strong>Question 2:</strong>
                </p>

                <p>
                    Which loop checks its condition
                    before executing the body?
                </p>

                <button onclick="showQuizResult('correct')">
                    A. while loop
                </button>

                <button onclick="showQuizResult('wrong')">
                    B. do-while only
                </button>

                <button onclick="showQuizResult('wrong')">
                    C. switch
                </button>

                <br><br>

                <p>
                    <strong>Question 3:</strong>
                </p>

                <p>
                    Which operator increases a variable
                    by one?
                </p>

                <button onclick="showQuizResult('correct')">
                    A. ++
                </button>

                <button onclick="showQuizResult('wrong')">
                    B. ==
                </button>

                <button onclick="showQuizResult('wrong')">
                    C. &&
                </button>

            `;

        }

        else {

            quiz = `

                <h3>🎓 Practice Quiz</h3>

                <p>
                    Topic:
                    <strong>${topic}</strong>
                </p>

                <p>
                    This demo quiz currently works best
                    with C++ and programming topics.
                </p>

                <p>
                    Try entering:
                    <strong>C++ Loops</strong>
                </p>

            `;

        }


        quizContainer.innerHTML =
            quiz;

    }, 600);
}


// ==================================================
// QUIZ RESULT
// ==================================================

function showQuizResult(result) {

    const quizContainer =
        document.getElementById("quizContainer");


    if (!quizContainer) {
        return;
    }


    if (result === "correct") {

        quizContainer.innerHTML +=
            "<p><strong>✅ Correct answer!</strong></p>";

    }

    else {

        quizContainer.innerHTML +=
            "<p><strong>❌ Incorrect answer. Try again!</strong></p>";

    }

}


// ==================================================
// STUDY PLANNER
// ==================================================

function createStudyPlan() {

    const subjectElement =
        document.getElementById("subject");

    const studyTimeElement =
        document.getElementById("studyTime");

    const studyPlan =
        document.getElementById("studyPlan");


    if (
        !subjectElement ||
        !studyTimeElement ||
        !studyPlan
    ) {
        return;
    }


    const subject =
        subjectElement.value.trim();

    const studyTime =
        studyTimeElement.value;


    if (
        subject === "" ||
        studyTime === ""
    ) {

        studyPlan.innerText =
            "Please enter your subject and study time.";

        return;
    }


    const time =
        Number(studyTime);


    if (time <= 0) {

        studyPlan.innerText =
            "Please enter a valid study time.";

        return;
    }


    studyPlan.innerText =
        "📅 Creating your study plan...";


    // Recent Activity

    addStudyActivity(
        "📅",
        "Study plan created: " + subject
    );


    setTimeout(function () {

        let plan = "";


        if (time <= 30) {

            plan =
                "📚 Study Plan\n\n" +

                "Subject: " + subject + "\n" +
                "Total Time: " + time + " minutes\n\n" +

                "1. 5 minutes — Review previous concepts\n" +
                "2. 15 minutes — Study the main topic\n" +
                "3. 5 minutes — Practice questions\n" +
                "4. 5 minutes — Quick revision";

        }

        else if (time <= 60) {

            plan =
                "📚 Study Plan\n\n" +

                "Subject: " + subject + "\n" +
                "Total Time: " + time + " minutes\n\n" +

                "1. 10 minutes — Review previous concepts\n" +
                "2. 25 minutes — Learn the main topic\n" +
                "3. 15 minutes — Practice questions\n" +
                "4. 10 minutes — Revision";

        }

        else {

            plan =
                "📚 Study Plan\n\n" +

                "Subject: " + subject + "\n" +
                "Total Time: " + time + " minutes\n\n" +

                "1. 15 minutes — Previous topic revision\n" +
                "2. 30 minutes — Learn new concepts\n" +
                "3. 15 minutes — Short break\n" +
                "4. 30 minutes — Practice questions\n" +
                "5. 15 minutes — Final revision";

        }


        studyPlan.innerText =
            plan;

    }, 600);
}