export const formatDateToISO = (dateString: string): string => {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`; // Retorna no formato yyyy-MM-dd
};

export const formatDateToBackend = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Retorna no formato dd-MM-yyyy
};
