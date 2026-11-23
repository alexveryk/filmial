# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase media lists

Media lists are stored in Firestore at `users/{uid}` and loaded when the user
signs in. Existing browser-stored lists are copied to Firebase the first time
that account is used.

Firebase client settings belong in `.env.local` as `VITE_FIREBASE_API_KEY`,
`VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
`VITE_FIREBASE_APP_ID`, and `VITE_FIREBASE_DATABASE_ID=filmialnative`. Keep the
existing `VITE_GOOGLE_CLIENT_ID` setting.

The app uses the named `filmialnative` database in Firestore Standard/Native
mode. The existing `filmialdata` Enterprise database has Firestore API access
disabled and cannot be used by the Firebase Web SDK. Create the new database
with the Firebase CLI, choosing a region appropriate for your users:

```sh
npx firebase-tools firestore:databases:create filmialnative --location=europe-west1 --edition=standard --project=filmial
npx firebase-tools deploy --only firestore:filmialnative --project=filmial
```

Enable Google as a Firebase Authentication provider before signing in.

## User search and friends

Users can choose an immutable, unique username (3–20 lowercase Latin letters,
digits, or underscores) in their profile. Authenticated users can search public
usernames and send friend requests; only the recipient can accept a request.
Public profile documents contain only the username, display name, and photo
URL. Private media lists remain in `users/{uid}`.

Deploy the Firestore rules and indexes after enabling user search, friend
requests, and shared groups:

```sh
npx firebase-tools deploy --only firestore:filmialnative --project=filmial
```

The collection-group index for memberships may take a few minutes to finish
building before group lists load successfully.

Users can create multiple movie groups, add accepted friends, and choose films
separately in each group. Group members can see each other's choices and shared
interests when at least two people choose the same movie; only the group owner
can manage its name and membership.
