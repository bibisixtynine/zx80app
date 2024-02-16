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

    console.log("\x1b[32m", `Database.js : => ${this.tableName} instantiated`, "\x1b[0m");
  }

  // PUBLIC : Connect method with error handling + Create key/value table if not exists
  async open() {
    try {
      await this.client.connect(); // Attempt to connect to the database
      // Create the key_value_store table if it does not exist
      await this.client.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} ( key VARCHAR(255) PRIMARY KEY, value TEXT );`);
      console.log("\x1b[32m", `Database.js : connected !!!`, "\x1b[0m");
    } catch (err) {
      console.error("\x1b[31m", `Database.js : Error executing open() :\x1b[0m\n`, err); // Log query execution error
      throw err; // Rethrow the error for upstream handling
    }

    // Add reconnection strategy
    this.client.on('error', async (err) => {
      console.error("\x1b[31m", `Database.js : ignore received error :\x1b[0m\n`, err); // Log query execution error
      
      //await this.reconnect();
    });
  }

  async reconnect() {
    console.log("\x1b[33m", 'Database.js : Attempting to reconnect to the database...', "\x1b[0m");
    try {
      await this.client.end();
    } catch (err) {
      console.error("\x1b[31m", `Database.js : Error executing reconnect() :\x1b[0m\n`, err); // Log query execution error
    }
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await this.open();
  }

  // PUBLIC : Save a key-value pair to the database
  async set(url, fileContent) {
    try {
      // Execute SQL query to insert or update the key-value pair
      await this.client.query(`INSERT INTO ${this.tableName} (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [url, fileContent]);
      // console.log("\x1b[32m", `=> ${url} saved`, "\x1b[0m");
    } catch (err) {
      //if (this.isConnectionError(err)) {
        console.error("\x1b[31m", `Database.js : Error executing set() :\x1b[0m\n`, err); // Log query execution error
        await this.reconnect();
        return this.set(url, fileContent); // Retry the query
      //} else {
      //  console.error("\x1b[31m", 'Error executing SAVE query', err, "\x1b[0m"); // Log query execution error
      //  throw err; // Rethrow the error for upstream handling
      //}
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

  /*
  isConnectionError(err) {
    // Add logic to determine if the error is a connection error.
    // This is dependent on the specifics of the PostgreSQL library in use.
    // As an example
    return err.code === '57P01' || // admin_shutdown
           err.code === '57P02' || // crash_shutdown
           err.code === '57P03' || // cannot_connect_now
           err.code === '01002';   // connection_exception
  }*/

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
        console.log("\x1b[33m", `=> ${url} not found`, "\x1b[0m");
        return null;
      }
    } catch (err) {
      //if (this.isConnectionError(err)) {
        // If a connection error is detected, reconnect and retry the get operation
        console.error("\x1b[31m", `Database.js : Error executing get() :\x1b[0m\n`, err); // Log query execution error
        await this.reconnect();
        return this.get(url);
      //} else {
      //  If the error is not a connection error, log it and re-throw
      //  console.error("\x1b[31m", `Error executing GET query for ${url}`, err, "\x1b[0m");
      //  throw err;
      //}
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
    //if (this.isConnectionError(err)) {
      console.error("\x1b[31m", `Database.js : Error executing getAll() :\x1b[0m\n`, err); // Log query execution error
      await this.reconnect();
      return this.getAll(); // Retry the query after reconnection
    //} else {
    //  console.error("\x1b[31m", 'Error executing GET ALL query', err, "\x1b[0m"); // Log query execution error
    //  throw err; // Rethrow the error for upstream handling
    //}
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
      console.log("\x1b[32m", `=> All key-value pairs were set`, "\x1b[0m");
    } catch (err) {
      // If an error occurs, rollback the transaction
      //if (this.isConnectionError(err)) {
        console.error("\x1b[31m", `Database.js : Error executing setAll() :\x1b[0m\n`, err); // Log query execution error
        await this.reconnect();
        return this.setAll(jsonString); // Retry the query after reconnection
      //} else {
      //  await this.client.query('ROLLBACK');
      //  console.error("\x1b[31m", 'Error executing SET ALL query', err, "\x1b[0m"); // Log query execution error
      //  throw err; // Rethrow the error for upstream handling
      //}
    }
  }


  
  // PUBLIC : Erase all key-value pairs from the database
  async eraseAll() {
    try {
      // Execute SQL query to delete all key-value pairs
      await this.client.query(`DELETE FROM ${this.tableName}`);
      console.log("\x1b[32m", 'All key-value pairs have been erased from the database.', "\x1b[0m");
    } catch (err) {
      // If there is a connection error, try to reconnect and call eraseAll again
      //if (this.isConnectionError(err)) {
        console.error("\x1b[31m", `Database.js : Error executing eraseAll() :\x1b[0m\n`, err); // Log query execution error
        await this.reconnect();
        return this.eraseAll(); // Retry the query after reconnection
      //} else {
      //  console.error("\x1b[31m", 'Error executing ERASE ALL query', err, "\x1b[0m"); // Log query execution error
      //  throw err; // Rethrow the error for upstream handling
      //}
    }
  }

    
  // PUBLIC : Erase a key-value pair from the database by key
  async erase(key) {
    try {
      // Execute SQL query to delete the key-value pair
      await this.client.query(`DELETE FROM ${this.tableName} WHERE key = $1`, [key]);
      console.log("\x1b[32m", `Key-value pair with key '${key}' has been erased from the database.`, "\x1b[0m");
    } catch (err) {
      //if (this.isConnectionError(err)) {
        console.error("\x1b[31m", `Database.js : Error executing erase() :\x1b[0m\n`, err);
        // If a connection error, try to reconnect and call erase again
        await this.reconnect();
        return this.erase(key); // Retry the query after reconnection
      //} else {
      //  console.error("\x1b[31m", 'Error executing ERASE query', err, "\x1b[0m"); // Log query execution error
      //  throw err; // Rethrow the error for upstream handling
      //}
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
  async hasKeyWithPrefix(prefix) {
    try {
      // Execute SQL query to check for any key starting with the prefix
      const result = await this.client.query(`SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE key LIKE $1 LIMIT 1)`, [prefix + '%']);
      return result.rows[0].exists; // Return true if a key with the prefix exists, otherwise false
    } catch (err) {
      console.error("\x1b[31m", `Database.js : Error executing hasKeyWithPrefix() :\x1b[0m\n`, err); // Log query execution error

      //if (this.isConnectionError(err)) {
        await this.reconnect();
        return this.hasKeyWithPrefix(prefix); // Retry the query after reconnection
      //} else {
      //  console.error("\x1b[31m", `Database.js : Error executing hasKeyWithPrefix() :\n`, err, "\x1b[0m"); // Log query execution error
        
      //  throw err; // Rethrow the error for upstream handling
      //}
    }
  }


}

// Export the Database class as a module for external use
module.exports = Database;
