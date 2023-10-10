const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

const db = new sqlite3.Database('./db/main.db');

app.use(cors());

const categoryMap = {
  "powertrain": "Powertrain",
  "driving-system": "Driving_System",
  "bodytype": "Bodytype",
  "interior-color": "Interior_Color",
  "exterior-color": "Exterior_Color",
  "wheel": "Wheel",
  "additional-option": "Additional_Option"
}

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

app.get('/info/:category', (req, res) => {
  const category = req.params.category;
  const queryParam = req.query.category;
  const query = `SELECT * FROM ${categoryMap[category]}${queryParam ? ` WHERE category = "${queryParam}"` : ''}`;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({
        error: err.message, // 클라이언트에게 에러 응답 전송
      });
      return;
    }
    res.json({
      data: formatData(rows),
      message: "success"
    })    
  });
});

const sendAddtionalDetail = (id, resObject) => {
  const query = `
  SELECT title, description, image_src
  FROM Additional_Detail
  WHERE option_id = ${id}`;

  db.all(query, [], (err, rows) => {
    if (err) {
      resObject.status(500).json({
        error: err.message, // 클라이언트에게 에러 응답 전송
      });
    }
    resObject.json({
      data: formatData(rows),
      message: "success"
    });
  });
}

const sendOptionDetail = (table, id, resObject) => {
  const query = `
  SELECT Detail.title, Detail.description, Detail.info
  FROM ${table} AS T
  INNER JOIN Detail ON T.detail_id = Detail.id
  WHERE T.id = ${id}`;

  db.get(query, (err, row) => {
    if (err) {
      resObject.status(500).json({
        error: err.message, // 클라이언트에게 에러 응답 전송
      });
    }
    resObject.json({
      data: row,
      message: "success"
    });
  });
}

app.get('/detail/:category/:id', (req, res) => {
  const category = req.params.category;
  const id = req.params.id;
  const optionDataTable = categoryMap[category];
  if(optionDataTable){
    optionDataTable === "Additional_Option" ? sendAddtionalDetail(id, res) : sendOptionDetail(optionDataTable, id, res);
  }
  else{
    res.status(500);
  }
});

app.get('/comment/:category/:id', (req, res) => {
  const category = req.params.category;
  const id = req.params.id;
  const optionDataTable = categoryMap[category];
  if(optionDataTable){
    const query = `
    SELECT comment
    FROM ${optionDataTable} AS T
    WHERE T.id = ${id}`

    db.get(query, (err, row) => {
      if (err) {
        res.status(500).json({
          error: err.message, // 클라이언트에게 에러 응답 전송
        });
      }
      res.json({
        data: row,
        message: "success"
      });
    });
  }
  else{
    res.status(500);
  }
});

app.get('/sale/:category/select', (req, res) => {
  const category = req.params.category;
  const queryParam = req.query.category;

  import(`./data/select/select.json`, { assert: { type: "json" }}).then((response) => {
    const data = queryParam ? response.default[category][queryParam] : response.default[category];
    
    res.json({
      data: data,
      message: "success"
    });
  })
});

app.get('/cardb', (req, res) => {
  const queryParam = req.query.keyword;

  if(queryParam){
    const query = `
    SELECT keyword, description, image_src
    FROM Cardb AS T
    WHERE T.keyword = "${queryParam}"`

    db.get(query, (err, row) => {
      if (err) {
        res.status(500).json({
          error: err.message, // 클라이언트에게 에러 응답 전송
        });
      }
      res.json({
        data: {
          "keyword" : row.keyword,
          "description" : row.description,
          "imageSrc" : row.image_src
        },
        message: "success"
      });
    });
  }
  else{
    res.status(500).json({
      error: "카워드 다시 보내줘요."
    });
  }
});

app.get('/guide/tag', (req, res) => {
  const query = `SELECT * FROM Tag`;
  const categorys = [
    {
      title: "내 차는 이런 부분에서 강했으면 좋겠어요",
      keywordNum : 4
    },
    {
      title: "나는 차를 탈 때 이런게 중요해요",
      keywordNum : 6
    },
    {
      title: "나는 차를 이렇게 활용하고 싶어요",
      keywordNum : 2
    }
  ];
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({
        error: err.message, // 클라이언트에게 에러 응답 전송
      });
    }
    let temp = 0;
    const result = categorys.map((elem) => {
      const newObect = {
        category: elem.title,
        tags: rows.slice(temp, temp + elem.keywordNum)
      }
      temp += elem.keywordNum;

      return newObect;
    });

    res.json({
      data: result,
      message: "success"
    });
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});