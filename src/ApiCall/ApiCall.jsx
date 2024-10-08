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
        console.log(error.response?.data?.error || error)
        return {success: false, data: null};
    }
};

export const postData = async (path, data) => {
    try {
        const response = await axiosInstance.post(`${path}/`, data,);
        return {success: true, data: response.data};
    } catch (error) {
        alert(error.response?.data?.error || "Ocorreu um erro ao salvar o dado.");
        console.log(error.response?.data?.error || error)
        return {success: false, data: null};
    }
};

export const putData = async (path, data, id) => {
    try {
        const response = await axiosInstance.put(`${path}/${id}/`, data,);
        return {success: true, data: response.data};
    } catch (error) {
        alert(error.response?.data?.error || "Ocorreu um erro ao atualizar o dado.");
        console.log(error.response?.data?.error || error)
        return {success: false, data: null};
    }
};

export const eventoPost = async (evento) => {
    try {
        var response;
        if (evento.id_evento !== null) {
            response = await axiosInstance.put(`eventos/${evento.id_evento}/`, evento,);
        } else {
            response = await axiosInstance.post(`eventos/`, evento,);
        }
        evento.id_evento !== null ? alert('Evento editado com sucesso!') : alert('Evento criado com sucesso!');
        window.location.reload();
    } catch (error) {
        if (error.response) {
            // A requisição foi feita e o servidor respondeu com um status code fora do alcance de 2xx
            const data = error.response.data;
            console.error('Erro na resposta da API:', data);

            let errorMessage = '';

            if (data.codigo_evento) {
                errorMessage += `Erro no código do evento: ${data.codigo_evento.join(' ')}\n`;
            } else {
                errorMessage = 'Ocorreu um erro ao submeter o evento. Por favor, tente novamente.';
            }
            alert(errorMessage);
        } else if (error.request) {
            // A requisição foi feita mas nenhuma resposta foi recebida
            console.error('Nenhuma resposta recebida da API:', error.request);
            alert('Não foi possível conectar ao servidor. Por favor, verifique sua conexão e tente novamente.');
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Erro ao configurar a requisição:', error.message);
            alert('Ocorreu um erro inesperado. Por favor, tente novamente.');
        }
    }
}


export const orcamentoPost = async (orcamento) => {
    try {
        await axiosInstance.post(`orcamentos-create/`, orcamento);
        alert('Evento criado com sucesso!');
        window.location.reload();
    } catch (error) {
        if (error.response) {
            const data = error.response.data;
            console.error('Erro na resposta da API:', data);
            let errorMessage = '';
            if (data.status) {
                errorMessage += `Erro no status do evento: Já existe um Orçamento para o status "${orcamento.status}"`;
            } else {
                errorMessage = 'Ocorreu um erro ao submeter o evento. Por favor, tente novamente.';
            }
            alert(errorMessage);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida da API:', error.request);
            alert('Não foi possível conectar ao servidor. Por favor, verifique sua conexão e tente novamente.');
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
            alert('Ocorreu um erro inesperado. Por favor, tente novamente e entre em contato com o suporte.');
        }
    }
    return {success: false, data: null};
}

