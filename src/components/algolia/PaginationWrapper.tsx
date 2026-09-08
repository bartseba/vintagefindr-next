'use client'

import { Pagination, useInstantSearch } from "react-instantsearch";

export function PaginationWrapper() {
  const { results } = useInstantSearch();
  return results && results.nbPages > 1 ? <Pagination className="flex self-center my-8" /> : null;
}
