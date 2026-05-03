import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useResume, JobLevel } from "@/context/ResumeContext";
import { useEffect } from "react";
import { GraduationCap, Briefcase, Crown, Star } from "lucide-react";

const LEVELS: { id: JobLevel; title: string; desc: string; icon: typeof Star; years: string }[] = [
  { id: "entry", title: "Entry Level", desc: "Just starting out, recent grad, or career switcher.", icon: GraduationCap, years: "0–2 yrs" },
  { id: "mid", title: "Mid Level", desc: "Confident IC delivering features end-to-end.", icon: Briefcase, years: "3–5 yrs" },
  { id: "senior", title: "Senior", desc: "Owns systems, mentors, leads roadmaps.", icon: Star, years: "6–10 yrs" },
  { id: "executive", title: "Executive", desc: "Director, VP, C-suite — strategic leadership.", icon: Crown, years: "10+ yrs" },
];

export default function JobLevelPage() {
  const nav = useNavigate();
  const { jobLevel, setJobLevel, file } = useResume();

  useEffect(() => { if (!file) nav("/upload"); }, [file, nav]);

  return (
    <PageShell>
      <section className="container max-w-5xl py-12 lg:py-16">
        <div className="text-center space-y-3 mb-10 animate-fade-in">
          <span className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Step 3 of 4 · Seniority
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            Pick your <span className="gradient-text">target level</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We calibrate scoring and rewrites to match the seniority you're aiming for.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {LEVELS.map((l) => {
            const active = jobLevel === l.id;
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => setJobLevel(l.id)}
                className={`text-left rounded-2xl p-5 border transition-all duration-200 ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold">{l.title}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{l.years}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={() => nav("/profession")}>← Back</Button>
          <Button
            size="lg"
            onClick={() => nav("/analyzing")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground border-0 shadow-glow font-semibold px-8"
          >
            Analyze resume →
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
