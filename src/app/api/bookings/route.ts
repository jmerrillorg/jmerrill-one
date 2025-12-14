// File: src/app/api/bookings/route.ts

import { NextResponse } from "next/server";
import { getBusinesses, GraphError, businessMap, RawBusiness } from "@/lib/graphClient";

export async function GET() {
  try {
    const businesses: RawBusiness[] = await getBusinesses();

    // Build reverse lookup from Microsoft ID -> brand key
    const reverseMap = Object.entries(businessMap).reduce<Record<string, string>>(
      (acc, [key, id]) => {
        acc[id] = key;
        return acc;
      },
      {}
    );

    // Enrich businesses with their "key"
    const cleanBusinesses = businesses.map((b) => ({
      key: reverseMap[b.id] ?? b.id, // fallback to id if not in map
      id: b.id,
      displayName: b.displayName,
      address: b.address,
      phone: b.phone,
      email: b.email,
    }));

    return NextResponse.json({ businesses: cleanBusinesses });
  } catch (err: unknown) {
    console.error("Error fetching businesses:", err);

    let status = 500;
    let message = "Failed to fetch businesses";

    const error = err as GraphError;

    if (error?.statusCode === 401 || error?.statusCode === 403) {
      status = 403;
      message = "Unauthorized: check Azure AD credentials or permissions";
    }

    return NextResponse.json({ error: message }, { status });
  }
}