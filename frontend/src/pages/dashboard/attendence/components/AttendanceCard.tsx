function AttendanceCard({title, count, color_class}: {title: string, count: number, color_class: string}) {
    const borderColor =
        color_class === 'blue'
            ? 'border-blue-500'
            : color_class === 'red'
                ? 'border-red-500'
                : 'border-green-500';
    return (
        <div className={`flex-1 p-6  border-2 border-${borderColor} rounded-lg shadow-lg`}>
            <h5 className={"text-gray-800 font-semibold mb-3 text-2xl"}>{title}</h5>
            <p className={"text-gray-800 font-black text-5xl"}>{count}</p>
        </div>
    )
}

export default AttendanceCard;