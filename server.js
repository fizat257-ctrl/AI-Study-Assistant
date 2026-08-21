// ==================================================
// AI STUDY ASSISTANT - SERVER.JS
// PART 1 / 3
// ==================================================

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
// REQUEST CONTROL
// ==================================================

const requestTracker = new Map();

const REQUEST_COOLDOWN = 1500;


function isRequestTooFast(req) {

    const forwarded =
        req.headers["x-forwarded-for"];

    const ip =
        req.ip ||
        (forwarded
            ? String(forwarded).split(",")[0].trim()
            : "unknown");

    const now = Date.now();

    const lastRequest =
        requestTracker.get(ip) || 0;


    if (
        now - lastRequest <
        REQUEST_COOLDOWN
    ) {

        return true;

    }


    requestTracker.set(
        ip,
        now
    );

    return false;
}


// ==================================================
// CLEAN OLD REQUEST TRACKER
// ==================================================

setInterval(() => {

    const now = Date.now();


    for (
        const [ip, timestamp]
        of requestTracker.entries()
    ) {

        if (
            now - timestamp >
            60000
        ) {

            requestTracker.delete(ip);

        }

    }

}, 60000);


// ==================================================
// ERROR MESSAGE HELPER
// ==================================================

function getErrorMessage(error) {

    if (!error) {

        return "Unknown error.";

    }


    if (
        typeof error === "string"
    ) {

        return error;

    }


    if (
        error.message
    ) {

        return String(
            error.message
        );

    }


    if (
        error.error?.message
    ) {

        return String(
            error.error.message
        );

    }


    if (
        error.details
    ) {

        if (
            typeof error.details ===
            "string"
        ) {

            return error.details;

        }


        try {

            return JSON.stringify(
                error.details
            );

        } catch (e) {

            return "An unexpected error occurred.";

        }

    }


    try {

        return JSON.stringify(
            error
        );

    } catch (e) {

        return "An unexpected error occurred.";

    }

}


// ==================================================
// DETECT GEMINI ERROR STATUS
// ==================================================

function getGeminiErrorStatus(error) {

    if (!error) {

        return null;

    }


    const possibleStatuses = [

        error.status,

        error.statusCode,

        error.code,

        error.error?.status,

        error.error?.code

    ];


    for (
        const status
        of possibleStatuses
    ) {

        if (
            status !== undefined &&
            status !== null
        ) {

            const numericStatus =
                Number(status);


            if (
                !Number.isNaN(
                    numericStatus
                )
            ) {

                return numericStatus;

            }

        }

    }


    const message =
        getErrorMessage(
            error
        ).toLowerCase();


    if (
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("rate limit") ||
        message.includes("resource exhausted") ||
        message.includes("too many requests")
    ) {

        return 429;

    }


    if (
        message.includes("401") ||
        message.includes("unauthorized")
    ) {

        return 401;

    }


    if (
        message.includes("403") ||
        message.includes("permission denied")
    ) {

        return 403;

    }


    if (
        message.includes("404") ||
        message.includes("not found")
    ) {

        return 404;

    }


    if (
        message.includes("500") ||
        message.includes("internal server error")
    ) {

        return 500;

    }


    return null;

}


// ==================================================
// SAFE USER ERROR MESSAGE
// ==================================================

