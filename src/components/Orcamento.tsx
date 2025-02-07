import {useEffect, useRef, useState} from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// @ts-ignore
import {fetchDataWithId, fetchDataWithoutPagination} from "../ApiCall/ApiCall.ts";
import {STATUS_ORCAMENTO} from "../util/OptionList"
// @ts-ignore
import LogisticaOrcamentoComp from "./LogisticaOrcamentoComp.tsx";
// @ts-ignore
import CardapioOrcamentoComp from "./CardapioOrcamentoComp.tsx";
import type {ComidaType, EventoType, LogisticaCidadeType, LogisticaType, OrcamentoType} from '../types';
// @ts-ignore
import ModalOrcamentoFinal from "./ModalOrcamentoFinal.tsx";


export default function Orcamento({eventoState, orcamentoState, sessionId}) {
    const [orcamento, setOrcamento] = useState<OrcamentoType>(orcamentoState ||
        {
            id_orcamento: null,
            nome: '',
            evento: null,
            cliente: null,
            observacoes: '',
            comidas: [],
            logisticas: [],
            valor_total: 0,
            status: STATUS_ORCAMENTO[0].value,
            valor_desconto_logisticas: 0,
            valor_total_comidas: 0,
            valor_desconto_comidas: 0,
            valor_total_logisticas: 0,
            valor_imposto: 0,
            descontos: {}
        })
    const [comidas, setComidas] = useState<ComidaType[]>([])
    const [comidasSelecionadas, setComidasSelecionadas] = useState<ComidaType[]>([]);
    const [logisticas, setLogisticas] = useState<LogisticaType[]>([])
    const [logisticaCidade, setLogisticaCidade] = useState<LogisticaCidadeType>()
    const [logisticasSelecionadas, setLogisticasSelecionadas] = useState<LogisticaType[]>([])
    const [evento, setEvento] = useState<EventoType>(eventoState)
    const [filter, setFilter] = useState('');
    const [filterLogistica, setFilterLogistica] = useState('');
    const isFirstRender = useRef(true);
    const [loadModalFinal, setLoadModalFinal] = useState(false)
    const [validated, setValidated] = useState(false);
    const [errorMessages, setErrorMessages] = useState({
        status: '',
        cliente: '',
        observacoes: '',
        comidasSelecionadas: '',
    });

    useEffect(() => {
        getModels();
    }, []);

    if (orcamento && !orcamento.descontos) {
        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            descontos: {} // Inicializa como objeto vazio
        }));
    }

    useEffect(() => {
        if (orcamento.comidas && comidas.length > 0) {
            const comidasSelecionadasTemp = orcamento.comidas.map(comidaOrcamento => {
                const comidaSelecionada = comidas.find(comida => comida.comida_id === comidaOrcamento.comida_id);
                if (comidaSelecionada) {
                    return {
                        ...comidaSelecionada,
                        quantidade: comidaOrcamento.quantidade,
                        valor: comidaOrcamento.valor
                    };
                }
                return null;
            }).filter(comida => comida !== null) as ComidaType[];
            setComidasSelecionadas(comidasSelecionadasTemp);
        }
    }, [orcamento.comidas, comidas])

    useEffect(() => {
        if (orcamento.logisticas && logisticas.length > 0) {
            const logisticaSelecionadaTemp = orcamento.logisticas.map(logisticaOrcamento => {
                const logisticaSelecionada = logisticas.find(logistica => logistica.id_logistica === logisticaOrcamento.id);
                if (logisticaSelecionada) {
                    return {
                        ...logisticaSelecionada,
                        quantidade: logisticaOrcamento.quantidade
                    };
                }
                return null;
            }).filter(logistica => logistica !== null) as LogisticaType[];
            setLogisticasSelecionadas(logisticaSelecionadaTemp);
        }

    }, [logisticas]);

    useEffect(() => {
        if (!evento.clientes || evento) {
            const eventoResponse = async () => {
                const response = await fetchDataWithId('eventos', eventoState.id_evento)
                setEvento(response.data as EventoType)
                if (!orcamento.evento) {
                    setOrcamento({...orcamento, evento: eventoState.id_evento})
                }
            }
            eventoResponse()
        }
    }, []);


    useEffect(() => {
        if (evento && evento.local && evento.local.cidade) {
            getLogisticaCidade()
            if (!orcamento.cliente)
                setOrcamento({...orcamento, cliente: evento.clientes[0]})
        }
    }, [evento]);

    useEffect(() => {
        setInterval(() => {
            if (isFirstRender.current || orcamento.id_orcamento) {
                isFirstRender.current = false
                return
            }
        }, 5000)
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const errors = {

        };
        if (!orcamento.status || orcamento.status.trim() === '') {
            errors.status = 'Por favor, selecione o status do orçamento.';
        }
        if (!orcamento.observacoes || orcamento.observacoes.trim() === '') {
            errors.observacoes = 'Por favor, adicione uma observação.';
        }
        if (!orcamento.cliente || !orcamento.cliente.id_cliente) {
            errors.cliente = 'Por favor, selecione um cliente.';
        }
        if (!orcamento.comidas || orcamento.comidas.length === 0) {
            errors.comidasSelecionadas = 'Por favor, selecione ao menos uma comida.';
        }
        setErrorMessages(errors);
        setValidated(true);

        // Se não houver erros, prossegue para atualizar a variável
        if (Object.keys(errors).length === 0) {
            handleShowModalFinal();
        }
    };

    const handleBack = () => {
        window.location.reload()
    }

    async function getLogisticaCidade() {
        if (evento && evento.local && evento.local.cidade !== null) {
            try {
                const response = await fetchDataWithId('logistica-cidade', evento.local.cidade);
                setLogisticaCidade(response.data as LogisticaCidadeType);
            } catch (e) {
                console.error('Error fetching LogisticaCidade:', e);
            }
        }
    }

    async function getModels() {
        const logisticasResponse = await fetchDataWithoutPagination('logisticasWP');
        setLogisticas(logisticasResponse.data as LogisticaType[]);

        const comidasResponse = await fetchDataWithoutPagination('comidasWP');
        setComidas(comidasResponse.data as ComidaType[]);
    }


    const handleToggleCliente = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selectedItem = evento.clientes.find(cliente => cliente.id_cliente === selectedId);
        isFirstRender.current = false;

        if (selectedItem) {
            setOrcamento(prevOrcamento => ({
                ...prevOrcamento,
                cliente: selectedItem
            }));
        }
    };
    const handleShowModalFinal = () => {
        setLoadModalFinal(true)
    }

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const {name, value} = e.target;
        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            [name]: value
        }));
        isFirstRender.current = false;
    };


    if (loadModalFinal) {
        return <ModalOrcamentoFinal orcamento={orcamento}
                                    cardapioSelecionado={comidasSelecionadas} evento={evento}
                                    logisticaCidade={logisticaCidade} setOrcamento={setOrcamento}
                                    showModal={loadModalFinal} setShowModal={setLoadModalFinal} sessionId={sessionId}/>
    }

    return (
        <div className='container'>
            <h2 className='text-center'>Orçamento</h2>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                    <Form.Group className="mb-3" as={Col} controlId="formGridClientes">
                        <Form.Label>Cliente do Evento para Orçamento</Form.Label>
                        <Form.Select
                            name="cliente"
                            value={orcamento?.cliente?.id_cliente || ''}
                            onChange={handleToggleCliente}
                            isInvalid={!!errorMessages.cliente}
                        >
                            <option value="">Selecione um cliente</option>
                            {evento.clientes.map((cliente) => (
                                <option
                                    key={cliente.id_cliente}
                                    value={cliente.id_cliente}
                                >
                                    {cliente.nome}
                                    {` - Taxa(${cliente.taxa_financeira * 100}%)`}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.cliente}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row>

                    <Form.Group as={Col} controlId="formGridStatus">
                        <Form.Label>Status do Orçamento</Form.Label>
                        <Form.Select
                            name="status"
                            value={orcamento.status}
                            onChange={handleChange}
                            isInvalid={!!errorMessages.status}
                        >
                            <option value="">Selecione o status</option>
                            {STATUS_ORCAMENTO.map((status, index) => (
                                <option key={index} value={status.value}>
                                    {status.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.status}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridObservacoes">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                            name="observacoes"
                            required
                            isInvalid={!!errorMessages.observacoes}
                            value={orcamento.observacoes}
                            onChange={handleChange}
                            as="textarea"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errorMessages.observacoes}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>


                {/* Componentes para Cardápio e Logística */}
                <CardapioOrcamentoComp
                    cardapio={comidas}
                    logisticaCidade={logisticaCidade}
                    selectedCardapio={comidasSelecionadas}
                    setOrcamento={setOrcamento}
                    orcamento={orcamento}
                    evento={evento}
                    setSelectedCardapio={setComidasSelecionadas}
                />
                {errorMessages.comidasSelecionadas && (
                    <div className="text-danger">
                        {errorMessages.comidasSelecionadas}
                    </div>
                )}

                <LogisticaOrcamentoComp
                    orcamento={orcamento}
                    setOrcamento={setOrcamento}
                    logisticaCidade={logisticaCidade}
                    evento={evento}
                    logisticas={logisticas}
                    filterLogisticaState={filterLogistica}
                    logisticasSelecionadas={logisticasSelecionadas}
                    setLogisticasSelecionadas={setLogisticasSelecionadas}
                />

                <div className="mt-3 mb-3 d-flex justify-content-between w-100">
                    <Button className="mt-3" variant="secondary" onClick={handleBack} type="reset">
                        Retornar
                    </Button>
                    <Button className="mt-3" variant="primary" type="submit">
                        Prosseguir
                    </Button>
                </div>
            </Form>
        </div>
    )

}