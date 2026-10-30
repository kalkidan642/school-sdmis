
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to the school database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "school_sdmis",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test the backend
app.get("/", (req, res) => {
  res.send("School SDMIS backend is running!");
});

// Test the database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS databaseName");
    res.json({
      message: "Database connected successfully!",
      database: rows[0].databaseName,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({ error: "Could not connect to the database." });
  }
});

/* GET: Retrieve all students */
app.get("/api/students", async (req, res) => {
    try {
      const [students] = await db.query(
        "SELECT * FROM students ORDER BY id DESC"
      );
  
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error.message);
      res.status(500).json({ error: "Failed to fetch students." });
    }
  });
  
  /* POST: Add a new student */
  app.post("/api/students", async (req, res) => {
    try {
      const { name, grade, gender, phone } = req.body;
  
      if (!name?.trim() || !grade?.trim()) {
        return res.status(400).json({
          error: "Student name and grade are required."
        });
      }
  
      const [result] = await db.query(
        "INSERT INTO students (name, grade, gender, phone) VALUES (?, ?, ?, ?)",
        [
          name.trim(),
          grade.trim(),
          gender || null,
          phone?.trim() || null
        ]
      );
  
      res.status(201).json({
        message: "Student added successfully!",
        id: result.insertId,
        name: name.trim(),
        grade: grade.trim(),
        gender: gender || null,
        phone: phone?.trim() || null
      });
    } catch (error) {
      console.error("Error adding student:", error.message);
      res.status(500).json({ error: "Failed to add student." });
    }
  });
  
/* UPDATE: Edit an existing student */
app.put("/api/students/:id", async (req, res) => {
    try {
      const { name, grade, gender, phone } = req.body;
      const id = req.params.id;
  
      if (!name?.trim() || !grade?.trim()) {
        return res.status(400).json({
          error: "Student name and grade are required.",
        });
      }
  
      const [result] = await db.query(
        `UPDATE students
         SET name = ?, grade = ?, gender = ?, phone = ?
         WHERE id = ?`,
        [
          name.trim(),
          grade.trim(),
          gender || null,
          phone?.trim() || null,
          id,
        ]
      );
  
      if (result.affectedRows === 0) {
        const [rows] = await db.query(
          "SELECT id FROM students WHERE id = ?",
          [id]
        );
  
        if (rows.length === 0) {
          return res.status(404).json({ error: "Student not found." });
        }
      }
  
      res.json({ message: "Student updated successfully." });
    } catch (error) {
      console.error("Error updating student:", error.message);
      res.status(500).json({ error: "Failed to update student." });
    }
  });
  
  /* DELETE: Remove a student */
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const [result] = await db.query(
        "DELETE FROM students WHERE id = ?",
        [req.params.id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Student not found." });
      }
  
      res.json({ message: "Student deleted successfully." });
    } catch (error) {
      console.error("Error deleting student:", error.message);
      res.status(500).json({
        error: "Failed to delete student. Check whether attendance records depend on this student.",
      });
    }
  });
  
/* GET: Retrieve all teachers */
app.get("/api/teachers", async (req, res) => {
  try {
    const [teachers] = await db.query(
      "SELECT * FROM teachers ORDER BY id DESC"
    );
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error.message);
    res.status(500).json({ error: "Failed to fetch teachers." });
  }
});

/* POST: Add a teacher */
app.post("/api/teachers", async (req, res) => {
  try {
    const { name, subject, phone } = req.body;

    if (!name?.trim() || !subject?.trim()) {
      return res.status(400).json({
        error: "Teacher name and subject are required.",
      });
    }

    const [result] = await db.query(
      "INSERT INTO teachers (name, subject, phone) VALUES (?, ?, ?)",
      [name.trim(), subject.trim(), phone?.trim() || null]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      subject: subject.trim(),
      phone: phone?.trim() || null,
    });
  } catch (error) {
    console.error("Error adding teacher:", error.message);
    res.status(500).json({ error: "Failed to add teacher." });
  }
});

/* PUT: Update a teacher */
app.put("/api/teachers/:id", async (req, res) => {
  try {
    const { name, subject, phone } = req.body;

    if (!name?.trim() || !subject?.trim()) {
      return res.status(400).json({
        error: "Teacher name and subject are required.",
      });
    }

    const [result] = await db.query(
      "UPDATE teachers SET name = ?, subject = ?, phone = ? WHERE id = ?",
      [name.trim(), subject.trim(), phone?.trim() || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        "SELECT id FROM teachers WHERE id = ?",
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Teacher not found." });
      }
    }

    res.json({ message: "Teacher updated successfully." });
  } catch (error) {
    console.error("Error updating teacher:", error.message);
    res.status(500).json({ error: "Failed to update teacher." });
  }
});

