const db = require("./db");

const getAllProjects = (callback) => {
    const query = `
        SELECT 
            projects.id AS id,
            projects.title_en AS title,
            project_categories.name_en AS category,
            COALESCE(projects.published_at, projects.created_at) AS date,
            projects.description_en AS content,
            projects.location AS location,
            projects.status AS status,
            projects.image AS coverImage

        FROM projects

        JOIN project_categories
        ON projects.project_category_id = project_categories.id

        WHERE projects.deleted_at IS NULL
        AND projects.status = 'published'

        ORDER BY projects.created_at DESC
    `;

    db.query(query, callback);
}; 
const getProjectById = (id, callback) => {
    const query = `
        SELECT 
            projects.id AS id,
            projects.title_en AS title,
            project_categories.name_en AS category,
            COALESCE(projects.published_at, projects.created_at) AS date,
            projects.description_en AS content,
            projects.location AS location,
            projects.status AS status,
            projects.image AS coverImage

        FROM projects

        JOIN project_categories
        ON projects.project_category_id = project_categories.id

        WHERE projects.id = ?
        AND projects.deleted_at IS NULL
        AND projects.status = 'published'

        LIMIT 1
    `;

    db.query(query, [id], callback);
};

// FIX: added "AND deleted_at IS NULL". Previously this matched
// soft-deleted categories by name too, meaning a category an admin
// intentionally soft-deleted could still be silently assigned to a
// new or updated project via createProject/updateProject, undoing
// the soft-delete.
const findCategoryByName = (category, callback) => {
    db.query(
        "SELECT id FROM project_categories WHERE name_en=? AND deleted_at IS NULL LIMIT 1",
        [category],
        callback
    );
};

const createProject = (data, callback) => {
    const query = `
        INSERT INTO projects
        (
            project_category_id,
            title_en,
            slug,
            location,
            description_en,
            image,
            featured,
            status,
            created_at,
            updated_at
        )

        VALUES(?,?,?,?,?,?,?,?,NOW(),NOW())
    `;

    const values = [
        data.project_category_id,
        data.title,
        data.slug,
        data.location || null,
        data.content,
        data.coverImage || null,
        0,
        data.status || "draft"
    ];

    db.query(query, values, callback);
};

const updateProject = (id, data, callback) => {
    const query = `
        UPDATE projects

        SET

        project_category_id=?,
        title_en=?,
        slug=?,
        location=?,
        description_en=?,
        image=?,
        status=?,
        updated_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    const values = [
        data.project_category_id,
        data.title,
        data.slug,
        data.location || null,
        data.content,
        data.coverImage || null,
        data.status || "draft",
        id
    ];

    db.query(query, values, callback);
};

const deleteProject = (id, callback) => {
    const query = `
        UPDATE projects

        SET deleted_at=NOW()

        WHERE id=?
        AND deleted_at IS NULL
    `;

    db.query(query, [id], callback);
};

module.exports = {
    getAllProjects,
    getProjectById,
    findCategoryByName,
    createProject,
    updateProject,
    deleteProject
};