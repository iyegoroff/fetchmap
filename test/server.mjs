import express from 'express'
import FormData from 'form-data'

express()
  .get('/text', (req, res) => {
    res.send('ok')
  })
  .get('/form', (req, res) => {
    const form = new FormData()
    form.append('x', 'x')
    form.append('y', 'y')
    res.setHeader('Content-Type', 'multipart/form-data; boundary=' + form.getBoundary())
    form.pipe(res)
  })
  .get('/json', (req, res) => {
    res.json({ some: 'data' })
  })
  .get('/json-201', (req, res) => {
    res.status(201).json(['its 201'])
  })
  .get('/not-found', (req, res) => {
    res.status(404).send('Not Found')
  })
  .get('/forbidden', (req, res) => {
    res.status(403).send('Forbidden')
  })
  .get('/server-error', (req, res) => {
    res.status(500).json({ error: 'Server error' })
  })
  .get('/throw', (req, res) => {
    throw new Error('Error!')
  })
  .get('/data', (_, res) => {
    const rnd = Math.random()

    if (rnd < 0.34) {
      res.status(200).json({ some: 'data' })
    } else if (rnd < 0.67) {
      res.status(201).send('This is not JSON!')
    } else {
      res.status(500).send('Server error!')
    }
  })
  .listen(5005, () => {
    console.log(`Listening at http://localhost:5005`)
  })
