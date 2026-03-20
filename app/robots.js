import { ADMIN_ROUTE } from "@/lib/constants";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [ADMIN_ROUTE, "/api/"]
      }
    ]
  };
}
