import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';

import { readFileSync } from 'fs';
import axios from 'axios';
import gql from 'graphql-tag';

import { AuthenticationError } from './utils/errors';
import AccountsAPI from './datasources/accounts';

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
import resolvers from './resolvers';

async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
    }),
  });

  const port = 4002;
  const subgraphName = 'accounts';

  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        const userId = token.split(' ')[1]; // get the user name after 'Bearer '
        const { cache } = server;

        let userInfo = {};
        if (userId) {
          const { data } = await axios
            .get(`http://localhost:4011/login/${userId}`)
            .catch((error) => {
              throw AuthenticationError();
            });

          userInfo = { userId: data.id, userRole: data.role };
        }

        return {
          ...userInfo,
          dataSources: {
            accountsAPI: new AccountsAPI({ cache }),
          },
        };
      },
      listen: {
        port,
      },
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (err) {
    console.error(err);
  }
}

startApolloServer();
