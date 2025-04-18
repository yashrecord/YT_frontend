import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Download, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { getUserThumbnails, deleteThumbnail } from "@/lib/firebase-utils";
import { downloadThumbnail } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Thumbnail {
  id: string;
  userId: string;
  videoLink?: string;
  style: string;
  imageUrl: string;
  type: 'youtube' | 'custom';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const Library = () => {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp?.seconds) return 'Date not available';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  useEffect(() => {
    const fetchThumbnails = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const fetchedThumbnails = await getUserThumbnails(user.uid);
        setThumbnails(fetchedThumbnails as Thumbnail[]);
        setError("");
      } catch (err) {
        setError("Failed to fetch thumbnails");
        console.error("Error fetching thumbnails:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnails();
  }, [user, authLoading, navigate]);

  const handleDelete = async (thumbnail: Thumbnail) => {
    try {
      await deleteThumbnail(thumbnail.id);
      setThumbnails(prev => prev.filter(t => t.id !== thumbnail.id));
      toast({
        title: "Success",
        description: "Thumbnail deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete thumbnail",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (thumbnail: Thumbnail) => {
    try {
      const filename = `thumbnail-${thumbnail.type}-${Date.now()}.png`;
      await downloadThumbnail(thumbnail.imageUrl, filename);
      toast({
        title: "Success",
        description: "Thumbnail downloaded successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download thumbnail",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] px-2 md:px-4">
      <div className="container mx-auto py-4 md:py-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-8 text-purple-800">Your Thumbnails</h1>
        
        {thumbnails.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No thumbnails found. Start creating some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thumbnails.map((thumbnail) => (
              <Card 
                key={thumbnail.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedThumbnail(thumbnail)}
              >
                <div className="aspect-video relative group">
                  <img
                    src={thumbnail.imageUrl}
                    alt={`Thumbnail ${thumbnail.type}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(thumbnail);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(thumbnail);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Type: {thumbnail.type.charAt(0).toUpperCase() + thumbnail.type.slice(1)}
                  </p>
                  {thumbnail.videoLink && (
                    <a
                      href={thumbnail.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Video
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {formatDate(thumbnail.createdAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedThumbnail} onOpenChange={(open) => !open && setSelectedThumbnail(null)}>
          <DialogContent className="max-w-3xl max-h-[95vh] md:max-h-[90vh] p-4 md:p-6">
            {selectedThumbnail && (
              <>
                <DialogHeader className="px-2">
                  <DialogTitle>Thumbnail Details</DialogTitle>
                  <DialogDescription>
                    Created on {formatDate(selectedThumbnail.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(85vh-4rem)] md:max-h-[calc(90vh-8rem)] mt-2">
                  <div className="mt-4">
                    <div className="aspect-video w-full relative mb-4">
                      <img
                        src={selectedThumbnail.imageUrl}
                        alt={`Thumbnail ${selectedThumbnail.type}`}
                        className="w-full h-full object-contain bg-black"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-1">Type</h3>
                        <p className="text-gray-600">
                          {selectedThumbnail.type.charAt(0).toUpperCase() + selectedThumbnail.type.slice(1)}
                        </p>
                      </div>
                      {selectedThumbnail.style && (
                        <div>
                          <h3 className="font-semibold mb-1">Style</h3>
                          <p className="text-gray-600">{selectedThumbnail.style}</p>
                        </div>
                      )}
                      {selectedThumbnail.videoLink && (
                        <div>
                          <h3 className="font-semibold mb-1">Video Link</h3>
                          <a
                            href={selectedThumbnail.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 inline-flex items-center"
                          >
                            Open Video <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                      )}
                      <div className="flex gap-4 mt-6">
                        <Button
                          variant="secondary"
                          onClick={() => handleDownload(selectedThumbnail)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDelete(selectedThumbnail);
                            setSelectedThumbnail(null);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
};

export default Library;
