import React from 'react'
import ReactDOM from 'react-dom'
import { Game } from './Game'
import './index.css'

function App() {
    return <Game />
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)
