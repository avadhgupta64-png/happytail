# Google OAuth Console — Happy Tail Setup Guide

This document covers every manual step required in Google Cloud Console
to make Google Sign-In work correctly for Happy Tail and show proper
Happy Tail branding on the Google consent screen.

**These are console actions — no code changes are needed.**

---

## 1. Create or select a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it **Happy Tail** and click **Create**
4. Make sure this project is selected before continuing

---

## 2. Enable the required APIs

1. Go to **APIs & Services → Library**
2. Search for and enable:
   - **Google People API** (required for `profile` scope — returns name, photo)
   - **Gmail API** is NOT needed — the app only requests `email` and `profile`

---

## 3. Configure the OAuth Consent Screen

Go to **APIs & Services → OAuth consent screen**

### User type
- Select **External** (allows any Google account to sign in)
- Click **Create**

### App information

| Field | Value |
|---|---|
| **App name** | `Happy Tail` |
| **User support email** | `pawcare.tech@gmail.com` |
| **App logo** | Upload `flutter/assets/logo.png` (the Happy Tail logo — 120×120 px minimum, PNG) |

### App domain

| Field | Value |
|---|---|
| **Application home page** | `https://happy-tail.onrender.com` |
| **Application privacy policy link** | `https://happy-tail.onrender.com/privacy` |
| **Application terms of service link** | `https://happy-tail.onrender.com/terms` *(optional)* |

### Authorised domains

Add both:
- `onrender.com`
- Your custom domain if you have one (e.g. `happytail.app`)

### Developer contact information
- `pawcare.tech@gmail.com`

Click **Save and Continue**

### Scopes

Click **Add or Remove Scopes** and select:
- `openid`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

These are the only scopes the app requests (`["profile", "email"]` in `replitAuth.ts`).

Click **Save and Continue**

### Test users (while app is in Testing status)
Add all email addresses that should be able to sign in during development:
- `pawcare.tech@gmail.com`
- `avadhgupta64@gmail.com`
- `avxdhgupta@gmail.com`
- Any other testers

Click **Save and Continue → Back to Dashboard**

---

## 4. Create the OAuth 2.0 Client ID

Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**

| Field | Value |
|---|---|
| **Application type** | Web application |
| **Name** | `Happy Tail Web` |

### Authorised JavaScript origins

Add all origins the app will be served from:

```
http://localhost:5000
https://happy-tail.onrender.com
```

> Add your custom domain here too if applicable.

### Authorised redirect URIs

The callback URL is hardcoded in `server/replit_integrations/auth/replitAuth.ts` as `/api/auth/google/callback`.
Add the full URLs:

```
http://localhost:5000/api/auth/google/callback
https://happy-tail.onrender.com/api/auth/google/callback
```

> **Important:** The URI must match exactly — including the scheme (`https://`), domain, and path. A trailing slash or wrong case will cause authentication to fail with `redirect_uri_mismatch`.

Click **Create**. Copy the **Client ID** and **Client Secret**.

---

## 5. Add credentials to environment variables

In your deployment environment (Render, local `.env`):

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_CLIENT_SECRET
```

In the Render dashboard: **Service → Environment → Add Environment Variable**

---

## 6. Publish the app (remove Testing restriction)

While the consent screen is in **Testing** mode, only the test users you added can sign in.

To allow all Google users:

1. Go to **APIs & Services → OAuth consent screen**
2. Click **Publish App**
3. Confirm the warning dialog

Google will show a verification notice for apps requesting sensitive scopes. The scopes Happy Tail requests (`email`, `profile`) are **non-sensitive** and do not require formal verification — the app can be published immediately.

---

## 7. Branding consistency checklist

These items ensure users see "Happy Tail" — not "My App" or a blank name — on the consent screen:

- [ ] App name set to **Happy Tail**
- [ ] Logo uploaded (square PNG, min 120×120 px)
- [ ] Homepage URL set
- [ ] Privacy policy URL set and resolves (even a simple page is fine)
- [ ] Authorised domains include `onrender.com`
- [ ] Redirect URIs match exactly (no trailing slashes, correct scheme)
- [ ] App status is **In production** (not Testing), OR all users are in the test-users list

---

## 8. For the Android app (Flutter WebView)

The Flutter wrapper loads the web app in a WebView. Google Sign-In happens inside
the WebView via the standard web OAuth flow — no additional Android OAuth configuration
is needed. The existing Web client ID is sufficient.

If you later add native Google Sign-In (outside the WebView), you will need an
additional **Android** OAuth client ID with the app's SHA-1 signing certificate fingerprint.
That is not needed for the current WebView-only implementation.

---

## Summary of what requires manual action

| Action | Where | Who |
|---|---|---|
| Create GCP project | Google Cloud Console | **You** |
| Configure consent screen branding | OAuth consent screen | **You** |
| Upload Happy Tail logo | OAuth consent screen | **You** |
| Add authorised origins and redirect URIs | OAuth 2.0 credentials | **You** |
| Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` env vars | Render + local `.env` | **You** |
| Publish app (remove Testing mode) | OAuth consent screen | **You** |

No code changes are needed for any of the above.
