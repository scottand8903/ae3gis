import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const AE3GIS_URL = process.env.AE3GIS_URL; // e.g. http://localhost:8000
    if (!AE3GIS_URL) {
      throw new Error("AE3GIS_URL environment variable is not set");
    }

    // Fetch topologies from GNS3 API
    const response = await fetch(`${AE3GIS_URL}/topologies/`, {
      method: "GET",
      headers: { "accept": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GNS3 API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Fetch topologies error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}