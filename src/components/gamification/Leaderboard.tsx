import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardProps {
  leaderboard: any[];
  currentUserPoints?: number;
}

export function Leaderboard({ leaderboard, currentUserPoints = 0 }: LeaderboardProps) {
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-600 dark:text-yellow-400";
      case 2: return "text-gray-600 dark:text-gray-400";
      case 3: return "text-orange-600 dark:text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🏆</span>
          <span>Community Leaderboard</span>
        </CardTitle>
        <CardDescription>
          Top water conservation champions in your community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${getRankColor(index + 1)}`}>
                    {getRankEmoji(index + 1)}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {user.profiles?.full_name || 'Anonymous User'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>💧 {user.total_points} points</span>
                      <span>•</span>
                      <span>🔥 {user.current_streak} day streak</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  {user.total_liters_saved > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(Number(user.total_liters_saved))}L saved
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-2">👥</span>
              <p>Be the first to appear on the leaderboard!</p>
            </div>
          )}
        </div>

        {/* User's rank if not in top 10 */}
        {currentUserPoints > 0 && !leaderboard.some(user => user.total_points === currentUserPoints) && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👤</div>
                <div>
                  <p className="font-semibold">Your Rank</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>💧 {currentUserPoints} points</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">
                  #--
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep conserving to climb!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}