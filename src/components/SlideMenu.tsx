'use client'

import { X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Import extracted components
import { SlideMenuHeader } from "./navigation/SlideMenuHeader";
import { SlideMenuNav } from "./navigation/SlideMenuNav";
import { SlideMenuFooter } from "./navigation/SlideMenuFooter";

interface SlideMenuUser {
  id: string;
  email?: string;
  first_name?: string;
  avatar_url?: string;
}

interface SlideMenuVendorProfile {
  store_name: string;
}

interface SlideMenuProps {
  isOpen: boolean;
  user: SlideMenuUser | null;
  vendorProfile?: SlideMenuVendorProfile;
  onClose: () => void;
}

export function SlideMenu({ isOpen, user, vendorProfile, onClose }: SlideMenuProps) {
  const handleLogout = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      onClose();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 z-[101] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div>
          <button
            onClick={onClose}
            aria-label="Menü schließen"
            className="text-white lg:hidden hover:bg-blue-800 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Slide Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] lg:max-w-[400px] bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <SlideMenuHeader
          user={user}
          vendorProfile={vendorProfile}
          onClose={onClose}
          onLogout={handleLogout}
        />

        {/* Content */}
        <SlideMenuNav
          user={user}
          vendorProfile={vendorProfile}
          onClose={onClose}
        />

        {/* Footer */}
        <SlideMenuFooter onClose={onClose} />
      </div>
    </>
  );
}
