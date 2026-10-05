const db = require("./db");

const getAllBlogs = (callback) => {
    const query = `
        SELECT
            blog_posts.id AS id,
            blog_posts.title_en AS title,
            blog_categories.name_en AS category,
            users.name AS author,
            COALESCE(blog_posts.published_at, blog_posts.created_at) AS date,
            blog_posts.excerpt_en AS excerpt,
            blog_posts.content_en AS content,
            blog_posts.status AS status,
            blog_posts.featured_image AS coverImage

        FROM blog_posts

        JOIN blog_categories
        ON blog_posts.blog_category_id = blog_categories.id

        LEFT JOIN users
        ON blog_posts.author_id = users.id

        WHERE blog_posts.deleted_at IS NULL
        AND blog_posts.status = 'published'

        ORDER BY blog_posts.created_at DESC
    `;

    db.query(query, callback);
};

const getBlogById = (id, callback) => {
    const query = `
        SELECT
            blog_posts.id AS id,
            blog_posts.title_en AS title,
            blog_categories.name_en AS category,
            users.name AS author,
            COALESCE(blog_posts.published_at, blog_posts.created_at) AS date,
            blog_posts.excerpt_en AS excerpt,
            blog_posts.content_en AS content,
            blog_posts.status AS status,
            blog_posts.featured_image AS coverImage

        FROM blog_posts

        JOIN blog_categories
        ON blog_posts.blog_category_id = blog_categories.id

        LEFT JOIN users
        ON blog_posts.author_id = users.id

        WHERE blog_posts.id = ?
        AND blog_posts.deleted_at IS NULL
        AND blog_posts.status = 'published'

        LIMIT 1
    `;

    db.query(query, [id], callback);
};

// FIX: added "AND deleted_at IS NULL". Previously a soft-deleted
// user could still be matched by name and assigned as a blog's
// author via createBlog/updateBlog.
const findAuthorByName = (author, callback) => {
    db.query(
        "SELECT id FROM users WHERE name=? AND deleted_at IS NULL LIMIT 1",
        [author],
        callback
    );
};

// FIX: added "AND deleted_at IS NULL". Previously a soft-deleted
// category could still be matched by name and assigned to a new or
// updated blog, silently undoing the soft-delete.
const findCategoryByName = (category, callback) => {
    db.query(
        "SELECT id FROM blog_categories WHERE name_en=? AND deleted_at IS NULL LIMIT 1",
        [category],
        callback
    );
};

const createBlog = (data, callback) => {
    const query = `
        INSERT INTO blog_posts
        (
            blog_category_id,
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
        data.blog_category_id,
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

const updateBlog = (id, data, callback) => {
    const query = `
        UPDATE blog_posts

        SET

        blog_category_id=?,
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
        data.blog_category_id,
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

const deleteBlog = (id, callback) => {
    const query = `
        UPDATE blog_posts

        SET deleted_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    db.query(query, [id], callback);
};

module.exports = {
    getAllBlogs,
    getBlogById,
    findAuthorByName,
    findCategoryByName,
    createBlog,
    updateBlog,
    deleteBlog
};