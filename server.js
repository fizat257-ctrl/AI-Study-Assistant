require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;


// ==================================================
// GEMINI MODEL
// ==================================================

const MODEL = "gemini-3.6-flash";


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


function sendAPIError(
    res,
    statusCode,
    errorMessage
) {

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

app.post(
    "/api/study",
    async (req, res) => {

        try {

            const question =
                req.body.question;


            // ------------------------------------------
            // CHECK QUESTION
            // ------------------------------------------

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
                "AI Tutor question received:",
                question.trim()
            );


            // ------------------------------------------
            // AI PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant and AI Tutor.

A student can ask questions from ANY academic
subject or educational topic.

You must answer the student's actual question.

Supported subjects include, but are not limited to:

- Physics
- Chemistry
- Mathematics
- Biology
- Computer Science
- Programming
- C++
- English
- Computer
- Artificial Intelligence
- History
- Geography
- Economics
- Business
- Commerce
- E-commerce
- General academic subjects

Do NOT restrict the student to a fixed list of topics.

If the question is educational, provide a clear,
accurate and student-friendly answer.

Explain concepts in simple English.

Use examples, formulas, steps or bullet points
when they are useful.

If the question is mathematical, solve it step by step.

If the question is scientific, explain the concept clearly.

If the question is programming-related, provide
correct code examples when appropriate.

Student Question:

${question.trim()}
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt

                });


            const answer =
                response.text || "";


            // ------------------------------------------
            // CHECK ANSWER
            // ------------------------------------------

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


            console.log(
                "AI Tutor answer generated successfully."
            );


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

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

    }
);


// ==================================================
// AI FLASHCARDS
// ==================================================

