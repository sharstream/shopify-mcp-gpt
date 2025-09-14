import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const dbPath = path.join(projectRoot, 'data', 'offers.db');

let db;

async function connect() {
  if (db) return db; // async functions automatically wrap return values in a Promise

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        reject(err);
      } else {
        console.log('Connected to the SQLite database.');
        resolve(db);
      }
    });
  });
}

async function initializeDatabase() {
  const db = await connect();
  return new Promise((resolve, reject) => {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS sent_offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkout_id TEXT NOT NULL UNIQUE,
        customer_email TEXT NOT NULL,
        sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        coupon_code TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'FAILED'))
      );
    `;
    db.run(createTableSql, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        return reject(err);
      }
      console.log('Table "sent_offers" is ready.');
      resolve();
    });
  });
}

async function addSentOffer({ checkout_id, customer_email, coupon_code, status }) {
    const db = await connect();
    const insertSql = `
        INSERT INTO sent_offers (checkout_id, customer_email, coupon_code, status)
        VALUES (?, ?, ?, ?);
    `;
    return new Promise((resolve, reject) => {
        db.run(insertSql, [checkout_id, customer_email, coupon_code, status], function(err) {
            if (err) {
                console.error('Error inserting offer:', err.message);
                return reject(err);
            }
            resolve({ id: this.lastID });
        });
    });
}

async function checkIfOfferSentRecently({ checkout_id, hours = 24 }) {
    const db = await connect();
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const selectSql = `
        SELECT id FROM sent_offers
        WHERE checkout_id = ? AND sent_at > ?;
    `;

    return new Promise((resolve, reject) => {
        db.get(selectSql, [checkout_id, cutoffDate.toISOString()], (err, row) => {
            if (err) {
                console.error('Error checking for recent offer:', err.message);
                return reject(err);
            }
            resolve(!!row);
        });
    });
}


export {
  connect,
  initializeDatabase,
  addSentOffer,
  checkIfOfferSentRecently,
};
