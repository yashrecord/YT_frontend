import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MainApp = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Create New Thumbnail</h1>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-3">From Description</h2>
                <p className="text-gray-600 mb-6">
                  Create a thumbnail by providing a detailed description of what you want
                </p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate("/custom-thumbnail")}
                >
                  Write Description
                </Button>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Youtube className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-3">From YouTube Video</h2>
                <p className="text-gray-600 mb-6">
                  Generate a thumbnail from an existing YouTube video URL
                </p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate("/youtube-thumbnail")}
                >
                  Enter Video URL
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
