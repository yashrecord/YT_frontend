import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brush, AlertCircle, Loader2, Download as DownloadIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateThumbnail, downloadThumbnail } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { saveThumbnail } from "@/lib/firebase-utils";

const CustomThumbnail = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [thumbnailStyle] = useState({
    style: "A minimalist tech thumbnail with dark background and neon accents, featuring modern typography and clean lines"
  });
  const [isLoading, setIsLoading] = useState({
    thumbnail: false
  });
  const [error, setError] = useState("");
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState("");

  const handleGenerateThumbnail = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoading(prev => ({ ...prev, thumbnail: true }));
    setError("");
    
    try {
      const result = await generateThumbnail("custom", thumbnailStyle);
      if (!result?.url) {
        throw new Error("Failed to generate thumbnail: No URL received");
      }

      // Store the thumbnail data in Firebase
      await saveThumbnail({
        userId: user.uid,
        style: thumbnailStyle.style,
        imageUrl: result.url,
        type: 'custom'
      });
      
      setGeneratedThumbnailUrl(result.url);
      
      toast({
        title: "Success",
        description: "Thumbnail generated and saved successfully",
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate thumbnail");
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate thumbnail",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, thumbnail: false }));
    }
  };

  const handleDownload = async (url: string) => {
    if (!url) {
      toast({
        title: "Download Failed",
        description: "No thumbnail URL provided",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const filename = `custom-thumbnail-${Date.now()}.png`;
      await downloadThumbnail(url, filename);
      toast({
        title: "Success",
        description: "Thumbnail downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download the thumbnail",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        <Card className="p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-purple-800">Custom Thumbnail Generator</h1>
          
          {!generatedThumbnailUrl && !isLoading.thumbnail && (
            <div className="mt-6 space-y-6">
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">
                  Predefined Style
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Style Description
                    </label>
                    <Textarea
                      value={thumbnailStyle.style}
                      readOnly
                      className="w-full min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateThumbnail}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Generate Thumbnail
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Thumbnail Generation Loading State */}
          {isLoading.thumbnail && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="mt-4 text-gray-600">Generating thumbnail...</p>
            </div>
          )}

          {/* Show Generated Thumbnail */}
          {generatedThumbnailUrl && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-6">Generated Thumbnail</h3>
              <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg mb-6">
                <img
                  src={generatedThumbnailUrl}
                  alt="Generated thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                onClick={() => handleDownload(generatedThumbnailUrl)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Thumbnail
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomThumbnail;