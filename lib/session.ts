import "server-only";
import { cookies } from "next/headers";

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Set expiry to matches token expiry or a sensible default (e.g., 7 days)
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  return session?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