function getSafeErrorMessage(
    statusCode,
    errorMessage
) {

    const message =
        String(
            errorMessage || ""
        ).toLowerCase();


    // ----------------------------------------------
    // QUOTA / RATE LIMIT
    // ----------------------------------------------

    if (
        statusCode === 429 ||
        message.includes("quota") ||
        message.includes("rate limit") ||
        message.includes("resource exhausted") ||
        message.includes("too many requests")
    ) {

        return (
            "AI is temporarily busy. " +
            "Please try again in a few moments."
        );

    }


    // ----------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------

    if (
        statusCode === 401
    ) {

        return (
            "AI service authentication failed. " +
            "Please check the Gemini API key."
        );

    }


    // ----------------------------------------------
    // PERMISSION
    // ----------------------------------------------

    if (
        statusCode === 403
    ) {

        return (
            "AI service access is currently unavailable. " +
            "Please check your Gemini API settings."
        );

    }


    // ----------------------------------------------
    // MODEL / ENDPOINT
    // ----------------------------------------------

    if (
        statusCode === 404
    ) {

        return (
            "AI model or service was not found. " +
            "Please check the Gemini model configuration."
        );

    }


    // ----------------------------------------------
    // BAD REQUEST
    // ----------------------------------------------

    if (
        statusCode === 400
    ) {

        return (
            "Please check your request and try again."
        );

    }


    // ----------------------------------------------
    // SERVER ERROR
    // ----------------------------------------------

    if (
        statusCode >= 500
    ) {

        return (
            "AI service is temporarily unavailable. " +
            "Please try again later."
        );

    }


    // ----------------------------------------------
    // DEFAULT
    // ----------------------------------------------

    return (
        "Something went wrong. " +
        "Please try again."
    );

}


// ==================================================
// SEND API ERROR
// ==================================================

function sendAPIError(
    res,
    statusCode,
    errorMessage
) {

    const safeMessage =
        getSafeErrorMessage(
            statusCode,
            errorMessage
        );


    return res.status(
        statusCode
    ).json({

        success: false,

        message:
            safeMessage,

        error:
            safeMessage

    });

}


// ==================================================
// HANDLE AI ERROR
// ==================================================

function handleAIError(
    res,
    error,
    label
) {

    const actualMessage =
        getErrorMessage(
            error
        );


    const detectedStatus =
        getGeminiErrorStatus(
            error
        );


    console.error(
        `${label}:`,
        error
    );


    console.error(
        `${label} STATUS:`,
        detectedStatus
    );


    console.error(
        `${label} MESSAGE:`,
        actualMessage
    );


    return sendAPIError(
        res,
        detectedStatus || 500,
        actualMessage
    );

}


// ==================================================
// REQUEST COOLDOWN CHECK
// ==================================================

function checkRequestCooldown(
    req,
    res
) {

    if (
        isRequestTooFast(req)
    ) {

        sendAPIError(
            res,
            429,
            "Please wait a moment before sending another request."
        );

        return true;

    }


    return false;

}


// ==================================================
// CLEAN AI TEXT
// ==================================================
// Ye function AI ke answer se unwanted
// Markdown symbols jaise ### aur ** ko
// clean karta hai.

function cleanAIText(text) {

    if (!text) {

        return "";

    }


    let cleaned =
        String(text);


    // Remove code fences

    cleaned =
        cleaned.replace(
            /```[a-zA-Z0-9_-]*/g,
            ""
        );


    cleaned =
        cleaned.replace(
            /```/g,
            ""
        );


    // Remove heading markers
    // ### What can a force do?
    // becomes:
    // What can a force do?

    cleaned =
        cleaned.replace(
            /^\s*#{1,6}\s*/gm,
            ""
        );


    // Remove bold / italic markdown

    cleaned =
        cleaned.replace(
            /\*\*(.*?)\*\*/g,
            "$1"
        );


    cleaned =
        cleaned.replace(
            /__(.*?)__/g,
            "$1"
        );


    cleaned =
        cleaned.replace(
            /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
            "$1"
        );


    // Remove excessive spaces

    cleaned =
        cleaned.replace(
            /[ \t]+$/gm,
            ""
        );


    // Remove excessive blank lines

    cleaned =
        cleaned.replace(
            /\n{3,}/g,
            "\n\n"
        );


    return cleaned.trim();

}


// ==================================================
// CLEAN JSON
// ==================================================

function cleanJSON(text) {

    if (!text) {

        return "";

    }


    return String(text)

        .replace(
            /```json/gi,
            ""
        )

        .replace(
            /```/g,
            ""
        )

        .trim();

}


// ==================================================
// EXTRACT JSON ARRAY
// ==================================================

