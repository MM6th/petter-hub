
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  petName: z.string().min(1, "Pet name is required"),
  petBreed: z.string().optional(),
  petAge: z.string().optional(),
  caption: z.string().min(1, "Caption is required"),
});

const PetPostForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petName: "",
      petBreed: "",
      petAge: "",
      caption: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet_photos')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('pet_photos')
        .getPublicUrl(fileName);

      // Create pet post record
      const { error: postError } = await supabase
        .from('pet_posts')
        .insert({
          pet_name: values.petName,
          pet_breed: values.petBreed || null,
          pet_age: values.petAge || null,
          photo_url: publicUrl,
          caption: values.caption,
        });

      if (postError) throw postError;

      toast({
        title: "Success!",
        description: "Your pet post has been created.",
      });

      // Reset form
      form.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error creating pet post:', error);
      toast({
        title: "Error",
        description: "Failed to create pet post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Create Pet Post</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="petName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pet name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="petBreed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Breed (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pet breed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="petAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Age (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pet age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Photo Upload *</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write something about your pet..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Post...
              </>
            ) : (
              "Create Post"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PetPostForm;
