-- Add coins column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN coins INTEGER NOT NULL DEFAULT 1000;

-- Create table to track unlocked games
CREATE TABLE public.user_game_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS on user_game_unlocks
ALTER TABLE public.user_game_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_game_unlocks
CREATE POLICY "Users can view their own unlocked games"
ON public.user_game_unlocks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock games for themselves"
ON public.user_game_unlocks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to unlock a game
CREATE OR REPLACE FUNCTION public.unlock_game(p_game_id TEXT, p_coin_cost INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_coins INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM public.user_game_unlocks 
    WHERE user_id = v_user_id AND game_id = p_game_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    RETURN json_build_object('success', false, 'message', 'Game already unlocked');
  END IF;
  
  -- Get current coins
  SELECT coins INTO v_current_coins
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Check if user has enough coins
  IF v_current_coins < p_coin_cost THEN
    RETURN json_build_object('success', false, 'message', 'Not enough coins');
  END IF;
  
  -- Deduct coins
  UPDATE public.profiles
  SET coins = coins - p_coin_cost
  WHERE id = v_user_id;
  
  -- Unlock the game
  INSERT INTO public.user_game_unlocks (user_id, game_id)
  VALUES (v_user_id, p_game_id);
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Game unlocked successfully',
    'remaining_coins', v_current_coins - p_coin_cost
  );
END;
$$;