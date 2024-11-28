import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import {useEffect} from "react";
import {Accordion, Badge, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {faCheck,} from "@fortawesome/free-solid-svg-icons";
import {orcamentoPost,} from '../ApiCall/ApiCall.jsx'

import {
    CardapioOrcamentoType,
    ComidaType,
    EventoType,
    LogisticaCidadeType,
    LogisticaType,
    OrcamentoType
} from "../types";
// @ts-ignore
import verificarLogistica from "../util/CalculoOrcamento.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


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
                                                  logisticaCidade,
                                                  evento,
                                              }) => {

    const dias_evento = evento.qtd_dias_evento + 1
    const frete = verificarLogistica(cardapioSelecionado, logisticaCidade).frete
    const locomocao = verificarLogistica(cardapioSelecionado, logisticaCidade).locomocao * dias_evento
    const impostos_taxas = parseFloat(locomocao) + parseFloat(frete) + parseFloat(orcamento.valor_imposto)

    useEffect(() => {
        const calcularValorCardapio = () => {
            return orcamento.comidas.reduce((acc: number, comida: CardapioOrcamentoType): number => {
                return acc + (comida.valor * comida.quantidade);
            }, 0);
        };

        // Função para calcular o total de descontos
        const calcularDescontosTotal = () => {
            return Object.values(orcamento.descontos).reduce((acc: number, desconto: number): number => {
                return acc + desconto;
            }, 0);
        };

        // Função para calcular o valor do cardápio com descontos e taxa de deslocamento
        const calcularValorCardapioTotal = (valorCardapio: number, descontosTotal: number) => {
            const valorComDescontos = valorCardapio - descontosTotal;
            return valorComDescontos + (valorComDescontos * (logisticaCidade?.taxa_deslocamento || 0));
        };

        // Função para verificar e calcular o valor de decoração
        const calcularDecoracao = () => {
            const decoracaoCompleta = cardapioSelecionado.some(cardapio =>
                cardapio.tipo === 'Intervalo_Doce' || cardapio.tipo === 'Intervalo_Salgado' || cardapio.tipo === 'Almoço'
            );
            return decoracaoCompleta ? 800 : 400;
        };

        // Função para calcular o valor do imposto
        const calcularImposto = (valorBase: number) => {
            return valorBase * 0.2;
        };

        // Calculando valores parciais
        const valorCardapio = calcularValorCardapio();
        const descontosTotal = calcularDescontosTotal();
        const valorCardapioTotal = calcularValorCardapioTotal(valorCardapio, descontosTotal);
        const totalLogisticas = parseFloat(orcamento.valor_total_logisticas) || 0;
        const adicionalDecoracao = orcamento.valor_decoracao || calcularDecoracao();

        // Calculo do total com todas as despesas, descontos e adicionais
        let total = parseFloat(valorCardapioTotal + totalLogisticas + adicionalDecoracao + parseFloat(frete) + parseFloat(locomocao));
        const valorImposto = calcularImposto(total);
        total += valorImposto;
        total += total * (orcamento.cliente.taxa_financeira || 0);
        setOrcamento({
            ...orcamento,
            valor_total: total.toFixed(2),
            valor_total_comidas: valorCardapioTotal,
            valor_imposto: valorImposto,
            valor_decoracao: adicionalDecoracao,
            evento: evento
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await orcamentoPost(orcamento)
        if (response.success) {
            alert("Orçamento salvo com sucesso")
            window.location.reload()
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
                            <Form.Group as={Col} controlId="formGridValorDecoracao">
                                <Form.Label>Valor da Decoração</Form.Label>
                                <Form.Control
                                    name="valor_decoracao"
                                    value={orcamento.valor_decoracao || ''}
                                    onChange={(e) =>
                                        setOrcamento({
                                            ...orcamento,
                                            valor_decoracao: parseFloat(e.target.value) || 0, // Atualiza o valor no estado
                                        })
                                    }
                                    type="number"
                                    step="0.01"
                                    min="0"
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
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        Comidas: R${orcamento.valor_total_comidas.toFixed(2)}
                                        <Badge bg="info" className="ms-2">
                                            ({(logisticaCidade?.taxa_deslocamento * 100 || 0).toFixed(0)}% taxa de
                                            deslocamento)
                                        </Badge>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {orcamento.comidas.map((comida, index) => (
                                            <Row key={index} className="mb-2">
                                                <Col>
                                                    <strong>{comida.comida}</strong> - Qtd: {comida.quantidade},
                                                    Valor Unitário: R${parseFloat(comida.valor).toFixed(2)}
                                                </Col>
                                            </Row>
                                        ))}
                                        <p>Desconto aplicado:
                                            R${parseFloat(orcamento.valor_desconto_comidas).toFixed(2)}</p>
                                    </Accordion.Body>
                                </Accordion.Item>

                                {/* Seção de Logísticas */}
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>
                                        Logísticas: R${parseFloat(orcamento.valor_total_logisticas).toFixed(2)}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {orcamento.logisticas.map((logistica, index) => (
                                            <Row key={index} className="mb-2">
                                                <Col>
                                                    <strong>{logistica.logistica}</strong> - Qtd: {logistica.quantidade},
                                                    Diária: R${parseFloat(logistica.valor).toFixed(2)}
                                                </Col>
                                            </Row>
                                        ))}
                                        <p>Desconto aplicado:
                                            R${parseFloat(orcamento.valor_desconto_logisticas).toFixed(2)}</p>
                                    </Accordion.Body>
                                </Accordion.Item>
                                {/* Seção de Impostos */}

                                <Accordion.Item eventKey="7">
                                    <Accordion.Header>Taxas e Impostos:
                                        R${parseFloat(impostos_taxas || 0).toFixed(2)}</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Taxa de locomoção: R${parseFloat(locomocao || 0).toFixed(2)}</p>
                                        <p>Taxa de frete: R${parseFloat(frete || 0).toFixed(2)}</p>
                                        <p>Imposto (20%): R${parseFloat(orcamento.valor_imposto || 0).toFixed(2)}</p>
                                    </Accordion.Body>
                                </Accordion.Item>
                                {/* Seção do Evento */}
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Detalhes do Evento</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Nome/Código: {evento.nome} - {evento.codigo_evento}</p>
                                        <p>Data: {evento.data_inicio} - {evento.data_fim}</p>
                                        <p>Duração: {evento.qtd_dias_evento} dias</p>
                                        <p>Descrição: {evento.descricao}</p>
                                    </Accordion.Body>
                                </Accordion.Item>

                                {/* Seção do Cliente */}
                                <Accordion.Item eventKey="3">
                                    <Accordion.Header>Detalhes do Cliente</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Nome: {orcamento.cliente.nome}</p>
                                        <p>Taxa Financeira: {(orcamento.cliente.taxa_financeira * 100).toFixed(2)}%</p>
                                        <p>CNPJ: {orcamento.cliente.cnpj}</p>
                                    </Accordion.Body>
                                </Accordion.Item>

                                {/* Resumo Final */}
                                <Accordion.Item eventKey="4">
                                    <Accordion.Header>Total Geral</Accordion.Header>
                                    <Accordion.Body>
                                        <p><strong>Total Comidas:</strong> R${orcamento.valor_total_comidas.toFixed(2)}
                                        </p>
                                        <p><strong>Total
                                            Logísticas:</strong> R${parseFloat(orcamento.valor_total_logisticas).toFixed(2)}
                                        </p>
                                        <p>
                                            <strong>Decoração:</strong> R${parseFloat(orcamento.valor_decoracao).toFixed(2)}
                                        </p>
                                        <p><strong>Imposto:</strong> R${parseFloat(orcamento.valor_imposto).toFixed(2)}
                                        </p>
                                        <p><strong>Total
                                            Orçamento:</strong> R${parseFloat(orcamento.valor_total).toFixed(2)}</p>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Row> <Row>
                        <p>
                            <strong>Total: R$ {(parseFloat(orcamento.valor_total) || 0).toFixed(2)}</strong>
                        </p>
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
