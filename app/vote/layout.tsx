import type { Metadata } from "next";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Vote — Mr & Miss Unibadan 2026",
  description:
    "Voting for Mr and Miss Unibadan 2026 has closed. The truth has been revealed.",
  path: "/vote",
});

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
