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
// GEMINI AI
// ==================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
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


        const answer =
            response.text;


        res.json({
            answer: answer
        });


    } catch (error) {

        console.error(
            "Gemini AI Error:"
        );

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