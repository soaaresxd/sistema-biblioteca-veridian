"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #e2e8f0",
          fontSize: "15px",
          fontWeight: "600",
        },
        classNames: {
          title: "!text-black font-semibold",
          description: "!text-black",
          success: "!bg-white !text-black !border-emerald-500",
          error: "!bg-white !text-black !border-red-500",
          warning: "!bg-white !text-black !border-amber-500",
          info: "!bg-white !text-black !border-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
