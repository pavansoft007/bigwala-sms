const formatDateToInput = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
};

export default formatDateToInput;