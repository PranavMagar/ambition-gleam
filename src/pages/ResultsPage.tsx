import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useResume } from "@/context/ResumeContext";
import { AlertCircle, CheckCircle2, Copy, Download, Lightbulb, Sparkles, Tag, X } from "lucide-react";
import { toast } from "sonner";

function ScoreGauge({ score }: { score: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(score), 100); return () => clearTimeout(t); }, [score]);
  const r = 85;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const color = score >= 80 ? "hsl(var(--success))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs work";

  return (
    <div className="relative w-56 h-56">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke="url(#g)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 12px hsl(var(--primary)/0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-6xl font-bold gradient-text">{Math.round(v)}</div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">ATS Score</div>
        <div className="text-sm font-semibold mt-1" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const nav = useNavigate();
  const { result, file, jobLevel } = useResume();

  useEffect(() => { if (!result) nav("/upload"); }, [result, nav]);
  if (!result) return null;

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied to clipboard"); };

  const download = () => {
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `resume-analysis-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell>
      <section className="container max-w-6xl py-10 lg:py-14 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="text-xs text-muted-foreground font-mono mb-1">{file?.name} · {jobLevel} level</div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold">Your <span className="gradient-text">analysis</span></h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={download} className="gap-2"><Download className="w-4 h-4" /> Export</Button>
            <Button onClick={() => nav("/upload")} className="bg-gradient-primary text-primary-foreground border-0 shadow-glow gap-2">
              <Sparkles className="w-4 h-4" /> New scan
            </Button>
          </div>
        </div>

        {/* Top: gauge + keywords */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center animate-scale-in">
            <ScoreGauge score={result.score} />
            <p className="text-xs text-muted-foreground text-center mt-4 max-w-[200px]">
              Compared against ATS best practices for {jobLevel}-level roles.
            </p>
          </div>

          <div className="lg:col-span-2 glass rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-accent" />
              <h3 className="font-display text-xl font-semibold">Keyword coverage</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase text-success font-semibold tracking-wider mb-2">Matched ({result.keywords.matched.length})</div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.matched.length ? result.keywords.matched.map((k) => (
                    <span key={k} className="px-3 py-1 rounded-full text-xs bg-success/15 text-success border border-success/30">
                      {k}
                    </span>
                  )) : <span className="text-sm text-muted-foreground">None detected</span>}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-warning font-semibold tracking-wider mb-2">Missing ({result.keywords.missing.length})</div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.missing.length ? result.keywords.missing.map((k) => (
                    <span key={k} className="px-3 py-1 rounded-full text-xs bg-warning/10 text-warning border border-warning/30">
                      {k}
                    </span>
                  )) : <span className="text-sm text-muted-foreground">All covered ✨</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues + Suggestions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h3 className="font-display text-xl font-semibold">Issues found</h3>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{result.issues.length}</span>
            </div>
            <ul className="space-y-3">
              {result.issues.map((i, idx) => (
                <li key={idx} className="flex gap-3 text-sm" style={{ animationDelay: `${idx * 80}ms` }}>
                  <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-accent" />
              <h3 className="font-display text-xl font-semibold">Suggestions</h3>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{result.suggestions.length}</span>
            </div>
            <ul className="space-y-3">
              {result.suggestions.map((s, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rewrites */}
        <div className="glass rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary-glow" />
            <h3 className="font-display text-xl font-semibold">AI rewrites</h3>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl bg-secondary/40 border border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Professional summary</div>
                <button onClick={() => copy(result.rewrites.summary)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-sm leading-relaxed">{result.rewrites.summary}</p>
            </div>

            <div className="rounded-xl bg-secondary/40 border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Experience bullets</div>
                <button onClick={() => copy(result.rewrites.experience.join("\n• "))} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy all
                </button>
              </div>
              <ul className="space-y-2">
                {result.rewrites.experience.map((b, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
