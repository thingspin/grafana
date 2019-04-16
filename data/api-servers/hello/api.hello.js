var args = require('minimist')(process.argv.slice(2), {  
  default: {
      port: 5555
  },
});

const express = require('express');
const app = express();

let hello = [
  {
    "id" : 0,
    "name": "ThingSPIN 0",
    "message" : "Hello ThingSPIN 0"
  },
  {
    "id" : 1,
    "name": "ThingSPIN 1",
    "message" : "Hello ThingSPIN 1"
  },
]

app.get('/', (req, res) => {
  res.json(hello);
 });

 app.get('/:id', (req, res) => {
  console.log(req.params.id);
  const id = parseInt(req.params.id, 10);

  if (id === null) {
    return res.status(400).json({error: 'Incorrect id'});
  }

  let item = hello.filter(item => {
    return item.id === id;
  });

  res.json(item[0]);
});

app.listen(args.port, () => {
  console.log('Sample Microservice listening on port ' + args.port);
});