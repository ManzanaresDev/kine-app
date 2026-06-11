// app/components/NavLinks.tsx
"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/exercises", label: "Exercices" },
    { href: "/programs", label: "Programmes" },
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <a
            key={href}
            href={href}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm transition-colors",
              isActive
                ? "text-salmon-600 bg-salmon-50 font-medium"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
            )}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
