(function () {

    const userData = localStorage.getItem("user");

    if (!userData) return;

    const user = JSON.parse(userData);

    const permissions = user.permissions || [];


    document.querySelectorAll("[data-menu-permission]")
    .forEach(menu => {

        const requiredPermission = menu.dataset.menuPermission;

        if (!permissions.includes(requiredPermission)) {
            menu.style.display = "none";
        }

    });


})();