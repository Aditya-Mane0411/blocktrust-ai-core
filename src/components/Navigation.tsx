import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, FileText, Code, Users, BookOpen } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BlockTrust AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/platform">
              <Button variant="ghost" size="sm">Platform</Button>
            </Link>
            <Link to="/templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <Link to="/petitions">
              <Button variant="ghost" size="sm">Petitions</Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" size="sm">Analytics</Button>
            </Link>
            <Link to="/ai-assistant">
              <Button variant="ghost" size="sm">AI Assistant</Button>
            </Link>
            <Link to="/developers">
              <Button variant="ghost" size="sm">
                <Code className="h-4 w-4 mr-2" />
                Developers
              </Button>
            </Link>
            <Link to="/documentation">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
          </div>

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
