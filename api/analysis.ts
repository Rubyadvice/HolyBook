import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiClient, resolveFileSearchStore, DEFAULT_MODEL, DEFAULT_STORE_DISPLAY_NAME } from './_lib/gemini';

// Standardized JSON Schema definition compatible with @google/genai responseSchema
const oiaSchema = {
  type: "OBJECT",
  properties: {
    observation: {
      type: "OBJECT",
      properties: {
        journalistic_baseline: {
          type: "OBJECT",
          properties: {
            who: { type: "STRING" },
            what: { type: "STRING" },
            where: { type: "STRING" },
            when: { type: "STRING" },
            why_here: { type: "STRING" }
          },
          required: ["who", "what", "where", "when", "why_here"]
        },
        grammar_and_structure: {
          type: "OBJECT",
          properties: {
            verbs_analysis: { type: "STRING" },
            key_conjunctions: { type: "STRING" },
            pronoun_tracing: { type: "STRING" }
          },
          required: ["verbs_analysis", "key_conjunctions", "pronoun_tracing"]
        },
        literary_features: {
          type: "OBJECT",
          properties: {
            repetition: { type: "ARRAY", items: { type: "STRING" } },
            comparisons_contrasts: { type: "STRING" },
            tone: { type: "STRING" }
          },
          required: ["repetition", "comparisons_contrasts", "tone"]
        }
      },
      required: ["journalistic_baseline", "grammar_and_structure", "literary_features"]
    },
    interpretation: {
      type: "OBJECT",
      properties: {
        contextual_analysis: {
          type: "OBJECT",
          properties: {
            immediate_context: { type: "STRING" },
            book_context: { type: "STRING" },
            cultural_historical_context: { type: "STRING" }
          },
          required: ["immediate_context", "book_context", "cultural_historical_context"]
        },
        theological_analysis: {
          type: "OBJECT",
          properties: {
            theology_proper: { type: "STRING" },
            christology: { type: "STRING" },
            anthropology: { type: "STRING" }
          },
          required: ["theology_proper", "christology", "anthropology"]
        },
        principlizing_bridge: { type: "STRING" }
      },
      required: ["contextual_analysis", "theological_analysis", "principlizing_bridge"]
    },
    application: {
      type: "OBJECT",
      properties: {
        spacepets_audit: {
          type: "OBJECT",
          properties: {
            applicable_categories: { type: "ARRAY", items: { type: "STRING" } },
            audit_explanation: { type: "STRING" }
          },
          required: ["applicable_categories", "audit_explanation"]
        },
        action_plan: {
          type: "OBJECT",
          properties: {
            internal_alignment: { type: "STRING" },
            relational_impact: { type: "STRING" },
            measurable_action: { type: "STRING" }
          },
          required: ["internal_alignment", "relational_impact", "measurable_action"]
        }
      },
      required: ["spacepets_audit", "action_plan"]
    }
  },
  required: ["observation", "interpretation", "application"]
};

