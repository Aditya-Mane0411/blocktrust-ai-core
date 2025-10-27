import { Card } from "@/components/ui/card";
import { CheckCircle2, Link2 } from "lucide-react";

const BlockchainStatus = () => {
  return (
    <section className="py-20 px-4 bg-cyber-card/30">
      <div className="container mx-auto max-w-5xl">
        <Card className="bg-card border-2 border-neon-cyan glow-cyan p-8">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Blockchain Transaction Status
              </h3>
              <CheckCircle2 className="w-8 h-8 text-neon-cyan" />
            </div>

            {/* Hexagonal chain visualization */}
            <div className="relative h-32 flex items-center justify-center overflow-hidden">
              <div className="flex items-center gap-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="relative">
                    <Hexagon 
                      filled={i < 5} 
                      active={i === 4}
                      delay={i * 0.1}
                    />
                    {i < 6 && (
                      <div className={`absolute top-1/2 -right-4 w-8 h-0.5 ${i < 4 ? 'bg-neon-cyan' : 'bg-neon-purple'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-1000 animate-pulse-slow"
                  style={{ width: '71%' }}
                />
              </div>
            </div>

            {/* Transaction details */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-neon-cyan" />
                <span className="text-muted-foreground">TxID:</span>
                <span className="text-foreground font-mono">0x7a...f3d9</span>
              </div>
              <span className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan rounded-full text-neon-cyan font-semibold">
                Confirmed
              </span>
            </div>

            {/* Block info */}
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <InfoItem label="Block Height" value="15,847,392" />
              <InfoItem label="Gas Fee" value="0.00234 ETH" />
              <InfoItem label="Confirmations" value="12 / 12" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

const Hexagon = ({ filled, active, delay }: { filled: boolean; active: boolean; delay: number }) => {
  const fillClass = filled 
    ? active 
      ? 'fill-neon-magenta stroke-neon-magenta animate-pulse-slow' 
      : 'fill-neon-cyan stroke-neon-cyan'
    : 'fill-transparent stroke-neon-purple';

  return (
    <svg 
      width="40" 
      height="46" 
      viewBox="0 0 40 46" 
      className={fillClass}
      style={{ animationDelay: `${delay}s` }}
    >
      <path
        d="M20 0L39 11.5V34.5L20 46L1 34.5V11.5L20 0Z"
        strokeWidth="2"
        className="transition-all duration-300"
      />
    </svg>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold text-foreground">{value}</p>
  </div>
);

export default BlockchainStatus;
