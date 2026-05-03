import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResume } from "@/context/ResumeContext";
import { Sparkles, Zap, Target, Wand2 } from "lucide-react";

const FEATURES = [
  { icon: Target, title: "ATS score", desc: "Instant compatibility rating" },
  { icon: Zap, title: "Real-time fixes", desc: "Actionable suggestions in seconds" },
  { icon: Wand2, title: "AI rewrites", desc: "Polished bullets, ready to paste" },
];

export default function AuthPage() {
  const nav = useNavigate();
  const { setUser } = useResume();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setUser({ name: name || email.split("@")[0] || "Friend", email: email || "guest@resumeai.app" });
    nav("/upload");
  };

  return (
    <PageShell hideNav>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left: hero */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative">
            <Logo to="/auth" />
          </div>
          <div className="relative space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
              <span>AI-powered resume optimization</span>
            </div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-[1.05] text-balance">
              Land more interviews with a <span className="gradient-text">smarter resume</span>.
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload your resume and let AI score, fix, and rewrite it — in under 30 seconds.
            </p>
            <div className="grid gap-3 pt-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-3 glass rounded-xl px-4 py-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative text-xs text-muted-foreground">
            Trusted by job seekers at top companies
          </div>
        </div>

        {/* Right: auth form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6 animate-scale-in">
            <div className="lg:hidden flex justify-center">
              <Logo to="/auth" />
            </div>
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="font-display text-3xl font-bold">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {mode === "signup" ? "No credit card. No spam. Just better resumes." : "Sign in to continue your scan."}
              </p>
            </div>

            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex p-1 rounded-xl bg-secondary/50 text-sm">
                {(["signup", "signin"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg transition font-medium ${
                      mode === m ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signup" ? "Sign up" : "Sign in"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground border-0 shadow-glow font-semibold">
                  {mode === "signup" ? "Create account" : "Sign in"} →
                </Button>
              </form>

              <button
                type="button"
                onClick={submit}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition"
              >
                or continue as guest
              </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By continuing you agree to our Terms & Privacy.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
