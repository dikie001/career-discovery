"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: (agreed: boolean) => void;
  isLoading?: boolean;
}

export function ConsentModal({ isOpen, onConsent, isLoading = false }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (agreed) {
      onConsent(true);
    }
  };

  const handleDecline = () => {
    onConsent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-teal-500/10">
              <AlertCircle className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Data Usage Permission</h2>
              <p className="text-xs text-slate-400 mt-1">Enhance your career guidance experience</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            To provide you with more personalized and relevant career recommendations, we'd like your permission to use the profile information you've already shared with us during signup.
          </p>

          <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-teal-400 uppercase tracking-wide">We'll use your:</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span><strong>Interests:</strong> To match you with relevant career paths</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span><strong>Skills:</strong> To identify skill gaps and learning opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span><strong>Experience Level:</strong> To tailor recommendations to your level</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-slate-400 pt-2">
            You can change this preference anytime in your settings. This data will only be used to improve your experience with Pathfinder AI.
          </p>
        </div>

        {/* Checkbox */}
        <div className="px-6 py-4 border-t border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-600 focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              I agree to share my profile data for personalized recommendations
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50 font-medium text-sm"
          >
            Maybe Later
          </button>
          <button
            onClick={handleSubmit}
            disabled={!agreed || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </>
            ) : agreed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Agree
              </>
            ) : (
              "Agree"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
