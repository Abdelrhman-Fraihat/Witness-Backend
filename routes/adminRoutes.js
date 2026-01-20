import express from "express";
import database from "../database.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

//http://localhost:3000/api/admin/crimes/id/status

adminRouter.put("/crimes/:id/status", adminAuth ,async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await database.query(
      `
      UPDATE crimes
      SET status = $1,
          reviewed_at = now()
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Crime not found" });
    }

    res.json({
      message: "Crime status updated",
      crime: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//http://localhost:3000/api/admin/users
adminRouter.get("/users", adminAuth, async (req, res) => {
  try {
    const result = await database.query(`
      SELECT id, first_name, last_name, email, state, role
      FROM users
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//http://localhost:3000/api/admin/users/:id/state
adminRouter.put("/users/:id/state", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    if (!["active", "disabled"].includes(state)) {
      return res.status(400).json({ message: "Invalid state" });
    }

    const result = await database.query(
      `
      UPDATE users
      SET state = $1
      WHERE id = $2
      RETURNING id, first_name, last_name, email, state
      `,
      [state, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User state updated",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



export default adminRouter