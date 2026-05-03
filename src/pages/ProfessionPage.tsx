import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResume, Profession } from "@/context/ResumeContext";
import { useEffect } from "react";
import {
  Code2, BarChart3, Palette, Target, Megaphone, Handshake,
  Calculator, Users, Settings2, HeartPulse, GraduationCap, Headphones, Briefcase,
} from "lucide-react";

const PROFESSIONS: { id: Profession; label: string; icon: typeof Code2 }[] = [
  { id: "software", label: "Software Eng", icon: Code2 },
  { id: "data", label: "Data / Analytics", icon: BarChart3 },
  { id: "design", label: "Design / UX", icon: Palette },
  { id: "product", label: "Product Mgmt", icon: Target },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "sales", label: "Sales", icon: Handshake },
  { id: "finance", label: "Finance", icon: Calculator },
  { id: "hr", label: "HR / People", icon: Users },
  { id: "operations", label: "Operations", icon: Settings2 },
  { id: "healthcare", label: "Healthcare", icon: HeartPulse },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "customer", label: "Customer Success", icon: Headphones },
  { id: "other", label: "Other", icon: Briefcase },
];

export default function ProfessionPage() {
  const nav = useNavigate();
  const { file, profession, setProfession, targetRole, setTargetRole, jobDescription, setJobDescription } = useResume();

  useEffect(() => { if (!file) nav("/upload"); }, [file, nav]);

  return (
    <PageShell>
      <section className="container max-w-4xl py-12 lg:py-16">
        <div className="text-center space-y-3 mb-10 animate-fade-in">
          <span className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Step 2 of 4 · Your field
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
            What role are you <span className="gradient-text">applying for</span>?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We tailor scoring, keywords and rewrites to your profession and target role.
          </p>
        </div>

        <div className="surface p-6 space-y-6">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
              Profession
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {PROFESSIONS.map((p) => {
                const Icon = p.icon;
                const active = profession === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setProfession(p.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                      active
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Target role <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="role"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Why this matters
              </Label>
              <p className="text-sm text-muted-foreground">
                We'll check if your resume mentions this role and align suggestions accordingly.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd">Job description <span className="text-muted-foreground">(optional, paste to match)</span></Label>
            <Textarea
              id="jd"
              rows={6}
              placeholder="Paste the job description here for a personalized match score…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Adding a JD unlocks a side-by-side keyword match score in your results.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" onClick={() => nav("/upload")}>← Back</Button>
          <Button
            size="lg"
            onClick={() => nav("/job-level")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground border-0 shadow-glow font-semibold px-8"
          >
            Continue →
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
