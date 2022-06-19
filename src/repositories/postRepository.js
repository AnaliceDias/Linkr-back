import db from "../../config/db.js";

async function insertPost(id, text, link, userId) {
  return db.query(
    `
    INSERT INTO posts (id , text, link, "userId") 
    VALUES ($1, $2, $3 , $4)
  `,
    [id, text, link, userId]
  );
}

async function getPostById(postId) {
  return db.query(
    `
    SELECT * FROM posts
    WHERE id = $1
  
  `,
    [postId]
  );
}

async function getUserPosts(userId) {
  return db.query(
    `
    SELECT * FROM posts
    JOIN users ON posts."userId" = users.id
    WHERE users.id = $1
  
  `,
    [userId]
  );
}

async function deletePost(postId) {
  return db.query(
    `
    DELETE FROM posts
    WHERE id = $1
  `,
    [postId]
  );
}

async function getTimeline() {
  return db.query(
    `SELECT p.id AS id, p.text AS text, p.link AS link, u.name AS name, u.picture, u.id as "userId"
    FROM posts p
    JOIN users u
    ON u.id=p."userId"
    ORDER BY p."createdAt" DESC
    LIMIT 20`
  );
}

async function updatePost(id, text) {
  return db.query(`UPDATE posts SET text = $1 WHERE id = $2`, [text, id]);
}

const postRepository = {
  insertPost,
  getPostById,
  deletePost,
  getTimeline,
  getUserPosts,
  updatePost,
};

export default postRepository;
