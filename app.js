const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

const db = new sqlite3.Database('./db/main.db');

app.use(cors());

const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => {
    return letter.toUpperCase();
  });
}

const formatData = (obj) => {
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

const searchDB = (resolve, reject, query, dbParams) => {
  db.all(query, dbParams, (err, rows) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(rows);
  });
};

const getSearchDBPromise = (category, queryParam) => {
  const categoryMap = {
    "powertrain": "Powertrain",
    "driving-system": "Driving_System",
    "bodytype": "Bodytype",
    "interior-color": "Interior_Color",
    "exterior-color": "Exterior_Color",
    "wheel": "Wheel",
    "additional-option": "Additional_Option"
  }

  const query = `SELECT * FROM ${categoryMap[category]}${queryParam ? ' WHERE category = ?' : ''}`;
  console.log(query);
  const dbParams = queryParam ? [queryParam] : [];

  return new Promise((resolve, reject) => {
      searchDB(resolve, reject, query, dbParams);
  });
}

app.get('/info/:category', (req, res) => {
  const category = req.params.category;
  const queryParam = req.query.category;

  const promise = getSearchDBPromise(category, queryParam);
  promise.then((result) => {
    res.json({
      data: formatData(result),
      message: "success"
    });
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});