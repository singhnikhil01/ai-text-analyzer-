
import React, { useState, useCallback, useEffect } from 'react';
import TextInput from './components/PaperInput';
import ParaphraseResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { 
  generateParaphrases, 
  detectAIGeneratedContent,
  findPlagiarism
} from './services/geminiService';
import type { 
  ParaphraseResultItem, 
  WebSource, 
  AIContentDetectionResult,
  DetectAIContentServiceResult,
  PlagiarismDetectionResult,
  FindPlagiarismServiceResult
} from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [paraphraseResultItems, setParaphraseResultItems] = useState<ParaphraseResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [overallError, setOverallError] = useState<string | null>(null);
  const [hasAttemptedProcessing, setHasAttemptedProcessing] = useState<boolean>(false);

  const processSingleItemAIDetection = async (itemId: string, textToAnalyze: string) => {
    setParaphraseResultItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, aiDetectionStatus: 'loading' as const, aiDetectionErrorMessage: undefined, aiDetectionResult: null } : item
      )
    );
    try {
      const aiDetectionServiceResult: DetectAIContentServiceResult = await detectAIGeneratedContent(textToAnalyze);
      setParaphraseResultItems(prevItems =>
        prevItems.map(item => {
          if (item.id === itemId) {
            if (aiDetectionServiceResult.analysis) {
              return {
                ...item,
                aiDetectionStatus: 'success' as const,
                aiDetectionResult: aiDetectionServiceResult.analysis,
              };
            } else {
              return {
                ...item,
                aiDetectionStatus: 'error' as const,
                aiDetectionErrorMessage: 'Failed to get AI content analysis.',
              };
            }
          }
          return item;
        })
      );
    } catch (error) {
      console.error(`Error detecting AI content for item ${itemId}:`, error);
      setParaphraseResultItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, aiDetectionStatus: 'error' as const, aiDetectionErrorMessage: error instanceof Error ? error.message : 'Unknown error in AI detection.' }
            : item
        )
      );
    }
  };

  const processSingleItemPlagiarismCheck = async (itemId: string, textToCheck: string) => {
    setParaphraseResultItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, plagiarismDetectionStatus: 'loading' as const, plagiarismErrorMessage: undefined, plagiarismDetectionResult: null } : item
      )
    );
    try {
      const plagiarismServiceResult: FindPlagiarismServiceResult = await findPlagiarism(textToCheck);
      setParaphraseResultItems(prevItems =>
        prevItems.map(item => {
          if (item.id === itemId) {
            if (plagiarismServiceResult.analysis) {
              return {
                ...item,
                plagiarismDetectionStatus: 'success' as const,
                plagiarismDetectionResult: plagiarismServiceResult.analysis,
                plagiarismGroundingSources: plagiarismServiceResult.groundingSources || ([] as WebSource[]),
              };
            } else {
              return {
                ...item,
                plagiarismDetectionStatus: 'error' as const,
                plagiarismErrorMessage: 'Failed to get plagiarism analysis.',
              };
            }
          }
          return item;
        })
      );
    } catch (error) {
      console.error(`Error checking plagiarism for item ${itemId}:`, error);
      setParaphraseResultItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, plagiarismDetectionStatus: 'error' as const, plagiarismErrorMessage: error instanceof Error ? error.message : 'Unknown error in plagiarism check.' }
            : item
        )
      );
    }
  };


  const handleProcessInput = useCallback(async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput) {
      setOverallError("Please enter some text to process.");
      setParaphraseResultItems([]);
      setIsLoading(false);
      setHasAttemptedProcessing(true);
      return;
    }

    setIsLoading(true);
    setHasAttemptedProcessing(true);
    setOverallError(null);
    setLoadingMessage('Generating paraphrases...');
    setParaphraseResultItems([]);

    try {
      const paraphrases = await generateParaphrases(trimmedInput, 3);

      const initialItems: ParaphraseResultItem[] = [
        {
          id: 'original-text',
          text: trimmedInput,
          isOriginal: true,
          aiDetectionStatus: 'idle' as const, aiDetectionResult: null,
          plagiarismDetectionStatus: 'idle' as const, plagiarismDetectionResult: null, plagiarismGroundingSources: [],
        },
        ...paraphrases.map((p, index) => ({
          id: `paraphrase-${index}`,
          text: p,
          isOriginal: false,
          aiDetectionStatus: 'idle' as const, aiDetectionResult: null,
          plagiarismDetectionStatus: 'idle' as const, plagiarismDetectionResult: null, plagiarismGroundingSources: [],
        })),
      ];
      setParaphraseResultItems(initialItems);

      if (paraphrases.length === 0 && initialItems.length <= 1) { // Only original text, no paraphrases
         setLoadingMessage('');
         setOverallError('No paraphrases were generated. The input might be too short or unsuitable. Analyzing original text only.');
      }
      
      // Process original text fully first
      const originalItem = initialItems.find(item => item.isOriginal);
      if (originalItem) {
        setLoadingMessage('Analyzing AI content for original text...');
        await processSingleItemAIDetection(originalItem.id, originalItem.text);

        setLoadingMessage('Checking plagiarism for original text...');
        await processSingleItemPlagiarismCheck(originalItem.id, originalItem.text);
      }
      
      // Then process paraphrases
      const paraphraseOnlyItems = initialItems.filter(item => !item.isOriginal);
      for (const paraphraseItem of paraphraseOnlyItems) {
        setLoadingMessage(`Processing paraphrase: "${paraphraseItem.text.substring(0,25)}..." (AI Detection)`);
        await processSingleItemAIDetection(paraphraseItem.id, paraphraseItem.text);
        
        setLoadingMessage(`Processing paraphrase: "${paraphraseItem.text.substring(0,25)}..." (Plagiarism Check)`);
        await processSingleItemPlagiarismCheck(paraphraseItem.id, paraphraseItem.text);
      }
      setLoadingMessage('All processing complete.');

    } catch (error) {
      console.error("Error during main processing:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
      setOverallError(errorMessage);
      // Mark all in-flight items as error if a global error occurs
      setParaphraseResultItems(prev => prev.map(item => ({
          ...item,
          aiDetectionStatus: item.aiDetectionStatus === 'loading' ? 'error' as const : item.aiDetectionStatus,
          aiDetectionErrorMessage: item.aiDetectionStatus === 'loading' ? 'Processing interrupted' : item.aiDetectionErrorMessage,
          plagiarismDetectionStatus: item.plagiarismDetectionStatus === 'loading' ? 'error' as const : item.plagiarismDetectionStatus,
          plagiarismErrorMessage: item.plagiarismDetectionStatus === 'loading' ? 'Processing interrupted' : item.plagiarismErrorMessage,
      })));
    } finally {
      setIsLoading(false);
      if (!overallError && paraphraseResultItems.length === 0 && !isLoading) { 
          setLoadingMessage(''); 
      } else if (!isLoading) {
          setLoadingMessage(''); 
      }
    }
  }, [inputText]);
  
  const handleDetectAIContentForItem = (itemId: string, text: string) => {
    const item = paraphraseResultItems.find(i => i.id === itemId);
    if (item && (item.aiDetectionStatus === 'idle' || item.aiDetectionStatus === 'error')) {
      processSingleItemAIDetection(itemId, text);
    }
  };

  const handleCheckPlagiarismForItem = (itemId: string, text: string) => {
    const item = paraphraseResultItems.find(i => i.id === itemId);
    if (item && (item.plagiarismDetectionStatus === 'idle' || item.plagiarismDetectionStatus === 'error')) {
      processSingleItemPlagiarismCheck(itemId, text);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-sky-400">
          AI Text Analyzer
        </h1>
        <p className="text-slate-400 mt-3 text-lg leading-relaxed max-w-2xl mx-auto">
          Paraphrase text, detect AI generation, and check for plagiarism.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <TextInput
          inputText={inputText}
          onInputChange={(text) => {
            setInputText(text);
            if (!isLoading) { 
                setParaphraseResultItems([]);
                setHasAttemptedProcessing(false);
                setOverallError(null);
            }
          }}
          onSubmit={handleProcessInput}
          isLoading={isLoading}
          placeholderText="Enter a sentence or short paragraph to analyze..."
          buttonText="Analyze Text"
        />

        {isLoading && (
          <div className="mt-10 text-center" aria-live="polite" aria-busy="true">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-300 text-lg">{loadingMessage || 'Processing...'}</p>
          </div>
        )}
        
        {!isLoading && overallError && (
          <div className="mt-6 p-4 bg-red-700 text-red-100 rounded-md shadow-lg text-center" role="alert">
            <p>{overallError}</p>
          </div>
        )}
        
        {!isLoading && (
           <ParaphraseResultsDisplay 
              resultItems={paraphraseResultItems}
              onDetectAIContent={handleDetectAIContentForItem}
              onCheckPlagiarism={handleCheckPlagiarismForItem}
              overallStatusMessage={(!hasAttemptedProcessing && paraphraseResultItems.length === 0 && !overallError && !isLoading) ? "Enter text above and click 'Analyze Text' to begin." : undefined}
           />
        )}
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-700">
        <p className="text-sm text-slate-500">Powered by Gemini AI & React. Styled with Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;