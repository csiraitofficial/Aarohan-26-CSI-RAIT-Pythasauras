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
  },
];

export function getTopic(category: TopicCategory, id: string) {
  if (category === "job-interview") return jobInterviewTopics.find((t) => t.id === id) ?? null;
  return skillDevelopmentTopics.find((t) => t.id === id) ?? null;
}
