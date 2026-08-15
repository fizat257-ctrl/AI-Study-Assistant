require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;

// Current Gemini model
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

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ==================================================
// HOME / AUTH PAGE
// ==================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "auth.html")
    );
});

app.get("/auth.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "auth.html")
    );
});

// ==================================================
// DASHBOARD
// ==================================================

app.get("/dashboard.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "dashboard.html")
    );
});

// ==================================================
// FLASHCARDS PAGE
// ==================================================

app.get("/flashcard.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "flashcard.html")
    );
});

// ==================================================
// AI STUDY ASSISTANT
// ==================================================

app.post("/api/study", async (req, res) => {

    try {

        const question = req.body.question;

        if (!question || !question.trim()) {

            return res.status(400).json({
                error: "Please enter a study question."
            });

        }

        const response = await ai.models.generateContent({

            model: MODEL,

            contents: `
You are an AI Study Assistant.

Explain the following question clearly and simply for a student.

Question:
${question}

Give an accurate, helpful and student-friendly explanation.

Use simple examples when useful.
`
        });

        const answer = response.text || "";

        res.json({
            answer: answer
        });

    } catch (error) {

        console.error("STUDY AI ERROR:");
        console.error(error);

        res.status(500).json({
            error: "Sorry, I could not connect to the AI. Please try again."
        });
    }

});

// ==================================================
// AI FLASHCARDS
// ==================================================

app.post("/api/flashcards", async (req, res) => {

    try {

        const topic = req.body.topic;

        if (!topic || !topic.trim()) {

            return res.status(400).json({
                error: "Please enter a study topic."
            });

        }

        console.log("Generating flashcards for:", topic);

        const response = await ai.models.generateContent({

            model: MODEL,

            contents: `
You are an AI Study Assistant.

Create exactly 5 useful study flashcards about:

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
2. Every flashcard must have "question" and "answer".
3. Questions must be clear and student-friendly.
4. Answers must be accurate and easy to understand.
5. Do not use Markdown.
6. Do not add explanations.
7. Do not write anything before or after the JSON.
8. Return ONLY the JSON array.
`
        });

        let text = response.text || "";

        console.log("Gemini Flashcards Response:");
        console.log(text);

        // Remove Markdown code fences if Gemini adds them
        text = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        // Find JSON array if extra text somehow appears
        const start = text.indexOf("[");
        const end = text.lastIndexOf("]");

        if (start === -1 || end === -1) {

            console.error("No JSON array found:");
            console.error(text);

            return res.status(500).json({
                error: "AI did not return valid flashcards."
            });
        }

        const jsonText = text.substring(
            start,
            end + 1
        );

        let flashcards;

        try {

            flashcards = JSON.parse(jsonText);

        } catch (jsonError) {

            console.error("JSON PARSE ERROR:");
            console.error(jsonError);
            console.error("AI RESPONSE:");
            console.error(text);

            return res.status(500).json({
                error: "AI returned invalid flashcard data."
            });
        }

        // Make sure we actually received an array
        if (!Array.isArray(flashcards)) {

            return res.status(500).json({
                error: "Invalid flashcard format."
            });
        }

        // Send result to frontend
        res.json({
            flashcards: flashcards
        });

    } catch (error) {

        console.error("==============================");
        console.error("FLASHCARDS AI ERROR");
        console.error("==============================");

        console.error("Message:", error?.message);
        console.error("Status:", error?.status);
        console.error("Response:", error?.response);

        res.status(500).json({
            error: "Sorry, I could not generate flashcards. Please try again."
        });
    }

});

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "AI Study Assistant server is working.",
        model: MODEL
    });

});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

    console.log("======================================");
    console.log("AI STUDY ASSISTANT SERVER");
    console.log("======================================");
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Gemini model: ${MODEL}`);
    console.log("======================================");

});