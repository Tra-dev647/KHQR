import { neon } from "@neondatabase/serverless";
import QRCode from "qrcode";
import { BakongKHQR, IndividualInfo, khqrData } from "bakong-khqr";
import { randomUUID } from "node:crypto";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const amount = Number(req.body?.amount);
    const currency = String(req.body?.currency || "USD").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      return res.status(400).json({ error: "Enter a valid amount." });
    }
    if (!["USD", "KHR"].includes(currency)) {
      return res.status(400).json({ error: "Currency must be USD or KHR." });
    }

    const accountId = process.env.BAKONG_ACCOUNT_ID;
    const merchantName = process.env.MERCHANT_NAME;
    const merchantCity = process.env.MERCHANT_CITY || "Takeo";
    if (!accountId || !merchantName) {
      return res.status(500).json({ error: "Merchant environment variables are not configured." });
    }

    // Official NBC JavaScript SDK. Confirm the account details and SDK fields
    // against the current KHQR SDK documentation before accepting real payments.
    const optionalData = {
      currency: currency === "KHR" ? khqrData.currency.khr : khqrData.currency.usd,
      amount: currency === "KHR" ? Math.round(amount) : amount,
      billNumber: `TRA${Date.now().toString().slice(-10)}`,
      storeLabel: "Tra Deposit",
      expirationTimestamp: Date.now() + 10 * 60 * 1000
    };

    const info = new IndividualInfo(
      accountId,
      merchantName,
      merchantCity,
      optionalData
    );
    const generator = new BakongKHQR();
    const generated = generator.generateIndividual(info);

    if (!generated || generated.status?.code !== 0 || !generated.data?.qr) {
      console.error("KHQR SDK response:", generated);
      return res.status(502).json({ error: "Could not generate KHQR. Check merchant details and SDK documentation." });
    }

    const qrPayload = generated.data.qr;
    const md5 = generated.data.md5;
    if (!md5) return res.status(502).json({ error: "KHQR SDK did not return an MD5 hash." });

    const id = randomUUID();
    const qrImage = await QRCode.toDataURL(qrPayload, { margin: 2, width: 320 });

    await sql`
      INSERT INTO deposits (id, amount, currency, qr_payload, qr_image, md5, status)
      VALUES (${id}, ${amount}, ${currency}, ${qrPayload}, ${qrImage}, ${md5}, 'PENDING')
    `;

    return res.status(201).json({
      id, amount, currency, qrImage, status: "PENDING",
      expiresInSeconds: 600
    });
  } catch (error) {
    console.error("create-deposit error:", error);
    return res.status(500).json({ error: "Could not create deposit. Check server configuration." });
  }
}