const currentUser =
AuthAPI.requireLogin("./login.html");


let navigationMenus = [];

let navigationItems = [];

let selectedMenuId = null;

let editId = null;



// =========================================
// INITIALIZE
// =========================================

(async function(){


    if(!currentUser)
        return;


    document.getElementById(
        "current-user-name"
    ).innerText =
        currentUser.name;


    document.getElementById(
        "current-user-role"
    ).innerText =
        currentUser.role;


    renderAdminSidebar(
        currentUser,
        "navigation.html"
    );


    await loadNavigation();


})();




// =========================================
// LOAD NAVIGATION
// =========================================

async function loadNavigation(){


    try{


        const response =
            await API.get(
                "/navigation/admin"
            );


        console.log(
            "FULL NAVIGATION RESPONSE:",
            response
        );


        navigationMenus =
            response.menus || [];


        navigationItems =
            response.items || [];


        console.log(
            "NAVIGATION MENUS:",
            navigationMenus
        );


        console.log(
            "NAVIGATION ITEMS:",
            navigationItems
        );


        renderMenus();


    }
    catch(error){


        console.error(
            "Load Navigation Error:",
            error
        );


        showToast(
            error.message ||
            "Unable to load navigation",
            "error"
        );


    }


}




// =========================================
// RENDER MENUS
// =========================================

function renderMenus(){


    const menuSelect =
        document.getElementById(
            "menu-select"
        );


    const formMenu =
        document.getElementById(
            "form-menu"
        );


    menuSelect.innerHTML = "";

    formMenu.innerHTML = "";


    if(navigationMenus.length === 0){


        menuSelect.innerHTML = `
            <option value="">
                No menus available
            </option>
        `;


        formMenu.innerHTML = `
            <option value="">
                No menus available
            </option>
        `;


        return;


    }


    navigationMenus.forEach(menu => {


        const option =
            document.createElement(
                "option"
            );


        option.value =
            menu.id;


        option.textContent =
            `${menu.name} (${menu.location})`;


        menuSelect.appendChild(
            option
        );



        const formOption =
            document.createElement(
                "option"
            );


        formOption.value =
            menu.id;


        formOption.textContent =
            `${menu.name} (${menu.location})`;


        formMenu.appendChild(
            formOption
        );


    });


    selectedMenuId =
        Number(
            navigationMenus[0].id
        );


    menuSelect.value =
        selectedMenuId;


    formMenu.value =
        selectedMenuId;


    renderNavigation();


}




// =========================================
// MENU CHANGE
// =========================================

document
.getElementById("menu-select")
.addEventListener(
    "change",
    function(){


        selectedMenuId =
            Number(this.value);


        document.getElementById(
            "form-menu"
        ).value =
            selectedMenuId;


        renderNavigation();


    }
);




// =========================================
// RENDER NAVIGATION ITEMS
// =========================================

function renderNavigation(){


    const tbody =
        document.getElementById(
            "table-body"
        );


    let list =
        navigationItems.filter(
            item =>
                Number(item.menu_id) ===
                Number(selectedMenuId)
        );


    list.sort(
        (a,b) =>
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
    );



    if(list.length === 0){


        tbody.innerHTML = `

            <tr>

                <td
                colspan="7"
                style="text-align:center;"
                >

                    No navigation items found

                </td>

            </tr>

        `;


        return;


    }



    tbody.innerHTML =
        list.map(item => {


            const parent =
                navigationItems.find(
                    parentItem =>
                        Number(parentItem.id) ===
                        Number(item.parent_id)
                );


            return `

                <tr>


                    <td>
                        ${item.sort_order ?? 0}
                    </td>



                    <td>

                        ${
                            item.parent_id
                                ? "↳ "
                                : ""
                        }

                        ${escapeHtml(
                            item.label_en || "-"
                        )}

                    </td>



                    <td>

                        ${
                            item.url
                                ? escapeHtml(
                                    item.url
                                )
                                : "-"
                        }

                    </td>



                    <td>

                        ${
                            parent
                                ? escapeHtml(
                                    parent.label_en
                                )
                                : "-"
                        }

                    </td>



                 



                    <td>

                        ${
                            Number(
                                item.is_active
                            ) === 1
                                ? "Active"
                                : "Inactive"
                        }

                    </td>



                    <td>


                        <button
                        onclick="editNavigation(${item.id})"
                        >
                            Edit
                        </button>



                        <button
                        onclick="deleteNavigation(${item.id})"
                        >
                            Delete
                        </button>


                    </td>


                </tr>

            `;


        }).join("");


}




// =========================================
// ADD BUTTON
// =========================================

document
.getElementById(
    "btn-add-navigation"
)
.addEventListener(
    "click",
    function(){


        openNavigationModal();


    }
);




// =========================================
// OPEN MODAL
// =========================================

