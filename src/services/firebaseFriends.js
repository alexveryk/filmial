import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { requireFirestore } from "./firebase";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export const normalizeUsername = (username) =>
  typeof username === "string" ? username.trim().toLowerCase() : "";

export const isValidUsername = (username) =>
  USERNAME_PATTERN.test(normalizeUsername(username));

export const getPublicProfile = async (uid) => {
  const profileSnapshot = await getDoc(
    doc(requireFirestore(), "userProfiles", uid),
  );
  return profileSnapshot.exists() ? profileSnapshot.data() : null;
};

export const syncPublicProfile = async (uid, identity) => {
  const database = requireFirestore();
  const profileRef = doc(database, "userProfiles", uid);
  const profileSnapshot = await getDoc(profileRef);

  if (!profileSnapshot.exists()) return null;

  await updateDoc(profileRef, {
    displayName: identity.displayName || "Користувач",
    photoURL: identity.photoURL || null,
  });

  return {
    ...profileSnapshot.data(),
    displayName: identity.displayName || "Користувач",
    photoURL: identity.photoURL || null,
  };
};

export const claimUsername = async (uid, username, identity) => {
  const usernameLower = normalizeUsername(username);
  if (!isValidUsername(usernameLower)) {
    throw new Error("Username має містити 3–20 символів: латинські літери, цифри або _.");
  }

  const database = requireFirestore();
  const usernameRef = doc(database, "usernames", usernameLower);
  const profileRef = doc(database, "userProfiles", uid);

  await runTransaction(database, async (transaction) => {
    const [usernameSnapshot, profileSnapshot] = await Promise.all([
      transaction.get(usernameRef),
      transaction.get(profileRef),
    ]);

    if (profileSnapshot.exists()) {
      const currentUsername = profileSnapshot.data().username;
      if (currentUsername !== usernameLower) {
        throw new Error("Username вже встановлено й не може бути змінений.");
      }
      return;
    }

    if (usernameSnapshot.exists() && usernameSnapshot.data().uid !== uid) {
      throw new Error("Цей username вже зайнятий. Спробуйте інший.");
    }

    transaction.set(usernameRef, { uid });
    transaction.set(profileRef, {
      username: usernameLower,
      usernameLower,
      displayName: identity.displayName || "Користувач",
      photoURL: identity.photoURL || null,
    });
  });

  return usernameLower;
};

export const searchUsersByUsername = async (username, currentUid) => {
  const prefix = normalizeUsername(username);
  if (prefix.length < 2) return [];

  const userQuery = query(
    collection(requireFirestore(), "userProfiles"),
    where("usernameLower", ">=", prefix),
    where("usernameLower", "<=", `${prefix}\uf8ff`),
    orderBy("usernameLower"),
    limit(10),
  );
  const snapshot = await getDocs(userQuery);

  return snapshot.docs
    .filter((userDocument) => userDocument.id !== currentUid)
    .map((userDocument) => ({ uid: userDocument.id, ...userDocument.data() }));
};

export const loadFriendRequests = async (uid) => {
  const requests = collection(requireFirestore(), "friendRequests");
  const [incoming, outgoing] = await Promise.all([
    getDocs(query(requests, where("toUid", "==", uid))),
    getDocs(query(requests, where("fromUid", "==", uid))),
  ]);
  const byId = new Map();

  [...incoming.docs, ...outgoing.docs].forEach((requestDocument) => {
    byId.set(requestDocument.id, {
      id: requestDocument.id,
      ...requestDocument.data(),
    });
  });

  return [...byId.values()];
};

export const sendFriendRequest = async (fromUid, toUid) => {
  if (fromUid === toUid) throw new Error("Не можна додати себе в друзі.");

  const database = requireFirestore();
  const outgoingRef = doc(database, "friendRequests", `${fromUid}_${toUid}`);
  const incomingRef = doc(database, "friendRequests", `${toUid}_${fromUid}`);

  await runTransaction(database, async (transaction) => {
    const [outgoing, incoming] = await Promise.all([
      transaction.get(outgoingRef),
      transaction.get(incomingRef),
    ]);

    if (outgoing.exists()) {
      throw new Error("Запит уже надіслано або ви вже друзі.");
    }
    if (incoming.exists()) {
      throw new Error("Цей користувач уже надіслав вам запит.");
    }

    transaction.set(outgoingRef, {
      fromUid,
      toUid,
      status: "pending",
    });
  });
};

export const acceptFriendRequest = (requestId) =>
  updateDoc(doc(requireFirestore(), "friendRequests", requestId), {
    status: "accepted",
  });

export const deleteFriendRequest = (requestId) =>
  deleteDoc(doc(requireFirestore(), "friendRequests", requestId));

export const removeFriend = async (firstUid, secondUid) => {
  const database = requireFirestore();
  const relationshipRefs = [
    doc(database, "friendRequests", `${firstUid}_${secondUid}`),
    doc(database, "friendRequests", `${secondUid}_${firstUid}`),
  ];
  const relationships = await Promise.all(
    relationshipRefs.map((relationshipRef) => getDoc(relationshipRef)),
  );
  const batch = writeBatch(database);
  relationships.forEach((relationship, index) => {
    if (relationship.exists()) batch.delete(relationshipRefs[index]);
  });
  await batch.commit();
};
