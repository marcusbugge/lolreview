"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, TrendingUp, Clock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trending", label: "Most Searched", icon: TrendingUp },
  { href: "/recent", label: "Recent Reviews", icon: Clock },
];

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-3 hover:opacity-70 transition-opacity duration-200"
        aria-label="Toggle menu"
      >
        <div className="relative w-5 h-5">
          <span
            className={cn(
              "absolute left-0 w-5 h-0.5 bg-foreground transition-all duration-300",
              isOpen ? "top-2 rotate-45" : "top-1"
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-2 w-5 h-0.5 bg-foreground transition-all duration-300",
              isOpen ? "opacity-0 scale-0" : "opacity-100"
            )}
          />
          <span
            className={cn(
              "absolute left-0 w-5 h-0.5 bg-foreground transition-all duration-300",
              isOpen ? "top-2 -rotate-45" : "top-3"
            )}
          />
        </div>
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card/95 backdrop-blur-xl border-r border-white/10 z-40 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full pt-24 px-6">
          {/* Navigation items */}
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-auto pb-8">
            <p className="text-xs text-muted-foreground/50 text-center">
              Rate your teammates
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}

