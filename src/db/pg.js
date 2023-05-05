import pg from 'pg';
const { Client } = pg

import config from 'config'


async function updateWebsiteWatchdog(success, latency) {
    const client = new Client(config.db.pg);

    latency = success ? latency : 0
    try {
        await client.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS website_watchdog (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP,
                success BOOLEAN,
                latency INTEGER
            );
            `);

        const timestamp = new Date();
        await client.query(`
            INSERT INTO website_watchdog (timestamp, success, latency)
            VALUES ($1, $2, $3);
            `, [timestamp, success, latency]);

        console.log('Data inserted into PG successfully!');
    } catch (error) {
        console.error('Error inserting data: ', error);
    } finally {
        client
            .end()
            .catch((err) => console.error('error during disconnection', err.stack))
    }
}

export { updateWebsiteWatchdog }