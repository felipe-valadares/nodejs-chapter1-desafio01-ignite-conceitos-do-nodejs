const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers

  const verifiedUser = users.find(verifiedUser => verifiedUser.username === username);

  if (!verifiedUser) {
    return response.status(400).json({ error: "User doesn't exists" })
  }

  request.verifiedUser = verifiedUser

  return next()
}

app.post('/users', (request, response) => {

  const { name, username } = request.body

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const existentUser = users.find(verifiedUser => verifiedUser.username === username);

  if (existentUser) {
    return response.status(400).json({ error: "Username already exists" })
  }

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request

  return response.json(verifiedUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request
  const { title, deadline } = request.body

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  verifiedUser.todos.push(newTask)

  return response.status(201).send(newTask);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request
  const { title, deadline } = request.body

  const id = request.params.id
  const todo = verifiedUser.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Task not found' })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request

  const id = request.params.id
  const todo = verifiedUser.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Task not found' })
  }

  todo.done = true;

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { verifiedUser } = request

  const id = request.params.id
  const todoIndex = verifiedUser.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Task not found' })
  }

  verifiedUser.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;