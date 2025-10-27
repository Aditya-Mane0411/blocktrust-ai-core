import { Github, Twitter, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-neon-cyan/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              BlockTrust AI
            </h3>
            <p className="text-muted-foreground text-sm">
              Secure, transparent blockchain governance powered by AI and Web 3.0 technology.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Voting Templates</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Petitions</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">AI Assistant</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Developers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Smart Contracts</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-neon-cyan transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2025 BlockTrust AI. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
