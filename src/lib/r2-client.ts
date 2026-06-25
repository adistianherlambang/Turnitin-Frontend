/**
 * Convert any Cloudflare R2 URL to the local Next.js proxied API route view URL.
 * This avoids direct R2 requests from client/admin browsers, bypassing ISP/DNS blocking issues.
 */
export const getProxyUrl = (url: string): string => {
  if (!url) return "";
  try {
    // If it's already a relative path or proxied URL, return it as is
    if (url.startsWith("/") || url.includes("/api/r2/view/")) {
      return url;
    }

    const urlObj = new URL(url);
    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    let isR2 = urlObj.hostname.includes("r2.dev") || urlObj.hostname.includes("cloudflarestorage.com");

    if (r2PublicUrl) {
      try {
        const r2UrlObj = new URL(r2PublicUrl);
        if (urlObj.hostname === r2UrlObj.hostname) {
          isR2 = true;
        }
      } catch (_) {}
    }

    if (isR2) {
      const key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
      return `/api/r2/view/${key}`;
    }

    return url;
  } catch (err) {
    return url;
  }
};
