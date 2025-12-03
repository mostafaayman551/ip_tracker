import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get IP from Vercel headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  // Extract IP from x-forwarded-for (can be comma-separated list)
  const ip = forwardedFor?.split(",")[0]?.trim() || 
             realIp || 
             cfConnectingIp || 
             "unknown";

  // Get geolocation data from Vercel headers (automatically provided by Vercel)
  const country = request.headers.get("x-vercel-ip-country") || "Unknown";
  const countryRegion = request.headers.get("x-vercel-ip-country-region") || "Unknown";
  const city = request.headers.get("x-vercel-ip-city") || "Unknown";
  const latitude = request.headers.get("x-vercel-ip-latitude");
  const longitude = request.headers.get("x-vercel-ip-longitude");
  const timezone = request.headers.get("x-vercel-ip-timezone") || "Unknown";

  // Parse coordinates
  const lat = latitude ? parseFloat(latitude) : null;
  const long = longitude ? parseFloat(longitude) : null;

  // Extract region code from country-region (format: "US-CA" or "CA")
  const regionCode = countryRegion.includes("-") 
    ? countryRegion.split("-")[1] 
    : countryRegion;

  // For fields not provided by Vercel, we'll use placeholders
  // These would require additional services, but we're keeping it Vercel-native
  const postal = "N/A"; // Vercel doesn't provide postal code
  const isp = "N/A"; // Vercel doesn't provide ISP
  const asn = "N/A"; // Vercel doesn't provide ASN
  const currency = "N/A"; // Vercel doesn't provide currency
  const currencySymbol = "N/A"; // Vercel doesn't provide currency symbol
  const callingCode = "N/A"; // Vercel doesn't provide calling code

  return NextResponse.json({
    ip: ip,
    country: country || "Unknown",
    countryCode: country || "Unknown",
    city: city || "Unknown",
    region: countryRegion || "Unknown",
    regionCode: regionCode || "Unknown",
    postal: postal,
    lat: lat,
    long: long,
    timezone: timezone || "Unknown",
    isp: isp,
    asn: asn,
    currency: currency,
    currencySymbol: currencySymbol,
    callingCode: callingCode,
  });
}

