import type { FastifyReply, FastifyRequest } from "fastify";
import repository from "../repository";
import type { CreatePostRequest } from "../types/http";
import type { TokenPayload } from "../types/auth";
import uploadImageToS3 from "../adapters/s3";

export async function createPost(
  request: FastifyRequest<{ Body: CreatePostRequest }>,
  reply: FastifyReply,
) {
  const tokenPayload = request.user as TokenPayload;

  const multipartData = await request.file();

  if (!multipartData) {
    return reply.status(400).send({ message: "Image is required" });
  }

  // Accepterade filtyper
  const allowedMimeTypes = ["image/jpeg", "image/png"];

  if (!allowedMimeTypes.includes(multipartData.mimetype)) {
    return reply
      .status(400)
      .send({ message: "Only JPEG and PNG images are allowed" });
  }

  // Tar upp lite minne
  const buffer = await multipartData?.toBuffer();

  const uploadedUrl = await uploadImageToS3(
    buffer,
    multipartData.filename,
    multipartData.mimetype,
  );

  if (!uploadedUrl) {
    return reply.status(500).send({ message: "Failed to upload image" });
  }

  const caption = multipartData.fields?.caption?.value;

  const createdPost = await repository.posts.insertOne(
    caption,
    uploadedUrl,
    tokenPayload.username,
  );

  return reply.status(201).send(createdPost);
}

export async function getFeed(request: FastifyRequest, reply: FastifyReply) {
  // Plocka ut den inloggade användarens username från JWT:n (finns i request.user)
  const username = request.user.username;

  const feed = await repository.posts.getFeedForUser(username);

  return reply.status(200).send(feed);
}

export async function deletePost(
  request: FastifyRequest<{ Params: { postId: string } }>,
  reply: FastifyReply,
) {
  const username = request.user.username;
  const postId = request.params.postId;

  const deleted = await repository.posts.deletePostById(username, postId);
  if (!deleted) {
    return reply.status(404).send({
      message: "Post not found or not authorized",
    });
  }

  return reply.status(200).send({
    message: "Post soft deleted",
    post: deleted,
  });
}

export async function getPostById(
  request: FastifyRequest<{ Params: { postId: string } }>,
  reply: FastifyReply,
) {
  const postId = request.params.postId;
  const currentUsername = request.user.username;

  const post = await repository.posts.getPostById(postId);

  if (!post) {
    return reply.status(404).send({
      message: "Post not found",
    });
  }

  if (post.username === currentUsername) {
    return reply.send(post);
  }

  if (post.visibility === "public") {
    return reply.send(post);
  }

  const isFollowingUser = await repository.users.isFollowing(
    currentUsername,
    post.username,
  );

  if (!isFollowingUser) {
    return reply.status(403).send({
      message: "Account is private",
    });
  }

  return reply.send(post);
}

export async function getPostsByUser(
  request: FastifyRequest<{ Params: { username: string } }>,
  reply: FastifyReply,
) {
  const username = request.params.username;
  const currentUser = request.user.username;

  const posts = await repository.posts.getPostsByUser(username);

  if (posts.length === 0) {
    return reply.status(404).send({
      message: "No posts or no user found",
    });
  }

  const owner = posts[0];

  if (owner.owner_username !== currentUser && owner.visibility === "private") {
    const isFollowingUser = await repository.users.isFollowing(
      currentUser,
      username,
    );
    if (!isFollowingUser) {
      return reply.status(403).send({
        message: "Account is private",
      });
    }
  }

  return reply.send(posts);
}

// http://10.100.2.55:3000
