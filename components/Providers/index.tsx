"use client";

import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ProfileProvider>
        {children}
        <Toaster richColors />
      </ProfileProvider>
    </AuthProvider>
  );
};

export default Providers;
