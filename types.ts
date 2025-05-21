// --- AI Content Detection Types ---
export interface AIContentDetectionResult {
  isAiGenerated: boolean;
  confidenceScore: number; // 0-1
  reasoning: string;
}

// --- Plagiarism Detection Types ---
export interface PlagiarismMatch {
  textSegment: string;
  sourceUrl: string;
  sourceTitle: string | null;
  similarity: number; // 0-1
  justification: string; // Explanation for the match
  authors?: string | null; // Authors, if applicable (e.g., for academic papers)
}

export interface PlagiarismDetectionResult {
  overallPlagiarismScore: number; // 0-1
  matches: PlagiarismMatch[];
}

// For Plagiarism check grounding
export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: WebSource;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}


// Represents an item in the results list: either the original text or a paraphrase,
// along with its associated AI content detection and plagiarism check.
export interface ParaphraseResultItem {
  id: string; // Unique ID, e.g., "original-text" or "paraphrase-0"
  text: string; // The original or paraphrased text content
  isOriginal: boolean;
  
  aiDetectionStatus: 'idle' | 'loading' | 'success' | 'error';
  aiDetectionResult: AIContentDetectionResult | null;
  aiDetectionErrorMessage?: string;

  plagiarismDetectionStatus: 'idle' | 'loading' | 'success' | 'error';
  plagiarismDetectionResult: PlagiarismDetectionResult | null;
  plagiarismGroundingSources?: WebSource[]; // Grounding sources for plagiarism check
  plagiarismErrorMessage?: string;
}

// Shape of the JSON response expected from Gemini for generating paraphrases
export interface ParaphraseResponse {
  paraphrases: string[];
}

// Result from the service function that detects AI content
export interface DetectAIContentServiceResult {
  analysis: AIContentDetectionResult | null;
}

// Result from the service function that finds plagiarism
export interface FindPlagiarismServiceResult {
  analysis: PlagiarismDetectionResult | null;
  groundingSources?: WebSource[];
}

// Ensures the module is valid even if all type declarations are stripped.
export {};
