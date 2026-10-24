export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const hash = String(req.body?.hash || "").trim();
  if (!hash || hash.length > 255) return res.status(400).json({ error: "A valid transaction hash is required." });
  const token = process.env.BAKONG_API_TOKEN;
  if (!token || token.includes("PASTE_YOUR")) return res.status(503).json({ error: "Bakong Open API token is not configured." });
  const base = (process.env.BAKONG_API_URL || "https://api-bakong.nbc.gov.kh").replace(/\/$/, "");
  try {
    const upstream = await fetch(`${base}/v1/check_transaction_by_hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ hash })
    });
    const data = await upstream.json();
    return res.status(upstream.ok ? 200 : 502).json(data);
  } catch (error) {
    console.error("check transaction by hash error", error);
    return res.status(502).json({ error: "Could not contact Bakong API." });
  }
}
