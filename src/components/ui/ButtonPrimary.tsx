import Link from "next/link";
import React from "react";

type ButtonSize = "SMALL" | "MEDIUM" | "LARGE";

type Variant = "PRIMARY" | "SECONDARY" | "INVERT";

interface FancyButtonProps {
  size?: ButtonSize;
  text: string;
  href: string;
  variant?: Variant;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  SMALL:
    "px-3 py-3 text-[11px] md:px-5 md:py-2.5",
  MEDIUM:
    "px-3 py-3 text-[13px] md:px-4 md:py-4 ",
  LARGE:
    "px-8 py-4 text-base  md:px-9 md:py-5",
};

const variantclass: Record<Variant, string> = {
  PRIMARY:
    "bg-vintage-primary text-white shadow-sm border-[#46478c] border-1 hover:bg-vintage-hover hover:text-white",
  SECONDARY:
    "bg-vintage-secondary200 text-white shadow-sm hover:bg-vintage-primary hover:text-white",
  INVERT:
    "bg-white  shadow-sm text-vintage-primary border-[#EAEAEA] border-2 border-solid hover:bg-vintage-hover hover:text-white",
};

const ButtonPrimary: React.FC<FancyButtonProps> = ({
  size = "MEDIUM",
  text,
  href,
  onClick,
  ariaLabel,
  variant = "PRIMARY",
  className = "",
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`
      whitespace-nowrap
      rounded-md
      relative inline-flex select-none items-center justify-center
      font-bold uppercase tracking-[0.18em]
      focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
       hover:text-vintage-primary
      ${variantclass[variant]}
      ${sizeClasses[size]}
      ${className}
    `}
    aria-label={ariaLabel || text}
  >
    <span className="relative z-20">{text}</span>
  </Link>
);

export default ButtonPrimary;
