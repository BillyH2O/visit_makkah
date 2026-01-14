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

    // Add meta tag
    const addMeta = (name: string, content: string) => {
      // Check if meta tag already exists
      const existingMeta = document.querySelector(`meta[name="${name}"]`);
      if (!existingMeta) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Performance optimizations
    addLink("preconnect", "https://fonts.googleapis.com");
    addLink("preconnect", "https://fonts.gstatic.com", "anonymous");
    addLink("dns-prefetch", "https://js.stripe.com");
    addLink("dns-prefetch", "https://api.stripe.com");

    // Google Search Console verification
    addMeta("google-site-verification", "1XkgTaFIhuamOMoRTA8Ez_JpXGk6_ZZCrih5Eo0hHo8");

    // Cleanup function (optional, but good practice)
    return () => {
      // Links will remain in the DOM, which is fine for performance
    };
  }, []);

  return null;
}


