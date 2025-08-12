import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const articles = [
  { img: article1, title: "5 Balanced Meal Ideas for Busy Weeks", tag: "Nutrition" },
  { img: article2, title: "A 10-Minute Daily Mindfulness Routine", tag: "Mindfulness" },
  { img: article3, title: "Beginner Strength Plan You Can Stick To", tag: "Fitness" },
];

const ArticlesGrid = () => {
  return (
    <section aria-labelledby="tips-articles" className="container mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h2 id="tips-articles" className="text-3xl md:text-4xl font-semibold">Wellness tips & articles</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Practical advice from trusted professionals to support your daily wellbeing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((a) => (
          <Card key={a.title} className="overflow-hidden shadow-soft hover:shadow-elevated transition-shadow group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={a.img} alt={`${a.tag} article thumbnail`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            </div>
            <CardHeader>
              <div className="text-xs text-primary font-medium">{a.tag}</div>
              <CardTitle className="text-xl">{a.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="#" className="story-link text-sm">Read article</a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ArticlesGrid;
