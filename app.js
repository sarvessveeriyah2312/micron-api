const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

class Machine {
  constructor(id, name, area, status, recipe) {
    this.id = id;
    this.name = name;
    this.area = area;
    this.status = status;
    this.recipe = recipe;
  }
}

class Recipe {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

const app = express();
const port = process.env.PORT || 3000; // Allow environment variable or default to 3000
const secretKey = '231299'; // Change this with a strong secret key in production

// Middleware for setting Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; font-src 'self'");
  next();
});

// Serve static files (including the font file) from the root directory
app.use(express.static(path.join(__dirname, '/')));

app.use(bodyParser.json());

// In-memory data store
const machines = [
  new Machine(1, 'Machine1', 'Assembly', 'up', new Recipe(1, 'Recipe1')),
  new Machine(2, 'Machine2', 'Test', 'down', new Recipe(2, 'Recipe2')),
  new Machine(3, 'Machine3', 'Production', 'up', new Recipe(3, 'Recipe3')),
  new Machine(4, 'Machine4', 'Test', 'down', new Recipe(4, 'Recipe4')),
  new Machine(5, 'Machine5', 'Assembly', 'up', new Recipe(5, 'Recipe5')),
  new Machine(6, 'Machine6', 'Test', 'down', new Recipe(6, 'Recipe6')),
  new Machine(7, 'Machine7', 'Assembly', 'up', new Recipe(7, 'Recipe7')),
  new Machine(8, 'Machine8', 'Test', 'down', new Recipe(8, 'Recipe8')),
  new Machine(9, 'Machine9', 'Production', 'up', new Recipe(9, 'Recipe9')),
  new Machine(10, 'Machine10', 'Test', 'down', new Recipe(10, 'Recipe10')),
];

// Middleware for basic authorization
const authorize = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token missing' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Add user information to the request for further processing if needed
    req.user = decoded;
    next();
  });
};

// Use Case 1: Queries a list of machines by area
app.get('/api/machines/byArea', authorize, (req, res) => {
  const { area } = req.query;
  const filteredMachines = machines.filter(machine => machine.area === area);
  res.json(filteredMachines.map(machine => ({ area: machine.area, machine })));
});

// Use Case 2: Queries a list of recipes in the machine
app.get('/api/machines/recipes', authorize, (req, res) => {
  const { machine } = req.query;
  const foundMachine = machines.find(m => m.name === machine);
  if (foundMachine) {
    res.json({ machine: foundMachine.name, recipe: foundMachine.recipe });
  } else {
    res.status(404).json({ error: 'Machine not found' });
  }
});

// Use Case 3: Queries a list of machines by status in an area
app.get('/api/machines/byStatus', authorize, (req, res) => {
  const { area, status } = req.query;
  const filteredMachines = machines.filter(machine => machine.area === area && machine.status === status);
  res.json(filteredMachines.map(machine => ({ machine, area: machine.area, status: machine.status })));
});

// Login route to obtain a token (for simplicity, you might want to use a more secure authentication method)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Dummy user authentication (replace with your actual authentication logic)
  if (username === 'user' && password === 'password') {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
