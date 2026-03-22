import { 
  Coins, 
  Award, 
  Zap, 
  BookOpen, 
  Globe, 
  Search, 
  HelpCircle, 
  Gamepad2,
  Sprout,
  TreeDeciduous,
  Sparkles,
  Settings as SettingsIcon,
  Store,
  LogOut,
  User,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileDialog from "@/components/ProfileDialog";
import { useToast } from "@/hooks/use-toast";

const StatsDisplay = ({ userId }: { userId?: string }) => {
  const [coins, setCoins] = useState<number>(0);
  const [xp, setXP] = useState<number>(0);
  const [badges, setBadges] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('coins, xp, badges')
        .eq('id', userId)
        .single();
      
      if (data) {
        setCoins(data.coins);
        setXP(data.xp);
        setBadges(data.badges);
      }
    };

    fetchStats();

    // Subscribe to changes
    const channel = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.new?.coins !== undefined) setCoins(payload.new.coins);
          if (payload.new?.xp !== undefined) setXP(payload.new.xp);
          if (payload.new?.badges !== undefined) setBadges(payload.new.badges);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-accent" />
        <span className="font-semibold">{coins} Coins</span>
      </div>
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-accent" />
        <span className="font-semibold">{badges} Badges</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-accent" />
        <span className="font-semibold">{xp} XP</span>
      </div>
    </>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session && event === 'SIGNED_OUT') {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null; // Show nothing while checking auth
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Qgen</span>
        </div>
        
        <div className="flex items-center gap-4">
          <StatsDisplay userId={user?.id} />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowProfile(true)}>
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          <Button variant="outline">View Collection</Button>
          <Button variant="default" className="bg-primary" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />

      {/* Main Content Area with Nature Background */}
      <main className="flex-1 relative overflow-hidden bg-gradient-to-b from-[hsl(195,85,75)] via-[hsl(180,70,80)] to-[hsl(145,60,70)]">
        {/* Decorative clouds */}
        <div className="absolute top-4 left-16 w-24 h-12 bg-white/80 rounded-full shadow-sm"></div>
        <div className="absolute top-6 left-24 w-16 h-8 bg-white/70 rounded-full shadow-sm"></div>
        
        <div className="absolute top-8 right-24 w-28 h-14 bg-white/75 rounded-full shadow-sm"></div>
        <div className="absolute top-10 right-32 w-20 h-10 bg-white/65 rounded-full shadow-sm"></div>
        
        <div className="absolute top-16 left-1/3 w-32 h-16 bg-white/70 rounded-full shadow-sm"></div>
        <div className="absolute top-18 left-1/3 ml-8 w-24 h-12 bg-white/60 rounded-full shadow-sm"></div>

        <div className="absolute top-20 right-1/3 w-28 h-14 bg-white/65 rounded-full shadow-sm"></div>
        <div className="absolute top-22 right-1/3 mr-6 w-20 h-10 bg-white/55 rounded-full shadow-sm"></div>

        {/* Floating leaves */}
        <div className="absolute top-32 left-12 w-4 h-4 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-48 right-20 w-3 h-3 bg-primary/40 rounded-full animate-pulse delay-100"></div>
        <div className="absolute top-72 left-1/4 w-4 h-4 bg-accent/30 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-96 right-1/3 w-3 h-3 bg-accent/40 rounded-full animate-pulse delay-300"></div>

        {/* Mountain silhouettes */}
        <div className="absolute bottom-32 left-0 w-48 h-48 bg-primary/20 rounded-tl-full"></div>
        <div className="absolute bottom-24 right-0 w-56 h-56 bg-primary/15 rounded-tr-full"></div>
        
        {/* Hills */}
        <div className="absolute bottom-0 left-0 w-full h-64">
          <div className="absolute bottom-0 left-0 w-1/3 h-40 bg-[hsl(140,55,50)] rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/4 w-1/3 h-48 bg-[hsl(145,60,45)] rounded-t-full"></div>
          <div className="absolute bottom-0 right-1/4 w-1/3 h-44 bg-[hsl(142,58,47)] rounded-t-full"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-36 bg-[hsl(138,52,52)] rounded-t-full"></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 left-8 w-8 h-8 rounded-full bg-accent/20 blur-sm"></div>
        <div className="absolute top-1/3 right-12 w-6 h-6 rounded-full bg-secondary/20 blur-sm"></div>
        <div className="absolute bottom-1/3 left-1/4 w-10 h-10 rounded-full bg-primary/10 blur-sm"></div>

        {/* Main Content Container */}
        <div className="relative z-10 px-8 py-8">
          {/* Logo Row */}
          <div className="flex items-center justify-center mb-12 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg animate-bounce-subtle">
                <Globe className="w-12 h-12 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-bold text-foreground animate-float">Qgen</h1>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Lessons Button */}
            <button 
              onClick={() => navigate("/lessons")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-[3rem] px-8 py-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl flex items-center justify-between relative overflow-hidden animate-slide-up group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center group-hover:animate-bounce-subtle">
                  <Globe className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-bold tracking-wide transition-transform duration-300 group-hover:scale-105">LESSONS</h2>
                  <p className="text-lg opacity-90 transition-all duration-300 group-hover:translate-x-2">- Explore New Topics</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-accent-foreground" />
              </div>
            </button>

            {/* Quizzes Button */}
            <button 
              onClick={() => navigate("/lessons")}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-[3rem] px-8 py-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl flex items-center justify-between relative overflow-hidden animate-slide-up [animation-delay:100ms] group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-secondary-foreground/10 flex items-center justify-center group-hover:animate-bounce-subtle">
                  <Search className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-bold tracking-wide transition-transform duration-300 group-hover:scale-105">Quizzes</h2>
                  <p className="text-lg opacity-90 transition-all duration-300 group-hover:translate-x-2">- Test Your Knowledge</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <HelpCircle className="w-10 h-10 text-accent" />
              </div>
            </button>

            {/* Mini Games Button */}
            <button 
              onClick={() => navigate("/mini-games")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-[3rem] px-8 py-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl flex items-center justify-between relative overflow-hidden animate-slide-up [animation-delay:200ms] group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:animate-bounce-subtle">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-bold tracking-wide transition-transform duration-300 group-hover:scale-105">Mini Games</h2>
                  <p className="text-lg opacity-90 transition-all duration-300 group-hover:translate-x-2">- Play & Learn</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Gamepad2 className="w-8 h-8" />
              </div>
            </button>

            {/* Learn Topic Button */}
            <button 
              onClick={() => navigate("/learn-topic")}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-[3rem] px-8 py-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl flex items-center justify-between relative overflow-hidden animate-slide-up [animation-delay:300ms] group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:animate-bounce-subtle">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-bold tracking-wide transition-transform duration-300 group-hover:scale-105">Learn Anything</h2>
                  <p className="text-lg opacity-90 transition-all duration-300 group-hover:translate-x-2">- Ask & Discover</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Sparkles className="w-8 h-8" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom grass layer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(140,60,35)] via-[hsl(142,58,40)] to-transparent">
          {/* Grass texture effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[hsl(138,65,30)] opacity-40"></div>
        </div>
      </main>

    </div>
  );
};

export default Index;
