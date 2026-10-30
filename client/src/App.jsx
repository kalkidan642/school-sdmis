
import { useState, useEffect } from "react";
import "./App.css";

const initialStudents = [
  { id: 1, name: "Abebe Bekele", grade: "Grade 9", gender: "Male", phone: "0911000001" },
  { id: 2, name: "Hana Tesfaye", grade: "Grade 10", gender: "Female", phone: "0911000002" },
  { id: 3, name: "Dawit Alemu", grade: "Grade 11", gender: "Male", phone: "0911000003" },
  { id: 4, name: "Meron Kebede", grade: "Grade 12", gender: "Female", phone: "0911000004" },
];

const initialTeachers = [
  { id: 1, name: "Samuel Tadesse", subject: "Mathematics", phone: "0912000001" },
  { id: 2, name: "Almaz Girma", subject: "Biology", phone: "0912000002" },
];

const initialProjects = [
  { id: 1, name: "Library Improvement", budget: 50000, progress: 65, status: "In Progress" },
  { id: 2, name: "Science Laboratory", budget: 100000, progress: 30, status: "In Progress" },
  { id: 3, name: "School Cleanliness", budget: 15000, progress: 100, status: "Completed" },
];

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Students", icon: "♙" },
  { name: "Teachers", icon: "♧" },
  { name: "Attendance", icon: "▦" },
  { name: "Development", icon: "⚒" },
  { name: "Reports", icon: "▤" },
];

