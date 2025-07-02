export async function fetchWebsiteConfig() {
  try {
    const res = await fetch(`api/config`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json?.data;
  } catch  {
    return null;
  }
}