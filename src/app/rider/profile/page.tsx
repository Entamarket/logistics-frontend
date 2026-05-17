"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyRiderProfile,
  updateMyRiderAvailability,
  updateMyRiderLocation,
} from "@/lib/riders-api";

const inputClass =
  "mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";
const labelClass = "block text-sm font-medium text-neutral-700";
const cardClass =
  "overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10";

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

  const applyLocationFromRider = useCallback(
    (coords: [number, number] | undefined) => {
      if (coords && coords.length === 2) {
        setLongitude(String(coords[0]));
        setLatitude(String(coords[1]));
        setHasLocation(true);
      } else {
        setHasLocation(false);
      }
    },
    []
  );

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
      <div className="max-w-2xl space-y-6">
        <div className="h-28 animate-pulse rounded-2xl border border-purple-100/60 bg-gradient-to-r from-purple-100/70 via-white to-purple-100/70 shadow-md" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile & availability</h1>
        <p className="mt-4 text-sm text-red-700" role="alert">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-[#81007f]/8 via-white to-fuchsia-50/40 px-5 py-5 shadow-md shadow-purple-500/10">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile & availability</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Control whether you receive new instant assignments and keep your GPS position up to date.
        </p>
      </div>

      <section className={cardClass}>
        <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
        <form onSubmit={handleSaveAvailability} className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Availability</h2>
          <p className="text-sm text-neutral-600">
            Going unavailable stops new job offers. Current deliveries are not cancelled.
          </p>
          <fieldset>
            <legend className="sr-only">Availability for new jobs</legend>
            <div className="mt-3 space-y-3" role="radiogroup" aria-label="Availability for new jobs">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/50 px-4 py-3 has-[:checked]:border-[#81007f] has-[:checked]:ring-1 has-[:checked]:ring-[#81007f]">
                <input
                  type="radio"
                  name="availability"
                  className="mt-1 h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                  checked={isAvailable === true}
                  disabled={!canGoAvailable}
                  onChange={() => setIsAvailable(true)}
                />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">Available for new jobs</span>
                  <span className="block text-xs text-neutral-600 mt-0.5">
                    You can be matched to new instant pickups when your location is saved.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 has-[:checked]:border-[#81007f] has-[:checked]:ring-1 has-[:checked]:ring-[#81007f]">
                <input
                  type="radio"
                  name="availability"
                  className="mt-1 h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                  checked={isAvailable === false}
                  onChange={() => setIsAvailable(false)}
                />
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">Unavailable / off duty</span>
                  <span className="block text-xs text-neutral-600 mt-0.5">
                    You will not receive new assignment offers until you go available again.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
          {!canGoAvailable && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Your account must be active and verified before you can mark yourself available. Contact support if you need help.
            </p>
          )}
          {canGoAvailable && isAvailable && !hasLocation && (
            <p className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
              Save your location below so the system can match you to nearby pickups.
            </p>
          )}
          {availabilityMessage && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200" role="status">
              {availabilityMessage}
            </div>
          )}
          {availabilityError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200" role="alert">
              {availabilityError}
            </div>
          )}
          <button
            type="submit"
            disabled={availabilitySaving}
            className="min-h-[44px] rounded-lg bg-[#81007f] px-5 py-2.5 font-medium text-white transition hover:bg-[#6a0068] disabled:opacity-60"
          >
            {availabilitySaving ? "Saving…" : "Save availability"}
          </button>
        </form>
      </section>

      <section className={cardClass}>
        <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Your location</h2>
          {message && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSaveLocation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rider-lng" className={labelClass}>
                  Longitude
                </label>
                <input
                  id="rider-lng"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 3.3792"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="rider-lat" className={labelClass}>
                  Latitude
                </label>
                <input
                  id="rider-lat"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 6.5244"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="text-sm font-medium text-[#81007f] hover:underline disabled:opacity-60 text-left sm:text-center"
              >
                {geoLoading ? "Getting location…" : "Use current location"}
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="min-h-[44px] rounded-lg bg-[#81007f] px-5 py-2.5 font-medium text-white transition hover:bg-[#6a0068] disabled:opacity-60 sm:ml-auto"
              >
                {saveLoading ? "Saving…" : "Save location"}
              </button>
            </div>
          </form>
          <p className="text-xs text-neutral-500">
            Update this when you move or start a shift so dispatch stays accurate. If you deny location permission, enter values manually.
          </p>
        </div>
      </section>
    </div>
  );
}