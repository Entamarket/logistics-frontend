"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRiderById, updateRider, getRiderUser } from "@/lib/riders-api";

const inputClass = "mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function EditRiderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRiderById(id).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        const user = getRiderUser(res.data);
        if (user) {
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setPhone(user.phone);
          setEmail(user.email);
        }
        setStatus(res.data.status);
        setIsAvailable(res.data.isAvailable);
      } else setError(res.message || "Rider not found");
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("First name, last name, email, and phone are required.");
      return;
    }
    setSubmitting(true);
    const res = await updateRider(id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status: status || undefined,
      isAvailable,
    });
    setSubmitting(false);
    if (res.success) {
      router.push(`/admin/riders/${id}`);
      return;
    }
    setError(res.message || "Failed to update rider.");
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !firstName && !lastName) {
    return (
      <div>
        <Link href="/admin/riders" className="text-sm font-medium text-[#81007f] hover:underline">← Back to riders</Link>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-4">
        <Link href={`/admin/riders/${id}`} className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to rider
        </Link>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Edit rider</h1>
      <p className="mt-1 text-sm text-neutral-600 mb-6">Update rider and user details.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
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
          <label htmlFor="status" className={labelClass}>Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isAvailable"
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
          />
          <label htmlFor="isAvailable" className="text-sm font-medium text-neutral-700">Available for assignments</label>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Link href={`/admin/riders/${id}`} className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg border border-neutral-300 bg-white font-medium text-neutral-700 hover:bg-neutral-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-[#81007f] text-white font-medium hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
