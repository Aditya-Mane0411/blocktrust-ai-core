import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Clock, Plus } from "lucide-react";
import { usePetition } from "@/hooks/usePetition";
import { useState } from "react";
import { CreateEventModal } from "@/components/CreateEventModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const PetitionDashboard = () => {
  const { petitions, loading, signPetition, refetch } = usePetition();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [selectedPetitionId, setSelectedPetitionId] = useState<string>("");
  const [signComment, setSignComment] = useState("");

  const handleSignPetition = async () => {
    try {
      await signPetition(selectedPetitionId, signComment);
      setIsSignDialogOpen(false);
      setSignComment("");
    } catch (error) {
      console.error("Failed to sign petition:", error);
    }
  };

  const openSignDialog = (petitionId: string) => {
    setSelectedPetitionId(petitionId);
    setIsSignDialogOpen(true);
  };

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-cyber-card/20">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Loading petitions...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-cyber-card/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-magenta to-neon-purple bg-clip-text text-transparent">
            Active Petitions
          </h2>
          <p className="text-muted-foreground text-lg">
            Blockchain-secured petitions for transparent advocacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {petitions.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">
                No active petitions. Create one to get started!
              </p>
            </div>
          ) : (
            petitions.map((petition, index) => (
              <PetitionCard
                key={petition.id}
                petition={petition}
                index={index}
                onSign={() => openSignDialog(petition.id)}
                timeLeft={calculateTimeLeft(petition.end_time)}
              />
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-neon-magenta to-neon-purple text-cyber-dark hover:opacity-90 glow-magenta"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Petition
          </Button>
        </div>

        <CreateEventModal
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          eventType="petition"
          onSuccess={refetch}
        />

        <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
          <DialogContent className="bg-card border-neon-magenta">
            <DialogHeader>
              <DialogTitle>Sign Petition</DialogTitle>
              <DialogDescription>Add your signature to support this petition</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add your thoughts..."
                  value={signComment}
                  onChange={(e) => setSignComment(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSignPetition}
                className="w-full bg-neon-magenta text-cyber-dark hover:bg-neon-magenta/90"
              >
                Sign Petition
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

const PetitionCard = ({
  petition,
  index,
  onSign,
  timeLeft,
}: {
  petition: any;
  index: number;
  onSign: () => void;
  timeLeft: string;
}) => {
  const borderColor = index % 2 === 0 ? "border-neon-purple" : "border-neon-magenta";
  const glowClass = index % 2 === 0 ? "glow-purple" : "glow-magenta";
  const progress = (petition.current_signatures / petition.target_signatures) * 100;

  return (
    <Card
      className={`bg-card border-2 ${borderColor} ${glowClass} p-6 hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Blockchain Petition</p>
            <h3 className="text-2xl font-bold text-foreground">{petition.title}</h3>
          </div>
          <span className="px-3 py-1 bg-neon-magenta/20 border border-neon-magenta rounded-full text-neon-magenta text-sm font-semibold">
            {petition.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{petition.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-semibold">
              {petition.current_signatures} / {petition.target_signatures}
            </span>
          </div>
          <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-magenta to-neon-purple rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2">
          <StatItem
            icon={<Users className="w-5 h-5" />}
            label="Signatures"
            value={petition.current_signatures.toString()}
          />
          <StatItem icon={<Clock className="w-5 h-5" />} label="Time Left" value={timeLeft} />
        </div>

        {petition.blockchain_hash && (
          <div className="bg-cyber-dark/50 rounded-lg p-4 border border-neon-purple/30">
            <p className="text-sm text-muted-foreground mb-2">Blockchain Hash</p>
            <p className="text-foreground font-mono text-xs truncate">
              {petition.blockchain_hash}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onSign}
            className="flex-1 bg-neon-magenta text-cyber-dark hover:bg-neon-magenta/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            Sign Petition
          </Button>
        </div>
      </div>
    </Card>
  );
};

const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="text-neon-magenta">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

export default PetitionDashboard;
