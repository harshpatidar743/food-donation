import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Contact from "@/models/Contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log('Contact GET: starting, connecting to MongoDB...');
    await connectMongoDB();
    console.log('Contact GET: MongoDB connected');

    console.log('Contact GET: fetching messages...');
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    console.log(`Contact GET: fetched ${messages.length} messages`);

    return NextResponse.json(
      { success: true, messages },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Contact GET full error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch messages." },
      { status: 500 }
    );
  }
}
