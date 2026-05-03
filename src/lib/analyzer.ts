import { AnalysisResult, JobLevel, Profession, SectionScore } from "@/context/ResumeContext";
import { extractResumeText } from "@/lib/fileParser";

// Profession-specific keyword libraries. Combined with level for final scoring.
const PROFESSION_KEYWORDS: Record<Profession, string[]> = {
  software: ["javascript", "typescript", "react", "node", "api", "git", "testing", "ci/cd", "docker", "system design", "agile"],
  data: ["python", "sql", "pandas", "machine learning", "etl", "tableau", "spark", "statistics", "modeling", "a/b test"],
  design: ["figma", "prototyping", "user research", "wireframes", "design system", "accessibility", "user flows", "usability", "interaction"],
  product: ["roadmap", "stakeholders", "user research", "metrics", "okrs", "discovery", "prioritization", "go-to-market", "kpi"],
  marketing: ["seo", "campaigns", "content", "analytics", "growth", "conversion", "brand", "social", "ctr", "funnel"],
  sales: ["pipeline", "quota", "crm", "salesforce", "prospecting", "negotiation", "closing", "revenue", "outbound", "account"],
  finance: ["forecasting", "modeling", "valuation", "budgeting", "excel", "audit", "gaap", "variance", "reconciliation", "compliance"],
  hr: ["recruiting", "onboarding", "performance", "engagement", "policies", "compliance", "ats", "diversity", "compensation"],
  operations: ["logistics", "supply chain", "process", "kpi", "lean", "vendors", "automation", "scheduling", "inventory"],
  healthcare: ["patient care", "clinical", "ehr", "hipaa", "diagnosis", "treatment", "compliance", "emr", "triage"],
  education: ["curriculum", "lesson plans", "assessment", "classroom", "students", "pedagogy", "iep", "differentiation"],
  customer: ["csat", "nps", "onboarding", "retention", "renewals", "playbooks", "support", "escalations", "advocacy"],
  other: ["communication", "leadership", "collaboration", "problem solving", "project management"],
};

const LEVEL_KEYWORDS: Record<JobLevel, string[]> = {
  entry: ["internship", "projects", "coursework", "team", "learning"],
  mid: ["led", "built", "shipped", "ownership", "metrics", "scaled"],
  senior: ["architected", "mentored", "roadmap", "stakeholders", "strategy", "led team"],
  executive: ["strategy", "p&l", "vision", "org", "hiring", "board", "growth", "transformation"],
};

const PROFESSION_LABEL: Record<Profession, string> = {
  software: "Software Engineering",
  data: "Data & Analytics",
  design: "Design / UX",
  product: "Product Management",
  marketing: "Marketing",
  sales: "Sales",
  finance: "Finance & Accounting",
  hr: "People / HR",
  operations: "Operations",
  healthcare: "Healthcare",
  education: "Education",
  customer: "Customer Success",
  other: "General",
};

const SECTION_SYNONYMS: Record<string, string[]> = {
  summary: ["summary", "profile", "objective", "about me", "professional summary", "career summary"],
  experience: ["experience", "work experience", "employment", "professional experience", "work history", "career history"],
  education: ["education", "academic", "qualifications", "academic background"],
  skills: ["skills", "technical skills", "core competencies", "competencies", "technologies", "tech stack"],
  projects: ["projects", "personal projects", "selected projects", "portfolio"],
};

async function readFileText(file: File): Promise<string> {
  return await extractResumeText(file);
}

