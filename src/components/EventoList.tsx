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
import {fetchData} from "../ApiCall/ApiCall";
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {TIPO_EVENTO} from "../util/OptionList"

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Evento {
    id_evento: number,
    codigo_evento: number,
    nome: string,
    tipo: string,
    descricao: string,
    observacao: string,
    qtd_dias_evento: number,
    qtd_pessoas: number,
    data_inicio: string,
    data_fim: string,
    local: number,
    clientes: number[]

}


export default function EventoList({sessionId}) {
    const [eventos, setEventos] = useState<Evento[]>([])
    const [selectedEvento, setSelectedEvento] = useState<Evento>(null)
    const [showModal, setShowModal] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEventos = async () => {
            const response = await fetchData('eventos', currentPage, searchQuery, csrfToken, sessionId)
            const eventos = response.data as Evento[];
            setEventos(eventos);
            setTotalPages(Math.ceil(response.count / 10));  // Ajuste o divisor de acordo com PAGE_SIZE do Django
        };
        fetchEventos();
    }, [sessionId, currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCreateEvento = () => {
        setSelectedEvento({
            id_evento: null,
            codigo_evento: 0,
            nome: '',
            descricao: '',
            observacao: '',
            qtd_dias_evento: 0,
            qtd_pessoas: 0,
            data_inicio: '',
            data_fim: '',
            local: null,
            tipo: TIPO_EVENTO[0],
            clientes: null

        })
    }

    const handleViewEvento = (evento) => {
        setSelectedEvento(evento)
        setShowModal(true)

    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedEvento(null)
    }

    const handleEditEvento = (evento) => {
        setSelectedEvento(evento)
    }

    const handleExcluirEvento = async () => {
        try {
            await axios.delete(`${API_URL}eventos/${selectedEvento.id_evento}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                // @ts-ignore
                credentials: 'include',
            });
            alert(`Evento ${selectedEvento.nome} excluído com sucesso`)
            window.location.reload()
        } catch (e) {
            console.log("exception", e)
            alert("Não foi possível excluir este evento")
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

    if (selectedEvento !== null && !showModal) {
        return <Evento evento={selectedEvento} sessionId={sessionId}/>
    }

    return (
        <div className="container">
            <h2 className="text-center">Controle de Eventos</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateEvento}>Novo Evento</Button>
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
                    <th scope="col">Codigo Evento</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Dias</th>
                    <th scope="col">Pessoas</th>
                    <th scope="col">Data de Inicio</th>
                    <th scope="col">Data final</th>
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {eventos.map(item =>
                    <tr key={item.codigo_evento}>
                        <td>{item.codigo_evento}</td>
                        <td>{item.nome}</td>
                        <td>{item.qtd_dias_evento}</td>
                        <td>{item.qtd_pessoas}</td>
                        <td>{item.data_inicio}</td>
                        <td>{item.data_fim}</td>
                        <td>
                            <button
                                onClick={() => handleViewEvento(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="search"/>
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleEditEvento(item)}
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
            <Modal show={showModal} size="lg" onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes do Evento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvento && (
                        <div>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedEvento.nome}
                                        disabled={true}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridCNPJ">
                                    <Form.Label>Codigo do Evento</Form.Label>
                                    <Form.Control
                                        name="cnpj"
                                        value={selectedEvento.codigo_evento}
                                        disabled={true}
                                        type="text"
                                    />

                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridTelefone">
                                    <Form.Label>Local</Form.Label>
                                    <Form.Control
                                        name="telefone"
                                        value={selectedEvento.local}
                                        disabled={true}
                                        type="text"
                                    />

                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                    <Form.Label>Observação</Form.Label>
                                    <Form.Control
                                        name="observacao"
                                        value={selectedEvento.observacao}
                                        disabled={true}
                                        as="textarea"
                                    />

                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                    <Form.Label>Descrição</Form.Label>
                                    <Form.Control
                                        name="descricao"
                                        value={selectedEvento.descricao}
                                        disabled={true}
                                        as="textarea"
                                    />

                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                    <Form.Label>Quantidade de Pessoas</Form.Label>
                                    <Form.Control
                                        name="descricao"
                                        value={selectedEvento.qtd_pessoas}
                                        disabled={true}
                                        type="text"
                                    />

                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                    <Form.Label>Dias de evento</Form.Label>
                                    <Form.Control
                                        name="qtd_dias_evento"
                                        value={selectedEvento.qtd_dias_evento}
                                        disabled={true}
                                        type="text"
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                <Form.Label>Data do início</Form.Label>
                                <Form.Control
                                    name="data_inicio"
                                    value={selectedEvento.data_inicio}
                                    disabled={true}
                                    type="text"
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                <Form.Label>Data do fim</Form.Label>
                                <Form.Control
                                    name="data_fim"
                                    value={selectedEvento.data_fim}
                                    disabled={true}
                                    type="text"
                                />
                            </Form.Group>
                            <Modal.Footer className="modal-footer-custom">
                                <div className="d-flex w-100">
                                    <Button
                                        disabled={selectedEvento !== null && selectedEvento.id_evento === null}
                                        variant="danger"
                                        onClick={handleExcluirEvento}>
                                        Excluir
                                    </Button>

                                </div>

                            </Modal.Footer>
                        </div>
                    )}
                </Modal.Body>

            </Modal>

        </div>


    )
}