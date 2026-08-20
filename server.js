require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;


// ==================================================
// GEMINI MODEL
// ==================================================

const MODEL = "gemini-2.5-flash";


// ==================================================
// GEMINI AI
// ==================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ==================================================
// HELPER FUNCTIONS
// ==================================================

function getErrorMessage(error) {

    if (!error) {
        return "Unknown error.";
    }

    if (typeof error === "string") {
        return error;
    }

    if (error.message) {
        return String(error.message);
    }

    if (error.error?.message) {
        return String(error.error.message);
    }

    if (error.details) {

        if (typeof error.details === "string") {
            return error.details;
        }

        try {
            return JSON.stringify(error.details);
        } catch (e) {
            return "An unexpected error occurred.";
        }
    }

    try {
        return JSON.stringify(error);
    } catch (e) {
        return "An unexpected error occurred.";
    }
}


function sendAPIError(res, statusCode, errorMessage) {

    return res.status(statusCode).json({

        success: false,

        error:
            String(
                errorMessage ||
                "An unexpected error occurred."
            )

    });

}


// ==================================================
// CLEAN AI JSON
// ==================================================

function cleanJSON(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

}


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
    express.json({
        limit: "15mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "15mb"
    })
);


// ==================================================
// STATIC PUBLIC FILES
// ==================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "auth.html"
        )
    );

});


// ==================================================
// AUTH
// ==================================================

app.get("/auth.html", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "auth.html"
        )
    );

});


// ==================================================
// DASHBOARD
// ==================================================

app.get("/dashboard.html", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "dashboard.html"
        )
    );

});


// ==================================================
// AI TUTOR
// ==================================================

app.post("/api/study", async (req, res) => {

    try {

        const question = req.body.question;


        if (
            !question ||
            typeof question !== "string" ||
            !question.trim()
        ) {

            return sendAPIError(
                res,
                400,
                "Please enter a study question."
            );

        }


        console.log(
            "AI Tutor question:",
            question.trim()
        );


        const prompt = `
You are an AI Study Assistant and AI Tutor.

Answer the student's actual academic question.

The student can ask about ANY educational subject, including:

Physics
Chemistry
Mathematics
Biology
Computer Science
Programming
C++
English
Artificial Intelligence
History
Geography
Economics
Business
Commerce
E-commerce
and other school or university subjects.

Do NOT restrict the student to a fixed topic list.

Give a clear, accurate and student-friendly answer.

Use simple English.

For mathematics:
- show steps
- explain formulas
- give the final answer

For science:
- explain the concept
- give examples where useful

For programming:
- explain the concept
- provide correct code when useful

Student Question:

${question.trim()}
`;


        const response =
            await ai.models.generateContent({

                model: MODEL,

                contents: prompt

            });


        const answer =
            response.text || "";


        if (
            !answer ||
            !answer.trim()
        ) {

            return sendAPIError(
                res,
                500,
                "AI returned an empty answer."
            );

        }


        return res.json({

            success: true,

            answer:
                answer.trim()

        });


    } catch (error) {

        console.error(
            "AI TUTOR ERROR:",
            error
        );


        return sendAPIError(
            res,
            500,
            getErrorMessage(error)
        );

    }

});


// ==================================================
// AI FLASHCARDS
// ==================================================

app.post("/api/flashcards", async (req, res) => {

    try {

        const topic = req.body.topic;


        if (
            !topic ||
            typeof topic !== "string" ||
            !topic.trim()
        ) {

            return sendAPIError(
                res,
                400,
                "Please enter a study topic."
            );

        }


        console.log(
            "Generating flashcards:",
            topic.trim()
        );


        const prompt = `
You are an AI Study Assistant.

Create exactly 5 useful study flashcards about:

${topic.trim()}

The topic can belong to ANY academic subject.

Return ONLY valid JSON.

Use exactly this structure:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

Rules:

1. Exactly 5 flashcards.
2. Every question must be directly related to the requested topic.
3. Answers must be accurate.
4. Use simple student-friendly language.
5. Do not create unrelated questions.
6. Do not use Markdown.
7. Return ONLY JSON.
`;


        const response =
            await ai.models.generateContent({

                model: MODEL,

                contents: prompt

            });


        const text =
            cleanJSON(response.text || "");


        const start =
            text.indexOf("[");

        const end =
            text.lastIndexOf("]");


        if (
            start === -1 ||
            end === -1
        ) {

            return sendAPIError(
                res,
                500,
                "AI did not return valid flashcards."
            );

        }


        let flashcards;


        try {

            flashcards =
                JSON.parse(
                    text.substring(
                        start,
                        end + 1
                    )
                );

        } catch (error) {

            console.error(
                "FLASHCARD JSON ERROR:",
                error
            );

            return sendAPIError(
                res,
                500,
                "AI returned invalid flashcard data."
            );

        }


        if (
            !Array.isArray(flashcards)
        ) {

            return sendAPIError(
                res,
                500,
                "Invalid flashcard format."
            );

        }


        return res.json({

            success: true,

            flashcards:
                flashcards.slice(0, 5)

        });


    } catch (error) {

        console.error(
            "FLASHCARD ERROR:",
            error
        );


        return sendAPIError(
            res,
            500,
            getErrorMessage(error)
        );

    }

});


