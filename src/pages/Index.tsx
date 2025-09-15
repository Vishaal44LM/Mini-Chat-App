import { useState, useCallback } from "react";
import { ChatDisplay } from "@/components/ChatDisplay";
import { MessageControls } from "@/components/MessageControls";  
import { ConsoleLog } from "@/components/ConsoleLog";
import { DeletedMessagesPanel } from "@/components/DeletedMessagesPanel";
import { Message } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [deletedStack, setDeletedStack] = useState<Message[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<{ message: string; type: "success" | "info" | "warning" }[]>([]);
  const { toast } = useToast();

  const addLog = useCallback((message: string, type: "success" | "info" | "warning" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { message: `[${timestamp}] ${message}`, type }]);
  }, []);

  // Message queue for unsent messages
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);

  // Simulate C backend function: enqueue message with priority
  const sendMessage = useCallback((text: string, type: "normal" | "urgent") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
      isDeleted: false,
      status: "sent",
    };
    
    setMessageQueue(prev => [...prev, newMessage]);
    addLog(`✅ ${type === "urgent" ? "Urgent" : "Normal"} message queued: "${text}"`, "success");
    
    toast({
      title: "Message Sent",
      description: `${type === "urgent" ? "Urgent" : "Normal"} message added to queue`,
    });
  }, [addLog, toast]);

  // Simulate C backend function: dequeue message with priority (urgent first)
  const receiveMessage = useCallback(() => {
    if (messageQueue.length === 0) {
      addLog("❌ No messages to receive", "warning");
      toast({
        title: "No Messages",
        description: "Queue is empty",
        variant: "destructive",
      });
      return;
    }

    // Priority dequeue: urgent messages first, then normal by timestamp
    const sortedQueue = [...messageQueue].sort((a, b) => {
      if (a.type === "urgent" && b.type === "normal") return -1;
      if (a.type === "normal" && b.type === "urgent") return 1;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    const messageToReceive = sortedQueue[0];
    
    // Remove from queue and add to chat with received status
    setMessageQueue(prev => prev.filter(m => m.id !== messageToReceive.id));
    setMessages(prev => [...prev, { ...messageToReceive, status: "received" as const }]);
    
    addLog(`✅ ${messageToReceive.type === "urgent" ? "Urgent message received first" : "Message received"}: "${messageToReceive.text}"`, "success");
    
    toast({
      title: "Message Received",
      description: `Received: "${messageToReceive.text}"`,
    });
  }, [messageQueue, addLog, toast]);

  // Simulate C backend function: push message to stack for deletion
  const deleteMessage = useCallback((id: string) => {
    const messageToDelete = messages.find(m => m.id === id);
    if (!messageToDelete) return;

    setMessages(prev => 
      prev.map(m => m.id === id ? { ...m, isDeleted: true, status: "deleted" as const } : m)
    );
    
    setDeletedStack(prev => [messageToDelete, ...prev]);
    addLog(`🗑 Message deleted and stored for undo: "${messageToDelete.text}"`, "warning");
    
    toast({
      title: "Message Deleted",
      description: "Message moved to undo stack",
    });
  }, [messages, addLog, toast]);

  // Simulate C backend function: pop message from stack to restore
  const undoDelete = useCallback(() => {
    if (deletedStack.length === 0) {
      addLog("❌ No messages to restore", "warning");
      toast({
        title: "No Undo Available",
        description: "Undo stack is empty",
        variant: "destructive",
      });
      return;
    }

    const messageToRestore = deletedStack[0];
    setMessages(prev => 
      prev.map(m => m.id === messageToRestore.id ? { ...m, isDeleted: false, status: "sent" as const } : m)
    );
    
    setDeletedStack(prev => prev.slice(1));
    addLog(`🔄 Undo performed → message restored: "${messageToRestore.text}"`, "success");
    
    toast({
      title: "Message Restored",
      description: `Restored: "${messageToRestore.text}"`,
    });
  }, [deletedStack, addLog, toast]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedMessageId) {
      deleteMessage(selectedMessageId);
      setSelectedMessageId(null);
    }
  }, [selectedMessageId, deleteMessage]);

  return (
    <div className="min-h-screen bg-chat-bg">
      <div className="container mx-auto p-4 h-screen flex flex-col gap-4">
        {/* Main Chat Interface */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Chat Display - Left Panel */}
          <div className="lg:col-span-2 min-h-0">
            <ChatDisplay
              messages={messages}
              onDeleteMessage={deleteMessage}
              selectedMessageId={selectedMessageId}
              onSelectMessage={setSelectedMessageId}
            />
          </div>

          {/* Message Controls - Center Panel */}
          <div className="min-h-0">
            <MessageControls
              onSendMessage={sendMessage}
              onReceiveMessage={receiveMessage}
              onDeleteSelected={handleDeleteSelected}
              onUndoDelete={undoDelete}
              selectedMessageId={selectedMessageId}
              canUndo={deletedStack.length > 0}
            />
          </div>

          {/* Deleted Messages Panel - Right Panel */}
          <div className="min-h-0">
            <DeletedMessagesPanel
              deletedMessages={deletedStack}
              onUndoDelete={undoDelete}
            />
          </div>
        </div>

        {/* Console Log - Bottom */}
        <div className="h-24 flex-shrink-0">
          <ConsoleLog logs={consoleLogs} />
        </div>
      </div>
    </div>
  );
};

export default Index;