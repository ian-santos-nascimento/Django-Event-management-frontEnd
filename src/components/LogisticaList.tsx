import {useEffect, useState} from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {TIPO_LOGISTICA, ESTADOS_BRASILEIROS} from "../util/OptionList.js";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {deleteData, fetchData, postData, putData,} from '../ApiCall/ApiCall.jsx'


interface Logistica {
    id_logistica: number,
    nome: string,
    descricao: string,
    valor: number,
    tipo: string,
    in_sp: boolean,

}


export default function LogisticaList({sessionId, csrfToken}) {
    const [logisticas, setLogisticas] = useState<Logistica[]>([])
    const [selectedLogistica, setSelectedLogistica] = useState<Logistica>(null)
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const PATH_LOGISTICA = 'logisticas'
    useEffect(() => {
        const fetchLogisticas = async () => {
            const response = await fetchData('logisticas', currentPage, searchQuery)
            const comidas = response.data as Logistica[];
            setLogisticas(comidas);
            setTotalPages(Math.ceil(response.count / 10));

        };
        fetchLogisticas();
    }, [sessionId, currentPage, searchQuery]);

    const handleEditLogistica = (logistica: Logistica) => {
        setSelectedLogistica(logistica);
        setShowModal(true);
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const handleCreateLogistica = () => {
        setSelectedLogistica({
            id_logistica: null,
            nome: '',
            descricao: '',
            tipo: TIPO_LOGISTICA[0],
            valor: 0,
            in_sp: true,
        })
        setShowModal(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type, checked} = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setSelectedLogistica((prevLogistica) => prevLogistica ? {...prevLogistica, [name]: fieldValue} : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        var response;
        if (selectedLogistica.id_logistica !== null) {
            response = await putData(PATH_LOGISTICA, selectedLogistica, selectedLogistica.id_logistica)
        } else {
            response = await postData(PATH_LOGISTICA, selectedLogistica)
        }

        if(response.success){
            selectedLogistica.id_logistica !== null ? alert("Logistica editada com sucesso!")
                : alert("Logistica criada com sucesso")
            window.location.reload();
        }else{
            alert("Houve um erro ao processar a requisição. Por favor entre em contato com o suporte")
        }

    }

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLogistica(null);
    };

    const handleExcluirLogistica = async () => {
        const response = await deleteData(PATH_LOGISTICA, selectedLogistica.id_logistica);
        if(response.success){
            alert("Logistica excluída com sucesso")
            window.location.reload()
        }else {
            alert("Houve um erro ao excluir a Logistica. Por favor entre em contato com o suporte")
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

    return (
        <div className="container">
            <h2 className="text-center">Controle das Logisticas</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateLogistica}>Nova Logistica</Button>
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
                    <th scope="col">Tipo</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Em SP</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {logisticas.map(item =>
                    <tr key={item.id_logistica}>
                        <td>{item.id_logistica}</td>
                        <td>{item.nome}</td>
                        <td>{item.descricao.slice(0, 50)}</td>
                        <td>{item.tipo}</td>
                        <td>R${item.valor}</td>
                        <td>{item.in_sp ? 'SIM' : 'NÃO'}</td>
                        <td>
                            <button
                                onClick={() => handleEditLogistica(item)}
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
                    <Modal.Title>Detalhes da Logistica</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLogistica && (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedLogistica.nome}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formGridQtdMinima">
                                    <Form.Label>Tipo da Logistica</Form.Label>
                                    <Form.Select
                                        name="tipo"
                                        value={selectedLogistica.tipo}
                                        onChange={handleChange}
                                    >
                                        {TIPO_LOGISTICA.map((tipo, index) => (
                                            <option key={index} value={tipo}>
                                                {tipo}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridEValor">
                                    <Form.Label>Valor Diária</Form.Label>
                                    <Form.Control
                                        name="valor"
                                        placeholder='30,50'
                                        value={selectedLogistica.valor}
                                        onChange={handleChange}
                                        type="number"
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridDescricao">
                                <Form.Label>Descricao</Form.Label>
                                <Form.Control
                                    name="descricao"
                                    value={selectedLogistica.descricao}
                                    onChange={handleChange}
                                    placeholder="Logistica feita pelo chef"
                                    type='text'
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formGridDescricao">
                                <Form.Label>Em SP?</Form.Label>
                                <Form.Check
                                    name="in_sp"
                                    checked={selectedLogistica.in_sp}
                                    onChange={handleChange}
                                    type='switch'
                                />
                            </Form.Group>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="d-flex justify-content-between w-100">
                        <Button disabled={selectedLogistica !== null && selectedLogistica.id_logistica === null}
                                variant="danger"
                                type="submit" onClick={handleExcluirLogistica}>
                            Excluir
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            {selectedLogistica !== null && selectedLogistica.id_logistica === null ? 'Criar' : 'Editar'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );

}