const mqtt = require('mqtt')

// Direct link
// const mqttUri = 'mqtt://eb869bc9-31f7-46dd-928b-4c6e08a65302%3Ae19bd03d-b603-4c24-8a87-8bf58e25a2fa:1pJ8AKYJiNkWtvJUtEoTOmapu@wise-msghub.eastasia.cloudapp.azure.com:1883';
const mqttUri = 'mqtt://eb869bc9-31f7-46dd-928b-4c6e08a65302%3A34341485-7f96-4eca-a93b-397a6ec23fbe:AxFiXoqYCZwJqRooDYFUWrK2D@wise-msghub.eastasia.cloudapp.azure.com:1883';
// const connectOpts = {
//   host: 'wise-msghub.eastasia.cloudapp.azure.com',
//   port: 1883,
//   username: 'eb869bc9-31f7-46dd-928b-4c6e08a65302:7a42b6be-d0a9-4227-b7c0-85e8636591be',
//   password: 'WaWLv7UfNv3ngrNb2YZkmgccI'
// };

// Use mqttUri or connectOpts
const client = mqtt.connect(mqttUri);

client.on('connect', (connack) => {
  setInterval(() => {
    publishMockTemp();
  }, 3000);
});

// Publish mock random temperature periodically
function publishMockTemp() {
  const temp = Math.floor((Math.random() * 7) + 22);

  client.publish('livingroom/temperature', temp.toString(), { qos: 2 }, (err, packet) => {
    if (!err) console.log('Data sent to livingroom/temperature -- ' + temp);
  });
}

// client.on('message', (topic, message, packet) => {
//   let msg = message.toString();
//   console.log('From topic:', topic);
//   console.log('Message:', msg);
//   // client.end();
// });
