// src/components/ui/TagSelector.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Tag } from "@/types";
import { X } from "lucide-react";

interface TagSelectorProps {
  selected: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermer le menu si clic hors du composant
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tags?search=${encodeURIComponent(query)}`,
      );
      const data: Tag[] = await res.json();
      // Exclure les tags déjà sélectionnés
      setSuggestions(data.filter((t) => !selected.some((s) => s.id === t.id)));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!open) return;

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(input);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, open, fetchSuggestions]);

  function handleFocus() {
    setOpen(true);
  }

  function addTag(tag: Tag) {
    onChange([...selected, tag]);
    setInput("");
    setSuggestions((prev) => prev.filter((t) => t.id !== tag.id));
    inputRef.current?.focus();
  }

  function removeTag(id: string) {
    onChange(selected.filter((t) => t.id !== id));
  }

  async function createTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) return;
      const tag: Tag = await res.json();
      // Ne pas ajouter si déjà sélectionné
      if (!selected.some((s) => s.id === tag.id)) {
        addTag(tag);
      }
    } catch {
      // silencieux
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      // Si une suggestion correspond exactement, l'utiliser
      const exact = suggestions.find(
        (s) => s.name.toLowerCase() === input.trim().toLowerCase(),
      );
      if (exact) {
        addTag(exact);
      } else {
        createTag(input.trim());
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && selected.length > 0) {
      removeTag(selected[selected.length - 1].id);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showCreateOption =
    input.trim().length > 0 &&
    !suggestions.some(
      (s) => s.name.toLowerCase() === input.trim().toLowerCase(),
    );

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium text-stone-600 uppercase tracking-wide block mb-1.5">
        Tags
      </label>

      {/* Zone de saisie + chips */}
      <div
        className={`min-h-[38px] w-full flex flex-wrap gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white text-sm transition-all cursor-text
          ${open ? "border-teal-400 ring-2 ring-teal-400/20" : "border-stone-200 hover:border-stone-300"}`}
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-xs font-medium"
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
              className="text-teal-400 hover:text-teal-700 transition-colors"
              aria-label={`Retirer ${tag.name}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Rechercher ou créer un tag…" : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent placeholder:text-stone-400 text-stone-800"
        />
      </div>

      <p className="mt-1 text-[11px] text-stone-400">
        Entrée ou virgule pour valider · Retour arrière pour supprimer
      </p>

      {/* Dropdown suggestions */}
      {open && (input.trim().length > 0 || suggestions.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          {loading && (
            <div className="px-3 py-2 text-xs text-stone-400">Chargement…</div>
          )}

          {!loading && suggestions.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-xs text-stone-400">Aucun tag trouvé</div>
          )}

          {!loading && suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // évite blur avant click
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              {tag.name}
            </button>
          ))}

          {showCreateOption && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                createTag(input.trim());
                setInput("");
              }}
              className="w-full text-left px-3 py-2 text-sm text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-2 border-t border-stone-100"
            >
              <span className="text-teal-500 font-bold">+</span>
              Créer «&nbsp;{input.trim()}&nbsp;»
            </button>
          )}
        </div>
      )}
    </div>
  );
}
