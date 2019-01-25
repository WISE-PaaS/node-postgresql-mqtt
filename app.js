const express = require('express');
const mqtt = require('mqtt');
const moment = require('moment');
const { Pool } = require('pg');
const app = express();

const numOfTempsReturned = 30;

// ----- Local DB
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  port: 5432,
  database: 'home_data',
  max: 3,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000
});

// ----- Remote DB --- Get env variables
// const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
// const host = vcap_services.postgresql[0].credentials.host;
// const user = vcap_services.postgresql[0].credentials.username;
// const password = vcap_services.postgresql[0].credentials.password;
// const dbPort = vcap_services.postgresql[0].credentials.port;
// const database = vcap_services.postgresql[0].credentials.database;
// const pool = new Pool({
//   host: host,
//   user: user,
//   password: password,
//   port: dbPort,
//   database: database,
//   max: 3,
//   idleTimeoutMillis: 5000,
//   connectionTimeoutMillis: 2000
// });

// SQL commands for creating table for storing data
const queryString = `
CREATE SCHEMA IF NOT EXISTS "livingroom";
ALTER SCHEMA "livingroom" OWNER TO "groupFamily";
CREATE TABLE IF NOT EXISTS "livingroom"."temperature"(
  id serial,
  timestamp timestamp (2) default current_timestamp,
  temperature integer,
  PRIMARY KEY (id)
);
ALTER TABLE "livingroom"."temperature" OWNER to "groupFamily";
GRANT ALL ON ALL TABLES IN SCHEMA "livingroom" TO "groupFamily";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "livingroom" TO "groupFamily";
`;

// Execute the SQL commands for startup
pool.query(queryString)
  .then(result => {
    console.log('@' + formatTime() + ' -- Schema and table initialized.');
  })
  .catch(err => console.error('Error adding table...', err.stack));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('@' + formatTime() + ` -- Server started on port ${port}!`);
});

// ----------------- API endpoints --------------------------------
// Added for health check on wise-paas
app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/temps', (req, res) => {
  const queryString = `
  SELECT * 
    FROM (SELECT * FROM livingroom.temperature ORDER BY timestamp DESC LIMIT ${numOfTempsReturned})
    AS lastRows
    ORDER BY timestamp ASC;
  `;

  pool.query(queryString)  // No need to connect
    .then(result => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      // res.setHeader('X-Content-Type-Options', 'nosniff');
      // res.setHeader('Content-Type', 'application/json');

      // Format timestamp
      result.rows.map((row) => {
        row.timestamp = moment(row.timestamp).format('MM-DD HH:mm:ss');
      });
      res.send({ temperatures: result.rows });
      // res.render('index', { recipes: result['rows'] });
    })
    .catch(err => console.error('Error executing query...', err.stack));
});

// -- Get env variables for rabbitmq service
// const vcapServices = JSON.parse(process.env.VCAP_SERVICES);
// const mqttUri = vcapServices['p-rabbitmq'][0].credentials.protocols.mqtt.uri

// -- Direct link
const connectOpts = {
  host: 'wise-msghub.eastasia.cloudapp.azure.com',
  port: 1883,
  username: 'eb869bc9-31f7-46dd-928b-4c6e08a65302:7a42b6be-d0a9-4227-b7c0-85e8636591be',
  password: 'WaWLv7UfNv3ngrNb2YZkmgccI'
};

var client = mqtt.connect(connectOpts);

// Subscribe
client.on('connect', (connack) => {
  client.subscribe('livingroom/temperature', (err, granted) => {
    if (err) console.log(err);

    console.log('@' + formatTime() + ' -- Subscribed to the topic: livingroom/temperature');
  });
});

// Receiving data
client.on('message', (topic, message, packet) => {
  let time = formatTime();
  console.log(`@${time} -- Got data from: ${topic}`);

  // mock temperature data
  const temp = message.toString();

  const queryString = 'INSERT INTO livingroom.temperature(temperature) VALUES($1) RETURNING *';
  const values = [temp];

  pool.query(queryString, values)
    .then(result => {
      console.log('Data added: ', result['rows'][0]);
    })
    .catch(err => console.error('Error adding data...', err.stack));
});

// Return current formatted time
function formatTime() {
  const currentDate = new Date();
  return currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
}
