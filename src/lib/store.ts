"use client";

import { useSyncExternalStore } from "react";
import { Db, seedDb } from "./data";
import { savePhoto } from "./photos";

const KEY = "cham_soc_cay_v1";
const EMPTY: Db = { items: [], tasks: [], logs: [] };

let cache: Db | null = null;
const listeners = new Set<() => void>();

function load(): Db {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Db) : seedDb();
  } catch {
    cache = seedDb();
  }
  save();
  void migratePhotos();
  return cache;
}

/** Move legacy base64 photos out of localStorage into IndexedDB (runs once per old photo). */
async function migratePhotos() {
  const legacy = cache!.items.flatMap((i) => i.photos.filter((p) => p.startsWith("data:")));
  if (legacy.length === 0) return;
  const moved = new Map<string, string>();
  for (const dataUrl of legacy) {
    try {
      moved.set(dataUrl, await savePhoto(await (await fetch(dataUrl)).blob()));
    } catch {
      // leave it as a data: URL; it still displays
    }
  }
  update((d) => {
    for (const i of d.items) i.photos = i.photos.map((p) => moved.get(p) ?? p);
  });
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage full or unavailable; keep in-memory state
  }
}

/** Mutate a copy of the db, persist, and notify subscribers. */
export function update(fn: (db: Db) => void) {
  const next = structuredClone(load());
  fn(next);
  cache = next;
  save();
  listeners.forEach((l) => l());
}

export function useDb(): { db: Db; ready: boolean } {
  const db = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => load(),
    () => EMPTY,
  );
  return { db, ready: db !== EMPTY };
}
