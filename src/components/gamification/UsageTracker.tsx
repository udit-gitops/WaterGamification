import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Droplets, Target, TrendingDown, TrendingUp } from "lucide-react";
import { DailyUsage } from "@/hooks/use-household";

interface UsageTrackerProps {
  dailyUsage: DailyUsage[];
  onUpdateUsage: (liters: number) => Promise<any>;
  loading?: boolean;
}

export function UsageTracker({ dailyUsage, onUpdateUsage, loading }: UsageTrackerProps) {
  const [newUsage, setNewUsage] = useState('');
  
  const todayUsage = dailyUsage.find(usage => 
    usage.date === new Date().toISOString().split('T')[0]
  );
  
  const yesterdayUsage = dailyUsage.find(usage => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return usage.date === yesterday.toISOString().split('T')[0];
  });

  const currentUsage = Number(todayUsage?.liters_used || 0);
  const targetUsage = Number(todayUsage?.target_liters || 250);
  const usagePercentage = (currentUsage / targetUsage) * 100;
  
  const yesterdayAmount = Number(yesterdayUsage?.liters_used || 0);
  const comparison = yesterdayAmount > 0 ? currentUsage - yesterdayAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newUsage);
    if (isNaN(amount) || amount < 0) return;
    
    await onUpdateUsage(amount);
    setNewUsage('');
  };

  return (
    <div className="space-y-6">
      {/* Today's Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-primary" />
            <span>Today's Water Usage</span>
          </CardTitle>
          <CardDescription>
            Track your daily water consumption and conservation goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-primary">
                    {currentUsage}L
                  </span>
                  <span className="text-muted-foreground">/ {targetUsage}L</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {comparison !== 0 && (
                    <>
                      {comparison > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">+{Math.abs(comparison)}L vs yesterday</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">-{Math.abs(comparison)}L vs yesterday</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${
                  usagePercentage <= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {Math.round(usagePercentage)}%
                </div>
                <div className="text-sm text-muted-foreground">of target</div>
              </div>
            </div>
            
            <Progress 
              value={Math.min(usagePercentage, 100)} 
              className="h-3"
            />
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>0L</span>
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>Target: {targetUsage}L</span>
              </div>
              <span>{targetUsage}L</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📝</span>
            <span>Update Today's Usage</span>
          </CardTitle>
          <CardDescription>
            Manually enter your current water meter reading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter liters used today"
                value={newUsage}
                onChange={(e) => setNewUsage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !newUsage}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Your smart meter will automatically sync data soon!
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dailyUsage.slice(0, 7).reduce((sum, usage) => sum + Number(usage.liters_used), 0)}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Days on Target</p>
                <p className="text-2xl font-bold text-green-600">
                  {dailyUsage.slice(0, 7).filter(usage => 
                    Number(usage.liters_used) <= Number(usage.target_liters)
                  ).length}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg Daily</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dailyUsage.length > 0 
                    ? Math.round(dailyUsage.slice(0, 7).reduce((sum, usage) => sum + Number(usage.liters_used), 0) / Math.min(dailyUsage.length, 7))
                    : 0}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}