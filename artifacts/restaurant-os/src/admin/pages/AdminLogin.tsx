import { useState } from "react";
import { useLocation } from "wouter";
import { Flame, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.843 2.078-1.7958 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.6149z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1818l-2.9086-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5836-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5932 3.6818 9s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.173 0 7.5477 0 9s.3477 2.827.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

export default function AdminLogin() {
  const { login, signup, loginWithGoogle, error } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(email, password);
      navigate("/admin");
    } catch {
      // error message already set via useAuth()
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/admin");
    } catch {
      // error message already set via useAuth() (popup-closed is swallowed silently)
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
            <Flame className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-serif text-2xl uppercase tracking-widest text-foreground">Control Center</h1>
          <p className="text-xs text-foreground/40 mt-1">
            {mode === "login" ? "Sign in to manage your restaurant" : "Create your restaurant owner account"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleSubmitting || submitting}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/15 hover:bg-white/10 text-foreground text-sm py-2.5 rounded-lg transition-colors mb-4 disabled:opacity-50"
        >
          {googleSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          {mode === "login" ? "Continue with Google" : "Sign up with Google"}
        </button>

        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-foreground/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label htmlFor="login-email" className="text-xs text-foreground/60 mb-1.5 block">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
              placeholder="you@restaurant.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-xs text-foreground/60 mb-1.5 block">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button type="submit" disabled={submitting || googleSubmitting} className="w-full justify-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 w-full text-center text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          {mode === "login" ? "New restaurant owner? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
