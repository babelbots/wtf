import { collection, addDoc, doc, setDoc, query, where, getDocs, getDoc, updateDoc, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
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
    ownerId,
    memberIds: [ownerId]
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
    memberCount: currentCount + 1,
    memberIds: arrayUnion(userId)
  });

  return groupId;
}

export async function getUserGroups(userId: string) {
  const groupsRef = collection(db, 'groups');
  // Use array-contains for fast fetching
  const q = query(groupsRef, where('memberIds', 'array-contains', userId));
  const snapshot = await getDocs(q);
  
  // We still need the role and joinedAt which are stored in the member subcollection.
  // To avoid N+1 queries here, we can fetch all member docs in parallel.
  const groupDocs = snapshot.docs.filter(doc => !doc.data().deletedAt);
  
  const memberPromises = groupDocs.map(groupDoc => 
    getDoc(doc(db, 'groups', groupDoc.id, 'members', userId))
  );
  const memberSnaps = await Promise.all(memberPromises);

  const groups: any[] = [];
  
  groupDocs.forEach((groupDoc, index) => {
    const groupData = groupDoc.data();
    const memberSnap = memberSnaps[index];
    
    if (memberSnap.exists()) {
      groups.push({ 
        id: groupDoc.id, 
        ...groupData, 
        userRole: memberSnap.data().role,
        joinedAt: memberSnap.data().joinedAt || groupData.createdAt
      });
    }
  });
  
  return groups.sort((a, b) => {
    const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
    const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
    const safeTimeA = isNaN(timeA) ? 0 : timeA;
    const safeTimeB = isNaN(timeB) ? 0 : timeB;
    return safeTimeB - safeTimeA;
  });
}

export async function leaveGroup(groupId: string, userId: string) {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'groups', groupId, 'members', userId));
  
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    const currentCount = groupSnap.data().memberCount || 1;
    await updateDoc(groupRef, {
      memberCount: Math.max(0, currentCount - 1),
      memberIds: arrayRemove(userId)
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

export async function getUserResultsHistory(userId: string) {
  const groups = await getUserGroups(userId);
  const history: any[] = [];
  
  // Fetch results for all groups in parallel
  const resultsPromises = groups.map(group => {
    const resultsRef = collection(db, 'groups', group.id, 'results');
    const q = query(resultsRef, where('userId', '==', userId));
    return getDocs(q).then(snap => ({ group, docs: snap.docs }));
  });
  
  const resultsSnapshots = await Promise.all(resultsPromises);
  
  // Collect all unique WOD IDs and their references to fetch in parallel
  const wodRefsToFetch: { ref: any; groupId: string; wodId: string }[] = [];
  
  resultsSnapshots.forEach(({ group, docs }) => {
    docs.forEach(docSnap => {
      const resultData = docSnap.data();
      if (resultData.wodId) {
        wodRefsToFetch.push({
          ref: doc(db, 'groups', group.id, 'wods', resultData.wodId),
          groupId: group.id,
          wodId: resultData.wodId
        });
      }
    });
  });
  
  // Fetch all WODs in parallel
  const wodDocs = await Promise.all(wodRefsToFetch.map(item => getDoc(item.ref)));
  
  // Create a map for quick WOD lookup
  const wodDataMap = new Map();
  wodDocs.forEach(wodSnap => {
    if (wodSnap.exists()) {
      // Map key could be groupId_wodId to ensure uniqueness across groups
      const groupId = wodSnap.ref.parent.parent?.id;
      if (groupId) {
        wodDataMap.set(`${groupId}_${wodSnap.id}`, wodSnap.data());
      }
    }
  });

  resultsSnapshots.forEach(({ group, docs }) => {
    docs.forEach(docSnap => {
      const resultData = docSnap.data();
      const wodId = resultData.wodId;
      
      let wodData = null;
      if (wodId) {
        wodData = wodDataMap.get(`${group.id}_${wodId}`) || null;
      }
      
      history.push({
        id: docSnap.id,
        groupId: group.id,
        groupName: group.name,
        ...resultData,
        wod: wodData
      });
    });
  });
  
  return history.sort((a, b) => {
    const timeA = a.loggedAt || a.createdAt || '';
    const timeB = b.loggedAt || b.createdAt || '';
    return timeB.localeCompare(timeA);
  });
}

export async function promoteToAdmin(groupId: string, targetUserId: string) {
  const memberRef = doc(db, 'groups', groupId, 'members', targetUserId);
  await updateDoc(memberRef, { role: 'admin' });
}

export async function updateGroupSettings(groupId: string, name: string, imageUrl: string | null, startDate: string, endDate: string) {
  const groupRef = doc(db, 'groups', groupId);
  const data: any = { seasonStartDate: startDate, seasonEndDate: endDate };
  if (name) data.name = name;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  await updateDoc(groupRef, data);
}
