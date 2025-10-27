import { Card } from "@/components/ui/card";
import { Vote, FileText, BarChart3, Shield, Users, Zap } from "lucide-react";

const features: Array<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'cyan' | 'purple' | 'magenta';
}> = [
  {
    icon: <Vote className="w-10 h-10" />,
    title: "Smart Voting",
    description: "Create configurable voting templates with custom rules, time limits, and participant management.",
    color: "cyan" as const
  },
  {
    icon: <FileText className="w-10 h-10" />,
    title: "Petition Management",
    description: "Launch and track petitions with blockchain verification and transparent signature collection.",
    color: "purple" as const
  },
  {
    icon: <BarChart3 className="w-10 h-10" />,
    title: "Real-time Analytics",
    description: "Monitor voting patterns, participation rates, and blockchain transaction status in real-time.",
    color: "magenta" as const
  },
  {
    icon: <Shield className="w-10 h-10" />,
    title: "Advanced Security",
    description: "Multi-factor authentication, role-based access control, and encrypted data storage.",
    color: "cyan" as const
  },
  {
    icon: <Users className="w-10 h-10" />,
    title: "DAO Governance",
    description: "Enable decentralized autonomous organization governance with customizable voting mechanisms.",
    color: "purple" as const
  },
  {
    icon: <Zap className="w-10 h-10" />,
    title: "AI Assistant",
    description: "Get intelligent help with contract creation, security recommendations, and workflow guidance.",
    color: "magenta" as const
  }
];

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-magenta to-neon-cyan bg-clip-text text-transparent">
            Platform Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for secure, transparent, and efficient blockchain-based governance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: 'cyan' | 'purple' | 'magenta';
}) => {
  const borderClass = color === 'cyan' ? 'border-neon-cyan' : color === 'purple' ? 'border-neon-purple' : 'border-neon-magenta';
  const textClass = color === 'cyan' ? 'text-neon-cyan' : color === 'purple' ? 'text-neon-purple' : 'text-neon-magenta';
  const glowClass = color === 'cyan' ? 'glow-cyan' : color === 'purple' ? 'glow-purple' : 'glow-magenta';

  return (
    <Card className={`bg-card border-2 ${borderClass} ${glowClass} p-6 hover:scale-105 transition-all duration-300 group`}>
      <div className={`${textClass} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
};

export default Features;
