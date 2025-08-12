import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const qas = [
  {
    user: "Sarah M.",
    avatar: avatar1,
    question: "How many rest days should I take when starting strength training?",
  },
  {
    user: "James K.",
    avatar: avatar2,
    question: "Best breakfast options for steady energy through the morning?",
  },
  {
    user: "Lena P.",
    avatar: avatar3,
    question: "What’s a simple breathing exercise for reducing stress at work?",
  },
];

const CommunityQA = () => {
  return (
    <section aria-labelledby="community-qa" className="container mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h2 id="community-qa" className="text-3xl md:text-4xl font-semibold">Community Q&A</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Join discussions, ask questions, and learn from experts and peers.
        </p>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {qas.map((qa) => (
          <li key={qa.user} className="rounded-lg border bg-card p-5 shadow-soft hover:shadow-elevated transition-shadow animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src={qa.avatar} alt={`${qa.user} avatar`} />
                <AvatarFallback>{qa.user.split(" ")[0][0]}{qa.user.split(" ")[1]?.[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{qa.user}</span>
            </div>
            <p className="text-sm text-muted-foreground">{qa.question}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CommunityQA;
