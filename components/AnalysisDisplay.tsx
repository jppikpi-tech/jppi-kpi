import React from 'react';
import { AnalysisResult, CorrectionItem } from '../types';
import { CheckCircle, AlertTriangle, XCircle, FileText, Download } from 'lucide-react';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([result.correctedFullText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Tesis_Dibetulkan.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'EJAAN': return <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold">EJAAN</span>;
      case 'APA7': return <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded text-xs font-bold">APA 7</span>;
      case 'DATA': return <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold">DATA</span>;
      default: return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold">LAIN</span>;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* 1. Header: Score & Critical Comment (RED) */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-red-600">
        <div className="p-8 bg-red-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-2xl font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              KRITIKAN UTAMA
            </h2>
            <div className="mt-2 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border border-red-200">
               <span className="text-gray-600 text-sm font-semibold uppercase mr-2">Gred Anggaran:</span>
               <span className="text-3xl font-bold text-gray-900">{result.overallGrade}</span>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg border border-red-200 shadow-inner">
            <p className="text-red-700 font-medium text-lg leading-relaxed italic">
              "{result.criticalComment}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. List of Errors */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Senarai Kesalahan Dikesan
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{result.corrections.length} Isu</span>
          </div>
          <div className="overflow-y-auto p-4 space-y-4 flex-1 custom-scrollbar bg-gray-50/50">
            {result.corrections.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  {getIcon(item.type)}
                  {item.pageReference && <span className="text-xs text-gray-400">Ms: {item.pageReference}</span>}
                </div>
                <div className="mb-2">
                  <p className="text-sm text-red-500 line-through mb-1 font-mono bg-red-50 p-1 rounded inline-block">
                    {item.originalText}
                  </p>
                  <p className="text-sm text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {item.suggestion}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-2 border-t pt-2">
                  <span className="font-semibold text-gray-700">Sebab:</span> {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Corrected Script & Download */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b bg-blue-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Skrip Dibetulkan (Pratonton)
            </h3>
            <button 
              onClick={downloadTxtFile}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Muat Turun
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar font-serif text-gray-800 leading-loose">
            <div className="whitespace-pre-wrap">
              {result.correctedFullText}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisDisplay;
