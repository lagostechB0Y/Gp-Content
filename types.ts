export type Tab = 'dashboard' | 'importer' | 'scanner' | 'spin-room';

export interface ImportData {
  title: string;
  url: string;
  content?: string;
  categories?: string[];
}

export interface ApiResponseSuccess {
  success: true;
  data: {
    ID: number;
  };
}

export interface ApiResponseError {
  success: false;
  data: {
    message: string;
  };
}

export type ApiResponse = ApiResponseSuccess | ApiResponseError;

export enum AlertType {
    Success = 'success',
    Error = 'error',
}

// Types for the new News Scanner feature
export interface ScannedArticle {
    url: string;
    headline: string;
    source: string;
    category: string;
    fingerprint: string; // A short summary for deduplication
}

export interface ScanResults {
    timestamp: number;
    articles: ScannedArticle[];
}

// Types for the Social Media Spin Room
export interface SocialPack {
    twitter: string[];
    whatsapp: string;
    instagram: string;
    viral_hook: string;
}