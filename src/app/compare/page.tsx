import { Suspense } from "react";
import type { Metadata } from "next";

import type { SearchParamRecord } from "@/features/catalog";
import { comparisonMetadata, ComparisonPage } from "@/features/comparison";

export async function generateMetadata({ searchParams }: PageProps<"/compare">): Promise<Metadata> {
  const params = await searchParams;

  return comparisonMetadata(params);
}

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <Suspense fallback={<p className="text-slate-700">Loading comparison…</p>}>
      <CompareContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CompareContent({ searchParams }: { searchParams: Promise<SearchParamRecord> }) {
  const params = await searchParams;

  return <ComparisonPage searchParams={params} />;
}
