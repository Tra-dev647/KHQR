import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const apiBase = (process.env.BAKONG_API_URL || "https://api-bakong.nbc.gov.kh").replace(/\/$/, "");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const id = String(req.query?.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid deposit ID." });

  try {
    const rows = await sql`
      SELECT id, amount, currency, status, md5, created_at
      FROM deposits WHERE id = ${id} LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Deposit not found." });

    const deposit = rows[0];
    if (deposit.status === "PAID") {
      return res.status(200).json({ id, status: "PAID", amount: deposit.amount, currency: deposit.currency });
    }

    const token = process.env.BAKONG_API_TOKEN;
    if (!token || token.includes("PASTE_YOUR")) {
      return res.status(503).json({ error: "Bakong Open API token is not configured.", status: deposit.status });
    }

    const ageMs = Date.now() - new Date(deposit.created_at).getTime();
    if (ageMs > 10 * 60 * 1000) {
      await sql`UPDATE deposits SET status = 'EXPIRED' WHERE id = ${id} AND status = 'PENDING'`;
      return res.status(200).json({ id, status: "EXPIRED", amount: deposit.amount, currency: deposit.currency });
    }

    const response = await fetch(`${apiBase}/v1/check_transaction_by_md5`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ md5: deposit.md5 })
    });

    if (!response.ok) {
      console.error("Bakong check HTTP status:", response.status);
      return res.status(502).json({ error: "Could not verify with Bakong right now.", status: deposit.status });
    }

    const result = await response.json();

    // Only mark paid when the official API confirms a matching transaction.
    // Review current NBC API response fields and compare amount/currency/account
    // before going live; never trust a browser callback or uploaded receipt.
    if (result?.responseCode === 0 && result?.data) {
      await sql`
        UPDATE deposits SET status = 'PAID', paid_at = NOW()
        WHERE id = ${id} AND status = 'PENDING'
      `;
      return res.status(200).json({ id, status: "PAID", amount: deposit.amount, currency: deposit.currency });
    }

    return res.status(200).json({ id, status: "PENDING", amount: deposit.amount, currency: deposit.currency });
  } catch (error) {
    console.error("check-deposit error:", error);
    return res.status(500).json({ error: "Could not check deposit status." });
  }
}