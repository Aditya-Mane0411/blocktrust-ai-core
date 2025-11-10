import { Navigation } from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import VotingDashboard from "@/components/VotingDashboard";
import PetitionDashboard from "@/components/PetitionDashboard";
import BlockchainStatus from "@/components/BlockchainStatus";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
