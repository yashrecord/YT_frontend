import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Brush, AlertCircle, Loader2, Download as DownloadIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchVideoDetails, generateStyle, generateThumbnail, downloadThumbnail, storeThumbnailData, type StyleGeneration } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { saveThumbnail } from "@/lib/firebase-utils";

const YouTubeThumbnail = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [videoSummary, setVideoSummary] = useState("");
  const [thumbnailStyle, setThumbnailStyle] = useState<StyleGeneration | null>(null);
  const [customText, setCustomText] = useState("");
  const [isLoading, setIsLoading] = useState({
    summary: false,
    style: false,
    thumbnail: false
  });
  const [error, setError] = useState("");
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);

  const extractVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      throw new Error('Invalid YouTube URL');
    } catch (err) {
      throw new Error('Please enter a valid YouTube URL');
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    
    setError("");
    setIsLoading(prev => ({ ...prev, summary: true }));
    
    try {
      const id = extractVideoId(videoUrl);
      if (!id) throw new Error('Could not extract video ID');
      setVideoId(id);
      
      const details = await fetchVideoDetails(id);
      setVideoSummary(details.summary);
      setCustomText(details.title);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const handleGenerateStyle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, style: true }));
    try {
      const style = await generateStyle(videoSummary);
      setThumbnailStyle(style);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(prev => ({ ...prev, style: false }));
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!thumbnailStyle || !videoId) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoading(prev => ({ ...prev, thumbnail: true }));
    setError("");
    
    try {
      const result = await generateThumbnail(videoId, thumbnailStyle, customText);
      if (!result?.url) {
        throw new Error("Failed to generate thumbnail: No URL received");
      }
      
      // Store the thumbnail data in Firebase
      await saveThumbnail({
        userId: user.uid,
        videoLink: `https://youtube.com/watch?v=${videoId}`,
        style: thumbnailStyle.style,
        imageUrl: result.url,
        type: 'youtube'
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

  const handleDownload = async (url: string, filename: string) => {
    if (!url) {
      toast({
        title: "Download Failed",
        description: "No thumbnail URL provided",
        variant: "destructive"
      });
      return;
    }
    
    try {
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
          <h1 className="text-2xl font-bold mb-6 text-center text-purple-800">Generate YouTube Thumbnail</h1>
          
          {/* Step 1: Initial URL Form */}
          {!videoSummary && !isLoading.summary && (
            <form onSubmit={handleSubmitUrl} className="space-y-6">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium mb-2 text-gray-700">
                  Enter YouTube Video URL
                </label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="mr-2" />
                    Get Summary
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: Loading State */}
          {isLoading.summary && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="mt-4 text-gray-600">Generating video summary...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 3: Summary and Style Generation */}
          {videoSummary && !thumbnailStyle && !isLoading.style && (
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="summary" className="block text-sm font-medium mb-2 text-gray-700">
                  Edit Video Summary
                </label>
                <Textarea
                  id="summary"
                  value={videoSummary}
                  onChange={(e) => setVideoSummary(e.target.value)}
                  className="w-full h-32"
                />
                <Button
                  onClick={handleGenerateStyle}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Brush className="mr-2" />
                  Generate Style
                </Button>
              </div>
            </div>
          )}

          {/* Style Generation Loading State */}
          {isLoading.style && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="mt-4 text-gray-600">Generating thumbnail style...</p>
            </div>
          )}

          {/* Step 4: Show Current Thumbnail and Generated Style */}
          {thumbnailStyle && !generatedThumbnailUrl && !isLoading.thumbnail && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">Current Thumbnail</h3>
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Current video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    AI Generated Style
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Style
                      </label>
                      <Textarea
                        value={thumbnailStyle.style}
                        onChange={(e) => setThumbnailStyle({ ...thumbnailStyle, style: e.target.value })}
                        className="w-full min-h-[100px]"
                        placeholder="Edit the generated style..."
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
            </div>
          )}

          {/* Thumbnail Generation Loading State */}
          {isLoading.thumbnail && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="mt-4 text-gray-600">Generating thumbnail...</p>
            </div>
          )}

          {/* Step 5: Show Both Thumbnails */}
          {generatedThumbnailUrl && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-6">Thumbnails Comparison</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Current Thumbnail</h4>
                  <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Current video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Generated Thumbnail</h4>
                  <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={generatedThumbnailUrl}
                      alt="Generated thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleDownload(generatedThumbnailUrl, `thumbnail-${videoId}-${Date.now()}.png`)}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Generated Thumbnail
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default YouTubeThumbnail;
