import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import { useTopic, useQuestions } from "@/hooks/useCommunity";
import { CreateQuestionForm } from "@/components/community/CreateQuestionForm";
import { formatDistanceToNow } from "date-fns";

const CommunityTopic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  
  const { data: topic, isLoading: topicLoading } = useTopic(slug!);
  const { data: questions, isLoading: questionsLoading } = useQuestions(topic?.id);

  useEffect(() => {
    if (topic) {
      document.title = `${topic.title} | Community Forum`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", topic.description || `Discussion about ${topic.title} in our wellness community.`);
    }
  }, [topic]);

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
              <p className="text-muted-foreground mb-6">The topic you're looking for doesn't exist.</p>
              <Button asChild>
                <Link to="/community">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Community
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Link>
          </Button>
        </div>

        {/* Topic Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{topic.title}</h1>
          {topic.description && (
            <p className="text-xl text-muted-foreground mb-4">{topic.description}</p>
          )}
          <div className="text-sm text-muted-foreground">
            Created by {topic.guest_name || 'Member'} • {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Questions
            </h2>
            
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hover-scale">
                  <Plus className="mr-2 h-4 w-4" />
                  Ask Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Ask a Question in {topic.title}</DialogTitle>
                </DialogHeader>
                <CreateQuestionForm 
                  topicId={topic.id} 
                  onSuccess={() => setQuestionDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {questionsLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : questions?.length ? (
            <div className="grid gap-4">
              {questions.map((question) => (
                <Card key={question.id} className="hover:shadow-elevated transition-shadow animate-fade-in">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          <Link 
                            to={`/community/q/${question.id}`}
                            className="hover:text-primary transition-colors story-link"
                          >
                            {question.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {question.body}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-4 shrink-0">
                        {question.answer_count || 0} answers
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      By {question.is_anonymous ? 'Anonymous' : (question.guest_name || 'Member')} • {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to ask a question in this topic!</p>
                <Button onClick={() => setQuestionDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ask First Question
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityTopic;