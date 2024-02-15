// DataBase.js

const { Client } = require('pg');

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
 *   await db.open();
 *   await db.set('myKey', 'myValue'); // Saves a key-value pair to the database.
 *   const value = await db.get('myKey'); // Retrieves the value for the given key.
 *   const data = await db.getAll(); // Retrieves all key-value pairs as a JSON string.
 *   await db.setAll('{"anotherKey": "anotherValue"}'); // Loads multiple key-value pairs from a JSON string.
 *   await db.erase('myKey'); // Erases a key-value pair by key.
 *   await db.eraseAll(); // Erases all key-value pairs from the database.
 *   await db.close(); // Closes the database connection.
 * })();
 */
class Database {
  constructor(tableName = 'key_value_store') {
    this.tableName = tableName; // Store the table name for future use

    // Initialize database client with connection settings
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Allows connection without SSL certificate
      }
    });

    console.log("\x1b[32m", `=> ${this.tableName} instantiated`, "\x1b[0m");
  }

  // PUBLIC : Connect method with error handling + Create key/value table if not exists
  async open() {
    try {
      await this.client.connect(); // Attempt to connect to the database
      // Create the key_value_store table if it does not exist
      await this.client.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} ( key VARCHAR(255) PRIMARY KEY, value TEXT );`);
      console.log("\x1b[32m", `=> and connected`, "\x1b[0m");
    } catch (err) {
      console.error("\x1b[31m", 'Could not connect to the database!', err, "\x1b[0m"); // Log connection error
      throw err; // Rethrow the error for upstream handling
    }

  }

  // PUBLIC : Save a key-value pair to the database
  async set(url, fileContent) {
    try {
      // Execute SQL query to insert or update the key-value pair
      await this.client.query(`INSERT INTO ${this.tableName} (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [url, fileContent]);
      console.log("\x1b[32m", `=> ${url} saved`, "\x1b[0m");
    } catch (err) {
      console.error("\x1b[31m", 'Error executing SAVE query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }

  // PUBLIC : Retrieve a value by key from the database
  async get(url) {
    try {
      // Execute SQL query to select the value for the given key
      const result = await this.client.query(`SELECT value FROM ${this.tableName} WHERE key = $1`, [url]);
      return result.rows[0] ? result.rows[0].value : null; // Return the value if found, otherwise null
    } catch (err) {
      console.error("\x1b[31m", 'Error executing LOAD query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }
  
  // PUBLIC : Retrieve all key-value pairs from the database as a JSON string
  async getAll() {
    try {
      // Execute SQL query to select all key-value pairs
      const result = await this.client.query(`SELECT key, value FROM ${this.tableName}`);
      // Convert the result rows to an object
      const keyValuePairs = {};
      result.rows.forEach(row => {
        keyValuePairs[row.key] = row.value;
      });
      // Return the object as a JSON string
      return JSON.stringify(keyValuePairs);
    } catch (err) {
      console.error("\x1b[31m", 'Error executing GET ALL query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }

  
  // PUBLIC : Load the database from a JSON formatted string
  async setAll(jsonString) {
    try {
      // Parse the JSON string to an object
      const keyValuePairs = JSON.parse(jsonString);
      // Begin a transaction
      await this.client.query('BEGIN');
      // Insert each key-value pair into the database
      for (const [key, value] of Object.entries(keyValuePairs)) {
        await this.client.query(`INSERT INTO ${this.tableName} (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, value]);
      }
      // Commit the transaction
      await this.client.query('COMMIT');
      console.log("\x1b[32m", `=> ${this.tableName} filled`, "\x1b[0m");
    } catch (err) {
      // If an error occurs, rollback the transaction
      await this.client.query('ROLLBACK');
      console.error("\x1b[31m", 'Error executing LOAD FROM JSON query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }

  
  // PUBLIC : Erase all key-value pairs from the database
  async eraseAll() {
    try {
      // Execute SQL query to delete all key-value pairs
      await this.client.query(`DELETE FROM ${this.tableName}`);
      console.log("\x1b[32m", 'All key-value pairs have been erased from the database.', "\x1b[0m");
    } catch (err) {
      console.error("\x1b[31m", 'Error executing ERASE ALL query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }
    
  // PUBLIC : Erase a key-value pair from the database by key
  async erase(key) {
    try {
      // Execute SQL query to delete the key-value pair
      await this.client.query(`DELETE FROM ${this.tableName} WHERE key = $1`, [key]);
      console.log("\x1b[32m", `Key-value pair with key '${key}' has been erased from the database.`, "\x1b[0m");
    } catch (err) {
      console.error("\x1b[31m", 'Error executing ERASE query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }
  
  // PUBLIC : Close the database connection
  async close() {
    try {
      await this.client.end(); // Close the database connection
      console.log("\x1b[32m", 'Database connection closed.', "\x1b[0m");
    } catch (err) {
      console.error("\x1b[31m", 'Error closing the database connection', err, "\x1b[0m"); // Log closing connection error
      throw err; // Rethrow the error for upstream handling
    }
  }

  
  // PUBLIC : Check if there is any key beginning with a given prefix
  async asKeyWithPrefix(prefix) {
    try {
      // Execute SQL query to check for any key starting with the prefix
      const result = await this.client.query(`SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE key LIKE $1 LIMIT 1)`, [prefix + '%']);
      return result.rows[0].exists; // Return true if a key with the prefix exists, otherwise false
    } catch (err) {
      console.error("\x1b[31m", 'Error executing HAS KEY WITH PREFIX query', err, "\x1b[0m"); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }
  }

}

// Export the Database class as a module for external use
module.exports = Database;