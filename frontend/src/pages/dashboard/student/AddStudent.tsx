import {useEffect, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import axiosInstance from "../../../services/axiosInstance.ts";
import Classroom from "@/types/Classroom.ts";
import FeeCategory from "@/types/FeeCategory.ts";
import FeeDetails from "@/types/FeeDetails.ts";

interface FormDataWithFiles extends FormData {
    first_name: string,
    last_name: string,
    admission_id:string,
    admission_id_auto_generate_check:boolean,
    date_of_birth: string,
    gender: string,
    email: string,
    phone_number: string,
    address: string,
    enrollment_date: string,
    standard: string,
    section: string,
    tuition_fee: string,
    classroom_id: string,
    father_name: string,
    mother_name: string,
    mother_phone_number: string,
    caste: string,
    student_photo?: File | null;
    father_photo?: File | null;

}

const AddStudent = () => {
    const [formData, setFormData] = useState<FormDataWithFiles>(() => {
        const initialFormData = new FormData() as FormDataWithFiles;
        initialFormData.first_name = "";
        initialFormData.last_name = "";
        initialFormData.date_of_birth = "";
        initialFormData.gender = "";
        initialFormData.email = "";
        initialFormData.phone_number = "";
        initialFormData.address = "";
        initialFormData.enrollment_date = "";
        initialFormData.standard = "";
        initialFormData.section = "";
        initialFormData.tuition_fee = "";
        initialFormData.classroom_id = "";
        initialFormData.father_name = "";
        initialFormData.mother_name = "";
        initialFormData.mother_phone_number = "";
        initialFormData.caste = "";
        initialFormData.admission_id="";
        initialFormData.admission_id_auto_generate_check=false;
        return initialFormData;
    });
    const [classroomDetails, setClassroomDetails] = useState<Classroom[]>([]);
    const [feeDetails, setFeeDetails] = useState<FeeDetails[]>([]);
    const [feeCategory, setFeeCategory] = useState<FeeCategory[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandards = async () => {
            try {
                const classroomRespoance = await axiosInstance.get<Classroom[]>('/mobileAPI/classroom');
                setClassroomDetails(classroomRespoance.data);
                const feeCatrgoriesRes = await axiosInstance.get<FeeDetails[]>('/api/fee_category');
                setFeeCategory(feeCatrgoriesRes.data);
            } catch (e) {
                console.error("Error fetching standards:", e);
                setError("Failed to load standards. Please try again later.");
            }
        };

        fetchStandards();
    }, []);

    const handleFeeToggle = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const newArr: FeeDetails[] = [...feeDetails];


        if (event.target instanceof HTMLInputElement) {
            const feeAmountElement = document.getElementById(`fee_amount_${index}`) as HTMLInputElement | null;
            const feeAmount = feeAmountElement ? parseInt(feeAmountElement.value) || 0 : 0;

            if (event.target.checked) {
                newArr.push({
                    category_id: parseInt(event.target.value),
                    category_name: event.target.name,
                    total_fee: feeAmount,
                });
            } else {
                newArr.splice(index, 1);
            }
            setFeeDetails(newArr);
        }
    };


    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const newArr = feeDetails;
        if (newArr[index]) {
            newArr[index]['total_fee'] = parseInt(e.target.value);
            setFeeDetails(newArr);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement >) => {
        const {name, value, type} = e.target;



        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            const files = fileInput.files;

            if (files && files.length > 0) {
                setFormData(prevData => ({
                    ...prevData,
                    [name]: files[0]
                }));
            }
        }else if(type ==='checkbox'){
                setFormData(prevData => ({
                    ...prevData,
                    [name]:  (e.target as HTMLInputElement).checked
        }));

        } else {
                setFormData(prevData => ({
                    ...prevData,
                    [name]: value
                }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            const backendFormData = new FormData();

            // Append all non-file fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'student_photo' && key !== 'father_photo') {
                    backendFormData.append(key, value as string);
                }
            });

            // Append files if they exist
            if (formData.student_photo) {
                backendFormData.append('student_photo', formData.student_photo);
            }
            if (formData.father_photo) {
                backendFormData.append('father_photo', formData.father_photo);
            }

            // Append fee details
            feeDetails.forEach((detail, i) => {
                backendFormData.append(`feeDetails[${i}][total_fee]`, detail.total_fee.toString());
                backendFormData.append(`feeDetails[${i}][category_id]`, detail.category_id.toString());
            });


            await axiosInstance.post("/api/student", backendFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage("Student added successfully!");
            const newFormData = new FormData() as FormDataWithFiles;
            newFormData.first_name = "";
            newFormData.last_name = "";
            newFormData.date_of_birth = "";
            newFormData.gender = "";
            newFormData.email = "";
            newFormData.phone_number = "";
            newFormData.address = "";
            newFormData.enrollment_date = "";
            newFormData.standard = "";
            newFormData.section = "";
            newFormData.tuition_fee = "";
            newFormData.classroom_id = "";
            newFormData.father_name = "";
            newFormData.mother_name = "";
            newFormData.mother_phone_number = "";
            newFormData.caste = "";
            setFormData(newFormData);
        } catch (err: unknown) {
            console.log('error in while adding the user:')
            setError("An error occurred while adding the student.");
        }
    };

    const blockCss: string = 'w-full mx-4';

    return (
        <div className="max-w-full mx-auto bg-white p-8 rounded shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Add Student</h2>

            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4 flex justify-around ">
                <div className={blockCss}>
                    <div className="mt-2">
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

                    <div className="mt-2">
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


                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">Admission ID</label>
                        <input
                            type="text"
                            name="admission_id"
                            value={formData.admission_id}
                            onChange={handleChange}
                            disabled={formData.admission_id_auto_generate_check}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="checkbox"
                          className=" mx-2"
                          name="admission_id_auto_generate_check"
                          value='true'
                          onChange={handleChange}

                        />
                        <label  htmlFor="admission_id_auto_generate_check" className="mt-4" >
                          Auto generate Admission ID
                        </label>
                    </div>

                    <div className="mt-2">
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

                    <div className="mt-2">
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

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">father name</label>
                        <input
                            type="text"
                            name="father_name"
                            value={formData.father_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">mother name</label>
                        <input
                            type="text"
                            name="mother_name"
                            value={formData.mother_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>


                    <div className="mt-2">
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

                    <div className="mt-2">
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

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">mother Phone Number</label>
                        <input
                            type="tel"
                            name="mother_phone_number"
                            value={formData.mother_phone_number}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>


                </div>
                <div className={blockCss}>

                    <div className="mt-2">
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
                    <div className="mt-2">
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

                    <div className="mt-2">
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
                    <div className="mb-4 flex flex-row mt-2">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Student photo:</label>
                            <input
                                type="file"
                                name="student_photo"
                                onChange={handleChange}
                                className="w-full text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">father photo:</label>
                            <input
                                type="file"
                                name="father_photo"
                                onChange={handleChange}
                                className="w-full text-gray-600"
                            />
                        </div>
                    </div>
                    {/* <div className="mb-4">

                    </div> */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">caste</label>
                        <select
                            name="caste"
                            value={formData.caste}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Caste</option>
                            <option value="OC">OC</option>
                            <option value="BC-A">BC-A</option>
                            <option value="BC-B">BC-B</option>
                            <option value="BC-C">BC-C</option>
                            <option value="BC-D">BC-D</option>
                            <option value="BC-E">BC-E</option>
                            <option value="ST">ST</option>
                            <option value="SC">SC</option>
                        </select>
                    </div>
                    <div className="my-3">
                        <h3 className="text-center text-xl">Fee management</h3>
                    </div>

                    <div className="h-64 overflow-scroll">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead>s.no</TableHead>
                                    <TableHead>category</TableHead>
                                    <TableHead className="text-center">fee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    feeCategory.map((item: FeeCategory, index: number) => {
                                        return <TableRow key={index} >
                                            <TableCell><input type="checkbox" name={item.category_name}
                                                              value={item.category_id}
                                                              onChange={(event) => handleFeeToggle(event, index)}/></TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.category_name}</TableCell>
                                            <TableCell className="text-center"><input type="number"
                                                                                      onChange={(event) => handlePriceChange(event, index)}
                                                                                      id={'fee_amount_' + index}
                                                                                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                                                      placeholder={'enter the fee ' + item.category_name}/></TableCell>
                                        </TableRow>
                                    })
                                }

                            </TableBody>
                        </Table>
                    </div>

                    <div className=" flex justify-center mt-5 ">
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
