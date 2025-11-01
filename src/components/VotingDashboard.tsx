import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, Users, Clock, CheckCircle2, Plus } from "lucide-react";
import { useVoting } from "@/hooks/useVoting";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const VotingDashboard = () => {
  const { events, loading, createEvent, castVote } = useVoting();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: "",
    start_time: "",
    end_time: "",
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const optionsArray = formData.options.split(",").map((opt) => opt.trim());
      await createEvent({
        ...formData,
        options: optionsArray,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        options: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleVote = async (option: string) => {
    try {
      await castVote(selectedEventId, option);
      setIsVoteDialogOpen(false);
    } catch (error) {
      console.error("Failed to cast vote:", error);
    }
  };

  const openVoteDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsVoteDialogOpen(true);
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
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Loading voting events...</p>
        </div>
      </section>
    );
  }

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
          {events.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">No active voting events. Create one to get started!</p>
            </div>
          ) : (
            events.map((event, index) => (
              <VotingCard
                key={event.id}
                event={event}
                index={index}
                onVote={() => openVoteDialog(event.id)}
                timeLeft={calculateTimeLeft(event.end_time)}
              />
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-neon-cyan to-neon-purple text-cyber-dark hover:opacity-90 glow-cyan"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Voting Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-neon-cyan">
              <DialogHeader>
                <DialogTitle>Create Voting Event</DialogTitle>
                <DialogDescription>Create a new blockchain-based voting event</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="options">Options (comma-separated)</Label>
                  <Input
                    id="options"
                    placeholder="Yes, No, Abstain"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Event
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
          <DialogContent className="bg-card border-neon-cyan">
            <DialogHeader>
              <DialogTitle>Cast Your Vote</DialogTitle>
              <DialogDescription>Select your voting option</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {events
                .find((e) => e.id === selectedEventId)
                ?.options?.map((option: string) => (
                  <Button
                    key={option}
                    onClick={() => handleVote(option)}
                    className="w-full bg-neon-cyan text-cyber-dark hover:bg-neon-cyan/90"
                  >
                    {option}
                  </Button>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

const VotingCard = ({
  event,
  index,
  onVote,
  timeLeft,
}: {
  event: any;
  index: number;
  onVote: () => void;
  timeLeft: string;
}) => {
  const borderColor = index % 2 === 0 ? "border-neon-magenta" : "border-neon-cyan";
  const glowClass = index % 2 === 0 ? "glow-magenta" : "glow-cyan";

  return (
    <Card
      className={`bg-card border-2 ${borderColor} ${glowClass} p-6 hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Blockchain Voting Event</p>
            <h3 className="text-2xl font-bold text-foreground">{event.title}</h3>
          </div>
          <span className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan rounded-full text-neon-cyan text-sm font-semibold">
            {event.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <StatItem
            icon={<Users className="w-5 h-5" />}
            label="Total Votes"
            value={event.total_votes.toString()}
          />
          <StatItem icon={<Clock className="w-5 h-5" />} label="Time Left" value={timeLeft} />
        </div>

        {event.blockchain_hash && (
          <div className="bg-cyber-dark/50 rounded-lg p-4 border border-neon-purple/30">
            <p className="text-sm text-muted-foreground mb-2">Blockchain Hash</p>
            <p className="text-foreground font-mono text-xs truncate">
              {event.blockchain_hash}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onVote}
            className="flex-1 bg-neon-cyan text-cyber-dark hover:bg-neon-cyan/90"
          >
            <Vote className="w-4 h-4 mr-2" />
            Vote Now
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
