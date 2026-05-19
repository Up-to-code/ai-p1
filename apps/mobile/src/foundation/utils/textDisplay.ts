import { isArabic } from "@/foundation/utils/rtl";

export function uppercaseLatin(value: string) {
  return isArabic(value) ? value : value.toUpperCase();
}