// ==================================================
// AI QUIZ API
// ==================================================

app.post("/api/quiz", async (req, res) => {

    try {

        const topic = req.body.topic;


        if (
            !topic ||
            typeof topic !== "string" ||
            !topic.trim()
        ) {

            return sendAPIError(
                res,
                400,
                "Please enter a quiz topic."
            );

        }


        console.log(
            "AI QUIZ REQUEST:",
            topic.trim()
        );


        const prompt = `
You are an expert AI quiz generator.

Create a useful multiple-choice quiz specifically
about this academic topic:

${topic.trim()}

The topic may be ANY subject such as:

Physics
Chemistry
Mathematics
Biology
Computer Science
Programming
C++
History
Geography
English
Business
Commerce
or any other academic subject.

IMPORTANT:

Do NOT create generic questions such as:
"What is the main purpose of studying this topic?"
"What is a good way to learn this topic?"

Instead, create REAL questions about the actual
content, concepts, facts, formulas, definitions,
applications or examples of the requested topic.

Create exactly 5 questions.

Each question must have exactly 4 options.

Only ONE option must be correct.

Return ONLY valid JSON.

Use exactly this structure:

[
  {
    "question": "Actual question about the topic",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": 0
  }
]

The answer number means:

0 = first option
1 = second option
2 = third option
3 = fourth option

Rules:

1. Questions must be directly related to the requested topic.
2. Make questions educational and meaningful.
3. Mix easy, medium and slightly challenging questions.
4. Avoid duplicate questions.
5. Correct answers must be factually accurate.
6. Do not put explanations inside the JSON.
7. Return ONLY JSON.
`;


        const response =
            await ai.models.generateContent({

                model: MODEL,

                contents: prompt

            });


        const text =
            cleanJSON(response.text || "");


        const start =
            text.indexOf("[");

        const end =
            text.lastIndexOf("]");


        if (
            start === -1 ||
            end === -1
        ) {

            console.error(
                "QUIZ RAW RESPONSE:",
                text
            );

            return sendAPIError(
                res,
                500,
                "AI did not return valid quiz data."
            );

        }


        let quiz;


        try {

            quiz =
                JSON.parse(
                    text.substring(
                        start,
                        end + 1
                    )
                );

        } catch (error) {

            console.error(
                "QUIZ JSON ERROR:",
                error
            );

            return sendAPIError(
                res,
                500,
                "AI returned invalid quiz data."
            );

        }


        if (
            !Array.isArray(quiz) ||
            quiz.length === 0
        ) {

            return sendAPIError(
                res,
                500,
                "Quiz data is empty."
            );

        }


        return res.json({

            success: true,

            quiz:
                quiz.slice(0, 5)

        });


    } catch (error) {

        console.error(
            "QUIZ AI ERROR:",
            error
        );


        return sendAPIError(
            res,
            500,
            getErrorMessage(error)
        );

    }

});
// ==================================================
// AI PRACTICE MODE API
// ==================================================

