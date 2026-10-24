# Tra Deposit — QR Demo Test

This version is **DEMO ONLY**. It generates a QR image containing test text so you can test the website UI and the Generate QR flow. It is NOT a real KHQR and cannot receive money. The status endpoint always returns `DEMO ONLY`; it can never mark a deposit as paid.

## Run in Termux

```bash
pkg update
pkg install nodejs-lts git unzip
cd ~/tra-deposit
npm install
npx vercel dev
```

Open the local URL shown by Vercel CLI.

## Deploy on Vercel

Import the GitHub repository, choose **Other** if asked for a framework, and deploy. This demo does not need database credentials or Bakong API tokens.

## Before live payments

Do not use this demo QR to collect money. For real KHQR, integrate the current official KHQR SDK and Bakong Open API documentation, use your own verified merchant account details, keep tokens in server-side environment variables, and validate transaction amount/currency/receiver before crediting any balance.
