const express = require('express')
const cors = require('cors')
const movies = require('./movie.json')
const crypto = require('node:crypto')
const { validateMovieSchema, validatePartialMovie } = require('./schemas/movieSchemas')

const app = express()
app.use(express.json())
app.use(cors())
const PORT = process.env.PORT ?? 1234

app.disable('x-powered-by')

const ACCEPTED_ORIGINS = [
  'http://192.168.18.103:8080',
  'http://localhost:8080'
]

app.get('/movies', (req, res) => {
  /* Se quita por el uso del MIDLEWARE cors
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  */ 

  const { genre } = req.query
  if ( genre ) {
    const filteredmovies = movies.filter(movie => {
      return movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    })
    return res.json(filteredmovies)
  }
  console.log('test');
  
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({Message: 'Movie not found'})
})

app.post('/movies', (req, res) => {
  const validMovieSchema = validateMovieSchema(req.body)
  if (validMovieSchema.error) {
    return res.status(400).json({ error: JSON.parse(validMovieSchema.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...validMovieSchema.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  /*
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  */

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: "movie not found" })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: "Movie deleted" })
})

app.patch('/movies/:id', (req, res) => {
  const validMovieSchema = validatePartialMovie(req.body)

  if (!validMovieSchema.success) {
    return res.status(400).json({ message: JSON.parse(validMovieSchema.error.message) })
  }
  
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(400).json({ message: 'Movie not found' })
  }
  
  const updateMovie = {
    ...movies[movieIndex],
    ...validMovieSchema.data
  }

  movies[movieIndex] = updateMovie
  return res.json(updateMovie)
})
/*
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
  res.sendStatus(200)
})
*/

app.listen(PORT, () => {
  console.log(`App listening on port http://localhost:${PORT}`)
})
