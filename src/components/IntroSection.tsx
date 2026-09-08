'use client'

import { useState } from 'react';

interface IntroSectionProps {
  h1?: string;
  /** Pre-sanitized HTML — sanitize server-side before passing in, since `sanitizeHTML` is a `server-only` module and this component needs client state for the mobile expand/collapse toggle. */
  safeHtml?: string;
}

export default function IntroSection({ h1, safeHtml }: IntroSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!safeHtml) return null;

  return (
    <>
      {h1 && (
        <h1 className="text-xl lg:text-xl font-semibold text-gray-900 ">
          {h1}
        </h1>
      )}
      <div className='border-r-2 border-vintage-darkGray/15 h-full'/>
      <div className="relative">
        <article
          className={`prose text-gray-700 pr-12 transition-all duration-300 ${
            isExpanded ? 'max-h-none' : 'max-h-[50px] lg:max-h-none overflow-hidden'
          }`}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-vintage-lightGray to-transparent lg:hidden" />
        )}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm  lg:text-md absolute bottom-2 lg:relative mt-4 text-vintage-primary  font-medium hover:underline lg:hidden text-center"
      >
        {isExpanded ? 'Weniger anzeigen' : 'Weiterlesen'}
      </button>
    </>
  );
}
