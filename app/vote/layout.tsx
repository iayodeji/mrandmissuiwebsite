import type { Metadata } from "next";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Vote — Mr & Miss Unibadan 2026",
  description:
    "Cast your vote for Mr and Miss Unibadan 2026. Select one Mr candidate and one Miss candidate from the University of Ibadan and submit your ballot securely.",
  path: "/vote",
});

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
