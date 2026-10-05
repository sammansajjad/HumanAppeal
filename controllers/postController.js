const postModel = require("../models/postModel");

// =====================================================
// VALIDATION HELPERS
// =====================================================

const parsePositiveInteger = (value) => {

const number = Number(value);

if (
    !Number.isInteger(number) ||
    number <= 0
) {
    return null;
}

return number;


};

// =====================================================
// GET ALL POSTS
// =====================================================

const getAllPosts = (req, res) => {

postModel.getAllPosts((err, results) => {

    if (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Database query failed"
        });

    }

    res.json({
        success: true,
        data: results
    });

});


};

// =====================================================
// GET POST BY ID
// =====================================================

const getPostById = (req, res) => {


const id =
    parsePositiveInteger(
        req.params.id
    );

if (!id) {

    return res.status(400).json({
        success: false,
        message: "Invalid post ID"
    });

}

postModel.getPostById(
    id,

    (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database query failed"
            });

        }

        if (
            !results ||
            results.length === 0
        ) {

            return res.status(404).json({
                success: false,
                message: "Post not found"
            });

        }

        res.json({
            success: true,
            data: results[0]
        });

    }

);


};

// =====================================================
// CREATE POST
// =====================================================

const createPost = (req, res) => {


const {
    title,
    excerpt,
    content,
    status,
    coverImage,
    author,
    category
} = req.body;


if (!title) {

    return res.status(400).json({
        success: false,
        message: "Title is required"
    });

}


const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");


postModel.findAuthorByName(
    author,

    (err, authorResults) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Author lookup failed"
            });

        }


        // =====================================================
        // AUTHOR MUST EXIST
        // =====================================================

        if (
            !authorResults ||
            authorResults.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid author"
            });

        }


        const author_id =
            authorResults[0].id;


        postModel.findCategoryByName(
            category,

            (err, categoryResults) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Category lookup failed"
                    });

                }


                if (
                    !categoryResults ||
                    categoryResults.length === 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid category"
                    });

                }


                const posts_category_id =
                    categoryResults[0].id;


                postModel.createPost(

                    {
                        posts_category_id,
                        author_id,
                        title,
                        slug,
                        excerpt,
                        content,
                        coverImage,
                        status
                    },

                    (err, result) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message: "Insert failed"
                            });

                        }


                        res.json({
                            message:
                                "Post added successfully",

                            id:
                                result.insertId
                        });

                    }

                );

            }

        );

    }

);


};

// =====================================================
// UPDATE POST
// =====================================================

const updatePost = (req, res) => {

const id =
    parsePositiveInteger(
        req.params.id
    );


if (!id) {

    return res.status(400).json({
        success: false,
        message: "Invalid post ID"
    });

}


const {
    title,
    excerpt,
    content,
    status,
    coverImage,
    author,
    category
} = req.body;


if (!title) {

    return res.status(400).json({
        success: false,
        message: "Title is required"
    });

}


const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");


postModel.findAuthorByName(
    author,

    (err, authorResults) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Author lookup failed"
            });

        }


        // =====================================================
        // AUTHOR MUST EXIST
        // =====================================================

        if (
            !authorResults ||
            authorResults.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid author"
            });

        }


        const author_id =
            authorResults[0].id;


        postModel.findCategoryByName(
            category,

            (err, categoryResults) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Category lookup failed"
                    });

                }


                if (
                    !categoryResults ||
                    categoryResults.length === 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid category"
                    });

                }


                const posts_category_id =
                    categoryResults[0].id;


                postModel.updatePost(

                    id,

                    {
                        posts_category_id,
                        author_id,
                        title,
                        slug,
                        excerpt,
                        content,
                        coverImage,
                        status
                    },

                    (err, result) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message: "Update failed"
                            });

                        }


                        if (
                            !result ||
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message: "Post not found"
                            });

                        }


                        res.json({

                            message:
                                "Post updated successfully",

                            id

                        });

                    }

                );

            }

        );

    }

);


};

// =====================================================
// DELETE POST
// =====================================================

const deletePost = (req, res) => {

const id =
    parsePositiveInteger(
        req.params.id
    );


if (!id) {

    return res.status(400).json({
        success: false,
        message: "Invalid post ID"
    });

}


postModel.deletePost(

    id,

    (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Delete failed"
            });

        }


        if (
            !result ||
            result.affectedRows === 0
        ) {

            return res.status(404).json({
                success: false,
                message: "Post not found"
            });

        }


        res.status(200).json({
            success: true
        });

    }

);

};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
getAllPosts,
getPostById,
createPost,
updatePost,
deletePost
};
