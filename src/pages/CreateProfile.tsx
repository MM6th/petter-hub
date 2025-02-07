
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No authenticated user found");
        navigate("/auth");
        return;
      }

      let finalAvatarUrl = avatarUrl;

      // Upload avatar if one was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error("Error uploading avatar");
          return;
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.path);
          
          finalAvatarUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          email: email || user.email,
          bio,
          location,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Profile update error:', error);
        if (error.code === '23505') {
          toast.error("Username already taken. Please choose another.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Profile created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto pt-8"
      >
        <Card className="p-8 backdrop-blur-sm bg-white/80 shadow-xl rounded-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
            <p className="text-gray-600 mt-2">Tell us about yourself and your pets</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback>
                    {username ? username[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm transition-opacity">
                  Change Photo
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                required
                className="w-full"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your pets..."
                className="w-full h-24"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !username}
            >
              {loading ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateProfile;
