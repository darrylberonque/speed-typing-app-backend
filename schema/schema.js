const graphql = require('graphql')
const _ = require('lodash')
const User = require('../models/user')
const Trial = require('../models/trial')

const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull
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
    userID: { type: GraphQLString },
    metrics: { type: MetricsType }
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

const MetricsType = new GraphQLObjectType ({
  name: 'MetricsOutput',
  fields: () => ({
    time: { type: GraphQLInt },
    wpm: { type: GraphQLInt },
    cpm: { type: GraphQLInt },
    accuracy: { type: GraphQLFloat },
    results: { type: new GraphQLList(GraphQLBoolean) }
  })
});

const MetricsInputType = new GraphQLInputObjectType ({
  name: 'MetricsInput',
  fields: () => ({
    time: { type: GraphQLInt },
    wpm: { type: GraphQLInt },
    cpm: { type: GraphQLInt },
    accuracy: { type: GraphQLFloat },
    results: { type: new GraphQLList(GraphQLBoolean) }
  })
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    postTrial: {
      type: TrialType,
      args: {
        paragraph: { type: GraphQLString },
        userID: { type: GraphQLString },
        metrics: {
          type: MetricsInputType,
          args: {
            time: { type: GraphQLInt },
            wpm: { type: GraphQLInt },
            cpm: { type: GraphQLInt },
            accuracy: { type: GraphQLFloat },
            results: { type: new GraphQLList(GraphQLBoolean) }
          },
          resolve(parent, args) {
            let metrics = {
              time: args.time,
              wpm: args.wpm,
              cpm: args.cpm,
              accuracy: args.accuracy,
              results: args.results
            };

            return metrics
          }
        }
      },
      resolve(parent, args) {
        let trial = new Trial({
          paragraph: args.paragraph,
          userID: args.userID,
          metrics: args.metrics
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
