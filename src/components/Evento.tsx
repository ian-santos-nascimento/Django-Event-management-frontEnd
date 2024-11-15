import {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import {eventoPost, fetchData,} from '../ApiCall/ApiCall.jsx'
import {TIPO_EVENTO} from "../util/OptionList"

interface Evento {
    id_evento: number,
    codigo_evento: number,
    nome: string,
    tipo: string,
    descricao: string,
    observacao: string,
    qtd_dias_evento: number,
    qtd_pessoas: number,
    data_inicio: string,
    data_fim: string,
    local: number,
    clientes: number[]

}

interface Local {
    id_local: number,
    nome: string,
    cidade: number
}

interface Cliente {
    id_cliente: number
    cnpj: string,
    nome: string,
}


export default function Evento({evento, sessionId}) {
    const [locais, setLocais] = useState<Local[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filterCliente, setFilterCliente] = useState(''); // Estado para o filtro de clientes
    const [selectedEvento, setSelectedEvento] = useState<Evento>(evento)
    const [validated, setValidated] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});

    useEffect(() => {
            const fetchLocalApi = async () => {
                const response = await fetchData('locais', '', '')
                setLocais(response.data)
            };
            const fetchClienteApi = async () => {
                const response = await fetchData('clientes', '', '')
                setClientes(response.data)
            }
            fetchLocalApi()
            fetchClienteApi()
        }, [sessionId]
    );

    useEffect(() => {
        if (selectedEvento.local === null && locais[0] !== undefined) {
            setSelectedEvento(({...selectedEvento, local: locais[0].id_local}))

        }
    }, [locais]);

    const handleCodigoChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove qualquer caractere que não seja dígito
        if (value.length > 8) value = value.slice(0, 8); // Limita o valor a 8 dígitos

        if (value.length >= 5) {
            value = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
        } else if (value.length >= 3) {
            value = `${value.slice(0, 2)}.${value.slice(2)}`;
        }

        e.target.value = value; // Atualiza o valor no campo de entrada
        handleChange(e); // Chama a função de mudança original
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(selectedEvento.data_inicio)) {
            errors.data_inicio = 'Formato de data inválido. Use YYYY-MM-DD.';
        }
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
        } else {
            setValidated(true);
            await eventoPost(selectedEvento);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedEvento((prevEvento) => prevEvento ? {...prevEvento, [name]: value} : null);
    };

    const handleToggleCliente = (clienteId) => {
        const selectedClientes = selectedEvento?.clientes.includes(clienteId)
            ? selectedEvento.clientes.filter(id => id !== clienteId) // Remove se já estiver selecionado
            : [...selectedEvento.clientes, clienteId]; // Adiciona o cliente

        setSelectedEvento({
            ...selectedEvento,
            clientes: selectedClientes
        });
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(filterCliente.toLowerCase())
    );


    const handleBack = () => {
        window.location.reload()
    }

    return (
        <div className="container">
            <h2 className="text-center">Evento</h2>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            required
                            name="nome"
                            value={selectedEvento.nome}
                            onChange={handleChange}
                            type="text"
                            isInvalid={!!errorMessages.nome}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.nome}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCodigo">
                        <Form.Label>Código</Form.Label>
                        <Form.Control
                            required
                            onChange={handleCodigoChange}
                            value={selectedEvento.codigo_evento}
                            name="codigo_evento"
                            type="text"
                            isInvalid={!!errorMessages.codigo_evento}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.codigo_evento}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <Row>
                    <Form.Group as={Col} controlId="formGridDescricao">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            name="descricao"
                            value={selectedEvento.descricao}
                            onChange={handleChange}
                            as="textarea"
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridObservacao">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                            name="observacao"
                            value={selectedEvento.observacao}
                            onChange={handleChange}
                            as="textarea"
                        />
                    </Form.Group>
                </Row>

                <Row>
                    <Form.Group as={Col} controlId="formGridLocal">
                        <Form.Label>Local</Form.Label>
                        <Form.Select
                            required
                            name="local"
                            value={selectedEvento.local}
                            onChange={handleChange}
                            isInvalid={!!errorMessages.local}
                        >
                            <option value="">Selecione um local</option>
                            {locais.map((local) => (
                                <option key={local.id_local} value={local.id_local}>
                                    {local.nome}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.local}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridQtdPessoas">
                        <Form.Label>Qtd. Pessoas</Form.Label>
                        <Form.Control
                            required
                            onChange={handleChange}
                            value={selectedEvento.qtd_pessoas}
                            name="qtd_pessoas"
                            type="number"
                            min="1"
                            isInvalid={!!errorMessages.qtd_pessoas}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.qtd_pessoas}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <Row>
                    <Form.Group as={Col} controlId="formGridDataInicio">
                        <Form.Label>Data de Início</Form.Label>
                        <Form.Control
                            required
                            name="data_inicio"
                            type="date"
                            onChange={handleChange}
                            value={selectedEvento.data_inicio}
                            isInvalid={!!errorMessages.data_inicio}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.data_inicio}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridDataFim">
                        <Form.Label>Data Final</Form.Label>
                        <Form.Control
                            required
                            name="data_fim"
                            value={selectedEvento.data_fim}
                            onChange={handleChange}
                            type="date"
                            isInvalid={!!errorMessages.data_fim}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.data_fim}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridTipoEvento">
                        <Form.Label>Tipo de Evento</Form.Label>
                        <Form.Select
                            required
                            name="tipo"
                            value={selectedEvento.tipo}
                            onChange={handleChange}
                            isInvalid={!!errorMessages.tipo}
                        >
                            <option value="">Selecione um tipo</option>
                            {TIPO_EVENTO.map((tipo, index) => (
                                <option key={index} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.tipo}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <Form.Group controlId="formGridClientes">
                    <Form.Label>Clientes</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar Cliente..."
                        value={filterCliente}
                        onChange={(e) => setFilterCliente(e.target.value)}
                        style={{marginBottom: '10px'}}
                    />
                    <div
                        style={{
                            maxHeight: '150px',
                            overflowY: 'scroll',
                            border: '1px solid #ced4da',
                            padding: '10px'
                        }}
                    >
                        {filteredClientes.map((cliente) => (
                            <Form.Check
                                key={cliente.id_cliente}
                                type="checkbox"
                                label={`${cliente.nome} -- ${cliente.cnpj}`}
                                value={cliente.id_cliente}
                                checked={selectedEvento?.clientes.includes(cliente.id_cliente)}
                                onChange={() => handleToggleCliente(cliente.id_cliente)}
                            />
                        ))}
                    </div>
                    <Form.Control.Feedback type="invalid">
                        {errorMessages.clientes}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="mt-3 d-flex justify-content-between w-100">
                    <Button variant="secondary" onClick={handleBack} type="reset">
                        Retornar
                    </Button>
                    <Button variant="primary" type="submit">
                        {selectedEvento.id_evento === null ? 'Salvar' : 'Editar'}
                    </Button>
                </div>
            </Form></div>

    )
}