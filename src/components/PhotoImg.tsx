"use client";

import Image from "next/image";
import { usePhotoUrl } from "@/lib/photos";

/** Shows the user's photo when there is one, otherwise the species illustration. */
export default function PhotoImg({
  photo,
  fallback,
  alt,
  sizes,
  className = "",
  priority,
}: {
  photo?: string;
  fallback: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const url = usePhotoUrl(photo);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
  }
  return <Image src={fallback} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
