"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  payload?: unknown;
}

export type SelectOptionInput = SelectOption | string;

export interface SearchableSelectProps {
  options: SelectOptionInput[];
  value?: string;
  onChange: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  onAddCustom?: (customValue: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  searchable?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  allowCustom = false,
  onAddCustom,
  disabled = false,
  className = "",
  label,
  required,
  error,
  searchable,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Determine whether search bar should be displayed
  const shouldShowSearch = searchable !== undefined ? searchable : normalizedOptions.length > 6;

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.description?.toLowerCase().includes(search.toLowerCase()) ||
      opt.badge?.toLowerCase().includes(search.toLowerCase())
  );

  const hasExactMatch = normalizedOptions.some(
    (opt) => opt.label.toLowerCase() === search.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const openDropdown = () => {
    setIsOpen(true);
    setSearch("");
    setHighlightedIndex(0);
    if (shouldShowSearch) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value, option);
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (onAddCustom) {
      onAddCustom(trimmed);
    } else {
      onChange(trimmed, { value: trimmed, label: trimmed });
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (allowCustom && search.trim() && !hasExactMatch) {
        handleAddCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button with Generous Spacious Height */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && (isOpen ? setIsOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm outline-none cursor-pointer select-none min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px] ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
            : isOpen
            ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 bg-[var(--bg-surface)] shadow-xs"
            : error
            ? "border-red-500 bg-red-50/20"
            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--brand-border)]"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]/50 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : value ? (
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{value}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title="Clear selection"
              className="hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-[var(--bg-subtle)] transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--brand-primary)]" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 w-full rounded-3xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-2.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Search bar */}
          {shouldShowSearch && (
            <div className="relative mb-2 shrink-0">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] py-2.5 input-icon-left !pl-11 pr-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scroll max-h-56">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                      isSelected
                        ? "bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold shadow-2xs"
                        : isHighlighted
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[var(--brand-primary)] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">No matching results</p>
              </div>
            )}

            {/* Custom option button */}
            {allowCustom && search.trim() && !hasExactMatch && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="w-full mt-1 text-left px-3.5 py-2.5 rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] text-xs font-semibold text-[var(--brand-text)] hover:opacity-90 flex items-center gap-2 cursor-pointer"
              >
                <span>➕ Add custom: &ldquo;{search.trim()}&rdquo;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Alias export for consistency
export const CustomSelect = SearchableSelect;
