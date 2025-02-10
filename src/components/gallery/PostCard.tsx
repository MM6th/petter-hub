
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostReactions } from "./PostReactions";
import { CommentSection } from "./CommentSection";

type Post = {
  id: string;
  pet_name: string;
  pet_breed: string | null;
  pet_age: string | null;
  photo_url: string;
  caption: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

type PostReaction = {
  id: string;
  post_id: string;
  profile_id: string;
};

type PostComment = {
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

type PostCardProps = {
  post: Post;
  reactions: PostReaction[];
  comments: PostComment[];
  userId: string | null;
  isAuthenticated: boolean;
};

export const PostCard = ({ post, reactions, comments, userId, isAuthenticated }: PostCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-0 pb-[100%]">
        <img
          src={post.photo_url}
          alt={post.pet_name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback>{post.profiles.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{post.profiles.username}</span>
        </div>
        <CardTitle className="text-lg">{post.pet_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(post.pet_breed || post.pet_age) && (
          <div className="text-sm text-gray-600">
            {post.pet_breed && <span>Breed: {post.pet_breed}</span>}
            {post.pet_breed && post.pet_age && <span> • </span>}
            {post.pet_age && <span>Age: {post.pet_age}</span>}
          </div>
        )}
        <p className="text-gray-700">{post.caption}</p>
        
        <PostReactions
          postId={post.id}
          userId={userId}
          isAuthenticated={isAuthenticated}
          reactions={reactions}
        />

        <CommentSection
          postId={post.id}
          userId={userId}
          isAuthenticated={isAuthenticated}
          comments={comments}
        />
      </CardContent>
    </Card>
  );
};
