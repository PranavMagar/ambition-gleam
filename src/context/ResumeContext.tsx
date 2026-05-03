import { createContext, useContext, useState, ReactNode } from "react";

export type JobLevel = "entry" | "mid" | "senior" | "executive";

export interface AnalysisResult {
  score: number;
  issues: string[];
  suggestions: string[];
  rewrites: { summary: string; experience: string[] };
  errors: string[];
  keywords: { matched: string[]; missing: string[] };
}

interface ResumeCtx {
  file: File | null;
  setFile: (f: File | null) => void;
  jobLevel: JobLevel;
  setJobLevel: (l: JobLevel) => void;
  result: AnalysisResult | null;
  setResult: (r: AnalysisResult | null) => void;
  user: { name: string; email: string } | null;
  setUser: (u: { name: string; email: string } | null) => void;
}

const Ctx = createContext<ResumeCtx | null>(null);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobLevel, setJobLevel] = useState<JobLevel>("mid");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  return (
    <Ctx.Provider value={{ file, setFile, jobLevel, setJobLevel, result, setResult, user, setUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const useResume = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useResume must be used inside ResumeProvider");
  return c;
};
