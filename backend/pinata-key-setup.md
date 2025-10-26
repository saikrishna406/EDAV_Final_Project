# 🔑 Pinata API Key Setup

## Issue: Current key lacks required scopes

Your current API key doesn't have the necessary permissions for file uploads.

## Steps to Fix:

1. **Go to Pinata Dashboard**: https://app.pinata.cloud/keys
2. **Delete current key** (if needed)
3. **Create New API Key** with these permissions:
   - ✅ **pinFileToIPFS** (required for uploads)
   - ✅ **pinJSONToIPFS** (optional but useful)
   - ✅ **unpin** (optional for file management)
   - ✅ **userPinnedDataTotal** (optional for usage stats)

4. **Copy new credentials** and update .env:
   ```
   PINATA_API_KEY=new_api_key_here
   PINATA_SECRET_KEY=new_secret_key_here
   ```

## Alternative: Use JWT Token

If API keys continue to have issues, you can use JWT tokens instead:
1. Generate JWT token in Pinata dashboard
2. Update code to use Authorization header with Bearer token

Let me know the new credentials once you create them!