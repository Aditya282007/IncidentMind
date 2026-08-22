const fs = require('fs');
const path = require('path');

let knowledgeCache = null;

/**
 * Load all knowledge base files into memory for fast keyword search
 */
async function initializeKnowledgeBase() {
  const knowledgeBasePath = path.join(__dirname, '..', 'knowledge-base');
  
  try {
    const files = await fs.promises.readdir(knowledgeBasePath);
    const allDocs = [];
    
    for (const file of files) {
      const filePath = path.join(knowledgeBasePath, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isDirectory()) {
        const subFiles = await fs.promises.readdir(filePath);
        for (const subFile of subFiles) {
          const subFilePath = path.join(filePath, subFile);
          const content = await fs.promises.readFile(subFilePath, 'utf8');
          allDocs.push({
            content,
            metadata: { 
              path: subFilePath, 
              category: file, 
              filename: subFile 
            }
          });
        }
      } else {
        const content = await fs.promises.readFile(filePath, 'utf8');
        allDocs.push({
          content,
          metadata: { 
            path: filePath, 
            category: 'root', 
            filename: file 
          }
        });
      }
    }
    
    knowledgeCache = allDocs;
    console.log(`Knowledge base loaded: ${allDocs.length} documents from ${files.length} categories`);
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    knowledgeCache = [];
  }
}

/**
 * Simple keyword-based search with scoring
 * Returns top K most relevant documents
 */
function queryKnowledgeBase(queryText, category = null, topK = 3) {
  if (!knowledgeCache || knowledgeCache.length === 0) {
    console.warn('Knowledge cache not initialized');
    return [];
  }
  
  const queryWords = queryText.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => w.replace(/[^\w]/g, ''));
  
  const filtered = category 
    ? knowledgeCache.filter(d => d.metadata.category === category)
    : knowledgeCache;
  
  // Score each document
  const scored = filtered.map(doc => {
    const contentLower = doc.content.toLowerCase();
    let score = 0;
    
    for (const word of queryWords) {
      // Count occurrences
      const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += matches;
      
      // Bonus for filename matches
      if (doc.metadata.filename.toLowerCase().includes(word)) {
        score += 2;
      }
    }
    
    return { ...doc, score };
  });
  
  // Sort by score descending, take top K
  return scored
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ score, ...doc }) => doc);
}

// Per-agent context builders
async function getDiagnoserContext(serviceName, symptom) {
  const query = `similar incidents ${serviceName} ${symptom} high CPU memory leak connection pool`;
  const pastIncidents = queryKnowledgeBase(query, 'past-incidents', 3);
  const runbooks = queryKnowledgeBase(query, 'runbooks', 2);
  return { pastIncidents, runbooks };
}

async function getPatcherContext(rootCause, serviceType) {
  const query = `runbook ${rootCause} ${serviceType} fix commands`;
  const runbooks = queryKnowledgeBase(query, 'runbooks', 2);
  const patchCommands = queryKnowledgeBase(query, 'patch-commands', 2);
  return { runbooks, patchCommands };
}

async function getCommunicatorContext(incidentSummary, severity) {
  const query = `incident report template ${severity} notification slack`;
  const runbooks = queryKnowledgeBase(query, 'runbooks', 1);
  return { runbooks };
}

// Context builders for prompts
function buildDiagnoserRagContext(pastIncidents, runbooks) {
  let ragContext = '';
  if (pastIncidents.length > 0) {
    ragContext += '\n📚 RETRIEVED PAST INCIDENTS:\n';
    pastIncidents.forEach((item, idx) => {
      ragContext += `${idx + 1}. ${item.metadata?.filename || 'unknown'}: ${item.content.slice(0, 300)}\n`;
    });
  }
  if (runbooks.length > 0) {
    ragContext += '\n📖 RETRIEVED RUNBOOK SECTIONS:\n';
    runbooks.forEach((item, idx) => {
      ragContext += `${idx + 1}. ${item.metadata?.filename || 'unknown'}: ${item.content.slice(0, 300)}\n`;
    });
  }
  return ragContext;
}

function buildPatcherRagContext(runbooks, patchCommands) {
  let ragContext = '';
  if (runbooks.length > 0) {
    ragContext += '\n📖 RETRIEVED RUNBOOK SECTIONS:\n';
    runbooks.forEach((item, idx) => {
      ragContext += `${idx + 1}. ${item.metadata?.filename || 'unknown'}: ${item.content.slice(0, 300)}\n`;
    });
  }
  if (patchCommands.length > 0) {
    ragContext += '\n🔧 RETRIEVED PATCH COMMANDS:\n';
    patchCommands.forEach((item, idx) => {
      ragContext += `${idx + 1}. ${item.metadata?.filename || 'unknown'}: ${item.content.slice(0, 300)}\n`;
    });
  }
  return ragContext;
}

function buildCommunicatorRagContext(runbooks) {
  let ragContext = '';
  if (runbooks.length > 0) {
    ragContext += '\n📖 RETRIEVED NOTIFICATION TEMPLATES:\n';
    runbooks.forEach((item, idx) => {
      ragContext += `${idx + 1}. ${item.metadata?.filename || 'unknown'}: ${item.content.slice(0, 300)}\n`;
    });
  }
  return ragContext;
}

module.exports = {
  initializeKnowledgeBase,
  queryKnowledgeBase,
  getDiagnoserContext,
  getPatcherContext,
  getCommunicatorContext,
  buildDiagnoserRagContext,
  buildPatcherRagContext,
  buildCommunicatorRagContext,
};