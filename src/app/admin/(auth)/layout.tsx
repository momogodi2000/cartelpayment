import React from "react";

export const dynamic = "force-dynamic";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col justify-center">
      {children}
    </main>
  );
}
