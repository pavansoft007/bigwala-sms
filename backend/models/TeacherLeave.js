import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Admin from "./Admin.js";
import Teacher from "./Teacher.js";
import AcademicYear from "./AcademicYear.js";
import School from "./School.js";

class TeacherLeave extends Model {
    // Method to calculate total leave days
    getTotalDays() {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        const timeDiff = end.getTime() - start.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    }

    // Method to check if leave is currently active
    isActive() {
        const today = new Date();
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        return today >= start && today <= end && this.status === 'approved';
    }

    // Static method to get leaves for a specific teacher
    static async getTeacherLeaves(teacherId, status = null) {
        const whereClause = { teacher_id: teacherId };
        if (status) {
            whereClause.status = status;
        }

        return await TeacherLeave.findAll({
            where: whereClause,
            order: [['start_date', 'DESC']]
        });
    }

    // Static method to get pending leaves for approval
    static async getPendingLeaves(schoolId = null) {
        const whereClause = { status: 'pending' };

        return await TeacherLeave.findAll({
            where: whereClause,
            include: [{
                model: sequelize.models.Teacher, // Assuming you have a Teacher model
                as: 'teacher',
                where: schoolId ? { school_id: schoolId } : {}
            }],
            order: [['created_at', 'ASC']]
        });
    }

    // Method to approve leave
    async approve(approvedBy) {
        return await this.update({
            status: 'approved',
            approved_by: approvedBy,
            approved_at: new Date()
        });
    }

    // Method to reject leave
    async reject(rejectedBy, rejectionReason = null) {
        return await this.update({
            status: 'rejected',
            approved_by: rejectedBy,
            approved_at: new Date(),
            rejection_reason: rejectionReason
        });
    }
}

TeacherLeave.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Teacher,
            key: 'teacher_id'
        }
    },
    school_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: School,
            key: 'school_id'
        }
    },
    leave_type: {
        type: DataTypes.ENUM('sick', 'casual', 'emergency', 'maternity', 'paternity', 'annual', 'compensatory', 'other'),
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (value < this.start_date) {
                    throw new Error('End date must be after or equal to start date');
                }
            }
        }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Admin,
            key: 'admin_id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_half_day: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    half_day_period: {
        type: DataTypes.ENUM('morning', 'afternoon'),
        allowNull: true,
        validate: {
            requiresHalfDay(value) {
                if (this.is_half_day && !value) {
                    throw new Error('Half day period is required when is_half_day is true');
                }
            }
        }
    },
    year_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AcademicYear,
            key: 'year_id'
        }
    },
    attachment_url: {
        type: DataTypes.STRING,
        allowNull: true, // For medical certificates, etc.
    },
    emergency_contact: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'TeacherLeave',
    tableName: 'teacher_leaves',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default TeacherLeave;