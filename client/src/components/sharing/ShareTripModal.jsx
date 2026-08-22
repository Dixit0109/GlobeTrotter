import React, { useState, useEffect } from "react";
import { Copy, Check, Lock, Globe, Users, AlertTriangle, Loader2 } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import VisibilityBadge from "./VisibilityBadge";
import API from "../../services/api";

const ShareTripModal = ({
  isOpen,
  onClose,
  trip,
  isOwner = false,
  onUpdateVisibility,
}) => {
  if (!trip) return null;

  const [selectedVisibility, setSelectedVisibility] = useState(
    trip.visibility || "private"
  );
  const [confirmingPrivate, setConfirmingPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen && trip) {
      setSelectedVisibility(trip.visibility || "private");
      setConfirmingPrivate(false);
      setSubmitting(false);
      setCopied(false);
      setCopyError(null);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, trip]);

  const shareUrl = `${window.location.origin}/trips/${trip._id}`;

  const handleCopyLink = async () => {
    setCopyError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for non-HTTPS or unsupported browsers
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      setCopyError("Failed to copy link automatically. Please copy manually.");
    }
  };

  const handleVisibilitySelect = (val) => {
    if (
      val === "private" &&
      (trip.visibility === "public" || trip.visibility === "shared")
    ) {
      setConfirmingPrivate(true);
    } else {
      setConfirmingPrivate(false);
    }
    setSelectedVisibility(val);
  };

  const handleSaveVisibility = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await API.put(`/trips/${trip._id}`, {
        visibility: selectedVisibility,
      });

      if (res.data.success) {
        setSuccessMsg("Trip visibility updated successfully.");
        if (onUpdateVisibility) {
          onUpdateVisibility(res.data.data);
        }
        setConfirmingPrivate(false);
        setTimeout(() => {
          setSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update trip visibility."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share Trip: ${trip.name}`}
      className="max-w-lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {/* Copy Link Section (Available for Public/Shared trips, or Owner) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Trip Share Link
          </label>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono select-all focus:outline-none"
            />
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Link
                </>
              )}
            </Button>
          </div>

          {copyError && (
            <p className="text-[11px] text-amber-400 mt-1">{copyError}</p>
          )}

          {trip.visibility === "private" && (
            <p className="text-[11px] text-amber-400/90 mt-1 flex items-center space-x-1">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>
                Note: This trip is currently set to <strong>Private</strong>. Other users will receive a 403 Access Denied if opened.
              </span>
            </p>
          )}
        </div>

        {/* Owner Visibility Settings Section */}
        {isOwner ? (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Visibility Controls
              </label>
              <VisibilityBadge visibility={trip.visibility} />
            </div>

            <div className="space-y-2.5">
              {/* Private Option */}
              <label
                onClick={() => handleVisibilitySelect("private")}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  selectedVisibility === "private"
                    ? "bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={selectedVisibility === "private"}
                  onChange={() => handleVisibilitySelect("private")}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-slate-200 text-xs">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Private</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Only you can access this trip.
                  </p>
                </div>
              </label>

              {/* Public Option */}
              <label
                onClick={() => handleVisibilitySelect("public")}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  selectedVisibility === "public"
                    ? "bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={selectedVisibility === "public"}
                  onChange={() => handleVisibilitySelect("public")}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-400 text-xs">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Other signed-in GlobeTrotter users can view this trip.
                  </p>
                </div>
              </label>

              {/* Shared Option */}
              <label
                onClick={() => handleVisibilitySelect("shared")}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  selectedVisibility === "shared"
                    ? "bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="shared"
                  checked={selectedVisibility === "shared"}
                  onChange={() => handleVisibilitySelect("shared")}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-indigo-400 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>Shared</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Other signed-in GlobeTrotter users can currently view this trip.
                  </p>
                </div>
              </label>
            </div>

            {/* Confirmation Box for switching to Private */}
            {confirmingPrivate && selectedVisibility === "private" && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs text-amber-300">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Make this trip private?</span>
                </div>
                <p className="text-slate-300">
                  People you shared this trip link with will no longer be able to access it.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3">
              <Button variant="secondary" onClick={onClose} disabled={submitting}>
                Close
              </Button>
              {selectedVisibility !== trip.visibility && (
                <Button
                  onClick={handleSaveVisibility}
                  loading={submitting}
                  disabled={submitting}
                >
                  Save Visibility Changes
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
            You are currently viewing a shared trip. Only the trip owner can change visibility settings.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareTripModal;
