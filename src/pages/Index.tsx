import { useState, useCallback } from "react";
import { ChatDisplay } from "@/components/ChatDisplay";
import { MessageControls } from "@/components/MessageControls";  
import { ConsoleLog } from "@/components/ConsoleLog";
import { Message } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [deletedStack, setDeletedStack] = useState<Message[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // Simulate C backend function: enqueue message with priority
  const sendMessage = useCallback((text: string, type: "normal" | "urgent") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
      isDeleted: false,
    };
    
    setMessages(prev => [...prev, newMessage]);
    addLog(`Message enqueued: "${text}" (${type})`);
    
    toast({
      title: "Message Sent",
      description: `${type === "urgent" ? "Urgent" : "Normal"} message added to queue`,
    });
  }, [addLog, toast]);

  // Simulate C backend function: dequeue message with priority (urgent first)
  const receiveMessage = useCallback(() => {
    const availableMessages = messages.filter(m => !m.isDeleted);
    
    if (availableMessages.length === 0) {
      addLog("No messages to receive");
      toast({
        title: "No Messages",
        description: "Queue is empty",
        variant: "destructive",
      });
      return;
    }

    // Priority dequeue: urgent messages first, then normal by timestamp
    const sortedMessages = [...availableMessages].sort((a, b) => {
      if (a.type === "urgent" && b.type === "normal") return -1;
      if (a.type === "normal" && b.type === "urgent") return 1;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    const messageToReceive = sortedMessages[0];
    addLog(`Message dequeued: "${messageToReceive.text}" (${messageToReceive.type})`);
    
    toast({
      title: "Message Received",
      description: `Received: "${messageToReceive.text}"`,
    });
  }, [messages, addLog, toast]);

  // Simulate C backend function: push message to stack for deletion
  const deleteMessage = useCallback((id: string) => {
    const messageToDelete = messages.find(m => m.id === id);
    if (!messageToDelete) return;

    setMessages(prev => 
      prev.map(m => m.id === id ? { ...m, isDeleted: true } : m)
    );
    
    setDeletedStack(prev => [messageToDelete, ...prev]);
    addLog(`Message deleted and pushed to stack: "${messageToDelete.text}"`);
    
    toast({
      title: "Message Deleted",
      description: "Message moved to undo stack",
    });
  }, [messages, addLog, toast]);

  // Simulate C backend function: pop message from stack to restore
  const undoDelete = useCallback(() => {
    if (deletedStack.length === 0) {
      addLog("No messages to restore");
      toast({
        title: "No Undo Available",
        description: "Undo stack is empty",
        variant: "destructive",
      });
      return;
    }

    const messageToRestore = deletedStack[0];
    setMessages(prev => 
      prev.map(m => m.id === messageToRestore.id ? { ...m, isDeleted: false } : m)
    );
    
    setDeletedStack(prev => prev.slice(1));
    addLog(`Message restored from stack: "${messageToRestore.text}"`);
    
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Chat Display - Left Panel */}
          <div className="lg:col-span-2 min-h-0">
            <ChatDisplay
              messages={messages}
              onDeleteMessage={deleteMessage}
              selectedMessageId={selectedMessageId}
              onSelectMessage={setSelectedMessageId}
            />
          </div>

          {/* Message Controls - Right Panel */}
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