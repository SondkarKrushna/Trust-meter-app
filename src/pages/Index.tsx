import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Loader2, AlertTriangle, CheckCircle, Link as LinkIcon, TrendingUp } from "lucide-react";
import { z } from "zod";
import heroBackground from "@/assets/hero-background.jpg";

const urlSchema = z.string().url("Please enter a valid URL");

interface AnalysisResult {
  url: string;
  title: string;
  is_fake: boolean;
  confidence_score: number;
  analysis: string;
  key_findings?: string[];
}

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  is_fake: boolean;
  confidence_score: number;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [newsUrl, setNewsUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadHistory(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        if (event === "SIGNED_IN") {
          loadHistory(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from("analysis_results")
      .select("id, url, title, is_fake, confidence_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setHistory(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAnalyze = async () => {
    try {
      urlSchema.parse(newsUrl);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid URL",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-news", {
        body: { url: newsUrl },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      // Reload history to show the new analysis
      if (user) {
        loadHistory(user.id);
      }

      toast({
        title: "Analysis Complete",
        description: "The news article has been analyzed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Fake News Detector</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Verify News Authenticity with AI
            </h2>
            <p className="text-lg text-muted-foreground">
              Enter any news article URL and get instant AI-powered credibility analysis
            </p>
            
            {/* URL Input */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com/news-article"
                      value={newsUrl}
                      onChange={(e) => setNewsUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !analyzing && handleAnalyze()}
                      disabled={analyzing}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={analyzing || !newsUrl}
                    size="lg"
                    className="sm:w-auto w-full"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="shadow-lg animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{result.title}</CardTitle>
                    <CardDescription className="text-base break-all">
                      {result.url}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {result.is_fake ? (
                      <Badge variant="destructive" className="text-base px-4 py-2">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Potentially Fake
                      </Badge>
                    ) : (
                      <Badge className="text-base px-4 py-2 bg-success text-success-foreground">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Likely Credible
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{result.confidence_score}% confidence</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {result.analysis}
                  </p>
                </div>
                
                {result.key_findings && result.key_findings.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Key Findings</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {result.key_findings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Recent Analyses</h2>
            <div className="grid gap-4">
              {history.map((item) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setNewsUrl(item.url)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.url}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.is_fake ? (
                          <Badge variant="destructive" className="text-xs">
                            Fake
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-success text-success-foreground">
                            Credible
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {item.confidence_score}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;