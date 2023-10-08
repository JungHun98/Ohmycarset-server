const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

let db = new sqlite3.Database('./db/main.db');

app.use(cors());

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

function formatData(obj){
  const formatbject = obj.map((row) => {
    const cardData = {};
    for (const key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const camelKey = snakeToCamel(key);
        cardData[camelKey] = row[key];
      }
    }
    return cardData;
  });

  return formatbject;
}


app.get('/info/:category', (req, res) => {
  const categoryMap = {
    "powertrain" : "Powertrain",
    "driving-system" : "Driving_System",
    "bodytype" : "Bodytype",
    "interior-color" : "Interior_Color",
    "exterior-color" : "Exterior_Color",
    "wheel" : "Wheel"
  }
  const category = req.params.category;
  const query = `SELECT * FROM ${categoryMap[category]}`;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const data = formatData(rows);

    res.json({
      data: data,
      message: 'success',
    });
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});