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
// AI STUDY ASSISTANT - LOCAL DEMO
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

                "int marks[5] = " +
                "{80, 75, 90, 85, 70};\n\n" +

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
                "want to select one option from multiple " +
                "possible cases.\n\n" +

                "Example:\n\n" +

                "switch(choice) {\n" +

                "case 1:\n" +
                "    cout << \"Add\";\n" +
                "    break;\n\n" +

                "case 2:\n" +
                "    cout << \"Exit\";\n" +
                "    break;\n\n" +

                "default:\n" +
                "    cout << \"Invalid choice\";\n" +

                "}\n\n" +

                "The break statement stops execution " +
                "from continuing into the next case.";

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
                "int *ptr = &number;\n\n" +

                "& gives the address of a variable, " +
                "while * is used to access the value " +
                "stored at that address.";

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
                "that can contain data members and " +
                "member functions.\n\n" +

                "Example:\n\n" +

                "class Student {\n" +
                "public:\n" +
                "    string name;\n" +
                "    void study() {\n" +
                "        cout << \"Studying\";\n" +
                "    }\n" +
                "};\n\n" +

                "Classes are an important part of " +
                "Object-Oriented Programming.";

        }


        // ==========================================
        // ARTIFICIAL INTELLIGENCE
        // ==========================================

        else if (
            question.includes("artificial intelligence") ||
            question.includes("machine learning") ||
            question === "ai" ||
            question.includes("what is ai")
        ) {

            response =
                "🤖 Artificial Intelligence\n\n" +

                "Artificial Intelligence (AI) is " +
                "technology that enables computers " +
                "to perform tasks that normally require " +
                "human intelligence.\n\n" +

                "Examples include:\n\n" +

                "• Understanding language\n" +
                "• Recognizing patterns\n" +
                "• Answering questions\n" +
                "• Learning from data\n\n" +

                "AI is used in education, healthcare, " +
                "business, robotics and many other fields.";

        }


        // ==========================================
        // DEFAULT
        // ==========================================

        else {

            response =
                "🎓 AI Study Assistant\n\n" +

                "I received your question:\n\n" +

                "\"" + originalQuestion + "\"\n\n" +

                "This demo currently supports these " +
                "study topics:\n\n" +

                "• C++ Loops\n" +
                "• Functions\n" +
                "• Arrays\n" +
                "• If-Else\n" +
                "• Switch\n" +
                "• Pointers\n" +
                "• Classes\n" +
                "• Artificial Intelligence\n\n" +

                "Try asking:\n\n" +

                "• Explain loops in C++\n" +
                "• What is a function?\n" +
                "• Explain arrays\n" +
                "• What is a pointer?\n" +
                "• What is Artificial Intelligence?";

        }


        answer.innerText =
            response;

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