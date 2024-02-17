// DataBase.js

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


console.log("📀📀📀📀 NEW DEPLOY 02/17/24 09:45 📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀")

const { Client } = require('pg');

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

    this.isReconnecting = false;
    console.log(`📀☀️ constructor() ... NEW Client ${this.tableName} instantiated ---------------`);
  }

  // PUBLIC : Connect method with error handling + Create key/value table if not exists
  async open() {
    try {
      await this.client.connect(); // Attempt to connect to the database
      // Create the key_value_store table if it does not exist
      await this.client.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} ( key VARCHAR(255) PRIMARY KEY, value TEXT );`);
      console.log(`📀☀️ open() ... CONNECTED ---------------`);
    } catch (err) {
      console.error(`📀💥 open() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`);
    }

    // Add reconnection strategy :
    // In the cas of the neon database, it goes sleeping after 5mn of inactivity
    // This generate 2 error events
    // To avoid auto-restart of the server if theses errors where not handled, 
    // we add a reconnection strategy : just log the error.
    // We don't try to reconnect because the compute time of the database cost !
    this.client.on('error', async (err) => {
      console.error(`📀💥 onerror() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`);
    });
  }

  async reconnect() {
    ///////////////////////////////
    // already reconnecting ? => wait
    if (this.isReconnecting) {
      console.log('📀☀️ A reconnect attempt is already in progress.');
      while (this.isReconnecting) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait in a loop
      }
      return;
    }
    //
    ///////////////////////////////

    ///////////////////////////////
    //
    this.isReconnecting = true;
    
    try {
      console.log('📀☀️ reconnect().end ... TRY');
      await this.client.end();
      console.log('📀☀️ reconnect().end ... SUCCESS');
    } catch (err) {
      console.error(`📀💥 reconnect().end ... ## ERROR ## --> ${this.formatErrorMessage(err)}`);
    }
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await this.open();

    this.isReconnecting = false;
    //
    ///////////////////////////////
  }

  // PUBLIC : Save a key-value pair to the database
  async set(url, fileContent) {
    try {
      // Execute SQL query to insert or update the key-value pair
      await this.client.query(`INSERT INTO ${this.tableName} (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [url, fileContent]);
    } catch (err) {
      console.error("\x1b[31m", `📀💥 set() ... ## Error ## --> ${this.formatErrorMessage(err)}`);
      await this.reconnect();
      return this.set(url, fileContent); // Retry the query
    }
  }

  isConnectionError(err) {
    const connectionErrorCodes = [
      '57P01', // admin_shutdown
      '57P02', // crash_shutdown
      '57P03', // cannot_connect_now
      '01002', // connection_exception
      'ECONNREFUSED', // Connection refused
      'ETIMEDOUT', // Operation timed out
      // ... any other error codes or messages specific to your client or setup
    ];
  
    return connectionErrorCodes.includes(err.code) || (err.message && err.message.includes('timeout'));
  }

  // PUBLIC : Retrieve a value by key from the database
  async get(url) {
    try {
      // Execute SQL query to select the value for the given key
      const result = await this.client.query(`SELECT value FROM ${this.tableName} WHERE key = $1`, [url]);
      // Check if the key was found and return its value, otherwise return null
      if (result.rows.length > 0) {
        // console.log("\x1b[32m", `=> ${url} loaded`, "\x1b[0m");
        return result.rows[0].value;
      } else {
        console.log(`📀💥 get() ... ## ERROR ## <${url}> not found`);
        return null;
      }
    } catch (err) {
      // If a connection error is detected, reconnect and retry the get operation
      console.error(`📀💥 get() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`);
      await this.reconnect();
      return this.get(url);
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
      // Detect if the error is related to the connection and reconnect if necessary
      console.error(`📀💥 getAll() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`); // Log query execution error
      await this.reconnect();
      return this.getAll(); // Retry the query after reconnection
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
    } catch (err) {
      // If an error occurs, rollback the transaction
      console.error(`📀💥 setAll() setAll() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`); // Log query execution error
      await this.reconnect();
      return this.setAll(jsonString); // Retry the query after reconnection
    }
  }
  
  // PUBLIC : Erase all key-value pairs from the database
  async eraseAll() {
    try {
      // Execute SQL query to delete all key-value pairs
      await this.client.query(`DELETE FROM ${this.tableName}`);
      //console.log("\x1b[32m", 'All key-value pairs have been erased from the database.', "\x1b[0m");
    } catch (err) {
      // If there is a connection error, try to reconnect and call eraseAll again
      console.error(`📀💥 eraseAll() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`); // Log query execution error
      await this.reconnect();
      return this.eraseAll(); // Retry the query after reconnection
    }
  }

    
  // PUBLIC : Erase a key-value pair from the database by key
  async erase(key) {
    try {
      // Execute SQL query to delete the key-value pair
      await this.client.query(`DELETE FROM ${this.tableName} WHERE key = $1`, [key]);
      //console.log("\x1b[32m", `Key-value pair with key '${key}' has been erased from the database.`, "\x1b[0m");
    } catch (err) {
      console.error(`📀💥 erase() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`);
      await this.reconnect();
      return this.erase(key); // Retry the query after reconnection
    }
  }

  
  // PUBLIC : Close the database connection
  async close() {
    try {
      await this.client.end(); // Close the database connection
      console.log('📀☀️ close() ... OK');
    } catch (err) {
      console.error(`📀💥 close() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`);
    }
  }

  
  // PUBLIC : Check if there is any key beginning with a given prefix
  async hasKeyWithPrefix(prefix) {
    try {
      // Execute SQL query to check for any key starting with the prefix
      const result = await this.client.query(`SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE key LIKE $1 LIMIT 1)`, [prefix + '%']);
      return result.rows[0].exists; // Return true if a key with the prefix exists, otherwise false
    } catch (err) {
      console.error(`📀💥 hasKeyWithPrefix() ... ## ERROR ## --> ${this.formatErrorMessage(err)}`); 
      await this.reconnect();
      return this.hasKeyWithPrefix(prefix); // Retry the query after reconnection
    }
  }


  
  // PUBLIC: Replace all newline characters in an error message with ###
  formatErrorMessage(err) {
    if (typeof err === 'string') {
      return err.replace(/\r\n|\r|\n/g, '###');
    } else if (err instanceof Error) {
      return err.message.replace(/\r\n|\r|\n/g, '###');
    } else {
      return 'Unknown error format';
    }
  }
}

// Export the Database class as a module for external use
module.exports = Database;
