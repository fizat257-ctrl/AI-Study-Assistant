require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;


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
// LOGIN / SIGN UP PAGE
// ==================================================

// Main homepage → Login / Sign Up
app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "auth.html")
    );

});


// Direct Login / Sign Up page
app.get("/auth.html", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "auth.html")
    );

});


// ==================================================
// GEMINI AI
// ==================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ==================================================
// AI STUDY ASSISTANT API
// ==================================================

app.post("/api/study", async (req, res) => {

    try {

        const question = req.body.question;


        // Check question
        if (!question || !question.trim()) {

            return res.status(400).json({
                error: "Please enter a study question."
            });

        }


        // Send question to Gemini
        const response =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents:
                    `You are an AI Study Assistant.

Explain the following question clearly and simply for a student.

Question:
${question}

Give an accurate, helpful and student-friendly explanation.
Use simple examples when useful.`

            });


        // Get AI answer
        const answer = response.text;


        // Send answer to frontend
        res.json({
            answer: answer
        });


    } catch (error) {

        console.error("Gemini AI Error:");
        console.error(error);


        res.status(500).json({

            error:
                "Sorry, I could not connect to the AI. Please try again."

        });

    }

});


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);