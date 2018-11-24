const graphql = require('graphql')
const _ = require('lodash')
const User = require('../models/user')
const Trial = require('../models/trial')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
} = graphql

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString},
    email: { type: GraphQLString},
    imageURL: { type: GraphQLString },
    trials: {
      type: new GraphQLList(TrialType),
      resolve(parent, args) {
        return Trial.find({ userID: parent.id });
      }
    }
  })
});

const TrialType = new GraphQLObjectType({
  name: 'Trial',
  fields: () => ({
    id: { type: GraphQLID },
    paragraph: { type: GraphQLString},
    user: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userID)
      }
    },
    metrics: {
      type: MetricsType,
      resolve(parent, args) {
        return parent.metrics
      }
    }
  })
});

const MetricsType = new GraphQLObjectType({
  name: 'Metrics',
  fields: () => ({
    time: { type: GraphQLInt },
    wpm: { type: GraphQLInt },
    cpm: { type: GraphQLInt },
    accuracy: { type: GraphQLFloat },
    results: { type: new GraphQLList(GraphQLBoolean) }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: {type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      }
    },
    trial: {
      type: TrialType,
      args: { id: {type: GraphQLID } },
      resolve(parent, args) {
        return Trial.findById(args.id);
      }
    },
    trials: {
      type: new GraphQLList(TrialType),
      resolve(parent, args) {
        return Trial.find({});
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    postTrial: {
      type: TrialType,
      args: {
        paragraph: { type: GraphQLString },
        userID: { type: GraphQLString },
        metrics: { type: MetricsType }
      },
      resolve(parent, args) {
        let trial = new Trial({
          paragraph: args.paragraph,
          userID: args.userID,
          metrics: {
            time: args.metrics.time,
            wpm: args.metrics.wpm,
            cpm: args.metrics.cpm,
            accuracy: args.metrics.accuracy,
            results: args.metrics.results
          }
        });

        return trial.save();
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
