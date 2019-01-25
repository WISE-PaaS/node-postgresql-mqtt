// --- Buffer manipulation --------------------------------
// const buf = Buffer.from('Hello World', 'ascii');
// console.log(buf.toString('hex'));

// --- Number to String -----------------------------------
// let num = 12;
// console.log(typeof (num));
// let s1 = num.toString()
// console.log(typeof (s1));

// --- Parse time ----------------------------------------
const moment = require('moment');
// "timestamp with time zone" in Postgresql records UTC time.
const timestamp = '2019-01-23T08:35:53.720Z';
console.log('timestamp\t\t\t\t\t', timestamp);

console.log();
// Returns LOCAL timestamp
console.log('moment(timestamp)\t\t\t\t', moment(timestamp));
console.log("moment(timestamp).format('MM-DD HH:mm:ss')\t", moment(timestamp).format('MM-DD HH:mm:ss'));

console.log();
// Returns UTC timestamp
console.log('moment.parseZone(timestamp)\t\t\t', moment.parseZone(timestamp));
console.log("moment.parseZone(timestamp).format('HH:mm:ss z')", moment.parseZone(timestamp).format('HH:mm:ss z'));

console.log();
// Convert to UTC time. You cannot see the difference because it's already UTC timestamp.
console.log('moment.utc(timestamp)\t\t\t\t', moment.utc(timestamp));
console.log("moment.utc().format('HH:mm:ss z')\t\t", moment.utc(timestamp).format('HH:mm:ss z'));