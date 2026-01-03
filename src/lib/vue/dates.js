export const secondsToHms = (d, format) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  let hDisplay,
    mDisplay,
    sDisplay = null;

  if (format == "numbers") {
    hDisplay = h == 0 ? "00:" : h <= 9 ? "0" + h + ":" : h + ":";
    mDisplay = m == 0 ? "00:" : m <= 9 ? "0" + m + ":" : m + ":";
    sDisplay = s == 0 ? "00" : s <= 9 ? "0" + s : s;
  } else {
    hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  }

  return hDisplay + mDisplay + sDisplay;
};

export const displayDate = (date) => {
  return new Date(date).toDateString();
};
