import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ label, className = "", ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none",
          className
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

export default Input;
