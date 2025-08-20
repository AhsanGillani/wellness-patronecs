export type EventItem = {
  id: number;
  title: string;
  type?: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: string;
  description: string;
  details?: string;
  agenda?: string[];
  registrationUrl?: string;
  imageUrl?: string;
  ticketPrice?: number;
};

export const events: EventItem[] = [
  {
    id: 1,
    title: "Mindfulness for Better Sleep",
    date: "Mar 28, 2025",
    time: "6:00 PM – 7:30 PM",
    location: "Online webinar",
    category: "Mental Health",
    description:
      "Learn practical breathing and mindfulness techniques to improve sleep quality and recovery.",
    details:
      "This live session covers the essentials of mindfulness and includes guided exercises you can practice immediately. Suitable for beginners.",
    agenda: [
      "Intro to mindfulness",
      "Breathing techniques",
      "Guided body scan",
      "Q&A",
    ],
  },
  {
    id: 2,
    title: "Heart Health 101",
    date: "Apr 03, 2025",
    time: "5:00 PM – 6:00 PM",
    location: "City Wellness Center",
    category: "Cardiology",
    description:
      "A cardiologist explains risk factors, screenings, and lifestyle habits for a healthier heart.",
    details:
      "Understand key risk factors and how to manage them through diet, movement, and monitoring. Includes a short checklist to take home.",
    agenda: [
      "Risk factors overview",
      "Lifestyle changes",
      "Screenings & metrics",
      "Q&A",
    ],
  },
  {
    id: 3,
    title: "Fueling Performance: Nutrition Basics",
    date: "Apr 11, 2025",
    time: "4:30 PM – 5:30 PM",
    location: "Online webinar",
    category: "Nutrition",
    description:
      "Foundational strategies for meal timing, macros, and hydration for everyday athletes.",
    details:
      "We will walk through pre- and post-workout fueling strategies, hydration, and simple plate-building templates.",
    agenda: [
      "Macro basics",
      "Timing & portions",
      "Hydration",
      "Q&A",
    ],
  },
];


