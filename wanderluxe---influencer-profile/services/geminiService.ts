import { GoogleGenAI } from "@google/genai";

// Initialize the client securely
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateTripPreview = async (destination: string, style: string): Promise<string> => {
    const client = getClient();
    if (!client) return "AI Assistant is currently offline (Missing API Key).";

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert travel influencer named Elena. 
            Create a very short, exciting, 3-bullet-point teaser itinerary for a trip to ${destination} with a ${style} style.
            Keep it casual, punchy, and inviting. Use emojis. 
            End with a call to action to book the full consultation.`
        });
        
        return response.text || "Could not generate preview.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Unable to generate a preview at this moment. Please try again later.";
    }
};
