(function () {

    const userData = localStorage.getItem("user");

    if (!userData) {
        return;
    }


    const user = JSON.parse(userData);

    const permissions = user.permissions || [];


    // Get required permission from page
    const requiredPermission = document.body.dataset.permission;


    if (!requiredPermission) {
        return;
    }


    // Check permission
    if (!permissions.includes(requiredPermission)) {

        alert("You don't have permission to access this page.");

        window.location.href = "admin/index.html";

    }


})();