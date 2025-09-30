-- Create households table for smart meter data
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_name TEXT NOT NULL,
  address TEXT,
  smart_meter_id TEXT UNIQUE,
  neighborhood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily water usage table
CREATE TABLE public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  liters_used DECIMAL(10,2) NOT NULL DEFAULT 0,
  target_liters DECIMAL(10,2) DEFAULT 250, -- Daily target in liters
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(household_id, date)
);

-- Create user points and rewards table
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_liters_saved DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  badge_type TEXT CHECK (badge_type IN ('bronze', 'silver', 'gold')),
  requirement_points INTEGER,
  requirement_streak INTEGER,
  requirement_liters_saved DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create conservation tips table
CREATE TABLE public.conservation_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conservation_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for households
CREATE POLICY "Users can view their own household" ON public.households
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own household" ON public.households
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own household" ON public.households
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for daily_usage
CREATE POLICY "Users can view their household usage" ON public.daily_usage
FOR SELECT USING (
  household_id IN (SELECT id FROM public.households WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their household usage" ON public.daily_usage
FOR INSERT WITH CHECK (
  household_id IN (SELECT id FROM public.households WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their household usage" ON public.daily_usage
FOR UPDATE USING (
  household_id IN (SELECT id FROM public.households WHERE user_id = auth.uid())
);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards" ON public.user_rewards
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own rewards" ON public.user_rewards
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rewards" ON public.user_rewards
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON public.badges
FOR SELECT USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view all user badges for leaderboard" ON public.user_badges
FOR SELECT USING (true);

-- RLS Policies for conservation_tips (public read)
CREATE POLICY "Anyone can view active tips" ON public.conservation_tips
FOR SELECT USING (is_active = true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_households_updated_at
BEFORE UPDATE ON public.households
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_rewards_updated_at
BEFORE UPDATE ON public.user_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample badges
INSERT INTO public.badges (name, description, icon, badge_type, requirement_points, requirement_streak, requirement_liters_saved) VALUES
('Water Warrior', 'Earned your first conservation points', '🌊', 'bronze', 10, NULL, NULL),
('Streak Master', 'Maintained a 7-day conservation streak', '🔥', 'bronze', NULL, 7, NULL),
('Drop Saver', 'Saved 100 liters of water', '💧', 'silver', NULL, NULL, 100),
('Eco Champion', 'Reached 500 conservation points', '🏆', 'silver', 500, NULL, NULL),
('Conservation Legend', 'Saved 1000 liters and maintained 30-day streak', '👑', 'gold', NULL, 30, 1000);

-- Insert sample conservation tips
INSERT INTO public.conservation_tips (title, content) VALUES
('Turn off taps while brushing', 'Save up to 8 liters of water per minute by turning off the tap while brushing your teeth.'),
('Fix leaky faucets immediately', 'A single dripping faucet can waste over 3,000 liters of water per year.'),
('Take shorter showers', 'Reducing your shower time by just 2 minutes can save up to 150 liters per week.'),
('Use full loads only', 'Run dishwashers and washing machines only with full loads to maximize water efficiency.'),
('Collect rainwater', 'Use collected rainwater for watering plants and outdoor cleaning tasks.');