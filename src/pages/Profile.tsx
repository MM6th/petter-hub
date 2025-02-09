
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import PetPostForm from "@/components/PetPostForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type ProfileData = {
  username: string;
  email: string;
  bio: string;
  location: string;
  avatar_url: string;
};

type PetPost = {
  id: string;
  pet_name: string;
  pet_breed: string | null;
  pet_age: string | null;
  photo_url: string;
  caption: string;
  created_at: string;
};

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        navigate('/create-profile');
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const { data: userPosts } = useQuery({
    queryKey: ['user-pet-posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('pet_posts')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PetPost[];
    },
    enabled: !loading,
  });

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('pet_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['user-pet-posts'] });
      queryClient.invalidateQueries({ queryKey: ['pet-posts'] }); // This will update the gallery

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">{profile.username}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-600">Bio</h3>
              <p className="text-gray-700">{profile.bio || "No bio provided"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Location</h3>
              <p className="text-gray-700">{profile.location || "No location provided"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-600">Email</h3>
              <p className="text-gray-700">{profile.email || "No email provided"}</p>
            </div>
          </CardContent>
        </Card>
        
        <PetPostForm />

        {userPosts && userPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Your Pet Posts</h2>
            <div className="grid gap-6">
              {userPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={post.photo_url}
                      alt={post.pet_name}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
