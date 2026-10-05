document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
});

// ===============================
// Dashboard Statistics
// ===============================

async function loadDashboardStats() {

    const token = AuthAPI.getToken();

    try {

        // ===============================
        // Users Count
        // ===============================

        const usersResponse = await fetch(
            `${window.API_BASE_URL}/users?limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const usersData = await usersResponse.json();

        if (usersData.success && usersData.pagination) {
            document.getElementById("total-users").textContent =
                usersData.pagination.total_records;
        }


        // ===============================
        // Permissions Count
        // ===============================

        const permissionsResponse = await fetch(
            `${window.API_BASE_URL}/permissions`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const permissionsData = await permissionsResponse.json();

        if (permissionsData.success && Array.isArray(permissionsData.data)) {
            document.getElementById("total-permissions").textContent =
                permissionsData.data.length;
        }


        // ===============================
        // Roles Count
        // ===============================

        const rolesResponse = await fetch(
            `${window.API_BASE_URL}/roles`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const rolesData = await rolesResponse.json();

        if (rolesData.success && Array.isArray(rolesData.data)) {
            document.getElementById("total-roles").textContent =
                rolesData.data.length;
        }

    } catch (error) {

        console.error("Dashboard Error:", error);

    }
}