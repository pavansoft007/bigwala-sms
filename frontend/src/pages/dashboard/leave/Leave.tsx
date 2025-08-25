import React from 'react';
import {
    GraduationCap,
    UserCheck,
    Shield
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

interface LeaveOption {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'purple';
    route: string;
}

interface ColorClasses {
    bg: string;
    border: string;
    icon: string;
    text: string;
}

const LeaveOptionsPage: React.FC = () => {
    const navigate = useNavigate();
    const leaveOptions: LeaveOption[] = [
        {
            id: 'student',
            title: 'Student Leaves',
            icon: GraduationCap,
            color: 'blue',
            route: 'students'
        },
        {
            id: 'teacher',
            title: 'Teacher Leaves',
            icon: UserCheck,
            color: 'green',
            route: 'teachers'
        },
        {
            id: 'admin',
            title: 'Admin Leaves',
            icon: Shield,
            color: 'purple',
            route: 'admin'
        }
    ];

    const handleOptionClick = (option: LeaveOption): void => {
        console.log(`Navigating to ${option.route}`);
        navigate(option.route);
    };

    const getColorClasses = (color: 'blue' | 'green' | 'purple'): ColorClasses => {
        const colorMap: Record<'blue' | 'green' | 'purple', ColorClasses> = {
            blue: {
                bg: 'bg-blue-50 hover:bg-blue-100',
                border: 'border-blue-200 hover:border-blue-300',
                icon: 'text-blue-600',
                text: 'text-blue-900'
            },
            green: {
                bg: 'bg-green-50 hover:bg-green-100',
                border: 'border-green-200 hover:border-green-300',
                icon: 'text-green-600',
                text: 'text-green-900'
            },
            purple: {
                bg: 'bg-purple-50 hover:bg-purple-100',
                border: 'border-purple-200 hover:border-purple-300',
                icon: 'text-purple-600',
                text: 'text-purple-900'
            }
        };
        return colorMap[color];
    };

    return (
        <div className="min-h-screen bg-gray-50 flex  justify-center p-6">
            <div className="w-full max-w-4xl">
                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Leave Management</h1>
                    <p className="text-lg text-gray-600">Select the type of leave management you want to access</p>
                </div>

                {/* Three Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {leaveOptions.map((option: LeaveOption) => {
                        const colors: ColorClasses = getColorClasses(option.color);
                        const Icon = option.icon;

                        return (
                            <div
                                key={option.id}
                                onClick={() => handleOptionClick(option)}
                                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                            >
                                <div className="text-center">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-6 bg-white rounded-full shadow-md group-hover:shadow-lg transition-shadow">
                                            <Icon className={`w-16 h-16 ${colors.icon}`} />
                                        </div>
                                    </div>

                                    <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>
                                        {option.title}
                                    </h2>

                                    <p className="text-gray-600">
                                        Manage {option.title.toLowerCase()} and approval processes
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeaveOptionsPage;