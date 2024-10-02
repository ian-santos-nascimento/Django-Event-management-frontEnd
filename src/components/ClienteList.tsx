import {useEffect, useState} from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// @ts-ignore
import Cliente from "./Cliente.tsx";
import {fetchData,} from '../ApiCall/ApiCall.jsx'
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";

interface Cliente {
    id_cliente: string,
    razao_social: string,
    cnpj: string,
    inscricao_estadual: string,
    nome: string,
    telefone: string,
    endereco: {
        "id_endereco": number,
        "cep": string,
        "endereco": string,
        "bairro": string,
        "cidade": string,
        "estado": string,
        "numero": string,
        "complemento": string
    },
    prazo_pagamento: string,
    taxa_financeira: number,
    inicio_contrato: string,
    fim_contrato: string,
}

const API_URL = process.env.REACT_APP_API_URL;

export default function CidadeList({sessionId, csrfToken}) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<Cliente>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchClientes = async () => {
            const response = await fetchData('clientes', currentPage, searchQuery, csrfToken, sessionId);
            const clientes = response.data as Cliente[];
            setClientes(clientes);
            setTotalPages(Math.ceil(response.count / 10));
        };
        fetchClientes();
    }, [sessionId, currentPage, searchQuery]);

    const handleEditCliente = (cliente: Cliente) => {
        setSelectedCliente(cliente);
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCreateCliente = () => {
        setSelectedCliente({
            id_cliente: null,
            nome: '',
            cnpj: '',
            razao_social: '',
            prazo_pagamento: '',
            inscricao_estadual: '',
            telefone: '',
            endereco: {
                "id_endereco": 0,
                "cep": '',
                "endereco": '',
                "bairro": '',
                "cidade": '',
                "estado": '',
                "numero": '',
                "complemento": ''
            },
            inicio_contrato: '',
            fim_contrato: '',
            taxa_financeira: 0.03
        });
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCliente(null);
    };

    const handleViewCliente = (cliente) => {
        setShowModal(true)
        setSelectedCliente(cliente)
    }

    const handleExcluirCliente = async () => {
        try {
            await axios.delete(`${API_URL}clientes/${selectedCliente.id_cliente}/`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            alert(`Cliente ${selectedCliente.nome} excluído com sucesso.`);
            window.location.reload();
        } catch (error) {
            console.error('Error updating Cliente:', error);
            alert('Failed to update Cliente.');
        }
        handleCloseModal();
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

    if (selectedCliente && !showModal) {
        return <Cliente sessionId={sessionId} cliente={selectedCliente} csrfToken={csrfToken}
                        setSelectedClienteList={setSelectedCliente}/>
    }

    return (
        <div className="container">
            <h2 className="text-center">Controle de Clientes</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateCliente}>Novo Cliente</Button>
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
                    <th scope="col">CNPJ</th>
                    <th scope="col">Taxa Financeira</th>
                    <th scope="col">Fim do contrato</th>
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {clientes.map(item =>
                    <tr key={item.id_cliente}>
                        <td>{item.id_cliente}</td>
                        <td>{item.nome}</td>
                        <td>{item.cnpj}</td>
                        <td>{item.taxa_financeira * 100}%</td>
                        <td>{item.fim_contrato}</td>
                        <td>
                            <button
                                onClick={() => handleViewCliente(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="search"/>
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleEditCliente(item)}
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
                    <Modal.Title>Detalhes do cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCliente && (
                        <div>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedCliente.nome}
                                        disabled={true}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridCNPJ">
                                    <Form.Label>CNPJ</Form.Label>
                                    <Form.Control
                                        name="cnpj"
                                        value={selectedCliente.cnpj}
                                        disabled={true}
                                        type="text"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Insira um CNPJ válido!
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridTelefone">
                                    <Form.Label>Telefone de contato</Form.Label>
                                    <Form.Control
                                        name="telefone"
                                        value={selectedCliente.telefone}
                                        disabled={true}
                                        type="text"
                                    />

                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                                    <Form.Label>Inscrição Estadual</Form.Label>
                                    <Form.Control
                                        name="inscricao_estadual"
                                        value={selectedCliente.inscricao_estadual}
                                        disabled={true}
                                        type="text"
                                    />

                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridRazaoSocial">
                                    <Form.Label>Razao social</Form.Label>
                                    <Form.Control
                                        name="razao_social"
                                        value={selectedCliente.razao_social}
                                        disabled={true}
                                        type="text"
                                    />

                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group className="mb-3" controlId="formGriPrazoPagamento">
                                    <Form.Label>Prazo de pagamento</Form.Label>
                                    <Form.Select
                                        name="taxa_deslocamento"
                                        disabled={true}
                                        value={selectedCliente.prazo_pagamento}>
                                        <option>{selectedCliente.prazo_pagamento}</option>
                                    </Form.Select>

                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridInicioContrato">
                                    <Form.Label>Data do Inicio do Contrato</Form.Label>
                                    <Form.Control
                                        name="data_inicio_contrato"
                                        value={selectedCliente.inicio_contrato}
                                        disabled={true}
                                        type="date"
                                    />

                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridFimContrato">
                                    <Form.Label>Data do Fim do Contrato</Form.Label>
                                    <Form.Control
                                        name="data_fim_contrato"
                                        value={selectedCliente.fim_contrato}
                                        disabled={true}
                                        type="date"
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridEndereco">
                                <Form.Label>Taxa financeira </Form.Label>
                                <Form.Control
                                    name="taxa_deslocamento"
                                    disabled={true}
                                    value={selectedCliente.taxa_financeira * 100 + '%'}
                                />
                            </Form.Group>
                            <Modal.Footer className="modal-footer-custom">
                                <div className="d-flex w-100">
                                    <Button
                                        disabled={selectedCliente !== null && selectedCliente.id_cliente === null}
                                        variant="danger"
                                        onClick={handleExcluirCliente}>
                                        Excluir
                                    </Button>

                                </div>

                            </Modal.Footer>
                        </div>
                    )}
                </Modal.Body>

            </Modal>
        </div>
    );
}
