export type Professional = {
  id: number;
  name: string;
  title: string;
  years: number;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  tags: string[];
  bio?: string;
  about?: string;
  services?: Array<{
    id: number;
    name: string;
    duration: string;
    price: string;
    description: string;
  }>;
};

import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

export const professionals: Professional[] = [
  {
    id: 1,
    name: "Dr. Jane Cooper",
    title: "Cardiologist",
    years: 12,
    rating: 4.9,
    reviews: 214,
    price: "$120 / session",
    image: avatar1,
    tags: ["Heart Health", "Hypertension", "Lifestyle"],
    bio: "Board-certified cardiologist helping patients improve cardiovascular health.",
    about:
      "Dr. Cooper specializes in preventive cardiology, hypertension, and lifestyle interventions. She believes in personalized care plans that blend evidence-based medicine with sustainable habit change.",
    services: [
      { id: 101, name: "Initial cardiology consult", duration: "30 min", price: "$120", description: "Review medical history, symptoms, and baseline vitals." },
      { id: 102, name: "Follow-up visit", duration: "45 min", price: "$140", description: "Progress review and plan adjustment." },
      { id: 103, name: "Lifestyle plan consult", duration: "45 min", price: "$150", description: "Personalized nutrition and movement guidance for heart health." },
      { id: 104, name: "Telehealth check-in", duration: "30 min", price: "$110", description: "Remote video check-in to monitor metrics and symptoms." },
    ],
  },
  {
    id: 2,
    name: "Alex Morgan",
    title: "Nutritionist",
    years: 8,
    rating: 4.8,
    reviews: 167,
    price: "$80 / session",
    image: avatar2,
    tags: ["Weight Loss", "Diet Plans", "Diabetes"],
    bio: "Registered nutritionist focusing on metabolic health and performance.",
    about:
      "Alex creates practical meal plans tailored to individual goals, with a focus on metabolic health, blood sugar control, and performance nutrition.",
    services: [
      { id: 201, name: "Nutrition assessment", duration: "45 min", price: "$80", description: "Dietary recall, goal setting, and plan outline." },
      { id: 202, name: "Meal plan setup", duration: "60 min", price: "$120", description: "Custom weekly plan with grocery list and portions." },
      { id: 203, name: "Follow-up session", duration: "30 min", price: "$60", description: "Progress review and adjustments." },
    ],
  },
  {
    id: 3,
    name: "Dr. Priya Nair",
    title: "Psychologist",
    years: 10,
    rating: 4.9,
    reviews: 301,
    price: "$110 / session",
    image: avatar3,
    tags: ["Anxiety", "Relationships", "Stress"],
    bio: "Clinical psychologist with a focus on anxiety and relationship health.",
    about:
      "Dr. Nair uses CBT and mindfulness-based approaches to help clients build long-term emotional resilience and healthier relationships.",
    services: [
      { id: 301, name: "Initial therapy session", duration: "50 min", price: "$110", description: "Assessment, goals, and therapy plan." },
      { id: 302, name: "CBT session", duration: "45 min", price: "$110", description: "Cognitive behavioral therapy focused session." },
      { id: 303, name: "Telehealth session", duration: "45 min", price: "$100", description: "Online therapy session via secure video." },
    ],
  },
];

 