const BIBLICAL_SCHOLAR_SYSTEM_INSTRUCTION = `SYSTEM ROLE:
You are an expert biblical exegete and theological scholar. Your task is to perform a rigorous Inductive Bible Study on the provided biblical text using the Observation, Interpretation, and Application (OIA) framework.

INSTRUCTIONS:
You will receive a biblical passage and its translation. You must analyze the text by exhaustively addressing the forensic, exegetical, and transformational questions outlined below. 

You must return your analysis strictly as a JSON object matching the requested schema. Do not output any markdown formatting outside of the JSON structure.

METHODOLOGY:
Phase 1: Observation (The Forensic Stage - What does the text say?)
- Journalistic Baseline: Identify the speaker, audience, main characters, geographical setting, historical timing, and the structural placement of the text.
- Grammar & Structure: Analyze the verbs (active/passive, past/present/future, indicative/imperative). Identify key transition words (therefore, but, if/then, because) and trace all pronoun antecedents.
- Literary Features: Note repeated words or phrases, comparisons, contrasts, lists, and the emotional tone of the author.

Phase 2: Interpretation (The Exegetical Stage - What did it mean?)
- Contextual Analysis: Explain how the immediate surrounding verses and the overarching book theme shape the meaning of this passage. Note any cultural or historical customs the original audience would have understood.
- Theological Analysis: Extract what this passage reveals about God (Theology Proper), how it points to or reflects Jesus (Christology), and what it reveals about human nature or weakness (Anthropology).
- The Principlizing Bridge: Synthesize the analysis into a single, timeless theological principle that applies equally to the original audience and a modern reader.

Phase 3: Application (The Transformational Stage - What does it mean for the reader?)
- The Personal Audit (SPACEPETS filter): Identify if the text contains a Sin to confess, Promise to claim, Attitude to change, Command to obey, Example to follow, Prayer to pray, Error to avoid, Truth to believe, or Something to praise God for.
- Internal & Relational Impact: Explain how this principle challenges modern assumptions and alters how the reader should treat others.
- Measurable Action: Provide one highly specific, concrete, and measurable action the reader can take within 48 hours to apply this text.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration for local testing and production Vercel environments
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  let ai;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to initialize Gemini client.' });
  }

  try {
    const payload = (req.body || {}) as {
      storyId?: string;
      title?: string;
      ref?: string;
      body?: string;
      why?: string;
      scriptureText?: string;
      mode?: string;
      targetWord?: string;
      targetSentence?: string;
    };

    const {
      title,
      ref: scriptureRef,
      body,
      why,
      scriptureText,
      targetWord,
      targetSentence
    } = payload;

    if (!scriptureRef) {
      return res.status(400).json({ error: 'Scripture reference ("ref") is required.' });
    }

    // Resolve RAG File Search Store if configured
    const resolvedStoreName = await resolveFileSearchStore(ai, DEFAULT_STORE_DISPLAY_NAME);
    const tools: any[] = [];

    if (resolvedStoreName) {
      tools.push({
        fileSearch: {
          fileSearchStoreNames: [resolvedStoreName]
        }
      });
    }

    const passagePrompt = `Input Passage to Analyze:
PASSAGE TITLE: ${title || 'Scripture Study'}
SCRIPTURE REFERENCE: ${scriptureRef} (King James Version / Canonical Text)
FOCUSED SENTENCE OR VERSE: "${targetSentence || ''}"
FOCUSED KEY WORD (if selected): "${targetWord || ''}"
EDITORIAL CONTEXT: ${body || ''}
LEADERSHIP / THEMATIC EMPHASIS: ${why || ''}
FULL PASSAGE TEXT:
"""
${scriptureText && scriptureText.trim() ? scriptureText.trim() : `${scriptureRef}: ${targetSentence || body || ''}`}
"""

Execute your analysis systematically across all phases of the Inductive Bible Study (OIA) Framework.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: passagePrompt,
      config: {
        systemInstruction: BIBLICAL_SCHOLAR_SYSTEM_INSTRUCTION,
        tools: tools.length > 0 ? tools : undefined,
        responseMimeType: 'application/json',
        responseSchema: oiaSchema as any,
        temperature: 0.2,
      }
    });

    const candidate = response.candidates?.[0];
    const generatedJson = candidate?.content?.parts?.[0]?.text;

    if (!generatedJson) {
      throw new Error('The AI engine did not return a valid OIA response payload.');
    }

    const structuredData = JSON.parse(generatedJson);

    // Extract Grounding Citations from Gemini File Search
    const citations: Array<{ uri?: string; title?: string; pageNumber?: number }> = [];
    const groundingMetadata = candidate?.groundingMetadata;

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          citations.push({
            uri: chunk.web.uri,
            title: chunk.web.title || 'Referenced Source',
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: structuredData,
      citations,
      modelUsed: DEFAULT_MODEL,
      groundedWithRag: Boolean(resolvedStoreName && citations.length > 0)
    });

  } catch (error: any) {
    console.error('Biblical Analysis Serverless Error:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred while generating biblical analysis.'
    });
  }
}