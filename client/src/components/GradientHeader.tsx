import { Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "wouter";

export function GradientHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-gradient-to-r from-[hsl(258,90%,66%)] to-[hsl(191,91%,44%)] px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" className="text-white hover:bg-white/20" />
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <CheckSquare className="h-6 w-6 text-white" />
            <h1 className="font-heading text-xl font-bold text-white">Smart Task Planner</h1>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white hover:bg-white/20"
          data-testid="button-search"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Link href="/settings">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/20"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
        <ThemeToggle />
        <Avatar className="h-8 w-8 border-2 border-white/30" data-testid="button-profile">
          <AvatarFallback className="bg-white/20 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function CheckSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
