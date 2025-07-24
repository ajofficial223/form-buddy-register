import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Bot, User, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const Chatbot = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '🤖 Hello! I\'m your AI Buddy. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (text: string) => {
    // Enhanced formatting for better readability
    return text
      .replace(/\n\n/g, '\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(.*?)```/gs, '<code class="block bg-muted/50 p-2 rounded text-xs font-mono">$1</code>')
      .replace(/`(.*?)`/g, '<code class="bg-muted/50 px-1 rounded text-xs font-mono">$1</code>');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery("");

    try {
      // Create URL with query parameters for GET request
      const params = new URLSearchParams({
        query: query,
        uniqueId: "STUDEMO1"
      });
      
      const response = await fetch(`https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN?${params}`, {
        method: "GET"
      });

      if (response.ok) {
        const responseText = await response.text();
        
        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: responseText,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI Buddy. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">AI Buddy Chat</h1>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Messages */}
        <Card className="flex-1 mb-4 bg-card/95 backdrop-blur-sm border-0 shadow-elegant">
          <CardContent className="p-0 h-[500px] overflow-y-auto">
            <div className="p-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-4 animate-fade-in opacity-0",
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                  style={{
                    animation: `fade-in 0.5s ease-out ${index * 0.1}s forwards`
                  }}
                >
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110",
                    message.type === 'user' 
                      ? 'bg-gradient-primary text-white shadow-primary/25' 
                      : 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-secondary/25'
                  )}>
                    {message.type === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 max-w-[75%] transition-all duration-300",
                    message.type === 'user' ? 'text-right' : 'text-left'
                  )}>
                    <div className={cn(
                      "inline-block p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl",
                      message.type === 'user'
                        ? 'bg-gradient-primary text-white rounded-br-md shadow-primary/20'
                        : 'bg-card border border-border/50 text-foreground rounded-bl-md hover:bg-card/80'
                    )}>
                      {message.type === 'bot' ? (
                        <div 
                          className="text-sm leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatResponse(message.content) }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 mt-2 text-xs text-muted-foreground",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.type === 'bot' && (
                        <Sparkles className="h-3 w-3 text-primary/60" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-4 rounded-2xl rounded-bl-md bg-card border border-border/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input Form */}
        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-form">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;