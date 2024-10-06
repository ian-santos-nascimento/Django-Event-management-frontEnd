import {useEffect, useState} from "react";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import {deleteData, postData, fetchDataWithoutPagination, putData,} from '../ApiCall/ApiCall.jsx'


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
    const PATH_LOCAL = 'locais'
    useEffect(() => {
            const fetchCidades = async () => {
                const response = await fetchDataWithoutPagination('cidadesWP')
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
        const response = await deleteData(PATH_LOCAL, localState.id_local);
        if (response.success) {
            alert("Local excluído com sucesso")
            window.location.reload();
        } else {
            alert("Houve um erro ao tentar excluir o Local! Por favor entre em contato com o suporte!")
        }
    }

    const voltar = () => {
        window.location.reload();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        var response;
        if (localState.id_local !== null) {
            response = putData(PATH_LOCAL, localState, localState.id_local)
        } else {
            response = postData(PATH_LOCAL, localState)
        }
        if (response.success) {
            localState.id_local !== null ? alert("Local editado com sucesso")
                : alert("Local salvo com sucesso!")
            window.location.reload();
        }else{
            alert("Houve um erro ao salvar o local. Por favor entre em contato com o suporte")
        }
    };

    return (
        <div className="container">
            <h2 className="text-center">Criar/Editar Localidade</h2>
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
