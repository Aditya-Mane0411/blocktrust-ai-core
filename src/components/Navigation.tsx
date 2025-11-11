import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, FileText, BookOpen } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BlockTrust AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <Link to="/petitions">
              <Button variant="ghost" size="sm">Petitions</Button>
            </Link>
            <Link to="/documentation">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
          </div>

          {/* Auth / CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/platform">
              <Button size="sm">Launch Platform</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
