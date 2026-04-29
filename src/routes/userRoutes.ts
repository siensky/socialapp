import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as userControllers from "../controllers/userControllers";
import { registerSchema } from "../schemas/registerUser";
import { loginSchema } from "../schemas/loginUser";
import authenticate from "../auth/authenticate";

/*
-archive POST so only user can see
-show archived posts for only user
-block user
view users blocked users
-unblock user
update user
delete user account
-remove a user following
- show users that that one user is following
- a users show followers
-toggle like

-get comments for a post
-post comment
-delete comment
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
