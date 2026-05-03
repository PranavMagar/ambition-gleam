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

  useEffect(() => {
    if (!file) nav("/upload");
  }, [file, nav]);

  return (
    <PageShell>
      <section className="container max-w-5xl py-12 lg:py-20">
        <div className="text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Step 2 of 3 · Target seniority</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold">
            Pick your <span className="gradient-text">target level</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We'll calibrate scoring, suggested keywords, and rewrites to match the level you're applying for.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {LEVELS.map((l, i) => {
            const active = jobLevel === l.id;
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => setJobLevel(l.id)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`group relative text-left rounded-2xl p-6 transition-all duration-300 animate-fade-in ${
                  active ? "scale-[1.02] shadow-glow" : "hover:scale-[1.01]"
                }`}
              >
                <div className={`absolute inset-0 rounded-2xl ${active ? "bg-gradient-primary opacity-100" : "glass"}`} />
                <div className={`absolute inset-[1.5px] rounded-2xl ${active ? "bg-card" : ""}`} />
                <div className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-foreground group-hover:bg-gradient-primary group-hover:text-primary-foreground transition"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold">{l.title}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{l.years}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-10">
          <Button variant="ghost" onClick={() => nav("/upload")}>← Back</Button>
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
