import {useEffect, useState} from "react";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import {NumericFormat} from "react-number-format";
import {Badge} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import {ComidaType, EventoType, LogisticaCidadeType, OrcamentoType} from "../types";
import {SUBCATEGORIAS_COMIDA, TIPO_COMIDA} from "../util/OptionList"
// @ts-ignore
import {agruparComidasPorTipo} from "../util/CalculoOrcamento.ts";

interface Props {
    logisticaCidade: LogisticaCidadeType;
    cardapio: ComidaType[];
    selectedCardapio: ComidaType[];
    orcamento: OrcamentoType;
    setOrcamento: React.Dispatch<React.SetStateAction<OrcamentoType>>;
    setSelectedCardapio: React.Dispatch<React.SetStateAction<ComidaType[]>>;
    evento: EventoType;
}

const CardapioOrcamentoComp: React.FC<Props> = ({
                                                    cardapio,
                                                    logisticaCidade,
                                                    orcamento,
                                                    selectedCardapio,
                                                    setSelectedCardapio,
                                                    setOrcamento,
                                                    evento,
                                                }) => {

    const [valorComidaTotal, setValorComidaTotal] = useState(orcamento.valor_total_comidas | 0.0)
    const [selectCategoria, setSelectCategoria] = useState({tipo: '', subtipo: ''})
    const [showModal, setShowModal] = useState(false)
    const [agrupadasPorTipo, setAgrupadasPorTipo] = useState<{ [key: string]: ComidaType[] }>({});
    const filteredSubcategories = SUBCATEGORIAS_COMIDA[selectCategoria.tipo] || [];
    const filteredComidas = cardapio.filter(comida => comida.subtipo === selectCategoria.subtipo)
    const [descontosPorCategoria, setDescontosPorCategoria] = useState(orcamento?.descontos);

    const handleDiscountChange = (categoria, value) => {
        setDescontosPorCategoria((prevDescontos) => ({
            ...prevDescontos,
            [categoria]: value
        }));

    };


    useEffect(() => {
        setAgrupadasPorTipo(agruparComidasPorTipo(selectedCardapio));
        if (orcamento && orcamento.comidas) {
            const totalDesconto = Object.values(descontosPorCategoria).reduce((acc, desconto) => acc + desconto, 0);
            // Calcula o total de comidas por categoria, aplicando o desconto apenas uma vez por categoria
            const totalComDescontos = Object.keys(agrupadasPorTipo).reduce((acc, categoria) => {
                const subtotalCategoria = agrupadasPorTipo[categoria].reduce((sum, comida) => {
                    const quantidade = orcamento.comidas.find(c => c.comida_id === comida.comida_id)?.quantidade || comida.quantidade_minima;
                    return sum + comida.valor * quantidade;
                }, 0);
                const descontoCategoria = descontosPorCategoria[categoria] || 0;
                return acc + (subtotalCategoria - descontoCategoria);
            }, 0);
            console.log("ORCAMENTO", orcamento, "agrupados", agrupadasPorTipo)
            setValorComidaTotal(totalComDescontos);
            setOrcamento({
                ...orcamento,
                descontos: descontosPorCategoria !== null ? descontosPorCategoria : {}, // Garante que o campo é atualizado no orçamento
                valor_total_comidas: totalComDescontos,
                valor_desconto_comidas: totalDesconto
            });
        }
    }, [orcamento.comidas, descontosPorCategoria, selectedCardapio]);

    const handleQuantityChange = (comida_id, quantidade) => {
        if (!orcamento || !orcamento.comidas) {
            return;
        }

        const updatedComidas = orcamento.comidas.map(comida =>
            comida.comida_id === comida_id ? {...comida, quantidade: quantidade} : comida
        );

        const totalComDescontos = updatedComidas.reduce((acc, comida) => {
            const descontoCategoria = descontosPorCategoria[comida.tipo] || 0;
            return acc + (comida.valor * comida.quantidade) - descontoCategoria;
        }, 0);

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            comidas: updatedComidas,
            valor_total_comidas: totalComDescontos
        }));

        setValorComidaTotal(totalComDescontos);
    };


    const handleCategoryChange = (e) => {
        const {value} = e.target;
        setSelectCategoria({tipo: value, subtipo: ''})

    }

    const handleChangeSubCategoria = (e) => {
        const {value} = e.target
        setSelectCategoria({...selectCategoria, subtipo: value})
        setShowModal(true)
    }


    const handleToggleComida = (comida: ComidaType) => {
        if (selectedCardapio.some(c => c.comida_id === comida.comida_id)) {
            const updatedComidasSelecionadas = selectedCardapio.filter(c => c.comida_id !== comida.comida_id);
            setSelectedCardapio(updatedComidasSelecionadas);
            if (orcamento) {
                const updatedComidas = orcamento.comidas.filter(c => c.comida_id !== comida.comida_id);
                setOrcamento({...orcamento, comidas: updatedComidas});
            }
        } else {
            const updatedComida = {...comida, quantidade: comida.quantidade_minima};
            setSelectedCardapio([...selectedCardapio, updatedComida]);
            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    comidas: [...orcamento.comidas, {
                        comida_id: comida.comida_id,
                        quantidade: comida.quantidade_minima,
                        valor: comida.valor,
                        comida: comida.nome
                    }]
                });
            }
        }
    };

    return (
        <div>
            <Row>
                <Form.Group as={Col} controlId="formGriCategoria">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                        required
                        name="tipo"
                        value={selectCategoria.tipo}
                        onChange={handleCategoryChange} // Atualiza a categoria e reseta a subcategoria
                    >
                        <option value={''}>Escolha uma categoria</option>
                        {TIPO_COMIDA.map((tipo, index) => (
                            <option value={tipo} key={index}>{tipo}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        Escolha o tipo da comida
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} controlId="formGriSubCategoria">
                    <Form.Label>Subcategoria</Form.Label>
                    <Form.Select
                        required
                        name="subtipo"
                        value={selectCategoria.subtipo}
                        onChange={handleChangeSubCategoria} // Atualiza a subcategoria
                    >
                        <option value={''}>Escolhe uma SubCategoria</option>
                        {filteredSubcategories.map((sub, index) => (
                            <option value={sub} key={index}>{sub}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        Escolha a subcategoria da comida
                    </Form.Control.Feedback>
                </Form.Group>

            </Row>
            <Row className="mb-3 mt-3">
                <Form.Group as={Col} controlId="formGridComidasSelecionadas">
                    <Row>
                        {Object.keys(SUBCATEGORIAS_COMIDA).map((categoria) => (
                            <Col xs={12} md={6} key={categoria} style={{marginBottom: '20px'}}>
                                <h4>{categoria}</h4>
                                <div
                                    style={{
                                        maxHeight: '150px',
                                        overflowY: 'scroll',
                                        border: '1px solid #ced4da',
                                        padding: '10px',
                                    }}
                                >
                                    {agrupadasPorTipo[categoria] && agrupadasPorTipo[categoria].length > 0 ? (
                                        agrupadasPorTipo[categoria].map((comida) => (
                                            <div
                                                key={comida.comida_id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                <Form.Check
                                                    type="checkbox"
                                                    label={`${comida.nome} - R$${comida.valor}`}
                                                    checked={true}
                                                    onChange={() => handleToggleComida(comida)}
                                                />
                                                <Form.Control
                                                    type="number"
                                                    min={comida.quantidade_minima}
                                                    value={
                                                        orcamento?.comidas?.find((c) => c.comida_id === comida.comida_id)
                                                            ?.quantidade || comida.quantidade_minima
                                                    }
                                                    onChange={(e) =>
                                                        handleQuantityChange(comida.comida_id, parseInt(e.target.value))
                                                    }
                                                    style={{width: '75px', marginLeft: '5px'}}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p>Nenhuma comida selecionada nesta categoria.</p>
                                    )}
                                </div>
                                <Badge bg="primary" style={{marginTop: '10px'}}>
                                    Total categoria: R$
                                    {(
                                        agrupadasPorTipo[categoria] && agrupadasPorTipo[categoria].length > 0
                                            ? agrupadasPorTipo[categoria].reduce((total, comida) => {
                                                const quantidade =
                                                    orcamento?.comidas?.find((c) => c.comida_id === comida.comida_id)
                                                        ?.quantidade || comida.quantidade_minima;
                                                return total + comida.valor * quantidade;
                                            }, 0)
                                            : 0
                                    ).toFixed(2)}
                                </Badge>
                                <div>
                                    <Form.Label>Desconto para {categoria}</Form.Label>
                                    <NumericFormat
                                        name={`desconto_${categoria}`}
                                        disabled={agrupadasPorTipo[categoria]?.length <= 0}
                                        value={orcamento?.descontos?.[categoria] ?? descontosPorCategoria[categoria] ?? 0}
                                        onValueChange={(values) => {
                                            const {floatValue} = values;
                                            handleDiscountChange(categoria, floatValue || 0);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                        placeholder="Desconto Categoria"
                                        customInput={Form.Control}
                                    />
                                </div>

                            </Col>
                        ))}
                    </Row>
                </Form.Group>
            </Row>

            <Row className='mb-3'>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ comidas</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${(parseFloat(orcamento.valor_total_comidas).toFixed(2) || valorComidaTotal.toFixed(2)) || 0}`}
                        disabled={true}
                    />
                </Form.Group>
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Selecionar Comidas</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {filteredComidas.map((comida) => (
                        <Form.Check
                            key={comida.comida_id}
                            type="checkbox"
                            label={comida.nome}
                            value={comida.comida_id}
                            checked={selectedCardapio.some(c => c.comida_id === comida.comida_id)}
                            onChange={() => handleToggleComida(comida)}
                        />
                    ))}
                </Modal.Body>
            </Modal>
        </div>
    )

}

export default CardapioOrcamentoComp;