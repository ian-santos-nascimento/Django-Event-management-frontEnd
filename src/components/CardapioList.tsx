import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {NumericFormat} from 'react-number-format';
//@ts-ignore
import {deleteData, fetchData, putData, postData,} from '../ApiCall/ApiCall.ts'
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {TIPO_COMIDA, SUBCATEGORIAS_COMIDA} from "../util/OptionList"
import {ComidaType} from "../types";

export default function CidadeList({csrfToken, sessionId}) {
    const [comidas, setCidades] = useState<ComidaType[]>([]);
    const [selectedComida, setSelectedComida] = useState<ComidaType>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const filteredSubcategories = SUBCATEGORIAS_COMIDA[selectedComida?.tipo] || [];
    const [validated, setValidated] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});
    const PATH_COMIDAS = 'comidas'


    useEffect(() => {
        const fetchCardapio = async () => {
            const response = await fetchData(PATH_COMIDAS, currentPage, searchQuery)
            const comidas = response.data as ComidaType[];
            setCidades(comidas);
            setTotalPages(Math.ceil(response.count / 10));
        };
        fetchCardapio();
    }, [sessionId, currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleEditComida = (comida: ComidaType) => {
        setSelectedComida(comida);
        setShowModal(true);
    };

    const handleCreateCardapio = () => {
        setSelectedComida({
            comida_id: null,
            nome: '',
            descricao: '',
            fator_multiplicador: 1.0,
            tipo: TIPO_COMIDA[0],
            subtipo: SUBCATEGORIAS_COMIDA[TIPO_COMIDA[0]][0],
            valor: 0.0,
            quantidade_minima: 0
        })
        setShowModal(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedComida((prevComida) => prevComida ? {...prevComida, [name]: value} : null);
    };

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        setErrorMessages({});
        console.log("FORM VALIDO", form.checkValidity())
        if (form.checkValidity() === false) {
            setValidated(true);
        } else {
            setValidated(true);
            var success = false
            if (selectedComida.comida_id !== null) {
                success = await putData(PATH_COMIDAS, selectedComida, selectedComida.comida_id).then(response => {
                    return response.success
                })
            } else {
                success = await postData(PATH_COMIDAS, selectedComida).then(response => {
                    return response.success
                })
            }
            if (success) {
                selectedComida.comida_id !== null ? alert("Comida atualizada com sucesso")
                    : alert("Comida criada com sucesso")
                window.location.reload()
            }

        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedComida(null);
    };

    const handleExcluirComida = async () => {
        const response = await deleteData(PATH_COMIDAS, selectedComida.comida_id);
        if (response.success) {
            alert(`Comida "${selectedComida.nome}" excluída com sucesso.`);
            window.location.reload()
            handleCloseModal()
        }
    }

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchClick = () => {
        setSearchQuery(searchTerm);
    };

    const handleClearSearch = () => {
        setSearchQuery('')
        setSearchTerm('')

    }
    const handleCategoryChange = (e) => {
        const {value} = e.target;
        setSelectedComida((prevSelectedComida) => ({
            ...prevSelectedComida,
            tipo: value,
            subtipo: SUBCATEGORIAS_COMIDA[value][0],  // Resetando subcategoria
        }));
    };

    const handleValueChange = (values) => {
        const {floatValue, formattedValue} = values;
        setSelectedComida({
            ...selectedComida,
            valor: floatValue, // Armazena como número
        });
    };

    return (
        <div className="container">
            <h2 className="text-center">Controle de Cardápio</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateCardapio}>Nova Item de Cardápio</Button>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button
                        type='button'
                        variant="outline-primary" title='Buscar'
                        onClick={handleSearchClick}>
                        <FontAwesomeIcon icon={faSearch}/>
                    </Button>
                    {searchTerm && (
                        <Button
                            type='button'
                            variant="outline-danger" title='Limpar filtro'
                            onClick={handleClearSearch}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </Button>
                    )}
                </InputGroup>
            </div>
            <table className="table table-success">
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Descricao</th>
                    <th scope="col">Qtd.Minima</th>
                    <th scope="col">Categoria</th>
                    <th scope="col">SubCategoria</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Fator Multiplicador</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {comidas.map(item =>
                    <tr key={item.comida_id}>
                        <td>{item.comida_id}</td>
                        <td>{item.nome}</td>
                        <td>{item.descricao.slice(0, 50)}</td>
                        <td>{item.quantidade_minima}</td>
                        <td>{item.tipo}</td>
                        <td>{item.subtipo}</td>
                        <td>R${item.valor}</td>
                        <td>{item.fator_multiplicador}</td>
                        {/* Exibe o fator multiplicador */}
                        <td>
                            <button
                                onClick={() => handleEditComida(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="edit"/>
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Anterior
                </button>
                <span> Página {currentPage} de {totalPages} </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Próxima
                </button>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes do Item de Cardápio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedComida && (
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        required
                                        name="nome"
                                        value={selectedComida.nome}
                                        onChange={handleChange}
                                        placeholder="Nome"
                                        isInvalid={!!errorMessages.nome}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errorMessages.nome || 'Por favor, insira o nome.'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridQtdMinima">
                                    <Form.Label>Qtd. Mínima</Form.Label>
                                    <Form.Control
                                        required
                                        name="quantidade_minima"
                                        value={selectedComida.quantidade_minima}
                                        onChange={handleChange}
                                        type="number"
                                        isInvalid={!!errorMessages.quantidade_minima}
                                        min="1"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errorMessages.quantidade_minima || 'Por favor, insira a quantidade mínima.'}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridEValor">
                                    <Form.Label>Valor</Form.Label>
                                    <NumericFormat
                                        name="valor"
                                        value={selectedComida.valor}
                                        onValueChange={handleValueChange}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        className={`form-control ${errorMessages.valor ? 'is-invalid' : ''}`}
                                    />
                                    <div className="invalid-feedback">
                                        {errorMessages.valor || 'Por favor, insira o valor.'}
                                    </div>
                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridFatorMultiplicador">
                                    <Form.Label>Multiplicador</Form.Label>
                                    <Form.Control
                                        required
                                        name="fator_multiplicador"
                                        value={selectedComida.fator_multiplicador}
                                        onChange={handleChange}
                                        type="number"
                                        step="0.001" // Permite valores com 3 casas decimais
                                        min="1.000"
                                        isInvalid={!!errorMessages.fator_multiplicador}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errorMessages.fator_multiplicador || 'Por favor, insira o fator multiplicador válido.'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridDescricao">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    required
                                    name="descricao"
                                    value={selectedComida.descricao}
                                    onChange={handleChange}
                                    type="text"
                                    isInvalid={!!errorMessages.descricao}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errorMessages.descricao || 'Por favor, insira a descrição.'}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGriCategoria">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select
                                        required
                                        name="tipo"
                                        value={selectedComida.tipo}
                                        onChange={handleCategoryChange} // Atualiza a categoria e reseta a subcategoria
                                        isInvalid={!!errorMessages.tipo}
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {TIPO_COMIDA.map((tipo, index) => (
                                            <option value={tipo} key={index}>
                                                {tipo}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errorMessages.tipo || 'Escolha o tipo da comida.'}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGriSubCategoria">
                                    <Form.Label>Subcategoria</Form.Label>
                                    <Form.Select
                                        required
                                        name="subtipo"
                                        value={selectedComida.subtipo}
                                        onChange={handleChange} // Atualiza a subcategoria
                                        isInvalid={!!errorMessages.subtipo}
                                        disabled={!selectedComida.tipo} // Desabilita se nenhuma categoria estiver selecionada
                                    >
                                        <option value="">Selecione uma subcategoria</option>
                                        {filteredSubcategories.map((sub, index) => (
                                            <option value={sub} key={index}>
                                                {sub}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errorMessages.subtipo || 'Escolha a subcategoria da comida.'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Modal.Footer className="modal-footer-custom">
                                <div className="d-flex justify-content-between w-100">
                                    <Button disabled={selectedComida !== null && selectedComida.comida_id === null}
                                            variant="danger"
                                            type="submit" onClick={handleExcluirComida}>
                                        Excluir
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        {selectedComida !== null && selectedComida.comida_id === null ? 'Salvar' : 'Editar'}
                                    </Button>
                                </div>
                            </Modal.Footer>
                        </Form>)}
                </Modal.Body>

            </Modal>
        </div>
    );
}