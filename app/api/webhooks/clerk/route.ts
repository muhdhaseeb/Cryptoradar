import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/database/models/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET to .env.local");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Validate email array
    if (!email_addresses || email_addresses.length === 0) {
      return new Response("Error: No email address found", { status: 400 });
    }

    try {
      await connectToDatabase();
      await User.create({
        clerkId: id,
        email: email_addresses[0].email_address,
        name:
          `${first_name || ""} ${last_name || ""}`.trim() ||
          email_addresses[0].email_address.split("@")[0],
        image: image_url,
      });
      console.log("New user saved to MongoDB:", id);
    } catch (err) {
      console.error("Error saving user to MongoDB:", err);
      return new Response("Error: Could not save user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await connectToDatabase();
      await User.findOneAndDelete({ clerkId: id });
      console.log("User deleted from MongoDB:", id);
    } catch (err) {
      console.error("Error deleting user from MongoDB:", err);
      return new Response("Error: Could not delete user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}