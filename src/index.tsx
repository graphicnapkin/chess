import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import App from './App'
import './index.css'

console.log('loading ap')

// This use a Router because it is the only way to get the url query string
ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" Component={App}></Route>
            </Routes>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
)
