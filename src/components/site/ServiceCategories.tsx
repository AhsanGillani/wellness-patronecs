import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Apple, Brain, Dumbbell, HeartPulse, ChefHat } from "lucide-react";

const items = [
  { title: "Doctors", Icon: Stethoscope, desc: "General practitioners & specialists." },
  { title: "Nutritionists", Icon: Apple, desc: "Personalized meal plans & guidance." },
  { title: "Psychologists", Icon: Brain, desc: "Therapy and mental wellness support." },
  { title: "Fitness Trainers", Icon: Dumbbell, desc: "Workouts tailored to your goals." },
  { title: "Cardiologists", Icon: HeartPulse, desc: "Heart health and prevention." },
  { title: "Dietitians", Icon: ChefHat, desc: "Clinical nutrition expertise." },
];

const ServiceCategories = () => {
  return (
    <section id="services" className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold">Services for every need</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Explore our network of professionals across medical, nutrition, mental health, and fitness.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ title, Icon, desc }) => (
          <Card key={title} className="transition-all hover-scale shadow-soft hover:shadow-elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-md p-2 bg-secondary">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ServiceCategories;
