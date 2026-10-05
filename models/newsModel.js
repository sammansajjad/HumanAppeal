const db = require("./db");

const getAllNews = (callback) => {
    const query = `
        SELECT 
            news_posts.id AS id,
            news_posts.title_en AS title,
            news_categories.name_en AS category,
            users.name AS author,
            COALESCE(news_posts.published_at, news_posts.created_at) AS date,
            news_posts.excerpt_en AS excerpt,
            news_posts.content_en AS content,
            news_posts.status AS status,
            news_posts.featured_image AS coverImage

        FROM news_posts

        JOIN news_categories
        ON news_posts.news_category_id = news_categories.id

        LEFT JOIN users
        ON news_posts.author_id = users.id

        WHERE news_posts.deleted_at IS NULL
        AND news_posts.status = 'published'

        ORDER BY news_posts.created_at DESC
    `;

    db.query(query, callback);
};

const getNewsById = (id, callback) => {
    const query = `
        SELECT 
            news_posts.id AS id,
            news_posts.title_en AS title,
            news_categories.name_en AS category,
            users.name AS author,
            COALESCE(news_posts.published_at, news_posts.created_at) AS date,
            news_posts.excerpt_en AS excerpt,
            news_posts.content_en AS content,
            news_posts.status AS status,
            news_posts.featured_image AS coverImage

        FROM news_posts

        JOIN news_categories
        ON news_posts.news_category_id = news_categories.id

        LEFT JOIN users
        ON news_posts.author_id = users.id

        WHERE news_posts.id = ?
        AND news_posts.deleted_at IS NULL
        AND news_posts.status = 'published'

        LIMIT 1
    `;

    db.query(query, [id], callback);
};

// FIX: added "AND deleted_at IS NULL". Previously a soft-deleted
// user could still be matched by name and assigned as a news item's
// author via createNews/updateNews.
const findAuthorByName = (author, callback) => {
    db.query(
        "SELECT id FROM users WHERE name=? AND deleted_at IS NULL LIMIT 1",
        [author],
        callback
    );
};

// FIX: added "AND deleted_at IS NULL". Previously a soft-deleted
// category could still be matched by name and assigned to a new or
// updated news item, silently undoing the soft-delete.
const findCategoryByName = (category, callback) => {
    db.query(
        "SELECT id FROM news_categories WHERE name_en=? AND deleted_at IS NULL LIMIT 1",
        [category],
        callback
    );
};

const createNews = (data, callback) => {
    const query = `
        INSERT INTO news_posts
        (
            news_category_id,
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
        data.news_category_id,
        data.author_id,
        data.title,
        data.slug,
       data.excerpt || null,
data.content || null,
        data.coverImage || null,
        0,
        data.status || "draft"
    ];

    db.query(query, values, callback);
};

const updateNews = (id, data, callback) => {
    const query = `
        UPDATE news_posts

        SET

        news_category_id=?,
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
        data.news_category_id,
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

const deleteNews = (id, callback) => {
    const query = `
        UPDATE news_posts

        SET deleted_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    db.query(query, [id], callback);
};

module.exports = {
    getAllNews,
    getNewsById,
    findAuthorByName,
    findCategoryByName,
    createNews,
    updateNews,
    deleteNews
};