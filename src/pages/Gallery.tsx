
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "@/components/gallery/PostCard";

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

const Gallery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id || null);
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

  const { data: reactions } = useQuery({
    queryKey: ['post-reactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*');

      if (error) throw error;
      return data as PostReaction[];
    },
    enabled: isAuthenticated,
  });

  const { data: comments } = useQuery({
    queryKey: ['post-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:profile_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PostComment[];
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
                  <PostCard
                    key={post.id}
                    post={post}
                    reactions={reactions || []}
                    comments={comments || []}
                    userId={userId}
                    isAuthenticated={isAuthenticated}
                  />
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
