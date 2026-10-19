import {
  Bug,
  CalendarCheck,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Sun,
  Cookie,
  Droplets,
  Fish,
  FlaskConical,
  Flower2,
  Leaf,
  type LucideIcon,
  Scissors,
  SprayCan,
  Sprout,
  Thermometer,
} from "lucide-react";

/** Pick an icon from a task's label, so custom labels still get a sensible icon. */
export function taskIcon(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes("thay") && l.includes("nước")) return Droplets;
  if (l.includes("tưới")) return Droplets;
  if (l.includes("bón")) return Sprout;
  if (l.includes("tỉa") || l.includes("cắt")) return Scissors;
  if (l.includes("phun")) return SprayCan;
  if (l.includes("sâu") || l.includes("bệnh")) return Bug;
  if (l.includes("cho ăn")) return Cookie;
  if (l.includes("lọc")) return FlaskConical;
  if (l.includes("ph") || l.includes("nhiệt")) return Thermometer;
  return CalendarCheck;
}

/** WMO weather code → icon. */
export function weatherIcon(code: number): LucideIcon {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 57) return CloudDrizzle;
  if (code >= 95) return CloudLightning;
  return CloudRain;
}

export function speciesIcon(key: string): LucideIcon {
  if (key === "ca-canh") return Fish;
  if (key === "su-quan-tu") return Leaf;
  return Flower2;
}
