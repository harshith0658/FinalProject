-- Update the complete_quiz function to accept score and award points based on correct answers
CREATE OR REPLACE FUNCTION public.complete_quiz(p_quiz_id text, p_score integer DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_new_coin_total INTEGER;
  v_new_xp_total INTEGER;
  v_new_badge_total INTEGER;
  v_coins_earned INTEGER;
  v_xp_earned INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Calculate rewards: 20 points per correct answer
  v_coins_earned := p_score * 20;
  v_xp_earned := p_score * 20;
  
  -- Record completion (can complete multiple times)
  INSERT INTO public.quiz_completions (user_id, quiz_id, coins_awarded)
  VALUES (v_user_id, p_quiz_id, v_coins_earned);
  
  -- Award coins, XP, and badges
  UPDATE public.profiles
  SET coins = coins + v_coins_earned,
      xp = xp + v_xp_earned,
      badges = badges + 1
  WHERE id = v_user_id
  RETURNING coins, xp, badges INTO v_new_coin_total, v_new_xp_total, v_new_badge_total;
  
  RETURN json_build_object(
    'success', true,
    'message', format('Quiz completed! +%s coins, +%s XP, +1 badge', v_coins_earned, v_xp_earned),
    'coins_earned', v_coins_earned,
    'xp_earned', v_xp_earned,
    'total_coins', v_new_coin_total,
    'total_xp', v_new_xp_total,
    'total_badges', v_new_badge_total
  );
END;
$$;