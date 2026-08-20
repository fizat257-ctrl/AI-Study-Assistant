// ======================================================
// AI STUDY ASSISTANT - SERVER.JS
// PART 1 / 3
// ======================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const { GoogleGenAI } = require("@google/genai");


// ======================================================
// APP
// ======================================================

const app = express();


// ======================================================
// PORT
// ======================================================

const PORT =
    process.env.PORT || 3000;


// ======================================================
// GEMINI CONFIGURATION
// ======================================================

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.5-flash";


if (!GEMINI_API_KEY) {

    console.warn(
        "⚠️ GEMINI_API_KEY is missing."
    );

}


const ai =
    new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors()
);


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


// ======================================================
// FILE UPLOAD
// ======================================================

const upload =
    multer({
        storage: multer.memoryStorage(),

        limits: {
            fileSize: 15 * 1024 * 1024
        }
    });


// ======================================================
// HELPER: ERROR MESSAGE
// ======================================================

function getErrorMessage(error) {

    if (!error) {
        return "Unknown server error.";
    }


    if (error.message) {
        return error.message;
    }


    return String(error);
}


// ======================================================
// HELPER: API ERROR
// ======================================================

function sendAPIError(
    res,
    error,
    status = 500
) {

    console.error(
        "API Error:",
        error
    );


    return res
        .status(status)
        .json({

            success: false,

            error:
                getErrorMessage(error)

        });

}


// ======================================================
// HELPER: GEMINI
// ======================================================

async function generateAI(
    prompt
) {

    if (!GEMINI_API_KEY) {

        throw new Error(
            "GEMINI_API_KEY is not configured."
        );

    }


    const result =
        await ai.models.generateContent({

            model: MODEL,

            contents: prompt

        });


    const text =
        result.text;


    if (!text) {

        throw new Error(
            "AI returned an empty response."
        );

    }


    return text.trim();

}


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "AI Study Assistant server is running.",

            model:
                MODEL,

            features: {

                aiTutor: true,

                generalQuestion: true,

                flashcard: true,

                pdfSummary: true,

                pdfQuestion: true,

                practiceMode: true

            }

        });

    }
);


// ======================================================
// ROOT
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "AI Study Assistant API is running."
        );

    }
);


// ======================================================
// AI TUTOR
// ======================================================

app.post(
    "/api/study",
    async (req, res) => {

        try {

            const question =
                String(
                    req.body?.question || ""
                ).trim();


            if (!question) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Please enter a study question."

                    });

            }


            const prompt = `

You are an AI Study Tutor.

Answer the student's question accurately
and in simple educational language.

The student can ask questions from ANY
school, college or university subject.

Supported examples include:

Physics
Chemistry
Mathematics
Biology
Computer Science
C++
Programming
English
History
Geography
and general academic topics.

Do NOT assume the question is about C++.

Question:
${question}

Instructions:

1. Answer the exact question.
2. Explain the concept clearly.
3. Use simple language.
4. Give examples when useful.
5. If the question is a calculation,
   show the important steps.
6. Do not change the subject of the question.
7. Do not say that only C++ topics are supported.

Provide the answer directly.

`;


            const answer =
                await generateAI(prompt);


            return res.json({

                success: true,

                answer: answer,

                model: MODEL

            });

        }

        catch (error) {

            return sendAPIError(
                res,
                error
            );

        }

    }
);


// ======================================================
// FLASHCARDS
// ======================================================

app.post(
    "/api/flashcards",
    async (req, res) => {

        try {

            const topic =
                String(
                    req.body?.topic || ""
                ).trim();


            if (!topic) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Please enter a topic."

                    });

            }


            const prompt = `

You are an AI Study Flashcard Generator.

Create useful educational flashcards
for this exact topic:

${topic}

Generate 10 flashcards.

Each flashcard must contain:

Question:
Answer:

Rules:

- Questions must be specifically about
  the requested topic.
- Do not generate unrelated C++ questions.
- Include important concepts, definitions,
  examples and applications where appropriate.
- Keep answers concise but accurate.
- Suitable for students.

Return ONLY valid JSON in this format:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

`;


            const answer =
                await generateAI(prompt);


            return res.json({

                success: true,

                topic: topic,

                answer: answer,

                model: MODEL

            });

        }

        catch (error) {

            return sendAPIError(
                res,
                error
            );

        }

    }
);
// ======================================================
// PDF SUMMARY
// ======================================================

