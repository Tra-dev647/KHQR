import QRCode from "qrcode";
import { randomUUID } from "node:crypto";

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

    // DEMO ONLY: This is a QR containing test text, not a real payable KHQR.
    // It deliberately does not create a real payment or claim that money was received.
    const id = randomUUID();
    const demoPayload = [
      "TRA-DEPOSIT-DEMO-ONLY",
      `REFERENCE=${id}`,
      `AMOUNT=${amount}`,
      `CURRENCY=${currency}`,
      "NOT_A_REAL_BAKONG_PAYMENT"
    ].join("\n");
    const qrImage = await QRCode.toDataURL(demoPayload, { margin: 2, width: 320 });

    return res.status(201).json({
      id, amount, currency, qrImage, status: "DEMO ONLY",
      demo: true,
      message: "This QR is for UI testing only. It cannot receive money."
    });
  } catch (error) {
    console.error("create-deposit demo error:", error);
    return res.status(500).json({ error: "Could not generate demo QR." });
  }
}