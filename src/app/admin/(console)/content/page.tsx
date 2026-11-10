import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import ContentBlockModal from "./ContentBlockModal";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireSuperAdmin();

  const blocks = await prisma.contentBlock.findMany({
    orderBy: [{ key: "asc" }, { locale: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Content Blocks CMS
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Dynamic editorial copy, announcement banners, legal policy revisions, and concierge FAQs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ContentBlockModal />
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
            {blocks.length} Content Blocks
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Key</th>
                <th className="py-3 px-4">Locale</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Content Preview</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No custom content blocks defined yet. Default JSON strings are currently in use.
                  </td>
                </tr>
              ) : (
                blocks.map((block) => (
                  <tr key={block.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {block.key}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                        {block.locale}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {block.title || "—"}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-sm truncate">
                      {block.content}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(block.updatedAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ContentBlockModal block={block} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
