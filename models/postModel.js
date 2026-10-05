const db = require("./db");

const getAllPosts = (callback) => {
    const query = `
        SELECT 
            posts.id AS id,
            posts.title_en AS title,
            posts_categories.name_en AS category,
            users.name AS author,
            COALESCE(posts.published_at, posts.created_at) AS date,
            posts.excerpt_en AS excerpt,
            posts.content_en AS content,
            posts.status AS status,
            posts.featured_image AS coverImage

        FROM posts

        JOIN posts_categories
        ON posts.posts_category_id = posts_categories.id

        LEFT JOIN users
        ON posts.author_id = users.id

        WHERE posts.deleted_at IS NULL
        AND posts.status = 'published'

        ORDER BY posts.created_at DESC
    `;

    db.query(query, callback);
};

const getPostById = (id, callback) => {
    const query = `
        SELECT 
            posts.id AS id,
            posts.title_en AS title,
            posts_categories.name_en AS category,
            users.name AS author,
            COALESCE(posts.published_at, posts.created_at) AS date,
            posts.excerpt_en AS excerpt,
            posts.content_en AS content,
            posts.status AS status,
            posts.featured_image AS coverImage

        FROM posts

        JOIN posts_categories
        ON posts.posts_category_id = posts_categories.id

        LEFT JOIN users
        ON posts.author_id = users.id

        WHERE posts.id = ?
        AND posts.deleted_at IS NULL
        AND posts.status = 'published'

        LIMIT 1
    `;

    db.query(query, [id], callback);
};

const findAuthorByName = (author, callback) => {
    db.query(
        "SELECT id FROM users WHERE name=? AND deleted_at IS NULL LIMIT 1",
        [author],
        callback
    );
};

const findCategoryByName = (category, callback) => {
    db.query(
        "SELECT id FROM posts_categories WHERE name_en=? LIMIT 1",
        [category],
        callback
    );
};

const createPost = (data, callback) => {
    const query = `
        INSERT INTO posts
        (
            posts_category_id,
            author_id,
            title_en,
            slug,
            excerpt_en,
            content_en,
            featured_image,
            featured,
            status,
            created_at,
            updated_at
        )

        VALUES(?,?,?,?,?,?,?,?,?,NOW(),NOW())
    `;

    const values = [
        data.posts_category_id,
        data.author_id,
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.coverImage || null,
        0,
        data.status || "draft"
    ];

    db.query(query, values, callback);
};

const updatePost = (id, data, callback) => {
    const query = `
        UPDATE posts

        SET

        posts_category_id=?,
        author_id=?,
        title_en=?,
        slug=?,
        excerpt_en=?,
        content_en=?,
        featured_image=?,
        status=?,
        updated_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    const values = [
        data.posts_category_id,
        data.author_id,
        data.title,
        data.slug,
        data.excerpt,
        data.content,
        data.coverImage || null,
        data.status || "draft",
        id
    ];

    db.query(query, values, callback);
};

const deletePost = (id, callback) => {
    const query = `
        UPDATE posts

        SET deleted_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    db.query(query, [id], callback);
};

module.exports = {
    getAllPosts,
    getPostById,
    findAuthorByName,
    findCategoryByName,
    createPost,
    updatePost,
    deletePost
};