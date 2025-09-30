import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ConservationTip } from "@/hooks/use-conservation-tips";

interface ConservationTipsProps {
  currentTip: ConservationTip | null;
  onRotate: () => void;
}

export function ConservationTips({ currentTip, onRotate }: ConservationTipsProps) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💡</span>
            <div>
              <CardTitle>Conservation Tip</CardTitle>
              <CardDescription>Daily tips to help save water</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {currentTip ? (
          <div className="space-y-2">
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              {currentTip.title}
            </h4>
            <p className="text-green-700 dark:text-green-300">
              {currentTip.content}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <span className="text-4xl block mb-2">🌱</span>
            <p>Loading conservation tips...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}