import express from 'express'

express()
  .get('/text', (req, res) => {
    res.send('ok')
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
  .listen(5005, () => {
    console.log(`Listening at http://localhost:5005`)
  })
