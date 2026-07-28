// User Types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "USER" | "ADMIN";
  location?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  interests: string[];
  skills: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  targetRole?: string;
  careerGoal?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Career & Course Types
export interface Career {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  category: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  matchReason?: string;
  icon?: string;
  color?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in hours
  price?: number;
  provider?: string;
  matchScore?: number;
  skills?: string[];
  createdAt: Date;
}

export interface CareerProgress {
  userId: string;
  stages: ProgressStage[];
  overallProgress: number;
  lastUpdated: Date;
}

export interface ProgressStage {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending";
  order: number;
}

// AI & Chat Types
export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface AIRecommendation {
  userId: string;
  careerSuggestions: Career[];
  courseSuggestions: Course[];
  insights: string;
  generatedAt: Date;
}

// Auth Types
export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
