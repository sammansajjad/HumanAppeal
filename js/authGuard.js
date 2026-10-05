(function () {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "./login.html";
        return;
    }

    try {
        JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "./login.html";
        return;
    }

})();