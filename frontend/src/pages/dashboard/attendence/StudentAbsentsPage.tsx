import  { useState, useEffect, useMemo, FC } from 'react';
import {  Filter, Search, FileText } from 'lucide-react';

// --- TYPE DEFINITIONS (Based on your Prisma Schema) ---
interface Student {
    student_id: number;
    admission_ID: string;
    first_name: string;
    last_name: string;
    student_photo: string | null;
    phone_number: string;
}

// Data structure for the list of absentees
interface AbsenteeRecord {
    student: Student;
    date: string;
    status: 'A' | 'P'; // A for Absent, P for Present
    leave_letter_url?: string;
}


// --- MOCK DATA (Simulating an API response) ---
const mockAbsentees: AbsenteeRecord[] = [
    {
        student: {
            student_id: 101,
            admission_ID: 'sds456',
            first_name: 'Tarak',
            last_name: 'Mehta',
            student_photo: 'https://i.pravatar.cc/150?img=12', // Using a placeholder image service
            phone_number: '8931912345',
        },
        date: '2024-08-06',
        status: 'A',
        leave_letter_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
        student: {
            student_id: 102,
            admission_ID: 'sds145',
            first_name: 'Laxmi',
            last_name: 'Agarwal',
            student_photo: 'https://i.pravatar.cc/150?img=5',
            phone_number: '8931912349',
        },
        date: '2024-08-06',
        status: 'A',
    },
    {
        student: {
            student_id: 103,
            admission_ID: 'sds789',
            first_name: 'Rohan',
            last_name: 'Joshi',
            student_photo: 'https://i.pravatar.cc/150?img=32',
            phone_number: '8931912350',
        },
        date: '2024-08-06',
        status: 'A',
    },
];


const StudentAbsentsPage: FC = () => {
    const [absenteeRecords, setAbsenteeRecords] = useState<AbsenteeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<string>('6');
    const [selectedSection, setSelectedSection] = useState<string>('B');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // --- DATA FETCHING ---
    useEffect(() => {
        // Simulate API call to fetch absentees for the selected class and section
        setIsLoading(true);
        const fetchAbsentees = () => {
            console.log(`Fetching absentees for Class: ${selectedClass}, Section: ${selectedSection}`);
            // In a real app, you would make a fetch request here:
            // const response = await fetch(`/api/absent-students?class=${selectedClass}&section=${selectedSection}`);
            // const data = await response.json();
            // setAbsenteeRecords(data);
            setTimeout(() => {
                setAbsenteeRecords(mockAbsentees);
                setIsLoading(false);
            }, 1000); // Simulate network delay
        };

        fetchAbsentees();
    }, [selectedClass, selectedSection]);

    // --- DERIVED STATE / MEMOIZATION ---
    const filteredRecords = useMemo(() => {
        if (!searchQuery) {
            return absenteeRecords;
        }
        return absenteeRecords.filter(record =>
            `${record.student.first_name} ${record.student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.student.admission_ID.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [absenteeRecords, searchQuery]);

    const totalAbsents = useMemo(() => {
        return absenteeRecords.filter(record => record.status === 'A').length;
    }, [absenteeRecords]);

    // --- EVENT HANDLERS ---
    const handleStatusChange = (studentId: number, newStatus: 'A' | 'P') => {
        setAbsenteeRecords(prevRecords =>
            prevRecords.map(record =>
                record.student.student_id === studentId ? { ...record, status: newStatus } : record
            )
        );
    };

    const handleSubmit = () => {
        // This function would send the updated attendance data to the backend.
        // The API would likely expect a list of student IDs to mark as present.
        const studentsToMarkPresent = absenteeRecords
            .filter(record => record.status === 'P')
            .map(record => record.student.student_id);

        if (studentsToMarkPresent.length > 0) {
            console.log('Submitting attendance for the following students:', studentsToMarkPresent);
            // Example POST request:
            // await fetch('/mobileAPI/student/attendance', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ studentsIDs: studentsToMarkPresent })
            // });
            alert(`Marked ${studentsToMarkPresent.length} student(s) as present.`);
        } else {
            alert('No changes to submit.');
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 font-sans min-h-screen">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">

                {/* Header Section */}
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-red-600">Student Absents</h1>
                    <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div>
                                <label htmlFor="class" className="text-sm font-medium text-gray-700">Class:</label>
                                <select id="class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="ml-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="6">6th</option>
                                    <option value="7">7th</option>
                                    <option value="8">8th</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="section" className="text-sm font-medium text-gray-700">Section:</label>
                                <select id="section" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="ml-2 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-red-700">
                                <Filter size={20} />
                                <span className="font-semibold">Total Absents: {totalAbsents}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Table/List Section */}
                <main>
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-[80px_1fr_1fr_1fr_1fr_150px_100px] gap-4 p-4 bg-gray-100 rounded-t-lg font-bold text-sm text-gray-600">
                        <span>IMAGE</span>
                        <span>NAME</span>
                        <span>ID NO</span>
                        <span>CONTACT NO</span>
                        <span>DATE</span>
                        <span>LEAVE LETTER</span>
                        <span className="text-center">STATUS</span>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <p className="text-center p-8 text-gray-500">Loading student data...</p>
                        ) : filteredRecords.length === 0 ? (
                            <p className="text-center p-8 text-gray-500">No absent students found.</p>
                        ) : (
                            filteredRecords.map(({ student, date, status, leave_letter_url }) => (
                                <div key={student.student_id} className="grid md:grid-cols-[80px_1fr_1fr_1fr_1fr_150px_100px] gap-4 p-4 items-center border rounded-lg shadow-sm hover:bg-gray-50">
                                    {/* Image */}
                                    <div className="flex items-center justify-center">
                                        <img src={student.student_photo || 'default-avatar.png'} alt={`${student.first_name}`} className="w-12 h-12 rounded-full object-cover"/>
                                    </div>

                                    {/* Student Info */}
                                    <div className="text-sm">
                                        <div className="font-bold text-gray-800">{student.first_name} {student.last_name}</div>
                                        <div className="md:hidden text-gray-500">ID: {student.admission_ID}</div>
                                    </div>
                                    <div className="hidden md:block text-sm text-gray-600">{student.admission_ID}</div>
                                    <div className="hidden md:block text-sm text-gray-600">{student.phone_number}</div>
                                    <div className="hidden md:block text-sm text-gray-600">{new Date(date).toLocaleDateString()}</div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {leave_letter_url ? (
                                            <a href={leave_letter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                                <FileText size={14} /> View Letter
                                            </a>
                                        ) : (
                                            <span className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-md">No Letter</span>
                                        )}
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleStatusChange(student.student_id, 'A')} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${status === 'A' ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-gray-200 text-gray-600 hover:bg-red-200'}`}>
                                            A
                                        </button>
                                        <button onClick={() => handleStatusChange(student.student_id, 'P')} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${status === 'P' ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-200 text-gray-600 hover:bg-green-200'}`}>
                                            P
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                {/* Footer Actions */}
                <footer className="mt-8 flex justify-end items-center">
                    {/*<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">*/}
                    {/*    <Printer size={16} />*/}
                    {/*    Print*/}
                    {/*</button>*/}
                    <button onClick={handleSubmit} className="px-8 py-3 font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105">
                        SUBMIT
                    </button>
                </footer>

            </div>
        </div>
    );
};

export default StudentAbsentsPage;