require("dotenv").config();
const { Client } = require("pg");

const SQL = `

DELETE FROM users
WHERE email IN ('john.doe@example.com', 'jane.smith@example.com');

CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_member BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


INSERT INTO users (first_name, last_name, email, password_hash, membership_status)
VALUES 
('John', 'Doe', 'john.doe@example.com', 'hashed_password_1', 'member'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashed_password_2', 'admin');


INSERT INTO messages (title, body, user_id)
VALUES
('Welcome Message', 'Hello, I'm glad to be part of this amazing community!', 1),
('Admin Announcement', 'This is an important update from the team.', 2);
`;

async function main() {
    const client = new Client ({
        connectionString: process.env.DATABASE_CONNECTION_URL
    });

    await client.connect();
    console.log("Connected. Populating database...");
    await client.query(SQL);
    console.log("Database populated successfully.");
    await client.end();
}

main().catch((err) => {
  console.error("Error populating database:", err);
  process.exit(1);
});