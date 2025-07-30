// Firebase-specific backup and restore functionality
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  writeBatch,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { getCurrentUserID } from '../firebase';

class FirebaseBackupManager {
  constructor() {
    this.backupVersion = '3.0';
  }

  // Export all Firebase data for current user
  async exportFirebaseData() {
    try {
      const userId = getCurrentUserID();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Starting Firebase data export for user:', userId);

      // Get all shopping lists where user is creator
      const createdQuery = query(
        collection(db, 'shoppingLists'), 
        where('creatorId', '==', userId)
      );
      
      const createdSnapshot = await getDocs(createdQuery);
      const lists = [];

      for (const listDoc of createdSnapshot.docs) {
        const listData = listDoc.data();
        
        // Convert Firestore Timestamps to ISO strings for JSON serialization
        const serializedList = {
          id: listDoc.id,
          name: listData.name,
          items: listData.items ? listData.items.map(item => ({
            id: item.id,
            name: item.name,
            completed: item.completed,
            addedAt: item.addedAt?.toDate?.()?.toISOString() || new Date(item.addedAt).toISOString(),
            addedBy: item.addedBy
          })) : [],
          creatorName: listData.creatorName,
          creatorId: listData.creatorId,
          deviceUID: listData.deviceUID,
          sharedWith: listData.sharedWith || [],
          createdAt: listData.createdAt?.toDate?.()?.toISOString() || new Date(listData.createdAt).toISOString(),
          updatedAt: listData.updatedAt?.toDate?.()?.toISOString() || new Date(listData.updatedAt).toISOString(),
          isCreator: true
        };

        lists.push(serializedList);
      }

      // Skip shared lists where user is not creator - only backup user's own lists

      const backup = {
        timestamp: Date.now(),
        version: this.backupVersion,
        userId: userId,
        lists: lists,
        // Only include lists where user is creator - no shared lists from others
        metadata: {
          totalLists: lists.length,
          ownLists: lists.length,
          sharedLists: 0,
          totalItems: lists.reduce((sum, list) => sum + (list.items?.length || 0), 0)
        }
      };

      console.log('✅ Firebase export completed:', {
        ownLists: lists.length,
        onlyOwnLists: true,
        totalItems: backup.metadata.totalItems
      });

      return backup;
    } catch (error) {
      console.error('❌ Firebase export failed:', error);
      throw error;
    }
  }

  // Import Firebase data from backup
  async importFirebaseData(backup, options = {}) {
    try {
      const { 
        importOwnLists = true,
        importSharedLists = false, // Default: don't re-import shared lists
        skipDuplicates = true 
      } = options;

      if (!backup || !backup.lists) {
        throw new Error('Invalid backup data');
      }

      const currentUserId = getCurrentUserID();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Starting Firebase data import:', {
        backupVersion: backup.version,
        backupUser: backup.userId,
        currentUser: currentUserId,
        listsToImport: backup.lists?.length || 0
      });

      // Check if backup belongs to current user
      if (backup.userId !== currentUserId) {
        console.warn('⚠️ Backup from different user, filtering by creatorId');
      }

      const batch = writeBatch(db);
      let importedCount = 0;
      let skippedCount = 0;

      // Import own lists
      if (importOwnLists && backup.lists) {
        for (const list of backup.lists) {
          try {
            // Check for existing lists with same name
            if (skipDuplicates) {
              const existingQuery = query(
                collection(db, 'shoppingLists'),
                where('creatorId', '==', currentUserId),
                where('name', '==', list.name)
              );
              
              const existingSnapshot = await getDocs(existingQuery);
              if (!existingSnapshot.empty) {
                console.log(`⏭️ Skipping duplicate list: ${list.name}`);
                skippedCount++;
                continue;
              }
            }

            // Create new list document
            const newListData = {
              name: list.name,
              items: list.items || [],
              creatorName: list.creatorName,
              creatorId: currentUserId,
              deviceUID: currentUserId,
              sharedWith: list.sharedWith || [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };

            const newDocRef = doc(collection(db, 'shoppingLists'));
            batch.set(newDocRef, newListData);
            importedCount++;

            console.log(`✅ Queued import: ${list.name} (${list.items?.length || 0} items)`);
          } catch (error) {
            console.error(`❌ Failed to prepare list ${list.name}:`, error);
          }
        }
      }

      // Commit the batch
      if (importedCount > 0) {
        await batch.commit();
        console.log(`✅ Batch commit successful: ${importedCount} lists imported, ${skippedCount} skipped`);
      } else {
        console.log('ℹ️ No lists to import');
      }

      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: (backup.lists?.length || 0) + (backup.sharedLists?.length || 0)
      };
    } catch (error) {
      console.error('❌ Firebase import failed:', error);
      throw error;
    }
  }

  // Create downloadable backup file
  async createDownloadableBackup() {
    try {
      const backup = await this.exportFirebaseData();
      
      // Create downloadable file
      const backupData = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `boodschappenlijst-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return backup;
    } catch (error) {
      console.error('❌ Failed to create downloadable backup:', error);
      throw error;
    }
  }

  // Restore from file
  async restoreFromFile(file, options = {}) {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      // Validate backup structure
      if (!backup.lists || !backup.version) {
        throw new Error('Invalid backup file format');
      }

      console.log('📂 File loaded:', {
        version: backup.version,
        lists: backup.lists.length,
        sharedLists: backup.sharedLists?.length || 0
      });

      return await this.importFirebaseData(backup, options);
    } catch (error) {
      console.error('❌ Failed to restore from file:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const firebaseBackup = new FirebaseBackupManager();