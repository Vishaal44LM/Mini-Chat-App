import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage, Message } from "./ChatMessage";

interface ChatDisplayProps {
  messages: Message[];
  onDeleteMessage: (id: string) => void;
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
}

export const ChatDisplay = ({ 
  messages, 
  onDeleteMessage, 
  selectedMessageId, 
  onSelectMessage 
}: ChatDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Sort messages by priority (urgent first) and then by timestamp
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.type === "urgent" && b.type === "normal") return -1;
    if (a.type === "normal" && b.type === "urgent") return 1;
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  return (
    <Card className="bg-chat-panel border-border h-full flex flex-col">
      <CardHeader className="bg-chat-header border-b border-border flex-shrink-0">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          Mini Chat App
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {messages.length} messages • Click to select, hover to delete
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto chat-scrollbar p-4 space-y-2"
        >
          {sortedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Send a message to get started!</p>
              </div>
            </div>
          ) : (
            sortedMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onDelete={onDeleteMessage}
                isSelected={selectedMessageId === message.id}
                onSelect={onSelectMessage}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);