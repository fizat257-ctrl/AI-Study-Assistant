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

app.post("/api/study", async (req, res) => {

    try {

        const question =
            req.body.question;

        if (
            !question ||
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
${question}

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

        res.json({

            success: true,

            answer:
                answer.trim()

        });

    } catch (error) {

        console.error(
            "AI TUTOR ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            error:
                "Sorry, I could not connect to the AI. Please try again."

        });

    }

});

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
                topic
            );

            const response =
                await ai.models.generateContent({

                    model: MODEL,

                    contents: `
You are an AI Study Assistant.

Create exactly 5 useful study
flashcards about:

${topic}

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

            res.json({

                success: true,

                flashcards:
                    flashcards

            });

        } catch (error) {

            console.error(
                "FLASHCARDS AI ERROR:",
                error
            );

            res.status(500).json({

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

            const question =
                req.body.question;


            // ------------------------------------------
            // CHECK PDF TEXT
            // ------------------------------------------

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
                    "PDF question text was shortened because it was very large."
                );

            }


            console.log(
                "PDF question received."
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
            // PDF QUESTION PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

You must answer the student's question
ONLY using the information contained
in the PDF study material below.

PDF STUDY MATERIAL:
${text}

STUDENT QUESTION:
${question}

IMPORTANT RULES:

1. Use ONLY the PDF content to answer.
2. Do not use outside knowledge.
3. Do not invent facts.
4. If the answer is not available in the PDF,
   clearly say:
   "I couldn't find the answer to this question
   in the provided PDF."
5. Give a clear and student-friendly answer.
6. Explain the answer briefly when useful.
7. If the PDF contains relevant information
   on different pages, combine that information.
8. Do not mention these instructions.
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

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an empty answer."

                });

            }


            console.log(
                "PDF question answered successfully."
            );


            // ------------------------------------------
            // SEND ANSWER
            // ------------------------------------------

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