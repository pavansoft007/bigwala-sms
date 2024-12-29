import React, {useEffect, useState, ChangeEvent} from "react";
import {AxiosError} from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import axiosInstance from "../../services/axiosInstance.ts";

interface Classroom{
    classroom_id:number,
    standard:string,
    section:string
}

interface FeeDetails{
    category_id: number,
    category_name: string,
    total_fee: number
}

interface FeeCategory{
    category_id: number,
    category_name: string,
    description: string
}

const AddStudent = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        email: "",
        phone_number: "",
        address: "",
        enrollment_date: "",
        standard: "",
        section: "",
        tuition_fee:'',
        classroom_id:'',
        fee_amount:0
    });
    const [classroomDetails,setClassroomDetails]=useState<Classroom[]>([]);
    const [feeDetails,setFeeDetails]=useState<FeeDetails[]>([]);
    const [feeCategory,setFeeCategory]=useState<FeeCategory[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch standards on component mount
    useEffect(() => {
        const fetchStandards = async () => {
            try {
                const classroomRespoance=await axiosInstance.get('/mobileAPI/classroom');
                setClassroomDetails(classroomRespoance.data);
                const feeCatrgoriesRes=await axiosInstance.get('/api/fee_category');
                setFeeCategory(feeCatrgoriesRes.data);
            } catch (e) {
                console.error("Error fetching standards:", e);
                setError("Failed to load standards. Please try again later.");
            }
        };

        fetchStandards();
    }, []);

    const handleFeeToggle=(event:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,index:number)=>{
        const newArr:FeeDetails[]=feeDetails;
        if(event.target.checked){
            feeDetails.push(
                {
                    category_id:parseInt(event.target.value),
                    category_name:event.target.name,
                    total_fee:parseInt(document.getElementById('fee_amount_'+index).value) || 0
                }
            )
        }else{
            newArr.splice(index,1);
        }
        setFeeDetails(newArr);
    }

    const handlePriceChange=(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,index)=>{
        const newArr=feeDetails;
        if(newArr[index]){
            newArr[index]['total_fee']=parseInt(e.target.value);
            setFeeDetails(newArr);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            await axiosInstance.post("/api/student", {
                ...formData,
                feeDetails
            });
            setMessage("Student added successfully!");
            setFormData({
                first_name: "",
                last_name: "",
                date_of_birth: "",
                gender: "",
                email: "",
                phone_number: "",
                address: "",
                enrollment_date: "",
                standard: "",
                section: "",
                tuition_fee:'',
                classroom_id: '',
                fee_amount:0
            });
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || "An error occurred while adding the student.");
            } else {
                setError("An unexpected error occurred while adding the student.");
            }
        }
    };

    const blockCss:string='w-full mx-4';

    return (
        <div className="max-w-full mx-auto bg-white p-8 rounded shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Add Student</h2>

            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4 flex justify-around ">
                <div className={blockCss} >
                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>


                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Class</label>
                        <select
                            name="classroom_id"
                            value={formData.classroom_id}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Class</option>
                            {classroomDetails.map((item, index) => (
                                <option key={index} value={item.classroom_id}>
                                    {item.standard}-{item.section}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
                <div className={blockCss} >

                    <div className="mt-2"  >
                        <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                        <input
                            type="date"
                            name="enrollment_date"
                            value={formData.enrollment_date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="my-3" >
                        <h3 className="text-center text-xl" >Fee management</h3>
                    </div>

                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead>s.no</TableHead>
                                    <TableHead>category</TableHead>
                                    <TableHead className="text-center" >fee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    feeCategory.map((item: FeeCategory, index: number)=>{
                                        return <TableRow>
                                            <TableCell><input type="checkbox" name={item.category_name} value={item.category_id}  onChange={(event)=>handleFeeToggle(event,index)} /></TableCell>
                                            <TableCell>{index+1}</TableCell>
                                            <TableCell>{item.category_name}</TableCell>
                                            <TableCell className="text-center" ><input type="number"
                                                                                       onChange={(event) => handlePriceChange(event, index)}
                                                                                       id={'fee_amount_'+index}
                                                                                       className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                                                       placeholder={'enter the fee '+item.category_name} /></TableCell>
                                        </TableRow>
                                    })
                                }

                            </TableBody>
                        </Table>
                    </div>

                    <div className=" flex justify-center mt-5 ">
                        {/*<button*/}
                        {/*    type="submit"*/}
                        {/*    className="bg-blue-600 text-white py-2 px-4 w-1/2 rounded-lg hover:bg-blue-700"*/}
                        {/*>*/}
                        {/*    Add Student*/}
                        {/*</button>*/}
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white py-2 px-4 w-1/2 rounded-lg hover:bg-blue-700"
                        >
                            Add Student
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default AddStudent;
