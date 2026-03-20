const arabicDateFormatter = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium"
});

const arabicDateTimeFormatter = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatArabicDate(value) {
  if (!value) {
    return "غير متوفر";
  }

  try {
    return arabicDateFormatter.format(new Date(value));
  } catch {
    return "غير متوفر";
  }
}

export function formatArabicDateTime(value) {
  if (!value) {
    return "غير متوفر";
  }

  try {
    return arabicDateTimeFormatter.format(new Date(value));
  } catch {
    return "غير متوفر";
  }
}

export function maskToken(token) {
  if (!token || token.length < 8) {
    return "••••";
  }

  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}

export function hashString(input) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}
