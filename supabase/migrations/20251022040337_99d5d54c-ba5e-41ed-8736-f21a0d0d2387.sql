-- Change default coins from 1000 to 0 for new users
ALTER TABLE public.profiles 
ALTER COLUMN coins SET DEFAULT 0;

-- Create table to track video completions
CREATE TABLE IF NOT EXISTS public.video_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  coins_awarded INTEGER NOT NULL DEFAULT 100,
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.video_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own video completions"
ON public.video_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video completions"
ON public.video_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create table to track quiz completions
CREATE TABLE IF NOT EXISTS public.quiz_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  coins_awarded INTEGER NOT NULL DEFAULT 100
);

ALTER TABLE public.quiz_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz completions"
ON public.quiz_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz completions"
ON public.quiz_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to award coins for video completion
CREATE OR REPLACE FUNCTION public.complete_video(p_video_id TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_already_completed BOOLEAN;
  v_new_coin_total INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Check if already completed
  SELECT EXISTS(
    SELECT 1 FROM public.video_completions 
    WHERE user_id = v_user_id AND video_id = p_video_id
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN json_build_object('success', false, 'message', 'Video already completed');
  END IF;
  
  -- Record completion
  INSERT INTO public.video_completions (user_id, video_id)
  VALUES (v_user_id, p_video_id);
  
  -- Award coins
  UPDATE public.profiles
  SET coins = coins + 100
  WHERE id = v_user_id
  RETURNING coins INTO v_new_coin_total;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Video completed! +100 coins',
    'total_coins', v_new_coin_total
  );
END;
$$;

-- Function to award coins for quiz completion
CREATE OR REPLACE FUNCTION public.complete_quiz(p_quiz_id TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_new_coin_total INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Record completion (can complete multiple times)
  INSERT INTO public.quiz_completions (user_id, quiz_id)
  VALUES (v_user_id, p_quiz_id);
  
  -- Award coins
  UPDATE public.profiles
  SET coins = coins + 100
  WHERE id = v_user_id
  RETURNING coins INTO v_new_coin_total;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Quiz completed! +100 coins',
    'total_coins', v_new_coin_total
  );
END;
$$;