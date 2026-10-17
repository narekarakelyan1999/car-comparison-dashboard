import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./button-styles";

type ButtonLinkProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "children" | "className">;

export function ButtonLink({
  children,
  variant = "secondary",
  size = "default",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link {...props} className={buttonClassName({ variant, size, className })}>
      {children}
    </Link>
  );
}
