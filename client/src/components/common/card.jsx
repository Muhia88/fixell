import React from "react";
import { cn } from "@/lib/utils";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-md p-4 border border-gray-100",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
