// App.js

import React, {useEffect, useState} from 'react';
import {fab} from '@fortawesome/free-brands-svg-icons'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Login from './components/Login';
import NavBar from "./components/NavBar";

library.add(fab, faSearch, faEdit)


const App = () => {
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!localStorage.getItem('access_token');
    if (!isAuthenticated) {
        return <Login/>
    }

    return (
        <div>
            <NavBar  isAuthenticated={isAuthenticated} />
        </div>
    );
}

export default App;
