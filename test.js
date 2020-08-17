// request is a module that makes http calls easier
const request = require('request');

// connect to mongodb
const MongoClient = require('mongodb');

// connection string to the database
const dsn = 'mongodb://localhost:37017/maxcoin';

// Generic function that fetches the closing bitcoin dates of the last month from a public API
function fetchFromAPI(callback) {
  request.get('https://api.coindesk.com/v1/bpi/historical/close.json', (err, raw, body) =>
    callback(err, JSON.parse(body))
  );
}

// function insertMongodb
function insertMongodb(collection, data) {
  const promisedInserts = [];

  // to traverse the list, Objects.keys is used
  Object.keys(data).forEach((key) => {
    // push a promise into the promisedInserts array
    promisedInserts.push(
      collection.insertOne({
        // what is to be stored
        date: key,
        value: data[key],
      })
    );
  });
  // execute promises
  return Promise.all(promisedInserts);
}

MongoClient.connect(dsn, (err, db) => {
  if (err) throw err;
  // eslint-disable-next-line no-console
  console.log('connected to server');

  // eslint-disable-next-line no-shadow
  fetchFromAPI((err, data) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    // console.log(data);

    // define a collection to be written into
    // const collection = db.collection('value');
    const collection = db.db('maxcoin').collection('value');

    insertMongodb(collection, data.bpi)
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`successfuly inserted ${result.length} documents into mongodb`);
        // eslint-disable-next-line no-unused-expressions
        db.close;
      })
      // eslint-disable-next-line no-shadow
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        process.exit();
      });
  });
});
