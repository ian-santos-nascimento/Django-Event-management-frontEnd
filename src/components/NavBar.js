import axios from "axios";
import csrftoken from "../ApiCall/CsrfToken";
import React from "react";
import {BrowserRouter as Router, Link, Route, Routes,} from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './NavBar.css'
import LocalList from "./LocalList.tsx";
import CidadeList from "./CidadeList.tsx";
import ClienteList from "./ClienteList.tsx"
import ComidaList from "./CardapioList.tsx"
import LogisticaList from "./LogisticaList.tsx"
import EventoList from "./EventoList.tsx";
import OrcamentoList from "./OrcamentoList.tsx";

const apiUrl = process.env.REACT_APP_API_URL;
const logo_url = './bg-logo.png'
export default function NavBar({setAuthenticated, isAuthenticated}) {
    const logout = async () => {
        try {
            console.log("SAINDO LOGOUT")
            await axios.post(`${apiUrl}logout/`, {}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            setAuthenticated(false);
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    return (
        <Router>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand href="/">
                        <img src={logo_url}
                             alt="Logo"/>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll"/>
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        style={{maxHeight: '100px'}}
                        navbarScroll
                    >
                        <Nav.Link>
                            <Link className="nav-link" to="/">Home</Link>
                        </Nav.Link>
                        <Nav.Link>
                            <Link className="nav-link" to="/locais">Locais</Link>
                        </Nav.Link>
                        <Nav.Link>
                            <Link className="nav-link" to="/cidades">Cidades</Link>
                        </Nav.Link>
                        <Nav.Link>
                            <Link className="nav-link" to="/clientes">Clientes</Link>
                        </Nav.Link>
                        <Nav.Link>
                            <Link className="nav-link" to="/cardapio">Cardápio</Link>
                        </Nav.Link>
                        <Nav.Link>
                            <Link className="nav-link" to="/logisticas">Logistica</Link>
                        </Nav.Link>
                        <Nav.Link>
                            <Link className="nav-link" to="/orcamentos">Orçamentos</Link>
                        </Nav.Link>
                    </Nav>

                    <Nav>
                        <Nav.Link>
                            <Button className="nav-link" onClick={logout}>LogOut</Button>
                        </Nav.Link>
                    </Nav>

                </Container>
            </Navbar>
            <Routes>
                <Route
                    path="/locais"
                    element={<LocalList/>}
                ></Route>
                <Route
                    path="/cidades"
                    element={<CidadeList/>}
                ></Route>
                <Route
                    path="/clientes"
                    element={<ClienteList/>}
                ></Route>
                <Route
                    path="/cardapio"
                    element={<ComidaList/>}
                ></Route>
                <Route
                    path="/logisticas"
                    element={<LogisticaList/>}
                ></Route>
                <Route
                    path="/"
                    element={<EventoList/>}
                ></Route>
                <Route path='/orcamentos' element={<OrcamentoList/>}>
                </Route>
            </Routes>
        </Router>
    )
}