function App() {
  const [page, setPage] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  
useEffect(() => {
  async function loadStudents() {
    try {
      const response = await fetch("http://localhost:5000/api/students");

      if (!response.ok) {
        throw new Error("Failed to load students");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  }

  loadStudents();
}, []);

  const [teachers, setTeachers] = useState([]);
  const [projects, setProjects] = useState(initialProjects);
  const [attendance, setAttendance] = useState({});
  
useEffect(() => {
  async function loadAttendance() {
    try {
      const response = await fetch("http://localhost:5000/api/attendance");

      if (!response.ok) {
        throw new Error("Failed to load attendance");
      }

      const records = await response.json();

      const attendanceMap = {};

      records.forEach((record) => {
        const date = new Date(record.attendance_date)
        .toLocaleDateString("en-CA", {
          timeZone: "Africa/Addis_Ababa",
        });
        attendanceMap[`${date}-${record.student_id}`] = record.status;
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  }

  loadAttendance();
}, []);

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentForm, setStudentForm] = useState({
    name: "", grade: "Grade 9", gender: "Male", phone: "",
  });
  const [teacherForm, setTeacherForm] = useState({
    name: "", subject: "", phone: "",
  });
  const [projectForm, setProjectForm] = useState({
    name: "", budget: "", progress: 0,
  });

  const today = new Date().toISOString().slice(0, 10);
  const presentCount = students.filter(
    (student) => (attendance[`${today}-${student.id}`] || "Present") === "Present"
  ).length;
  const absentCount = students.filter(
    (student) => attendance[`${today}-${student.id}`] === "Absent"
  ).length;
  const lateCount = students.filter(
    (student) => attendance[`${today}-${student.id}`] === "Late"
  ).length;

 
async function addStudent(event) {
  event.preventDefault();

  if (!studentForm.name.trim()) return;

  try {
    const response = await fetch("http://localhost:5000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentForm),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to add student.");
      return;
    }

    setStudents((currentStudents) => [data, ...currentStudents]);

    setStudentForm({
      name: "",
      grade: "Grade 9",
      gender: "Male",
      phone: "",
    });

    alert("Student saved successfully!");
  } catch (error) {
    console.error("Error adding student:", error);
    alert("Could not connect to the server. Check that the backend is running.");
  }
}


  
async function editStudent(student) {
  const name = prompt("Student name:", student.name);
  if (name === null || !name.trim()) return;

  const grade = prompt("Student grade:", student.grade);
  if (grade === null || !grade.trim()) return;

  const updatedStudent = {
    name: name.trim(),
    grade: grade.trim(),
    gender: student.gender || "",
    phone: student.phone || "",
  };

  try {
    const response = await fetch(
      `http://localhost:5000/api/students/${student.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to update student.");
      return;
    }

    setStudents((currentStudents) =>
      currentStudents.map((item) =>
        item.id === student.id
          ? { ...item, ...updatedStudent }
          : item
      )
    );

    alert("Student updated successfully!");
  } catch (error) {
    console.error("Error updating student:", error);
    alert("Could not connect to the server. Check that the backend is running.");
  }
}


 
async function deleteProject(id) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/development/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete project");
    }

    setProjects((previousProjects) =>
      previousProjects.filter((project) => project.id !== id)
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    alert("Could not delete the project.");
  }
}

useEffect(() => {
  fetch("http://localhost:5000/api/teachers")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load teachers");
      }
      return response.json();
    })
    .then((data) => setTeachers(data))
    .catch((error) => {
      console.error("Error loading teachers:", error);
    });
}, []);
useEffect(() => {
  fetch("http://localhost:5000/api/development")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load development projects");
      }
      return response.json();
    })
    .then((data) => setProjects(data))
    .catch((error) => {
      console.error("Error loading development projects:", error);
    });
}, []);

async function addTeacher(event) {
  event.preventDefault();

  if (!teacherForm.name.trim() || !teacherForm.subject.trim()) {
    alert("Please enter the teacher's name and subject.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teacherForm),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add teacher.");
    }

    setTeachers((previous) => [data, ...previous]);
    setTeacherForm({ name: "", subject: "", phone: "" });
    alert("Teacher added successfully!");
  } catch (error) {
    alert(error.message);
  }
}

async function editTeacher(teacher) {
  const name = prompt("Teacher name:", teacher.name);
  if (name === null || !name.trim()) return;

  const subject = prompt("Teaching subject:", teacher.subject);
  if (subject === null || !subject.trim()) return;

  const phone = prompt("Phone number:", teacher.phone || "");
  if (phone === null) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/teachers/${teacher.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          phone: phone.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update teacher.");
    }

    setTeachers((previous) =>
      previous.map((item) =>
        item.id === teacher.id
          ? {
              ...item,
              name: name.trim(),
              subject: subject.trim(),
              phone: phone.trim() || null,
            }
          : item
      )
    );

    alert("Teacher updated successfully!");
  } catch (error) {
    alert(error.message);
  }
}

async function deleteTeacher(id) {
  if (!confirm("Are you sure you want to delete this teacher?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/teachers/${id}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete teacher.");
    }

    setTeachers((previous) =>
      previous.filter((teacher) => teacher.id !== id)
    );

    alert("Teacher deleted successfully!");
  } catch (error) {
    alert(error.message);
  }
}


 
async function addProject(event) {
  event.preventDefault();

  if (!projectForm.name.trim()) return;

  const progress = Math.min(
    100,
    Math.max(0, Number(projectForm.progress) || 0)
  );

  const newProject = {
    name: projectForm.name.trim(),
    budget: Number(projectForm.budget) || 0,
    progress,
    status: progress === 100 ? "Completed" : "In Progress",
  };

  try {
    const response = await fetch("http://localhost:5000/api/development", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
    });

    if (!response.ok) {
      throw new Error("Failed to save project");
    }

    const savedProject = await response.json();

    setProjects((previousProjects) => [
      ...previousProjects,
      savedProject,
    ]);

    setProjectForm({ name: "", budget: "", progress: 0 });
    alert("Development project saved successfully!");
  } catch (error) {
    console.error("Error saving project:", error);
    alert("Could not save the project. Check that your backend is running.");
  }
}



 
async function updateProgress(project, value) {
  const progress = Number(value);
  const status = progress === 100 ? "Completed" : "In Progress";

  try {
    const response = await fetch(
      `http://localhost:5000/api/development/${project.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress, status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update project progress");
    }

    setProjects((previousProjects) =>
      previousProjects.map((item) =>
        item.id === project.id
          ? { ...item, progress, status }
          : item
      )
    );
  } catch (error) {
    console.error("Error updating progress:", error);
    alert("Could not save progress. Please try again.");
  }
}


async function deleteProject(id) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/development/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete project");
    }

    setProjects((previousProjects) =>
      previousProjects.filter((project) => project.id !== id)
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    alert("Could not delete the project. Please try again.");
  }
}

  
async function markAttendance(studentId, status) {
  try {
    const response = await fetch("http://localhost:5000/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: Number(studentId),
        attendance_date: today,
        status: status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save attendance");
    }

    setAttendance((previous) => ({
      ...previous,
      [`${today}-${studentId}`]: status,
    }));
  } catch (error) {
    console.error("Error saving attendance:", error);
    alert(error.message || "Could not save attendance. Please try again.");
  }
}


  function PageTitle({ title, subtitle }) {
    return (
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <span className="date-chip">{new Date().toLocaleDateString()}</span>
      </div>
    );
  }

  function Dashboard() {
    return (
      <>
        <PageTitle title="Dashboard" subtitle="Welcome to your school management overview." />
        <section className="welcome-banner">
          <div>
            <span className="eyebrow">SCHOOL MANAGEMENT SYSTEM</span>
            <h2>Building a better school, together.</h2>
            <p>Monitor students, staff, attendance, and school development in one place.</p>
            <button className="light-button" onClick={() => setPage("Reports")}>
              View Reports →
            </button>
          </div>
          <div className="welcome-symbol">⌂</div>
        </section>

        <section className="stats-grid">
          <StatCard icon="♙" label="Total Students" value={students.length} color="blue" />
          <StatCard icon="♧" label="Total Teachers" value={teachers.length} color="purple" />
          <StatCard icon="✓" label="Present Today" value={presentCount} color="green" />
          <StatCard icon="⚒" label="School Projects" value={projects.length} color="orange" />
        </section>

        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-heading">
              <div><h3>School Overview</h3><p>Current school records</p></div>
            </div>
            <div className="overview-row">
              <span>Students</span><strong>{students.length}</strong>
            </div>
            <div className="overview-row">
              <span>Teachers</span><strong>{teachers.length}</strong>
            </div>
            <div className="overview-row">
              <span>Present today</span><strong>{presentCount}</strong>
            </div>
            <div className="overview-row">
              <span>Absent today</span><strong>{absentCount}</strong>
            </div>
            <div className="overview-row">
              <span>Late today</span><strong>{lateCount}</strong>
            </div>
            <button className="secondary-button full-button" onClick={() => setPage("Attendance")}>
              Manage Attendance
            </button>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div><h3>Development Projects</h3><p>School improvement progress</p></div>
              <button className="text-button" onClick={() => setPage("Development")}>View all →</button>
            </div>
            {projects.slice(0, 4).map((project) => (
              <div className="project-summary" key={project.id}>
                <div className="project-summary-top">
                  <strong>{project.name}</strong><span>{project.progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                </div>
                <small>{project.status}</small>
              </div>
            ))}
          </section>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div><h3>Recent Students</h3><p>Latest student records</p></div>
            <button className="text-button" onClick={() => setPage("Students")}>Manage students →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Grade</th><th>Gender</th><th>Phone</th></tr></thead>
              <tbody>
                {students.slice(-5).reverse().map((student) => (
                  <tr key={student.id}>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.grade}</td><td>{student.gender}</td><td>{student.phone || "—"}</td>
                  </tr>
                ))}
                {students.length === 0 && <EmptyRow columns={4} />}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function StudentsPage() {
    const filtered = students.filter((student) =>
      `${student.name} ${student.grade} ${student.phone}`
        .toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
      <>
        <PageTitle title="Students" subtitle="Register and manage student information." />
        <section className="panel">
          <div className="panel-heading">
            <div><h3>Add a Student</h3><p>Enter the student's information below.</p></div>
          </div>
          <form className="form-grid" onSubmit={addStudent}>
            <label>Full name<input required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Enter full name" /></label>
            <label>Grade<select value={studentForm.grade} onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}>{["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
            <label>Gender<select value={studentForm.gender} onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}><option>Male</option><option>Female</option></select></label>
            <label>Phone number<input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} placeholder="Optional" /></label>
            <button className="primary-button form-action" type="submit">+ Add Student</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><h3>Student Records</h3><p>{students.length} students registered</p></div>
            <input className="search-input" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search students..." />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Grade</th><th>Gender</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id}>
                    <td><strong>{student.name}</strong></td><td>{student.grade}</td><td>{student.gender}</td><td>{student.phone || "—"}</td>
                    <td><div className="actions"><button className="small-button" onClick={() => editStudent(student)}>Edit</button><button className="small-button danger" onClick={() => deleteStudent(student.id)}>Delete</button></div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <EmptyRow columns={5} />}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function TeachersPage() {
    const filtered = teachers.filter((teacher) =>
      `${teacher.name} ${teacher.subject} ${teacher.phone}`
        .toLowerCase().includes(teacherSearch.toLowerCase())
    );

    return (
      <>
        <PageTitle title="Teachers" subtitle="Manage school staff and teaching assignments." />
        <section className="panel">
          <div className="panel-heading"><div><h3>Add a Teacher</h3><p>Register a teacher's information.</p></div></div>
          <form className="form-grid" onSubmit={addTeacher}>
            <label>Full name<input required value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} placeholder="Enter teacher name" /></label>
            <label>Subject<input required value={teacherForm.subject} onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })} placeholder="e.g. Biology" /></label>
            <label>Phone number<input value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} placeholder="Optional" /></label>
            <button className="primary-button form-action" type="submit">+ Add Teacher</button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div><h3>Teacher Records</h3><p>{teachers.length} teachers registered</p></div>
            <input className="search-input" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder="Search teachers..." />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Teacher</th><th>Subject</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((teacher) => (
                  <tr key={teacher.id}>
                    <td><strong>{teacher.name}</strong></td><td>{teacher.subject}</td><td>{teacher.phone || "—"}</td>
                    <td><div className="actions"><button className="small-button" onClick={() => editTeacher(teacher)}>Edit</button><button className="small-button danger" onClick={() => deleteTeacher(teacher.id)}>Delete</button></div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <EmptyRow columns={4} />}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function AttendancePage() {
    return (
      <>
        <PageTitle title="Attendance" subtitle={`Record daily attendance for ${today}.`} />
        <section className="stats-grid attendance-stats">
          <StatCard icon="✓" label="Present" value={presentCount} color="green" />
          <StatCard icon="×" label="Absent" value={absentCount} color="orange" />
          <StatCard icon="◷" label="Late" value={lateCount} color="purple" />
          <StatCard icon="♙" label="Total Students" value={students.length} color="blue" />
        </section>
        <section className="panel">
          <div className="panel-heading"><div><h3>Daily Attendance Register</h3><p>Select a status for each student. Changes apply to today's date.</p></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Grade</th><th>Attendance status</th></tr></thead>
              <tbody>
                {students.map((student) => {
                  const status = attendance[`${today}-${student.id}`] || "Present";
                  return (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong></td><td>{student.grade}</td>
                      <td><select className={`status-select status-${status.toLowerCase()}`} value={status} onChange={(e) => markAttendance(student.id, e.target.value)}><option>Present</option><option>Absent</option><option>Late</option></select></td>
                    </tr>
                  );
                })}
                {students.length === 0 && <EmptyRow columns={3} />}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function DevelopmentPage() {
    return (
      <>
        <PageTitle title="School Development" subtitle="Plan, monitor, and manage school improvement projects." />
        <section className="panel">
          <div className="panel-heading"><div><h3>Add Development Project</h3><p>Record a school improvement activity.</p></div></div>
          <form className="form-grid" onSubmit={addProject}>
            <label>Project name<input required value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. Build new classrooms" /></label>
            <label>Budget (ETB)<input type="number" min="0" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} placeholder="Estimated budget" /></label>
            <label>Initial progress (%)<input type="number" min="0" max="100" value={projectForm.progress} onChange={(e) => setProjectForm({ ...projectForm, progress: e.target.value })} /></label>
            <button className="primary-button form-action" type="submit">+ Add Project</button>
          </form>
        </section>
        <section className="project-grid">
          {projects.map((project) => (
            <article className="panel project-card" key={project.id}>
              <div className="project-card-top"><span className="project-icon">⚒</span><span className={`status-badge ${project.status === "Completed" ? "completed" : ""}`}>{project.status}</span></div>
              <h3>{project.name}</h3>
              <p className="muted">Budget: ETB {Number(project.budget).toLocaleString()}</p>
              <div className="progress-label"><span>Project progress</span><strong>{project.progress}%</strong></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${project.progress}%` }} /></div>
              <label className="progress-control">Update progress
                <input type="range" min="0" max="100" value={project.progress} onChange={(e) => updateProgress(project, e.target.value)} />
              </label>
              
<button
  className="small-button danger"
  onClick={() => {
    if (confirm("Delete this project?")) {
      deleteProject(project.id);
    }
  }}
>
  Delete Project
</button>

            </article>
          ))}
        </section>
        {projects.length === 0 && <section className="panel empty-message">No projects yet. Add a project using the form above.</section>}
      </>
    );
  }

  function ReportsPage() {
    const completedProjects = projects.filter((project) => project.status === "Completed").length;
    const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget || 0), 0);
    const attendanceRate = students.length ? Math.round((presentCount / students.length) * 100) : 0;

    return (
      <>
        <PageTitle title="Reports" subtitle="A summary of your school's current records." />
        <div className="report-heading">
          <div><h2>School Summary Report</h2><p>Report date: {new Date().toLocaleDateString()}</p></div>
          <button className="primary-button no-print" onClick={() => window.print()}>⎙ Print Report</button>
        </div>
        <section className="stats-grid">
          <StatCard icon="♙" label="Total Students" value={students.length} color="blue" />
          <StatCard icon="♧" label="Total Teachers" value={teachers.length} color="purple" />
          <StatCard icon="✓" label="Present Today" value={presentCount} color="green" />
          <StatCard icon="⚒" label="Active Projects" value={projects.filter((project) => project.status !== "Completed").length} color="orange" />
        </section>
        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-heading"><div><h3>Attendance Summary</h3><p>Today's student attendance</p></div></div>
            <div className="overview-row"><span>Present</span><strong>{presentCount}</strong></div>
            <div className="overview-row"><span>Absent</span><strong>{absentCount}</strong></div>
            <div className="overview-row"><span>Late</span><strong>{lateCount}</strong></div>
            <div className="overview-row"><span>Attendance rate</span><strong>{attendanceRate}%</strong></div>
          </section>
          <section className="panel">
            <div className="panel-heading"><div><h3>Development Summary</h3><p>School improvement projects</p></div></div>
            <div className="overview-row"><span>Total projects</span><strong>{projects.length}</strong></div>
            <div className="overview-row"><span>Completed projects</span><strong>{completedProjects}</strong></div>
            <div className="overview-row"><span>In progress</span><strong>{projects.length - completedProjects}</strong></div>
            <div className="overview-row"><span>Total planned budget</span><strong>ETB {totalBudget.toLocaleString()}</strong></div>
          </section>
        </div>
        <section className="panel">
          <div className="panel-heading"><div><h3>Students by Grade</h3><p>Number of registered students in each grade</p></div></div>
          {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => {
            const count = students.filter((student) => student.grade === grade).length;
            const percentage = students.length ? (count / students.length) * 100 : 0;
            return <div className="grade-report" key={grade}><div className="progress-label"><span>{grade}</span><strong>{count} students</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${percentage}%` }} /></div></div>;
          })}
        </section>
        <p className="muted report-note">These reports use the records currently entered in this application. Review the data before printing or submitting.</p>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div><strong>School<span>MS</span></strong><small>Management System</small></div>
        </div>
        <div className="nav-label">MAIN MENU</div>
        <nav className="navigation">
          {navigation.map((item) => (
            <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => setPage(item.name)}>
              <span className="nav-icon">{item.icon}</span><span>{item.name}</span>{page === item.name && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><div className="school-avatar">SD</div><div><strong>School Admin</strong><small>Administrator</small></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">School Management <span>/</span> <strong>{page}</strong></div><div className="admin-chip"><span className="online-dot" /> Admin Panel</div></header>
        <div className="page-content">
          {page === "Dashboard" && <Dashboard />}
          {page === "Students" && StudentsPage()}  
          {page === "Teachers" && TeachersPage()}
          {page === "Attendance" && <AttendancePage />}
          {page === "Development" && DevelopmentPage()}
          {page === "Reports" && <ReportsPage />}
          <footer className="footer">School Development and Management Information System <span>•</span> SDMIS</footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div><p>{label}</p><strong>{value}</strong></div>
    </article>
  );
}

function EmptyRow({ columns }) {
  return <tr><td colSpan={columns} className="empty-cell">No records found.</td></tr>;
}

export default App;
