import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function LearnTopic() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const generateSummary = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic!");
      return;
    }

    setIsLoading(true);
    setSummary("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { topic: topic.trim() },
      });

      if (error) {
        console.error("Error generating summary:", error);
        toast.error("Failed to generate summary. Please try again!");
        return;
      }

      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-secondary/10 to-background p-4">
      <div className="max-w-3xl mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Learn About Anything!
          </h1>
          <p className="text-muted-foreground text-lg">
            Type any topic and I'll explain it in a fun, easy way! 🌟
          </p>
        </div>

        <Card className="p-6 mb-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What do you want to learn about?
              </label>
              <Input
                type="text"
                placeholder="e.g., Ocean, Rainbow, Dinosaurs..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && generateSummary()}
                className="text-lg"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={generateSummary}
              disabled={isLoading || !topic.trim()}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Tell Me About It!
                </>
              )}
            </Button>
          </div>
        </Card>

        {summary && (
          <Card className="p-6 shadow-lg animate-in fade-in-50 duration-500">
            <div className="prose prose-lg max-w-none">
              <div className="bg-primary/5 rounded-lg p-6 border-2 border-primary/20">
                <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            </div>
          </Card>
        )}

        {!summary && !isLoading && (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">
              Enter a topic above to start learning! 📚
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
