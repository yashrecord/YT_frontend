import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageIcon, BookOpenIcon, UserIcon, InfoIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dsfiew0iy/image/upload/v1744972505/My%20Brand/yt_thumbnail-high-resolution-logo_ok3wcu.png"
                alt="VidSnap Logo"
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-gray-900">VidSnap</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/app">
                  <Button variant="ghost">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </Link>
                <Link to="/library">
                  <Button variant="ghost">
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Library
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost">
                    <InfoIcon className="h-4 w-4 mr-2" />
                    About
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/about">
                  <Button variant="ghost">
                    <InfoIcon className="h-4 w-4 mr-2" />
                    About
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
