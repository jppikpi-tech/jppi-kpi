export interface CorrectionItem {
  type: 'EJAAN' | 'APA7' | 'DATA' | 'LAIN-LAIN';
  originalText: string;
  suggestion: string;
  explanation: string;
  pageReference?: number;
}

export interface AnalysisResult {
  overallGrade: string;
  criticalComment: string; // The "Red Comment"
  corrections: CorrectionItem[];
  correctedFullText: string; // The full corrected script
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
