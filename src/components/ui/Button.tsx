import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

const variants: Record<ButtonVariant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost: "btn btn-ghost",
  danger: "bg-danger-soft text-danger hover:bg-red-100 btn",
  success: "bg-success-soft text-success hover:bg-emerald-100 btn",
};

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  children: React.ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

interface ActionButtonProps {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
}

export function ActionButton({
  label,
  variant = "secondary",
  onClick,
  disabled,
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="!px-3 !py-1.5 !text-xs"
    >
      {label}
    </Button>
  );
}
