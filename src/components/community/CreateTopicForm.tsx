import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useCreateTopic } from "@/hooks/useCommunity";
import { topicSchema, type TopicFormData } from "@/lib/validations";

interface CreateTopicFormProps {
  onSuccess: () => void;
}

export function CreateTopicForm({ onSuccess }: CreateTopicFormProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const createTopic = useCreateTopic();

  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      guestName: "",
    },
  });

  useEffect(() => {
    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    form.setValue('title', title);
    form.setValue('slug', slug);
  };

  const onSubmit = async (data: TopicFormData) => {
    await createTopic.mutateAsync({
      title: data.title,
      slug: data.slug,
      description: data.description,
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

      <div>
        <Label htmlFor="title">Topic Title</Label>
        <Input
          id="title"
          placeholder="Enter a descriptive title for your topic"
          onChange={handleTitleChange}
          value={form.watch('title')}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="slug">URL Slug</Label>
        <Input
          id="slug"
          placeholder="topic-url-slug"
          {...form.register("slug")}
        />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Briefly describe what this topic is about..."
          rows={3}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

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
          disabled={createTopic.isPending}
        >
          {createTopic.isPending ? "Creating..." : "Create Topic"}
        </Button>
      </div>
    </form>
  );
}