# Estimate Import Vercel Blob Validation — 2026-04-30

## Context

Production and preview deployments returned `413 FUNCTION_PAYLOAD_TOO_LARGE` during estimate Excel import when uploading large `.xlsx` files directly through the Vercel Function route.

## Fix summary

PR #135 changes the estimate import flow so that:

- `.xlsx` files up to 4 MB continue to use direct multipart import.
- `.xlsx` files between 4 MB and 25 MB are uploaded directly to Vercel Blob from the browser.
- The import API receives only the Blob `pathname`, reads the private Blob server-side, and runs the existing import service.
- Successful import responses are compact and do not return large unmatched-name arrays.
- GET requests to the import endpoint return `405 Method Not Allowed`.

## Deployment validation

After adding or updating `BLOB_READ_WRITE_TOKEN` in Vercel project environment variables, redeploy the PR preview so the runtime can read the new token.

Validation checklist:

1. Upload a small `.xlsx` file under 4 MB.
2. Upload a larger `.xlsx` file between 4 MB and 25 MB.
3. Confirm that the larger file no longer shows the old 4 MB blocking toast.
4. Confirm that Vercel logs no longer show `FUNCTION_PAYLOAD_TOO_LARGE` for the import flow.
5. Confirm that rows reload and the existing success toast is shown after import.
