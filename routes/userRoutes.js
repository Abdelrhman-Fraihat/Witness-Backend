import express from "express";
import multer from "multer";
import database from "../database.js";

const userRouter = express.Router();

const upload = multer({ dest: "uploadsImages" });

//http://localhost:3000/api/user/AddCrime

userRouter.post("/AddCrime", upload.array("images", 3), async (req, res) => {
  try {
    const {
      title,
      short_description,
      description,
      crime_type,
      country,
      city,
      incident_date,
      reporter_id,
    } = req.body;

    if (!title || !city || !incident_date || !reporter_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const crimeResult = await database.query(
      `INSERT INTO crimes
       (title, short_description, description, crime_type, country, city, incident_date, reporter_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        title,
        short_description,
        description,
        crime_type,
        country || "فلسطين",
        city,
        incident_date,
        reporter_id,
      ],
    );

    const crimeId = crimeResult.rows[0].id;

    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        await database.query(
          `INSERT INTO crime_media (crime_id, media_type, url, sort_order)
           VALUES ($1, 'image', $2, $3)`,
          [crimeId, `/uploadsImages/${file.filename}`, i + 1],
        );
      }
    }

    res.status(201).json({ message: "Crime created", crimeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//http://localhost:3000/api/user/crimes/id

userRouter.get("/crimes/:id", async (req, res) => {
  try {
    const crimeId = req.params.id;

    const crimeResult = await database.query(
      `
        SELECT
            c.id,
            c.title,
            c.description,
            c.crime_type,
            c.country,
            c.city,
            c.incident_date,
            c.status,
            u.first_name || ' ' || u.last_name AS reporter
        FROM crimes c
        JOIN users u ON c.reporter_id = u.id
        WHERE c.id = $1
     `,
      [crimeId],
    );

    if (crimeResult.rows.length === 0) {
      return res.status(404).json({ message: "Crime not found" });
    }

    const crime = crimeResult.rows[0];

    const mediaResult = await database.query(
      `
      SELECT url
      FROM crime_media
      WHERE crime_id = $1
      ORDER BY sort_order
      `,
      [crimeId],
    );

    crime.media = mediaResult.rows.map((m) => m.url);

    res.json(crime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//http://localhost:3000/api/user/Crimes
userRouter.get("/Crimes", async (req, res) => {
  const crimesResults = await database.query("Select * from crimes");
  if (crimesResults.rows.length === 0) {
    return res.status(404).json({ message: "Crimes not found" });
  }
  res.json(crimesResults.rows);
});
// http://localhost:3000/api/user/crimes/user/:userId

userRouter.get("/crimes/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const crimesResults = await database.query(
      `
      SELECT *
      FROM crimes
      WHERE reporter_id = $1
      `,
      [userId],
    );

    res.json(crimesResults.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//http://localhost:3000/api/user/deleteCrime

userRouter.delete("/deleteCrime/:id", async (req, res) => {
  const crimeId = req.params.id;
  const deleteResult = await database.query(
    "DELETE FROM crimes where id = $1 RETURNING *",
    [crimeId],
  );
  return res.sendStatus(200);
});

// UPDATE crime
// PUT http://localhost:3000/api/user/updateCrime/:id

userRouter.put("/updateCrime/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      short_description,
      description,
      crime_type,
      city,
      incident_date,
    } = req.body;

    const result = await database.query(
      `
      UPDATE crimes
      SET
        title = $1,
        short_description = $2,
        description = $3,
        crime_type = $4,
        city = $5,
        incident_date = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        title,
        short_description,
        description,
        crime_type,
        city,
        incident_date,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Crime not found" });
    }

    res.json({ message: "Crime updated", crime: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default userRouter;
