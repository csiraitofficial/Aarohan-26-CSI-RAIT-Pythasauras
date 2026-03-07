export type Difficulty = "beginner" | "intermediate" | "advanced";

export type TopicCategory = "job-interview" | "skill-development";

export type JobInterviewTopic = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
  skills: string[];
  icon: string;
  color: string;
  videoLectureUrl?: string;
  textualInfoUrl?: string;
};

export type SkillDevelopmentTopic = {
  id: string;
  title: string;
  description: string;
  focusArea: string;
  duration: number;
  benefits: string[];
  icon: string;
  color: string;
  videoLectureUrl?: string;
  textualInfoUrl?: string;
};

export const jobInterviewTopics: JobInterviewTopic[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    description: "Technical interviews, coding challenges, system design, and algorithm questions",
    difficulty: "intermediate",
    duration: 45,
    skills: ["Coding", "System Design", "Algorithms", "Problem Solving"],
    icon: "💻",
    color: "violet",
    videoLectureUrl: "https://www.youtube.com/watch?v=Ln_LP7c23WM",
    textualInfoUrl: "https://www.geeksforgeeks.org/software-engineering/software-engineering-introduction-to-software-engineering/",
  },
  {
    id: "web-developer",
    title: "Web Developer",
    description: "Frontend/backend development, frameworks, APIs, and web technologies",
    difficulty: "intermediate",
    duration: 40,
    skills: ["HTML/CSS", "JavaScript", "React", "Node.js"],
    icon: "🌐",
    color: "blue",
    videoLectureUrl: "https://www.youtube.com/watch?v=HcOc7P5BMi4",
    textualInfoUrl: "https://www.geeksforgeeks.org/web-tech/web-technology/",
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    description: "Design principles, portfolio review, user research, and design thinking",
    difficulty: "beginner",
    duration: 35,
    skills: ["Design Systems", "User Research", "Prototyping", "Visual Design"],
    icon: "🎨",
    color: "pink",
    videoLectureUrl: "https://www.youtube.com/watch?v=n9PAowQbua0",
    textualInfoUrl: "https://www.geeksforgeeks.org/blogs/100-days-of-ui-ux/",
  },
  {
    id: "app-developer",
    title: "App Developer",
    description: "Mobile development, platform-specific features, and app deployment",
    difficulty: "intermediate",
    duration: 40,
    skills: ["React Native", "Flutter", "iOS", "Android"],
    icon: "📱",
    color: "green",
    videoLectureUrl: "https://www.youtube.com/watch?v=-foyVzTOf8o",
    textualInfoUrl: "https://www.geeksforgeeks.org/mobile-computing/what-is-mobile-app-development-process/",
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description: "CI/CD pipelines, cloud infrastructure, monitoring, and automation",
    difficulty: "advanced",
    duration: 50,
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    icon: "⚙️",
    color: "orange",
    videoLectureUrl: "https://www.youtube.com/watch?v=eHVVSQ7sOJ0",
    textualInfoUrl: "https://www.geeksforgeeks.org/devops/devops-tutorial/",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Machine learning, statistical analysis, data visualization, and modeling",
    difficulty: "advanced",
    duration: 45,
    skills: ["Python", "Machine Learning", "Statistics", "Data Visualization"],
    icon: "📊",
    color: "purple",
    videoLectureUrl: "https://www.youtube.com/watch?v=9YSjaKJ6R8I",
    textualInfoUrl: "https://www.geeksforgeeks.org/courses/data-science-live",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Product strategy, user stories, roadmap planning, and stakeholder management",
    difficulty: "intermediate",
    duration: 40,
    skills: ["Strategy", "Analytics", "Communication", "Leadership"],
    icon: "📋",
    color: "indigo",
    videoLectureUrl: "https://www.youtube.com/watch?v=BRlzbDry6Ew",
    textualInfoUrl: "https://www.geeksforgeeks.org/product-management/what-is-product-manager/",
  },
  {
    id: "marketing-specialist",
    title: "Marketing Specialist",
    description: "Digital marketing, campaign strategies, analytics, and brand management",
    difficulty: "beginner",
    duration: 35,
    skills: ["SEO", "Content Marketing", "Analytics", "Social Media"],
    icon: "📈",
    color: "emerald",
    videoLectureUrl: "https://www.youtube.com/watch?v=mrvlmYf_h_U",
    textualInfoUrl: "https://www.geeksforgeeks.org/blogs/what-is-digital-marketing/",
  },
  {
    id: "hr-recruiter",
    title: "HR / Recruiter",
    description: "Screening interviews, candidate evaluation, and behavioral probing with structured notes",
    difficulty: "beginner",
    duration: 30,
    skills: ["Behavioral Questions", "Evaluation", "Communication", "Decision Making"],
    icon: "🧾",
    color: "rose",
    videoLectureUrl: "https://www.youtube.com/watch?v=vXto6SnO4UU",
    textualInfoUrl: "https://www.geeksforgeeks.org/software-engineering/what-is-recruitment-and-selection/",
  },
];

