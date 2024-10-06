import axiosInstance from './authService';


export const fetchData = async (data, page, search = '') => {
    page = page !== null ? '?page=' + page : '';

    try {
        const response = await axiosInstance.get(`${data}/${page}&search=${search}`
        );
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


export const fetchDataWithoutPagination = async (data) => {
    try {
        const response = await axiosInstance.get(`${data}/`, {
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
        const response = await axiosInstance.get(`${data}/${id}`)
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
export const deleteData = async (path, id) => {
    try {
        const response = await axiosInstance.delete(`${path}/${id}`);
        return {success: true, data: response.data};
    } catch (error) {
        alert(error.response?.data?.error || "Ocorreu um erro ao excluir o dado.");
        return {success: false, data: null};
    }
};

export const postData = async (path, data) => {
    try {
        const response = await axiosInstance.post(`${path}/`, data,);
        return {success: true, data: response.data};
    } catch (error) {
        alert(error.response?.data?.error || "Ocorreu um erro ao salvar o dado.");
        return {success: false, data: null};
    }
};

export const putData = async (path, data, id) => {
    try {
        const response = await axiosInstance.put(`${path}/${id}/`, data,);
        return {success: true, data: response.data};
    } catch (error) {
        alert(error.response?.data?.error || "Ocorreu um erro ao atualizar o dado.");
        return {success: false, data: null};
    }
};

export const eventoPost = async (evento) => {
    try {
        if (evento.id_evento !== null) {
            await axiosInstance.put(`eventos/${evento.id_evento}/`, evento, );
            alert('Evento updated successfully!');
        } else {
            await axiosInstance.post(`eventos/`, evento, );
            alert('Evento created successfully!');
        }
        window.location.reload();
    } catch (error) {
        console.error('Error updating Evento:', error);
        alert('Failed to update Evento.');
    }
}
