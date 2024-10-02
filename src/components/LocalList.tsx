import {useEffect, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
// @ts-ignore
import Local from './Local.tsx';
import csrftoken from "../ApiCall/CsrfToken";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {fetchData,} from '../ApiCall/ApiCall.jsx'
import {InputGroup} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";


interface Local {
    id_local: string,
    nome: string,
    endereco: string,
    telefone: string,
    email: string,
    observacoes: string,
    cidade: number
}

export default function LocalList({sessionId}) {
    const [locais, setLocais] = useState<Local[]>([]);
    const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchLocais = async () => {
            const response = await fetchData('locais', currentPage, searchQuery, csrftoken, sessionId);
            const locais = response.data as Local[];
            setLocais(locais);
            setTotalPages(Math.ceil(response.count / 10));
        };
        fetchLocais();
    }, [sessionId, currentPage, searchQuery]);

    const handleEditLocal = (local: Local) => {
        setSelectedLocal(local);
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };


    const handleCreateLocal = () => {
        setSelectedLocal({
            id_local: null,
            nome: '',
            endereco: '',
            observacoes: '',
            cidade: null,
            email: '',
            telefone: ''
        })
    }

    const handleViewLocal = (local: Local) => {
        setSelectedLocal(local);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLocal(null);
    };

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

    if (selectedLocal && !showModal) {
        return <Local sessionId={sessionId} local={selectedLocal}/>;
    }

    return (
        <div className="container">
            <h2 className="text-center">Controle de Locais Evento</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateLocal}>Novo Local</Button>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar nome/cidade..."
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
                    <th scope="col">Endereco</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {locais.map(item =>
                    <tr key={item.id_local}>
                        <td>{item.id_local}</td>
                        <td>{item.nome}</td>
                        <td>{item.endereco}</td>
                        <td>{item.telefone}</td>
                        <td>
                            <button
                                onClick={() => handleViewLocal(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="search"/>
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleEditLocal(item)}
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
                    <Modal.Title>Detalhes do Local</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLocal && (
                        <div>
                            <p><strong>Nome:</strong> {selectedLocal.nome}</p>
                            <p><strong>Endereço:</strong> {selectedLocal.endereco}</p>
                            <p><strong>Telefone:</strong> {selectedLocal.telefone}</p>
                            <p><strong>Email:</strong> {selectedLocal.email}</p>
                            <p><strong>Observações:</strong> {selectedLocal.observacoes}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