app.post(
    "/api/flashcards",
    async (req, res) => {

        try {

            const topic =
                req.body.topic;


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
                "Generating flashcards for:",
                topic.trim()
            );


            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: `
You are an AI Study Assistant.

Create exactly 5 useful study flashcards about:

${topic.trim()}

The topic can belong to ANY academic subject.

Return ONLY a valid JSON array.

Use exactly this structure:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

Rules:

1. Create exactly 5 flashcards.
2. Questions must be directly related to the topic.
3. Answers must be accurate.
4. Keep answers student-friendly.
5. Do not invent unrelated information.
6. Do not use Markdown.
7. Return ONLY the JSON array.
`

                });


            let text =
                response.text || "";


            text =
                text
                    .replace(
                        /```json/gi,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();


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


            const jsonText =
                text.substring(
                    start,
                    end + 1
                );


            let flashcards;


            try {

                flashcards =
                    JSON.parse(jsonText);

            } catch (jsonError) {

                console.error(
                    "FLASHCARD JSON ERROR:",
                    jsonError
                );

                return sendAPIError(
                    res,
                    500,
                    "AI returned invalid flashcard data."
                );

            }


            if (
                !Array.isArray(
                    flashcards
                )
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
                    flashcards

            });


        } catch (error) {

            console.error(
                "FLASHCARDS AI ERROR:",
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
// PDF → AI SUMMARY
// ==================================================

app.post(
    "/api/pdf-summary",
    async (req, res) => {

        try {

            let text =
                req.body.text;


            // ------------------------------------------
            // CHECK PDF TEXT
            // ------------------------------------------

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


            // ------------------------------------------
            // CLEAN PDF TEXT
            // ------------------------------------------

            text =
                text
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            // ------------------------------------------
            // LIMIT PDF TEXT
            // ------------------------------------------

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

                console.log(
                    "PDF text shortened because it was very large."
                );

            }


            console.log(
                "PDF SUMMARY REQUEST RECEIVED"
            );

            console.log(
                "PDF text length:",
                text.length
            );


            // ------------------------------------------
            // AI PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

Read the following study material extracted
from a PDF.

Create a clear, accurate and student-friendly
study summary.

Use these sections:

SHORT SUMMARY:
Give a concise overview.

MAIN CONCEPTS:
List the most important concepts.

IMPORTANT POINTS:
List the key points a student should remember.

KEY TERMS:
List important terms and explain them simply.

STUDY TIPS:
Give useful revision tips based only on
the provided study material.

Rules:

- Use simple English.
- Keep the information accurate.
- Do not invent information.
- Do not discuss information that is not present.
- Make the result easy to study.

PDF STUDY MATERIAL:

${text}
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt

                });


            const summary =
                response.text || "";


            // ------------------------------------------
            // CHECK ANSWER
            // ------------------------------------------

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


            console.log(
                "PDF AI summary generated successfully."
            );


            return res.status(200).json({

                success: true,

                summary:
                    summary.trim()

            });


        } catch (error) {

            console.error(
                "PDF SUMMARY AI ERROR:",
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


            // ------------------------------------------
            // CHECK PDF TEXT
            // ------------------------------------------

            if (
                !text ||
                typeof text !== "string" ||
                !text.trim()
            ) {

                return sendAPIError(
                    res,
                    400,
                    "PDF text is required. Please upload and read the PDF first."
                );

            }


            // ------------------------------------------
            // CHECK QUESTION
            // ------------------------------------------

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


            // ------------------------------------------
            // CLEAN DATA
            // ------------------------------------------

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


            // ------------------------------------------
            // LIMIT PDF TEXT
            // ------------------------------------------

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

                console.log(
                    "PDF question text shortened because it was very large."
                );

            }


            console.log(
                "PDF QUESTION REQUEST RECEIVED"
            );

            console.log(
                "Question:",
                question
            );

            console.log(
                "PDF text length:",
                text.length
            );


            // ------------------------------------------
            // AI PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

A student has uploaded a PDF and wants
to ask a question specifically about
that PDF.

Answer the student's question using
ONLY the PDF content provided below.

================ PDF CONTENT ================

${text}

================ STUDENT QUESTION ================

${question}

================ RULES ================

1. Carefully use the provided PDF content.

2. If the answer is available anywhere
   in the PDF, answer it clearly.

3. If the answer requires combining
   information from different parts
   of the PDF, combine those parts.

4. Do not invent facts, statistics,
   names, dates or results.

5. If the answer genuinely cannot be
   found in the PDF, say:

"I couldn't find the answer to this question
in the provided PDF."

6. Keep the answer simple and
   student-friendly.

7. Do not mention these instructions.

================ END ================
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt

                });


            const answer =
                response.text || "";


            // ------------------------------------------
            // CHECK ANSWER
            // ------------------------------------------

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


            console.log(
                "PDF question answered successfully."
            );


            return res.status(200).json({

                success: true,

                answer:
                    answer.trim()

            });


        } catch (error) {

            console.error(
                "PDF QUESTION AI ERROR:",
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
// AI QUIZ API
// ==================================================

app.post(
    "/api/quiz",
    async (req, res) => {

        try {

            const topic =
                req.body.topic;


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
                    "Please enter a quiz topic."
                );

            }


            console.log(
                "AI QUIZ REQUEST RECEIVED:"
            );

            console.log(
                "Quiz topic:",
                topic.trim()
            );


            // ------------------------------------------
            // AI QUIZ PROMPT
            // ------------------------------------------

            const prompt = `
You are an expert AI Quiz Generator
for a student learning platform.

Create a proper educational quiz about:

"${topic.trim()}"

The topic can be from ANY academic subject,
including:

Physics, Chemistry, Mathematics, Biology,
Computer Science, Programming, C++, English,
History, Geography, Economics, Business,
Commerce, E-commerce, Artificial Intelligence,
or any other school/college/university subject.

The questions must be specifically about
the requested topic.

Do NOT create generic questions such as:

"What is the purpose of studying this topic?"

Instead, test the student's actual knowledge
of the topic.

Create exactly 5 multiple-choice questions.

Each question must have exactly 4 options.

There must be exactly ONE correct answer.

Return ONLY valid JSON.

Use exactly this format:

[
  {
    "question": "What is ...?",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0
  }
]

IMPORTANT:

- correctAnswer must be a number.
- 0 means the first option.
- 1 means the second option.
- 2 means the third option.
- 3 means the fourth option.
- Questions must test real knowledge.
- Options must be meaningful.
- Avoid obviously silly wrong answers.
- Do not repeat the same question.
- Keep the difficulty suitable for a student.
- Keep questions directly related to the topic.
- Do not add explanations.
- Do not add Markdown.
- Return ONLY the JSON array.
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: prompt

                });


            let text =
                response.text || "";


            // ------------------------------------------
            // CLEAN AI RESPONSE
            // ------------------------------------------

            text =
                text
                    .replace(
                        /```json/gi,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();


            // ------------------------------------------
            // FIND JSON ARRAY
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
                    "QUIZ JSON NOT FOUND:",
                    text
                );

                return sendAPIError(
                    res,
                    500,
                    "AI did not return a valid quiz."
                );

            }


            const jsonText =
                text.substring(
                    start,
                    end + 1
                );


            let quiz;


            // ------------------------------------------
            // PARSE JSON
            // ------------------------------------------

            try {

                quiz =
                    JSON.parse(
                        jsonText
                    );

            } catch (jsonError) {

                console.error(
                    "QUIZ JSON ERROR:",
                    jsonError
                );

                return sendAPIError(
                    res,
                    500,
                    "AI returned invalid quiz data."
                );

            }


            // ------------------------------------------
            // VALIDATE QUIZ
            // ------------------------------------------

            if (
                !Array.isArray(quiz) ||
                quiz.length === 0
            ) {

                return sendAPIError(
                    res,
                    500,
                    "AI returned an empty quiz."
                );

            }


            for (
                let i = 0;
                i < quiz.length;
                i++
            ) {

                const item =
                    quiz[i];


                if (
                    !item ||
                    typeof item.question !== "string" ||
                    !Array.isArray(item.options) ||
                    item.options.length !== 4 ||
                    typeof item.correctAnswer !== "number" ||
                    item.correctAnswer < 0 ||
                    item.correctAnswer > 3
                ) {

                    return sendAPIError(
                        res,
                        500,
                        "AI returned an invalid quiz format."
                    );

                }

            }


            console.log(
                "AI QUIZ GENERATED SUCCESSFULLY."
            );


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            return res.status(200).json({

                success: true,

                topic:
                    topic.trim(),

                quiz:
                    quiz

            });


        } catch (error) {

            console.error(
                "AI QUIZ ERROR:",
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
// API TEST
// ==================================================

app.get(
    "/api/test",
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "AI Study Assistant server is working.",

            model:
                MODEL,

            features: {

                aiTutor: true,

                generalQuestion: true,

                flashcards: true,

                pdfSummary: true,

                pdfQuestions: true,

                quizGenerator: true

            }

        });

    }
);


// ==================================================
// API 404 HANDLER
// ==================================================

app.use(
    "/api",
    (req, res) => {

        return res.status(404).json({

            success: false,

            error:
                "API endpoint not found."

        });

    }
);


// ==================================================
// VERCEL EXPORT
// ==================================================
//
// Vercel serverless function ke liye
// Express app export karna zaroori hai.
//

module.exports = app;


// ==================================================
// LOCAL SERVER
// ==================================================
//
// Local VS Code testing ke liye server start hoga.
// Vercel par app.listen() execute nahi hoga.
//

if (require.main === module) {

    app.listen(
        PORT,
        () => {

            console.log(
                "======================================"
            );

            console.log(
                "AI STUDY ASSISTANT SERVER"
            );

            console.log(
                "======================================"
            );

            console.log(
                `Server running at: http://localhost:${PORT}`
            );

            console.log(
                `Gemini model: ${MODEL}`
            );

            console.log(
                "AI Tutor: ENABLED"
            );

            console.log(
                "General Questions: ENABLED"
            );

            console.log(
                "AI Flashcards: ENABLED"
            );

            console.log(
                "PDF AI Summary: ENABLED"
            );

            console.log(
                "PDF Questions: ENABLED"
            );

            console.log(
                "AI Quiz Generator: ENABLED"
            );

            console.log(
                "API Test: ENABLED"
            );

            console.log(
                "======================================"
            );

        }
    );

}