"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyRiderProfile, updateMyRiderLocation } from "@/lib/riders-api";

const inputClass =
  "mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function RiderProfilePage() {
  const router = useRouter();
  const [loadError, setLoadError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [availabilityNote, setAvailabilityNote] = useState("");

  const applyLocationFromRider = useCallback(
    (coords: [number, number] | undefined) => {
      if (coords && coords.length === 2) {
        setLongitude(String(coords[0]));
        setLatitude(String(coords[1]));
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
        const loc = res.data.location?.coordinates;
        applyLocationFromRider(loc);
        setAvailabilityNote(
          res.data.isAvailable
            ? "You are marked available for new assignments (unless you are on an active delivery)."
            : "You are currently marked unavailable or busy."
        );
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

  if (loadingProfile) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile & availability</h1>
        <p className="mt-4 text-sm text-neutral-500">Loading profile…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile & availability</h1>
        <p className="mt-4 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile & availability</h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          Set your current position so instant shipments can assign the nearest rider. Coordinates use WGS84 (same as GPS). Order
          stored in the system: longitude, then latitude.
        </p>
        {availabilityNote && <p className="mt-2 text-sm text-neutral-500">{availabilityNote}</p>}
      </div>

      <section className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 sm:p-6 space-y-4">
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
          Update this when you move or start a shift so dispatch stays accurate. If you deny location permission, enter values
          manually.
        </p>
      </section>
    </div>
  );
}
