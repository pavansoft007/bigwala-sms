import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import generateTeacherID from "../services/generateTeacherID.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";
import upload from "../services/multerService.js";
const ManagingTeacher = express.Router();

ManagingTeacher.post(
  "/api/teacher",
  AdminAuth("teacher management"),
  upload.fields([
    { name: "teacher_photo", maxCount: 1 },
    { name: "teacher_qualification_certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        email,
        phone_number,
        hire_date,
        status,
        subject_id,
        salary,
        teachers_qualification,
      } = req.body;

      const adminAccess = req.body.adminAccess || false;

      const newTeacherID = await generateTeacherID(
        req["sessionData"]["school_code"]
      );
      const teacher_photo = req.files["teacher_photo"]
        ? req.files["teacher_photo"][0].path
        : null;
      const teacher_qualification_certificate = req.files[
        "teacher_qualification_certificate"
      ]
        ? req.files["teacher_qualification_certificate"][0].path
        : null;
      const newTeacher = await Teacher.create({
        first_name,
        last_name,
        TeacherID: newTeacherID,
        email,
        phone_number,
        subject_id,
        salary,
        hire_date,
        school_id: req["sessionData"]["school_id"],
        school_code: req["sessionData"]["school_code"],
        adminAccess,
        status: status || "Active",
        teachers_qualification,
        teacher_photo,
        teacher_qualification_certificate,
      });
      const newUser = await User.create({
        phone_number,
        role: adminAccess ? "admin-teacher" : "teacher",
        original_id: newTeacher.teacher_id,
      });

      res.status(201).json({
        message: "Teacher and user created successfully",
        teacher: newTeacher,
        user: newUser,
      });
    } catch (error) {
      if (error.original && error.original.errno === 1062) {
        res.status(403).json({
          message: error.errors[0].message,
        });
      } else {
        res.status(500).json({
          message: "An error occurred while creating teacher and user",
          error: error.message,
        });
      }
    }
  }
);

ManagingTeacher.put(
  "/api/teacher/:id",
  AdminAuth("teacher management"),
  upload.fields([
    { name: "teacher_photo", maxCount: 1 },
    { name: "teacher_qualification_certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const teacherId = req.params.id;
      const {
        first_name,
        last_name,
        email,
        phone_number,
        hire_date,
        status,
        subject_id,
        adminAccess,
        teachers_qualification,
      } = req.body;

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const teacher_photo = req.files["teacher_photo"]
        ? req.files["teacher_photo"][0].path
        : teacher.teacher_photo;
      const teacher_qualification_certificate = req.files[
        "teacher_qualification_certificate"
      ]
        ? req.files["teacher_qualification_certificate"][0].path
        : teacher.teacher_qualification_certificate;

      await teacher.update({
        first_name,
        last_name,
        email,
        phone_number,
        subject_id,
        hire_date: hire_date,
        status: status || "Active",
        adminAccess,
        teachers_qualification,
        teacher_photo,
        teacher_qualification_certificate,
      });

      await User.update(
        { role: adminAccess ? "admin-teacher" : "teacher" },
        { where: { original_id: teacherId } }
      );

      res.status(200).json({
        message: "Teacher updated successfully",
        teacher,
      });
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(500).json({
        message: "An error occurred while updating the teacher",
        error: error.message,
      });
    }
  }
);

ManagingTeacher.post(
  "/api/search/teacher",
  AdminAuth("teacher management"),
  async (req, res) => {
    const limit = parseInt(req.body.limit) || 10;
    const page = parseInt(req.body.page) || 1;
    const offset = (page - 1) * limit;

    const where = [];
    const body = req.body;

    if (body.email) {
      where.push(`teachers.email = '${body.email}'`);
    }
    if (body.name) {
      where.push(
        `(teachers.first_name LIKE '${body.name}%' OR teachers.last_name LIKE '${body.name}%')`
      );
    }
    if (body.phone_number) {
      where.push(`teachers.phone_number = '${body.phone_number}'`);
    }
    if (body.TeacherID) {
      where.push(`teachers.TeacherID = '${body.TeacherID}'`);
    }
    if (body.subject_name) {
      where.push(`s.subject_name  LIKE  '${body.subject_name}%'`);
    }
    if (body.teachers_qualification) {
      where.push(
        `teachers.teachers_qualification LIKE '${body.teachers_qualification}%'`
      );
    }
    if (body.standard) {
      if (body.section) {
        where.push(`c.section = '${body.section}'`);
      }
      if (body.standard) {
        where.push(`c.standard = '${body.standard}'`);
      }
    } else if (body.assignedClass) {
      where.push(`teachers.assignedClass = '${body.assignedClass}'`);
    }
    if (body.subject_id) {
      where.push(`s.subject_id = '${body.subject_id}'`);
    }
    if (body.status) {
      where.push(`teachers.status = '${body.status}'`);
    }

    where.push(`teachers.school_id = '${req.sessionData.school_id}'`);

    let baseQuery = `
    SELECT teachers.*, classrooms.standard, classrooms.section 
    FROM teachers
             left JOIN subjects s ON s.subject_id = teachers.subject_id    
    LEFT JOIN classrooms ON classrooms.classroom_id = teachers.assignedClass`;

    let countQuery = `
    SELECT COUNT(*) as totalCount 
    FROM teachers
             left JOIN subjects s ON s.subject_id = teachers.subject_id
             LEFT JOIN classrooms ON classrooms.classroom_id = teachers.assignedClass`;

    if (where.length > 0) {
      const condition = `WHERE ${where.join(" AND ")}`;
      baseQuery += ` ${condition}`;
      countQuery += ` ${condition}`;
    }

    baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    try {
      const [teachers] = await sequelize.query(baseQuery);
      const [countResult] = await sequelize.query(countQuery);

      const totalCount = countResult[0]?.totalCount || 0;

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          limit,
        },
        teachers,
      });
    } catch (e) {
      console.error("Error searching teacher:", e);
      res.status(500).json({
        message: "An error occurred while searching for the teacher",
      });
    }
  }
);

