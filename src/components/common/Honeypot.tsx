import React from "react";

export default function Honeypot() {
  return (
    <div className="absolute overflow-hidden h-0 w-0 -z-50 opacity-0" aria-hidden="true">
      {/* Visually hidden fields to trap spam scripts */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        placeholder="Your Website URL"
        autoComplete="off"
      />
      <input
        type="text"
        name="middle_name"
        tabIndex={-1}
        placeholder="Your Middle Name"
        autoComplete="off"
      />
    </div>
  );
}
