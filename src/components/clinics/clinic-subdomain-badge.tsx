"use client";

import { useState, useSyncExternalStore } from "react";
import { Globe, ExternalLink, Copy, Check } from "lucide-react";

interface ClinicSubdomainBadgeProps {
  slug: string;
  clinicName: string;
}

const emptySubscribe = () => () => {};

export function ClinicSubdomainBadge({ slug }: ClinicSubdomainBadgeProps) {
  const [copied, setCopied] = useState(false);

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const host = isMounted && typeof window !== "undefined" ? window.location.host : "";
  const protocol = isMounted && typeof window !== "undefined" ? window.location.protocol : "http:";
  const hostWithoutPort = host.replace(/:\d+$/, "");
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const hostLower = hostWithoutPort.toLowerCase();
  const isOnSubdomain =
    isMounted &&
    (hostLower === `${slug.toLowerCase()}.localhost` ||
      hostLower.startsWith(`${slug.toLowerCase()}.`));

  let targetDomain = "";
  if (hostWithoutPort === "localhost") {
    targetDomain = `${slug}.localhost${port}`;
  } else if (hostLower.startsWith(`${slug.toLowerCase()}.`)) {
    targetDomain = host;
  } else {
    targetDomain = `${slug}.${hostWithoutPort || "ppms.local"}${port}`;
  }

  const subdomainUrl = isMounted ? `${protocol}//${targetDomain}` : "";
  const displayHost = targetDomain;

  const handleCopy = async () => {
    if (!subdomainUrl) return;
    try {
      await navigator.clipboard.writeText(subdomainUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
        <Globe className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
        <span className="text-slate-400 select-none">Subdomain:</span>
        <strong className="text-[var(--brand-text)] font-bold">
          {displayHost || `${slug}.localhost:3000`}
        </strong>
        {isOnSubdomain && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Tenant
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
        title="Copy clinic subdomain URL to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Copied URL</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {!isOnSubdomain && subdomainUrl && (
        <a
          href={subdomainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:opacity-90 text-xs font-bold transition border border-[var(--brand-border)] shadow-2xs"
        >
          <span>Open Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
