import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (API_KEY) {
  console.log("Groq API Key loaded successfully (starts with: " + API_KEY.substring(0, 6) + "...)");
} else {
  console.error("CRITICAL: VITE_GROQ_API_KEY is not defined in .env or environment variables.");
}

const groq = new Groq({ 
  apiKey: API_KEY || "",
  dangerouslyAllowBrowser: true // Necessary for browser-side SDK use
});

export const getAIResponse = async (prompt: string, history: { role: "user" | "assistant", content: string }[]) => {
  try {
    if (!API_KEY) {
      throw new Error("Groq API Key is missing. Please check your .env file and restart the dev server.");
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are SmartDash AI, a highly efficient, professional assistant built for a modern developer utility dashboard. Your primary goal is to help users with number conversions, note-taking, and system diagnostics. Be concise, technical, and helpful. Use Markdown for formatting code or lists. All operations happen locally in the user's browser."
        },
        ...history,
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "No response received.";
  } catch (error: any) {
    console.error("Groq AI API Error:", error);
    throw error;
  }
};
