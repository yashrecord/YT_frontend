import { auth, db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { saveThumbnail } from './firebase-utils';
import type { ThumbnailData } from './firebase';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:7860';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 30000; // 30 seconds
const RATE_LIMIT_REQUESTS = 2;

interface RateLimitTracker {
  timestamps: number[];
}

const rateLimiters: Record<string, RateLimitTracker> = {
  thumbnail: { timestamps: [] },
  style: { timestamps: [] }
};

export interface VideoDetails {
  summary: string;
  title: string;
  thumbnailUrl: string;
}

export interface StyleGeneration {
  style: string;
}

export interface StyleGenerationRequest {
  summary: string;
  includeHuman: boolean;
  includeText: boolean;
}

export interface ThumbnailGenerationRequest {
  videoId: string;
  style: string;
  customText?: string;
}

export interface ApiError {
  error: string;
}

export interface ThumbnailResponse {
  url: string;
  filename: string;
}

function checkRateLimit(endpoint: 'thumbnail' | 'style'): boolean {
  const now = Date.now();
  const tracker = rateLimiters[endpoint];
  
  // Remove timestamps older than the window
  tracker.timestamps = tracker.timestamps.filter(
    time => now - time < RATE_LIMIT_WINDOW
  );

  if (tracker.timestamps.length >= RATE_LIMIT_REQUESTS) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  tracker.timestamps.push(now);
  return true;
}

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json() as ApiError;
      throw new Error(errorData.error || 'An error occurred');
    }
    
    switch (response.status) {
      case 400:
        throw new Error('Bad Request: Invalid parameters provided');
      case 404:
        throw new Error('Resource not found');
      case 413:
        throw new Error('Payload too large: File size exceeded 16MB');
      case 429:
        throw new Error('Rate limit exceeded. Please try again later.');
      case 500:
        throw new Error('Internal server error. Please try again later.');
      default:
        throw new Error('An unexpected error occurred');
    }
  }

  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format. Expected JSON.');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Failed to parse server response. Please try again later.');
  }
};

export const fetchVideoDetails = async (videoId: string): Promise<VideoDetails> => {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
      video_id: videoId
    }),
  });
  
  return handleApiResponse<VideoDetails>(response);
};

export const generateStyle = async (summary: string, includeHuman = true, includeText = true): Promise<StyleGeneration> => {
  checkRateLimit('style');
  
  const response = await fetch(`${API_BASE_URL}/generate_style`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary, includeHuman, includeText }),
  });
  
  return handleApiResponse<StyleGeneration>(response);
};

export const downloadThumbnail = async (url: string, filename: string): Promise<void> => {
  if (!url) {
    throw new Error('Invalid thumbnail URL');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image/')) {
      throw new Error('Invalid image response from server');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Received empty image file');
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to download thumbnail');
  }
};

export const generateThumbnail = async (
  videoId: string,
  style: StyleGeneration,
  customText?: string
): Promise<ThumbnailResponse> => {
  checkRateLimit('thumbnail');

  const response = await fetch(`${API_BASE_URL}/generate_thumbnails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoId,
      style: style.style,
      customText
    }),
  });

  const result = await handleApiResponse<{ url: string }>(response);
  
  // Generate a unique filename for the thumbnail
  const filename = videoId === 'custom' 
    ? `custom-thumbnail-${Date.now()}.png`
    : `thumbnail-${videoId}-${Date.now()}.png`;
    
  return {
    url: result.url,
    filename
  };
};

export const storeThumbnailData = async (data: Omit<ThumbnailData, 'createdAt' | 'updatedAt'>) => {
  try {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }
    await saveThumbnail(data);
  } catch (error) {
    console.error('Error storing thumbnail:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to store thumbnail data');
  }
};