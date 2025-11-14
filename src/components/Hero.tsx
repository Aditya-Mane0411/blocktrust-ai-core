import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user, signOut } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* User profile section */}
      {user && (
        <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
          <span className="text-sm ">Welcome, {user.full_name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="border-cyber-primary/30 hover:bg-cyber-primary/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}

      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0A0E27_1px,transparent_1px),linear-gradient(to_bottom,#0A0E27_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-block">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent animate-pulse-slow">
              BlockTrust AI
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta rounded-full mt-2" />
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-4xl font-light text-foreground/90">Web 3.0 Blockchain-as-a-Service Platform</p>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Secure, transparent, and intelligent blockchain solutions for voting, petitions, and governance. Powered by
            AI and built on the foundation of Web 3.0 technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-neon-cyan text-cyber-dark hover:bg-neon-cyan/90 glow-cyan group text-lg px-8 py-6 font-semibold"
            >
              Launch Platform
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure & Transparent"
              description="Built on blockchain technology for maximum security and transparency"
              color="cyan"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="AI-Powered"
              description="Intelligent assistance and automated security recommendations"
              color="purple"
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Enterprise Ready"
              description="2FA, JWT authentication, and role-based access control"
              color="magenta"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "cyan" | "purple" | "magenta";
}) => {
  const glowClass = color === "cyan" ? "glow-cyan" : color === "purple" ? "glow-purple" : "glow-magenta";
  const borderClass =
    color === "cyan" ? "border-neon-cyan" : color === "purple" ? "border-neon-purple" : "border-neon-magenta";
  const textClass = color === "cyan" ? "text-neon-cyan" : color === "purple" ? "text-neon-purple" : "text-neon-magenta";

  return (
    <div
      className={`bg-card border-2 ${borderClass} rounded-xl p-6 ${glowClass} hover:scale-105 transition-all duration-300`}
    >
      <div className={`${textClass} mb-4`}>{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default Hero;
