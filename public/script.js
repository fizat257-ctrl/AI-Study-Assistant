// ==================================================
// START ASSISTANT
// ==================================================

function startAssistant() {

    document.getElementById("assistant").scrollIntoView({
        behavior: "smooth"
    });

}


// ==================================================
// AI STUDY ASSISTANT
// ==================================================

function askAssistant() {

    const question = document
        .getElementById("question")
        .value
        .trim()
        .toLowerCase();

    const answer =
        document.getElementById("answer");


    if (question === "") {

        answer.innerText =
            "Please enter a study question first.";

        return;

    }


    answer.innerText =
        "🤖 AI Study Assistant is thinking...";


    setTimeout(function () {

        let response = "";


        // ------------------------------------------
        // C++ / LOOPS
        // ------------------------------------------

        if (
            question.includes("loop") ||
            question.includes("loops") ||
            question.includes("c++")
        ) {

            response =
                "📚 C++ Study Explanation\n\n" +

                "A loop is used to repeat a block of " +
                "code multiple times.\n\n" +

                "Main types of loops in C++:\n\n" +

                "1. for loop\n" +
                "2. while loop\n" +
                "3. do-while loop\n\n" +

                "Example:\n\n" +

                "for(int i = 1; i <= 5; i++) {\n" +
                "    cout << i;\n" +
                "}\n\n" +

                "This loop prints numbers from 1 to 5.";

        }


        // ------------------------------------------
        // FUNCTION
        // ------------------------------------------

        else if (question.includes("function")) {

            response =
                "📘 Function Explanation\n\n" +

                "A function is a reusable block of code " +
                "that performs a specific task.\n\n" +

                "Example:\n\n" +

                "int add(int a, int b) {\n" +
                "    return a + b;\n" +
                "}\n\n" +

                "Functions make programs easier to organize " +
                "and reuse.";

        }


        // ------------------------------------------
        // ARRAY
        // ------------------------------------------

        else if (question.includes("array")) {

            response =
                "📊 Array Explanation\n\n" +

                "An array stores multiple values of the " +
                "same data type in one variable.\n\n" +

                "Example:\n\n" +

                "int marks[5] = {80, 75, 90, 85, 70};\n\n" +

                "Here, marks stores five integer values.";

        }


        // ------------------------------------------
        // AI
        // ------------------------------------------

        else if (
            question.includes("artificial intelligence") ||
            question.includes("machine learning") ||
            question.includes("ai")
        ) {

            response =
                "🤖 AI Explanation\n\n" +

                "Artificial Intelligence (AI) is technology " +
                "that enables computers to perform tasks " +
                "that normally require human intelligence.\n\n" +

                "Examples include learning, understanding " +
                "language, recognizing patterns and answering questions.";

        }


        // ------------------------------------------
        // DEFAULT
        // ------------------------------------------

        else {

            response =
                "🎓 AI Study Assistant\n\n" +

                "I received your question:\n\n" +

                '"' + question + '"\n\n' +

                "This demo currently supports explanations " +
                "for C++, loops, functions, arrays and AI.\n\n" +

                "Try asking:\n" +

                "• Explain loops in C++\n" +
                "• What is a function?\n" +
                "• Explain arrays\n" +
                "• What is Artificial Intelligence?";

        }


        answer.innerText = response;

    }, 800);

}


// ==================================================
// NOTES SUMMARIZER
// ==================================================

function summarizeNotes() {

    const notes =
        document.getElementById("notes")
        .value
        .trim();

    const summary =
        document.getElementById("summary");


    if (notes === "") {

        summary.innerText =
            "Please paste your notes first.";

        return;

    }


    summary.innerText =
        "📝 Creating summary...";


    setTimeout(function () {

        const words =
            notes.split(/\s+/);


        let shortSummary =
            words.slice(0, 60).join(" ");


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

    }, 800);

}


// ==================================================
// QUIZ GENERATOR
// ==================================================

function generateQuiz() {

    const topic =
        document.getElementById("quizTopic")
        .value
        .trim()
        .toLowerCase();

    const quizContainer =
        document.getElementById("quizContainer");


    if (topic === "") {

        quizContainer.innerText =
            "Please enter a topic first.";

        return;

    }


    quizContainer.innerHTML =
        "🤖 Generating your quiz...";


    setTimeout(function () {

        let quiz = "";


        // ------------------------------------------
        // C++ LOOP QUIZ
        // ------------------------------------------

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


        // ------------------------------------------
        // DEFAULT QUIZ
        // ------------------------------------------

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

    }, 800);

}


// ==================================================
// QUIZ RESULT
// ==================================================

function showQuizResult(result) {

    const quizContainer =
        document.getElementById("quizContainer");


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

    const subject =
        document.getElementById("subject")
        .value
        .trim();

    const studyTime =
        document.getElementById("studyTime")
        .value;

    const studyPlan =
        document.getElementById("studyPlan");


    if (subject === "" || studyTime === "") {

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

    }, 800);

}