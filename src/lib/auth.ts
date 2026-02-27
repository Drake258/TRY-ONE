import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions, activityLogs } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { initializeDatabase } from "@/db/init";

const SESSION_COOKIE = "rightclick_session";
const SESSION_DURATION_HOURS = 24;

export async function hashPassword(password: string): Promise<string> {
  const salt = "rightclick_salt_2024";
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function getSession() {
  await initializeDatabase();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const now = new Date();
  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)));

  if (result.length === 0) return null;

  const { user } = result[0];
  if (user.status === "suspended") return null;

  return { user, sessionId };
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function logActivity(
  userId: number | null,
  username: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  details?: string
) {
  await db.insert(activityLogs).values({
    userId,
    username,
    action,
    resource,
    resourceId,
    details,
  });
}

export type SessionUser = {
  id: number;
  username: string;
  role: "admin" | "staff";
  status: "active" | "suspended";
};
