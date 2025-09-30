import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";
import { useGamification } from "@/hooks/use-gamification";
import { useConservationTips } from "@/hooks/use-conservation-tips";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Waves, Award, Users, Lightbulb, Settings } from "lucide-react";
import { HouseholdSetup } from "@/components/gamification/HouseholdSetup";
import { UsageTracker } from "@/components/gamification/UsageTracker";
import { SimpleChart } from "@/components/gamification/SimpleChart";
import { RewardsSection } from "@/components/gamification/RewardsSection";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { ConservationTips } from "@/components/gamification/ConservationTips";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { household, dailyUsage, loading: householdLoading, createHousehold, updateDailyUsage } = useHousehold();
  const { userRewards, userBadges, availableBadges, leaderboard, loading: gamificationLoading, updatePoints, updateStreak } = useGamification();
  const { currentTip, rotateTip } = useConservationTips();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleUsageUpdate = async (liters: number) => {
    const result = await updateDailyUsage(liters);
    if (result && !result.error) {
      // Calculate points based on conservation (target - actual usage)
      const todayUsage = dailyUsage.find(usage => 
        usage.date === new Date().toISOString().split('T')[0]
      );
      const target = Number(todayUsage?.target_liters || 250);
      
      if (liters <= target) {
        const litersSaved = Math.max(0, target - liters);
        const points = Math.round(litersSaved * 0.1); // 0.1 points per liter saved
        
        if (points > 0) {
          await updatePoints(points, litersSaved);
        }
        
        // Update streak if target was met
        await updateStreak((userRewards?.current_streak || 0) + 1);
      }
    }
    return result;
  };

  if (authLoading || householdLoading || gamificationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background">
        <div className="flex items-center space-x-2">
          <Droplets className="h-8 w-8 animate-pulse text-primary" />
          <span className="text-lg font-medium text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Show household setup if no household exists
  if (!household) {
    return <HouseholdSetup onSetup={createHousehold} loading={householdLoading} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Waves className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Conservation Gamification
              </h1>
              <p className="text-sm text-muted-foreground">{household.household_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-medium">{user.user_metadata?.full_name || user.email}</div>
              <div className="text-muted-foreground flex items-center space-x-1">
                <span>💧</span>
                <span>{userRewards?.total_points || 0} pts</span>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Conservation Tip Banner */}
        <div className="mb-6">
          <ConservationTips currentTip={currentTip} onRotate={rotateTip} />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <UsageTracker 
              dailyUsage={dailyUsage} 
              onUpdateUsage={handleUsageUpdate}
            />
            <SimpleChart data={dailyUsage} />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <RewardsSection 
              userRewards={userRewards}
              userBadges={userBadges}
              availableBadges={availableBadges}
            />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Leaderboard 
              leaderboard={leaderboard}
              currentUserPoints={userRewards?.total_points}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SimpleChart data={dailyUsage} />
              <div className="space-y-4">
                {/* Global Water Waste Stats */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg p-6 border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    🌍 Global Water Crisis
                  </h3>
                  <div className="space-y-2 text-red-700 dark:text-red-300">
                    <p><strong>2 billion</strong> people lack access to safely managed drinking water</p>
                    <p><strong>3.6 billion</strong> people lack access to safely managed sanitation</p>
                    <p><strong>80%</strong> of wastewater flows back into the ecosystem untreated</p>
                  </div>
                </div>

                {/* Your Impact */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    🌱 Your Conservation Impact
                  </h3>
                  <div className="space-y-2 text-green-700 dark:text-green-300">
                    <p><strong>{Math.round(Number(userRewards?.total_liters_saved || 0))}L</strong> water saved this month</p>
                    <p><strong>{userRewards?.current_streak || 0}</strong> day conservation streak</p>
                    <p>Equivalent to <strong>{Math.round((userRewards?.total_liters_saved || 0) / 8)}</strong> minutes of shower time saved</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
