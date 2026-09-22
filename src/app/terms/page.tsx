import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/landing/LegalPageShell";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@entamarket.com";

export const metadata: Metadata = {
  title: "Terms of Service — Entamarket Logistics",
  description:
    "Terms governing use of Entamarket Logistics accounts, shipments, rider matching, payments, and support.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="22 September 2026">
      <p>
        These Terms of Service (“Terms”) are an agreement between you and
        Entamarket Logistics (“we”, “us”) for use of our website, client
        dashboard, rider portal, and related services (the “Service”). If you do
        not agree, do not use the Service.
      </p>
      <p>
        Personal data is handled as described in our{" "}
        <Link href="/privacy" className="font-semibold text-[#81007f] underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <LegalSection title="1. The Service">
        <p>
          Entamarket Logistics is a platform that lets clients book instant or
          scheduled deliveries in Nigeria, pay quoted prices, and track shipments.
          We match available verified riders to jobs, show maps and live location
          during active deliveries, collect proof of delivery, and provide
          complaints, notifications, and admin operations tools.
        </p>
        <p>
          We are a technology platform. Unless we say otherwise in writing, riders
          are independent contractors or partners, not our employees. We do not
          guarantee a specific pickup time, transit time, or that a rider will
          always be available in your area.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and accounts">
        <p>
          You must be at least 18 years old and able to enter a binding contract
          under Nigerian law. You must provide accurate first name, last name,
          email, and (where used) phone number, and keep them up to date.
        </p>
        <p>
          You are responsible for your password and for activity on your account.
          Notify us immediately if you suspect unauthorised access. We may
          suspend or terminate accounts that are inactive, unverified, abusive, or
          in breach of these Terms.
        </p>
        <p>
          Rider accounts may require verification and admin approval before you
          can accept jobs. Admins may create or manage rider and client records
          as needed to operate the Service.
        </p>
      </LegalSection>

      <LegalSection title="3. Bookings and your responsibilities">
        <p>
          When you create a shipment you confirm that sender and recipient
          details, addresses, package type, weight, dimensions, quantity, and any
          notes are accurate. Incorrect information can delay or prevent delivery
          and may change pricing.
        </p>
        <p>You agree that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Packages are packed safely and lawfully, and do not contain prohibited
            or dangerous goods (including illegal drugs, explosives, weapons, or
            other items banned by Nigerian law or by our operational rules).
          </li>
          <li>
            Someone authorised is available at pickup and drop-off with a working
            phone number.
          </li>
          <li>
            You will not use the Service for fraud, harassment, or to send items
            you are not entitled to send.
          </li>
        </ul>
        <p>
          Admins may create shipments on a client’s behalf. Clients should review
          those bookings and raise issues promptly through the dashboard or
          contact channels.
        </p>
      </LegalSection>

      <LegalSection title="4. Riders">
        <p>
          Riders must keep profile and availability information accurate, share
          location when required to receive or complete jobs, treat packages and
          contacts with care, and upload a genuine proof-of-delivery photo when
          requested. Declining or timing out on offers may affect matching.
        </p>
        <p>
          Riders must not misuse the address book or other contact details obtained
          through assigned shipments (for example, for unrelated marketing).
        </p>
      </LegalSection>

      <LegalSection title="5. Pricing and payments">
        <p>
          Prices are calculated from the details you submit (including size,
          weight, quantity, and route). The amount shown at checkout is what you
          authorise. Payments are processed by Paystack. You must complete
          payment according to the flow in the app (including any pending or
          confirmed Paystack status) before we treat a job as paid.
        </p>
        <p>
          We store Paystack references and payment status for reconciliation.
          Refunds, chargebacks, and failed payments are handled in line with
          Paystack’s rules, our operational policies, and applicable law. Contact{" "}
          {CONTACT_EMAIL} for billing questions.
        </p>
      </LegalSection>

      <LegalSection title="6. Tracking, maps, and proof of delivery">
        <p>
          We geocode addresses and may show maps, directions, status timelines,
          and rider location during an active shipment. Tracking depends on
          network conditions, device permissions, and rider updates and is
          provided as-is.
        </p>
        <p>
          A delivery may be treated as complete when a rider uploads proof of
          delivery and/or the sender confirms receipt in the app. Raise disputes
          promptly through complaints or support if something is wrong.
        </p>
      </LegalSection>

      <LegalSection title="7. Support, complaints, and feedback">
        <p>
          You may contact us via the landing-page form, email, or in-app
          complaints. Provide truthful information. We may use messages to
          investigate and improve the Service. Star ratings and comments may be
          visible to admins and used to evaluate rider performance.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Attempt to access other users’ accounts or non-public systems.</li>
          <li>Scrape, overload, or reverse engineer the Service except as allowed by law.</li>
          <li>Interfere with rider matching, payments, or tracking.</li>
          <li>Upload false proof-of-delivery images or impersonate another person.</li>
          <li>Use the Service in any way that is illegal in Nigeria.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          The Service, including branding, software, and content we provide,
          belongs to Entamarket Logistics or its licensors. You receive a limited,
          revocable licence to use the Service for its intended purpose. You keep
          rights in content you submit (such as shipment notes and photos) and
          grant us a licence to use that content to operate the Service.
        </p>
      </LegalSection>

      <LegalSection title="10. Account deletion">
        <p>
          You may delete your account from your profile after active shipments or
          deliveries are finished. Deletion removes your login and related
          personal data as described in the Privacy Policy. We may retain
          anonymised operational and payment records.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimers and liability">
        <p>
          The Service is provided “as is”. To the fullest extent permitted by
          Nigerian law, we disclaim implied warranties of merchantability, fitness
          for a particular purpose, and uninterrupted availability.
        </p>
        <p>
          We are not liable for delay, loss, or damage caused by inaccurate
          addresses, unavailable recipients, force majeure, third-party networks
          (including Paystack, maps, email, or hosting), items you were not
          allowed to ship, or rider or client conduct outside our reasonable
          control.
        </p>
        <p>
          Where liability cannot be excluded, our aggregate liability arising out
          of a shipment is limited to the delivery fee paid for that shipment,
          except in cases of fraud or other liability that cannot be limited by
          law.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes and termination">
        <p>
          We may change features, pricing methods, or these Terms. Material
          changes will be reflected by an updated date on this page. Continued use
          after changes means you accept them. We may suspend or stop the Service
          or your access at any time for operational, legal, or security reasons.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria.
          Courts in Lagos, Nigeria have exclusive jurisdiction, unless applicable
          consumer law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
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
