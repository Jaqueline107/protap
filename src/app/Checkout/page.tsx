"use client";

// Força a página a ser renderizada só no cliente
export const dynamic = "force-dynamic";

import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return <CheckoutClient />;
}
