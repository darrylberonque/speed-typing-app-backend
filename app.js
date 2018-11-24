const express = require('express');
const express_graphql = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');

mongoose.connect('mongodb://darrylb:darrylb123@ds261440.mlab.com:61440/speed-typing-app');
mongoose.connection.once('open', () => {
    console.log('connected to database');
});

// Create an express server with a GraphQL endpoint
const app = express()
app.use('/graphql', express_graphql({
  schema: schema,
  graphiql: true
}));

app.listen(8000, () => {
  console.log('Server is running on port 8000...')
});
