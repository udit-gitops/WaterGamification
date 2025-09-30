import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Household {
  id: string;
  user_id: string;
  household_name: string;
  address?: string;
  smart_meter_id?: string;
  neighborhood?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyUsage {
  id: string;
  household_id: string;
  date: string;
  liters_used: number;
  target_liters: number;
  created_at: string;
}

export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHousehold = async () => {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setHousehold(data);
    } catch (error) {
      console.error('Error fetching household:', error);
    }
  };

  const fetchDailyUsage = async (householdId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('household_id', householdId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setDailyUsage(data || []);
    } catch (error) {
      console.error('Error fetching daily usage:', error);
    }
  };

  const createHousehold = async (householdData: {
    household_name: string;
    address?: string;
    smart_meter_id?: string;
    neighborhood?: string;
  }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('households')
        .insert([{
          ...householdData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
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

      setHousehold(data);
      toast({
        title: "Success",
        description: "Household created successfully!"
      });

      return { data };
    } catch (error) {
      console.error('Error creating household:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateDailyUsage = async (litersUsed: number) => {
    if (!household) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_usage')
        .upsert({
          household_id: household.id,
          date: today,
          liters_used: litersUsed,
          target_liters: 250
        })
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

      await fetchDailyUsage(household.id);
      return { data };
    } catch (error) {
      console.error('Error updating daily usage:', error);
      return { error };
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchHousehold();
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (household?.id) {
      fetchDailyUsage(household.id);
    }
  }, [household?.id]);

  return {
    household,
    dailyUsage,
    loading,
    createHousehold,
    updateDailyUsage,
    refetch: fetchHousehold
  };
}