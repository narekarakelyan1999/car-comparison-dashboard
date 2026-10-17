import { ButtonLink } from "./button-link";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
};

function EmptyStateAction({ action }: Pick<EmptyStateProps, "action">) {
  if (!action) {
    return null;
  }

  return (
    <p className="mt-4">
      <ButtonLink href={action.href} variant="primary">
        {action.label}
      </ButtonLink>
    </p>
  );
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-6 py-8">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-700">{description}</p>
      <EmptyStateAction action={action} />
    </section>
  );
}
