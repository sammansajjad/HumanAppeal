const db = require("./db");

const getAllPrograms = (callback) => {
    const query = `
        SELECT 
            programs.id AS id,
            programs.name_en AS title,
            program_categories.name_en AS category,
            users.name AS author,
            COALESCE(programs.published_at, programs.created_at) AS date,
            programs.description_en AS content,
            programs.status AS status,
            programs.icon AS coverImage

        FROM programs

        LEFT JOIN program_categories
        ON programs.program_category_id = program_categories.id

        LEFT JOIN users
        ON programs.author_id = users.id

        WHERE programs.deleted_at IS NULL
        AND programs.status = 'published'

        ORDER BY programs.created_at DESC
    `;

    db.query(query, callback);
}; 

const getProgramById = (id, callback) => {
    const query = `
        SELECT 
            programs.id AS id,
            programs.name_en AS title,
            program_categories.name_en AS category,
            users.name AS author,
            COALESCE(programs.published_at, programs.created_at) AS date,
            programs.description_en AS content,
            programs.status AS status,
            programs.icon AS coverImage

        FROM programs

        LEFT JOIN program_categories
        ON programs.program_category_id = program_categories.id

        LEFT JOIN users
        ON programs.author_id = users.id

        WHERE programs.id = ?
        AND programs.deleted_at IS NULL
        AND programs.status = 'published'

        LIMIT 1
    `;

    db.query(query, [id], callback);
};

// Matches findAuthorByName pattern used in blogModel.js.
// Excludes soft-deleted users so a deleted user's name can't be
// matched and assigned as a program's author.
const findAuthorByName = (author, callback) => {
    db.query(
        "SELECT id FROM users WHERE name=? AND deleted_at IS NULL LIMIT 1",
        [author],
        callback
    );
};

// Matches findCategoryByName pattern used in newsModel.js.
const findCategoryByName = (category, callback) => {
    db.query(
        "SELECT id FROM program_categories WHERE name_en=? AND deleted_at IS NULL LIMIT 1",
        [category],
        callback
    );
};

const createProgram = (data, callback) => {
    const query = `
        INSERT INTO programs
        (
            program_category_id,
            author_id,
            name_en,
            slug,
            description_en,
            icon,
            featured,
            sort_order,
            status,
            created_at,
            updated_at
        )

        VALUES(?,?,?,?,?,?,?,?,?,NOW(),NOW())
    `;

    const values = [
        data.program_category_id,
        data.author_id,
        data.title,
        data.slug,
        data.content,
        data.coverImage || null,
        0,
        0,
        data.status || "draft"
    ];

    db.query(query, values, callback);
};

const updateProgram = (id, data, callback) => {
    const query = `
        UPDATE programs

        SET

        program_category_id=?,
        author_id=?,
        name_en=?,
        slug=?,
        description_en=?,
        icon=?,
        status=?,
        updated_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    const values = [
        data.program_category_id,
        data.author_id,
        data.title,
        data.slug,
        data.content,
        data.coverImage || null,
        data.status || "draft",
        id
    ];

    db.query(query, values, callback);
};

const deleteProgram = (id, callback) => {
    const query = `
        UPDATE programs

        SET deleted_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    db.query(query, [id], callback);
};

module.exports = {
    getAllPrograms,
    getProgramById,
    findAuthorByName,
    findCategoryByName,
    createProgram,
    updateProgram,
    deleteProgram
};