const graphql = require('graphql')
const _ = require('lodash')
const User = require('../models/user')
const Trial = require('../models/trial')
const Paragraph = require('../models/paragraph')

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
} = graphql

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString},
    email: { type: GraphQLString},
    imageURL: { type: GraphQLString },
    authID: { type: GraphQLString },
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
    userInput: { type: GraphQLString },
    metrics: { type: MetricsType }
  })
});

const ParagraphType = new GraphQLObjectType({
  name: 'Paragraph',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString}
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
    },
    paragraphs: {
      type: new GraphQLList(ParagraphType),
      resolve(parent, args) {
        return Paragraph.find({});
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
    accuracy: { type: GraphQLFloat }
  })
});

const MetricsInputType = new GraphQLInputObjectType ({
  name: 'MetricsInput',
  fields: () => ({
    time: { type: GraphQLInt },
    wpm: { type: GraphQLInt },
    cpm: { type: GraphQLInt },
    accuracy: { type: GraphQLFloat }
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
        userInput: { type: GraphQLString },
        metrics: {
          type: MetricsInputType,
          args: {
            time: { type: GraphQLInt },
            wpm: { type: GraphQLInt },
            cpm: { type: GraphQLInt },
            accuracy: { type: GraphQLFloat }
          },
          resolve(parent, args) {
            let metrics = {
              time: args.time,
              wpm: args.wpm,
              cpm: args.cpm,
              accuracy: args.accuracy
            };

            return metrics
          }
        }
      },
      resolve(parent, args) {
        let trial = new Trial({
          paragraph: args.paragraph,
          userID: args.userID,
          userInput: args.userInput,
          metrics: args.metrics
        });

        return trial.save();
      }
    },
    postUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString},
        email: { type: GraphQLString},
        imageURL: { type: GraphQLString },
        authID: { type: GraphQLString }
      },
      resolve(parent, args) {
        var postedUser = new Promise(function(resolve, reject) {
          let user = new User({
            name: args.name,
            email: args.email,
            imageURL: args.imageURL,
            authID: args.authID
          });

          User.distinct('authID', function(error, authIDs) {
            if (!authIDs.includes(user.authID)) {
              resolve(user.save());
            } else {
              var existingUser = User.findOne({ authID: user.authID}).exec();
              existingUser.then(function(data) {
                  resolve(data);
              });
            }
          });
        });

        return postedUser;
      }
    },
    postParagraph: {
      type: ParagraphType,
      args: {
        content: { type: GraphQLString }
      },
      resolve(parent, args) {
        let paragraph = new Paragraph({
          content: args.content
        });

        return paragraph.save();
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
