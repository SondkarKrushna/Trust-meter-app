import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Github, Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const upsertMeta = (name: string, content: string) => {
  const head = document.head;
  const existing = head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute("name", name);
  meta.setAttribute("content", content);
  head.appendChild(meta);
};

const upsertCanonical = (href: string) => {
  const head = document.head;
  const existing = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (existing) {
    existing.href = href;
    return;
  }

  const link = document.createElement("link");
  link.rel = "canonical";
  link.href = href;
  head.appendChild(link);
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isEmbeddedPreview, setIsEmbeddedPreview] = useState(false);

  const authErrorHint = useMemo(() => {
    return isEmbeddedPreview
      ? "Login can fail inside the embedded preview. Please open the app in a new tab and try again."
      : "Network error while contacting the authentication server. Please check your connection/VPN/ad-blocker and try again.";
  }, [isEmbeddedPreview]);

  useEffect(() => {
    // Detect if we're running inside an iframe (common cause of auth fetch/storage issues).
    try {
      setIsEmbeddedPreview(window.self !== window.top);
    } catch {
      setIsEmbeddedPreview(true);
    }

    // SEO basics
    document.title = "Login | Fake News Detector";
    upsertMeta(
      "description",
      "Sign in to Fake News Detector to analyze news credibility with AI-powered checks."
    );
    upsertCanonical(`${window.location.origin}/auth`);

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getAuthErrorMessage = (error: any, fallback: string) => {
    const msg = typeof error?.message === "string" ? error.message : fallback;
    if (msg.toLowerCase().includes("failed to fetch")) return authErrorHint;
    return msg;
  };

  const validateInputs = (isSignUp: boolean) => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (isSignUp && !fullName.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter your full name",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!validateInputs(isSignUp)) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getAuthErrorMessage(error, "Authentication failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const target = window.top ?? window;
        target.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Could not start Google sign-in. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getAuthErrorMessage(error, "Failed to sign in with Google"),
        variant: "destructive",
      });
    }
  };

  const handleGithubAuth = async () => {
    toast({
      title: "GitHub sign-in unavailable",
      description: "GitHub login isn't supported in this backend yet. Please use email/password or Google.",
    });
  };

  const openInNewTab = () => {
    window.open(`${window.location.origin}/auth`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <h1 className="sr-only">Login to Fake News Detector</h1>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Fake News Detector</CardTitle>
          <CardDescription>Verify news authenticity with AI-powered analysis</CardDescription>
        </CardHeader>

        <CardContent>
          {isEmbeddedPreview && (
            <Alert className="mb-4">
              <AlertTitle>Open in a new tab to sign in</AlertTitle>
              <AlertDescription>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm">
                    Login can fail inside the embedded preview due to browser privacy restrictions.
                  </p>
                  <Button variant="outline" size="sm" onClick={openInNewTab}>
                    Open
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailAuth(false)}
                  disabled={loading}
                />
                <Button className="w-full" onClick={() => handleEmailAuth(false)} disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGoogleAuth} disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" onClick={handleGithubAuth} disabled={loading}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub (unavailable)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailAuth(true)}
                  disabled={loading}
                />
                <Button className="w-full" onClick={() => handleEmailAuth(true)} disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGoogleAuth} disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" onClick={handleGithubAuth} disabled={loading}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub (unavailable)
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
