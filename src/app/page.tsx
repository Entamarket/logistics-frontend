import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing/LandingPage";

/** Best-effort read of the role from the auth JWT for instant nav rendering.
 *  Not a security check — the client-side profile fetch remains the source of truth. */
function decodeRoleFromToken(token: string): string | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as {
      role?: unknown;
      exp?: unknown;
    };
    if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) return null;
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const token = (await cookies()).get("token")?.value;
  const initialRole = token ? decodeRoleFromToken(token) : null;
  return <LandingPage initialRole={initialRole} />;
}
