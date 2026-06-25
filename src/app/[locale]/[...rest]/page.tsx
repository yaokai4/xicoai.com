import { notFound } from "next/navigation";

// Any unmatched path under a locale falls through to the branded 404.
export default function CatchAll() {
  notFound();
}
