"use client";

import { useEffect, useState } from "react";
import {
  DESKTOP_PAGE_SIZE,
  MOBILE_PAGE_SIZE,
  MOBILE_QUERY,
} from "@/lib/pageSize";

function getPageSize() {
  if (typeof window === "undefined") return DESKTOP_PAGE_SIZE;

  return window.matchMedia(MOBILE_QUERY).matches
    ? MOBILE_PAGE_SIZE
    : DESKTOP_PAGE_SIZE;
}

/**
 * Quantidade de itens por página: 5 no mobile e 10 no desktop.
 * Acompanha mudanças de tamanho da tela.
 */
export function usePageSize() {
  const [pageSize, setPageSize] = useState(getPageSize);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);

    const handleChange = () => {
      setPageSize(query.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    };

    handleChange();
    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return pageSize;
}
