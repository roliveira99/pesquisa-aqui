import { NextResponse } from "next/server";
import { listWorkshops } from "@/lib/db/workshops";
import { sortWorkshopsBySponsorship } from "@/lib/db/platform";

export async function GET() {
  const workshops = await sortWorkshopsBySponsorship(await listWorkshops());
  return NextResponse.json({ workshops });
}
