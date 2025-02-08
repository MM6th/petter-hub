
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PetPost = {
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

const Gallery = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['pet-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_posts')
        .select(`
          *,
          profiles:profile_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PetPost[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center">
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pet Gallery</h1>
          <p className="text-gray-600 mt-2">Share your furry friends with the world!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={post.photo_url}
                  alt={post.pet_name}
                  className="object-cover w-full h-full"
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
              <CardContent className="space-y-2">
                {(post.pet_breed || post.pet_age) && (
                  <div className="text-sm text-gray-600">
                    {post.pet_breed && <span>Breed: {post.pet_breed}</span>}
                    {post.pet_breed && post.pet_age && <span> • </span>}
                    {post.pet_age && <span>Age: {post.pet_age}</span>}
                  </div>
                )}
                <p className="text-gray-700">{post.caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Gallery;
