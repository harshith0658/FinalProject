-- Add XP and badges columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges INTEGER NOT NULL DEFAULT 0;

-- Update complete_video function to award XP and badges
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
  v_new_xp_total INTEGER;
  v_new_badge_total INTEGER;
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
  
  -- Award coins, XP, and badges
  UPDATE public.profiles
  SET coins = coins + 100,
      xp = xp + 100,
      badges = badges + 1
  WHERE id = v_user_id
  RETURNING coins, xp, badges INTO v_new_coin_total, v_new_xp_total, v_new_badge_total;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Video completed! +100 coins, +100 XP, +1 badge',
    'total_coins', v_new_coin_total,
    'total_xp', v_new_xp_total,
    'total_badges', v_new_badge_total
  );
END;
$$;

-- Update complete_quiz function to award XP and badges
CREATE OR REPLACE FUNCTION public.complete_quiz(p_quiz_id TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_new_coin_total INTEGER;
  v_new_xp_total INTEGER;
  v_new_badge_total INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Record completion (can complete multiple times)
  INSERT INTO public.quiz_completions (user_id, quiz_id)
  VALUES (v_user_id, p_quiz_id);
  
  -- Award coins, XP, and badges
  UPDATE public.profiles
  SET coins = coins + 100,
      xp = xp + 100,
      badges = badges + 1
  WHERE id = v_user_id
  RETURNING coins, xp, badges INTO v_new_coin_total, v_new_xp_total, v_new_badge_total;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Quiz completed! +100 coins, +100 XP, +1 badge',
    'total_coins', v_new_coin_total,
    'total_xp', v_new_xp_total,
    'total_badges', v_new_badge_total
  );
END;
$$;