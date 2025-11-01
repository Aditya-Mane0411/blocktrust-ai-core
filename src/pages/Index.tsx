import Hero from "@/components/Hero";
import VotingDashboard from "@/components/VotingDashboard";
import PetitionDashboard from "@/components/PetitionDashboard";
import BlockchainStatus from "@/components/BlockchainStatus";
import Features from "@/components/Features";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <VotingDashboard />
      <PetitionDashboard />
      <BlockchainStatus />
      <Features />
      <AIChatbot />
      <Footer />
    </div>
  );
};

export default Index;
