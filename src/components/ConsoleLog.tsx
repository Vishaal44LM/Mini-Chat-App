import { Card, CardContent } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface ConsoleLogProps {
  logs: { message: string; type: "success" | "info" | "warning" }[];
}

export const ConsoleLog = ({ logs }: ConsoleLogProps) => {
  return (
    <Card className="bg-chat-panel border-border">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Console Log</h3>
        </div>
        <div className="bg-background/50 rounded-md p-2 max-h-20 overflow-y-auto chat-scrollbar">
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent activity</p>
          ) : (
            logs.slice(-3).map((log, index) => (
              <p key={index} className={`text-xs font-mono ${
                log.type === "success" ? "text-primary" :
                log.type === "warning" ? "text-destructive" :
                "text-muted-foreground"
              }`}>
                {log.message}
              </p>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};