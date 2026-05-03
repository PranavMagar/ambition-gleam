import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { useResume } from "@/context/ResumeContext";
import { analyzeResume } from "@/lib/analyzer";
import { FileSearch, Brain, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

const STAGES = [
  { id: "parse", label: "Parsing document", desc: "Extracting text & structure", icon: FileSearch },
  { id: "analyze", label: "Analyzing sections", desc: "Detecting keywords & gaps", icon: Brain },
  { id: "score", label: "Scoring ATS compatibility", desc: "Comparing against best practices", icon: Sparkles },
  { id: "rewrite", label: "Generating rewrites", desc: "Crafting polished suggestions", icon: Sparkles },
];

const STAGE_MS = 1100;

export default function AnalyzingPage() {
  const nav = useNavigate();
  const { file, jobLevel, setResult } = useResume();
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!file) { nav("/upload"); return; }

    let mounted = true;
    let analysisDone: Awaited<ReturnType<typeof analyzeResume>> | null = null;

    analyzeResume(file, jobLevel).then((r) => { analysisDone = r; });

    const tick = setInterval(() => {
      setProgress((p) => Math.min(100, p + 1.5));
    }, STAGE_MS * STAGES.length / 100);

    const stageTimer = setInterval(() => {
      setStage((s) => {
        if (s < STAGES.length - 1) return s + 1;
        clearInterval(stageTimer);
        return s;
      });
    }, STAGE_MS);

    const finish = setTimeout(async () => {
      const result = analysisDone ?? (await analyzeResume(file, jobLevel));
      if (!mounted) return;
      setResult(result);
      setProgress(100);
      setTimeout(() => nav("/results"), 400);
    }, STAGE_MS * STAGES.length);

    return () => { mounted = false; clearInterval(tick); clearInterval(stageTimer); clearTimeout(finish); };
  }, [file, jobLevel, nav, setResult]);

  return (
    <PageShell hideNav>
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Document scan visual */}
        <div className="relative w-72 h-96 mb-10">
          {/* Glow */}
          <div className="absolute -inset-10 bg-gradient-primary opacity-30 blur-3xl rounded-full animate-pulse" />

          {/* Document */}
          <div className="relative w-full h-full rounded-2xl glass-strong overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="h-3 w-3/4 rounded bg-gradient-to-r from-primary to-accent animate-shimmer bg-[length:200%_100%]" />
              <div className="h-2 w-1/2 rounded bg-muted-foreground/20" />
              <div className="pt-3 space-y-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 rounded bg-muted-foreground/15"
                    style={{ width: `${50 + ((i * 17) % 45)}%` }}
                  />
                ))}
              </div>
              <div className="pt-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 rounded bg-muted-foreground/15"
                    style={{ width: `${40 + ((i * 23) % 50)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Scan beam */}
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-scan pointer-events-none" />
            <div className="absolute inset-x-0 h-[2px] bg-primary shadow-glow animate-scan pointer-events-none" />

            {/* Corner brackets */}
            {["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map((c) => (
              <div key={c} className={`absolute w-6 h-6 border-primary ${c}`} />
            ))}
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin-slow pointer-events-none">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-glow" />
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-glow" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
        </div>

        <div className="text-center max-w-xl space-y-3 mb-8">
          <h2 className="font-display text-3xl lg:text-4xl font-bold">
            <span className="gradient-text">Analyzing</span> your resume…
          </h2>
          <p className="text-muted-foreground">
            Our AI is reading every line. This usually takes ~30 seconds.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xl space-y-2 mb-8">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-300 shadow-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{Math.round(progress)}%</span>
            <span>{file?.name}</span>
          </div>
        </div>

        {/* Stages */}
        <ol className="w-full max-w-xl space-y-2">
          {STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            const Icon = s.icon;
            return (
              <li
                key={s.id}
                className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-500 ${
                  active ? "glass-strong scale-[1.01]" : done ? "opacity-60" : "opacity-40"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  done ? "bg-success/20 text-success" : active ? "bg-gradient-primary text-primary-foreground animate-pulse-glow" : "bg-secondary text-muted-foreground"
                }`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : active ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </PageShell>
  );
}
