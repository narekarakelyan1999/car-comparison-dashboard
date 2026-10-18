"use client";

import { Button, ButtonLink } from "@/shared/ui";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">The page could not be loaded.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => retry()}>
          Try again
        </Button>
        <ButtonLink href="/">Back to catalog</ButtonLink>
      </div>
    </>
  );
}