function openNavigationModal(item=null){


    document
    .getElementById(
        "navigation-form"
    )
    .reset();



    document
    .getElementById(
        "form-menu"
    )
    .value =
        selectedMenuId;



    editId = null;



    if(item){


        editId =
            item.id;


        document
        .getElementById(
            "modal-title"
        )
        .innerText =
            "Edit Navigation";


        document
        .getElementById(
            "form-id"
        )
        .value =
            item.id;


        document
        .getElementById(
            "form-menu"
        )
        .value =
            item.menu_id;


        document
        .getElementById(
            "form-label-en"
        )
        .value =
            item.label_en || "";


        document
        .getElementById(
            "form-label-ur"
        )
        .value =
            item.label_ur || "";


        document
        .getElementById(
            "form-url"
        )
        .value =
            item.url || "";


        document
        .getElementById(
            "form-type"
        )
        .value =
            item.type || "custom";


        populateParents(
            item.id,
            item.menu_id
        );


        document
        .getElementById(
            "form-parent"
        )
        .value =
            item.parent_id || "";


        document
        .getElementById(
            "form-target"
        )
        .value =
            item.target || "_self";




        document
        .getElementById(
            "form-sort-order"
        )
        .value =
            item.sort_order ?? 0;


        document
        .getElementById(
            "form-status"
        )
        .value =
            Number(item.is_active) === 1
                ? "1"
                : "0";


    }
    else{


        document
        .getElementById(
            "modal-title"
        )
        .innerText =
            "Add Navigation";


        document
        .getElementById(
            "form-id"
        )
        .value =
            "";


        populateParents(
            null,
            selectedMenuId
        );


    }



    document
    .getElementById(
        "navigation-modal"
    )
    .classList
    .add("show");


}




// =========================================
// PARENT ITEMS
// =========================================

function populateParents(
    currentId=null,
    menuId=null
){


    const parentSelect =
        document.getElementById(
            "form-parent"
        );


    parentSelect.innerHTML = `

        <option value="">
            None
        </option>

    `;


    const items =
        navigationItems.filter(
            item =>
                Number(item.menu_id) ===
                Number(
                    menuId || selectedMenuId
                )
        );


    items.forEach(item => {


        if(
            currentId &&
            Number(item.id) ===
            Number(currentId)
        )
            return;


        const option =
            document.createElement(
                "option"
            );


        option.value =
            item.id;


        option.textContent =
            item.label_en;


        parentSelect.appendChild(
            option
        );


    });


}




// =========================================
// FORM MENU CHANGE
// =========================================

document
.getElementById(
    "form-menu"
)
.addEventListener(
    "change",
    function(){


        populateParents(
            editId,
            Number(this.value)
        );


    }
);




// =========================================
// SAVE NAVIGATION
// =========================================

document
.getElementById(
    "navigation-form"
)
.addEventListener(
    "submit",
    async function(e){


        e.preventDefault();


        const data = {


            menu_id:
                Number(
                    document
                    .getElementById(
                        "form-menu"
                    )
                    .value
                ),


            parent_id:
                document
                .getElementById(
                    "form-parent"
                )
                .value
                ? Number(
                    document
                    .getElementById(
                        "form-parent"
                    )
                    .value
                )
                : null,


            label_en:
                document
                .getElementById(
                    "form-label-en"
                )
                .value
                .trim(),


            label_ur:
                document
                .getElementById(
                    "form-label-ur"
                )
                .value
                .trim(),


            type:
                document
                .getElementById(
                    "form-type"
                )
                .value,


            url:
                document
                .getElementById(
                    "form-url"
                )
                .value
                .trim(),


            target:
                document
                .getElementById(
                    "form-target"
                )
                .value,


        


            sort_order:
                Number(
                    document
                    .getElementById(
                        "form-sort-order"
                    )
                    .value
                ),


            is_active:
                Number(
                    document
                    .getElementById(
                        "form-status"
                    )
                    .value
                )


        };



        if(!data.label_en){


            showToast(
                "Navigation title is required",
                "error"
            );


            return;


        }



        console.log(
            "NAVIGATION SAVE DATA:",
            data
        );



        try{


            if(editId){


                await API.put(
                    "/navigation/" +
                    editId,
                    data
                );


            }
            else{


                await API.post(
                    "/navigation",
                    data
                );


            }



            closeNavigationModal();


            await loadNavigation();



            showToast(
                "Navigation saved successfully",
                "success"
            );


        }
        catch(error){


            console.error(
                "Save Navigation Error:",
                error
            );


            showToast(
                error.message ||
                "Unable to save navigation",
                "error"
            );


        }


    }
);




// =========================================
// EDIT NAVIGATION
// =========================================

window.editNavigation =
function(id){


    const item =
        navigationItems.find(
            navigationItem =>
                Number(navigationItem.id) ===
                Number(id)
        );


    if(!item)
        return;


    openNavigationModal(item);


};




// =========================================
// DELETE NAVIGATION
// =========================================

window.deleteNavigation =
async function(id){


    const item =
        navigationItems.find(
            navigationItem =>
                Number(navigationItem.id) ===
                Number(id)
        );


    if(!item)
        return;



    if(!confirm(
        `Delete "${item.label_en}"?`
    ))
        return;



    try{


        await API.delete(
            "/navigation/" + id
        );


        await loadNavigation();


        showToast(
            "Navigation deleted",
            "success"
        );


    }
    catch(error){


        console.error(
            "Delete Navigation Error:",
            error
        );


        showToast(
            error.message ||
            "Unable to delete navigation",
            "error"
        );


    }


};




// =========================================
// CLOSE MODAL
// =========================================

function closeNavigationModal(){


    document
    .getElementById(
        "navigation-modal"
    )
    .classList
    .remove("show");


}


document
.getElementById(
    "modal-close-x"
)
.onclick =
closeNavigationModal;



document
.getElementById(
    "btn-cancel-form"
)
.onclick =
closeNavigationModal;




// =========================================
// HTML ESCAPE
// =========================================

function escapeHtml(value){


    return String(value)


        .replace(
            /&/g,
            "&amp;"
        )


        .replace(
            /</g,
            "&lt;"
        )


        .replace(
            />/g,
            "&gt;"
        )


        .replace(
            /"/g,
            "&quot;"
        )


        .replace(
            /'/g,
            "&#039;"
        );


}




// =========================================
// LOGOUT
// =========================================

function adminLogout(){


    AuthAPI.logout();


}