/**
 * Ingestion script for the Holybook Biblical Knowledge Base
 * Powered by Google Gemini File Search Store
 *
 * Usage:
 *   npx ts-node scripts/ingest-rag.ts
 *
 * Prerequisites:
 *   - GEMINI_API_KEY environment variable set
 *   - Reference texts placed in ./knowledge_base/ directory
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is required.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Target directory containing public domain commentaries, lexicons, and historical records
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge_base');
const STORE_NAME = process.env.GEMINI_FILE_SEARCH_STORE_NAME || 'holybook-theological-library';

interface IngestionManifestItem {
  fileName: string;
  category: string;
  sourceTitle: string;
  author: string;
  licensing: string;
  status: 'PENDING' | 'INGESTED' | 'FAILED';
  fileUri?: string;
  uploadedAt?: string;
}

const MANIFEST_PATH = path.join(process.cwd(), 'knowledge_base_manifest.json');

function loadManifest(): IngestionManifestItem[] {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
  return [
    {
      fileName: 'websters_1828_biblical_terms.txt',
      category: 'Lexicon',
      sourceTitle: "American Dictionary of the English Language (1828)",
      author: 'Noah Webster',
      licensing: 'Public Domain',
      status: 'PENDING'
    },
    {
      fileName: 'ancient_near_east_covenants.txt',
      category: 'Historical Context',
      sourceTitle: 'Hittite & Ancient Near Eastern Suzerainty Treaty Structures',
      author: 'Biblical Archaeology Review Archive',
      licensing: 'Open Educational Resource',
      status: 'PENDING'
    },
    {
      fileName: 'second_temple_judaism_institutions.txt',
      category: 'Historical Context',
      sourceTitle: 'Sects, Sanhedrin, and Synagogues in the First Century',
      author: 'Historical Research Archive',
      licensing: 'Public Domain / Open Access',
      status: 'PENDING'
    }
  ];
}

function saveManifest(manifest: IngestionManifestItem[]) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

async function runIngestion() {
  console.log(`=== Starting Holybook RAG Ingestion into "${STORE_NAME}" ===`);

  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
    console.log(`Created knowledge base directory at: ${KNOWLEDGE_BASE_DIR}`);
    console.log(`Add your public domain texts (.txt, .md, .pdf) here, update knowledge_base_manifest.json, and run again.`);
  }

  const manifest = loadManifest();

  for (const item of manifest) {
    if (item.status === 'INGESTED') {
      console.log(`[SKIPPED] Already indexed: ${item.sourceTitle} (${item.fileName})`);
      continue;
    }

    const filePath = path.join(KNOWLEDGE_BASE_DIR, item.fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARNING] File missing on disk: ${filePath}. Skipping.`);
      continue;
    }

    console.log(`[UPLOADING] ${item.sourceTitle} -> Gemini File Search Store...`);
    try {
      // Ingest document into Gemini Files API
      // Note: Supported file types include text/plain, application/pdf, text/markdown
      const uploadResult = await ai.files.upload({
        file: fs.createReadStream(filePath),
        mimeType: item.fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
      });

      console.log(`[SUCCESS] Ingested file URI: ${uploadResult.uri}`);
      item.status = 'INGESTED';
      item.fileUri = uploadResult.uri;
      item.uploadedAt = new Date().toISOString();
    } catch (err: any) {
      console.error(`[ERROR] Failed to ingest ${item.fileName}:`, err.message);
      item.status = 'FAILED';
    }
  }

  saveManifest(manifest);
  console.log(`=== Ingestion Complete. Manifest updated at: ${MANIFEST_PATH} ===`);
}

runIngestion().catch(console.error);