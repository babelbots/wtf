import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase';

async function migrate() {
  console.log("Starting migration...");
  const groupsRef = collection(db, 'groups');
  const snapshot = await getDocs(groupsRef);
  
  let updatedCount = 0;
  for (const groupDoc of snapshot.docs) {
    const groupId = groupDoc.id;
    console.log(`Processing group ${groupId}...`);
    
    // Fetch members
    const membersRef = collection(db, 'groups', groupId, 'members');
    const membersSnapshot = await getDocs(membersRef);
    
    const memberIds = membersSnapshot.docs.map(doc => doc.id);
    
    if (memberIds.length > 0) {
      await updateDoc(doc(db, 'groups', groupId), {
        memberIds: memberIds
      });
      console.log(`Updated group ${groupId} with ${memberIds.length} members.`);
      updatedCount++;
    } else {
      console.log(`Group ${groupId} has no members. Skipping.`);
    }
  }
  
  console.log(`Migration complete! Updated ${updatedCount} groups.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
