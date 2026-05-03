import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const Logo = ({ to = "/upload" }: { to?: string }) => (
  <Link to={to} className="flex items-center gap-2 group">
    <div className="relative bg-gradient-primary p-2 rounded-lg shadow-glow">
      <Sparkles className="w-4 h-4 text-primary-foreground" />
    </div>
    <span className="font-display font-bold text-lg tracking-tight">
      Resume<span className="gradient-text">AI</span>
    </span>
  </Link>
);
