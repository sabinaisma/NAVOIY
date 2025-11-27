
import { GoogleGenAI, Type } from "@google/genai";
import { Story } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.5-flash-image";

export interface FileData {
  mimeType: string;
  data: string; // Base64
}

// File is now mandatory
export const generateStoryText = async (topic: string, file: FileData): Promise<Story> => {
  const parts: any[] = [];
  
  // 1. Add File (Mandatory)
  parts.push({
    inlineData: {
      mimeType: file.mimeType,
      data: file.data
    }
  });
  parts.push({ text: "Primary Source Material: Analyze this attached file to derive the setting, characters, and tone." });

  // 2. Add Prompt
  const promptText = `
  You are a master novelist and world-builder. 
  Create a comprehensive story bible and a short story based on the user's topic: "${topic}".
  
  Requirements:
  1. World Building: Expand on the world details. Describe the primary setting's geography and atmosphere. Detail relevant cultural aspects, societal norms, and unique elements that influence the plot.
  2. Characters: Create 2-3 main characters. Include name, detailed physical description, key personality traits, and a brief backstory for each.
  3. Plot Outline: Break down the story arc into exactly 5 key plot points in this order: Inciting Incident, Rising Action, Climax, Falling Action, Resolution. Assign each to a chapter.
  4. Story: Write 5 chapters. Each chapter must correspond strictly to its assigned plot point from the outline.
  
  Output MUST be a valid JSON object matching this structure:
  {
    "title": "Story Title",
    "world": {
      "geography": "Detailed description of the physical setting",
      "atmosphere": "Mood and sensory details",
      "culture": "Societal norms, customs, and unique elements"
    },
    "characters": [
      { "name": "Name", "description": "Visuals", "traits": "Personality", "backstory": "History" }
    ],
    "plotOutline": [
      { "chapterIndex": 0, "type": "Inciting Incident", "description": "Summary of this plot point" }
    ],
    "chapters": [
      { 
        "title": "Chapter Title", 
        "content": "Story text (approx 150 words)", 
        "imagePrompt": "Pixar-style 3D illustration prompt",
        "plotType": "Inciting Incident" 
      }
    ],
    "ending": "Emotional summary paragraph"
  }
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            world: {
              type: Type.OBJECT,
              properties: {
                geography: { type: Type.STRING },
                atmosphere: { type: Type.STRING },
                culture: { type: Type.STRING },
              },
              required: ["geography", "atmosphere", "culture"]
            },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  traits: { type: Type.STRING },
                  backstory: { type: Type.STRING },
                },
                required: ["name", "description", "traits", "backstory"]
              }
            },
            plotOutline: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                    chapterIndex: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING }
                 },
                 required: ["chapterIndex", "type", "description"]
               }
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  plotType: { type: Type.STRING },
                },
                required: ["title", "content", "imagePrompt", "plotType"]
              },
            },
            ending: { type: Type.STRING },
          },
          required: ["title", "world", "characters", "plotOutline", "chapters", "ending"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text generated");
    
    return JSON.parse(text) as Story;
  } catch (error) {
    console.error("Text generation failed:", error);
    throw new Error("Failed to weave the story. Please ensure your file is valid.");
  }
};

export const generateIllustration = async (imagePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { text: imagePrompt + " High quality, 3d render, pixar style, bright colors, volumetric lighting, detailed textures." }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: "4:3",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
