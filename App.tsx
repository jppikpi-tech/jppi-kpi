import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Loader2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AnalysisDisplay from './components/AnalysisDisplay';
import { analyzeThesis } from './services/geminiService';
import { AppState, AnalysisResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
      const data = await analyzeThesis(file);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Berlaku ralat semasa menganalisis tesis.");
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResult(null);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={resetApp}>
              <BookOpen className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">TesisAI</h1>
                <p className="text-xs text-slate-400 font-medium">Penilai Tesis Pintar</p>
              </div>
            </div>
            <div>
               {appState === AppState.SUCCESS && (
                 <button onClick={resetApp} className="text-sm text-slate-300 hover:text-white transition-colors">
                   Semak Tesis Baru
                 </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {appState === AppState.IDLE && (
          <div className="text-center animate-fade-in py-10">
            <h2 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-6">
              Sempurnakan Tesis Anda <br/>
              <span className="text-blue-600">Dengan Kuasa AI</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              Muat naik fail PDF tesis anda. Kami akan menyemak ejaan Bahasa Melayu, format APA 7, 
              dan kesahihan interpretasi data anda dalam beberapa saat.
            </p>
            <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Semakan Bahasa</h3>
                <p className="text-gray-500 text-sm">Mengesan kesalahan ejaan dan tatabahasa Bahasa Melayu dengan tepat.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                   <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Format APA 7</h3>
                <p className="text-gray-500 text-sm">Memastikan sitasi dan bibliografi mematuhi piawaian akademik terkini.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                   <span className="text-red-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Logik Data</h3>
                <p className="text-gray-500 text-sm">Menilai penerangan grafik dan jadual untuk memastikan interpretasi yang logik.</p>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Sedang Menganalisis Tesis...</h3>
            <p className="text-gray-500 max-w-md">
              AI sedang membaca setiap baris, menyemak format APA, dan menilai data anda. Sila tunggu sebentar.
            </p>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
             <div className="bg-red-50 p-6 rounded-full mb-6">
               <span className="text-4xl">⚠️</span>
             </div>
             <h3 className="text-xl font-bold text-red-700 mb-2">Ralat Diproses</h3>
             <p className="text-gray-600 mb-6">{errorMsg}</p>
             <button 
               onClick={resetApp}
               className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
             >
               Cuba Lagi
             </button>
          </div>
        )}

        {appState === AppState.SUCCESS && result && (
          <AnalysisDisplay result={result} />
        )}

      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
