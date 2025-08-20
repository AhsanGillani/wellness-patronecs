import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";

export type BlogPost = {
  id: number;
  title: string;
  category: string;
  readTime: string;
  image: string;
  publishedAt: string;
  author: string;
  content: string[];
};

export const posts: BlogPost[] = [
  {
    id: 1,
    title: "5 Morning Habits for Better Energy",
    category: "Wellness",
    readTime: "6 min read",
    image: article1,
    publishedAt: "Mar 10, 2025",
    author: "Editorial Team",
    content: [
      "Starting your day with intention can have a compounding effect on energy and focus.",
      "Hydration, sunlight exposure, and a short movement routine are simple wins.",
      "Try stacking new habits with existing ones so they’re easier to maintain.",
    ],
  },
  {
    id: 2,
    title: "A Beginner’s Guide to Mindful Eating",
    category: "Nutrition",
    readTime: "8 min read",
    image: article2,
    publishedAt: "Mar 18, 2025",
    author: "Editorial Team",
    content: [
      "Mindful eating is about paying attention to hunger, fullness, and satisfaction cues.",
      "Slowing down and removing distractions can improve digestion and awareness.",
      "Begin with one mindful meal a day and notice changes in your experience.",
    ],
  },
  {
    id: 3,
    title: "How to Build a Sustainable Workout Routine",
    category: "Fitness",
    readTime: "7 min read",
    image: article3,
    publishedAt: "Mar 22, 2025",
    author: "Editorial Team",
    content: [
      "Consistency beats intensity. Start small and build gradually.",
      "Aim for a balanced blend of strength, cardio, and mobility across the week.",
      "Track your sessions and celebrate small wins to maintain momentum.",
    ],
  },
];


