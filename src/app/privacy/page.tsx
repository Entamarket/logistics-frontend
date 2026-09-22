import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/landing/LegalPageShell";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@entamarket.com";

export const metadata: Metadata = {
  title: "Privacy Policy — Entamarket Logistics",
  description:
    "How Entamarket Logistics collects, uses, and shares personal data for accounts, shipments, payments, tracking, and support.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="22 September 2026">
      <p>
        This Privacy Policy explains how Entamarket Logistics (“we”, “us”, or “the
        Service”) collects, uses, stores, and shares information when you use our
        website and logistics platform in Nigeria. It covers clients who book
        deliveries, riders who fulfil them, administrators who operate the
        platform, and visitors who contact us without an account.
      </p>
      <p>
        By creating an account, booking a shipment, using the rider portal, or
        submitting the contact form, you agree to this policy. Our{" "}
        <Link href="/terms" className="font-semibold text-[#81007f] underline-offset-2 hover:underline">
          Terms of Service
        </Link>{" "}
        govern use of the Service.
      </p>

      <LegalSection title="1. Who we are">
        <p>
          Entamarket Logistics is a delivery platform operated from Lagos, Nigeria.
          For privacy questions or requests, email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-[#81007f] underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          We process personal data in line with the Nigeria Data Protection Act
          2023 (NDPA) and related Nigeria Data Protection Commission guidance.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p className="font-semibold text-neutral-900">Account and profile</p>
        <p>
          When you sign up or update your profile we collect your first name, last
          name, email address, optional phone number, password (stored only as a
          one-way hash), role (client, rider, or admin), account status, and
          whether your email is verified. We also record when the account was
          created and last updated.
        </p>
        <p className="font-semibold text-neutral-900">Authentication</p>
        <p>
          We issue a session token in an HTTP-only cookie after you log in. We
          send one-time codes by email to verify your address, confirm email
          changes, and reset passwords. Those codes are stored as hashes with an
          expiry time and are deleted automatically when they expire.
        </p>
        <p className="font-semibold text-neutral-900">Shipments</p>
        <p>
          To book and complete a delivery we collect sender and recipient full
          name, phone number, street address, country, and state; package type,
          weight, dimensions, quantity, and optional notes; delivery type
          (instant or scheduled) and any pickup window; quoted price; shipment
          status and timeline events; and pickup and drop-off coordinates derived
          from the addresses you provide.
        </p>
        <p>
          After delivery, riders may upload a proof-of-delivery photo. Clients may
          confirm receipt. Admins may create shipments on a client’s behalf.
        </p>
        <p className="font-semibold text-neutral-900">Payments</p>
        <p>
          Payments are processed by Paystack. We store payment status, Paystack
          transaction reference, amount, and paid-at time. We do not store full
          card numbers or bank PINs. Paystack collects payment-instrument data
          under its own privacy policy.
        </p>
        <p className="font-semibold text-neutral-900">Riders and live location</p>
        <p>
          Rider accounts include availability, verification status, and (when you
          share it) live GPS coordinates used to match nearby jobs and to show
          tracking to the client during an active delivery. Location is collected
          from the device with permission. Riders also see an address book built
          from sender and recipient details on shipments they have been assigned.
        </p>
        <p className="font-semibold text-neutral-900">Support, complaints, and feedback</p>
        <p>
          The public contact form collects name, email, phone, optional subject,
          and message. Logged-in users can file complaints (subject, message,
          phone, optional related shipment). Clients can leave a star rating and
          optional comment after a delivery. We send in-app notifications about
          shipments and complaints.
        </p>
        <p className="font-semibold text-neutral-900">Technical data</p>
        <p>
          Our servers and maps providers may process IP address, browser type,
          device information, and request logs needed to operate, secure, and
          debug the Service. We do not run third-party advertising or analytics
          pixels on the landing pages as of the date above.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and authenticate accounts, and keep you signed in.</li>
          <li>Quote prices, create shipments, match riders, and track deliveries.</li>
          <li>Geocode addresses and show maps and directions.</li>
          <li>Take and confirm Paystack payments and keep payment records.</li>
          <li>Store proof of delivery and receipt confirmation.</li>
          <li>Send verification, password-reset, and operational emails.</li>
          <li>Handle contact messages, complaints, and rider/client feedback.</li>
          <li>
            Operate admin tools, including shipment management, financial reports,
            and spreadsheet exports of operational data.
          </li>
          <li>Protect the Service against fraud, abuse, and security incidents.</li>
          <li>Comply with law and enforce our Terms of Service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Sharing and processors">
        <p>We share personal data only as needed to run the Service:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-neutral-900">Other users of a shipment.</span>{" "}
            Assigned riders and relevant admins see pickup and drop-off contacts
            and addresses. Clients see rider assignment and live location while a
            delivery is in progress.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Paystack</span> for
            checkout and payment confirmation.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Google Maps</span> for
            geocoding addresses, maps, and directions.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Amazon S3</span> (or
            equivalent object storage) for proof-of-delivery photos.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Resend</span> (or our
            configured email provider) to send transactional email.
          </li>
          <li>
            <span className="font-semibold text-neutral-900">Hosting and database</span>{" "}
            providers that store application data under our instructions.
          </li>
        </ul>
        <p>
          We do not sell personal data. We may disclose information if required by
          law, a court, or a regulator, or to protect users, riders, or the
          public.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and similar technologies">
        <p>
          We use an HTTP-only cookie named <code className="rounded bg-purple-50 px-1 py-0.5 text-sm text-[#81007f]">token</code> to
          keep you logged in. It is essential for the dashboard, rider portal, and
          admin tools. We do not use this cookie for advertising. You can clear
          cookies in your browser; doing so will sign you out.
        </p>
      </LegalSection>

      <LegalSection title="6. Location data">
        <p>
          Pickup and drop-off coordinates are stored on the shipment so we can
          match riders and display maps. Rider GPS is updated when the rider
          enables location sharing and is used for matching and live tracking.
          Location is operational data, not advertising data. You can stop sharing
          live location in the browser or device settings; matching and tracking
          may then be limited.
        </p>
      </LegalSection>

      <LegalSection title="7. Retention">
        <p>
          Account data is kept while your account is active. One-time email codes
          expire and are removed automatically. Contact messages, complaints,
          notifications, shipment history, payment references, and delivery photos
          are kept as long as needed for operations, dispute handling, financial
          records, and legal obligations.
        </p>
        <p>
          If you delete your account from your profile, we remove the user record
          and rider profile (if any), delete your notifications and pending email
          codes, and anonymise personal details on related shipments, complaints,
          contact messages, and feedback comments. We may keep anonymised
          operational and payment records (for example status, price, and Paystack
          reference) for accounting and service history. You cannot delete an
          account while you still have active shipments or deliveries.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>
          Subject to the NDPA and other applicable law, you may request access to,
          correction of, or deletion of your personal data, and you may object to
          or restrict certain processing. You can update name, phone, email, and
          password in your profile, and you can delete your account there.
        </p>
        <p>
          To make a request, email {CONTACT_EMAIL}. We may need to verify your
          identity. You may also lodge a complaint with the Nigeria Data
          Protection Commission.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We hash passwords, use HTTP-only cookies for sessions, restrict admin
          access, and transmit data over HTTPS in production. No method of
          storage or transmission is completely secure. Please choose a strong
          password and keep your login details confidential.
        </p>
      </LegalSection>

      <LegalSection title="10. Children">
        <p>
          The Service is intended for people 18 years or older who can form a
          binding contract in Nigeria. We do not knowingly collect personal data
          from children.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update this policy as the Service changes. The “Last updated”
          date at the top will change when we do. Continued use after an update
          means you accept the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Entamarket Logistics, Lagos, Nigeria.
          <br />
          Email:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-[#81007f] underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
