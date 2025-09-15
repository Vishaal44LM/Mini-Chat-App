import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  text: string;
  type: "normal" | "urgent";
  timestamp: Date;
  isDeleted?: boolean;
  status: "sent" | "received" | "deleted";
}

interface ChatMessageProps {
  message: Message;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const ChatMessage = ({ message, onDelete, isSelected, onSelect }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  return (
    <div 
      className={cn(
        "message-enter flex flex-col mb-2 cursor-pointer transition-all duration-200",
        message.isDeleted && "message-deleted"
      )}
      onClick={() => onSelect?.(message.id)}
    >
      <div
        className={cn(
          "max-w-xs p-3 rounded-lg shadow-sm",
          "ml-auto relative group",
          message.type === "urgent" 
            ? "bg-message-urgent text-white" 
            : "bg-message-normal text-white",
          isSelected && "ring-2 ring-primary ring-opacity-50",
          message.isDeleted && "opacity-50"
        )}
      >
        <div className="flex items-start gap-2">
          <p className="text-sm leading-relaxed break-words flex-1">
            {message.text}
          </p>
          {message.type === "urgent" && (
            <span className="text-xs">🔥</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-xs opacity-75">
            {formatTime(message.timestamp)}
          </span>
          <div className="flex items-center gap-1">
            {message.type === "urgent" && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white">
                Urgent
              </span>
            )}
            <span className="text-xs opacity-75">
              {message.status === "sent" && "✔"}
              {message.status === "received" && "✔✔"}
              {message.status === "deleted" && "🗑"}
            </span>
          </div>
        </div>
        
        {/* Delete button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(message.id);
          }}
          className="absolute -top-2 -left-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/80"
        >
          ×
        </button>
      </div>
    </div>
  );
};