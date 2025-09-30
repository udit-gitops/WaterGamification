import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserRewards, UserBadge, Badge as BadgeType } from "@/hooks/use-gamification";

interface RewardsSectionProps {
  userRewards: UserRewards | null;
  userBadges: UserBadge[];
  availableBadges: BadgeType[];
}

export function RewardsSection({ userRewards, userBadges, availableBadges }: RewardsSectionProps) {
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
  const nextBadge = availableBadges.find(badge => 
    !earnedBadgeIds.includes(badge.id) && 
    badge.requirement_points && 
    userRewards &&
    badge.requirement_points > userRewards.total_points
  );

  const getProgressToNextBadge = () => {
    if (!nextBadge || !userRewards) return 0;
    if (!nextBadge.requirement_points) return 0;
    return (userRewards.total_points / nextBadge.requirement_points) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Points and Streak Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center space-x-2">
              <span className="text-2xl">💧</span>
              <span>Total Points</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {userRewards?.total_points || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Points earned from conservation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span>Current Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {userRewards?.current_streak || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Days of conservation goals met
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center space-x-2">
              <span className="text-2xl">🌊</span>
              <span>Water Saved</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Math.round(Number(userRewards?.total_liters_saved || 0))}L
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total liters conserved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🏆</span>
            <span>Your Badges</span>
          </CardTitle>
          <CardDescription>
            Achievements you've unlocked through conservation efforts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userBadges.map((userBadge) => (
                <div key={userBadge.id} className="text-center space-y-2">
                  <div className="text-4xl">{userBadge.badges.icon}</div>
                  <div className="space-y-1">
                    <Badge variant="outline">
                      {userBadge.badges.name}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {userBadge.badges.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-2">🎯</span>
              <p>Start conserving water to earn your first badge!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Badge Progress */}
      {nextBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Next Badge</span>
            </CardTitle>
            <CardDescription>
              Progress towards your next achievement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{nextBadge.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold">{nextBadge.name}</h4>
                  <p className="text-sm text-muted-foreground">{nextBadge.description}</p>
                </div>
              </div>
              {nextBadge.requirement_points && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{userRewards?.total_points || 0} / {nextBadge.requirement_points} points</span>
                    <span>{Math.round(getProgressToNextBadge())}%</span>
                  </div>
                  <Progress value={getProgressToNextBadge()} className="h-3" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}