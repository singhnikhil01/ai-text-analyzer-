
import React from 'react';
import type { ParaphraseResultItem, WebSource, AIContentDetectionResult, PlagiarismDetectionResult, PlagiarismMatch } from '../types';
import LoadingSpinner from './LoadingSpinner';
import LinkIcon from './icons/LinkIcon';
import AIIcon from './icons/AIIcon'; 
import ShieldCheckIcon from './icons/ShieldCheckIcon'; 
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';


interface ParaphraseResultsDisplayProps {
  resultItems: ParaphraseResultItem[];
  onDetectAIContent: (itemId: string, text: string) => void;
  onCheckPlagiarism: (itemId: string, text: string) => void;
  overallStatusMessage?: string;
}

const ResultsDisplay: React.FC<ParaphraseResultsDisplayProps> = ({ 
    resultItems, 
    onDetectAIContent, 
    onCheckPlagiarism, 
    overallStatusMessage 
}) => {

  if (resultItems.length === 0 && !overallStatusMessage) {
    return null; 
  }
  
  if (overallStatusMessage && resultItems.length === 0) {
      return (
         <div className="mt-6 p-6 bg-slate-800 rounded-lg shadow-xl text-center">
            <p className="text-slate-400">{overallStatusMessage}</p>
         </div>
      );
  }

  const renderAIDetectionResult = (item: ParaphraseResultItem) => {
    if (!item.aiDetectionResult) return <p className="text-xs text-slate-500 italic">AI detection data not available.</p>;
    const { isAiGenerated, confidenceScore, reasoning } = item.aiDetectionResult;
    const confidencePercent = (confidenceScore * 100).toFixed(0);
    return (
      <div className="text-sm space-y-2">
        <p className={`font-semibold ${isAiGenerated ? 'text-orange-400' : 'text-green-400'}`}>
          Assessment: {isAiGenerated ? 'Likely AI-Generated' : 'Likely Human-Written'}
        </p>
        <div className="flex items-center">
          <span className="text-slate-300 mr-2">Confidence:</span>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className={`${isAiGenerated ? 'bg-orange-500' : 'bg-green-500'} h-2.5 rounded-full`} 
              style={{ width: `${confidencePercent}%` }}
              aria-valuenow={parseFloat(confidencePercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label={`Confidence ${confidencePercent}%`}
            ></div>
          </div>
          <span className="text-slate-300 ml-2 text-xs">{confidencePercent}%</span>
        </div>
        {reasoning && (
          <div>
            <h6 className="text-xs text-slate-400 font-medium mb-0.5">Reasoning:</h6>
            <p className="text-slate-300 text-xs italic bg-slate-700/50 p-2 rounded-md">"{reasoning}"</p>
          </div>
        )}
      </div>
    );
  };

  const renderPlagiarismResult = (item: ParaphraseResultItem) => {
    if (!item.plagiarismDetectionResult) return <p className="text-xs text-slate-500 italic">Plagiarism data not available.</p>;
    const { overallPlagiarismScore, matches } = item.plagiarismDetectionResult;
    const plagiarismPercent = (overallPlagiarismScore * 100).toFixed(0);
    
    let scoreColor = 'text-green-400';
    if (overallPlagiarismScore > 0.3 && overallPlagiarismScore <= 0.7) scoreColor = 'text-yellow-400';
    else if (overallPlagiarismScore > 0.7) scoreColor = 'text-red-500';

    return (
      <div className="text-sm space-y-3">
        <div className="flex items-center">
          <span className="text-slate-300 mr-2">Overall Similarity:</span>
           <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className={`${scoreColor.replace('text-', 'bg-')} h-2.5 rounded-full`} 
              style={{ width: `${plagiarismPercent}%`}}
              aria-valuenow={parseFloat(plagiarismPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label={`Plagiarism score ${plagiarismPercent}%`}
            ></div>
          </div>
          <span className={`${scoreColor} ml-2 font-semibold text-xs`}>{plagiarismPercent}%</span>
        </div>

        {matches && matches.length > 0 ? (
          <div>
            <h6 className="text-xs text-slate-400 font-medium mb-1">Potential Matches:</h6>
            <ul className="space-y-2.5">
              {matches.map((match: PlagiarismMatch, index: number) => (
                <li key={index} className="bg-slate-700/50 p-2.5 rounded-md text-xs">
                  <p className="text-slate-300 italic mb-1">"{match.textSegment}"</p>
                  <div className="flex items-center justify-between">
                    <a href={match.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline truncate flex items-center">
                      <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0"/> 
                      <span className="truncate">{match.sourceTitle || match.sourceUrl}</span>
                    </a>
                    <span className="text-rose-400 ml-2 flex-shrink-0">{(match.similarity * 100).toFixed(0)}% similar</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-slate-400 italic text-xs">No significant direct matches found.</p>
        )}
        {item.plagiarismGroundingSources && item.plagiarismGroundingSources.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-700/50">
                <h6 className="text-xxs font-semibold text-slate-500 mb-0.5">Grounding URLs (used for this plagiarism check):</h6>
                <ul className="list-none space-y-0.5">
                {item.plagiarismGroundingSources.map((source: WebSource, srcIdx: number) => (
                    <li key={`${item.id}-plag-grounding-${srcIdx}`} className="text-xxs">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-400 hover:underline flex items-center group">
                        <LinkIcon className="w-2 h-2 mr-1 flex-shrink-0" />
                        <span className="truncate group-hover:whitespace-normal">{source.title || source.uri}</span>
                    </a>
                    </li>
                ))}
                </ul>
            </div>
        )}
      </div>
    );
  };

  const ActionButton: React.FC<{onClick: () => void, isLoading: boolean, children: React.ReactNode, title: string}> = ({ onClick, isLoading, children, title }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        title={title}
        className="text-xs text-sky-400 hover:text-sky-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
        {isLoading ? <LoadingSpinner size="sm" color="text-sky-400"/> : <ArrowPathIcon className="w-3.5 h-3.5 mr-1"/>}
        {children}
    </button>
  );


  return (
    <div className="mt-8">
      {overallStatusMessage && (
        <p className="text-center text-slate-400 mb-6 italic">{overallStatusMessage}</p>
      )}
      <div className="space-y-10">
        {resultItems.map((item, index) => (
          <div key={item.id} className="p-4 md:p-6 bg-slate-800/80 rounded-xl shadow-2xl border border-slate-700/70">
            {/* Text Content Header */}
            <div className="mb-4 pb-4 border-b border-slate-700">
              <h3 className={`text-xl font-semibold ${item.isOriginal ? 'text-sky-300' : 'text-emerald-300'}`}>
                {item.isOriginal ? 'Original Text' : `Paraphrase Suggestion ${index + 1}`} 
              </h3>
              <p className="text-slate-200 mt-1.5 leading-relaxed" aria-label={`Text content: ${item.text}`}>
                {item.text}
              </p>
            </div>
            
            {/* Analysis Sections Wrapper */}
            <div className="space-y-6">

              {/* AI Content Detection Section */}
              <section aria-labelledby={`ai-detection-title-${item.id}`} >
                <div className="flex justify-between items-center mb-2">
                    <h4 id={`ai-detection-title-${item.id}`} className="text-md font-medium text-cyan-400 flex items-center">
                        <AIIcon className="w-4.5 h-4.5 mr-2"/>
                        AI Content Analysis
                    </h4>
                    {(item.aiDetectionStatus === 'idle' || item.aiDetectionStatus === 'error') && (
                         <ActionButton onClick={() => onDetectAIContent(item.id, item.text)} isLoading={false} title="Re-analyze AI content">
                            Re-analyze
                         </ActionButton>
                    )}
                </div>
                {item.aiDetectionStatus === 'loading' && (
                  <div className="py-3 flex items-center text-slate-400">
                    <LoadingSpinner size="sm" /><span className="ml-2 text-sm">Analyzing AI content...</span>
                  </div>
                )}
                {item.aiDetectionStatus === 'error' && (
                   <div className="p-2.5 bg-red-800/30 text-red-300 text-xs rounded-md flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"/>
                    <span>Error: {item.aiDetectionErrorMessage || 'Could not analyze AI content.'}</span>
                  </div>
                )}
                {item.aiDetectionStatus === 'success' && item.aiDetectionResult && renderAIDetectionResult(item)}
              </section>

              {/* Plagiarism Check Section */}
              <section aria-labelledby={`plagiarism-title-${item.id}`} className="pt-4 border-t border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <h4 id={`plagiarism-title-${item.id}`} className="text-md font-medium text-lime-400 flex items-center">
                        <ShieldCheckIcon className="w-4.5 h-4.5 mr-2"/>
                        Plagiarism Check
                    </h4>
                    {(item.plagiarismDetectionStatus === 'idle' || item.plagiarismDetectionStatus === 'error') && (
                         <ActionButton onClick={() => onCheckPlagiarism(item.id, item.text)} isLoading={false} title="Re-check for plagiarism">
                            Re-check
                         </ActionButton>
                    )}
                </div>
                {item.plagiarismDetectionStatus === 'loading' && (
                  <div className="py-3 flex items-center text-slate-400">
                    <LoadingSpinner size="sm" /><span className="ml-2 text-sm">Checking for plagiarism...</span>
                  </div>
                )}
                {item.plagiarismDetectionStatus === 'error' && (
                  <div className="p-2.5 bg-red-800/30 text-red-300 text-xs rounded-md flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"/>
                    <span>Error: {item.plagiarismErrorMessage || 'Could not check for plagiarism.'}</span>
                  </div>
                )}
                {item.plagiarismDetectionStatus === 'success' && item.plagiarismDetectionResult && renderPlagiarismResult(item)}
              </section>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;