import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body)
      return NextResponse.json({ message: "No body" }, { status: 400 });

    const { customer, items, subtotal, shipping, total, createdAt } = body;
    if (!customer || !customer.name || !customer.address || !customer.phone) {
      return NextResponse.json(
        { message: "Missing customer information" },
        { status: 400 },
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "No items in order" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const coll = db.collection("orders");

    const result = await coll.insertOne({
      customer,
      items,
      subtotal,
      shipping,
      total,
      createdAt,
    });

    return NextResponse.json({ id: result.insertedId.toString() });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "Server error" },
      { status: 500 },
    );
  }
}
