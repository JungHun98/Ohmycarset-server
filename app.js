const sqlite3 = require('sqlite3').verbose();
const schema = require('./table-query.js');

let db = new sqlite3.Database('./db/main.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
    
    db.exec(schema, function (err) {
      if (err) {
        console.error('Error applying schema:', err.message);
      } else {
        console.log('Schema applied successfully.');
      }
    });
})

// close the database connection
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Close the database connection.');
});