# OYO Compass PWA

An installable PWA for the OYO Own Your Options coaching experience.

© 2026 Own Your Options™. All rights reserved.

Wellness disclaimer: OYO Compass provides coaching, reflection, education, and personal growth support. It does not replace a psychologist, psychiatrist, therapist, counsellor, doctor, medical provider, legal advisor, financial advisor, diagnosis, treatment, or emergency support.

## What Is Included

- Firebase login home screen for live user accounts
- Dashboard with daily action stats and manifestation card
- AI coach flow that adapts to each person's growth memory, goals, and free vs premium state
- Selectable coach identities: Maya, Elena, Marcus, or Noah
- AI coach portraits, short coach bios, and a personalized hello using the member's name
- Private per-user app memory so one member cannot see another member's journal, goals, actions, or coach memory
- Shared community feed stored separately from private member data
- Future self statement
- Vision board and journal
- Daily manifestation cards and gratitude
- NLP-inspired exercises
- Expanded premium NLP exercises, card vault, and resource library items for testing
- Goals and daily actions
- Whole-life coaching with business and LWA as one pathway inside the broader life compass
- Free and premium content gates
- Resource library
- Built-in community preview and premium posting
- Offline-ready service worker and web app manifest
- OYO-inspired dark, gold, purple, and white brand direction
- Growth Memory profile that tracks coach choice, stage, focus, patterns, evidence, and milestones
- Owner-only Admin tab protected by the configured Firebase owner email
- Admin can preview premium pack, and users can request password reset from the login screen
- Admin can edit Premium payment and LWA links from inside the Admin screen
- Admin can add free premium tester emails for people helping test the app
- Live AI coach support through a private Firebase Cloud Function, with the built-in coach kept as a backup
- Private starter questionnaire so the built-in coach can personalize each member's responses without requiring OpenAI setup
- Coach memory also learns from future self, vision board, journal, gratitude, goals, and daily actions
- Daily Notes tab so members can keep private dated notes inside the app
- Expanded community categories for Questions, Business Wins, Lifestyle, Goals, Gratitude, Support, and Daily Wins
- Expanded exercise and resource variety across identity, belief work, future self, state shift, confidence, lifestyle, relationships, money, and business
- Conversational coach replies that answer the member's actual question first, then connect it to their personal compass

## Run Locally

Open the project folder in a local web server and visit:

```text
http://127.0.0.1:4173/
```

In this workspace, a local preview is currently running on that address.

## Host On GitHub Pages

This is a static PWA, so GitHub Pages can host it directly.

Recommended setup:

1. Create a new GitHub repository.
2. Upload every file from this project into the repository.
3. In GitHub, go to `Settings` > `Pages`.
4. Under `Build and deployment`, choose `GitHub Actions`.
5. Push to the `main` branch, or run the included `Deploy OYO Compass to GitHub Pages` workflow manually.
6. GitHub will publish the app and show the live Pages URL.

No build command is required.

Included GitHub hosting files:

- `.github/workflows/pages.yml` to deploy with GitHub Actions
- `.nojekyll` so GitHub Pages serves static app files as-is
- `404.html` fallback for direct visits

Other static hosts are still supported through `netlify.toml`, `vercel.json`, `_headers`, and `_redirects`.

## Turn On The Live AI Coach

This step is optional. The app now includes a private starter questionnaire that helps the built-in coach personalize responses without setting up OpenAI.

The website files can go on GitHub Pages, but if you ever want the coach to use a real OpenAI model, the OpenAI key must never be placed in GitHub. The secure AI coach lives in Firebase Functions.

Important: Firebase may ask you to upgrade from Spark to Blaze/pay-as-you-go before it lets you deploy Cloud Functions.

Do this after your GitHub files are updated:

1. Install the Firebase tools if they are not already installed:

```text
npm install -g firebase-tools
```

2. In Terminal, open the app folder.

3. Log in to Firebase:

```text
firebase login
```

4. Connect this folder to your Firebase project:

```text
firebase use own-your-options-compass
```

5. Install the background AI coach code:

```text
cd functions
npm install
cd ..
```

6. Add your OpenAI API key as a private Firebase secret:

```text
firebase functions:secrets:set OPENAI_API_KEY
```

Paste the OpenAI key only when Firebase asks for it in Terminal. Do not paste the key into `app.js`, `firebase-config.js`, GitHub, or chat.

7. Deploy the live AI coach:

```text
firebase deploy --only functions
```

After this finishes, open `firebase-config.js` and change `useLiveAICoach` to `true`. Until then, the app uses the personalized built-in coach.

The function is already set to use the default model in `functions/index.js`, so the only private value you need to add right now is `OPENAI_API_KEY`.

## Make Each Person's Experience Private With Firebase

Use Firebase when you want each member to sign in and keep their own coach memory, journal, goals, gratitude, actions, and premium state.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add a Web app inside that Firebase project.
3. Copy the Firebase config values into `firebase-config.js`.
4. In Firebase, open `Authentication` and enable `Email/Password`.
5. In Firebase, open `Firestore Database` and create a database.
6. Publish the included `firestore.rules` so each user can only read and write their own `/users/{uid}` data.
7. Deploy with Firebase Hosting:

```text
firebase login
firebase init hosting firestore
firebase deploy
```

This app uses:

- Firebase Authentication for account login
- Cloud Firestore for private per-user app data
- Firebase Hosting for putting the PWA online

Until `firebase-config.js` has real Firebase values, the app is locked and cannot be used. There is no demo mode in the live build.

## Add Your LWA And Premium Payment Links

Open `firebase-config.js` and replace these placeholders:

```js
export const appLinks = {
  lwa: "PASTE_YOUR_LWA_LINK_HERE",
  premiumPayment: "PASTE_YOUR_PREMIUM_PAYMENT_LINK_HERE"
};
```

Example:

```js
export const appLinks = {
  lwa: "https://your-lwa-link.com",
  premiumPayment: "https://your-stripe-or-payment-link.com"
};
```

Use the LWA link for the button that sends premium users toward LWA.

Use the premium payment link for buttons such as `Unlock Premium`, `Upgrade`, and `Unlock full community`.

Important: the payment link sends people to pay, but it does not automatically mark them Premium yet. That will need Stripe/Firebase payment automation or manual admin approval later.

## Next Production Steps

- Replace local login with real authentication.
- Connect premium state to Stripe, Lemon Squeezy, or another payment provider.
- Keep improving the built-in coach prompts, or turn on the optional Firebase Function when you are ready for a live OpenAI coach.
- Store journals, goals, posts, and vision board assets in a database.
- Add admin tools for resources, LWA links, cards, exercises, and community moderation.
