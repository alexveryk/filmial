import {
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { requireFirebaseAuth, requireFirestore } from "./firebase";

const MAX_MEMBER_DELETES_PER_BATCH = 10;

export const loadMovieGroups = async (uid) => {
  const memberQuery = query(
    collectionGroup(requireFirestore(), "members"),
    where("uid", "==", uid),
  );
  const memberSnapshot = await getDocs(memberQuery);
  const groupRefs = memberSnapshot.docs
    .map((memberDocument) => memberDocument.ref.parent.parent)
    .filter(Boolean);
  const groupSnapshots = await Promise.all(
    groupRefs.map((groupRef) => getDoc(groupRef)),
  );

  return groupSnapshots
    .filter((groupSnapshot) => groupSnapshot.exists())
    .map((groupSnapshot) => ({
      id: groupSnapshot.id,
      ...groupSnapshot.data(),
    }));
};

export const subscribeUserMovieGroups = (uid, onGroups, onError) => {
  const memberQuery = query(
    collectionGroup(requireFirestore(), "members"),
    where("uid", "==", uid),
  );
  let latestSnapshot = 0;

  return onSnapshot(
    memberQuery,
    (memberSnapshot) => {
      const currentSnapshot = ++latestSnapshot;
      const groupRefs = [
        ...new Map(
          memberSnapshot.docs
            .map((memberDocument) => memberDocument.ref.parent.parent)
            .filter(Boolean)
            .map((groupRef) => [groupRef.id, groupRef]),
        ).values(),
      ];

      void Promise.all(groupRefs.map((groupRef) => getDoc(groupRef)))
        .then((groupSnapshots) => {
          if (currentSnapshot !== latestSnapshot) return;
          onGroups(
            groupSnapshots
              .filter((groupSnapshot) => groupSnapshot.exists())
              .map((groupSnapshot) => ({
                id: groupSnapshot.id,
                ...groupSnapshot.data(),
              })),
          );
        })
        .catch(onError);
    },
    onError,
  );
};

export const subscribeMovieGroupMembers = (groupId, onMembers, onError) =>
  onSnapshot(
    collection(requireFirestore(), "movieGroups", groupId, "members"),
    (memberSnapshot) =>
      onMembers(
        memberSnapshot.docs.map((memberDocument) => ({
          id: memberDocument.id,
          ...memberDocument.data(),
        })),
      ),
    onError,
  );

export const createMovieGroup = async (uid, name, friendUids) => {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  if (!normalizedName || normalizedName.length > 40) {
    throw new Error("Назва групи має містити від 1 до 40 символів.");
  }

  const memberUids = [...new Set([uid, ...friendUids])];
  const database = requireFirestore();
  const groupRef = doc(collection(database, "movieGroups"));
  const batch = writeBatch(database);
  batch.set(groupRef, {
    ownerUid: uid,
    name: normalizedName,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(groupRef, "members", uid), {
    uid,
    joinedAt: serverTimestamp(),
    selectedMovies: [],
  });
  await batch.commit();

  try {
    for (const memberUid of memberUids) {
      if (memberUid !== uid) {
        await addMovieGroupMember(groupRef.id, memberUid);
      }
    }
  } catch (error) {
    try {
      await deleteMovieGroup(groupRef.id);
    } catch (cleanupError) {
      console.error("Не вдалося прибрати незавершену групу:", cleanupError);
    }
    throw error;
  }

  return groupRef.id;
};

export const renameMovieGroup = (groupId, name) => {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  if (!normalizedName || normalizedName.length > 40) {
    throw new Error("Назва групи має містити від 1 до 40 символів.");
  }

  return updateDoc(doc(requireFirestore(), "movieGroups", groupId), {
    name: normalizedName,
  });
};

export const addMovieGroupMember = (groupId, uid) =>
  setDoc(doc(requireFirestore(), "movieGroups", groupId, "members", uid), {
    uid,
    joinedAt: serverTimestamp(),
    selectedMovies: [],
  });

export const removeMovieGroupMember = (groupId, uid) =>
  deleteDoc(doc(requireFirestore(), "movieGroups", groupId, "members", uid));

export const deleteMovieGroup = async (groupId) => {
  const database = requireFirestore();
  let groupSnapshot;
  try {
    groupSnapshot = await getDoc(doc(database, "movieGroups", groupId));
  } catch (error) {
    console.error("Не вдалося прочитати групу перед видаленням:", error);
    throw error;
  }
  if (!groupSnapshot.exists()) {
    throw new Error("Групу не знайдено.");
  }
  const ownerUid = groupSnapshot.data().ownerUid;
  const currentUid = requireFirebaseAuth().currentUser?.uid;
  if (!currentUid || currentUid !== ownerUid) {
    throw new Error("Активний Firebase-акаунт не є власником цієї групи.");
  }

  let membersSnapshot;
  try {
    membersSnapshot = await getDocs(
      collection(database, "movieGroups", groupId, "members"),
    );
  } catch (error) {
    console.error("Не вдалося прочитати учасників перед видаленням групи:", error);
    throw error;
  }
  const ownerMember = membersSnapshot.docs.find(
    (memberDocument) => memberDocument.id === ownerUid,
  );
  if (!ownerMember) throw new Error("Не знайдено власника групи.");
  const membersToDelete = membersSnapshot.docs.filter(
    (memberDocument) => memberDocument.id !== ownerUid,
  );

  for (
    let index = 0;
    index < membersToDelete.length;
    index += MAX_MEMBER_DELETES_PER_BATCH
  ) {
    const batch = writeBatch(database);
    membersToDelete
      .slice(index, index + MAX_MEMBER_DELETES_PER_BATCH)
      .forEach((memberDocument) => batch.delete(memberDocument.ref));
    try {
      await batch.commit();
    } catch (error) {
      console.error("Не вдалося видалити учасників групи:", error);
      throw error;
    }
  }

  const finalBatch = writeBatch(database);
  finalBatch.delete(ownerMember.ref);
  finalBatch.delete(doc(database, "movieGroups", groupId));
  try {
    await finalBatch.commit();
  } catch (error) {
    console.error("Не вдалося видалити групу або її власника:", error);
    throw error;
  }
};

export const toggleMovieGroupPick = (groupId, uid, movie, isSelected) => {
  const selection = {
    mediaId: String(movie.id),
    title: movie.title,
    posterPath: movie.poster_path || null,
  };
  return updateDoc(
    doc(requireFirestore(), "movieGroups", groupId, "members", uid),
    {
      selectedMovies: isSelected
        ? arrayRemove(selection)
        : arrayUnion(selection),
    },
  );
};
