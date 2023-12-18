const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

const db = new sqlite3.Database("./db/main.db");

app.use(cors());
app.use(express.json({ type: ["application/json", "application/csp-report"] }));

const categoryMap = {
  powertrain: "Powertrain",
  "driving-system": "Driving_System",
  bodytype: "Bodytype",
  "interior-color": "Interior_Color",
  "exterior-color": "Exterior_Color",
  wheel: "Wheel",
  "additional-option": "Additional_Option",
};

const sendResponse = (res, data) => {
  res.json({
    data: data,
    message: "success",
  });
};

const sendError = (res, err) => {
  res.status(500).json({
    error: err.message, // 클라이언트에게 에러 응답 전송
  });
};

const handleResponse = (res, err, data) => {
  if (err) {
    sendError(res, err);
    return;
  }
  sendResponse(res, data);
};

const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => {
    return letter.toUpperCase();
  });
};

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
};

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

app.get("/api", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/api/info/:category", (req, res) => {
  const category = req.params.category;
  const queryParam = req.query.category;
  const query = `SELECT * FROM ${categoryMap[category]}${
    queryParam ? ` WHERE category = "${queryParam}"` : ""
  }`;

  db.all(query, [], (err, rows) => {
    handleResponse(res, err, formatData(rows));
  });
});

app.get("/api/info/:category/:id", (req, res) => {
  const category = req.params.category;
  const id = req.params.id;
  const query = `SELECT id, name, image_src as imageSrc, price FROM ${categoryMap[category]} WHERE id = ${id}`;

  db.get(query, (err, row) => {
    handleResponse(res, err, row);
  });
});

const sendAddtionalDetail = (id, resObject) => {
  const query = `
  SELECT title, description, image_src
  FROM Additional_Detail
  WHERE option_id = ${id}`;

  db.all(query, [], (err, rows) => {
    handleResponse(resObject, err, formatData(rows));
  });
};

const sendOptionDetail = (table, id, resObject) => {
  const query = `
  SELECT Detail.title, Detail.description, Detail.info
  FROM ${table} AS T
  INNER JOIN Detail ON T.detail_id = Detail.id
  WHERE T.id = ${id}`;

  db.get(query, (err, row) => {
    handleResponse(resObject, err, row);
  });
};

app.get("/api/detail/:category/:id", (req, res) => {
  const category = req.params.category;
  const id = req.params.id;
  const optionDataTable = categoryMap[category];
  if (optionDataTable) {
    optionDataTable === "Additional_Option"
      ? sendAddtionalDetail(id, res)
      : sendOptionDetail(optionDataTable, id, res);
  } else {
    sendError(res, err);
  }
});

app.get("/api/comment/:category/:id", (req, res) => {
  const category = req.params.category;
  const id = req.params.id;
  const optionDataTable = categoryMap[category];
  if (optionDataTable) {
    const query = `
    SELECT comment
    FROM ${optionDataTable} AS T
    WHERE T.id = ${id}`;

    db.get(query, (err, row) => {
      handleResponse(res, err, row);
    });
  } else {
    sendError(res, err);
  }
});

app.get("/api/sale/:category/select", (req, res) => {
  const category = req.params.category;
  const queryParam = req.query.category;

  import(`../data/select/select.json`, { assert: { type: "json" } }).then(
    (response) => {
      const data = queryParam
        ? response.default[category][queryParam]
        : response.default[category];

      sendResponse(res, data);
    }
  );
});

app.post("/api/sale/:category/tag", (req, res) => {
  const category = req.params.category;
  const queryParam = req.query.category;

  import(`../data/select/select.json`, { assert: { type: "json" } }).then(
    (response) => {
      const data = queryParam
        ? response.default[category][queryParam]
        : response.default[category];

      sendResponse(res, data);
    }
  );
});

app.get("/api/cardb", (req, res) => {
  const queryParam = req.query.keyword;

  if (queryParam) {
    const query = `
    SELECT keyword, description, image_src
    FROM Cardb AS T
    WHERE T.keyword = "${queryParam}"`;

    db.get(query, (err, row) => {
      const data = {
        keyword: row.keyword,
        description: row.description,
        imageSrc: row.image_src,
      };
      handleResponse(res, err, data);
    });
  } else {
    sendError(res, err);
  }
});

app.post("/api/guide", (req, res) => {
  let responseObject = {
    powertrainId: getRandom(0, 1),
    drivingSystemId: getRandom(0, 1),
    bodytypeId: getRandom(0, 1),
    exteriorColorId: getRandom(0, 6),
    interiorColorId: getRandom(0, 1),
    wheelId: getRandom(0, 3),
    additionalOptionId: [
      getRandom(0, 2),
      getRandom(3, 4),
      getRandom(5, 7),
      getRandom(8, 11),
    ],
  };

  handleResponse(res, false, responseObject);
});

app.get("/api/guide/tag", (req, res) => {
  const query = `SELECT * FROM Tag`;
  const categorys = [
    {
      title: "내 차는 이런 부분에서 강했으면 좋겠어요",
      keywordNum: 4,
    },
    {
      title: "나는 차를 탈 때 이런게 중요해요",
      keywordNum: 6,
    },
    {
      title: "나는 차를 이렇게 활용하고 싶어요",
      keywordNum: 2,
    },
  ];

  db.all(query, [], (err, rows) => {
    let temp = 0;
    const result = categorys.map((elem) => {
      const newObect = {
        category: elem.title,
        tags: rows.slice(temp, temp + elem.keywordNum),
      };
      temp += elem.keywordNum;

      return newObect;
    });
    handleResponse(res, err, result);
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
