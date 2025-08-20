import { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type CommonProps = PropsWithChildren<{
  className?: string;
  variant?: Variant;
  size?: Size;
}>;

type AnchorButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" };
type NativeButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };
type RouterLinkButtonProps = CommonProps & LinkProps & { as: "link" };
type ButtonProps = AnchorButtonProps | NativeButtonProps | RouterLinkButtonProps;

const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 disabled:pointer-events-none";

const byVariant: Record<Variant, string> = {
  primary: "bg-violet-600 text-white hover:bg-violet-700",
  secondary: "border border-slate-200 text-slate-800 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const bySize: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export const Button = (props: ButtonProps) => {
  const { className, variant = "primary", size = "md", children, as = "button" } = props as ButtonProps & { as?: "a" | "button" | "link" };
  const classes = cn(base, byVariant[variant], bySize[size], className);
  if (as === "a") {
    const { as: _as, ...rest } = props as AnchorButtonProps;
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }
  if (as === "link") {
    const { as: _as, ...rest } = props as RouterLinkButtonProps;
    return (
      <Link className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  const { as: _as, ...rest } = props as NativeButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;


