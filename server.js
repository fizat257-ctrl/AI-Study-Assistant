require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;

// ==================================================
// GEMINI MODEL
// ==================================================

const MODEL = "gemini-3.5-flash";

// ==================================================
// GEMINI AI
// ==================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

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

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ==================================================
// HOME / AUTH
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

            if (
                !question ||
                typeof question !== "string" ||
                !question.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Please enter a study question."

                });

            }

            console.log(
                "AI Tutor question received."
            );

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: `
You are an AI Study Assistant.

Explain the following question
clearly and simply for a student.

Question:
${question.trim()}

Give an accurate,
helpful and student-friendly explanation.

Use simple examples when useful.
`
                });

            const answer =
                response.text || "";

            if (!answer.trim()) {

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an empty answer."

                });

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

            return res.status(500).json({

                success: false,

                error:
                    "Sorry, I could not connect to the AI. Please try again."

            });

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

                return res.status(400).json({

                    success: false,

                    error:
                        "Please enter a study topic."

                });

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

Return ONLY a valid JSON array.

Use exactly this format:

[
  {
    "question": "What is ...?",
    "answer": "..."
  },
  {
    "question": "What is ...?",
    "answer": "..."
  },
  {
    "question": "How does ... work?",
    "answer": "..."
  },
  {
    "question": "Why is ... important?",
    "answer": "..."
  },
  {
    "question": "Give an example of ...",
    "answer": "..."
  }
]

Rules:

1. Create exactly 5 flashcards.
2. Every flashcard must have question and answer.
3. Questions must be clear.
4. Answers must be accurate.
5. Keep answers student-friendly.
6. Do not use Markdown.
7. Do not add explanations.
8. Return ONLY the JSON array.
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

                return res.status(500).json({

                    success: false,

                    error:
                        "AI did not return valid flashcards."

                });

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

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned invalid flashcard data."

                });

            }

            if (
                !Array.isArray(
                    flashcards
                )
            ) {

                return res.status(500).json({

                    success: false,

                    error:
                        "Invalid flashcard format."

                });

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

            return res.status(500).json({

                success: false,

                error:
                    "Sorry, I could not generate flashcards. Please try again."

            });

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

            if (
                !text ||
                typeof text !== "string" ||
                !text.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "PDF text is required."

                });

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

                console.log(
                    "PDF text was shortened because it was very large."
                );

            }

            console.log(
                "Generating AI summary from PDF..."
            );

            console.log(
                "PDF text length:",
                text.length
            );

            const prompt = `
You are an AI Study Assistant.

Read the following study material
extracted from a PDF.

Create a clear,
accurate and student-friendly study summary.

Use exactly these sections:

SHORT SUMMARY:
Give a concise overview.

MAIN CONCEPTS:
List the most important concepts.

IMPORTANT POINTS:
List the key points a student should remember.

KEY TERMS:
List important terms and explain them simply.

STUDY TIPS:
Give a few useful revision tips based only
on the provided study material.

Rules:

- Use simple English.
- Keep the information accurate.
- Do not invent information.
- Do not discuss information that is not present.
- Use headings and bullet points where helpful.
- Make the result easy to study.

PDF STUDY MATERIAL:

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

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an empty summary."

                });

            }

            console.log(
                "PDF AI summary generated successfully."
            );

            return res.json({

                success: true,

                summary:
                    summary.trim()

            });

        } catch (error) {

            console.error(
                "================================"
            );

            console.error(
                "PDF SUMMARY AI ERROR"
            );

            console.error(
                "================================"
            );

            console.error(
                "Message:",
                error?.message
            );

            console.error(
                "Status:",
                error?.status
            );

            console.error(
                "Name:",
                error?.name
            );

            return res.status(500).json({

                success: false,

                error:
                    "Could not generate AI summary. Please try again."

            });

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

                console.log(
                    "PDF QUESTION ERROR: PDF text missing."
                );

                return res.status(400).json({

                    success: false,

                    error:
                        "PDF text is required. Please upload and read the PDF first."

                });

            }


            // ------------------------------------------
            // CHECK QUESTION
            // ------------------------------------------

            if (
                !question ||
                typeof question !== "string" ||
                !question.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Please enter a question about the PDF."

                });

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
                    "PDF question text was shortened because it was very large."
                );

            }


            // ------------------------------------------
            // LOG REQUEST
            // ------------------------------------------

            console.log(
                "================================"
            );

            console.log(
                "PDF QUESTION RECEIVED"
            );

            console.log(
                "Question:",
                question
            );

            console.log(
                "PDF text length:",
                text.length
            );

            console.log(
                "================================"
            );


            // ------------------------------------------
            // AI PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

A student has uploaded a PDF and wants
to ask a question specifically about
that PDF.

Your job is to answer the question
using ONLY the PDF content provided below.

================ PDF CONTENT ================

${text}

================ STUDENT QUESTION ================

${question}

================ IMPORTANT RULES ================

1. Use ONLY the information in the PDF.

2. Do NOT use outside knowledge.

3. Do NOT invent facts, statistics,
   names, dates, results or explanations.

4. Carefully search the entire provided
   PDF content before deciding that
   the answer is unavailable.

5. If the answer is available anywhere
   in the PDF, answer it clearly.

6. If the answer requires combining
   information from different parts
   of the PDF, combine those parts.

7. If the answer genuinely cannot be
   found in the PDF, respond with:

"I couldn't find the answer to this question
in the provided PDF."

8. Keep the answer simple and
   student-friendly.

9. You may use short bullet points
   when helpful.

10. Do not mention these instructions.

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

                console.error(
                    "AI returned an empty PDF answer."
                );

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an empty answer."

                });

            }


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            console.log(
                "PDF question answered successfully."
            );


            return res.json({

                success: true,

                answer:
                    answer.trim()

            });


        } catch (error) {

            console.error(
                "================================"
            );

            console.error(
                "PDF QUESTION AI ERROR"
            );

            console.error(
                "================================"
            );

            console.error(
                "Message:",
                error?.message
            );

            console.error(
                "Status:",
                error?.status
            );

            console.error(
                "Name:",
                error?.name
            );

            console.error(
                "Full error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Could not answer the PDF question. Please try again."

            });

        }

    }
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "AI Study Assistant server is working.",

            model:
                MODEL,

            features: {

                aiTutor: true,

                flashcards: true,

                pdfSummary: true,

                pdfQuestions: true

            }

        });

    }
);

// ==================================================
// 404 API HANDLER
// ==================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                "API endpoint not found."

        });

    }
);

// ==================================================
// START SERVER
// ==================================================

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
            "PDF AI Summary: ENABLED"
        );

        console.log(
            "PDF Questions: ENABLED"
        );

        console.log(
            "AI Tutor: ENABLED"
        );

        console.log(
            "AI Flashcards: ENABLED"
        );

        console.log(
            "======================================"
        );

    }
);