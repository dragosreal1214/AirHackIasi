/**
 * Romanian mobile helpers.
 *
 * The PhoneField already shows the "+40" prefix, so the subscriber number is
 * 9 digits starting with 7 (e.g. 712 345 678). We accept any common form the
 * user might type — with the national trunk "0" (0712…), without it (712…),
 * with +40 / 0040 / 40 — and normalise to E.164.
 */
export function normalizeRoMobile(input: string): string {
  let d = (input || "").replace(/[^\d+]/g, "");
  if (d.startsWith("+40")) d = d.slice(3);
  else if (d.startsWith("0040")) d = d.slice(4);
  else if (d.startsWith("40")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1); // drop the national trunk 0
  return "+40" + d;
}

export function isValidRoMobile(input: string): boolean {
  return /^\+407\d{8}$/.test(normalizeRoMobile(input));
}
