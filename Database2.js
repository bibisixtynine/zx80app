// DataBase2.js
// The new version of Database.js .... using Pool
//   ==> the code is much more readable and maintainable !!!
/**
 * This class provides a simple interface to interact with a PostgreSQL database.
 * It allows saving and loading key-value pairs.
 *
 * It requires a PostgreSQL database to be available.
 * 
 * Example usage:
 * const Database = require("./Database");
 * const db = new Database('key_value_big_store');
 * (async () => {
 *   await db.set('myKey', 'myValue'); // Saves a key-value pair to the database.
 *   const value = await db.get('myKey'); // Retrieves the value for the given key.
 *   const data = await db.getAll(); // Retrieves all key-value pairs as a JSON string.
 *   await db.setAll('{"anotherKey": "anotherValue"}'); // Loads multiple key-value pairs from a JSON string.
 *   await db.erase('myKey'); // Erases a key-value pair by key.
 *   await db.eraseAll(); // Erases all key-value pairs from the database.
 *   await db.close(); // Closes all database connections properly, such as after performing all the necessary queries or before your application stops running. Without it, these resources may not be cleaned up correctly, which can lead to memory leaks or other database issues, such as too many open connections.
 * })();
 */

console.log("🐬🐬🐬🐬🐬🐬🐬 DB2 - DEPLOY dim 18 fev - 13h54 🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬")


const { Pool } = require('pg');

class Database {
  #tableName; // private field
  #pool; // private field
  constructor(tableName = 'key_value_store') {
    this.#pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    this.#tableName = tableName;
  }

  async #query(text, params) {
    const client = await this.#pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  async set(key, value) {
    const queryText = `
      INSERT INTO ${this.#tableName} (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    await this.#query(queryText, [key, value]);
  }

  async get(key) {
    const queryText = `SELECT value FROM ${this.#tableName} WHERE key = $1`;
    const res = await this.#query(queryText, [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
  }

  async getAll() {
    const queryText = `SELECT key, value FROM ${this.#tableName}`;
    const res = await this.#query(queryText);
    const keyValuePairs = {};
    res.rows.forEach(row => {
      keyValuePairs[row.key] = row.value;
    });
    return keyValuePairs;
  }

  async setAll(jsonString) {
    const keyValuePairs = JSON.parse(jsonString);
    await this.#pool.connect();
    try {
      await this.#query('BEGIN');
      for (const [key, value] of Object.entries(keyValuePairs)) {
        await this.set(key, value);
      }
      await this.#query('COMMIT');
    } catch (e) {
      await this.#query('ROLLBACK');
      throw e;
    }
  }

  async erase(key) {
    const queryText = `DELETE FROM ${this.#tableName} WHERE key = $1`;
    await this.#query(queryText, [key]);
  }

  async eraseAll() {
    const queryText = `DELETE FROM ${this.#tableName}`;
    await this.#query(queryText);
  }

  async hasKeyWithPrefix(prefix) {
    const queryText = `
      SELECT EXISTS(SELECT 1 FROM ${this.#tableName} WHERE key LIKE $1 LIMIT 1)
    `;
    const res = await this.#query(queryText, [`${prefix}%`]);
    return res.rows[0].exists;
  }

  async close() {
    await this.#pool.end();
  }
}

module.exports = Database;
