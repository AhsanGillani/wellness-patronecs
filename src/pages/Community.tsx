import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageSquare, Users } from "lucide-react";
import { useTopics, useQuestions } from "@/hooks/useCommunity";
import { CreateTopicForm } from "@/components/community/CreateTopicForm";
import { CreateQuestionForm } from "@/components/community/CreateQuestionForm";
import { formatDistanceToNow } from "date-fns";

const Community = () => {
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const { data: recentQuestions, isLoading: questionsLoading } = useQuestions();

  useEffect(() => {
    document.title = "Community Forum | Wellness Platform";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Join our wellness community. Ask questions, share knowledge, and connect with health professionals and peers.");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Forum</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Ask questions, share knowledge, and connect with wellness professionals and fellow community members.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="hover-scale">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Topic</DialogTitle>
                </DialogHeader>
                <CreateTopicForm onSuccess={() => setTopicDialogOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="hover-scale">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Ask Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Ask a Question</DialogTitle>
                </DialogHeader>
                <CreateQuestionForm onSuccess={() => setQuestionDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Topics Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Topics
              </h2>
            </div>

            {topicsLoading ? (
              <div className="grid gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : topics?.length ? (
              <div className="grid gap-4">
                {topics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-elevated transition-shadow animate-fade-in">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            <Link 
                              to={`/community/topic/${topic.slug}`}
                              className="hover:text-primary transition-colors story-link"
                            >
                              {topic.title}
                            </Link>
                          </CardTitle>
                          {topic.description && (
                            <CardDescription className="mt-2">{topic.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-4 shrink-0">
                          0 questions
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        By {topic.guest_name || 'Member'} • {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No topics yet</h3>
                  <p className="text-muted-foreground mb-6">Be the first to create a topic for the community!</p>
                  <Button onClick={() => setTopicDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Topic
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Questions Sidebar */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent Questions
            </h2>

            {questionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentQuestions?.length ? (
              <div className="space-y-4">
                {recentQuestions.slice(0, 10).map((question) => (
                  <Card key={question.id} className="hover:shadow-soft transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm leading-relaxed mb-2">
                        <Link 
                          to={`/community/q/${question.id}`}
                          className="hover:text-primary transition-colors story-link"
                        >
                          {question.title}
                        </Link>
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        0 answers • {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No questions yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;