function extractJSONArray(text) {

    const cleaned =
        cleanJSON(text);


    const start =
        cleaned.indexOf("[");


    const end =
        cleaned.lastIndexOf("]");


    if (
        start === -1 ||
        end === -1 ||
        end <= start
    ) {

        return null;

    }


    const jsonText =
        cleaned.substring(
            start,
            end + 1
        );


    try {

        return JSON.parse(
            jsonText
        );

    } catch (error) {

        console.error(
            "JSON PARSE ERROR:",
            error
        );


        return null;

    }

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
        path.join(
            __dirname,
            "public"
        )
    )
);


// ==================================================
// HOME
// ==================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "auth.html"
            )
        );

    }
);


// ==================================================
// AUTH
// ==================================================

app.get(
    "/auth.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "auth.html"
            )
        );

    }
);


// ==================================================
// DASHBOARD
// ==================================================

app.get(
    "/dashboard.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "dashboard.html"
            )
        );

    }
);


// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
    "/api/health",
    (req, res) => {

        return res.json({

            success: true,

            message:
                "AI Study Assistant server is running.",

            model:
                MODEL

        });

    }
);


// ==================================================
// AI TUTOR
// ==================================================

app.post(
    "/api/study",
    async (req, res) => {

        try {

            if (
                checkRequestCooldown(
                    req,
                    res
                )
            ) {

                return;

            }


            const question =
                req.body.question;


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


            const cleanQuestion =
                question
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            console.log(
                "AI TUTOR QUESTION:",
                cleanQuestion
            );


            // ------------------------------------------
            // AI TUTOR PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant and AI Tutor.

Answer the student's actual academic question.

The student can ask about ANY educational subject.

Give a clear, accurate and student-friendly answer.

IMPORTANT FORMATTING RULES:

- Use clean plain text.
- Use simple headings when useful.
- Use bullet points when useful.
- Use numbered steps when useful.
- Do NOT use Markdown heading symbols such as #, ##, ###.
- Do NOT use **bold** or *italic* Markdown.
- Do NOT put unnecessary symbols around words.
- Keep the answer clean and easy to read.
- Do not start headings with #.
- Do not add unnecessary decorative symbols.

For mathematics:
- Show the steps.
- Explain formulas.
- Give the final answer clearly.

For science:
- Explain the concept clearly.
- Give examples where useful.

For programming:
- Explain the concept.
- Provide correct code when useful.

Student Question:

${cleanQuestion}
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt

                });


            // ------------------------------------------
            // GET ANSWER
            // ------------------------------------------

            const rawAnswer =
                response.text || "";


            const answer =
                cleanAIText(
                    rawAnswer
                );


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
            // SEND ANSWER
            // ------------------------------------------

            return res.json({

                success: true,

                answer:
                    answer.trim()

            });


        } catch (error) {

            return handleAIError(
                res,
                error,
                "AI TUTOR ERROR"
            );

        }

    }
);


// ==================================================
// PART 1 ENDS HERE
// ==================================================
// ==================================================
// AI FLASHCARDS
// ==================================================

