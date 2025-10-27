import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, Users, Clock, CheckCircle2 } from "lucide-react";

interface VotingTemplate {
  id: string;
  title: string;
  type: string;
  status: string;
  voters: number;
  timeLeft: string;
  yesVotes: number;
  noVotes: number;
}

const mockTemplates: VotingTemplate[] = [
  {
    id: "1",
    title: "Proposal: Liquidity Pool",
    type: "Configurable Voting Template",
    status: "Active",
    voters: 0,
    timeLeft: "2d 14h",
    yesVotes: 98,
    noVotes: 2,
  },
  {
    id: "2",
    title: "DAO Governance",
    type: "Configurable Voting Template",
    status: "Active",
    voters: 0,
    timeLeft: "5d 8h",
    yesVotes: 0,
    noVotes: 0,
  },
];

const VotingDashboard = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Active Voting Templates
          </h2>
          <p className="text-muted-foreground text-lg">
            Configurable smart contract templates for transparent decision-making
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {mockTemplates.map((template, index) => (
            <VotingCard key={template.id} template={template} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-neon-cyan to-neon-purple text-cyber-dark hover:opacity-90 glow-cyan"
          >
            Create New Template
          </Button>
        </div>
      </div>
    </section>
  );
};

const VotingCard = ({ template, index }: { template: VotingTemplate; index: number }) => {
  const borderColor = index === 0 ? 'border-neon-magenta' : 'border-neon-cyan';
  const glowClass = index === 0 ? 'glow-magenta' : 'glow-cyan';

  return (
    <Card className={`bg-card border-2 ${borderColor} ${glowClass} p-6 hover:scale-[1.02] transition-all duration-300`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{template.type}</p>
            <h3 className="text-2xl font-bold text-foreground">{template.title}</h3>
          </div>
          <span className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan rounded-full text-neon-cyan text-sm font-semibold">
            {template.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <StatItem 
            icon={<Users className="w-5 h-5" />}
            label="Active Voters"
            value={`Active ${template.voters.toFixed(2)} ETH`}
          />
          <StatItem 
            icon={<Clock className="w-5 h-5" />}
            label="Time Left"
            value={template.timeLeft}
          />
        </div>

        {/* Contract Stats */}
        {template.yesVotes > 0 && (
          <div className="bg-cyber-dark/50 rounded-lg p-4 border border-neon-purple/30">
            <p className="text-sm text-muted-foreground mb-2">Contract Stats</p>
            <p className="text-foreground font-mono">{template.yesVotes}% Yes, {template.noVotes}% No</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 bg-neon-cyan text-cyber-dark hover:bg-neon-cyan/90">
            <Vote className="w-4 h-4 mr-2" />
            Vote Now
          </Button>
          <Button variant="outline" className="flex-1 border-neon-purple text-neon-purple hover:bg-neon-purple/10">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <div className="text-neon-cyan">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

export default VotingDashboard;
