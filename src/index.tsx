import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import App from './App'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
    // This use a Router because it is the only way to get the url query string
    <Router>
        <Routes>
            <Route path="/" Component={App}></Route>
        </Routes>
    </Router>
)
