const express = require("express");
const app = express();

const path = require("path");
const dbPath = path.join(__dirname, "./todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

let db = null;

const connectDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running....");
    });
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
};
connectDbAndServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//API1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});
//API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const dbQuery = `
    SELECT *  FROM todo WHERE 
    id=${todoId}
    ;`;
  const response = await db.get(dbQuery);
  res.send(response);
});

//API 3
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const dbQuery = `
    INSERT INTO todo (id,todo,priority,status)
    VALUES(
        ${id},'${todo}','${priority}','${status}'
    )
   ; `;
  await db.run(dbQuery);
  res.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { status, priority, todo } = req.body;
  let dbQuery = "";

  if (status !== undefined) {
    dbQuery = `UPDATE todo SET status='${status}' where id=${todoId}`;
    await db.run(dbQuery);
    res.send("Status Updated");
  } else if (priority !== undefined) {
    dbQuery = `UPDATE todo SET priority='${priority}' where id=${todoId}`;
    await db.run(dbQuery);
    res.send("Priority Updated");
  } else if (todo !== undefined) {
    dbQuery = `UPDATE todo SET todo='${todo}' where id=${todoId}`;
    await db.run(dbQuery);
    res.send("Todo Updated");
  }
});
//API 5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const dbQuery = `
    DELETE FROM todo WHERE id=${todoId}
    ;`;
  await db.run(dbQuery);
  res.send("Todo Deleted");
});

module.exports = app;
