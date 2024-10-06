// authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // URL do seu backend Django

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Variável para rastrear se a atualização do token está em andamento
let isRefreshing = false;

// Fila de requisições que aguardam a atualização do token
let failedQueue = [];

// Função para processar a fila após a atualização do token
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Função para fazer login
export const login = async (username, password) => {
    const response = await axiosInstance.post('/api/token/', {
        username,
        password,
    });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
    return response.data;
};

// Função para fazer logout
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    axiosInstance.defaults.headers['Authorization'] = null;
};

// Função para atualizar o access token
const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: refreshToken,
    });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
    return response.data.access;
};

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para lidar com erros de resposta (por exemplo, 401)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        // Verifique se a resposta foi 401 e se a requisição não é para refresh token
        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/token/refresh/')) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({resolve, reject});
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axiosInstance(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
                try {
                    const newAccessToken = await refreshToken();
                    processQueue(null, newAccessToken);
                    resolve(axiosInstance(originalRequest));
                } catch (err) {
                    processQueue(err, null);
                    logout(); // Limpa tokens e redireciona para login
                    reject(err);
                } finally {
                    isRefreshing = false;
                }
            });
        }

        console.log("FAILED QUEUE", failedQueue, "IS REFRESHING", isRefreshing);
        return Promise.reject(error);
    }
);

export default axiosInstance;
