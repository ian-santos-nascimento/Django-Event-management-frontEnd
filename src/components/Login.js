// Login.js

import React, {useEffect, useState} from 'react';
import axios from 'axios';
import logo from '../bg-logo.png';
const API_URL = process.env.REACT_APP_API_URL
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const login = axios.create({baseURL: API_URL})

const Login = ({setAuthenticated, setSessionId}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        // Obter o CSRF token ao montar o componente
        login.get('get-csrf-token/', {withCredentials: true})
            .then(response => {
                const token = response.data.csrfToken;
                setCsrfToken(token)
            })
            .catch(error => {
                console.error('Erro ao obter CSRF token:', error);
            });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log("CSRF Token:", csrfToken);
            const responseData = await login.post('login/', {
                    username: username,
                    password: password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken // Enviar o token CSRF no header
                    }
                }
            );
            setAuthenticated(true);
            setSessionId(responseData.headers.get('sessionid'));

        } catch (error) {
            if (error.response && error.response.data) {
                const errorMessage = Array.isArray(error.response.data) ? error.response.data[0] : 'Invalid credentials';
                setErrorMessage(errorMessage);
            } else {
                setErrorMessage('Something went wrong. Please try again.');
            }
            console.error('Error logging in:', error);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card p-4 shadow" style={{maxWidth: '400px', width: '100%'}}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-center mb-4">Faça o Login</h2>
                    <div className="text-center mb-4">
                        <img src={logo} alt="Logo" className="img-fluid" style={{maxHeight: '100px'}}/>
                    </div>
                    {errorMessage && (
                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                            {errorMessage}
                            <button type="button" className="btn-close" data-bs-dismiss="alert"
                                    aria-label="Close"></button>
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Nome do Usuário</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Digite seu nome de usuário"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Senha</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
