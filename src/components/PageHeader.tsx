import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";

interface PageHeaderProps {
  backLink: string;
  backText?: string;
}

export default function PageHeader({ backLink, backText = "Zurück" }: PageHeaderProps) {
  return (
    <header className="bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              href={backLink}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>{backText}</span>
            </Link>
          </div>
        </div>
        <Logo />
      </div>
    </header>
  );
}
