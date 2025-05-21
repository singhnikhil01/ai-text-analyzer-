
import React from 'react';
// Using a more generic "magic" or "sparkle" icon might fit the AI theme
// import { SparklesIcon } from '@heroicons/react/24/outline'; // Removed: This icon was imported but not used. DefaultSparklesIcon is used instead.

// A simple SVG SparklesIcon if heroicons are not available:
const DefaultSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
  </svg>
);


interface TextInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholderText?: string;
  buttonText?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  inputText,
  onInputChange,
  onSubmit,
  isLoading,
  placeholderText = "Enter text to paraphrase and find sources for...",
  buttonText = "Analyze & Discover"
}) => {
  return (
    <div className="mb-10 p-6 bg-slate-800 rounded-xl shadow-2xl">
      <label htmlFor="inputText" className="block text-lg font-medium mb-3 text-sky-300">
        Your Text
      </label>
      <textarea
        id="inputText"
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholderText}
        rows={6} 
        className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-150 text-slate-100 placeholder-slate-400 resize-y text-base"
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !inputText.trim()}
        className="mt-6 w-full flex items-center justify-center px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 text-base"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <DefaultSparklesIcon className="mr-2 h-5 w-5" /> 
            {buttonText}
          </>
        )}
      </button>
    </div>
  );
};

export default TextInput;
