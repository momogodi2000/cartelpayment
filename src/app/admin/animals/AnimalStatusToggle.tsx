"use client";

import React, { useState } from "react";
import { actionUpdateAnimalStatus } from "@/app/actions/admin";
import { AnimalStatus } from "@prisma/client";

interface Props {
  animalId: string;
  initialStatus: AnimalStatus;
  initialPublished: boolean;
}

export default function AnimalStatusToggle({ animalId, initialStatus, initialPublished }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AnimalStatus;
    setStatus(newStatus);
    setLoading(true);
    await actionUpdateAnimalStatus(animalId, newStatus, initialPublished);
    setLoading(false);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="px-2.5 py-1 rounded-lg border border-zinc-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#183C32] bg-white disabled:opacity-50"
    >
      <option value="AVAILABLE">AVAILABLE</option>
      <option value="HELD">HELD</option>
      <option value="SOLD">SOLD</option>
      <option value="UNAVAILABLE">UNAVAILABLE</option>
      <option value="ARCHIVED">ARCHIVED</option>
    </select>
  );
}
