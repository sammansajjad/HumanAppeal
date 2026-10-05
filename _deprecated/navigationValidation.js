const db = require("../models/db");


module.exports = (req,res,next)=>{


    const {

        menu_id,
        label_en,
        type,
        url,
        parent_id,
        sort_order,
        is_active

    } = req.body;



    if(!menu_id){

        return res.status(400).json({

            success:false,

            message:"menu_id is required"

        });

    }



    if(!label_en || label_en.trim()===""){


        return res.status(400).json({

            success:false,

            message:"label_en is required"

        });


    }




    const allowedTypes = [

        "custom",
        "page"

    ];



    if(type && !allowedTypes.includes(type)){


        return res.status(400).json({

            success:false,

            message:"Invalid navigation type"

        });


    }



    if(

        is_active !== undefined &&

        ![0,1].includes(Number(is_active))

    ){

        return res.status(400).json({

            success:false,

            message:"is_active must be 0 or 1"

        });

    }



    if(parent_id){


        db.query(

            `

            SELECT id

            FROM menu_items

            WHERE id = ?

            `,

            [parent_id],


            (err,result)=>{


                if(err){

                    return res.status(500).json({

                        success:false,

                        message:err.message

                    });

                }



                if(result.length===0){


                    return res.status(400).json({

                        success:false,

                        message:"Invalid parent menu"

                    });


                }



                next();


            }


        );


    }

    else{


        next();


    }


};