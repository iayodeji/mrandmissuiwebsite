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
      <div className="vote-form">
        <p className="eyebrow">Voting link</p>
        <h2 className="vote-form-title">Request your ballot</h2>
        <p className="vote-form-sub">
          Enter your email and we&apos;ll send your secure voting link.
        </p>

        {message && (
          <div
            className={`vote-message vote-message--${message.type}`}
            role="status"
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="vote-form-fields">
          <div>
            <label htmlFor="email" className="vote-field-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="vote-input"
              disabled={loading}
            />
          </div>

          {/* Turnstile CAPTCHA */}
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-theme="dark"
            data-action="vote"
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="gold-button focus-ring vote-submit"
          >
            {loading ? "Sending..." : "Send Voting Link"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="vote-form-note">
          Your vote is secure and anonymous. One email = one vote.
        </p>
      </div>
    </>
  );
}
