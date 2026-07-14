import { useState } from "react";
import { useLocation } from "wouter";
import { Flame, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const { login, signup, error } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-foreground/60 mb-1.5 block">Email</label>
            <input
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
            <label className="text-xs text-foreground/60 mb-1.5 block">Password</label>
            <input
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

          <Button type="submit" disabled={submitting} className="w-full justify-center gap-2">
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
