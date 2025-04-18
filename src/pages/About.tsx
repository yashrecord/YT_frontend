import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">About VidSnap</h1>
      <div className="prose prose-purple max-w-none">
        <p className="text-lg mb-6">
          VidSnap is dedicated to helping content creators make stunning thumbnails
          that capture attention and drive engagement. We believe that great content
          deserves great thumbnails.
        </p>
        <p className="text-lg mb-6">
          Our easy-to-use platform combines powerful features with simplicity,
          making it possible for anyone to create professional-looking thumbnails
          in minutes.
        </p>
      </div>
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-4">
          VidSnap is dedicated to helping content creators make stunning thumbnails
          that capture attention and drive engagement. We believe that great content
          deserves great thumbnails.
        </p>
        <p className="text-gray-600">
          Our easy-to-use platform combines powerful features with simplicity,
          making it possible for anyone to create professional-looking thumbnails
          in minutes.
        </p>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-4 text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Easy-to-use thumbnail generator with customizable templates</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Personal library to store and organize your thumbnails</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>High-quality exports in multiple formats</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Regular updates and new features</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default About;
