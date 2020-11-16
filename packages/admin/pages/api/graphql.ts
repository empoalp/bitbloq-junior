import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import { schema } from "../../apollo/schema";
import Iron from "@hapi/iron";
import Cookie from "cookie";

const TOKEN_SECRET = process.env.TOKEN_SECRET;

let apolloServerHandler: (req: any, res: any) => Promise<void>;

export interface IUserData {
  email: string;
  name: string;
  picture: string;
}

const parseCookies = req => {
  if (req.cookies) return req.cookies;
  const cookie = req.headers?.cookie;
  return Cookie.parse(cookie || "");
};

const getApolloServerHandler = async () => {
  if (!apolloServerHandler) {
    apolloServerHandler = new ApolloServer({
      schema,
      context: async ({ ctx }) => {
        const cookies = parseCookies(ctx.req);
        const user =
          cookies.token &&
          (await Iron.unseal(cookies.token, TOKEN_SECRET, Iron.defaults));

        return {
          ...ctx,
          user,
          setUser: async (user: IUserData) => {
            const token = await Iron.seal(user, TOKEN_SECRET, Iron.defaults);
            const cookie = Cookie.serialize("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              path: "/"
            });
            ctx.res.setHeader("Set-Cookie", cookie);
          }
        };
      }
    }).createHandler({ path: "/api/graphql" });
  }
  return apolloServerHandler;
};

export const config = { api: { bodyParser: false } };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const apolloServerHandler = await getApolloServerHandler();
  return apolloServerHandler(req, res);
};
