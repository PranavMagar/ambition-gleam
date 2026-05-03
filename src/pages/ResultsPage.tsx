import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useResume } from "@/context/ResumeContext";
import { PROFESSION_LABEL } from "@/lib/analyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle, CheckCircle2, Copy, Download, FileText, Lightbulb,
  Sparkles, Tag, Target, X, Mail, BarChart3, Layers,
} from "lucide-react";
import { toast } from "sonner";

function ScoreGauge({ score, label = "ATS Score" }: { score: number; label?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(score), 100); return () => clearTimeout(t); }, [score]);
  const r = 80;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const verdict = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs work";
  const color = score >= 80 ? "hsl(var(--success))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  return (
    <div className="relative w-52 h-52">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#g)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl font-bold gradient-text">{Math.round(v)}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
        <div className="text-xs font-semibold mt-1" style={{ color }}>{verdict}</div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "good" | "warn" | "bad" }) {
  const cls = status === "good" ? "bg-success" : status === "warn" ? "bg-warning" : "bg-destructive";
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />;
}

export default function ResultsPage() {
  const nav = useNavigate();
  const { result, file, jobLevel, profession, targetRole } = useResume();

  useEffect(() => { if (!result) nav("/upload"); }, [result, nav]);
  if (!result) return null;

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied to clipboard"); };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `resume-analysis-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const md = `# Resume Analysis

**File:** ${file?.name}
**Profession:** ${PROFESSION_LABEL[profession]}
**Level:** ${jobLevel}
${targetRole ? `**Target role:** ${targetRole}\n` : ""}
**ATS Score:** ${result.score}/100
${result.jdMatch ? `**JD Match:** ${result.jdMatch.score}%\n` : ""}

## Section Scores
${result.sections.map((s) => `- **${s.name}**: ${s.score}/100 — ${s.note}`).join("\n")}

## Issues
${result.issues.map((i) => `- ${i}`).join("\n")}

## Suggestions
${result.suggestions.map((s) => `- ${s}`).join("\n")}

## Matched Keywords
${result.keywords.matched.join(", ") || "—"}

## Missing Keywords
${result.keywords.missing.join(", ") || "—"}

## Summary Rewrite
${result.rewrites.summary}

## Experience Bullets
${result.rewrites.experience.map((b) => `- ${b}`).join("\n")}

## Cover Letter
${result.rewrites.coverLetter}
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `resume-report-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell>
      <section className="container max-w-6xl py-10 lg:py-14 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="text-xs text-muted-foreground font-mono mb-1">
              {file?.name} · {PROFESSION_LABEL[profession]} · {jobLevel}{targetRole ? ` · ${targetRole}` : ""}
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              Your <span className="gradient-text">analysis</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadMarkdown} className="gap-2">
              <FileText className="w-4 h-4" /> Markdown
            </Button>
            <Button variant="outline" onClick={downloadJSON} className="gap-2">
              <Download className="w-4 h-4" /> JSON
            </Button>
            <Button onClick={() => nav("/upload")} className="bg-gradient-primary text-primary-foreground border-0 shadow-glow gap-2">
              <Sparkles className="w-4 h-4" /> New scan
            </Button>
          </div>
        </div>

        {/* Top: gauges + readability */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="surface p-6 flex flex-col items-center justify-center animate-scale-in">
            <ScoreGauge score={result.score} />
            <p className="text-xs text-muted-foreground text-center mt-3 max-w-[220px]">
              Calibrated for {PROFESSION_LABEL[profession]} · {jobLevel} level
            </p>
          </div>

          {result.jdMatch ? (
            <div className="surface p-6 flex flex-col items-center justify-center animate-scale-in">
              <ScoreGauge score={result.jdMatch.score} label="JD Match" />
              <p className="text-xs text-muted-foreground text-center mt-3 max-w-[220px]">
                Match against the pasted job description
              </p>
            </div>
          ) : (
            <div className="surface p-6 animate-scale-in">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-accent" />
                <h3 className="font-display text-lg font-semibold">JD Match</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Paste a job description on the previous step to unlock a personalized match score.
              </p>
              <Button variant="outline" size="sm" onClick={() => nav("/profession")}>
                Add a job description
              </Button>
            </div>
          )}

          <div className="surface p-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg font-semibold">Readability</h3>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Words</dt><dd className="font-semibold text-right">{result.readability.words}</dd>
              <dt className="text-muted-foreground">Bullets</dt><dd className="font-semibold text-right">{result.readability.bullets}</dd>
              <dt className="text-muted-foreground">Quantified</dt><dd className="font-semibold text-right">{result.readability.quantified}</dd>
              <dt className="text-muted-foreground">Read time</dt><dd className="font-semibold text-right">{result.readability.readingTime}</dd>
            </dl>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="surface p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">Section breakdown</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {result.sections.map((s) => (
              <div key={s.name} className="rounded-xl border border-border p-3 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <StatusDot status={s.status} /> {s.name}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{s.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{s.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="surface p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-accent" />
            <h3 className="font-display text-lg font-semibold">Keyword coverage</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-xs uppercase text-success font-semibold tracking-wider mb-2">
                Matched ({result.keywords.matched.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.matched.length ? result.keywords.matched.map((k) => (
                  <span key={k} className="px-2.5 py-0.5 rounded-full text-xs bg-success/10 text-success border border-success/30">
                    {k}
                  </span>
                )) : <span className="text-sm text-muted-foreground">None detected</span>}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-warning font-semibold tracking-wider mb-2">
                Missing ({result.keywords.missing.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.missing.length ? result.keywords.missing.map((k) => (
                  <span key={k} className="px-2.5 py-0.5 rounded-full text-xs bg-warning/10 text-warning border border-warning/30">
                    {k}
                  </span>
                )) : <span className="text-sm text-muted-foreground">All covered ✨</span>}
              </div>
            </div>
          </div>

          {result.jdMatch && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs uppercase font-semibold tracking-wider text-primary mb-2">
                JD missing terms
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.jdMatch.missing.length ? result.jdMatch.missing.map((k) => (
                  <span key={k} className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/30">
                    {k}
                  </span>
                )) : <span className="text-sm text-muted-foreground">None</span>}
              </div>
            </div>
          )}
        </div>

        {/* Issues + Suggestions */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="surface p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-warning" />
              <h3 className="font-display text-lg font-semibold">Issues found</h3>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{result.issues.length}</span>
            </div>
            <ul className="space-y-2.5">
              {result.issues.map((i, idx) => (
                <li key={idx} className="flex gap-2.5 text-sm">
                  <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-accent" />
              <h3 className="font-display text-lg font-semibold">Suggestions</h3>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{result.suggestions.length}</span>
            </div>
            <ul className="space-y-2.5">
              {result.suggestions.map((s, idx) => (
                <li key={idx} className="flex gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rewrites with tabs (incl. cover letter) */}
        <div className="surface p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">AI rewrites</h3>
          </div>

          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="cover">Cover letter</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="rounded-xl bg-secondary/40 border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Professional summary</div>
                  <button onClick={() => copy(result.rewrites.summary)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="text-sm leading-relaxed">{result.rewrites.summary}</p>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-4">
              <div className="rounded-xl bg-secondary/40 border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Experience bullets</div>
                  <button onClick={() => copy("• " + result.rewrites.experience.join("\n• "))} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
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
            </TabsContent>

            <TabsContent value="cover" className="mt-4">
              <div className="rounded-xl bg-secondary/40 border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Cover letter draft
                  </div>
                  <button onClick={() => copy(result.rewrites.coverLetter)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.rewrites.coverLetter}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </PageShell>
  );
}
