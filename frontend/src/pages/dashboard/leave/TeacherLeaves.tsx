import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    CheckCircle,
    XCircle,
    Eye,
    Filter,
    Search,
    Download,
    Users,
    AlertCircle,
    FileText,
    Phone,
    Mail
} from 'lucide-react';

// TypeScript interfaces
interface Teacher {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
    phone: string;
    email: string;
}

interface Leave {
    id: number;
    teacher: Teacher;
    leave_type: 'sick' | 'casual' | 'emergency' | 'annual' | 'maternity' | 'paternity';
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    is_half_day: boolean;
    half_day_period?: 'morning' | 'afternoon';
    created_at: string;
    approved_at?: string;
    emergency_contact?: string;
    attachment_url?: string | null;
    substitute_teacher_id?: number;
    rejection_reason?: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
}

interface StatusConfig {
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
}

type ActionType = 'view' | 'approve' | 'reject' | '';
type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';

const AdminLeaveManagement: React.FC = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [stats, setStats] = useState<Stats>({} as Stats);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<FilterType>('pending');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [actionType, setActionType] = useState<ActionType>('');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [substituteTeacherId, setSubstituteTeacherId] = useState<string>('');

    // Mock data for demonstration
    const mockStats: Stats = {
        pending: 12,
        approved: 45,
        rejected: 8,
        cancelled: 3
    };

    const mockLeaves: Leave[] = [
        {
            id: 1,
            teacher: {
                first_name: 'John',
                last_name: 'Smith',
                employee_id: 'EMP001',
                department: 'Mathematics',
                phone: '+1234567890',
                email: 'john.smith@school.edu'
            },
            leave_type: 'sick',
            start_date: '2024-08-05',
            end_date: '2024-08-07',
            reason: 'Fever and flu symptoms',
            status: 'pending',
            is_half_day: false,
            created_at: '2024-08-01T10:30:00Z',
            emergency_contact: '+1234567891',
            attachment_url: null
        },
        {
            id: 2,
            teacher: {
                first_name: 'Sarah',
                last_name: 'Johnson',
                employee_id: 'EMP002',
                department: 'English',
                phone: '+1234567892',
                email: 'sarah.johnson@school.edu'
            },
            leave_type: 'casual',
            start_date: '2024-08-10',
            end_date: '2024-08-10',
            reason: 'Personal appointment',
            status: 'approved',
            is_half_day: true,
            half_day_period: 'afternoon',
            created_at: '2024-08-02T14:20:00Z',
            approved_at: '2024-08-02T16:45:00Z',
            substitute_teacher_id: 5
        },
        {
            id: 3,
            teacher: {
                first_name: 'Michael',
                last_name: 'Brown',
                employee_id: 'EMP003',
                department: 'Science',
                phone: '+1234567893',
                email: 'michael.brown@school.edu'
            },
            leave_type: 'emergency',
            start_date: '2024-08-03',
            end_date: '2024-08-04',
            reason: 'Family emergency',
            status: 'pending',
            is_half_day: false,
            created_at: '2024-08-03T08:15:00Z',
            emergency_contact: '+1234567894'
        }
    ];

    useEffect(() => {
        fetchLeaves();
        fetchStats();
    }, [filter, currentPage, searchTerm]);

    const fetchLeaves = async (): Promise<void> => {
        setLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                const filteredLeaves = mockLeaves.filter(leave =>
                    (filter === 'all' || leave.status === filter) &&
                    (searchTerm === '' ||
                        leave.teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        leave.teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        leave.teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                setLeaves(filteredLeaves);
                setTotalPages(Math.ceil(filteredLeaves.length / 10));
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setLoading(false);
        }
    };

    const fetchStats = async (): Promise<void> => {
        try {
            // Simulate API call
            setStats(mockStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApprove = async (leaveId: number): Promise<void> => {
        try {
            // Simulate API call
            const updatedLeaves = leaves.map(leave =>
                leave.id === leaveId
                    ? { ...leave, status: 'approved' as const, approved_at: new Date().toISOString() }
                    : leave
            );
            setLeaves(updatedLeaves);
            setShowModal(false);
            setSubstituteTeacherId('');
        } catch (error) {
            console.error('Error approving leave:', error);
        }
    };

    const handleReject = async (leaveId: number): Promise<void> => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            // Simulate API call
            const updatedLeaves = leaves.map(leave =>
                leave.id === leaveId
                    ? {
                        ...leave,
                        status: 'rejected' as const,
                        rejection_reason: rejectionReason,
                        approved_at: new Date().toISOString()
                    }
                    : leave
            );
            setLeaves(updatedLeaves);
            setShowModal(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting leave:', error);
        }
    };

    const openModal = (leave: Leave, action: ActionType): void => {
        setSelectedLeave(leave);
        setActionType(action);
        setShowModal(true);
    };

    const closeModal = (): void => {
        setShowModal(false);
        setSelectedLeave(null);
        setActionType('');
        setRejectionReason('');
        setSubstituteTeacherId('');
    };

    const getStatusBadge = (status: Leave['status']): JSX.Element => {
        const statusConfig: Record<Leave['status'], StatusConfig> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getLeaveTypeBadge = (type: Leave['leave_type']): JSX.Element => {
        const colors: Record<Leave['leave_type'], string> = {
            sick: 'bg-red-50 text-red-700 border-red-200',
            casual: 'bg-blue-50 text-blue-700 border-blue-200',
            emergency: 'bg-orange-50 text-orange-700 border-orange-200',
            annual: 'bg-green-50 text-green-700 border-green-200',
            maternity: 'bg-purple-50 text-purple-700 border-purple-200',
            paternity: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${colors[type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    const calculateDays = (startDate: string, endDate: string, isHalfDay: boolean): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return isHalfDay ? '0.5' : days.toString();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setFilter(e.target.value as FilterType);
    };

    const handleSubstituteTeacherChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSubstituteTeacherId(e.target.value);
    };

    const handleRejectionReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setRejectionReason(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
                    <p className="text-gray-600">Manage teacher leave requests and approvals</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {Object.entries(stats).map(([status, count]) => (
                        <div key={status} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 capitalize">{status} Leaves</p>
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                </div>
                                <div className={`p-3 rounded-full ${
                                    status === 'pending' ? 'bg-yellow-100' :
                                        status === 'approved' ? 'bg-green-100' :
                                            status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                                }`}>
                                    <Users className={`w-6 h-6 ${
                                        status === 'pending' ? 'text-yellow-600' :
                                            status === 'approved' ? 'text-green-600' :
                                                status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                                    }`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by teacher name or ID..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    value={filter}
                                    onChange={handleFilterChange}
                                >
                                    <option value="all">All Leaves</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Leaves Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading leaves...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {leaves.map((leave: Leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {leave.teacher.first_name} {leave.teacher.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {leave.teacher.employee_id} • {leave.teacher.department}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getLeaveTypeBadge(leave.leave_type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                            </div>
                                            {leave.is_half_day && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Half day ({leave.half_day_period})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {calculateDays(leave.start_date, leave.end_date, leave.is_half_day)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(leave.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(leave.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openModal(leave, 'view')}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {leave.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => openModal(leave, 'approve')}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(leave, 'reject')}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                                        <span className="font-medium">{totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    currentPage === i + 1
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && selectedLeave && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {actionType === 'view' ? 'Leave Request Details' :
                                            actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                                    </h3>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Leave Details */}
                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {selectedLeave.teacher.first_name} {selectedLeave.teacher.last_name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 ml-6">
                                                {selectedLeave.teacher.employee_id} • {selectedLeave.teacher.department}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    {selectedLeave.teacher.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4" />
                                                    {selectedLeave.teacher.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                            {getLeaveTypeBadge(selectedLeave.leave_type)}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            {getStatusBadge(selectedLeave.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(selectedLeave.start_date).toLocaleDateString()} - {new Date(selectedLeave.end_date).toLocaleDateString()}
                                            </div>
                                            {selectedLeave.is_half_day && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Half day ({selectedLeave.half_day_period})
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                                            <div className="text-sm text-gray-900">
                                                {calculateDays(selectedLeave.start_date, selectedLeave.end_date, selectedLeave.is_half_day)} days
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                        <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <p className="text-sm text-gray-900">{selectedLeave.reason}</p>
                                        </div>
                                    </div>

                                    {selectedLeave.emergency_contact && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                                {selectedLeave.emergency_contact}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action-specific content */}
                                {actionType === 'approve' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Substitute Teacher ID (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Enter substitute teacher ID"
                                            value={substituteTeacherId}
                                            onChange={handleSubstituteTeacherChange}
                                        />
                                    </div>
                                )}

                                {actionType === 'reject' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason *
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            rows={3}
                                            placeholder="Please provide a reason for rejection..."
                                            value={rejectionReason}
                                            onChange={handleRejectionReasonChange}
                                            required
                                        />
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        {actionType === 'view' ? 'Close' : 'Cancel'}
                                    </button>

                                    {actionType === 'approve' && (
                                        <button
                                            onClick={() => handleApprove(selectedLeave.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve Leave
                                        </button>
                                    )}

                                    {actionType === 'reject' && (
                                        <button
                                            onClick={() => handleReject(selectedLeave.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject Leave
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeaveManagement;