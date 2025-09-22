import { NextResponse, type NextRequest } from "next/server";
import {
  getServices,
  businessMap,
  RawService,
  CleanService,
} from "@/lib/graphClient";
import services from "@/data/services.json";

type ServiceJSON = {
  [brand: string]: CleanService[];
};

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { brand } = context.params;

  try {
    const businessId = businessMap[brand];
    if (!businessId) {
      return NextResponse.json(
        { error: `Unknown brand key: ${brand}` },
        { status: 400 }
      );
    }

    try {
      const rawServices: RawService[] = await getServices(businessId);

      const cleanServices: CleanService[] = rawServices.map((s) => ({
        id: s.id,
        displayName: s.displayName,
        defaultDuration: s.defaultDuration,
        price: s.price,
        description: s.description ?? "",
      }));

      return NextResponse.json({ services: cleanServices, fallback: false });
    } catch (graphError) {
      console.warn("⚠️ Graph API failed, falling back to JSON", graphError);

      const fallbackServices =
        (services as ServiceJSON)[brand] ?? ([] as CleanService[]);
      return NextResponse.json({ services: fallbackServices, fallback: true });
    }
  } catch (err: unknown) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to load services" },
      { status: 500 }
    );
  }
}