import {
  User,
  UserProfile,
  Career,
  Course,
  ChatMessage,
  CareerProgress,
  ProgressStage,
} from "./types";

// In-memory database (in production, use a real database like PostgreSQL)
class Database {
  private users: Map<string, User> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private careers: Map<string, Career> = new Map();
  private courses: Map<string, Course> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private careerProgress: Map<string, CareerProgress> = new Map();

  // User Methods
  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // User Profile Methods
  async createOrUpdateProfile(profile: UserProfile): Promise<UserProfile> {
    this.userProfiles.set(profile.userId, profile);
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  // Career Methods
  async createCareer(career: Career): Promise<Career> {
    this.careers.set(career.id, career);
    return career;
  }

  async getCareers(): Promise<Career[]> {
    return Array.from(this.careers.values());
  }

  async getCareerById(id: string): Promise<Career | null> {
    return this.careers.get(id) || null;
  }

  // Course Methods
  async createCourse(course: Course): Promise<Course> {
    this.courses.set(course.id, course);
    return course;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourseById(id: string): Promise<Course | null> {
    return this.courses.get(id) || null;
  }

  // Chat Message Methods
  async addMessage(message: ChatMessage): Promise<ChatMessage> {
    if (!this.messages.has(message.userId)) {
      this.messages.set(message.userId, []);
    }
    this.messages.get(message.userId)!.push(message);
    return message;
  }

  async getMessages(userId: string): Promise<ChatMessage[]> {
    return this.messages.get(userId) || [];
  }

  async clearMessages(userId: string): Promise<void> {
    this.messages.delete(userId);
  }

  // Career Progress Methods
  async getOrCreateProgress(userId: string): Promise<CareerProgress> {
    let progress = this.careerProgress.get(userId);
    if (!progress) {
      const stages: ProgressStage[] = [
        {
          id: "1",
          title: "Self Discovery",
          description: "Completed",
          status: "completed",
          order: 1,
        },
        {
          id: "2",
          title: "Interests & Strengths",
          description: "Completed",
          status: "completed",
          order: 2,
        },
        {
          id: "3",
          title: "Skill Gap Analysis",
          description: "In Progress",
          status: "in_progress",
          order: 3,
        },
        {
          id: "4",
          title: "Career Roadmap",
          description: "Pending",
          status: "pending",
          order: 4,
        },
      ];

      progress = {
        userId,
        stages,
        overallProgress: 68,
        lastUpdated: new Date(),
      };
      this.careerProgress.set(userId, progress);
    }
    return progress;
  }

  async updateProgress(
    userId: string,
    progress: CareerProgress
  ): Promise<CareerProgress> {
    this.careerProgress.set(userId, progress);
    return progress;
  }

  // Seed initial data
  seedInitialData(): void {
    // Seed careers
    const sampleCareers: Career[] = [
      {
        id: "c1",
        title: "Data Analyst",
        description:
          "High demand in Kenya. Analyze data to help business decisions.",
        matchPercentage: 92,
        category: "Technology",
        salary: { min: 120000, max: 200000, currency: "KSH" },
        matchReason: "Your analytical skills and interest in data align perfectly",
        color: "from-purple-400 to-purple-600",
        createdAt: new Date(),
      },
      {
        id: "c2",
        title: "Software Developer",
        description:
          "Build applications and systems. Highly sought after profession.",
        matchPercentage: 87,
        category: "Technology",
        salary: { min: 150000, max: 250000, currency: "KSH" },
        matchReason: "Your programming skills match the requirements",
        color: "from-blue-400 to-blue-600",
        createdAt: new Date(),
      },
      {
        id: "c3",
        title: "Clinical Officer",
        description:
          "Healthcare profession with great growth opportunities in Kenya.",
        matchPercentage: 81,
        category: "Healthcare",
        salary: { min: 70000, max: 120000, currency: "KSH" },
        matchReason: "Your interest in helping others is a great fit",
        color: "from-orange-400 to-orange-600",
        createdAt: new Date(),
      },
    ];

    sampleCareers.forEach((career) => {
      this.careers.set(career.id, career);
    });

    // Seed courses
    const sampleCourses: Course[] = [
      {
        id: "cs1",
        title: "Python for Data Science",
        description:
          "Learn Python programming for data analysis and visualization.",
        category: "Data Science",
        level: "beginner",
        duration: 40,
        provider: "Coursera",
        matchScore: 95,
        skills: ["Python", "Data Analysis", "Pandas"],
        createdAt: new Date(),
      },
      {
        id: "cs2",
        title: "React Advanced Patterns",
        description:
          "Master advanced React patterns and hooks for scalable applications.",
        category: "Web Development",
        level: "advanced",
        duration: 50,
        provider: "Udemy",
        matchScore: 88,
        skills: ["React", "JavaScript", "Web Development"],
        createdAt: new Date(),
      },
      {
        id: "cs3",
        title: "SQL Database Design",
        description: "Learn to design and optimize databases for applications.",
        category: "Database",
        level: "intermediate",
        duration: 35,
        provider: "LinkedIn Learning",
        matchScore: 92,
        skills: ["SQL", "Database Design", "Optimization"],
        createdAt: new Date(),
      },
      {
        id: "cs4",
        title: "Healthcare Fundamentals",
        description: "Essential knowledge for healthcare professionals.",
        category: "Healthcare",
        level: "beginner",
        duration: 60,
        provider: "WHO Academy",
        matchScore: 85,
        skills: ["Patient Care", "Medical Basics", "Healthcare"],
        createdAt: new Date(),
      },
    ];

    sampleCourses.forEach((course) => {
      this.courses.set(course.id, course);
    });
  }
}

// Export singleton instance
export const db = new Database();

// Initialize with sample data
db.seedInitialData();
