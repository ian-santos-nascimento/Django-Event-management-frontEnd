import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;


export const fetchData = async (data, page, search = '', csrfToken, sessionId) => {
    page = page !== null ? '?page=' + page : '';
    try {
        const response = await axios.get(`${API_URL}${data}/${page}&search=${search}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return {
            data: response.data.results,
            count: response.data.count
        };
    } catch (error) {
        console.error('Error fetching API:', error);
        return {
            data: [],
            count: 0
        }
    }
}


export const fetchDataWithoutPagination = async (data, csrfToken, sessionId) => {
    try {
        const response = await axios.get(`${API_URL}${data}/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return {
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching clientes:', error);
        return {
            data: [],
        }
    }
}

export const fetchDataWithId = async (data, id) => {
    try {
        const response = await axios.get(`${API_URL}${data}/${id}`)
        return {
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching clientes:', error);
        return {
            data: [],
        }
    }
}
export const excludeData = async (path, id, csrfToken, sessionId) => {
    try {
        const response = await axios.delete(`${API_URL}${path}/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return {success: true, data: response.data};
    } catch (error) {
        alert(error.response?.data?.error || "Ocorreu um erro ao excluir o dado.");
        return {success: false, data: null};
    }
};

export const eventoPost = async (evento, csrfToken, sessionId) => {
    try {
        if (evento.id_evento !== null) {
            await axios.put(`${API_URL}eventos/${evento.id_evento}/`, evento, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            alert('Evento updated successfully!');
        } else {
            await axios.post(`${API_URL}eventos/`, evento, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            alert('Evento created successfully!');
        }
        window.location.reload();
    } catch (error) {
        console.error('Error updating Evento:', error);
        alert('Failed to update Evento.');
    }
}
