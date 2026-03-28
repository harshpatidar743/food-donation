import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import Contact from "@/models/Contact";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid message id." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const deletedMessage = await Contact.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json(
        { success: false, error: "Message not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete message." },
      { status: 500 }
    );
  }
}
