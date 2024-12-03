import {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import {eventoPost, fetchData,} from '../ApiCall/ApiCall.jsx'
import {TIPO_EVENTO, TIPO_TRANSPORTE} from "../util/OptionList"
import {ClienteType, EventoType, LocalType} from "../types";
// @ts-ignore
import {formatDateToBackend, formatDateToISO} from "../util/utils.ts";

export default function Evento({evento, sessionId}) {
    const [locais, setLocais] = useState<LocalType[]>([]);
    const [clientes, setClientes] = useState<ClienteType[]>([]);
    const [filterCliente, setFilterCliente] = useState('');
    const [selectedEvento, setSelectedEvento] = useState<EventoType>(evento)
    const [validated, setValidated] = useState(false);
    const [errorMessages, setErrorMessages] = useState({
        nome: '',
        codigo_evento: '',
        local: '',
        transporte: '',
        qtd_pessoas: '',
        data_fim: '',
        data_inicio: '',
        tipo: '',
        clientes: '',

    });

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
        if (selectedEvento.local === null && locais !== undefined && locais.length > 0) {
            // @ts-ignore
            setSelectedEvento(({...selectedEvento, local: locais[0].id_local}))
        }
        setSelectedEvento({...selectedEvento, local: evento.local.id_local})
    }, [locais]);

    const handleCodigoChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        if (value.length >= 5) {
            value = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
        } else if (value.length >= 3) {
            value = `${value.slice(0, 2)}.${value.slice(2)}`;
        }

        e.target.value = value;
        handleChange(e);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const errors: Record<string, string> = {};


        if (!selectedEvento.local) {
            errors.local = 'O campo "Local" é obrigatório.';
        }
        if (!selectedEvento.tipo) {
            errors.tipo = 'O campo "Tipo de Evento" é obrigatório.';
        }
        if (selectedEvento.qtd_pessoas < 1) {
            errors.qtd_pessoas = 'A quantidade de pessoas deve ser maior que 0.';
        }
        if (!Array.isArray(selectedEvento.clientes) || selectedEvento.clientes.length < 1) {
            errors.clientes = 'Selecione ao menos um cliente.';
        }
        // @ts-ignore
        setErrorMessages(errors);
        const form = e.currentTarget;
        if (form.checkValidity() === false || Object.keys(errors).length > 0) {
            setValidated(false);
        } else {
            setSelectedEvento(({
                ...selectedEvento, data_inicio: formatDateToBackend(selectedEvento.data_inicio),
                data_fim: formatDateToBackend(selectedEvento.data_fim)
            }))
            console.log("EVENTO", selectedEvento)
            setValidated(true);
            try {
                await eventoPost(selectedEvento);
            } catch (error) {
                console.error('Erro ao salvar evento:', error);
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedEvento((prevEvento) => prevEvento ? {...prevEvento, [name]: value} : null);
    };

    const handleToggleCliente = (clienteParam: ClienteType) => {
        const selectedClientes = selectedEvento?.clientes.some(clienteEvento => clienteEvento.id_cliente === clienteParam.id_cliente)
            ? selectedEvento.clientes.filter(cliente => cliente.id_cliente !== clienteParam.id_cliente) // Remove se já estiver selecionado
            : [...selectedEvento.clientes, clienteParam];

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
                    <Form.Group as={Col} controlId="formGridTransporteEvento">
                        <Form.Label>Transporte do Evento</Form.Label>
                        <Form.Select
                            required
                            name="transporte"
                            value={selectedEvento.transporte}
                            onChange={handleChange}
                            isInvalid={!!errorMessages.transporte}
                        >
                            <option value="">Selecione um tipo</option>
                            {TIPO_TRANSPORTE.map((tipo, index) => (
                                <option key={index} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.transporte}
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
                            padding: '10px',
                        }}
                    >
                        {filteredClientes.map((cliente) => (
                            <Form.Check
                                key={cliente.id_cliente}
                                type="checkbox"
                                label={`${cliente.nome} -- ${cliente.cnpj}`}
                                value={cliente.id_cliente}
                                checked={selectedEvento?.clientes.some((clientEvento: ClienteType) => clientEvento?.id_cliente === cliente?.id_cliente)}
                                onChange={() => handleToggleCliente(cliente)}
                                isInvalid={!!errorMessages.clientes}
                            />
                        ))}
                    </div>
                    {errorMessages.clientes && (
                        <div className="invalid-feedback" style={{display: 'block'}}>
                            {errorMessages.clientes}
                        </div>
                    )}
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