ManagingTeacher.get(
  "/api/teacher/:id",
  AdminAuth("teacher management"),
  async (req, res) => {
    const teacherID = req.params.id;
    const school_id = req["sessionData"]["school_id"];
    try {
      const [teacherDetails] = await sequelize.query(
        "SELECT *,s.subject_name,s.subject_name,c.standard,c.section FROM teachers INNER JOIN subjects s ON s.subject_id=teachers.subject_id INNER JOIN classrooms c ON c.classroom_id=teachers.assignedClass where c.school_id=? and  teacher_id=?",
        {
          replacements: [school_id, teacherID],
        }
      );

      if (teacherDetails) {
        teacherDetails[0]["adminAccess"] =
          teacherDetails[0]["adminAccess"] === "0";
        res.json(teacherDetails[0]);
      } else {
        res.status(404).json({ message: "teacher not found" });
      }
    } catch (e) {
      console.error("Error deleting teacher:", e);
      res.status(500).json({
        message: "An error occurred while getting the teacher",
      });
    }
  }
);

ManagingTeacher.get(
  "/api/teacher",
  AdminAuth("teacher management"),
  async (req, res) => {
    const school_id = req["sessionData"]["school_id"];
    try {
      let [teacherDetails] = await sequelize.query(
        `SELECT teachers.teacher_id,teachers.TeacherID,teachers.first_name,teachers.last_name,teachers.status,teachers.adminAccess,
                     teachers.email,teachers.phone_number,teachers.hire_date,teachers.teachers_qualification,teachers.teacher_photo,teachers.teacher_qualification_certificate,
                     s.subject_name,s.subject_name,c.standard,c.section FROM teachers left join subjects s ON s.subject_id=teachers.subject_id 
                     left join classrooms c ON c.classroom_id=teachers.assignedClass 
                     where teachers.school_id=${school_id}`
      );
      if (teacherDetails) {
        teacherDetails = teacherDetails.map((item) => {
          item["adminAccess"] = item["adminAccess"] === 0;

          return item;
        });
        res.json(teacherDetails);
      } else {
        res.status(404).json({ message: "teacher not found" });
      }
    } catch (e) {
      console.error("Error getting teachers:", e);
      res.status(500).json({
        message: "An error occurred while getting the teacher",
      });
    }
  }
);

ManagingTeacher.delete(
  "/api/teacher/:id",
  AdminAuth("teacher management"),
  async (req, res) => {
    try {
      const teacherId = req.params.id;

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      await User.destroy({
        where: {
          original_id: teacherId,
          role: adminAccess ? "admin-teacher" : "teacher",
        },
      });

      await teacher.destroy();

      res
        .status(200)
        .json({ message: "Teacher and associated user deleted successfully" });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({
        message: "An error occurred while deleting the teacher",
        error: error.message,
      });
    }
  }
);

export default ManagingTeacher;
