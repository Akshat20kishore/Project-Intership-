export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function validateShipping(values) {
  const e = {};
  const name = values.full_name?.trim() || "";
  const phone = values.phone?.trim() || "";
  const address = values.address?.trim() || "";
  const city = values.city?.trim() || "";
  const pincode = values.pincode?.trim() || "";

  if (name.length < 2) e.full_name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(phone)) e.phone = "Enter a valid 10-digit Indian phone number.";
  if (address.length < 5) e.address = "Enter a complete street or delivery address.";
  if (city.length < 2) e.city = "Enter your city.";
  if (!/^\d{6}$/.test(pincode)) e.pincode = "Enter a valid 6-digit postal code.";

  return e;
}
