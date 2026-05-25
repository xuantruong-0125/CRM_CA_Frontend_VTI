"use client";

import React, { HTMLProps, useEffect, useRef } from "react";

interface IndeterminateCheckboxProps extends HTMLProps<HTMLInputElement> {
  indeterminate?: boolean;
}

export const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  indeterminate,
  className = "",
  ...rest
}) => {
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"}
      {...rest}
    />
  );
};
