"use client";

import { useState } from "react";
import Script from "next/script";

export function VotingEmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // Get CAPTCHA token
      const turnstileToken = (window as any).turnstile?.getResponse?.();
      if (!turnstileToken) {
        setMessage({ type: "error", text: "Please complete the CAPTCHA." });
        setLoading(false);
        return;
      }

      // Submit to backend
      const response = await fetch("/api/request-vote-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captchaToken: turnstileToken,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong." });
        (window as any).turnstile?.reset?.();
        setLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Voting link sent! Check your email.",
      });
      setEmail("");
      (window as any).turnstile?.reset?.();
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
      (window as any).turnstile?.reset?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">🗳️ Cast Your Vote</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email to receive your voting link
        </p>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              disabled={loading}
            />
          </div>

          {/* Turnstile CAPTCHA */}
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-theme="light"
          />

          <button
            type="submit"
            disabled={loading || !email}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              loading || !email
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
            }`}
          >
            {loading ? "Sending..." : "Send Voting Link"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your vote is secure and anonymous. One email = one vote.
        </p>
      </div>
    </>
  );
}
