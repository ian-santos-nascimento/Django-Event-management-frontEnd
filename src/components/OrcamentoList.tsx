import axios from "axios";
import {useEffect, useState} from "react";
import csrfToken from "../ApiCall/CsrfToken"
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
// @ts-ignore
import Evento from "./Evento.tsx"
// @ts-ignore
import Orcamento from './Orcamento.tsx'
// @ts-ignore
import OrcamentoView from "./OrcamentoView.tsx";
import {fetchData} from "../ApiCall/ApiCall";
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import type {OrcamentoType, EventoType} from '../types';

export default function OrcamentoList({sessionId}) {
    const [orcamentos, setOrcamentos] = useState<OrcamentoType[]>([])
    const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoType>(null)
    const [eventos, setEventos] = useState<EventoType[]>([])
    const [selectedEvento, setSelectedEvento] = useState<EventoType>(null)
    const [showModal, setShowModal] = useState(false)
    const [showOrcamento, setShowOrcamento] = useState(false)
    const [viewOrcamento, setViewOrcamento] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchOrcamentos = async () => {
            const response = await fetchData('orcamentos', currentPage, searchQuery, csrfToken, sessionId)
            const orcamentos = response.data as OrcamentoType[];
            setOrcamentos(orcamentos);
            setTotalPages(Math.ceil(response.count / 10));
        };
        fetchOrcamentos();
    }, [sessionId, currentPage, searchQuery]);


    useEffect(() => {
        const fetchEventos = async () => {
            const response = await fetchData('eventos', '', '', csrfToken, sessionId)
            const eventos = response.data as EventoType[];
            setEventos(eventos);
            setSelectedEvento(eventos[0])
        };
        fetchEventos();
    }, [sessionId])

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCreateOrcamento = () => {
        setShowModal(true)
    }

    const handleViewOrcamento = (orcamento) => {
        setSelectedOrcamento(orcamento)
        setViewOrcamento(true)

    }

    const handleCloseModalEvento = () => {
        setShowModal(false)
        setSelectedEvento(null)
    }

    const handleEditOrcamento = (orcamento) => {
        setSelectedOrcamento(orcamento)
        console.log("ORCAMENTO SELECIONADO", orcamento)
        setSelectedEvento(orcamento.evento)
        setShowOrcamento(true)
    }

    const handleSelectEventoButton = () => {
        setShowOrcamento(true)
    }

    const handleSelectEvento = (e) => {
        const eventoId = e.target.value;
        const selectedEvento = eventos.find(evento => evento.id_evento === parseInt(eventoId));
        setSelectedEvento(selectedEvento);
    };

    if (showOrcamento)
        return <Orcamento eventoState={selectedEvento} orcamentoState={selectedOrcamento} sessionId={sessionId}/>

    if (viewOrcamento)
        return <OrcamentoView orcamentoId={selectedOrcamento.id_orcamento} sessionId={sessionId}/>

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

    return (
        <div className="container">
            <h2 className="text-center">Controle de Orçamentos</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateOrcamento}>Novo Orcamento</Button>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar nome/nome do evento/nome do cliente..."
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
                    <th scope="col">Cliente</th>
                    <th scope="col">Evento</th>
                    <th scope="col">Status</th>
                    <th scope="col">Data Evento</th>
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {orcamentos.map(item =>
                    <tr key={item.id_orcamento}>
                        <td>{item.id_orcamento}</td>
                        <td>{item.cliente.nome}</td>
                        <td>{item.evento.nome}</td>
                        <td>{item.status}</td>
                        <td>{item.evento.data_inicio}</td>
                        <td>
                            <button
                                onClick={() => handleViewOrcamento(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="search"/>
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleEditOrcamento(item)}
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
            <Modal show={showModal} size="lg" onHide={handleCloseModalEvento}>
                <Modal.Header closeButton>
                    <Modal.Title>Escolha o Evento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <div>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Evento</Form.Label>
                                    <Form.Select
                                        name="nome"
                                        value={selectedEvento?.id_evento}
                                        onChange={handleSelectEvento}
                                    >
                                        {eventos.map((evento) => (
                                            <option key={evento.id_evento} value={evento.id_evento}>
                                                {evento.nome}--{evento.codigo_evento}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                            </Row>
                            <Modal.Footer className="modal-footer-custom">
                                <div className="d-flex w-100">
                                    <Button
                                        variant="primary"
                                        onClick={handleSelectEventoButton}>
                                        Selecionar
                                    </Button>

                                </div>

                            </Modal.Footer>
                        </div>
                </Modal.Body>

            </Modal>

        </div>


    )
}