'use client';

import React from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}
