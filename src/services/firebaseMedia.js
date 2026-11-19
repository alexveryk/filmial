import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { requireFirestore } from "./firebase";

let activeSyncUid = null;
let pendingWrites = Promise.resolve();

export const setCloudMediaSyncUser = (uid) => {
  activeSyncUid = uid;
};

export const isCloudMediaSyncUser = (uid) => activeSyncUid === uid;

export const loadCloudMediaState = async (uid) => {
  const mediaDoc = await getDoc(doc(requireFirestore(), "users", uid));
  return mediaDoc.exists() ? mediaDoc.data().mediaState || null : null;
};

export const saveCloudMediaState = (uid, mediaState) => {
  pendingWrites = pendingWrites
    .catch(() => {})
    .then(() =>
      setDoc(doc(requireFirestore(), "users", uid), {
        mediaState,
        updatedAt: serverTimestamp(),
      })
    );
  return pendingWrites;
};

export const waitForCloudMediaWrites = () => pendingWrites;
