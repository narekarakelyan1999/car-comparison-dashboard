import { ButtonLink } from "@/shared/ui";

export default function NotFound() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">That page is not part of the catalog.</p>
      <p className="mt-4">
        <ButtonLink href="/" variant="primary">
          Back to catalog
        </ButtonLink>
      </p>
    </>
  );
}
