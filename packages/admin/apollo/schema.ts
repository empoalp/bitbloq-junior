import { makeExecutableSchema } from "graphql-tools";
import { ApolloError, gql } from "apollo-server-micro";
import fetch from "node-fetch";
import dayjs from "dayjs";
import Iron from "@hapi/iron";

const googleApiURL = "https://www.googleapis.com/oauth2/v2/userinfo";

const typeDefs = gql`
  type Query {
    me: UserData!
  }

  type Mutation {
    login(googleToken: String!): String!
  }

  type UserData {
    name: String!
    email: String!
    picture: String
  }
`;

const resolvers = {
  Query: {
    me: async (_parent, _args, { user }: any) => {
      if (!user) {
        throw new ApolloError("Login required");
      }

      const { email, name, picture } = user;
      return {
        email,
        name,
        picture
      };
    }
  },
  Mutation: {
    login: async (_parent, { googleToken }, { setUser }: any) => {
      const response = await fetch(googleApiURL, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${googleToken}`
        }
      });
      const { email, name, picture } = await response.json();
      return setUser({ email, name, picture });
    }
  }
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
