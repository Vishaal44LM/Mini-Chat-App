import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Message } from "./ChatMessage";
import { Trash2, Undo2 } from "lucide-react";

interface DeletedMessagesPanelProps {
  deletedMessages: Message[];
  onUndoDelete: () => void;
}

export const DeletedMessagesPanel = ({ deletedMessages, onUndoDelete }: DeletedMessagesPanelProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  return (
    <Card className="bg-chat-panel border-border h-full flex flex-col">
      <CardHeader className="bg-chat-header border-b border-border flex-shrink-0 pb-3">
        <CardTitle className="text-sm text-foreground flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Deleted Messages
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {deletedMessages.length} deleted
          </p>
          <Button
            onClick={onUndoDelete}
            disabled={deletedMessages.length === 0}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs border-border text-foreground hover:bg-accent"
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Undo
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-3 overflow-hidden">
        <div className="h-full overflow-y-auto chat-scrollbar space-y-2">
          {deletedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No deleted messages</p>
              </div>
            </div>
          ) : (
            deletedMessages.map((message, index) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg border border-border bg-message-deleted/20 ${
                  index === 0 ? "ring-1 ring-destructive/30" : ""
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <p className="text-xs text-muted-foreground flex-1 leading-relaxed break-words">
                    {message.text}
                  </p>
                  {message.type === "urgent" && (
                    <span className="text-xs">🔥</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                  <span>{formatTime(message.timestamp)}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    message.type === "urgent" 
                      ? "bg-message-urgent/20 text-urgent-foreground/80" 
                      : "bg-message-normal/20 text-primary-foreground/80"
                  }`}>
                    {message.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};