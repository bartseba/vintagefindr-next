'use client'

import { useEffect, useRef, useState } from 'react';
import { Configure, Index } from 'react-instantsearch';
import CustomInfiniteHits from './HitsCard';
import SectionHeader from '../SectionHeader';

interface ProductFilterSliderProps {
  emptyTitle: string;
  showAll: string;
  indexId: string;
  query: string;
  headline: string;
  subHeadline?: string;
}

function ProductFilterSlider({ query, headline, subHeadline, indexId, showAll, emptyTitle }: ProductFilterSliderProps) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        // Once visible, stop observing
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '200px', // Start loading 200px before the component enters viewport
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={` xl:container mx-auto my-16 px-4 lg:py-0 `}>
            <SectionHeader showAll={showAll} title={headline} subtitle={subHeadline}/>
            {isVisible && (
                <Index indexName={"products"} indexId={indexId}>
                    <Configure filters="" query={query} />
                    <CustomInfiniteHits emptyTitle={emptyTitle} headline={headline} />
                </Index>
            )}
        </div>
    )
}
export default ProductFilterSlider
