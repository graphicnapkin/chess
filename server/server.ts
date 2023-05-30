import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

app.use(function (req, res, next) {
    res.header('Cross-Origin-Embedder-Policy', 'require-corp')
    res.header('Cross-Origin-Opener-Policy', 'same-origin')
    next()
})

app.use(express.static(path.join(__dirname, '../dist')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'))
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})
