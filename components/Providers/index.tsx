"use client";

import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors />
    </AuthProvider>
  );
};

export default Providers;