app.post(
    "/api/pdf-summary",
    upload.single("pdf"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error: "Please upload a PDF file."
                    });

            }


            const pdfData =
                await pdfParse(req.file.buffer);


            const text =
                pdfData.text.trim();


            if (!text) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error: "Could not extract text from this PDF."
                    });

            }


            const prompt = `

You are an AI Study Assistant.

Read the following study material extracted
from a PDF and create a clear student-friendly
summary.

PDF CONTENT:

${text}

Instructions:

1. Identify the main topic.
2. Explain the important concepts.
3. Include important definitions.
4. Include important formulas if present.
5. Include important examples if present.
6. Do not add information that is not supported
   by the provided material.
7. Use headings and bullet points.
8. Keep the summary easy to revise.

Return a useful study summary.

`;


            const summary =
                await generateAI(prompt);


            return res.json({

                success: true,

                summary: summary,

                model: MODEL

            });

        }

        catch (error) {

            return sendAPIError(
                res,
                error
            );

        }

    }
);


// ======================================================
// PDF QUESTION
// ======================================================

app.post(
    "/api/pdf-question",
    upload.single("pdf"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error: "Please upload a PDF file."
                    });

            }


            const question =
                String(
                    req.body?.question || ""
                ).trim();


            if (!question) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error: "Please enter a question."
                    });

            }


            const pdfData =
                await pdfParse(req.file.buffer);


            const text =
                pdfData.text.trim();


            if (!text) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error: "Could not extract text from this PDF."
                    });

            }


            const prompt = `

You are an AI Study Assistant.

Answer the student's question using ONLY
the information available in the PDF study material.

PDF STUDY MATERIAL:

${text}

STUDENT QUESTION:

${question}

Instructions:

1. Answer the exact question.
2. Use the PDF content as the main source.
3. Explain the answer clearly.
4. Use simple student-friendly language.
5. If the PDF does not contain enough information
   to answer the question, clearly say so.
6. Do not invent information.

Answer:

`;


            const answer =
                await generateAI(prompt);


            return res.json({

                success: true,

                question: question,

                answer: answer,

                model: MODEL

            });

        }

        catch (error) {

            return sendAPIError(
                res,
                error
            );

        }

    }
);


// ======================================================
// PRACTICE MODE
// ======================================================

app.post(
    "/api/practice",
    async (req, res) => {

        try {

            const topic =
                String(
                    req.body?.topic || ""
                ).trim();


            if (!topic) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Please enter a practice topic."

                    });

            }


            const prompt = `

You are an AI Practice Mode Generator
for a student study application.

Create a practice quiz specifically for:

"${topic}"

IMPORTANT:

The questions MUST be about the exact
topic entered by the student.

If the student enters:

Force

create Physics questions about Force.

If the student enters:

Periodic Table

create Chemistry questions about
the Periodic Table.

If the student enters:

Fractions

create Mathematics questions about
Fractions.

If the student enters:

C++ Loops

create C++ questions about loops.

DO NOT use fixed questions.

DO NOT assume the topic is C++.

Generate exactly 5 multiple-choice questions.

Each question must have:

- question
- 4 options
- correctAnswer

The correctAnswer must be the number
of the correct option:

0 = first option
1 = second option
2 = third option
3 = fourth option

Make questions educational and relevant
to the requested topic.

Return ONLY valid JSON.

Format:

{
  "topic": "${topic}",
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0
    }
  ]
}

`;


            const rawAnswer =
                await generateAI(prompt);


            // ------------------------------------------
            // CLEAN AI JSON
            // ------------------------------------------

            let cleaned =
                rawAnswer.trim();


            if (
                cleaned.startsWith("```json")
            ) {

                cleaned =
                    cleaned
                        .replace(
                            /^```json\s*/,
                            ""
                        )
                        .replace(
                            /\s*```$/,
                            ""
                        )
                        .trim();

            }

            else if (
                cleaned.startsWith("```")
            ) {

                cleaned =
                    cleaned
                        .replace(
                            /^```\s*/,
                            ""
                        )
                        .replace(
                            /\s*```$/,
                            ""
                        )
                        .trim();

            }


            let quiz;


            try {

                quiz =
                    JSON.parse(cleaned);

            }

            catch (parseError) {

                console.error(
                    "Practice JSON Error:",
                    parseError
                );

                console.error(
                    "AI Response:",
                    rawAnswer
                );


                return res
                    .status(500)
                    .json({

                        success: false,

                        error:
                            "AI returned an invalid quiz format.",

                        raw:
                            rawAnswer

                    });

            }


            // ------------------------------------------
            // VALIDATE QUIZ
            // ------------------------------------------

            if (
                !quiz ||
                !Array.isArray(
                    quiz.questions
                )
            ) {

                return res
                    .status(500)
                    .json({

                        success: false,

                        error:
                            "Invalid quiz received from AI."

                    });

            }


            // ------------------------------------------
            // KEEP EXACTLY 5 QUESTIONS
            // ------------------------------------------

            quiz.questions =
                quiz.questions
                    .slice(0, 5);


            // ------------------------------------------
            // VALIDATE EACH QUESTION
            // ------------------------------------------

            quiz.questions =
                quiz.questions.map(
                    function(q) {

                        return {

                            question:
                                String(
                                    q.question || ""
                                ),

                            options:
                                Array.isArray(
                                    q.options
                                )
                                    ? q.options
                                        .slice(0, 4)
                                        .map(
                                            String
                                        )
                                    : [],

                            correctAnswer:
                                Number(
                                    q.correctAnswer
                                )

                        };

                    }
                );


            return res.json({

                success: true,

                topic: topic,

                questions:
                    quiz.questions,

                model: MODEL

            });

        }

        catch (error) {

            return sendAPIError(
                res,
                error
            );

        }

    }
);