app.post("/api/practice", async (req, res) => {

    try {

        const topic = req.body.topic;


        // ------------------------------------------
        // CHECK TOPIC
        // ------------------------------------------

        if (
            !topic ||
            typeof topic !== "string" ||
            !topic.trim()
        ) {

            return sendAPIError(
                res,
                400,
                "Please enter a practice topic."
            );

        }


        console.log(
            "AI PRACTICE REQUEST:",
            topic.trim()
        );


        // ------------------------------------------
        // AI PROMPT
        // ------------------------------------------

        const prompt = `
You are an expert AI Study Assistant.

Create a practice quiz specifically about:

${topic.trim()}

The topic can be ANY academic subject.

Examples include:

Physics
Chemistry
Mathematics
Biology
Computer Science
Programming
C++
English
History
Geography
Economics
Business
Commerce
and other academic subjects.

IMPORTANT:

The questions MUST be about the actual
content of the requested topic.

For example:

If the topic is "Force", ask questions
about force, Newton's laws, formula,
units, effects of force, mass and
acceleration, etc.

If the topic is "Periodic Table", ask
questions about elements, groups,
periods, atomic number, symbols,
periodic trends, etc.

If the topic is "C++ Loops", ask questions
about for, while, do-while, break,
continue, iteration, etc.

DO NOT create generic questions such as:

"What is the main purpose of studying?"

"What is a good way to learn this topic?"

"What should you do after completing the topic?"

Those are NOT acceptable.

Create exactly 5 meaningful multiple-choice
practice questions.

Each question must have exactly 4 options.

Only ONE option must be correct.

Return ONLY valid JSON.

Use exactly this structure:

[
  {
    "question": "Actual question about the topic",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": 0
  }
]

Answer numbers:

0 = first option
1 = second option
2 = third option
3 = fourth option

Rules:

1. Every question must directly relate
   to the requested topic.

2. Questions must be factually accurate.

3. Include a mixture of easy and
   medium-level questions.

4. Do not repeat questions.

5. Do not use unrelated C++ questions
   when the requested topic is Physics,
   Chemistry, Mathematics, etc.

6. Do not add explanations.

7. Do not add Markdown.

8. Return ONLY the JSON array.
`;


        // ------------------------------------------
        // GEMINI REQUEST
        // ------------------------------------------

        const response =
            await ai.models.generateContent({

                model: MODEL,

                contents: prompt

            });


        // ------------------------------------------
        // CLEAN RESPONSE
        // ------------------------------------------

        const text =
            cleanJSON(
                response.text || ""
            );


        console.log(
            "Practice AI response received."
        );


        // ------------------------------------------
        // FIND JSON
        // ------------------------------------------

        const start =
            text.indexOf("[");

        const end =
            text.lastIndexOf("]");


        if (
            start === -1 ||
            end === -1
        ) {

            console.error(
                "PRACTICE RAW RESPONSE:",
                text
            );

            return sendAPIError(
                res,
                500,
                "AI did not return valid practice questions."
            );

        }


        // ------------------------------------------
        // PARSE JSON
        // ------------------------------------------

        let practiceQuestions;


        try {

            practiceQuestions =
                JSON.parse(
                    text.substring(
                        start,
                        end + 1
                    )
                );

        } catch (error) {

            console.error(
                "PRACTICE JSON ERROR:",
                error
            );

            return sendAPIError(
                res,
                500,
                "AI returned invalid practice question data."
            );

        }


        // ------------------------------------------
        // VALIDATE ARRAY
        // ------------------------------------------

        if (
            !Array.isArray(
                practiceQuestions
            ) ||
            practiceQuestions.length === 0
        ) {

            return sendAPIError(
                res,
                500,
                "No practice questions were generated."
            );

        }


        // ------------------------------------------
        // VALIDATE QUESTIONS
        // ------------------------------------------

        const validQuestions =
            practiceQuestions
                .filter(function(q) {

                    return (

                        q &&

                        typeof q.question ===
                        "string" &&

                        Array.isArray(
                            q.options
                        ) &&

                        q.options.length === 4 &&

                        Number.isInteger(
                            q.answer
                        ) &&

                        q.answer >= 0 &&

                        q.answer <= 3

                    );

                })
                .slice(0, 5);


        // ------------------------------------------
        // CHECK VALID QUESTIONS
        // ------------------------------------------

        if (
            validQuestions.length === 0
        ) {

            return sendAPIError(
                res,
                500,
                "AI generated an invalid practice quiz."
            );

        }


        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        console.log(
            "Practice questions generated:",
            validQuestions.length
        );


        return res.status(200).json({

            success: true,

            topic:
                topic.trim(),

            questions:
                validQuestions

        });


    } catch (error) {

        console.error(
            "PRACTICE AI ERROR:",
            error
        );


        return sendAPIError(
            res,
            500,
            getErrorMessage(error)
        );

    }

});


// ==================================================
// PDF → AI SUMMARY
// ==================================================

