import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { MessageCircle, X, Send } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your BlockTrust AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: assistantContent };
                return newMsgs;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-primary shadow-lg z-50"
      >
        <MessageCircle className="w-8 h-8" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Card className="w-96 h-[500px] flex flex-col border-cyber-primary/30 bg-cyber-dark/90 backdrop-blur-sm">
        <div className="p-4 border-b border-cyber-primary/30 flex justify-between items-center">
          <h3 className="font-semibold text-neon-cyan">BlockTrust AI Assistant</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-gradient-primary text-white"
                      : "bg-cyber-primary/20 text-foreground border border-cyber-primary/30"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-cyber-primary/20 text-foreground border border-cyber-primary/30">
                  <div className="flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-100">●</span>
                    <span className="animate-pulse delay-200">●</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-cyber-primary/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder="Ask about voting, petitions, or security..."
              className="bg-background/50 border-cyber-primary/30 focus:border-neon-cyan"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading} className="bg-gradient-primary">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AIChatbot;
