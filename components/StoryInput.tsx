
import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Sparkles, Wand2, Paperclip, X, FileText, Upload } from 'lucide-react';
import { FileData } from '../services/geminiService';

interface StoryInputProps {
  onGenerate: (topic: string, file?: FileData) => void;
  isLoading: boolean;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<FileData | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Content = base64String.split(',')[1];
        setFileData({
          mimeType: file.type,
          data: base64Content
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileData(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && fileData) {
      onGenerate(topic, fileData);
    }
  };

  const suggestions = [
    "A lonely robot finding a flower on Mars",
    "A cat who becomes the mayor of a small town",
    "A young wizard who is terrible at magic but great at cooking",
    "A deep sea diver finding a glowing city"
  ];

  const hasFile = !!selectedFile;
  const isReady = topic.trim().length > 0 && hasFile;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full z-10 text-center space-y-8">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
            <Wand2 className="w-8 h-8 text-magic mr-2" />
            <span className="font-serif font-bold text-xl text-ink">DreamWeaver</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-bold text-ink leading-tight">
          What story shall we <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">tell today?</span>
        </h1>
        
        <p className="text-xl text-gray-500 font-serif italic max-w-lg mx-auto">
          Enter a topic and <span className="text-magic font-bold not-italic">upload a context file</span> (Required) to guide the world building.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto relative flex flex-col gap-4">
          <div className="relative group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe your story idea..."
              className="w-full px-8 py-6 text-lg rounded-full border-2 border-gray-100 shadow-xl focus:border-magic focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-300 text-ink bg-white/80 backdrop-blur-sm pr-36"
              disabled={isLoading}
            />
            
            <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-full transition-all duration-300 ${!hasFile ? "bg-purple-100 text-magic animate-pulse" : "text-gray-400 hover:text-magic hover:bg-purple-50"}`}
                title="Upload context file (Required)"
                disabled={isLoading}
              >
                 {hasFile ? <Paperclip className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf,text/plain"
              />
              
              <Button 
                  type="submit" 
                  isLoading={isLoading} 
                  disabled={!isReady}
                  title={!hasFile ? "Please upload a file to continue" : "Create Story"}
                  className={`h-full rounded-full !px-6 transition-all ${!isReady ? "opacity-50 grayscale" : "opacity-100"}`}
              >
                  {!isLoading && <Sparkles className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {!hasFile && topic.length > 5 && (
              <div className="text-sm text-magic font-bold animate-fade-in bg-purple-50 py-1 px-3 rounded-full inline-block mx-auto">
                  Please upload a reference file to proceed
              </div>
          )}

          {selectedFile && (
            <div className="flex items-center justify-between bg-white border border-purple-100 p-3 rounded-lg shadow-sm w-full mx-auto max-w-lg animate-fade-in">
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-purple-100 p-2 rounded-md">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">{selectedFile.name}</span>
               </div>
               <button 
                type="button" 
                onClick={clearFile}
                className="text-gray-400 hover:text-red-500 p-1"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          )}
        </form>

        <div className="pt-4">
          <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-bold text-xs">Or try one of these</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setTopic(s)}
                disabled={isLoading}
                className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm text-gray-600 hover:border-magic hover:text-magic hover:bg-purple-50 transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
