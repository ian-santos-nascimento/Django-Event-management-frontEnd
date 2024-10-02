// App.js

import React, {useEffect, useState} from 'react';
import {fab} from '@fortawesome/free-brands-svg-icons'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Login from './components/Login';
import NavBar from "./components/NavBar";
import sessionId from "./ApiCall/SessionId";
import Modal from "react-bootstrap/Modal";

library.add(fab, faSearch, faEdit)

const auth = sessionId


const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (auth !== null) {
                setSessionId(auth)
                setAuthenticated(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const handleClose = () => {
        setLoading(false)
    }

    if (loading) {
        return (
            <div>
                <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered show={loading} onHide={handleClose}>
                    <Modal.Body>Carregando...</Modal.Body>
                </Modal>
            </div>
        )
    }

    if (!authenticated) {
        return <Login setAuthenticated={setAuthenticated} setSessionId={setSessionId}/>
    }

    return (
        <div>
            <NavBar setAuthenticated={setAuthenticated} isAuthenticated={authenticated}/>
        </div>
    );
};

export default App;
