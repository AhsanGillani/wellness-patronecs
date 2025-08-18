import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simpleSupabase } from "@/lib/simple-supabase";
import { useCreateQuestion, useTopics } from "@/hooks/useCommunity";
import { questionSchema, type QuestionFormData } from "@/lib/validations";

interface CreateQuestionFormProps {
  onSuccess: () => void;
  topicId?: string;
}

export function CreateQuestionForm({ onSuccess, topicId }: CreateQuestionFormProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(topicId || "");
  
  const createQuestion = useCreateQuestion();
  const { data: topics } = useTopics();

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: "",
      body: "",
      isAnonymous: false,
      guestName: "",
    },
  });

  useEffect(() => {
    // Check auth status
    simpleSupabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const onSubmit = async (data: any) => {
    if (!selectedTopicId) return;

    await createQuestion.mutateAsync({
      topicId: selectedTopicId,
      title: data.title,
      body: data.body,
      isAnonymous: data.isAnonymous,
      guestName: isAuthenticated ? undefined : data.guestName,
    });

    onSuccess();
  };

  return (
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

      {!topicId && (
        <div>
          <Label htmlFor="topic">Select Topic</Label>
          <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a topic for your question" />
            </SelectTrigger>
            <SelectContent>
              {topics?.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedTopicId && (
            <p className="text-sm text-destructive mt-1">
              Please select a topic for your question
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="title">Question Title</Label>
        <Input
          id="title"
          placeholder="What's your question? Be specific and clear."
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="body">Question Details</Label>
        <Textarea
          id="body"
          placeholder="Provide more details about your question. Include context, what you've tried, and what kind of answer you're looking for..."
          rows={6}
          {...form.register("body")}
        />
        {form.formState.errors.body && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.body.message}
          </p>
        )}
      </div>

      {isAuthenticated && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAnonymous"
            checked={form.watch("isAnonymous")}
            onCheckedChange={(checked) => form.setValue("isAnonymous", !!checked)}
          />
          <Label htmlFor="isAnonymous" className="text-sm">
            Post anonymously
          </Label>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createQuestion.isPending || (!topicId && !selectedTopicId)}
        >
          {createQuestion.isPending ? "Posting..." : "Post Question"}
        </Button>
      </div>
    </form>
  );
}