app.post(
    "/api/pdf-summary",
    async (req, res) => {

        try {

            let text =
                req.body.text;


            if (
                !text ||
                typeof text !== "string" ||
                !text.trim()
            ) {

                return sendAPIError(
                    res,
                    400,
                    "PDF text is required."
                );

            }


            text =
                text
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            const MAX_TEXT_LENGTH =
                120000;


            if (
                text.length >
                MAX_TEXT_LENGTH
            ) {

                text =
                    text.substring(
                        0,
                        MAX_TEXT_LENGTH
                    );

            }


            console.log(
                "PDF SUMMARY REQUEST RECEIVED"
            );


            const prompt = `
You are an AI Study Assistant.

Read the following study material.

Create a clear and accurate study summary.

Use these sections:

SHORT SUMMARY:

MAIN CONCEPTS:

IMPORTANT POINTS:

KEY TERMS:

STUDY TIPS:

Rules:

- Use simple English.
- Keep information accurate.
- Do not invent information.
- Only use the provided study material.
- Make the summary useful for students.

STUDY MATERIAL:

${text}
`;


            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt

                });


            const summary =
                response.text || "";


            if (
                !summary ||
                !summary.trim()
            ) {

                return sendAPIError(
                    res,
                    500,
                    "AI returned an empty summary."
                );

            }


            return res.status(200).json({

                success: true,

                summary:
                    summary.trim()

            });


        } catch (error) {

            console.error(
                "PDF SUMMARY ERROR:",
                error
            );


            return sendAPIError(
                res,
                500,
                getErrorMessage(error)
            );

        }

    }
);


// ==================================================
// PDF → ASK AI QUESTION
// ==================================================

app.post(
    "/api/pdf-question",
    async (req, res) => {

        try {

            let text =
                req.body.text;

            let question =
                req.body.question;


            if (
                !text ||
                typeof text !== "string" ||
                !text.trim()
            ) {

                return sendAPIError(
                    res,
                    400,
                    "PDF text is required."
                );

            }


            if (
                !question ||
                typeof question !== "string" ||
                !question.trim()
            ) {

                return sendAPIError(
                    res,
                    400,
                    "Please enter a question about the PDF."
                );

            }


            text =
                text
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            question =
                question
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            const MAX_TEXT_LENGTH =
                120000;


            if (
                text.length >
                MAX_TEXT_LENGTH
            ) {

                text =
                    text.substring(
                        0,
                        MAX_TEXT_LENGTH
                    );

            }


            const prompt = `
You are an AI Study Assistant.

A student has provided study material
from a PDF.

Answer the student's question using
the provided PDF material.

PDF CONTENT:

${text}

STUDENT QUESTION:

${question}

Rules:

1. Use the PDF content.
2. Give a clear student-friendly answer.
3. Do not invent information.
4. If the answer is not available,
say that it could not be found
in the provided PDF.
`;


            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt

                });


            const answer =
                response.text || "";


            if (
                !answer ||
                !answer.trim()
            ) {

                return sendAPIError(
                    res,
                    500,
                    "AI returned an empty answer."
                );

            }


            return res.status(200).json({

                success: true,

                answer:
                    answer.trim()

            });


        } catch (error) {

            console.error(
                "PDF QUESTION ERROR:",
                error
            );


            return sendAPIError(
                res,
                500,
                getErrorMessage(error)
            );

        }

    }
);
// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {

    return res.status(200).json({

        success: true,

        message:
            "AI Study Assistant server is running.",

        model:
            MODEL

    });

});


// ==================================================
// 404 API HANDLER
// ==================================================

app.use("/api", (req, res) => {

    return sendAPIError(
        res,
        404,
        "API endpoint not found."
    );

});


// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use((error, req, res, next) => {

    console.error(
        "GLOBAL SERVER ERROR:",
        error
    );


    if (res.headersSent) {

        return next(error);

    }


    return sendAPIError(
        res,
        500,
        getErrorMessage(error)
    );

});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

    console.log(
        "=========================================="
    );

    console.log(
        "🤖 AI Study Assistant Server Started"
    );

    console.log(
        "=========================================="
    );

    console.log(
        "Port:",
        PORT
    );

    console.log(
        "Model:",
        MODEL
    );

    console.log(
        "Environment:",
        process.env.NODE_ENV || "development"
    );

    console.log(
        "=========================================="
    );

}); 