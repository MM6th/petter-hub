
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Comment = {
  id: string;
  post_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

type CommentSectionProps = {
  postId: string;
  userId: string | null;
  isAuthenticated: boolean;
  comments: Comment[];
};

export const CommentSection = ({ postId, userId, isAuthenticated, comments }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, profile_id: userId, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      setNewComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        {comments
          ?.filter(c => c.post_id === postId)
          .map(comment => (
            <div key={comment.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.profiles.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{comment.profiles.username}</span>{" "}
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
      </div>

      {isAuthenticated && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-0 h-9 py-2 resize-none"
          />
          <Button
            size="sm"
            onClick={() => {
              if (newComment?.trim()) {
                addComment.mutate(newComment.trim());
              }
            }}
            className="shrink-0"
          >
            Post
          </Button>
        </div>
      )}
    </div>
  );
};
