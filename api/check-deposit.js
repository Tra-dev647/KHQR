export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const id = String(req.query?.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid demo reference." });
  return res.status(200).json({
    id,
    status: "DEMO ONLY",
    demo: true,
    message: "Demo QR only. No payment is processed or verified."
  });
}