import { collection, addDoc, doc, setDoc, query, where, getDocs, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export async function createGroup(name: string, type: 'private' | 'official', ownerId: string) {
  // Generate random 6-char code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const groupRef = await addDoc(collection(db, 'groups'), {
    name,
    type,
    joinCode,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    ownerId
  });

  // Add owner as admin
  await setDoc(doc(db, 'groups', groupRef.id, 'members', ownerId), {
    role: 'admin',
    joinedAt: new Date().toISOString()
  });

  return groupRef.id;
}

export async function joinGroup(joinCode: string, userId: string) {
  const groupsRef = collection(db, 'groups');
  const q = query(groupsRef, where("joinCode", "==", joinCode.toUpperCase()));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Invalid join code.");
  }

  const groupDoc = querySnapshot.docs[0];
  if (groupDoc.data().deletedAt) {
    throw new Error("Invalid join code.");
  }

  const groupId = groupDoc.id;

  // Check if already a member
  const memberRef = doc(db, 'groups', groupId, 'members', userId);
  const memberSnap = await getDoc(memberRef);
  if (memberSnap.exists()) {
    return groupId; // Already a member
  }

  // Add member
  await setDoc(memberRef, {
    role: 'member',
    joinedAt: new Date().toISOString()
  });

  // Increment member count (simplified, ideally use transactions)
  const currentCount = groupDoc.data().memberCount || 0;
  await updateDoc(doc(db, 'groups', groupId), {
    memberCount: currentCount + 1
  });

  return groupId;
}

export async function getUserGroups(userId: string) {
  const groupsRef = collection(db, 'groups');
  const snapshot = await getDocs(groupsRef); // Note: For MVP, we fetch all and filter client side. In prod, use a better query pattern or store groupIds on user profile
  
  const groups: any[] = [];
  for (const groupDoc of snapshot.docs) {
    const groupData = groupDoc.data();
    if (groupData.deletedAt) continue;

    const memberSnap = await getDoc(doc(db, 'groups', groupDoc.id, 'members', userId));
    if (memberSnap.exists()) {
      groups.push({ id: groupDoc.id, ...groupData, userRole: memberSnap.data().role });
    }
  }
  return groups;
}

export async function leaveGroup(groupId: string, userId: string) {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'groups', groupId, 'members', userId));
  
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    const currentCount = groupSnap.data().memberCount || 1;
    await updateDoc(groupRef, {
      memberCount: Math.max(0, currentCount - 1)
    });
  }
}

export async function deleteGroup(groupId: string) {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    deletedAt: new Date().toISOString(),
    memberCount: 0
  });

  try {
    const [membersSnap, wodsSnap, resultsSnap] = await Promise.all([
      getDocs(collection(db, 'groups', groupId, 'members')),
      getDocs(collection(db, 'groups', groupId, 'wods')),
      getDocs(collection(db, 'groups', groupId, 'results'))
    ]);

    const batch = writeBatch(db);
    membersSnap.docs.forEach(memberDoc => batch.delete(memberDoc.ref));
    wodsSnap.docs.forEach(wodDoc => batch.delete(wodDoc.ref));
    resultsSnap.docs.forEach(resultDoc => batch.delete(resultDoc.ref));
    batch.delete(groupRef);

    await batch.commit();
  } catch (error) {
    console.warn('Group was hidden, but hard delete cleanup failed.', error);
  }
}
