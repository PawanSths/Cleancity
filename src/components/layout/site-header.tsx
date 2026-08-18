import Link from "next/link";
import { Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <span>CleanCity</span>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/report" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Report an Issue
          </Link>
          <Link href="/report" className="hidden md:inline-block">|</Link>
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
