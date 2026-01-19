import express from "express";
import database from "../database.js";

const authRoutes = express.Router();

authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await database.query(
    "SELECT * from USERS where email = $1 And password = $2",
    [email, password],
  );
  if (result.rows.length === 0)
    return res.status(401).json({ message: "Invalid credntials" });
  res.json({ user: result.rows[0] });
});
authRoutes.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const result = await database.query(
    "Insert into users (first_name, last_name, email, password, role) values ($1, $2, $3, $4, 'user') RETURNING id, first_name, last_name, email, role",
    [firstName, lastName, email, password],
  );
  if (result.rows.length === 0)
    return res.status(401).json({ message: "Invalid credntials" });
  res.json({ user: result.rows[0] });
});

export default authRoutes;
