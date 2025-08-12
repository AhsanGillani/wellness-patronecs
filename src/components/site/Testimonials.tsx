import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";


const testimonials = [
  {
    name: "Dr. Emily Carter",
    role: "General Practitioner",
    avatar: avatar1,
    quote:
      "This platform makes it effortless for patients to find the right care. The booking experience is seamless and friendly.",
    rating: 5,
  },
  {
    name: "Michael Lee",
    role: "Nutritionist",
    avatar: avatar2,
    quote:
      "I love how easy it is to share plans and tips. The community Q&A helps people get practical answers quickly.",
    rating: 5,
  },
  {
    name: "Ana Velasquez",
    role: "Psychologist",
    avatar: avatar3,
    quote:
      "Warm, trustworthy, and user-friendly. It encourages people to seek support and look after their mental health.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section aria-labelledby="testimonials" className="container mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h2 id="testimonials" className="text-3xl md:text-4xl font-semibold">What people say</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Stories from professionals and patients who use our platform.
        </p>
      </div>

      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {testimonials.map((t) => (
              <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full shadow-soft hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={t.avatar} alt={`${t.name} photo`} />
                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-none">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed">“{t.quote}”</p>
                    <div className="mt-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={i < t.rating ? "fill-current" : "opacity-30"} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
