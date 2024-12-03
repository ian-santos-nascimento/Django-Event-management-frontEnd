import {Fragment, useEffect, useState} from 'react';
import {Badge, Button, Col, Form, Modal, Row} from 'react-bootstrap';
import {NumericFormat} from 'react-number-format';
import {EventoType, LogisticaCidadeType, LogisticaType, OrcamentoType} from "../types";
import {parse} from "@fortawesome/fontawesome-svg-core";

interface Props {
    filterLogisticaState: string;
    logisticasSelecionadas: LogisticaType[];
    setLogisticasSelecionadas: React.Dispatch<React.SetStateAction<LogisticaType[]>>;
    orcamento: OrcamentoType;
    logisticas: LogisticaType[];
    setOrcamento: React.Dispatch<React.SetStateAction<OrcamentoType>>;
    logisticaCidade: LogisticaCidadeType;
    evento: EventoType;
}


const LogisticaOrcamentoComp: React.FC<Props> = ({
                                                     filterLogisticaState,
                                                     logisticasSelecionadas,
                                                     setLogisticasSelecionadas,
                                                     orcamento,
                                                     logisticas,
                                                     setOrcamento,
                                                     logisticaCidade,
                                                     evento
                                                 }) => {
    const [selectedLogistica, setSelectedLogistica] = useState(null);
    const [filterLogistica, setFilterLogistica] = useState(filterLogisticaState || '');
    const [valorLogisticaTotal, setValorLogisticaTotal] = useState(orcamento?.valor_total_logisticas || 0)

    const filteredLogisticas = logisticas.filter(logistica =>
        logistica.nome.toLowerCase().includes(filterLogistica.toLowerCase())
    );

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const {name, value} = e.target;

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            [name]: value
        }));
    };

    //Calculo Logistica
    useEffect(() => {
        if (!orcamento || !evento || !logisticaCidade) {
            return;
        }
        const total = orcamento.logisticas.reduce((acc, logistica) => {
            const valorLogistica = parseFloat(logistica.valor);
            if (isNaN(valorLogistica)) {
                console.error(`Logistica valor is NaN for logistica id ${logistica.id}`);
                return acc;
            }
            const alimentacao = !isNaN(logisticaCidade.alimentacao) ? parseFloat(logisticaCidade.alimentacao) : 70;
            const quantidade = logistica.quantidade || 1;
            const total_basico = (valorLogistica + alimentacao) * logistica.dias * quantidade;
            const logisticaFilter = logisticas.find(logisticaList => logisticaList.id_logistica === logistica.id)
            const total_logistica_fora_sp = !logisticaFilter.in_sp ? parseFloat(logisticaCidade.passagem || 0) + (parseFloat(logisticaCidade.hospedagem || 0) * (logistica.dias + 1)) : 0;
            return acc + total_basico + total_logistica_fora_sp;
        }, 0);
        setValorLogisticaTotal(total - orcamento.valor_desconto_logisticas);
        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            valor_total_logisticas: total - prevOrcamento.valor_desconto_logisticas
        }));
    }, [logisticasSelecionadas, orcamento.valor_desconto_logisticas, evento, orcamento.logisticas]);


    const handleQuantityLogisticaChange = (logistica_id: number, quantidade: number) => {
        setOrcamento((prevOrcamento: OrcamentoType) => {
            if (!prevOrcamento || !prevOrcamento.logisticas) return prevOrcamento;

            const updatedLogisticas = prevOrcamento.logisticas.map(log =>
                log.id === logistica_id ? {...log, quantidade} : log
            );

            return {...prevOrcamento, logisticas: updatedLogisticas} as OrcamentoType;
        });
    };
    const handleDiasLogisticaChange = (logistica_id: number, dias: number) => {
        setOrcamento((prevOrcamento: OrcamentoType) => {
            if (!prevOrcamento || !prevOrcamento.logisticas) return prevOrcamento;

            const updatedLogisticas = prevOrcamento.logisticas.map(log =>
                log.id === logistica_id ? {...log, dias} : log
            );

            return {...prevOrcamento, logisticas: updatedLogisticas} as OrcamentoType;
        });
    };

    const handleToggleLogistica = (logistica) => {
        const isSelected = logisticasSelecionadas.some(l => l.id_logistica === logistica.id_logistica);
        if (isSelected) {
            const updateLogisticaSelecionada = logisticasSelecionadas.filter(l => l.id_logistica !== logistica.id_logistica);
            setLogisticasSelecionadas(updateLogisticaSelecionada);
            if (orcamento) {
                const updatedLogisticas = orcamento.logisticas.filter(log => log.id !== logistica.id_logistica);
                setOrcamento({...orcamento, logisticas: updatedLogisticas});
            }
        } else {
            setLogisticasSelecionadas([...logisticasSelecionadas, logistica]);
            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    logisticas: [...orcamento.logisticas, {
                        id: logistica.id_logistica,
                        quantidade: 1,
                        dias: evento?.qtd_dias_evento,
                        valor: logistica.valor,
                        logistica: logistica.nome
                    }]
                });
            }
        }
    };


    return (
        <>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="formGridLogisticas">
                    <Form.Label>Logisticas de Pessoas</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar Logistica..."
                        value={filterLogistica}
                        onChange={(e) => setFilterLogistica(e.target.value)}
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
                        {filteredLogisticas.map((logistica) => (
                            <Form.Check
                                key={logistica.id_logistica}
                                type="checkbox"
                                label={logistica.nome}
                                value={logistica.id_logistica}
                                checked={logisticasSelecionadas.some(
                                    (l) => l.id_logistica === logistica.id_logistica
                                )}
                                onChange={() => handleToggleLogistica(logistica)}
                            />
                        ))}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" as={Col} controlId="formGridLogisticasSelecionadas">
                    <Form.Label>Logisticas Selecionadas</Form.Label>
                    <div
                        style={{
                            maxHeight: '150px',
                            overflowY: 'scroll',
                            border: '1px solid #ced4da',
                            padding: '10px',
                        }}
                    >
                        {logisticasSelecionadas.map((logistica) => (
                            <div
                                key={logistica.id_logistica}
                                style={{
                                    display: 'flex',
                                    alignItems: 'end', // Centraliza verticalmente
                                    marginBottom: '10px',
                                }}
                            >
                                <Form.Check
                                    key={logistica.id_logistica}
                                    type="checkbox"
                                    label={`${logistica.nome}-R$${logistica.valor}`}
                                    value={logistica.id_logistica}
                                    checked={true}
                                    onChange={() => handleToggleLogistica(logistica)}
                                    style={{marginRight: '10px'}} // Adiciona espaço entre o checkbox e o input
                                />
                                <div style={{display: 'flex', flexDirection: 'column', marginLeft: '5px'}}>
                                    <Form.Label style={{marginBottom: '5px', textAlign: 'center'}}>Qtd</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={
                                            orcamento?.logisticas?.find((l) => l.id === logistica.id_logistica)
                                                ?.quantidade || 1
                                        }
                                        onChange={(e) =>
                                            handleQuantityLogisticaChange(
                                                logistica.id_logistica,
                                                parseInt(e.target.value)
                                            )
                                        }
                                        style={{width: '85px'}}
                                    />
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', marginLeft: '5px'}}>
                                    <Form.Label style={{marginBottom: '5px', textAlign: "center"}}>Dias</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={
                                            orcamento?.logisticas?.find((l) => l.id === logistica.id_logistica)
                                                ?.dias || evento?.qtd_dias_evento
                                        }
                                        onChange={(e) =>
                                            handleDiasLogisticaChange(
                                                logistica.id_logistica,
                                                parseInt(e.target.value)
                                            )
                                        }
                                        style={{width: '75px'}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Form.Group>
            </Row>

            <Row>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ Logistica</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${valorLogisticaTotal ? valorLogisticaTotal : 0}`}
                        disabled={true}
                    />
                    {logisticasSelecionadas.map((logistica) => (
                        <Fragment key={logistica.id_logistica}>
                            {(!logistica.in_sp && logistica.tipo === 'Pessoa') && (
                                <Badge bg="secondary">
                                    {logistica.nome}(Diária:R${parseFloat((logistica?.valor)).toFixed(2)} + alimentação:
                                    R${logisticaCidade?.alimentacao || 70} * {orcamento?.logisticas?.find((l) => l.id === logistica.id_logistica)
                                    ?.dias} dias )
                                    + (Hospedagem:R${logisticaCidade?.hospedagem} * {evento?.qtd_dias_evento + 1} dias +
                                    passagem:
                                    R${logisticaCidade?.passagem})
                                </Badge>
                            )}
                            {(logistica.in_sp && logistica.tipo === 'Pessoa') && (
                                <Badge bg="secondary">
                                    {logistica.nome}(Diária:R${parseFloat((logistica?.valor)).toFixed(2)} + alimentação:
                                    R${logisticaCidade?.alimentacao || 70} * {orcamento?.logisticas?.find((l) => l.id === logistica.id_logistica)
                                    ?.dias} dias )
                                </Badge>
                            )}
                        </Fragment>
                    ))}
                </Form.Group>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Desconto para Logistica</Form.Label>
                    <NumericFormat
                        name="valor_desconto_logisticas"
                        value={orcamento?.valor_desconto_logisticas || 0}
                        onValueChange={(values) => {
                            const {floatValue} = values;
                            handleChange({target: {name: 'valor_desconto_logisticas', value: floatValue || 0}});
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale={true}
                        allowNegative={false}
                        placeholder="Desconto Logistica"
                        customInput={Form.Control}
                    />
                </Form.Group>
            </Row>
        </>
    );
};

export default LogisticaOrcamentoComp;
