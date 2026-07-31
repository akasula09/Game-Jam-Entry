export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question } = req.body;

    // Pull key from Vercel Environment Variables, or fallback to hardcoded
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system", 
                        content: "You are a scary, ancient entity trapped inside a game box. Answer the question very briefly (1-2 short sentences max) in a creepy, unsettling tone. You do not help."
                    },
                    {
                        role: "user", 
                        content: question || "What are you?"
                    }
                ]
            })
        });

        if (!groqResponse.ok) {
            const errorData = await groqResponse.text();
            console.error("Groq API Error:", errorData);
            return res.status(groqResponse.status).json({ error: "Failed request to Groq API" });
        }

        const data = await groqResponse.json();
        const answer = data.choices[0]?.message?.content || "There is no escape from what is coming.";

        return res.status(200).json({ answer });

    } catch (error) {
        console.error("Serverless Proxy Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
