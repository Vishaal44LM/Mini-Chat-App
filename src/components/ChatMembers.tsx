import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

export interface ChatMember {
  id: string;
  name: string;
  status: "online" | "offline";
  unreadCount: number;
}

interface ChatMembersProps {
  members: ChatMember[];
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
}

export const ChatMembers = ({ members, selectedMemberId, onSelectMember }: ChatMembersProps) => {
  return (
    <Card className="bg-chat-panel border-border h-full">
      <CardHeader className="bg-chat-header border-b border-border">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <User className="w-5 h-5" />
          Chat Members
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`p-3 cursor-pointer transition-colors border-b border-border/50 hover:bg-accent/50 ${
                selectedMemberId === member.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-chat-panel ${
                    member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </p>
                    {member.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs min-w-5 h-5">
                        {member.unreadCount > 99 ? '99+' : member.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};