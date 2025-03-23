import { Link } from "react-router-dom";

interface DashboardButtonProps {
    link: string;
    text: string;
    color: string;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ link, text, color }) => {
    return (
        <Link to={link} className={`${color} text-white py-3 px-5 rounded-md text-center font-semibold hover:opacity-80 block`}>
            {text}
        </Link>
    );
};

export default DashboardButton;