function tokenize(s: string) {
  return s.toLowerCase().match(/[a-z][a-z+#./&]{1,}/g) || [];
}

function hasKeyword(text: string, kw: string): boolean {
  const k = kw.toLowerCase().trim();
  if (!k) return false;
  // Special chars (c++, c#, .net, ci/cd) — substring match
  if (/[+#./&]/.test(k)) return text.includes(k);
  // Word-boundary match
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

function hasSection(text: string, key: string): boolean {
  const syns = SECTION_SYNONYMS[key] || [key];
  return syns.some((s) => new RegExp(`\\b${s.replace(/\s+/g, "\\s+")}\\b`, "i").test(text));
}

interface AnalyzeArgs {
  file: File;
  level: JobLevel;
  profession: Profession;
  targetRole?: string;
  jobDescription?: string;
}

export async function analyzeResume({ file, level, profession, targetRole, jobDescription }: AnalyzeArgs): Promise<AnalysisResult> {
  const raw = await readFileText(file);
  const text = raw.toLowerCase();

  // Combined keyword set weighted toward profession.
  const profKeys = PROFESSION_KEYWORDS[profession];
  const levelKeys = LEVEL_KEYWORDS[level];
  const allKeys = Array.from(new Set([...profKeys, ...levelKeys]));

  const matched = allKeys.filter((k) => hasKeyword(text, k));
  const missing = allKeys.filter((k) => !hasKeyword(text, k));

  // Section-by-section scoring
  const sectionKeys = Object.keys(SECTION_SYNONYMS);
  const sections: SectionScore[] = sectionKeys.map((s) => {
    const present = hasSection(text, s);
    let score = present ? 70 : 30;
    let note = present ? "Detected" : "Missing — add this section";
    if (s === "experience" && present) {
      const bullets = (raw.match(/(^|\n)\s*[•\-*·▪►]\s|\n\s+(?=[A-Z])/g) || []).length;
      score = Math.min(100, 55 + bullets * 3);
      note = `${bullets} bullet${bullets === 1 ? "" : "s"} detected`;
    }
    if (s === "skills" && present) {
      const skillHits = profKeys.filter((k) => hasKeyword(text, k)).length;
      score = Math.min(100, 50 + skillHits * 8);
      note = `${skillHits}/${profKeys.length} ${PROFESSION_LABEL[profession]} skills`;
    }
    if (s === "summary" && present) {
      score = targetRole && text.includes(targetRole.toLowerCase()) ? 92 : 75;
      note = score > 85 ? "Tailored to target role" : "Could be more tailored";
    }
    const status: SectionScore["status"] = score >= 75 ? "good" : score >= 55 ? "warn" : "bad";
    return { name: s.charAt(0).toUpperCase() + s.slice(1), score, status, note };
  });

  // Readability
  const words = (raw.match(/\S+/g) || []).length;
  const bullets = (raw.match(/(^|\n)\s*[•\-*·▪►]\s/g) || []).length;
  const quantified = (raw.match(/\b\d[\d,.]*%?\b/g) || []).length;

  // Aggregate score
  const sectionAvg = sections.reduce((a, s) => a + s.score, 0) / sections.length;
  const keywordCoverage = matched.length / Math.max(1, allKeys.length);
  let score = Math.round(sectionAvg * 0.55 + keywordCoverage * 100 * 0.35 + Math.min(10, bullets / 2));
  if (words < 250) score -= 8;
  if (quantified < 3) score -= 5;
  score = Math.max(38, Math.min(98, score));

  // Issues
  const issues: string[] = [];
  sections.filter((s) => s.status === "bad").forEach((s) => issues.push(`${s.name} section needs improvement.`));
  if (missing.length > Math.ceil(allKeys.length * 0.4))
    issues.push(`Missing ${missing.length} important ${PROFESSION_LABEL[profession]} keywords.`);
  if (quantified < 3) issues.push("Add measurable results (numbers, %, $).");
  if (words < 250) issues.push("Resume content seems too short.");
  if (targetRole && !text.includes(targetRole.toLowerCase()))
    issues.push(`Target role "${targetRole}" is not mentioned anywhere.`);
  if (!issues.length) issues.push("Minor formatting tweaks recommended.");

  // Suggestions
  const suggestions = [
    `Tailor your summary to a ${PROFESSION_LABEL[profession]} ${level}-level role${targetRole ? ` (${targetRole})` : ""}.`,
    "Quantify achievements with concrete metrics (%, $, time saved).",
    "Lead each bullet with a strong action verb.",
    `Add keywords like: ${missing.slice(0, 5).join(", ") || "—"}.`,
    "Keep formatting ATS-safe: single column, no tables, standard fonts.",
  ];

  // JD match
  let jdMatch: AnalysisResult["jdMatch"];
  if (jobDescription && jobDescription.trim().length > 30) {
    const jdTokens = Array.from(new Set(tokenize(jobDescription))).filter((t) => t.length > 3);
    const jdMatched = jdTokens.filter((t) => hasKeyword(text, t));
    const jdScore = Math.round((jdMatched.length / Math.max(1, jdTokens.length)) * 100);
    jdMatch = {
      score: jdScore,
      matched: jdMatched.slice(0, 25),
      missing: jdTokens.filter((t) => !hasKeyword(text, t)).slice(0, 25),
    };
  }

  // Rewrites — profession + level aware
  const role = targetRole || `${level}-level ${PROFESSION_LABEL[profession]}`;
  const summaryByLevel = {
    entry: `Motivated ${PROFESSION_LABEL[profession]} professional with hands-on project experience and a passion for ${role}. Eager to bring strong fundamentals, fast learning, and reliable execution to a high-impact team.`,
    mid: `Results-driven ${PROFESSION_LABEL[profession]} contributor with 4+ years delivering measurable outcomes. Known for ${profKeys.slice(0, 3).join(", ")}, and shipping work that moves key metrics for ${role} teams.`,
    senior: `Senior ${PROFESSION_LABEL[profession]} leader with 8+ years owning end-to-end delivery, mentoring teams, and partnering with stakeholders to ship outcomes that matter. Deep expertise across ${profKeys.slice(0, 3).join(", ")}.`,
    executive: `Strategic ${PROFESSION_LABEL[profession]} executive with a track record of building high-performing orgs, owning P&L, and driving multi-million dollar growth across complex ${role} mandates.`,
  };
  const expByProfession: Record<Profession, string[]> = {
    software: [
      "Led migration to a modular service architecture, cutting deployment time by 42% and MTTR by 30%.",
      "Shipped a real-time dashboard adopted by 12K+ weekly active users.",
      "Lifted unit test coverage from 38% to 82% and established review standards.",
    ],
    data: [
      "Built ETL pipeline processing 8M events/day, reducing reporting latency from 24h to 15m.",
      "Designed A/B test framework that informed a 14% lift in conversion.",
      "Productionized ML model improving forecast accuracy by 22%.",
    ],
    design: [
      "Redesigned onboarding flow, lifting activation 18% within one quarter.",
      "Established a design system used across 6 squads, cutting design-to-ship time 35%.",
      "Led 20+ user research sessions to inform feature roadmap.",
    ],
    product: [
      "Owned roadmap for a $4M ARR product line; shipped 3 major releases hitting 110% of OKRs.",
      "Launched discovery practice that killed 4 low-value bets, saving ~6 eng months.",
      "Drove cross-functional GTM that grew MAU 38% YoY.",
    ],
    marketing: [
      "Scaled SEO program to 1.2M monthly organic sessions (+74% YoY).",
      "Launched paid funnel cutting CAC by 28% while doubling MQLs.",
      "Built content engine producing 40+ pieces/quarter.",
    ],
    sales: [
      "Closed $2.3M in net new ARR, hitting 142% of quota two years running.",
      "Built outbound playbook lifting team-wide pipeline by 60%.",
      "Negotiated multi-year enterprise contracts averaging $250K ACV.",
    ],
    finance: [
      "Built three-statement model used for $30M Series B raise.",
      "Cut close cycle from 12 to 5 days through automation.",
      "Identified $1.1M annual savings via vendor consolidation.",
    ],
    hr: [
      "Scaled hiring from 40 to 110 in 12 months while lifting offer-acceptance to 91%.",
      "Rolled out engagement program; eNPS climbed from 22 to 48.",
      "Designed leveling framework adopted org-wide.",
    ],
    operations: [
      "Reduced order fulfillment time 35% via process redesign.",
      "Negotiated vendor contracts saving $480K annually.",
      "Implemented automation cutting manual ops hours 60%.",
    ],
    healthcare: [
      "Managed caseload of 30+ patients with 98% care plan adherence.",
      "Reduced chart-completion time 40% by standardizing EHR templates.",
      "Trained 12 staff on updated HIPAA-compliant workflows.",
    ],
    education: [
      "Designed differentiated curriculum lifting student proficiency 23%.",
      "Mentored 4 new teachers through onboarding program.",
      "Integrated tech tools raising student engagement scores 30%.",
    ],
    customer: [
      "Owned book of 60 accounts ($4M ARR) with 96% gross retention.",
      "Built onboarding playbook cutting time-to-value from 45 to 18 days.",
      "Drove $1.2M in expansion revenue through proactive QBRs.",
    ],
    other: [
      "Owned end-to-end delivery of cross-functional initiative driving 25% efficiency gains.",
      "Led team of 5 through complex turnaround project on schedule and under budget.",
      "Built reporting framework adopted by leadership team.",
    ],
  };

  const coverLetter = `Dear Hiring Team,

I'm excited to apply for the ${role} role. With a background in ${PROFESSION_LABEL[profession]} and proven strengths in ${profKeys.slice(0, 3).join(", ")}, I'm confident I can contribute meaningfully from day one.

In recent roles I've ${expByProfession[profession][0].toLowerCase()} I take pride in pairing strong execution with measurable impact, and I'm drawn to your team's mission and the opportunity to grow alongside talented colleagues.

I'd welcome the chance to discuss how my experience aligns with your needs. Thank you for your consideration.

Sincerely,
${"{Your Name}"}`;

  return {
    score,
    issues,
    suggestions,
    rewrites: {
      summary: summaryByLevel[level],
      experience: expByProfession[profession],
      coverLetter,
    },
    errors: [],
    keywords: { matched, missing },
    sections,
    jdMatch,
    readability: {
      words,
      bullets,
      quantified,
      readingTime: `${Math.max(1, Math.round(words / 220))} min`,
    },
  };
}

export { PROFESSION_LABEL };
