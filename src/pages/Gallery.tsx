
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      const adScript = document.createElement('script');
      adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8486883130442706";
      adScript.async = true;
      adScript.crossOrigin = "anonymous";
      document.head.appendChild(adScript);
    } catch (error) {
      console.error('Error loading AdSense:', error);
    }
  }, []);

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center">
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">Pet Gallery</h1>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate("/profile")}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    Go to Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  size="sm"
                  className="border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-[1400px] mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-gray-600 mt-2">Share your furry friends with the world!</p>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div className="hidden lg:block w-[300px] shrink-0">
              <div className="sticky top-4">
                <ins className="adsbygoogle"
                     style={{ display: 'block' }}
                     data-ad-client="ca-pub-8486883130442706"
                     data-ad-slot="your-ad-slot-id"
                     data-ad-format="auto"
                     data-full-width-responsive="true">
                </ins>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Gallery;
