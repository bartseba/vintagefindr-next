import Link from "next/link";
import { companyName } from "@/constant/routes";

interface SlideMenuFooterProps {
  onClose: () => void;
}

export function SlideMenuFooter({ onClose }: SlideMenuFooterProps) {
  return (
    <div className="p-2 border-t bg-gray-50 flex-shrink-0">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">
          {companyName} - Vintage Shops entdecken
        </p>
        <div className="flex justify-center gap-2 text-xs text-gray-400">
          <Link href="/ueber-uns" onClick={onClose} className="hover:text-gray-600">
            Über uns
          </Link>
          <Link href="/impressum" onClick={onClose} className="hover:text-gray-600">
            Impressum
          </Link>
          <Link href="/hilfe" onClick={onClose} className="hover:text-gray-600">
            Hilfe
          </Link>
          <Link href="/kontakt" onClick={onClose} className="hover:text-gray-600">
            Kontakt
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          © 2026 {companyName}
        </p>
      </div>
    </div>
  );
}
