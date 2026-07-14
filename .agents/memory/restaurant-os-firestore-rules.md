---
name: RestaurantOS recommended Firestore security rules
description: The exact rules text to hand the user for restaurant-os-88262 — not yet deployed by the agent.
---

Paste this into Firebase Console → Firestore Database → Rules for project `restaurant-os-88262`,
then Publish. Matches the `owners/{uid}` + `restaurants/{restaurantId}` scheme in
`firebase-multitenant-restaurant-os.md`.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /owners/{uid} {
      allow read, create: if request.auth != null && request.auth.uid == uid;
      allow update, delete: if false;
    }
    match /restaurants/{restaurantId} {
      allow read: if restaurantId == "default"
        || (request.auth != null
            && get(/databases/$(database)/documents/owners/$(request.auth.uid)).data.restaurantId == restaurantId);
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/owners/$(request.auth.uid)).data.restaurantId == restaurantId;
    }
  }
}
```
