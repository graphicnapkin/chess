import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import App from './App'
import './index.css'

console.log('loading ap')

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
