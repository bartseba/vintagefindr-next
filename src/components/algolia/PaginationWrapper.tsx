'use client'

import { Pagination, useInstantSearch } from "react-instantsearch";

export function PaginationWrapper() {
  const { results } = useInstantSearch();
  return results && results.nbPages > 1 ? (
    <Pagination
      classNames={{
        root: "flex w-full justify-center my-8",
        list: "flex items-center gap-1",
        item: "rounded-lg overflow-hidden",
        link: "flex items-center justify-center w-9 h-9 text-sm font-medium text-vintage-secondary hover:bg-vintage-lightBlue transition-colors duration-150 rounded-lg",
        selectedItem: "[&>a]:bg-vintage-primary [&>a]:text-white [&>a]:hover:bg-vintage-primary",
        disabledItem: "opacity-30 pointer-events-none",
        firstPageItem: "[&>a]:bg-white [&>a]:border [&>a]:border-gray-200 [&>a]:shadow-sm [&>a]:hover:border-vintage-primary [&>a]:hover:bg-vintage-lightBlue",
        previousPageItem: "[&>a]:bg-white [&>a]:border [&>a]:border-gray-200 [&>a]:shadow-sm [&>a]:hover:border-vintage-primary [&>a]:hover:bg-vintage-lightBlue",
        nextPageItem: "[&>a]:bg-white [&>a]:border [&>a]:border-gray-200 [&>a]:shadow-sm [&>a]:hover:border-vintage-primary [&>a]:hover:bg-vintage-lightBlue",
        lastPageItem: "[&>a]:bg-white [&>a]:border [&>a]:border-gray-200 [&>a]:shadow-sm [&>a]:hover:border-vintage-primary [&>a]:hover:bg-vintage-lightBlue",
      }}
    />
  ) : null;
}
