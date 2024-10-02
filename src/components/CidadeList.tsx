import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {fetchData,} from '../ApiCall/ApiCall.jsx'
import {ESTADOS_BRASILEIROS} from '../util/OptionList'
import csrfToken from "../ApiCall/CsrfToken"
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Cidade {
    id_cidade: number
    nome: string,
    estado: string,
    taxa_deslocamento: number
}


export default function CidadeList({sessionId}) {
    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchCidades = async () => {
            const response = await fetchData('cidades', currentPage, searchQuery, csrfToken, sessionId);
            const cidades = response.data as Cidade[];
            setCidades(cidades);
            setTotalPages(Math.ceil(response.count / 10));
        };
        fetchCidades();
    }, [sessionId, currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleEditCidade = (cidade: Cidade) => {
        setSelectedCidade(cidade);
        setShowModal(true);
    };

    const handleCreateCidade = () => {
        setSelectedCidade({
            id_cidade: null,
            nome: '',
            estado: 'SP',
            taxa_deslocamento: 0.0
        })
        setShowModal(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedCidade((prevCidade) => prevCidade ? {...prevCidade, [name]: value} : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedCidade.id_cidade !== null) {
                await axios.put(`${API_URL}cidades/${selectedCidade.id_cidade}/`, selectedCidade, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                alert('Cidade updated successfully!');
            } else {
                await axios.post(`${API_URL}cidades/`, selectedCidade, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                alert('Cidade created successfully!');
            }
            window.location.reload()
        } catch (error) {
            console.error('Error updating Cidade:', error);
            alert('Failed to update cidade.');
        }

    }

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCidade(null);
    };

    const handleExcluirCidade = async () => {
        try {
            await axios.delete(`${API_URL}cidades/${selectedCidade.id_cidade}/`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            alert(`Cidade ${selectedCidade.nome} excluída com sucesso.`);
            window.location.reload()
        } catch (error) {
            console.error('Error updating local:', error);
            alert('Failed to update local.');
        }
        handleCloseModal()

    }
   const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchClick = () => {
        setSearchQuery(searchTerm);
    };

    const handleClearSearch = () =>{
        setSearchQuery('')
        setSearchTerm('')

    }

    return (
        <div className="container">
            <h2 className="text-center">Controle das Cidades</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateCidade}>Nova Cidade</Button>
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
                    <th scope="col">Estado</th>
                    <th scope="col">Taxa Deslocamento</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {cidades.map(item =>
                    <tr key={item.id_cidade}>
                        <td>{item.id_cidade}</td>
                        <td>{item.nome}</td>
                        <td>{item.estado}</td>
                        <td>{item.taxa_deslocamento * 100}%</td>
                        <td>
                            <button
                                onClick={() => handleEditCidade(item)}
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
                    <Modal.Title>Detalhes do cidade</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCidade && (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedCidade.nome}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select
                                        name="estado"
                                        value={selectedCidade.estado}
                                        onChange={handleChange}
                                    >
                                        {ESTADOS_BRASILEIROS.map((valor, index) => (
                                            <option key={index} value={valor.sigla}>
                                                {valor.nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridEndereco">
                                <Form.Label>Taxa deslocamento (Em decimal. Ex: 0.02)</Form.Label>
                                <Form.Control
                                    name="taxa_deslocamento"
                                    value={selectedCidade.taxa_deslocamento}
                                    onChange={handleChange}
                                    placeholder="0.02"
                                />
                            </Form.Group>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="d-flex justify-content-between w-100">
                        <Button disabled={selectedCidade !== null && selectedCidade.id_cidade === null} variant="danger"
                                type="submit" onClick={handleExcluirCidade}>
                            Excluir
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            {selectedCidade !== null && selectedCidade.id_cidade === null ? 'Criar' : 'Editar'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}