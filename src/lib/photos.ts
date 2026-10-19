"use client";

import { clear, del, get, set } from "idb-keyval";
import { useSyncExternalStore } from "react";

// Photos live in IndexedDB as Blobs; items only keep "photo:<uuid>" ids, so
// localStorage stays small no matter how many photos are added.
const PREFIX = "photo:";

export const isPhotoId = (s: string) => s.startsWith(PREFIX);

export async function savePhoto(blob: Blob): Promise<string> {
  const id = PREFIX + crypto.randomUUID();
  await set(id, blob);
  return id;
}

export function deletePhotos(refs: string[]) {
  for (const r of refs) {
    if (!isPhotoId(r)) continue;
    void del(r);
    const url = urls.get(r);
    if (url) URL.revokeObjectURL(url);
    urls.delete(r);
  }
}

export function clearPhotos() {
  urls.forEach((u) => URL.revokeObjectURL(u));
  urls.clear();
  return clear();
}

const urls = new Map<string, string>();
const loading = new Set<string>();
const listeners = new Set<() => void>();

function request(id: string) {
  if (urls.has(id) || loading.has(id)) return;
  loading.add(id);
  get<Blob>(id)
    .then((blob) => {
      if (blob) urls.set(id, URL.createObjectURL(blob));
    })
    .catch(() => {})
    .finally(() => {
      loading.delete(id);
      listeners.forEach((l) => l());
    });
}

/** Resolve a photo reference (IndexedDB id or legacy data: URL) to a displayable URL. */
export function usePhotoUrl(ref: string | undefined): string | undefined {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      if (ref && isPhotoId(ref)) request(ref);
      return () => listeners.delete(cb);
    },
    () => (!ref ? undefined : isPhotoId(ref) ? urls.get(ref) : ref),
    () => undefined,
  );
}
