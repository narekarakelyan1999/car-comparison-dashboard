import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./button-styles";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Button({
  children,
  variant = "secondary",
  size = "default",
  type = "button",
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={buttonClassName({ variant, size, disabled, className })}
    >
      {children}
    </button>
  );
}
