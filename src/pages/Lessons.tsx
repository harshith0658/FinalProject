import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Play, BookOpen, CheckCircle, Lock, Clock, X, MapPin, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import introGeography from "@/assets/lesson-intro-geography.jpg";
import continentsOceans from "@/assets/lesson-continents-oceans.jpg";
import countriesCapitals from "@/assets/lesson-countries-capitals.jpg";
import climateZones from "@/assets/lesson-climate-zones.jpg";
import landmarks from "@/assets/lesson-landmarks.jpg";
import naturalWonders from "@/assets/lesson-natural-wonders.jpg";

const Lessons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedVideos();
  }, []);

  const fetchCompletedVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('video_completions')
        .select('video_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching completions:', error);
      } else if (data) {
        setCompletedVideos(new Set(data.map(v => v.video_id)));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteVideo = async (videoId: string) => {
    setCompleting(videoId);
    
    try {
      const { data, error } = await supabase.rpc('complete_video', {
        p_video_id: videoId
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const result = data as { success: boolean; message: string; total_coins?: number; total_xp?: number; total_badges?: number };

      if (result.success) {
        setCompletedVideos(prev => new Set([...prev, videoId]));
        toast({
          title: "🎉 Congratulations!",
          description: `${result.message}`
        });
      } else {
        toast({
          title: "Info",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error completing video:', error);
      toast({
        title: "Error",
        description: "Failed to complete video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCompleting(null);
    }
  };

  const lessons = [
    {
      id: "intro-geography",
      title: "Introduction to Geography",
      description: "Learn the basics of world geography and map reading",
      duration: "15 min",
      icon: BookOpen,
      locked: false,
      preview: introGeography,
      videoUrl: "/videos/intruduction.mp4"
    },
    {
      id: "continents-oceans",
      title: "Continents and Oceans",
      description: "Explore the seven continents and five oceans",
      duration: "20 min",
      icon: BookOpen,
      locked: false,
      preview: continentsOceans,
      videoUrl: "/videos/continents-oceans.mp4"
    },
    {
      id: "climate-zones",
      title: "Climate Zones",
      description: "Understanding different climate regions",
      duration: "18 min",
      icon: BookOpen,
      locked: false,
      preview: climateZones
    },
    {
      id: "landmarks",
      title: "World Landmarks",
      description: "Famous landmarks and monuments worldwide",
      duration: "22 min",
      icon: BookOpen,
      locked: false,
      preview: landmarks
    },
    {
      id: "natural-wonders",
      title: "Natural Wonders",
      description: "Explore Earth's most amazing natural formations",
      duration: "20 min",
      icon: BookOpen,
      locked: false,
      preview: naturalWonders
    },
    {
      id: "asia",
      title: "Asia",
      description: "Discover the largest continent with diverse cultures and landscapes",
      duration: "22 min",
      icon: Globe2,
      locked: false,
      preview: continentsOceans,
      videoUrl: "/videos/asia.mp4"
    },
    {
      id: "america",
      title: "America",
      description: "Explore North and South America from pole to pole",
      duration: "24 min",
      icon: MapPin,
      locked: false,
      preview: continentsOceans,
      videoUrl: "/videos/america.mp4"
    },
    {
      id: "europe",
      title: "Europe",
      description: "Journey through Europe's rich history and geography",
      duration: "20 min",
      icon: Globe2,
      locked: false,
      preview: continentsOceans,
      videoUrl: "/videos/europe.mp4"
    },
    {
      id: "africa",
      title: "Africa",
      description: "Experience Africa's diverse wildlife and natural beauty",
      duration: "23 min",
      icon: MapPin,
      locked: false,
      preview: continentsOceans,
      videoUrl: "/videos/africa.mp4"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Lesson Videos</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-bold mb-2">Continue Your Learning Journey</h2>
          <p className="text-muted-foreground">Watch lessons and take quizzes to earn rewards</p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center">Loading...</div>
          ) : (
            lessons.map((lesson, index) => {
              const Icon = lesson.icon;
              const isCompleted = completedVideos.has(lesson.id);
              const isLocked = lesson.locked;
              const isCompleting = completing === lesson.id;

            return (
              <Card 
                key={lesson.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up border-2 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img 
                    src={lesson.preview} 
                    alt={lesson.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-semibold">{lesson.duration}</span>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {isCompleted && (
                      <Badge className="bg-accent text-accent-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {isLocked && (
                      <Badge variant="secondary">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                    {!isCompleted && !isLocked && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {lesson.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2">
                    {isCompleted ? (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          disabled={isLocked || !lesson.videoUrl}
                          onClick={() => lesson.videoUrl && setPlayingVideo(lesson.videoUrl)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Replay
                        </Button>
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90"
                          disabled={isLocked}
                          onClick={() => navigate(`/quiz/${lesson.id}`)}
                        >
                          Take Quiz
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => lesson.videoUrl ? setPlayingVideo(lesson.videoUrl) : handleCompleteVideo(lesson.id)}
                        disabled={isLocked || isCompleting}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Locked
                          </>
                        ) : isCompleting ? (
                          "Completing..."
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {lesson.videoUrl ? "Watch Video" : "Complete Video"}
                            <span className="ml-2 flex items-center gap-1 text-xs opacity-90">
                              (+100 🪙 +100 ⭐ +1 🏆)
                            </span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </div>
      </main>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Introduction to Geography</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPlayingVideo(null)}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black">
            {playingVideo && (
              <video
                src={playingVideo}
                controls
                autoPlay
                className="w-full h-full"
                onEnded={() => {
                  const videoLesson = lessons.find(l => l.videoUrl === playingVideo);
                  if (videoLesson && !completedVideos.has(videoLesson.id)) {
                    handleCompleteVideo(videoLesson.id);
                  }
                  setPlayingVideo(null);
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="p-6 pt-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Watch the complete video to earn +100 🪙, +100 ⭐, and +1 🏆
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lessons;