export const skillDevelopmentTopics: SkillDevelopmentTopic[] = [
  {
    id: "behavioral-upskilling",
    title: "Behavioral Upskilling",
    description: "Improve workplace behavior, professional conduct, and interpersonal skills",
    focusArea: "Professional Development",
    duration: 30,
    benefits: ["Better Team Collaboration", "Professional Etiquette", "Conflict Resolution"],
    icon: "🤝",
    color: "blue",
    videoLectureUrl: "https://www.youtube.com/watch?v=K2Y3G8J6qJ8",
    textualInfoUrl: "https://www.geeksforgeeks.org/soft-skills-for-professionals/",
  },
  {
    id: "presentation-skills",
    title: "Presentation Skills",
    description: "Master public speaking, slide design, and audience engagement",
    focusArea: "Communication",
    duration: 35,
    benefits: ["Confident Speaking", "Engaging Delivery", "Visual Storytelling"],
    icon: "🎤",
    color: "purple",
    videoLectureUrl: "https://www.youtube.com/watch?v=HAnw168huqA",
    textualInfoUrl: "https://www.geeksforgeeks.org/presentation-skills/",
  },
  {
    id: "communication-boost",
    title: "Communication Boost",
    description: "Enhance verbal and non-verbal communication for professional settings",
    focusArea: "Communication",
    duration: 30,
    benefits: ["Clear Expression", "Active Listening", "Body Language"],
    icon: "💬",
    color: "green",
    videoLectureUrl: "https://www.youtube.com/watch?v=L7BwXh2qE8U",
    textualInfoUrl: "https://www.geeksforgeeks.org/communication-skills/",
  },
  {
    id: "leadership-skills",
    title: "Leadership Skills",
    description: "Develop leadership qualities, team management, and decision-making abilities",
    focusArea: "Leadership",
    duration: 40,
    benefits: ["Team Motivation", "Strategic Thinking", "Decision Making"],
    icon: "👑",
    color: "amber",
    videoLectureUrl: "https://www.youtube.com/watch?v=RvT4Ea0zJ9c",
    textualInfoUrl: "https://www.geeksforgeeks.org/leadership-skills/",
  },
  {
    id: "negotiation-skills",
    title: "Negotiation Skills",
    description: "Learn effective negotiation techniques for business and career advancement",
    focusArea: "Business Skills",
    duration: 35,
    benefits: ["Win-Win Outcomes", "Persuasion", "Conflict Management"],
    icon: "🤝",
    color: "orange",
    videoLectureUrl: "https://www.youtube.com/watch?v=4q1h5E9Z3kY",
    textualInfoUrl: "https://www.geeksforgeeks.org/negotiation-skills/",
  },
  {
    id: "time-management",
    title: "Time Management",
    description: "Master productivity techniques and efficient work habits",
    focusArea: "Productivity",
    duration: 25,
    benefits: ["Prioritization", "Focus Techniques", "Work-Life Balance"],
    icon: "⏰",
    color: "red",
    videoLectureUrl: "https://www.youtube.com/watch?v=5k6e2kvlYcE",
    textualInfoUrl: "https://www.geeksforgeeks.org/time-management-tips/",
  },
  {
    id: "stress-management",
    title: "Stress Management",
    description: "Develop coping strategies and maintain mental well-being",
    focusArea: "Wellness",
    duration: 30,
    benefits: ["Resilience", "Mindfulness", "Work-Life Balance"],
    icon: "🧘",
    color: "teal",
    videoLectureUrl: "https://www.youtube.com/watch?v=2fM1Lr3jJp4",
    textualInfoUrl: "https://www.geeksforgeeks.org/stress-management/",
  },
  {
    id: "networking-skills",
    title: "Networking Skills",
    description: "Build professional relationships and expand your network",
    focusArea: "Career Development",
    duration: 30,
    benefits: ["Relationship Building", "Professional Connections", "Opportunity Creation"],
    icon: "🌐",
    color: "cyan",
    videoLectureUrl: "https://www.youtube.com/watch?v=4nBdK6N3Fq8",
    textualInfoUrl: "https://www.geeksforgeeks.org/networking-skills/",
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    description: "Sharpen reasoning, assumptions checking, and decision clarity under pressure",
    focusArea: "Problem Solving",
    duration: 35,
    benefits: ["Clear Reasoning", "Better Decisions", "Stronger Arguments"],
    icon: "🧠",
    color: "violet",
    videoLectureUrl: "https://www.youtube.com/watch?v=6OLPL5p0fMg",
    textualInfoUrl: "https://www.geeksforgeeks.org/critical-thinking/",
  },
];

export function getTopic(category: TopicCategory, id: string) {
  if (category === "job-interview") return jobInterviewTopics.find((t) => t.id === id) ?? null;
  return skillDevelopmentTopics.find((t) => t.id === id) ?? null;
}
