import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import axios from "axios";
import csrfToken from '../ApiCall/CsrfToken'
import Modal from "react-bootstrap/Modal";
import {useEffect, useState} from "react";
import {OverlayTrigger, Tooltip, Button} from 'react-bootstrap';
import {faCheck, faTimes,} from "@fortawesome/free-solid-svg-icons";

import {
    CardapioOrcamentoType,
    ComidaType,
    EventoType,
    LogisticaCidadeType,
    LogisticaType,
    OrcamentoType
} from "../types";
import {Accordion} from "react-bootstrap";
import verificarLogistica from "../util/CalculoOrcamento.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const API_URL = process.env.REACT_APP_API_URL;

interface Props {
    cardapioSelecionado: ComidaType[];
    logisticasSelecionadas: LogisticaType[];
    orcamento: OrcamentoType;
    setOrcamento: React.Dispatch<React.SetStateAction<OrcamentoType>>;
    evento: EventoType;
    showModal: boolean;
    logisticaCidade: LogisticaCidadeType,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    sessionId: string
}

const ModalOrcamentoFinal: React.FC<Props> = ({
                                                  orcamento,
                                                  setOrcamento,
                                                  showModal,
                                                  setShowModal,
                                                  cardapioSelecionado,
                                                  logisticasSelecionadas,
                                                  logisticaCidade,
                                                  evento,
                                                  sessionId
                                              }) => {

    const dias_evento = evento.qtd_dias_evento + 1
    const frete = verificarLogistica(cardapioSelecionado, logisticaCidade).frete
    const locomocao = verificarLogistica(cardapioSelecionado, logisticaCidade).locomocao * dias_evento

    useEffect(() => {
        const valor_cardapio = parseFloat(orcamento.valor_total_comidas + (orcamento.valor_total_comidas * logisticaCidade?.taxa_deslocamento)) || 0
        const total_logisticas = parseFloat(orcamento.valor_total_logisticas) | 0
        const decoracaoCompleta = cardapioSelecionado.some(cardapio => cardapio.tipo === 'Intervalo_Doce' || cardapio.tipo === 'Intervalo_Salgado' ||
            cardapio.tipo === 'Almoço')
        const adicional_decoracao = decoracaoCompleta ? 800 : 400
        var total = valor_cardapio + total_logisticas + adicional_decoracao + parseFloat(frete) + parseFloat(locomocao)
        const valor_imposto = total * 0.2
        total += valor_imposto
        total += (total * orcamento.cliente.taxa_financeira)
        setOrcamento({
            ...orcamento,
            valor_total: total,
            valor_total_comidas: valor_cardapio,
            valor_imposto: valor_imposto,
            valor_decoracao: adicional_decoracao,
            evento: evento
        })
    }, []);

    const renderTooltipDiaria = (props) => (
        <Tooltip id="button-tooltip" {...props} style={{
            ...props.style
        }}>
            {Object.entries(logisticaCidade).filter(([key]) => ['frete_proprio', 'frete_proprio_intervalo', 'frete_proprio_completo',
                , 'frete_terceiros',].includes(key))
                .map(([key, value]) => (
                    <li style={{}} key={key}>
                        {`${key}: R$${value}`}
                        {value === frete &&
                            <Button style={{blockSize: '30px', padding: '0px'}} disabled><FontAwesomeIcon
                                icon={faCheck}/></Button>}
                    </li>
                ))}
        </Tooltip>
    );

    const renderTooltipLocomoacao = (props) => (
        <Tooltip id="button-tooltip" {...props} style={{
            ...props.style,
        }}>
            {Object.entries(logisticaCidade).filter(([key]) => ['diaria_completo', 'diaria_simples'].includes(key))
                .map(([key, value]) => (
                    <li style={{}} key={key}>
                        {`${key}: R$${value}`}
                        {value * dias_evento === (locomocao) &&
                            <Button style={{blockSize: '30px', padding: '0px'}} disabled><FontAwesomeIcon
                                icon={faCheck}/></Button>}
                    </li>
                ))}
        </Tooltip>
    );


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}orcamentos-create/`, orcamento, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            })
            alert('Orcamento created successfully!');
            window.location.reload()
        } catch (exception) {
            if (exception.response && exception.response.data && exception.response.data.error) {
                alert(exception.response.data.error);
            } else {
                alert('Não foi possível salvar o Orçamento');
            }
            console.log("Error tentando salvar orcamento", orcamento, '\n erro:', exception);
        }
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }


    return (
        <Modal size={"lg"} show={showModal} onHide={handleCloseModal}>
            <div>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Orçamento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <Row>
                            <Form.Group as={Col} controlId="formGridNome">
                                <Form.Label>Valor total (Imposto e taxa
                                    de {orcamento?.cliente.taxa_financeira * 100}% do cliente)</Form.Label>
                                <Form.Control
                                    name="valor_total"
                                    disabled
                                    value={`R$${parseFloat(orcamento.valor_total).toFixed(2)}`}
                                    type="text"
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridNome">
                                <Form.Label>Valor imposto (20%)</Form.Label>
                                <Form.Control
                                    name="valor_imposto"
                                    disabled
                                    value={`R$${parseFloat(orcamento.valor_imposto || 0).toFixed(2)}`}
                                    type="text"
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="formGridNome">
                                <Form.Label>Valor da decoração</Form.Label>
                                <Form.Control
                                    name="valor_decoracao"
                                    disabled
                                    value={`R$${parseFloat(orcamento.valor_decoracao || 0).toFixed(2)}`}
                                    type="text"
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridNome">
                                <Form.Label>Valor de locomoção</Form.Label>
                                <OverlayTrigger
                                    placement="bottom"
                                    delay={{show: 250, hide: 500}}
                                    overlay={renderTooltipLocomoacao}
                                >
                                    <Button variant="secondary" size={"sm"} style={{marginLeft: '10px'}}>i</Button>
                                </OverlayTrigger>
                                <Form.Control
                                    name="valor_decoracao"
                                    disabled
                                    value={`R$${parseFloat(locomocao || 0).toFixed(2)}`}
                                    type="text"
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridNome">
                                <Form.Label>Valor frete</Form.Label>
                                <OverlayTrigger
                                    placement="right"
                                    delay={{show: 250, hide: 500}}
                                    overlay={renderTooltipDiaria}
                                >
                                    <Button variant="secondary" size={"sm"} style={{marginLeft: '10px'}}>i</Button>
                                </OverlayTrigger>
                                <Form.Control
                                    name="valor_frete"
                                    disabled
                                    value={`R$${parseFloat(frete || 0).toFixed(2)}`}
                                    type="text"
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="formGridNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    name="nome"
                                    value={orcamento.nome}
                                    disabled
                                    type="text"
                                    placeholder="Nome"
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridStatus">
                                <Form.Label>Status do Orçamento</Form.Label>
                                <Form.Control
                                    name="status"
                                    disabled
                                    value={orcamento.status}
                                >
                                </Form.Control>
                            </Form.Group>
                            <Row>
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Observações</Form.Label>
                                    <Form.Control
                                        name="observacoes"
                                        disabled
                                        value={orcamento.observacoes}
                                        as="textarea"
                                    />
                                </Form.Group>
                            </Row>
                        </Row>
                        <Row>
                            <Accordion>
                                <Accordion.Item as={'p'} eventKey="0" className='mt-3'>
                                    <Accordion.Header as={'h5'}>Comidas:
                                        R${orcamento.valor_total_comidas | 0} ({logisticaCidade?.taxa_deslocamento * 100}% taxa de
                                        deslocamento incluso)</Accordion.Header>
                                    <Accordion.Body style={{backgroundColor: '##aab0b5;'}}>
                                        {orcamento.comidas.map(comida => (
                                            <p>{comida.comida} (Qtd: {comida.quantidade}, valor:
                                                R${parseFloat(comida.valor).toFixed(2)})</p>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item as={'p'} eventKey="1" className='mt-3'>
                                    <Accordion.Header
                                        as={'h5'}>Logisticas:
                                        R${orcamento.valor_total_logisticas | 0}</Accordion.Header>
                                    <Accordion.Body style={{backgroundColor: '##aab0b5;'}}>
                                        {orcamento.logisticas.map(logistica => (
                                            <p>{logistica.logistica} (Qtd: {logistica.quantidade},
                                                Diária: {parseFloat(logistica.valor).toFixed(2)})</p>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item as={'p'} eventKey="2" className='mt-3'>
                                    <Accordion.Header style={{backgroundColor: '#aab0b5', color: 'white'}}
                                                      as={'h5'}>Evento</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Nome/Coodigo: {evento.nome}-{evento.codigo_evento}</p>
                                        <p>Data: {evento.data_inicio} | {evento.data_fim}</p>
                                        <p>Dias: {evento.qtd_dias_evento} </p>
                                        <p>Descrição: {evento.descricao} </p>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item as={'p'} eventKey="3" className='mt-3'>
                                    <Accordion.Header style={{backgroundColor: '#aab0b5', color: 'white'}}
                                                      as={'h5'}>Cliente</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Nome: {orcamento.cliente.nome}</p>
                                        <p>Taxa Financeira: {orcamento.cliente.taxa_financeira * 100}% </p>
                                        <p>CNPJ: {orcamento.cliente.cnpj} </p>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Row>

                        <Button className={'mt-3'} variant="primary" type="submit" onClick={handleSubmit}>
                            {orcamento !== null && orcamento.id_orcamento === null ? 'Criar' : 'Editar'}
                        </Button>
                    </form>
                </Modal.Body>
            </div>
        </Modal>

    )
}
export default ModalOrcamentoFinal
