require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const CREATE_TABLE_SQL = `


CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_member BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXITS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

async function main() {
    const client = new Client ({
        connectionString: process.env.DATABASE_CONNECTION_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    await client.connect();
    console.log("Connected. Populating database...");

    const johnPass = await bcrypt.hash("password123", 10);
    const janePass = await bcrypt.hash("admin123", 10);

    await client.query(CREATE_TABLE_SQL);

    const john = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, is_member, is_admin)
        VALUES ('John', 'Doe', 'john.doe@example.com', $1, TRUE, FALSE)
        RETURNING id`, [johnPass]
    );

    const jane = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, is_member, is_admin)
        VALUES ('Jane', 'Smith', 'jane.smith@example.com', $1, TRUE, TRUE)
        RETURNING id`, [janePass]
    );

    await client.query(`
        INSERT INTO messages (title, body, user_id)
        VALUES
        ('Welcome Message', 'Hello, glad to be part of this amazing community!', $1),
        ('Admin Announcement', 'This is an important update from the team.', $2)`, [john.rows[0].id, jane.rows[0].id]
    );

    console.log("Database populated successfully.");
    await client.end();
}

main().catch((err) => {
  console.error("Error populating database:", err);
  process.exit(1);
});