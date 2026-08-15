import type { JsonLdObject } from "@/lib/seo";

/**
 * Injects a JSON-LD structured-data block into the page head.
 * Safe to render multiple times per page (one script per object).
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
