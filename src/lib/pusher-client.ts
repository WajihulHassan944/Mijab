import Pusher from "pusher-js";

let client: Pusher | null = null;

/** Lazily creates a single shared Pusher connection. Returns null if the
 * public key isn't configured (realtime is an enhancement, never required). */
export function getPusher(): Pusher | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;
  if (!client) client = new Pusher(key, { cluster });
  return client;
}
