# Tra Deposit — Bakong KHQR starter

This is a starter project for Android Termux + GitHub + Vercel. It generates a transaction-specific KHQR, stores a pending deposit in Neon PostgreSQL, and checks the transaction through the Bakong Open API.

## Before accepting real money

- Register for a Bakong Open API token through the official NBC portal: https://api-bakong.nbc.gov.kh/
- Use your own verified Bakong account ID and merchant details.
- Confirm the current official SDK API fields and the official transaction-check response format.
- The `check-deposit.js` example must be tested against the current API response. For production, verify transaction amount, currency, receiver account and transaction uniqueness before crediting a user balance.
- This starter does not include user login, a wallet ledger, refunds, rate limiting, or an admin dashboard. Do not use it as a multi-user stored-value wallet until those controls are added and reviewed.
- Never put API tokens in frontend code or commit `.env.local` to GitHub.

## 1. Install Termux packages

```bash
pkg update && pkg upgrade
pkg install nodejs-lts git nano
termux-setup-storage
```

## 2. Create a GitHub repository

Create an empty repository named `tra-deposit` on GitHub. Do not add a README there if you will push this folder as-is.

## 3. Put the project in Termux

Download and extract this ZIP, then move the extracted `tra-deposit` folder somewhere under your Termux home. For example, if it is in Android Downloads:

```bash
cp -r /storage/emulated/0/Download/tra-deposit ~/tra-deposit
cd ~/tra-deposit
npm install
```

If the folder is already in `~/tra-deposit`, skip the `cp` command.

## 4. Create the Neon database

1. Create a PostgreSQL database at https://neon.tech/
2. Copy its connection string.
3. Open Neon SQL Editor and run the contents of `schema.sql`.

## 5. Configure local environment

```bash
cp .env.example .env.local
nano .env.local
```

Replace the placeholders with your own values. Do not share your Bakong token or database password. For local development, use the Vercel CLI:

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel dev
```

If `vercel env pull` overwrites your file, re-add any local-only values in `.env.local`. Open the local URL shown in Termux.

## 6. Push to GitHub

Replace `YOUR_GITHUB_USERNAME` with your GitHub username:

```bash
git init
git add .
git commit -m "Initial Tra Deposit project"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/tra-deposit.git
git push -u origin main
```

If Git says a remote already exists, use `git remote -v` and update it with:
`git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/tra-deposit.git`

## 7. Deploy to Vercel

1. Open https://vercel.com/ and import the `tra-deposit` GitHub repository.
2. In Project → Settings → Environment Variables, add:
   - `DATABASE_URL`
   - `BAKONG_API_TOKEN`
   - `BAKONG_API_URL` = `https://api-bakong.nbc.gov.kh`
   - `BAKONG_ACCOUNT_ID`
   - `MERCHANT_NAME`
   - `MERCHANT_CITY`
3. Redeploy after adding environment variables.
4. Test with a small amount only after confirming the SDK and API response against official docs.

Official references:
- Bakong Open API: https://api-bakong.nbc.gov.kh/
- Official NBC integration PDF: https://bakong.nbc.gov.kh/download/KHQR/integration/Bakong%20Open%20API%20Document.pdf
- Official KHQR SDK PDF: https://bakong.nbc.gov.kh/en/download/KHQR%20SDK.pdf
