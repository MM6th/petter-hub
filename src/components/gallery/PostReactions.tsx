
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PostReactionsProps = {
  postId: string;
  userId: string | null;
  isAuthenticated: boolean;
  reactions: Array<{ id: string; post_id: string; profile_id: string; }>;
};

export const PostReactions = ({ postId, userId, isAuthenticated, reactions }: PostReactionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleReaction = useMutation({
    mutationFn: async () => {
      const existingReaction = reactions?.find(
        r => r.post_id === postId && r.profile_id === userId
      );

      if (existingReaction) {
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_reactions')
          .insert({ post_id: postId, profile_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-auto hover:bg-transparent"
        onClick={() => toggleReaction.mutate()}
      >
        <Heart
          className={`h-6 w-6 ${
            reactions?.some(
              r => r.post_id === postId && r.profile_id === userId
            )
              ? "fill-red-500 text-red-500"
              : "text-gray-500"
          }`}
        />
      </Button>
      <span className="text-sm text-gray-500">
        {reactions?.filter(r => r.post_id === postId).length || 0}
      </span>
    </div>
  );
};
