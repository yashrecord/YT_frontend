
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ImageIcon, BookOpenIcon, UserIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-32 pb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create Beautiful Thumbnails in Seconds
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your images into eye-catching thumbnails with our powerful and easy-to-use thumbnail generator.
          </p>
          <Link to="/app">
            <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 h-auto">
              Start Creating Now
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20">
          <div className="text-center p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600">Create professional thumbnails with just a few clicks</p>
          </div>
          <div className="text-center p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Library Access</h3>
            <p className="text-gray-600">Save and organize all your thumbnails in one place</p>
          </div>
          <div className="text-center p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized</h3>
            <p className="text-gray-600">Customize templates to match your brand</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
