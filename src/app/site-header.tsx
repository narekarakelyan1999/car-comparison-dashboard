import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-lg font-semibold text-slate-900"
        >
          {siteConfig.name}
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-medium text-slate-700"
        >
          Catalog
        </Link>
      </div>
    </header>
  );
}
