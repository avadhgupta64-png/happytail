import { useLanguage } from "@/lib/language-context";
import { LANGUAGES } from "@/lib/translations";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        data-testid="button-language-switcher"
      >
        <Globe className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 max-h-80 overflow-y-auto bg-white dark:bg-gray-900 border border-border rounded-md shadow-lg z-[200]" data-testid="language-dropdown">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover-elevate transition-colors ${lang === l.code ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
              data-testid={`lang-option-${l.code}`}
            >
              <span>{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
