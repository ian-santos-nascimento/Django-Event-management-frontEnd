import {useEffect, useState} from "react";
import axios from "axios";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import csrfToken from "../ApiCall/CsrfToken";
import {fetchData, fetchDataWithoutPagination,} from '../ApiCall/ApiCall.jsx'

const API_URL = process.env.REACT_APP_API_URL;

interface Local {
    id_local: string,
    nome: string,
    endereco: string,
    telefone: string,
    email: string,
    observacoes: string,
    cidade: number
}

interface Cidade {
    id_cidade: string;
    nome: string;
    estado: string;
    taxa_deslocamento: number;
}

export default function Local({local, sessionId}) {
    const [localState, setLocalState] = useState<Local>(local);
    const [cidades, setCidades] = useState<Cidade[]>([]);

    useEffect(() => {
            const fetchCidades = async () => {
                const response = await fetchDataWithoutPagination('cidadesWP', csrfToken, sessionId)
                setCidades(response.data)
            }
            fetchCidades()
        }, [sessionId]
    );

    const handleChange = (e) => {
        const {name, value} = e.target;
        setLocalState((prevLocal) => ({
            ...prevLocal,
            [name]: value,
        }));
    };

    const handleCityChange = (e) => {
        const {value} = e.target;
        setLocalState((prevLocal) => ({
            ...prevLocal,
            cidade: parseInt(value, 10),
        }));
    };

    const handleExcluirLocal = async () => {
        try {
            await axios.delete(`${API_URL}locais/${localState.id_local}/`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
            alert('Local removed successfully!');

        } catch (error) {
            console.error('Error updating local:', error);
            alert('Failed to update local.');
        }
        window.location.reload();

    }

    const voltar = () =>{
        window.location.reload();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (local.id_local === null) {
                await axios.post(`${API_URL}locais/`, localState, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                })
                alert('Local created successfully!');
            } else {
                await axios.put(`${API_URL}locais/${local.id_local}/`, localState, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                alert('Local updated successfully!');
            }
        } catch (error) {
            console.error('Error updating local:', error);
            alert('Failed to update local.');
        }
        window.location.reload();
    };

    return (
        <div className="container">
            <h2 className="text-center">Criar/Editar  Localidade</h2>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            name="nome"
                            value={localState.nome}
                            onChange={handleChange}
                            type="text"
                            placeholder="Nome"
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            name="email"
                            value={localState.email}
                            onChange={handleChange}
                            type="text"
                        />
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridEndereco">
                    <Form.Label>Endereço</Form.Label>
                    <Form.Control
                        name="endereco"
                        value={localState.endereco}
                        onChange={handleChange}
                        placeholder="Av.Paulista nª100"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridObservacoes">
                    <Form.Label>Observações</Form.Label>
                    <Form.Control
                        name="observacoes"
                        value={localState.observacoes}
                        onChange={handleChange}
                        as="textarea"
                    />
                </Form.Group>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridTelefone">
                        <Form.Label>Telefone</Form.Label>
                        <Form.Control
                            name="telefone"
                            value={localState.telefone}
                            onChange={handleChange}
                            type="text"
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCidadeNome">
                        <Form.Label>Cidade</Form.Label>
                        <Form.Select
                            name="cidade"
                            value={localState.cidade}  // Set the default value
                            onChange={handleCityChange}
                        >
                            {cidades.map(cidade => (
                                <option key={cidade.id_cidade} value={cidade.id_cidade}>
                                    {cidade.nome}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Row>

                <div className="d-flex justify-content-between w-100">
                    {local.id_local === null && (
                         <Button
                                variant="secondary"
                                type="button" onClick={voltar}>
                            Voltar
                        </Button>
                    )}
                    {local.id_local !== null && (
                        <Button
                                variant="danger"
                                type="button" onClick={handleExcluirLocal}>
                            Excluir
                        </Button>
                    )}
                    <Button variant="primary" type="submit">
                        {local.id_local === null ? 'Criar' : 'Editar'}
                    </Button>
                </div>

            </Form>
        </div>
    );
}
