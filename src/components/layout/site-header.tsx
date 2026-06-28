import Link from "next/link";
import { Building2, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost">
            <Link href="/report">
              <MapPin className="h-4 w-4" />
              Report
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/admin">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
          <Button asChild variant="secondary" className="sm:hidden" size="sm">
            <Link href="/report">Report</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
