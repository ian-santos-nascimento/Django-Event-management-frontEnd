import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import csrfToken from "../ApiCall/CsrfToken";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {fetchData,} from '../ApiCall/ApiCall.jsx'
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {TIPO_COMIDA, SUBCATEGORIAS_COMIDA} from "../util/OptionList"

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Comida {
    comida_id: number
    nome: string,
    descricao: string,
    tipo: string,
    subtipo: string,
    valor: number,
    quantidade_minima: number,
}


export default function CidadeList({sessionId}) {
    const [comidas, setCidades] = useState<Comida[]>([]);
    const [selectedComida, setSelectedComida] = useState<Comida | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const filteredSubcategories = SUBCATEGORIAS_COMIDA[selectedComida?.tipo] || [];


    useEffect(() => {
        const fetchCardapio = async () => {
            const response = await fetchData('comidas', currentPage, searchQuery, csrfToken, sessionId)
            const comidas = response.data as Comida[];
            setCidades(comidas);
            setTotalPages(Math.ceil(response.count / 10));
        };
        fetchCardapio();
    }, [sessionId, currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleEditComida = (comida: Comida) => {
        setSelectedComida(comida);
        setShowModal(true);
    };

    const handleCreateCardapio = () => {
        setSelectedComida({
            comida_id: null,
            nome: '',
            descricao: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedComida.comida_id !== null) {
                await axios.put(`${API_URL}comidas/${selectedComida.comida_id}/`, selectedComida, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                alert('Comida updated successfully!');
            } else {
                await axios.post(`${API_URL}comidas/`, selectedComida, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                alert('Comida created successfully!');
            }
            window.location.reload()
        } catch (error) {
            console.error('Error updating comida:', error);
            alert('Failed to update comida.');
        }

    }

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedComida(null);
    };

    const handleExcluirComida = async () => {
        try {
            await axios.delete(`${API_URL}comidas/${selectedComida.comida_id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                withCredentials: true,
            });
            alert(`Comida ${selectedComida.nome} excluída com sucesso.`);
            window.location.reload()
        } catch (error) {
            console.error('Error updating comida:', error);
            alert('Failed to update comida.');
        }
        handleCloseModal()

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

    return (
        <div className="container">
            <h2 className="text-center">Controle do Cardápio</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateCardapio}>Nova Item do Cardápio</Button>
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
                    <Modal.Title>Detalhes do Item do Cardápio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedComida && (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedComida.nome}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formGridQtdMinima">
                                    <Form.Label>Quantidade minima</Form.Label>
                                    <Form.Control
                                        name="quantidade_minima"
                                        placeholder='4'
                                        value={selectedComida.quantidade_minima}
                                        onChange={handleChange}
                                        type="number"
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridEValor">
                                    <Form.Label>Valor</Form.Label>
                                    <Form.Control
                                        name="valor"
                                        placeholder='30,50'
                                        value={selectedComida.valor}
                                        onChange={handleChange}
                                        type="number"
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridDescricao">
                                <Form.Label>Descricao</Form.Label>
                                <Form.Control
                                    name="descricao"
                                    value={selectedComida.descricao}
                                    onChange={handleChange}
                                    placeholder="Comida feita pelo chef"
                                    type='text'
                                />
                            </Form.Group>

                            <Row>

                                <Form.Group as={Col} controlId="formGriCategoria">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select
                                        required
                                        name="tipo"
                                        value={selectedComida.tipo}
                                        onChange={handleCategoryChange} // Atualiza a categoria e reseta a subcategoria
                                    >
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
                                        value={selectedComida.subtipo}
                                        onChange={handleChange} // Atualiza a subcategoria
                                    >
                                        {filteredSubcategories.map((sub, index) => (
                                            <option value={sub} key={index}>{sub}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Escolha a subcategoria da comida
                                    </Form.Control.Feedback>
                                </Form.Group>

                            </Row>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="d-flex justify-content-between w-100">
                        <Button disabled={selectedComida !== null && selectedComida.comida_id === null} variant="danger"
                                type="submit" onClick={handleExcluirComida}>
                            Excluir
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            {selectedComida !== null && selectedComida.comida_id === null ? 'Criar' : 'Editar'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}