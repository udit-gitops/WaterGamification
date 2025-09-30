import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserRewards {
  id: string;
  user_id: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  total_liters_saved: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  badge_type: string;
  requirement_points: number | null;
  requirement_streak: number | null;
  requirement_liters_saved: number | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    badge_type: string;
    requirement_points: number | null;
    requirement_streak: number | null;
    requirement_liters_saved: number | null;
    created_at: string;
  };
}

export function useGamification() {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        // Create initial rewards record if it doesn't exist
        const { data: newData, error: createError } = await supabase
          .from('user_rewards')
          .insert([{
            user_id: (await supabase.auth.getUser()).data.user?.id,
            total_points: 0,
            current_streak: 0,
            longest_streak: 0,
            total_liters_saved: 0
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user rewards:', createError);
          return;
        }

        setUserRewards(newData);
        return;
      }

      setUserRewards(data);
    } catch (error) {
      console.error('Error fetching user rewards:', error);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error fetching user badges:', error);
        return;
      }

      setUserBadges(data || []);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  };

  const fetchAvailableBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_points', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching badges:', error);
        return;
      }

      setAvailableBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const updatePoints = async (pointsToAdd: number, litersSaved: number = 0) => {
    if (!userRewards) return;

    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .update({
          total_points: userRewards.total_points + pointsToAdd,
          total_liters_saved: userRewards.total_liters_saved + litersSaved
        })
        .eq('id', userRewards.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      setUserRewards(data);
      
      // Check for new badges
      await checkAndAwardBadges(data);

      toast({
        title: "Points Earned!",
        description: `You earned ${pointsToAdd} points!`
      });

      return { data };
    } catch (error) {
      console.error('Error updating points:', error);
      return { error };
    }
  };

  const updateStreak = async (newStreak: number) => {
    if (!userRewards) return;

    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(userRewards.longest_streak, newStreak)
        })
        .eq('id', userRewards.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      setUserRewards(data);
      
      // Check for streak-based badges
      await checkAndAwardBadges(data);

      return { data };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { error };
    }
  };

  const checkAndAwardBadges = async (rewards: UserRewards) => {
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    
    for (const badge of availableBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      // Check requirements
      if (badge.requirement_points && rewards.total_points >= badge.requirement_points) {
        shouldAward = true;
      }
      if (badge.requirement_streak && rewards.current_streak >= badge.requirement_streak) {
        shouldAward = true;
      }
      if (badge.requirement_liters_saved && rewards.total_liters_saved >= badge.requirement_liters_saved) {
        shouldAward = true;
      }

      if (shouldAward) {
        const { error } = await supabase
          .from('user_badges')
          .insert([{
            user_id: rewards.user_id,
            badge_id: badge.id
          }]);

        if (!error) {
          toast({
            title: `🏆 Badge Earned!`,
            description: `You've earned the ${badge.name} badge!`
          });
        }
      }
    }

    // Refresh user badges
    await fetchUserBadges();
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserRewards(),
        fetchUserBadges(),
        fetchAvailableBadges(),
        fetchLeaderboard()
      ]);
      setLoading(false);
    };

    init();
  }, []);

  return {
    userRewards,
    userBadges,
    availableBadges,
    leaderboard,
    loading,
    updatePoints,
    updateStreak,
    refetch: fetchUserRewards
  };
}