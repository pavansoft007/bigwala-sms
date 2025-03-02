import {DataTypes, Model} from "sequelize";
import Student from "./Student.js";
import School from "./School.js";
import sequelize from "../config/database.js";
import FeeCategory from "./FeeCategory.js";

class StudentPaymentPending extends Model{}

StudentPaymentPending.init({
    pending_payment_id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    amount:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    student_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Student,
            key:'student_id'
        }
    },
    school_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:School,
            key:'school_id'
        }
    },
    category_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:FeeCategory,
            key:'category_id'
        }
    },
    payment_photo:{
      type:DataTypes.TEXT,
      allowNull:false
    },
    status:{
        type:DataTypes.ENUM('rejected','approved','pending'),
        allowNull:false
    }
},{
    sequelize,
    modelName: 'StudentPaymentPending',
    tableName: 'Student_payment_pending',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default StudentPaymentPending;