"use client";

import { useEffect } from "react";

export default function MetaTags() {
  useEffect(() => {
    // Add preconnect and dns-prefetch links
    const addLink = (rel: string, href: string, crossOrigin?: string) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (crossOrigin) {
        link.crossOrigin = crossOrigin;
      }
      document.head.appendChild(link);
    };

    // Performance optimizations
    addLink("preconnect", "https://fonts.googleapis.com");
    addLink("preconnect", "https://fonts.gstatic.com", "anonymous");
    addLink("dns-prefetch", "https://js.stripe.com");
    addLink("dns-prefetch", "https://api.stripe.com");

    // Cleanup function (optional, but good practice)
    return () => {
      // Links will remain in the DOM, which is fine for performance
    };
  }, []);

  return null;
}


