"use client";
import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Plus, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/AuthProvider';
import RequireAuth from "@/components/RequireAuth";

const AppSidebarFooter = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const { logout } = useAuth()

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <RequireAuth>
      <div className="flex gap-1" style={{ alignItems: "center" }}>
        {mounted && (
          <Button
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        )}
        <Link href="/workflows/new">
          <Button className="bg-blue hover:bg-blue-dark">
            <Plus />
            New Workflow
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" onClick={logout}>
            <LogOut />
          </Button>
        </Link>
      </div>
    </RequireAuth>
  );
};

export default AppSidebarFooter;