app.post(
    "/api/flashcards",
    async (req, res) => {

        try {

            if (
                checkRequestCooldown(
                    req,
                    res
                )
            ) {
                return;
            }


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


            const cleanTopic =
                topic
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            console.log(
                "GENERATING FLASHCARDS:",
                cleanTopic
            );


            // ------------------------------------------
            // FLASHCARD PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

Create exactly 5 useful study flashcards
specifically about this topic:

${cleanTopic}

IMPORTANT:

Every flashcard MUST be directly related
to the requested topic.

Do not create generic study questions.

Return ONLY valid JSON.

Use exactly this structure:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

Rules:

1. Create exactly 5 flashcards.
2. Questions must directly relate to the topic.
3. Answers must be factually accurate.
4. Use simple student-friendly language.
5. Do not create unrelated questions.
6. Do not use Markdown.
7. Return ONLY JSON.
`;


            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt,

                    config: {

                        responseMimeType:
                            "application/json"

                    }

                });


            const flashcards =
                extractJSONArray(
                    response.text || ""
                );


            if (
                !Array.isArray(
                    flashcards
                )
            ) {

                return sendAPIError(
                    res,
                    500,
                    "AI did not return valid flashcards."
                );

            }


            // ------------------------------------------
            // VALIDATE FLASHCARDS
            // ------------------------------------------

            const validFlashcards =
                flashcards
                    .filter(
                        function(card) {

                            return (

                                card &&

                                typeof card.question ===
                                "string" &&

                                card.question.trim() !== "" &&

                                typeof card.answer ===
                                "string" &&

                                card.answer.trim() !== ""

                            );

                        }
                    )
                    .slice(0, 5);


            if (
                validFlashcards.length < 5
            ) {

                console.error(
                    "INVALID FLASHCARDS:",
                    flashcards
                );


                return sendAPIError(
                    res,
                    500,
                    "AI generated an incomplete flashcard set. Please try again."
                );

            }


            console.log(
                "Flashcards generated successfully:",
                validFlashcards.length
            );


            return res.json({

                success: true,

                topic:
                    cleanTopic,

                flashcards:
                    validFlashcards

            });


        } catch (error) {

            return handleAIError(
                res,
                error,
                "FLASHCARD AI ERROR"
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

            if (
                checkRequestCooldown(
                    req,
                    res
                )
            ) {
                return;
            }


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
                    "Please enter a quiz topic."
                );

            }


            const cleanTopic =
                topic
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            console.log(
                "AI QUIZ REQUEST:",
                cleanTopic
            );


            // ------------------------------------------
            // QUIZ PROMPT
            // ------------------------------------------

            const prompt = `
You are an expert academic quiz generator.

Create a quiz specifically about:

${cleanTopic}

The topic can be ANY academic subject.

IMPORTANT:

Create REAL questions about the actual
content of the topic.

Do NOT create generic questions such as:

"What is the main purpose of studying this topic?"

"What is a good way to learn this topic?"

"What should you do after completing the topic?"

Those questions are NOT acceptable.

Create exactly 5 multiple-choice questions.

Each question must have exactly 4 options.

Only ONE option is correct.

Return ONLY valid JSON.

Use exactly:

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

1. Every question must directly relate to the topic.
2. Questions must be educational and meaningful.
3. Mix easy, medium and challenging questions.
4. Avoid duplicate questions.
5. Correct answers must be accurate.
6. Do not add explanations.
7. Do not use Markdown.
8. Return ONLY JSON.
`;


            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt,

                    config: {

                        responseMimeType:
                            "application/json"

                    }

                });


            const quiz =
                extractJSONArray(
                    response.text || ""
                );


            if (
                !Array.isArray(
                    quiz
                )
            ) {

                return sendAPIError(
                    res,
                    500,
                    "AI did not return valid quiz data."
                );

            }


            // ------------------------------------------
            // VALIDATE QUIZ
            // ------------------------------------------

            const validQuiz =
                quiz
                    .filter(
                        function(q) {

                            return (

                                q &&

                                typeof q.question ===
                                "string" &&

                                q.question.trim() !== "" &&

                                Array.isArray(
                                    q.options
                                ) &&

                                q.options.length === 4 &&

                                q.options.every(
                                    function(option) {

                                        return (
                                            typeof option ===
                                            "string" &&

                                            option.trim() !== ""
                                        );

                                    }
                                ) &&

                                Number.isInteger(
                                    q.answer
                                ) &&

                                q.answer >= 0 &&

                                q.answer <= 3

                            );

                        }
                    )
                    .slice(0, 5);


            if (
                validQuiz.length < 5
            ) {

                console.error(
                    "INVALID QUIZ DATA:",
                    quiz
                );


                return sendAPIError(
                    res,
                    500,
                    "AI generated an incomplete quiz. Please try again."
                );

            }


            console.log(
                "Quiz generated successfully:",
                validQuiz.length
            );


            return res.json({

                success: true,

                topic:
                    cleanTopic,

                quiz:
                    validQuiz

            });


        } catch (error) {

            return handleAIError(
                res,
                error,
                "QUIZ AI ERROR"
            );

        }

    }
);


// ==================================================
// AI PRACTICE MODE API
// ==================================================

app.post(
    "/api/practice",
    async (req, res) => {

        try {

            if (
                checkRequestCooldown(
                    req,
                    res
                )
            ) {
                return;
            }


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
                    "Please enter a practice topic."
                );

            }


            const cleanTopic =
                topic
                    .replace(
                        /\u0000/g,
                        ""
                    )
                    .trim();


            console.log(
                "AI PRACTICE REQUEST:",
                cleanTopic
            );


            // ------------------------------------------
            // PRACTICE PROMPT
            // ------------------------------------------

            const prompt = `
You are an expert AI Study Assistant.

Generate a practice quiz ONLY about the
specific academic topic provided by the student.

STUDENT TOPIC:

${cleanTopic}

IMPORTANT TOPIC RULE:

You MUST understand the exact topic before
creating questions.

Every question must be directly related
to the student's requested topic.

Examples:

If the topic is:

Force

Questions can include:

- definition of force
- SI unit of force
- Newton's laws
- F = ma
- mass and acceleration
- effects of force
- balanced and unbalanced forces
- examples of force

If the topic is:

Periodic Table

Questions can include:

- atomic number
- chemical symbols
- groups
- periods
- metals and non-metals
- periodic trends
- valency
- element properties

If the topic is:

C++ Loops

Questions can include:

- for loop
- while loop
- do-while loop
- break
- continue
- iteration
- loop conditions
- nested loops

DO NOT change the topic.

For example, if the student enters
"Force", DO NOT ask questions about:

C++ loops
functions
arrays
pointers
programming

unless the student specifically asks
about those topics.

DO NOT create generic questions such as:

"What is the main purpose of studying?"

"What is a good way to learn this topic?"

"What should you do after completing the topic?"

These are NOT acceptable.

Create exactly 5 meaningful
multiple-choice questions.

Each question must have exactly
4 answer options.

Only ONE answer can be correct.

Return ONLY valid JSON.

Use exactly this format:

[
  {
    "question": "Actual question",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": 0
  }
]

Answer values:

0 = Option A
1 = Option B
2 = Option C
3 = Option D

RULES:

1. Every question must be directly related
   to the requested topic.

2. Do not switch to another subject.

3. Questions must be factually accurate.

4. Use simple student-friendly language.

5. Include a mixture of easy and medium
   difficulty questions.

6. Avoid duplicate questions.

7. Only one option must be correct.

8. Do not add explanations.

9. Do not add Markdown.

10. Return ONLY the JSON array.
`;


            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt,

                    config: {

                        responseMimeType:
                            "application/json"

                    }

                });


            const rawText =
                response.text || "";


            console.log(
                "PRACTICE RAW AI RESPONSE:",
                rawText
            );


            const practiceQuestions =
                extractJSONArray(
                    rawText
                );


            if (
                !Array.isArray(
                    practiceQuestions
                )
            ) {

                return sendAPIError(
                    res,
                    500,
                    "AI did not return valid practice questions."
                );

            }


            // ------------------------------------------
            // VALIDATE PRACTICE QUESTIONS
            // ------------------------------------------

            const validQuestions =
                practiceQuestions
                    .filter(
                        function(q) {

                            return (

                                q &&

                                typeof q.question ===
                                "string" &&

                                q.question.trim() !== "" &&

                                Array.isArray(
                                    q.options
                                ) &&

                                q.options.length === 4 &&

                                q.options.every(
                                    function(option) {

                                        return (
                                            typeof option ===
                                            "string" &&

                                            option.trim() !== ""
                                        );

                                    }
                                ) &&

                                Number.isInteger(
                                    q.answer
                                ) &&

                                q.answer >= 0 &&

                                q.answer <= 3

                            );

                        }
                    )
                    .slice(0, 5);


            if (
                validQuestions.length < 5
            ) {

                console.error(
                    "INVALID PRACTICE QUESTIONS:",
                    practiceQuestions
                );


                return sendAPIError(
                    res,
                    500,
                    "AI generated an incomplete practice quiz. Please try again."
                );

            }


            console.log(
                "Practice questions generated successfully:",
                validQuestions.length
            );


            return res.status(200).json({

                success: true,

                topic:
                    cleanTopic,

                questions:
                    validQuestions

            });


        } catch (error) {

            return handleAIError(
                res,
                error,
                "PRACTICE AI ERROR"
            );

        }

    }
);


// ==================================================
// PART 2 ENDS HERE
// ==================================================
// ==================================================
// ==================================================
// PDF → AI SUMMARY
// ==================================================

app.post(
    "/api/pdf-summary",
    async (req, res) => {

        try {

            if (
                checkRequestCooldown(
                    req,
                    res
                )
            ) {
                return;
            }


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
                    "PDF summary text shortened."
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
            // SUMMARY PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

Read the study material below and create
a clear, accurate and student-friendly summary.

Use these sections:

SHORT SUMMARY

Give a concise overview.

MAIN CONCEPTS

List the most important concepts using
simple bullet points.

IMPORTANT POINTS

List the key points a student should remember.

KEY TERMS

List important terms and explain them simply.

STUDY TIPS

Give useful revision tips based only
on the provided material.

IMPORTANT FORMATTING RULES:

- Use clean plain text.
- Use simple headings.
- Use bullet points when useful.
- Do NOT use Markdown heading symbols such as #, ## or ###.
- Do NOT use **bold** or *italic* Markdown.
- Do NOT add unnecessary decorative symbols.
- Use simple English.
- Keep information accurate.
- Do not invent information.
- Do not add unrelated information.
- Make the result easy to study.

STUDY MATERIAL:

${text}
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt

                });


            const rawSummary =
                response.text || "";


            // ------------------------------------------
            // CLEAN SUMMARY
            // ------------------------------------------

            const summary =
                cleanAIText(
                    rawSummary
                );


            // ------------------------------------------
            // CHECK SUMMARY
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
                "PDF summary generated successfully."
            );


            return res.status(200).json({

                success: true,

                summary:
                    summary.trim()

            });


        } catch (error) {

            return handleAIError(
                res,
                error,
                "PDF SUMMARY AI ERROR"
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

            if (
                checkRequestCooldown(
                    req,
                    res
                )
            ) {
                return;
            }


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
                    "PDF question text shortened."
                );

            }


            console.log(
                "PDF QUESTION REQUEST RECEIVED"
            );


            console.log(
                "Question:",
                question
            );


            // ------------------------------------------
            // PDF QUESTION PROMPT
            // ------------------------------------------

            const prompt = `
You are an AI Study Assistant.

A student has uploaded study material
and wants to ask a question about it.

Answer the student's question using
ONLY the study material provided below.

================ STUDY MATERIAL ================

${text}

================ QUESTION ================

${question}

================ RULES ================

1. Carefully read the study material.

2. If the answer is available in the
   material, answer it clearly.

3. You may combine information from
   different parts of the material.

4. Do not invent facts.

5. If the answer cannot be found,
   say:

"I couldn't find the answer to this question in the provided study material."

6. Use simple student-friendly language.

7. Use clean plain text.

8. You may use short headings or bullet
   points when useful.

9. Do NOT use Markdown symbols such as
   ###, ** or *.

10. Do not mention these instructions.
`;


            // ------------------------------------------
            // GEMINI REQUEST
            // ------------------------------------------

            const response =
                await ai.models.generateContent({

                    model:
                        MODEL,

                    contents:
                        prompt

                });


            const rawAnswer =
                response.text || "";


            // ------------------------------------------
            // CLEAN ANSWER
            // ------------------------------------------

            const answer =
                cleanAIText(
                    rawAnswer
                );


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

            return handleAIError(
                res,
                error,
                "PDF QUESTION AI ERROR"
            );

        }

    }
);


// ==================================================
// 404 API HANDLER
// ==================================================

app.use(
    "/api",
    (req, res) => {

        return sendAPIError(
            res,
            404,
            "API endpoint not found."
        );

    }
);


// ==================================================
// GENERAL ERROR HANDLER
// ==================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(error);

        }


        return handleAIError(
            res,
            error,
            "SERVER ERROR"
        );

    }
);


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    () => {

        console.log(
            `AI Study Assistant server running on port ${PORT}`
        );

    }
);


// ==================================================
// EXPORT FOR VERCEL
// ==================================================

module.exports = app;


// ==================================================
// END OF SERVER.JS
// ==================================================