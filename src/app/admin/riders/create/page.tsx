"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRider } from "@/lib/riders-api";

const inputClass = "mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function CreateRiderPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await createRider({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
    setLoading(false);
    if (res.success && res.data) {
      router.push(`/admin/riders/${res.data._id}`);
      return;
    }
    setError(res.message || "Failed to create rider.");
  }

  return (
    <div className="max-w-xl">
      <div className="mb-4">
        <Link href="/admin/riders" className="text-sm font-medium text-[#81007f] hover:underline">← Back to riders</Link>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Create rider</h1>
      <p className="mt-1 text-sm text-neutral-600 mb-6">Add a new rider. A user account will be created so they can log in.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First name</label>
            <input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="John" />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last name</label>
            <input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Doe" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="rider@example.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+234..." />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Link href="/admin/riders" className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg border border-neutral-300 bg-white font-medium text-neutral-700 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={loading} className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-[#81007f] text-white font-medium hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60">
            {loading ? "Creating…" : "Create rider"}
          </button>
        </div>
      </form>
    </div>
  );
}
