import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Trash2, Undo2 } from "lucide-react";

interface MessageControlsProps {
  onSendMessage: (text: string, type: "normal" | "urgent") => void;
  onReceiveMessage: () => void;
  onDeleteSelected: () => void;
  onUndoDelete: () => void;
  selectedMessageId: string | null;
  canUndo: boolean;
}

export const MessageControls = ({
  onSendMessage,
  onReceiveMessage,
  onDeleteSelected,
  onUndoDelete,
  selectedMessageId,
  canUndo,
}: MessageControlsProps) => {
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<"normal" | "urgent">("normal");

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim(), messageType);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-chat-panel border-border h-full">
      <CardHeader className="bg-chat-header border-b border-border">
        <CardTitle className="text-lg text-foreground">Message Controls</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Message Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Enter Message
            </label>
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Message Type
            </label>
            <Select value={messageType} onValueChange={(value: "normal" | "urgent") => setMessageType(value)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="normal" className="text-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-message-normal"></div>
                    Normal
                  </div>
                </SelectItem>
                <SelectItem value="urgent" className="text-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-message-urgent"></div>
                    Urgent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          
          <Button 
            onClick={onReceiveMessage}
            variant="secondary"
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Receive Message
          </Button>
          
          <Button 
            onClick={onDeleteSelected}
            disabled={!selectedMessageId}
            variant="destructive"
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
          
          <Button 
            onClick={onUndoDelete}
            disabled={!canUndo}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-accent"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};