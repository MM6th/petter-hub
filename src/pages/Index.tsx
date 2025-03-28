
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        setHasProfile(!!profile);
        if (!!profile) {
          navigate('/profile');
        }
      }
    };

    checkAuthAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();
        
        setHasProfile(!!profile);
        if (!!profile) {
          navigate('/profile');
        }
      } else {
        setHasProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      navigate("/create-profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-20 pb-12 text-center"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
          >
            <span className="block">Share Your Pet's</span>
            <span className="block text-primary">Precious Moments</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Join our community of pet lovers. Upload, share, and discover adorable pet photos from around the world.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex justify-center gap-4 flex-wrap"
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="relative px-8 py-3 bg-primary text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              {isAuthenticated ? "Create Profile" : "Get Started"}
            </Button>
            <Button
              onClick={() => navigate("/gallery")}
              variant="outline"
              size="lg"
              className="px-8 py-3 border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
            >
              Browse Photos
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gradient-to-b from-purple-50 to-white text-sm text-gray-500">
              Trusted by pet lovers worldwide
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