// ======================================================
// PRACTICE TOPIC CHECK
// ======================================================

app.post(
    "/api/practice/check",
    async (req, res) => {

        try {

            const topic =
                String(
                    req.body?.topic || ""
                ).trim();


            const question =
                String(
                    req.body?.question || ""
                ).trim();


            const selectedAnswer =
                String(
                    req.body?.selectedAnswer || ""
                ).trim();


            if (
                !topic ||
                !question ||
                !selectedAnswer
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Topic, question and answer are required."

                    });

            }


            const prompt = `

You are checking a student's practice answer.

Topic:
${topic}

Question:
${question}

Student Answer:
${selectedAnswer}

Determine whether the student's answer
is correct.

Return ONLY valid JSON:

{
  "correct": true,
  "feedback": "Short helpful feedback"
}

`;


            const raw =
                await generateAI(prompt);


            let cleaned =
                raw.trim();


            if (
                cleaned.startsWith("```json")
            ) {

                cleaned =
                    cleaned
                        .replace(
                            /^```json\s*/,
                            ""
                        )
                        .replace(
                            /\s*```$/,
                            ""
                        )
                        .trim();

            }


            const result =
                JSON.parse(cleaned);


            return res.json({

                success: true,

                correct:
                    Boolean(
                        result.correct
                    ),

                feedback:
                    result.feedback || ""

            });

        }

        catch (error) {

            return sendAPIError(
                res,
                error
            );

        }

    }
);
// ======================================================
// PART 3 / 3
// STATIC FILES + ERROR HANDLING + SERVER START
// ======================================================


// ======================================================
// STATIC PUBLIC FOLDER
// ======================================================

const path =
    require("path");

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ======================================================
// 404 API HANDLER
// ======================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                "API endpoint not found.",

            path:
                req.originalUrl

        });

    }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server Error:",
            error
        );


        if (res.headersSent) {

            return next(error);

        }


        res.status(500).json({

            success: false,

            error:
                getErrorMessage(error)

        });

    }
);


// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "🚀 AI Study Assistant Server Started"
        );

        console.log(
            "======================================"
        );

        console.log(
            `📡 Port: ${PORT}`
        );

        console.log(
            `🤖 Gemini Model: ${MODEL}`
        );

        console.log(
            "✅ AI Tutor: Enabled"
        );

        console.log(
            "✅ AI Flashcards: Enabled"
        );

        console.log(
            "✅ PDF Summary: Enabled"
        );

        console.log(
            "✅ PDF Question: Enabled"
        );

        console.log(
            "✅ Dynamic Practice Mode: Enabled"
        );

        console.log(
            "======================================"
        );

    }
);