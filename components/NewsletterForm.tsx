"use client";

import { useState, useEffect } from "react";
import { useNewsletter } from "@/app/hooks/useNewsletter";

interface NewsletterFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function NewsletterForm({
  title = "Follow the latest trends",
  subtitle = "with our daily newsletter",
  buttonText = "Submit",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const { subscribe, loading, success, error, reset } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await subscribe(email);
  };

  // Clear the form when submission is successful
  useEffect(() => {
    if (success) {
      setEmail("");
    }
  }, [success]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-[20px] md:text-[30px] font-bold">
        {title}
      </h1>
      <p className="text-[12px] md:text-[20px] font-light">
        {subtitle}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-row gap-4 mt-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@example.com"
          required
          disabled={loading}
          className="px-4 py-2 border border-[#999999] focus:outline-none focus:ring-2 text-[12px] md:text-base focus:ring-[#800000] focus:border-transparent placeholder:text-center disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="px-6 py-2 bg-[#800000] text-white text-[12px] md:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-900 transition-colors"
        >
          {loading ? "Sending..." : `${buttonText}`}
        </button>
      </form>
    </div>
  );
}
