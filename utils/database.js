import * as SQLite from 'expo-sqlite';

// Open (or create) the database file
const db = SQLite.openDatabaseSync('summaries.db');

// 1. Initialize the Table
export const initDB = async () => {
  try {
    // execAsync is for running multiple queries or schema setups
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to init DB:", error);
  }
};

// 2. Insert Data
export const insertSummary = async (url, title, body) => {
  try {
    const date = new Date().toISOString();
    // runAsync is for INSERT/UPDATE/DELETE (writes)
    const result = await db.runAsync(
      'INSERT INTO summaries (url, title, body, created_at) VALUES (?, ?, ?, ?)',
      [url, title, body, date]
    );
    return result;
  } catch (error) {
    console.error("Error inserting summary:", error);
  }
};

// 3. Fetch All Data
export const fetchSummaries = async () => {
  try {
    // getAllAsync returns the array of objects directly! 
    // No more "rows._array" madness.
    const allRows = await db.getAllAsync(
      'SELECT * FROM summaries ORDER BY created_at DESC'
    );
    return allRows;
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return [];
  }
};

// 4. Update Data
export const updateSummaryDB = async (id, title, body) => {
  try {
    await db.runAsync(
      'UPDATE summaries SET title = ?, body = ? WHERE id = ?',
      [title, body, id]
    );
  } catch (error) {
    console.error("Error updating summary:", error);
  }
};

// 5. Delete Data
export const deleteSummaryDB = async (id) => {
  try {
    await db.runAsync(
      'DELETE FROM summaries WHERE id = ?',
      [id]
    );
    // Return updated list so UI can refresh easily
    return await fetchSummaries(); 
  } catch (error) {
    console.error("Error deleting summary:", error);
    return [];
  }
};