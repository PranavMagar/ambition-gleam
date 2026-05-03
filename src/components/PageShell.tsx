import { ReactNode } from "react";
import { Logo } from "./Logo";
import { useResume } from "@/context/ResumeContext";
import { Link } from "react-router-dom";

export const PageShell = ({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) => {
  const { user } = useResume();
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      {!hideNav && (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <Logo />
            <nav className="flex items-center gap-4 text-sm">
              {user && (
                <span className="text-muted-foreground hidden sm:inline">
                  Hi, <span className="text-foreground font-medium">{user.name}</span>
                </span>
              )}
              <Link to="/upload" className="text-muted-foreground hover:text-foreground transition">
                New scan
              </Link>
            </nav>
          </div>
        </header>
      )}

      <main className="relative">{children}</main>
    </div>
  );
};
