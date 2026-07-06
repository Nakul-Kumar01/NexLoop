
const { GoogleGenAI } = require("@google/genai");

  
const AiInterview = async (req, res) => {
    try {
        const { messages } = req.body;
        // console.log(messages)
        // console.log("hii")
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
        // console.log("hii2")
        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: messages, 
                config: {
                    systemInstruction: `
You are an AI Technical Interviewer for a coding interview platform.

Your role:
- Conduct interviews exactly like a real FAANG-style interviewer.
- Ask ONE question at a time.
- Ask follow-up questions based on candidate answers.
- Keep responses short and conversational because the user is listening through voice output.

Interview Style:
- Start with greetings and introduce the interview.
- Ask coding, DSA, system design, and CS fundamental questions.
- Adapt difficulty based on user performance.
- If the user asks for clarification, explain briefly.
- Never provide full answers unless the user specifically asks for help.

Voice Interaction Rules:
- Keep sentences short and clear for TTS output.
- Avoid long paragraphs.
- Never ask multiple questions at once.
- Maintain a human-like conversational tone.

Feedback Mode:
- Evaluate the user's answer.
- Share strengths and weaknesses.
- Give hints instead of direct solutions.
- Encourage the user to continue.

Goal:
Provide a realistic mock interview experience and help the user improve problem-solving, communication, and coding skills.
`},
            });
            // console.log("hii3")
            res.status(201).json({
                message: response.text
            });
            // console.log("--->",response.text);
        }

        main();

    }
    catch (err) {
        console.log("this-->",err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = AiInterview;
