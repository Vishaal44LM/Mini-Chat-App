import { useState, useCallback } from "react";
import { ChatDisplay } from "@/components/ChatDisplay";
import { MessageControls } from "@/components/MessageControls";  
import { ConsoleLog } from "@/components/ConsoleLog";
import { DeletedMessagesPanel } from "@/components/DeletedMessagesPanel";
import { ChatMembers, ChatMember } from "@/components/ChatMembers";
import { Message } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [deletedStack, setDeletedStack] = useState<Message[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<{ message: string; type: "success" | "info" | "warning" }[]>([]);
  const { toast } = useToast();

  // Chat Members
  const [members] = useState<ChatMember[]>([
    { id: "1", name: "Akash", status: "online", unreadCount: 0 },
    { id: "2", name: "Vishaal", status: "online", unreadCount: 0 },
    { id: "3", name: "Ulaganathan", status: "online", unreadCount: 0 },
  ]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("1");

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
      <div className="container mx-auto p-2 sm:p-4 h-screen flex flex-col gap-2 sm:gap-4 max-w-7xl">
        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-4 gap-2 sm:gap-4 min-h-0">
          {/* Chat Members - Desktop: Left, Mobile: Top */}
          <div className="h-32 sm:h-40 lg:h-auto lg:min-h-0 order-1 lg:order-1">
            <ChatMembers
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
            />
          </div>
          
          {/* Chat Display - Main Panel */}
          <div className="flex-1 lg:col-span-2 min-h-0 order-2 lg:order-2">
            <ChatDisplay
              messages={messages}
              onDeleteMessage={deleteMessage}
              selectedMessageId={selectedMessageId}
              onSelectMessage={setSelectedMessageId}
            />
          </div>

          {/* Message Controls & Deleted Messages - Mobile: Stack vertically, Desktop: Right column */}
          <div className="flex flex-col gap-2 lg:min-h-0 order-3 lg:order-3">
            {/* Message Controls */}
            <div className="min-h-[300px] sm:min-h-[350px] lg:min-h-0 lg:flex-1">
              <MessageControls
                onSendMessage={sendMessage}
                onReceiveMessage={receiveMessage}
                onDeleteSelected={handleDeleteSelected}
                onUndoDelete={undoDelete}
                selectedMessageId={selectedMessageId}
                canUndo={deletedStack.length > 0}
              />
            </div>

            {/* Deleted Messages Panel - Always visible but compact on mobile */}
            <div className="lg:flex-1">
              <div className="lg:hidden">
                {/* Mobile Compact Version */}
                <div className="bg-chat-panel rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-foreground">Deleted ({deletedStack.length})</h3>
                    {deletedStack.length > 0 && (
                      <button
                        onClick={undoDelete}
                        className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded hover:bg-accent/80 transition-colors"
                      >
                        Undo Last
                      </button>
                    )}
                  </div>
                  {deletedStack.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No deleted messages</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Last: "{deletedStack[0]?.text?.substring(0, 30)}{deletedStack[0]?.text?.length > 30 ? '...' : ''}"
                    </p>
                  )}
                </div>
              </div>
              
              {/* Desktop Full Version */}
              <div className="hidden lg:block h-full">
                <DeletedMessagesPanel
                  deletedMessages={deletedStack}
                  onUndoDelete={undoDelete}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Console Log - Bottom */}
        <div className="h-16 sm:h-24 flex-shrink-0">
          <ConsoleLog logs={consoleLogs} />
        </div>
      </div>
    </div>
  );
};

export default Index;