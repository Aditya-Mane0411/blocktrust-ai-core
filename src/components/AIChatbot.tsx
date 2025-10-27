import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Initiating secure connection... Analyzing smart contract. How can I assist you with BlockTrust AI today?"
    }
  ]);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple text-cyber-dark hover:scale-110 transition-transform shadow-lg glow-cyan z-50"
        >
          <MessageSquare className="w-8 h-8" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-8 right-8 w-96 h-[500px] bg-card border-2 border-neon-cyan glow-cyan flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-neon-cyan to-neon-purple p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-cyber-dark flex items-center justify-center border-2 border-neon-magenta">
                  <div className="w-8 h-8 rounded-full border-2 border-neon-magenta animate-pulse">
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      <path
                        d="M20 5 L10 20 L20 15 L30 20 Z M10 20 L20 35 L30 20 L20 25 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-neon-magenta"
                      />
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-cyan rounded-full border-2 border-cyber-dark animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-cyber-dark">AI Chatbot</h3>
                <p className="text-xs text-cyber-dark/70">Online • Secure</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-cyber-dark hover:bg-cyber-dark/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cyber-dark/30">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-neon-cyan text-cyber-dark'
                      : 'bg-card border border-neon-purple text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about voting, security, contracts..."
                className="flex-1 bg-cyber-dark border-neon-purple focus:border-neon-cyan"
              />
              <Button className="bg-neon-cyan text-cyber-dark hover:bg-neon-cyan/90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
