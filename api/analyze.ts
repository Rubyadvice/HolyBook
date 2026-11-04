import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the Google GenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Configurable model and store via environment variables
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FILE_SEARCH_STORE = process.env.GEMINI_FILE_SEARCH_STORE_NAME;

// Systematic Schema for the Biblical Scholar Analysis Engine
const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.STRING,
      description: "Concise 2-3 sentence orientation for modern readers."
    },
    observation: {
      type: Type.STRING,
      description: "Strict textual observations of what the passage states: structure, characters, events, and dialogue."
    },
    interpretation: {
      type: Type.STRING,
      description: "Historical-cultural and literary meaning in the original context."
    },
    historicalCulturalContext: {
      type: Type.STRING,
      description: "Historical era, geopolitical setting, archaeology, and customs of the time."
    },
    theologicalSignificance: {
      type: Type.STRING,
      description: "Core theological revelations about God, covenant, humanity, and redemptive history."
    },
    biblicalConnections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING },
          connectionType: { 
            type: Type.STRING, 
            description: "thematic, literary, covenantal, prophetic, or typological" 
          },
          description: { type: Type.STRING },
          significance: { type: Type.STRING }
        },
        required: ["reference", "connectionType", "description", "significance"]
      }
    },
    keyTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          originalLanguage: { type: Type.STRING, description: "Hebrew/Greek root or transliteration if applicable" },
          definition: { type: Type.STRING },
          relevance: { type: Type.STRING }
        },
        required: ["term", "definition", "relevance"]
      }
    },
    application: {
      type: Type.STRING,
      description: "Practical modern discipleship, ethical, and servant-leadership applications."
    },
    beginnerSummary: {
      type: Type.STRING,
      description: "A clear, accessible explanation free of insider academic jargon."
    },
    keyTakeaways: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 to 5 core principles."
    },
    commonMisunderstandings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Common historical or theological misreadings of this text."
    },
    reflectionQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          level: { type: Type.STRING, description: "Beginner, Intermediate, or Theological" }
        },
        required: ["question", "level"]
      }
    },
    interpretationCaveats: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Major scholarly or denominational disagreements and points of hermeneutical caution."
    }
  },
  required: [
    "overview",
    "observation",
    "interpretation",
    "historicalCulturalContext",
    "theologicalSignificance",
    "biblicalConnections",
    "keyTerms",
    "application",
    "beginnerSummary",
    "keyTakeaways",
    "commonMisunderstandings",
    "reflectionQuestions",
    "interpretationCaveats"
  ]
};

const SYSTEM_INSTRUCTION = `You are an expert interdisciplinary biblical scholar, historian, theologian, and educator.
Your objective is to provide academically sound, historically contextual, and beginner-accessible analysis of Scripture.

Strict Hermeneutical Rules:
1. Always distinguish between:
   a. What the text explicitly states.
   b. What can reasonably be inferred.
   c. What is supported by historical/cultural/archaeological evidence.
   d. What represents specific confessional or theological interpretations.
   e. What constitutes contemporary practical or leadership application.
2. Scripture text provided in the prompt is your primary evidence. Secondary resources and RAG retrieved documents provide supporting context.
3. When scholars or traditions disagree (e.g. millennial views, covenant vs dispensational, authorship dates), present major views fairly without forcing artificial consensus.
4. Never invent historical citations, original-language roots, archaeological claims, or biblical cross-references.
5. Provide actionable, practical leadership insights without moralizing or tearing text from context.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY is not configured in environment variables.' 
    });
  }

  try {
    const { storyId, title, ref: scriptureRef, body, why, scriptureText } = req.body;

    if (!scriptureRef) {
      return res.status(400).json({ error: 'Scripture reference ("ref") is required.' });
    }

    // Configure tools: include File Search Store if configured
    const tools: any[] = [];
    if (FILE_SEARCH_STORE) {
      tools.push({
        fileSearch: {
          storeNames: [FILE_SEARCH_STORE]
        }
      });
    }

    const prompt = `Perform an in-depth biblical study and pedagogical analysis of the following passage:

TITLE: ${title || 'Scripture Study'}
REFERENCE: ${scriptureRef}
EDITORIAL CONTEXT: ${body || 'N/A'}
THEMATIC PURPOSE: ${why || 'N/A'}

PRIMARY SCRIPTURE TEXT (King James Version / Original Witness):
"""
${scriptureText || '(Passage text provided by reference: ' + scriptureRef + ')'}
"""

Analyze this passage thoroughly across all schema dimensions. Differentiate primary scripture from secondary scholarly traditions.`;

    // Call the Gemini API via the official @google/genai SDK
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools.length > 0 ? tools : undefined,
        responseMimeType: 'application/json',
        responseSchema: analysisResponseSchema,
        temperature: 0.2, // Low temperature for high factual and citation fidelity
      }
    });

    const candidate = response.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('No analysis generated from Gemini.');
    }

    const structuredData = JSON.parse(rawText);

    // Extract genuine Grounding / File Search Citations if present
    const citations: Array<{ uri?: string; title?: string; textSnippet?: string }> = [];
    const groundingMetadata = candidate?.groundingMetadata;
    
    if (groundingMetadata && groundingMetadata.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          citations.push({
            uri: chunk.web.uri,
            title: chunk.web.title || 'Referenced Source'
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: structuredData,
      citations,
      modelUsed: MODEL_NAME,
      groundedWithRag: Boolean(FILE_SEARCH_STORE && citations.length > 0)
    });

  } catch (error: any) {
    console.error('Biblical Analysis API Error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during biblical analysis generation.'
    });
  }
}