import {useEffect, useState} from "react";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import {Alert} from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import InputMask from 'react-input-mask';
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
    const [validated, setValidated] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
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

    const handleCityChange = (event) => {
        const {name, value} = event.target;
        setLocalState({
            ...localState,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        setErrorMessages({});
        setSuccessMessage('');
        if (form.checkValidity() === false) {
            setValidated(true);
        } else {
            setValidated(true);
            var response;
            if (localState.id_local !== null) {
                response = await putData(PATH_LOCAL, localState, localState.id_local)
            } else {
                response = await postData(PATH_LOCAL, localState)
            }
            if (response.success) {
                localState.id_local !== null ? alert("Local editado com sucesso")
                    : alert("Local salvo com sucesso!")
                window.location.reload();
            } else {
                alert("Houve um erro ao salvar o local. Por favor entre em contato com o suporte")
            }
        }
    };

    return (
        <div className="container">
            <h2 className="text-center">Criar/Editar Localidade</h2>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            required
                            name="nome"
                            value={localState.nome}
                            onChange={handleChange}
                            type="text"
                            placeholder="Nome"
                            isInvalid={!!errorMessages.nome}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.nome || 'Por favor, insira seu nome.'}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            required
                            name="email"
                            value={localState.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="Email"
                            isInvalid={!!errorMessages.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.email || 'Por favor, insira um email válido.'}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridEndereco">
                    <Form.Label>Endereço</Form.Label>
                    <Form.Control
                        required
                        name="endereco"
                        value={localState.endereco}
                        onChange={handleChange}
                        placeholder="Av. Paulista nº 100"
                        isInvalid={!!errorMessages.endereco}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errorMessages.endereco || 'Por favor, insira seu endereço.'}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridObservacoes">
                    <Form.Label>Observações</Form.Label>
                    <Form.Control
                        name="observacoes"
                        value={localState.observacoes}
                        onChange={handleChange}
                        as="textarea"
                        rows={3}
                    />
                </Form.Group>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridTelefone">
                        <Form.Label>Telefone</Form.Label>
                        <InputMask
                            mask="(99)99999-9999"
                            value={localState.telefone}
                            onChange={handleChange}
                            maskChar="_"
                        >
                            {(inputProps) => (
                                <Form.Control
                                    {...inputProps}
                                    required
                                    name="telefone"
                                    type="text"
                                    placeholder="(00) 00000-0000"
                                    isInvalid={!!errorMessages.telefone}
                                />
                            )}
                        </InputMask>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.telefone || 'Por favor, insira um telefone válido no formato (99)99999-9999.'}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCidadeNome">
                        <Form.Label>Cidade</Form.Label>
                        <Form.Select
                            required
                            name="cidade"
                            value={localState.cidade}
                            onChange={handleCityChange}
                            isInvalid={!!errorMessages.cidade}
                        >
                            <option value="">Selecione uma cidade</option>
                            {cidades.map((cidade) => (
                                <option key={cidade.id_cidade} value={cidade.id_cidade}>
                                    {cidade.nome}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.cidade || 'Por favor, selecione uma cidade.'}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <div className="d-flex justify-content-between w-100">
                    {local.id_local === null && (
                        <Button variant="secondary" type="button" onClick={voltar}>
                            Voltar
                        </Button>
                    )}
                    {local.id_local !== null && (
                        <Button variant="danger" type="button" onClick={handleExcluirLocal}>
                            Excluir
                        </Button>
                    )}
                    <Button variant="primary" type="submit">
                        {local.id_local === null ? 'Criar' : 'Editar'}
                    </Button>
                </div>
            </Form></div>
    );
}
