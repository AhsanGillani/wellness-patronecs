export type Answer = {
  id: number;
  author: string;
  role?: string;
  content: string;
  createdAt: string;
  upvotes: number;
};

export type Question = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  views: number;
  answersCount: number;
  createdAt: string;
  author: string;
  answers: Answer[];
};

export const questions: Question[] = [
  {
    id: 1,
    title: "How to improve sleep quality while working night shifts?",
    body:
      "I switched to a rotating schedule and my sleep has suffered. Any routines, supplements, or tools that can help stabilize sleep?",
    tags: ["Sleep", "Routine", "Habits"],
    views: 3200,
    answersCount: 12,
    createdAt: "2h ago",
    author: "Alex",
    answers: [
      {
        id: 11,
        author: "Dr. Priya Nair",
        role: "Psychologist",
        content:
          "Try a consistent wind-down routine: dim lights, avoid screens 60 minutes before bed, and consider a short mindfulness session. On shift days, use a sleep mask and earplugs for daytime sleep.",
        createdAt: "1h ago",
        upvotes: 18,
      },
      {
        id: 12,
        author: "Sam",
        role: "Community member",
        content:
          "Blue light blocking glasses helped me on late shifts. Also, 0.5mg melatonin 2 hours before your target sleep time can help (check with your doctor).",
        createdAt: "45m ago",
        upvotes: 9,
      },
    ],
  },
  {
    id: 2,
    title: "Beginner strength routine for someone with knee pain?",
    body:
      "Looking for a low-impact plan to build strength without aggravating knee pain. Any recommended movements or progressions?",
    tags: ["Fitness", "Rehab", "Strength"],
    views: 1500,
    answersCount: 6,
    createdAt: "6h ago",
    author: "Jordan",
    answers: [
      {
        id: 21,
        author: "Dr. Jane Cooper",
        role: "Cardiologist",
        content:
          "Focus on closed-chain movements within a comfortable range: wall sits, partial squats to a chair, and glute bridges. Add isometric holds and progress gradually.",
        createdAt: "4h ago",
        upvotes: 7,
      },
    ],
  },
];


