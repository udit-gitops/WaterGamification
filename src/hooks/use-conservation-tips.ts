import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ConservationTip {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export function useConservationTips() {
  const [tips, setTips] = useState<ConservationTip[]>([]);
  const [currentTip, setCurrentTip] = useState<ConservationTip | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('conservation_tips')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tips:', error);
        return;
      }

      setTips(data || []);
      
      // Set initial random tip
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setCurrentTip(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const rotateTip = () => {
    if (tips.length > 0) {
      const randomIndex = Math.floor(Math.random() * tips.length);
      setCurrentTip(tips[randomIndex]);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  // Auto-rotate tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(rotateTip, 10000);
    return () => clearInterval(interval);
  }, [tips]);

  return {
    tips,
    currentTip,
    loading,
    rotateTip,
    refetch: fetchTips
  };
}