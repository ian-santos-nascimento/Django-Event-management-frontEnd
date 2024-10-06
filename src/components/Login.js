import React, {useState} from 'react';
import logo from '../bg-logo.png';
import {login} from "../ApiCall/authService";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

   const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await login(username, password);
            window.location.href = '/';
        } catch (error) {
            console.log(error)
            setErrorMessage('Credenciais inválidas');
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
