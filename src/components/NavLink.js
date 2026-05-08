"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// simple class merge (replacement of cn)
const cn = (...classes) => classes.filter(Boolean).join(" ");

const NavLink = forwardRef(
  ({ href, className, activeClassName, children, ...props }, ref) => {
    const pathname = usePathname();

    const isActive = pathname === href;

    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          className,
          isActive && activeClassName
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };