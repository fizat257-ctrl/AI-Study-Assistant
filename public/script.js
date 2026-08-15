// ==================================================
// START ASSISTANT
// ==================================================

function startAssistant() {
    const assistant = document.getElementById("assistant");

    if (assistant) {
        assistant.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ==================================================
// AI TUTOR PROGRESS SYSTEM
// ==================================================

function updateTutorProgress(questionText) {

    // ----------------------------------------------
    // Get previously studied topics
    // ----------------------------------------------

    let studiedTopics = [];

    try {

        studiedTopics =
            JSON.parse(
                localStorage.getItem("studiedTopics") || "[]"
            );

    } catch (error) {

        studiedTopics = [];

    }


    // ----------------------------------------------
    // Detect topic
    // ----------------------------------------------

    const question =
        questionText.toLowerCase();

    let topic = "General Study";


    if (
        question.includes("loop")
    ) {
        topic = "C++ Loops";
    }

    else if (
        question.includes("function")
    ) {
        topic = "C++ Functions";
    }

    else if (
        question.includes("array")
    ) {
        topic = "C++ Arrays";
    }

    else if (
        question.includes("if else") ||
        question.includes("if-else") ||
        question.includes("conditional")
    ) {
        topic = "C++ If-Else";
    }

    else if (
        question.includes("switch")
    ) {
        topic = "C++ Switch";
    }

    else if (
        question.includes("pointer")
    ) {
        topic = "C++ Pointers";
    }

    else if (
        question.includes("class")
    ) {
        topic = "C++ Classes";
    }

    else if (
        question.includes("artificial intelligence") ||
        question.includes("machine learning") ||
        question === "ai" ||
        question.includes("what is ai")
    ) {
        topic = "Artificial Intelligence";
    }


    // ----------------------------------------------
    // Add topic only if it is new
    // ----------------------------------------------

    if (!studiedTopics.includes(topic)) {

        studiedTopics.push(topic);

        localStorage.setItem(
            "studiedTopics",
            JSON.stringify(studiedTopics)
        );

    }


    // ----------------------------------------------
    // Topics Studied
    // ----------------------------------------------

    localStorage.setItem(
        "topicsStudied",
        studiedTopics.length
    );


    // ----------------------------------------------
    // AI Tutor Progress
    // ----------------------------------------------

    let tutorProgress =
        Number(
            localStorage.getItem("tutorProgress")
        ) || 0;


    // Increase progress only for a new topic

    if (
        !studiedTopics.includes(topic) === false
    ) {

        tutorProgress =
            Math.min(
                studiedTopics.length * 10,
                100
            );

    }


    localStorage.setItem(
        "tutorProgress",
        tutorProgress
    );


    // ----------------------------------------------
    // Recent Activity
    // ----------------------------------------------

    let activities = [];

    try {

        activities =
            JSON.parse(
                localStorage.getItem("studyActivity") || "[]"
            );

    } catch (error) {

        activities = [];

    }


    activities.push({

        icon: "🤖",

        text:
            "Asked AI Tutor: " +
            questionText,

        timestamp:
            new Date().toISOString()

    });


    // Keep latest 20 activities

    if (activities.length > 20) {

        activities =
            activities.slice(-20);

    }


    localStorage.setItem(
        "studyActivity",
        JSON.stringify(activities)
    );
}


// ==================================================
// AI STUDY ASSISTANT
// ==================================================

function askAssistant() {

    const questionInput =
        document.getElementById("question");

    const answer =
        document.getElementById("answer");

    if (!questionInput || !answer) {
        return;
    }

    const originalQuestion =
        questionInput.value.trim();

    const question =
        originalQuestion.toLowerCase();


    if (question === "") {

        answer.innerText =
            "Please enter a study question first.";

        return;
    }


    answer.innerText =
        "🤖 AI Study Assistant is thinking...";


    setTimeout(function () {

        let response = "";


        // ==========================================
        // LOOPS
        // ==========================================

        if (
            question.includes("loop") ||
            question.includes("loops")
        ) {

            response =
                "📚 C++ Loops\n\n" +

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


        // ==========================================
        // FUNCTIONS
        // ==========================================

        else if (
            question.includes("function") ||
            question.includes("functions")
        ) {

            response =
                "📘 C++ Functions\n\n" +

                "A function is a reusable block of code " +
                "that performs a specific task.\n\n" +

                "Example:\n\n" +

                "int add(int a, int b) {\n" +
                "    return a + b;\n" +
                "}\n\n" +

                "Functions make programs easier to " +
                "organize and reuse.";

        }


        // ==========================================
        // ARRAYS
        // ==========================================

        else if (
            question.includes("array") ||
            question.includes("arrays")
        ) {

            response =
                "📊 C++ Arrays\n\n" +

                "An array stores multiple values of " +
                "the same data type in one variable.\n\n" +

                "Example:\n\n" +

                "int marks[5] = {80, 75, 90, 85, 70};\n\n" +

                "Here, marks stores five integer values.";

        }


        // ==========================================
        // IF ELSE
        // ==========================================

        else if (
            question.includes("if else") ||
            question.includes("if-else") ||
            question.includes("conditional")
        ) {

            response =
                "🔀 If-Else in C++\n\n" +

                "An if-else statement is used to make " +
                "decisions in a program.\n\n" +

                "Example:\n\n" +

                "if(age >= 18) {\n" +
                "    cout << \"Adult\";\n" +
                "} else {\n" +
                "    cout << \"Minor\";\n" +
                "}\n\n" +

                "The program executes different code " +
                "depending on the condition.";

        }


        // ==========================================
        // SWITCH
        // ==========================================

        else if (
            question.includes("switch")
        ) {

            response =
                "🔄 Switch Statement in C++\n\n" +

                "A switch statement is useful when you " +
                "want to select one option from multiple cases.";

        }


        // ==========================================
        // POINTERS
        // ==========================================

        else if (
            question.includes("pointer") ||
            question.includes("pointers")
        ) {

            response =
                "📍 C++ Pointers\n\n" +

                "A pointer is a variable that stores " +
                "the memory address of another variable.\n\n" +

                "Example:\n\n" +

                "int number = 10;\n" +
                "int *ptr = &number;";

        }


        // ==========================================
        // CLASSES
        // ==========================================

        else if (
            question.includes("class") ||
            question.includes("classes")
        ) {

            response =
                "🏗️ C++ Classes\n\n" +

                "A class is a user-defined data type " +
                "that can contain data members and member functions.";

        }


        // ==========================================
        // AI
        // ==========================================

        else if (
            question.includes("artificial intelligence") ||
            question.includes("machine learning") ||
            question === "ai" ||
            question.includes("what is ai")
        ) {

            response =
                "🤖 Artificial Intelligence\n\n" +

                "Artificial Intelligence is technology " +
                "that enables computers to perform tasks " +
                "that normally require human intelligence.";

        }


        // ==========================================
        // DEFAULT
        // ==========================================

        else {

            response =
                "🎓 AI Study Assistant\n\n" +

                "I received your question:\n\n" +

                "\"" + originalQuestion + "\"\n\n" +

                "Try asking about:\n\n" +

                "• C++ Loops\n" +
                "• Functions\n" +
                "• Arrays\n" +
                "• If-Else\n" +
                "• Switch\n" +
                "• Pointers\n" +
                "• Classes\n" +
                "• Artificial Intelligence";

        }


        // Show answer

        answer.innerText =
            response;


        // Update progress

        updateTutorProgress(
            originalQuestion
        );


    }, 600);
}


// ==================================================
// NOTES SUMMARIZER
// ==================================================

function summarizeNotes() {

    const notesElement =
        document.getElementById("notesInput") ||
        document.getElementById("notes");

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
            "Review the main concepts and important keywords.";

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


    setTimeout(function () {

        studyPlan.innerText =
            "📚 Study Plan\n\n" +
            "Subject: " + subject + "\n" +
            "Total Time: " + time + " minutes\n\n" +
            "Review → Learn → Practice → Revise";

    }, 600);
}