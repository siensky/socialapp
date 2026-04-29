import { db } from "../db/client";
import type { FeedRow, PostRow } from "../types/db";

export async function insertOne(
  caption: string = "",
  image: string,
  username: string,
): Promise<PostRow> {
  const createdAt = new Date().toISOString();
  const status = "active";

  const [created] = await db<
    PostRow[]
  >`INSERT INTO posts (status, user_id, image, caption, created_at) VALUES (${status}, (SELECT id FROM users WHERE username = ${username}), ${image}, ${caption}, ${createdAt}) RETURNING *`;

  if (!created) throw new Error("Failed to create user!");

  return created;
}

// TODO: Add pagination. Currently this will only return the first 25 posts only.
export async function getFeedForUser(username: string): Promise<FeedRow[]> {
  // Hämta inlägg från användare som den aktuella användaren följer.
  const feed = await db`WITH my_user_id AS (SELECT id
                    FROM users
                    WHERE username = ${username})
SELECT p.id,
       p.image,
       p.caption,
       p.created_at,
       u.username,
       u.profile_image,
       u.display_name AS user_display_name
FROM posts AS p
         LEFT JOIN users AS u ON p.user_id = u.id
WHERE p.status = 'active'
  AND (
    p.user_id = (SELECT id FROM my_user_id)
        OR p.user_id IN (SELECT followed_user_id
                         FROM follower_relationships
                         WHERE following_user_id = (SELECT id FROM my_user_id))
    )
ORDER BY p.created_at DESC
LIMIT 25`;

  return feed;
}


//need to add deleted at column for timestamp in db table in order
//to make cron job that hard deletes after two weeks
export async function deletePostById(username: string, postId: string) {
  const result = await db`
     UPDATE posts
    SET 
      status = 'deleted',
      deleted_at = NOW()
    WHERE id = ${postId}
    AND user_id = (
      SELECT id FROM users WHERE username = ${username}
    )
    RETURNING *;
  `;

  return result[0];

}

export async function getPostById(postId: string) {
  const [post] = await db`
    SELECT 
      p.*,
      u.username,
      u.visibility
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ${postId}
    AND p.status = 'active'
  `;

  return post;
}

export async function getPostsByUser(username: string) {
  const posts = await db`
    SELECT 
      p.id,
      p.image,
      p.caption,
      p.created_at,
      u.username AS owner_username,
      u.visibility
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE u.username = ${username}
    AND p.status = 'active'
    ORDER BY p.created_at DESC
  `;

  return posts;
}