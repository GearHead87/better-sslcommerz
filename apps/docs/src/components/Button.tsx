import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Link } from "next-view-transitions";

const variantStyles = {
  primary:
    "rounded-full bg-action py-1 px-3 text-white hover:bg-[#005fb0] dark:bg-sky-500/15 dark:text-sky-300 dark:ring-1 dark:ring-inset dark:ring-sky-400/30 dark:hover:bg-sky-500/20 dark:hover:text-sky-200 dark:hover:ring-sky-300",
  secondary:
    "rounded-full bg-zinc-100 py-1 px-3 text-zinc-900 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-200 dark:ring-1 dark:ring-inset dark:ring-white/10 dark:hover:bg-white/10 dark:hover:text-white",
  filled:
    "rounded-full bg-action py-1 px-3 text-white hover:bg-[#005fb0] dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400",
  outline:
    "rounded-full py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-300 dark:ring-white/15 dark:hover:bg-white/5 dark:hover:text-white",
  text: "text-action hover:text-[#005fb0] dark:text-sky-400 dark:hover:text-sky-300",
};

type ButtonProps = {
  variant?: keyof typeof variantStyles;
  arrow?: "left" | "right";
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (React.ComponentPropsWithoutRef<"button"> & { href?: undefined })
);

export function Button({
  variant = "primary",
  className,
  children,
  arrow,
  ...props
}: ButtonProps) {
  className = clsx(
    "inline-flex gap-1 justify-center items-center overflow-hidden text-sm font-medium transition",
    variantStyles[variant],
    className,
  );

  let inner = (
    <>
      {arrow === "left" && <ArrowLeftIcon className="size-4" />}
      {children}
      {arrow === "right" && <ArrowRightIcon className="size-4" />}
    </>
  );

  if (typeof props.href === "undefined") {
    return (
      <button className={className} {...props}>
        {inner}
      </button>
    );
  }

  return (
    <Link className={className} {...props}>
      {inner}
    </Link>
  );
}
