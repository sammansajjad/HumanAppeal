const db = require("./db");


// ================= Create Page =================

const createPage = (pageData, callback) => {

    const sql = `
        INSERT INTO pages
        (
            parent_id,
            created_by,
            title_en,
            title_ur,
            slug,
            template,
            excerpt_en,
            excerpt_ur,
            content_en,
            content_ur,
            featured_image,
            status,
            published_at,
            sort_order,
            is_homepage
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [
        pageData.parent_id,
        pageData.created_by,
        pageData.title_en,
        pageData.title_ur,
        pageData.slug,
        pageData.template,
        pageData.excerpt_en,
        pageData.excerpt_ur,
        pageData.content_en,
        pageData.content_ur,
        pageData.featured_image,
        pageData.status,
        pageData.published_at,
        pageData.sort_order,
        pageData.is_homepage
    ];


    db.query(sql, values, callback);

};



// ================= Check Slug =================

const checkSlugExists = (slug, callback) => {

    const sql = `
        SELECT id 
        FROM pages
        WHERE slug = ?
        AND deleted_at IS NULL
    `;


    db.query(sql, [slug], callback);

};



// ================= Get All Pages =================

const getAllPages = (
    page,
    limit,
    search,
    status,
    sort_by,
    sort_order,
    callback
) => {


    const offset = (page - 1) * limit;


    let sql = `
        SELECT 
            p.*,
            u.name AS creator_name
        FROM pages p
        LEFT JOIN users u 
        ON p.created_by = u.id
        WHERE p.deleted_at IS NULL
    `;


    let values = [];


    if(search){

        sql += `
            AND (
                p.title_en LIKE ?
                OR p.title_ur LIKE ?
                OR p.slug LIKE ?
            )
        `;

        values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        );
    }



    if(status){

        sql += `
            AND p.status = ?
        `;

        values.push(status);

    }



    const allowedSortColumns = [
        "id",
        "title_en",
        "created_at",
        "updated_at",
        "sort_order"
    ];


    if(!allowedSortColumns.includes(sort_by)){
        sort_by = "created_at";
    }


    sort_order =
        sort_order === "ASC" ? "ASC" : "DESC";


    sql += `
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?
    `;


    values.push(
        Number(limit),
        Number(offset)
    );


    db.query(sql, values, callback);

};



// ================= Count Pages =================

const countPages = (
    search,
    status,
    callback
)=>{


    let sql = `
        SELECT COUNT(*) AS total
        FROM pages
        WHERE deleted_at IS NULL
    `;


    let values=[];


    if(search){

        sql += `
        AND(
            title_en LIKE ?
            OR title_ur LIKE ?
            OR slug LIKE ?
        )
        `;

        values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        );

    }



    if(status){

        sql += `
        AND status = ?
        `;

        values.push(status);

    }



    db.query(sql,values,callback);

};

// ================= Get Single Page =================

const getPageById = (id, callback) => {

    const sql = `
        SELECT
            id,
            parent_id,
            created_by,
            title_en,
            title_ur,
            slug,
            template,
            excerpt_en,
            excerpt_ur,
            content_en,
            content_ur,
            featured_image,
            status,
            published_at,
            sort_order,
            is_homepage,
            created_at,
            updated_at,
            deleted_at
        FROM pages
        WHERE id = ?
        AND deleted_at IS NULL
    `;

    db.query(sql, [id], callback);

};




// ================= Update Page =================

const updatePage = (id,pageData,callback)=>{


    const sql = `
        UPDATE pages
        SET
            parent_id=?,
            title_en=?,
            title_ur=?,
            slug=?,
            template=?,
            excerpt_en=?,
            excerpt_ur=?,
            content_en=?,
            content_ur=?,
            featured_image=?,
            status=?,
            published_at=?,
            sort_order=?,
            is_homepage=?,
            updated_at=NOW()

        WHERE id=?
    `;


    const values=[

        pageData.parent_id,
        pageData.title_en,
        pageData.title_ur,
        pageData.slug,
        pageData.template,
        pageData.excerpt_en,
        pageData.excerpt_ur,
        pageData.content_en,
        pageData.content_ur,
        pageData.featured_image,
        pageData.status,
        pageData.published_at,
        pageData.sort_order,
        pageData.is_homepage,
        id

    ];


    db.query(sql,values,callback);

};



// ================= Soft Delete =================

const deletePage=(id,callback)=>{

    const sql=`
        UPDATE pages
        SET deleted_at=NOW()
        WHERE id=?
    `;


    db.query(sql,[id],callback);

};



// ================= Restore Page =================

const restorePage=(id,callback)=>{

    const sql=`
        UPDATE pages
        SET deleted_at=NULL
        WHERE id=?
    `;


    db.query(sql,[id],callback);

};



module.exports = {

    createPage,
    checkSlugExists,
    getAllPages,
    countPages,
    getPageById,
    updatePage,
    deletePage,
    restorePage

};