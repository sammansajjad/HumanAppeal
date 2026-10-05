const pageModel = require("../models/pageModel");


// ================= Create Page =================
const createPage = (req, res) => {

    const pageData = {

    parent_id: req.body.parent_id ?? null,

    created_by: req.user.id,

    title_en: req.body.title_en,

    title_ur: req.body.title_ur ?? null,

    slug: req.body.slug,

    template: req.body.template ?? "default",

    excerpt_en: req.body.excerpt_en ?? null,

    excerpt_ur: req.body.excerpt_ur ?? null,

    content_en: req.body.content_en ?? null,

    content_ur: req.body.content_ur ?? null,

    featured_image: req.body.featured_image ?? null,

    status: req.body.status ?? "draft",

    published_at: req.body.published_at ?? null,

    sort_order: req.body.sort_order ?? 0,

    is_homepage: req.body.is_homepage ?? 0

};



    if(!pageData.title_en || !pageData.slug){

        return res.status(400).json({

            success:false,

            message:"Title and slug are required"

        });

    }



    pageModel.checkSlugExists(
        pageData.slug,
        (err,result)=>{


            if(err){

                return res.status(500).json({

                    success:false,

                    message:"Database error"

                });

            }



            if(result.length > 0){

                return res.status(400).json({

                    success:false,

                    message:"Slug already exists"

                });

            }



            pageModel.createPage(
                pageData,
                (err,result)=>{


                    if(err){

                        console.log("=== CREATE PAGE DB ERROR ===");
                        console.log(err);

                        return res.status(500).json({

                            success:false,

                            message:"Failed to create page"

                        });

                    }



                    res.status(201).json({

                        success:true,

                        message:"Page created successfully",

                        data:{
                            id:result.insertId
                        }

                    });


                }
            );

        }
    );

};


// ================= Get All Pages =================

const getAllPages = (req,res)=>{


    let {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        sort_by = "created_at",
        sort_order = "DESC"

    } = req.query;



    page = Number(page);
    limit = Number(limit);



    pageModel.getAllPages(
        page,
        limit,
        search,
        status,
        sort_by,
        sort_order,

        (err,data)=>{


            if(err){

                return res.status(500).json({

                    success:false,
                    message:"Failed to fetch pages"

                });

            }



            pageModel.countPages(
                search,
                status,

                (err,countResult)=>{


                    if(err){

                        return res.status(500).json({

                            success:false,
                            message:"Failed to count pages"

                        });

                    }



                    const total_records =
                    countResult[0].total;



                    res.json({

                        success:true,

                        data:data,

                        pagination:{

                            current_page:page,

                            per_page:limit,

                            total_records:total_records,

                            total_pages:
                            Math.ceil(
                                total_records / limit
                            )

                        }

                    });


                }
            );


        }
    );


};


// ================= Get Page By ID =================

const getPageById = (req,res)=>{

    console.log("GET SINGLE PAGE CONTROLLER HIT");

    const id = req.params.id;

    console.log("Page ID:", id);


    pageModel.getPageById(
        id,

        (err,result)=>{

            console.log("MODEL RESPONSE");

            if(err){

                console.log(err);

                return res.status(500).json({
                    success:false,
                    message:"Database error"
                });

            }


            console.log(result);


            if(result.length === 0){

                return res.status(404).json({
                    success:false,
                    message:"Page not found"
                });

            }


            return res.json({

                success:true,
                data:result[0]

            });


        }
    );

};


// ================= Update Page =================
const updatePage = (req,res)=>{


    const id = req.params.id;


    const pageData = {

    parent_id: req.body.parent_id ?? null,

    title_en: req.body.title_en,

    title_ur: req.body.title_ur ?? null,

    slug: req.body.slug,

    template: req.body.template ?? "default",

    excerpt_en: req.body.excerpt_en ?? null,

    excerpt_ur: req.body.excerpt_ur ?? null,

    content_en: req.body.content_en ?? null,

    content_ur: req.body.content_ur ?? null,

    featured_image: req.body.featured_image ?? null,

    status: req.body.status ?? "draft",

    published_at: req.body.published_at ?? null,

    sort_order: req.body.sort_order ?? 0,

    is_homepage: req.body.is_homepage ?? 0

};



    pageModel.updatePage(
        id,
        pageData,

        (err,result)=>{


            if(err){

                return res.status(500).json({

                    success:false,
                    message:"Failed to update page"

                });

            }



            if(result.affectedRows === 0){

                return res.status(404).json({

                    success:false,
                    message:"Page not found"

                });

            }



            res.json({

                success:true,

                message:"Page updated successfully"

            });


        }
    );


};


// ================= Delete Page =================
const deletePage = (req,res)=>{


    const id = req.params.id;


    pageModel.deletePage(
        id,

        (err,result)=>{


            if(err){

                return res.status(500).json({

                    success:false,
                    message:"Failed to delete page"

                });

            }



            if(result.affectedRows === 0){

                return res.status(404).json({

                    success:false,
                    message:"Page not found"

                });

            }



            res.json({

                success:true,

                message:"Page deleted successfully"

            });


        }
    );


};


// ================= Restore Page =================

const restorePage = (req,res)=>{


    const id = req.params.id;


    pageModel.restorePage(
        id,

        (err,result)=>{


            if(err){

                return res.status(500).json({

                    success:false,
                    message:"Failed to restore page"

                });

            }



            if(result.affectedRows === 0){

                return res.status(404).json({

                    success:false,
                    message:"Page not found"

                });

            }



            res.json({

                success:true,

                message:"Page restored successfully"

            });


        }
    );


};



module.exports = {
    createPage,
    getAllPages,
    getPageById,
    updatePage,
    deletePage,
    restorePage
};