import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as userControllers from "../controllers/userControllers";
import { registerSchema } from "../schemas/registerUser";
import { loginSchema } from "../schemas/loginUser";
import authenticate from "../auth/authenticate";

/*

- show users that that one user is following
- a users show followers
-block user
-unblock user
-remove a user
-get comments for a post
-post comment
-delete comment
-archive POST so only user can see
-delete POST
-toggle like
-show archived posts for only user
-show all posts by one user
update user
search user
svara en kommentar




*/

export async function userRoutes(
  httpServer: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  httpServer.route({
    method: "POST",
    url: "/register",
    handler: userControllers.register,
    schema: registerSchema,
  });

  httpServer.route({
    method: "POST",
    url: "/login",
    handler: userControllers.login,
    schema: loginSchema,
  });

  httpServer.route({
    method: "POST",
    url: "/toggle-follow/:username",
    handler: userControllers.toggleFollow,
    preHandler: [authenticate],
  });
}

export default userRoutes;
