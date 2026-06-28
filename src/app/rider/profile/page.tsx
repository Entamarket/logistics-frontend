"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyRiderProfile,
  updateMyRiderAvailability,
  updateMyRiderLocation,
} from "@/lib/riders-api";
import {
  RiderErrorAlert,
  RiderLoadingBlock,
  RiderPageHeader,
  RiderShell,
  RiderSuccessAlert,
  RiderWarningAlert,
  riderBtnPrimary,
  riderCard,
  riderCardAccentAmber,
  riderCardAccentPurple,
  riderInputClass,
  riderLabelClass,
} from "@/components/rider/RiderUI";

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export default function RiderProfilePage() {
  const router = useRouter();
  const [loadError, setLoadError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [hasLocation, setHasLocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isAvailable, setIsAvailable] = useState(false);
  const [riderStatus, setRiderStatus] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const canGoAvailable = riderStatus === "active" && isVerified;

  const applyLocationFromRider = useCallback((coords: [number, number] | undefined) => {
    if (coords && coords.length === 2) {
      setLongitude(String(coords[0]));
      setLatitude(String(coords[1]));
      setHasLocation(true);
    } else {
      setHasLocation(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError("");
      setLoadingProfile(true);
      const res = await getMyRiderProfile();
      if (cancelled) return;
      setLoadingProfile(false);
      if (res.success && res.data) {
        applyLocationFromRider(res.data.location?.coordinates);
        setIsAvailable(res.data.isAvailable);
        setRiderStatus(res.data.status);
        setIsVerified(res.data.isVerified);
        return;
      }
      if (res.message?.toLowerCase().includes("rider access") || res.message?.toLowerCase().includes("auth")) {
        router.replace("/auth/login");
        return;
      }
      setLoadError(res.message || "Could not load profile.");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router, applyLocationFromRider]);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setError("");
    setMessage("");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLongitude(String(pos.coords.longitude));
        setLatitude(String(pos.coords.latitude));
        setGeoLoading(false);
      },
      () => {
        setError("Could not read your location. Check browser permissions or enter coordinates manually.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (longitude.trim() === "" || latitude.trim() === "") {
      setError("Enter both longitude and latitude, or use your current location.");
      return;
    }
    if (Number.isNaN(lng) || Number.isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      setError("Invalid coordinates (longitude -180 to 180, latitude -90 to 90).");
      return;
    }
    setSaveLoading(true);
    const res = await updateMyRiderLocation(lng, lat);
    setSaveLoading(false);
    if (res.success && res.data?.location?.coordinates) {
      applyLocationFromRider(res.data.location.coordinates);
      setMessage("Location saved. You can now be matched to nearby pickups.");
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Could not save location.");
  }

  async function handleSaveAvailability(e: React.FormEvent) {
    e.preventDefault();
    setAvailabilityError("");
    setAvailabilityMessage("");
    setAvailabilitySaving(true);
    const res = await updateMyRiderAvailability(isAvailable);
    setAvailabilitySaving(false);
    if (res.success && res.data) {
      setIsAvailable(res.data.isAvailable);
      setRiderStatus(res.data.status);
      setIsVerified(res.data.isVerified);
      setAvailabilityMessage(res.message || "Availability updated.");
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setAvailabilityError(res.message || "Could not update availability.");
  }

  if (loadingProfile) {
    return (
      <RiderShell className="max-w-2xl">
        <RiderLoadingBlock label="Loading profile…" />
      </RiderShell>
    );
  }

  if (loadError) {
    return (
      <RiderShell className="max-w-2xl">
        <RiderPageHeader
          badge="Settings"
          title="Profile & availability"
          description=""
          icon={<ProfileIcon className="h-6 w-6" />}
        />
        <RiderErrorAlert>{loadError}</RiderErrorAlert>
      </RiderShell>
    );
  }

  return (
    <RiderShell className="max-w-2xl">
      <div className="space-y-8">
        <RiderPageHeader
          badge="Settings"
          title="Profile & availability"
          description="Control whether you receive new instant assignments and keep your GPS position up to date."
          icon={<ProfileIcon className="h-6 w-6" />}
        />

        <section className={riderCard}>
          <div className={riderCardAccentPurple} aria-hidden />
          <form onSubmit={handleSaveAvailability} className="space-y-4 p-5">
            <h2 className="text-lg font-bold text-[#6a0068]">Availability</h2>
            <p className="text-sm text-slate-600">
              Going off duty stops new job offers. You can still receive multiple offers while on duty. Current deliveries are not cancelled.
            </p>
            <fieldset>
              <legend className="sr-only">Availability for new jobs</legend>
              <div className="mt-3 space-y-3" role="radiogroup" aria-label="Availability for new jobs">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-200/80 bg-[#faf8fb] px-4 py-3 shadow-[0_2px_12px_rgba(129,0,127,0.06)] has-[:checked]:border-[#81007f] has-[:checked]:shadow-[0_0_0_2px_rgba(129,0,127,0.12),0_0_24px_rgba(192,38,211,0.15)] has-[:checked]:ring-2 has-[:checked]:ring-[#81007f]/25">
                  <input
                    type="radio"
                    name="availability"
                    className="mt-1 h-4 w-4 border-slate-300 text-[#81007f] focus:ring-[#81007f]"
                    checked={isAvailable === true}
                    disabled={!canGoAvailable}
                    onChange={() => setIsAvailable(true)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Available for new jobs</span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      You can be matched to new instant pickups when your location is saved.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.05)] has-[:checked]:border-[#81007f] has-[:checked]:shadow-[0_0_0_2px_rgba(129,0,127,0.1),0_0_20px_rgba(192,38,211,0.12)] has-[:checked]:ring-2 has-[:checked]:ring-[#81007f]/25">
                  <input
                    type="radio"
                    name="availability"
                    className="mt-1 h-4 w-4 border-slate-300 text-[#81007f] focus:ring-[#81007f]"
                    checked={isAvailable === false}
                    onChange={() => setIsAvailable(false)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Unavailable / off duty</span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      You will not receive new assignment offers until you go available again.
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
            {!canGoAvailable && (
              <RiderWarningAlert>
                Your account must be active and verified before you can mark yourself available. Contact support if you
                need help.
              </RiderWarningAlert>
            )}
            {canGoAvailable && isAvailable && !hasLocation && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Save your location below so the system can match you to nearby pickups.
              </p>
            )}
            {availabilityMessage && <RiderSuccessAlert>{availabilityMessage}</RiderSuccessAlert>}
            {availabilityError && <RiderErrorAlert>{availabilityError}</RiderErrorAlert>}
            <button type="submit" disabled={availabilitySaving} className={riderBtnPrimary}>
              {availabilitySaving ? "Saving…" : "Save availability"}
            </button>
          </form>
        </section>

        <section className={riderCard}>
          <div className={riderCardAccentAmber} aria-hidden />
          <div className="space-y-4 p-5">
            <h2 className="text-lg font-bold text-amber-800">Your location</h2>
            {message && <RiderSuccessAlert>{message}</RiderSuccessAlert>}
            {error && <RiderErrorAlert>{error}</RiderErrorAlert>}
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rider-lng" className={riderLabelClass}>
                    Longitude
                  </label>
                  <input
                    id="rider-lng"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className={riderInputClass}
                    placeholder="e.g. 3.3792"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="rider-lat" className={riderLabelClass}>
                    Latitude
                  </label>
                  <input
                    id="rider-lat"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className={riderInputClass}
                    placeholder="e.g. 6.5244"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geoLoading}
                  className="text-left text-sm font-semibold text-[#81007f] hover:underline disabled:opacity-60"
                >
                  {geoLoading ? "Getting location…" : "Use current location"}
                </button>
                <button type="submit" disabled={saveLoading} className={`${riderBtnPrimary} sm:ml-auto`}>
                  {saveLoading ? "Saving…" : "Save location"}
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-500">
              Update this when you move or start a shift so dispatch stays accurate. If you deny location permission,
              enter values manually.
            </p>
          </div>
        </section>
      </div>
    </RiderShell>
  );
}
