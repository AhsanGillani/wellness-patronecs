import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useQuestion, useAnswers, useCreateAnswer } from "@/hooks/useCommunity";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { answerSchema, type AnswerFormData } from "@/lib/validations";
import { simpleSupabase } from "@/lib/simple-supabase";

const CommunityQuestion = () => {
  const { id } = useParams<{ id: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { data: question, isLoading: questionLoading } = useQuestion(id!);
  const { data: answers, isLoading: answersLoading } = useAnswers(id!);
  const createAnswer = useCreateAnswer();

  const form = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      body: "",
      guestName: "",
    },
  });

  useEffect(() => {
    if (question) {
      document.title = `${question.title} | Community Forum`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", question.body.substring(0, 160) + "...");
    }
  }, [question]);

  useEffect(() => {
    // Check auth status
    simpleSupabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const onSubmit = async (data: AnswerFormData) => {
    if (!question) return;

    await createAnswer.mutateAsync({
      questionId: question.id,
      body: data.body,
      guestName: isAuthenticated ? undefined : data.guestName,
    });

    form.reset();
  };

  if (questionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-32 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
              <p className="text-muted-foreground mb-6">The question you're looking for doesn't exist.</p>
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
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Link>
          </Button>
        </div>

        {/* Question */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{question.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Asked by {question.is_anonymous ? 'Anonymous' : (question.guest_name || 'Member')} • {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{question.body}</p>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Answers ({answers?.length || 0})
          </h2>

          {answersLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : answers?.length ? (
            <div className="space-y-4">
              {answers.map((answer) => (
                <Card key={answer.id} className="animate-fade-in">
                  <CardContent className="p-6">
                    <div className="prose prose-gray dark:prose-invert max-w-none mb-4">
                      <p className="whitespace-pre-wrap">{answer.body}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>
                          {answer.guest_name || 'Member'}
                        </span>
                        {answer.is_from_professional && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Professional
                          </Badge>
                        )}
                      </div>
                      <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No answers yet</h3>
                <p className="text-muted-foreground">Be the first to answer this question!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Answer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
            <CardDescription>
              Share your knowledge and help the community by providing a helpful answer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isAuthenticated && (
                <div>
                  <Label htmlFor="guestName">Your Name</Label>
                  <Input
                    id="guestName"
                    placeholder="Enter your name"
                    {...form.register("guestName")}
                  />
                  {form.formState.errors.guestName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.guestName.message}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <Label htmlFor="body">Answer</Label>
                <Textarea
                  id="body"
                  placeholder="Share your knowledge and provide a helpful answer..."
                  rows={6}
                  {...form.register("body")}
                />
                {form.formState.errors.body && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.body.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={createAnswer.isPending}
                className="hover-scale"
              >
                <Send className="mr-2 h-4 w-4" />
                {createAnswer.isPending ? "Posting..." : "Post Answer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityQuestion;