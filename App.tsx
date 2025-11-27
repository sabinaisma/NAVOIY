
import React, { useState } from 'react';
import { generateStoryText, FileData } from './services/geminiService';
import { Story, StoryState } from './types';
import { StoryInput } from './components/StoryInput';
import { BookReader } from './components/BookReader';

const App: React.FC = () => {
  const [state, setState] = useState<StoryState>({
    status: 'idle',
    story: null,
  });

  const handleGenerate = async (topic: string, file?: FileData) => {
    if (!file) {
        setState({ 
            status: 'error', 
            story: null, 
            error: "A source file is required. Please upload an image or text file to guide the story." 
        });
        return;
    }

    setState({ status: 'generating_text', story: null });
    
    try {
      // file is now guaranteed to be present
      const story = await generateStoryText(topic, file);
      setState({
        status: 'reading',
        story: story,
      });
    } catch (error) {
      console.error(error);
      setState({
        status: 'error',
        story: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred."
      });
    }
  };

  const handleReset = () => {
    setState({ status: 'idle', story: null });
  };

  // Render Logic
  if (state.status === 'reading' && state.story) {
    return <BookReader story={state.story} onReset={handleReset} />;
  }

  if (state.status === 'error') {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! The quill broke.</h2>
             <p className="text-gray-600 mb-6">{state.error}</p>
             <button 
               onClick={handleReset}
               className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
             >
               Try Again
             </button>
          </div>
       </div>
     );
  }

  return (
    <StoryInput 
      onGenerate={handleGenerate} 
      isLoading={state.status === 'generating_text'} 
    />
  );
};

export default App;