/* DELETE: Remove a teacher */
app.delete("/api/teachers/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM teachers WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    res.json({ message: "Teacher deleted successfully." });
  } catch (error) {
    console.error("Error deleting teacher:", error.message);
    res.status(500).json({ error: "Failed to delete teacher." });
  }
});
/* GET: Load attendance records */
console.log("Attendance GET route registered!");
app.get("/api/attendance", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        attendance.id,
        attendance.student_id,
        students.name AS student_name,
        students.grade,
        attendance.attendance_date,
        attendance.status
      FROM attendance
      JOIN students ON attendance.student_id = students.id
      ORDER BY attendance.attendance_date DESC, students.name ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error loading attendance:", error.message);
    res.status(500).json({ error: "Failed to load attendance." });
  }
});

/* POST: Save attendance */
app.post("/api/attendance", async (req, res) => {
  try {
    const { student_id, attendance_date, status } = req.body;

    if (
      !Number.isInteger(Number(student_id)) ||
      !attendance_date ||
      !["Present", "Absent", "Late"].includes(status)
    ) {
      return res.status(400).json({
        error: "Valid student, date, and attendance status are required.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO attendance (student_id, attendance_date, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [Number(student_id), attendance_date, status]
    );

    res.json({
      message: "Attendance saved successfully!",
      id: result.insertId,
      student_id: Number(student_id),
      attendance_date,
      status,
    });
  } catch (error) {
    console.error("Error saving attendance:", error.message);
    res.status(500).json({
      error: "Failed to save attendance. Check that the student exists and the date is valid.",
    });
  }
});

/* PUT: Update an attendance record */
app.put("/api/attendance/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Present", "Absent", "Late"].includes(status)) {
      return res.status(400).json({
        error: "Status must be Present, Absent, or Late.",
      });
    }

    const [result] = await db.query(
      "UPDATE attendance SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        "SELECT id FROM attendance WHERE id = ?",
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: "Attendance record not found.",
        });
      }
    }

    res.json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error updating attendance:", error.message);
    res.status(500).json({ error: "Failed to update attendance." });
  }
});

app.get("/api/development", async (req, res) => {
  try {
    const [projects] = await db.query(
      "SELECT * FROM development_projects ORDER BY id DESC"
    );

    res.json(projects);
  } catch (error) {
    console.error("Error fetching development projects:", error);
    res.status(500).json({
      message: "Failed to fetch development projects"
    });
  }
});

app.post("/api/development", async (req, res) => {
  try {
    const { name, budget, progress, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const [result] = await db.query(
      `INSERT INTO development_projects
       (name, budget, progress, status)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        Number(budget) || 0,
        Number(progress) || 0,
        status || "In Progress"
      ]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      budget: Number(budget) || 0,
      progress: Number(progress) || 0,
      status: status || "In Progress"
    });
  } catch (error) {
    console.error("Error adding development project:", error);
    res.status(500).json({
      message: "Failed to add development project"
    });
  }
});

app.put("/api/development/:id", async (req, res) => {
  try {
    const { progress } = req.body;
    const projectId = Number(req.params.id);
    const projectProgress = Number(progress);

    if (
      !Number.isInteger(projectId) ||
      projectId < 1 ||
      !Number.isInteger(projectProgress) ||
      projectProgress < 0 ||
      projectProgress > 100
    ) {
      return res.status(400).json({
        message: "Invalid project ID or progress"
      });
    }

    const status =
      projectProgress === 100 ? "Completed" : "In Progress";

    const [result] = await db.query(
      "UPDATE development_projects SET progress = ?, status = ? WHERE id = ?",
      [projectProgress, status, projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      id: projectId,
      progress: projectProgress,
      status
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      message: "Failed to update project"
    });
  }
});

app.delete("/api/development/:id", async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId < 1) {
      return res.status(400).json({
        message: "Invalid project ID"
      });
    }

    const [result] = await db.query(
      "DELETE FROM development_projects WHERE id = ?",
      [projectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      message: "Failed to delete project"
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`SDMIS backend running at http://localhost:${PORT}`);
});
