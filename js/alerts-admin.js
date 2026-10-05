// ============================================================
// HUMAN APPEAL PAKISTAN — ALERTS / JOB POSTINGS ADMIN
//
// Jobs:
//      /api/job-postings
//
// Tenders:
//      /api/tenders
//
// IMPORTANT:
//      job_alerts is NOT USED.
//      job_postings is the official jobs table.
//      tender_alerts is NOT a real backend route — the actual
//      route is /api/tenders. Fixed here.
// ============================================================


// ============================================================
// URL / TYPE
// ============================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const alertType =
    urlParams.get("type");


const isJob =
    alertType === "job";


const isTender =
    alertType === "tender";


// ============================================================
// PERMISSION
// ============================================================

const requiredPermission =
    isJob
        ? "manage_jobs"
        : isTender
            ? "manage_tenders"
            : null;


const currentUser =
    requiredPermission
        ? AuthAPI.requirePermission(
            requiredPermission,
            "./dashboard.html"
        )
        : null;


// ============================================================
// STATE
// ============================================================

let currentEditId = null;

let allItems = [];


// ============================================================
// ENDPOINTS
// FIX: backend route is /api/tenders, not /api/tender_alerts
// (which never existed — a naming guess that never matched
// any real backend route).
// ============================================================

const endpoint =
    isJob
        ? "/job-postings"
        : "/tenders";


// ============================================================
// INITIALIZATION
// ============================================================

(function init() {

    if (!currentUser) {
        return;
    }


    // --------------------------------------------------------
    // INVALID TYPE
    // --------------------------------------------------------

    if (!isJob && !isTender) {

        const main =
            document.querySelector("main");


        if (main) {

            main.innerHTML = `

                <p style="
                    padding:40px;
                    text-align:center;
                ">

                    Unknown alert type.

                    <a href="dashboard.html">
                        Return to dashboard
                    </a>

                </p>

            `;
        }

        return;
    }


    // --------------------------------------------------------
    // USER INFORMATION
    // --------------------------------------------------------

    const userName =
        document.getElementById(
            "current-user-name"
        );


    const userRole =
        document.getElementById(
            "current-user-role"
        );


    if (userName) {

        userName.innerText =
            currentUser.name || "";
    }


    if (userRole) {

        userRole.innerText =
            currentUser.role || "";
    }


    // --------------------------------------------------------
    // PAGE LABEL
    // --------------------------------------------------------

    const pageLabel =
        isJob
            ? "Job Postings"
            : "Tender Alerts";


    document.title =
        `${pageLabel} | Human Appeal Pakistan Admin`;


    const heading =
        document.getElementById(
            "section-heading"
        );


    if (heading) {

        heading.innerText =
            `Manage ${pageLabel}`;
    }


    const addLabel =
        document.getElementById(
            "btn-add-label"
        );


    if (addLabel) {

        addLabel.innerText =
            isJob
                ? "Add New Job"
                : "Add New Tender";
    }


    const modalTitle =
        document.getElementById(
            "modal-title"
        );


    if (modalTitle) {

        modalTitle.innerText =
            isJob
                ? "Add New Job"
                : "Add New Tender";
    }


    // --------------------------------------------------------
    // SIDEBAR
    // --------------------------------------------------------

    if (
        typeof renderAdminSidebar ===
        "function"
    ) {

        renderAdminSidebar(
            currentUser,
            `alerts.html?type=${alertType}`
        );
    }


    // --------------------------------------------------------
    // ICONS
    // --------------------------------------------------------

    if (
        typeof window.getIconSvg ===
        "function"
    ) {

        const searchIcon =
            document.getElementById(
                "search-icon-holder"
            );


        if (searchIcon) {

            searchIcon.innerHTML =
                window.getIconSvg(
                    "search"
                );
        }


        const plusIcon =
            document.getElementById(
                "plus-icon-holder"
            );


        if (plusIcon) {

            plusIcon.innerHTML =
                window.getIconSvg(
                    "plus",
                    "#FFFFFF"
                );
        }
    }


    // --------------------------------------------------------
    // FORM
    // --------------------------------------------------------

    configureForm();


    // --------------------------------------------------------
    // TABLE
    // --------------------------------------------------------

    configureTable();


    // --------------------------------------------------------
    // EVENTS
    // --------------------------------------------------------

    const searchInput =
        document.getElementById(
            "search-input"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderTable
        );
    }


    const filterStatus =
        document.getElementById(
            "filter-status"
        );


    if (filterStatus) {

        filterStatus.addEventListener(
            "change",
            renderTable
        );
    }


    const addButton =
        document.getElementById(
            "btn-add-item"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => openModal()
        );
    }


    const closeButton =
        document.getElementById(
            "modal-close-x"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );
    }


    const cancelButton =
        document.getElementById(
            "btn-cancel-form"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );
    }


    const form =
        document.getElementById(
            "item-form"
        );


    if (form) {

        form.addEventListener(
            "submit",
            handleSubmit
        );
    }


    // --------------------------------------------------------
    // LOAD DATA
    // --------------------------------------------------------

    refresh();

})();


// ============================================================
// FORM CONFIGURATION
// ============================================================

function configureForm() {

    const departmentGroup =
        document.getElementById(
            "field-department-group"
        );


    const locationGroup =
        document.getElementById(
            "field-location-group"
        );


    const jobTypeGroup =
        document.getElementById(
            "field-jobtype-group"
        );


    const tenderNumberGroup =
        document.getElementById(
            "field-tenderno-group"
        );


    const categoryGroup =
        document.getElementById(
            "field-category-group"
        );


    // --------------------------------------------------------
    // JOB FIELDS
    // --------------------------------------------------------

    if (departmentGroup) {

        departmentGroup.style.display =
            isJob
                ? "block"
                : "none";
    }


    if (locationGroup) {

        locationGroup.style.display =
            isJob
                ? "block"
                : "none";
    }


    if (jobTypeGroup) {

        jobTypeGroup.style.display =
            isJob
                ? "block"
                : "none";
    }


    // --------------------------------------------------------
    // TENDER FIELDS
    // --------------------------------------------------------

    if (tenderNumberGroup) {

        tenderNumberGroup.style.display =
            isTender
                ? "block"
                : "none";
    }


    if (categoryGroup) {

        categoryGroup.style.display =
            isTender
                ? "block"
                : "none";
    }


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    const statusSelect =
        document.getElementById(
            "form-status"
        );


    if (!statusSelect) {
        return;
    }


    if (isJob) {

        statusSelect.innerHTML = `

            <option value="draft">
                Draft
            </option>

            <option value="published">
                Published
            </option>

            <option value="closed">
                Closed
            </option>

        `;

    } else {

        statusSelect.innerHTML = `

            <option value="open">
                Open
            </option>

            <option value="closed">
                Closed
            </option>

        `;
    }
}


// ============================================================
// TABLE CONFIGURATION
// ============================================================

function configureTable() {

    const tableHead =
        document.getElementById(
            "table-head-row"
        );


    if (!tableHead) {
        return;
    }


    if (isJob) {

        tableHead.innerHTML = `

            <th>Title</th>
            <th>Reference</th>
            <th>Department</th>
            <th>Location</th>
            <th>Employment</th>
            <th>Status</th>
            <th>Opening</th>
            <th>Closing</th>
            <th>Actions</th>

        `;

    } else {

        tableHead.innerHTML = `

            <th>Title</th>
            <th>Tender #</th>
            <th>Category</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Actions</th>

        `;
    }


    // --------------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------------

    const filter =
        document.getElementById(
            "filter-status"
        );


    if (!filter) {
        return;
    }


    if (isJob) {

        filter.innerHTML = `

            <option value="all">
                All Status
            </option>

            <option value="draft">
                Draft
            </option>

            <option value="published">
                Published
            </option>

            <option value="closed">
                Closed
            </option>

        `;

    } else {

        filter.innerHTML = `

            <option value="all">
                All Status
            </option>

            <option value="open">
                Open
            </option>

            <option value="closed">
                Closed
            </option>

        `;
    }
}


// ============================================================
// LOAD DATA
// ============================================================

async function refresh() {

    try {

        let response;


        // ====================================================
        // JOB POSTINGS
        // ====================================================

        if (isJob) {

            response =
                await API.get(
                    "/job-postings"
                );


            /*
             * Backend response shape (standardized to match
             * news/programs/tenders):
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             */


            allItems =
                Array.isArray(
                    response
                )
                    ? response
                    : (
                        response.data ||
                        []
                    );

        }


        // ====================================================
        // TENDERS
        // FIX: endpoint corrected from /tender_alerts to
        // /tenders. Response shape is {success, count, data} —
        // there is no .tenders or .tenderAlerts key, so those
        // fallbacks were dead code that always fell through to
        // an empty array.
        // ====================================================

        else {

            response =
                await API.get(
                    "/tenders"
                );


            /*
             * Backend response shape (standardized to match
             * news/programs/job-postings):
             *
             * {
             *   success: true,
             *   count: N,
             *   data: [...]
             * }
             */


            allItems =
                Array.isArray(
                    response
                )
                    ? response
                    : (
                        response.data ||
                        []
                    );
        }


        console.log(
            `${isJob
                ? "JOB POSTINGS"
                : "TENDERS"
            } LOADED:`,
            allItems
        );


        renderMetrics();

        renderTable();

    }
    catch (error) {

        console.error(
            "LOAD ALERTS ERROR:",
            error
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                error.message ||
                "Failed to load records.",
                "error"
            );
        }
    }
}


// ============================================================
// METRICS
// ============================================================

function renderMetrics() {

    const total =
        allItems.length;


    let open = 0;


    // --------------------------------------------------------
    // JOB METRICS
    // --------------------------------------------------------

    if (isJob) {

        open =
            allItems.filter(
                item =>
                    item.status ===
                    "published"
            ).length;
    }


    // --------------------------------------------------------
    // TENDER METRICS
    // --------------------------------------------------------

    else {

        open =
            allItems.filter(
                item =>
                    item.status ===
                    "open"
            ).length;
    }


    const closed =
        allItems.filter(
            item =>
                item.status ===
                "closed"
        ).length;


    const draft =
        isJob
            ? allItems.filter(
                item =>
                    item.status ===
                    "draft"
            ).length
            : 0;


    const metricsGrid =
        document.getElementById(
            "metrics-grid"
        );


    if (!metricsGrid) {
        return;
    }


    // --------------------------------------------------------
    // JOB METRICS
    // --------------------------------------------------------

    if (isJob) {

        metricsGrid.innerHTML = `

            <div class="metric-card">

                <div>

                    <div class="metric-value">
                        ${total}
                    </div>

                    <div class="metric-label">
                        Total Jobs
                    </div>

                </div>

            </div>


            <div class="metric-card">

                <div>

                    <div
                        class="metric-value"
                        style="color:var(--ha-green);"
                    >
                        ${open}
                    </div>

                    <div class="metric-label">
                        Published
                    </div>

                </div>

            </div>


            <div class="metric-card">

                <div>

                    <div
                        class="metric-value"
                        style="color:var(--ha-red);"
                    >
                        ${closed}
                    </div>

                    <div class="metric-label">
                        Closed
                    </div>

                </div>

            </div>


            <div class="metric-card">

                <div>

                    <div
                        class="metric-value"
                    >
                        ${draft}
                    </div>

                    <div class="metric-label">
                        Drafts
                    </div>

                </div>

            </div>

        `;

        return;
    }


    // --------------------------------------------------------
    // TENDER METRICS
    // --------------------------------------------------------

    metricsGrid.innerHTML = `

        <div class="metric-card">

            <div>

                <div class="metric-value">
                    ${total}
                </div>

                <div class="metric-label">
                    Total Tenders
                </div>

            </div>

        </div>


        <div class="metric-card">

            <div>

                <div
                    class="metric-value"
                    style="color:var(--ha-green);"
                >
                    ${open}
                </div>

                <div class="metric-label">
                    Open
                </div>

            </div>

        </div>


        <div class="metric-card">

            <div>

                <div
                    class="metric-value"
                    style="color:var(--ha-red);"
                >
                    ${closed}
                </div>

                <div class="metric-label">
                    Closed
                </div>

            </div>

        </div>

    `;
}


// ============================================================
// TABLE RENDER
// ============================================================

function renderTable() {

    const searchInput =
        document.getElementById(
            "search-input"
        );


    const filterStatus =
        document.getElementById(
            "filter-status"
        );


    const searchQuery =
        (
            searchInput?.value ||
            ""
        )
        .toLowerCase()
        .trim();


    const statusFilter =
        filterStatus?.value ||
        "all";


    let items =
        [...allItems];


    // ========================================================
    // SEARCH
    // ========================================================

    if (searchQuery) {

        items =
            items.filter(
                item => {

                    const searchableText = [

                        item.title,

                        item.department,

                        item.location,

                        item.description,

                        item.reference_no,

                        item.referenceNo,

                        item.tenderNumber,

                        item.category,

                        item.employment_type,

                        item.employmentType

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                    return searchableText
                        .includes(
                            searchQuery
                        );
                }
            );
    }


    // ========================================================
    // STATUS
    // ========================================================

    if (
        statusFilter !==
        "all"
    ) {

        items =
            items.filter(
                item =>
                    item.status ===
                    statusFilter
            );
    }


    const tbody =
        document.getElementById(
            "table-body"
        );


    if (!tbody) {
        return;
    }


    // ========================================================
    // EMPTY
    // ========================================================

    if (items.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="${isJob ? 9 : 6}"
                    style="
                        text-align:center;
                        color:var(--text-muted);
                    "
                >

                    No matching records found.

                </td>

            </tr>

        `;

        return;
    }


    // ========================================================
    // JOB TABLE
    // ========================================================

    if (isJob) {

        tbody.innerHTML =
            items.map(
                job => `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHtml(
                                    job.title
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHtml(
                                job.reference_no ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                job.department ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                job.location ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                job.employment_type ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${renderStatusBadge(
                                job.status
                            )}

                        </td>


                        <td>

                            ${formatDate(
                                job.opening_date
                            )}

                        </td>


                        <td>

                            ${formatDate(
                                job.closing_date
                            )}

                        </td>


                        <td class="actions-cell">

                            <button
                                class="action-btn edit"
                                onclick="editItem('${job.id}')"
                                title="Edit"
                            >

                                ${
                                    typeof window.getIconSvg ===
                                    "function"
                                        ? window.getIconSvg(
                                            "edit",
                                            "var(--ha-purple)"
                                        )
                                        : "Edit"
                                }

                            </button>


                            <button
                                class="action-btn delete"
                                onclick="deleteItem('${job.id}')"
                                title="Delete"
                            >

                                ${
                                    typeof window.getIconSvg ===
                                    "function"
                                        ? window.getIconSvg(
                                            "trash",
                                            "var(--ha-red)"
                                        )
                                        : "Delete"
                                }

                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

        return;
    }


    // ========================================================
    // TENDER TABLE
    // ========================================================

    tbody.innerHTML =
        items.map(
            tender => `

                <tr>

                    <td>

                        <strong>
                            ${escapeHtml(
                                tender.title
                            )}
                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            tender.tenderNumber ||
                            tender.tender_number ||
                            "—"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            tender.category ||
                            "—"
                        )}

                    </td>


                    <td>

                        ${formatDate(
                            tender.deadline
                        )}

                    </td>


                    <td>

                        ${renderStatusBadge(
                            tender.status
                        )}

                    </td>


                    <td class="actions-cell">

                        <button
                            class="action-btn edit"
                            onclick="editItem('${tender.id}')"
                            title="Edit"
                        >

                            ${
                                typeof window.getIconSvg ===
                                "function"
                                    ? window.getIconSvg(
                                        "edit",
                                        "var(--ha-purple)"
                                    )
                                    : "Edit"
                            }

                        </button>


                        <button
                            class="action-btn delete"
                            onclick="deleteItem('${tender.id}')"
                            title="Delete"
                        >

                            ${
                                typeof window.getIconSvg ===
                                "function"
                                    ? window.getIconSvg(
                                        "trash",
                                        "var(--ha-red)"
                                    )
                                    : "Delete"
                            }

                        </button>

                    </td>

                </tr>

            `
        )
        .join("");
}


// ============================================================
// STATUS BADGE
// ============================================================

function renderStatusBadge(status) {

    let cssStatus =
        status || "unknown";


    if (
        status === "published" ||
        status === "open"
    ) {

        cssStatus =
            "published";
    }


    if (
        status === "draft"
    ) {

        cssStatus =
            "draft";
    }


    if (
        status === "closed"
    ) {

        cssStatus =
            "closed";
    }


    return `

        <span
            class="status-badge status-${escapeHtml(
                cssStatus
            )}"
        >

            ${escapeHtml(
                status || "unknown"
            )}

        </span>

    `;
}


// ============================================================
// OPEN MODAL
// ============================================================

function openModal(item = null) {

    const form =
        document.getElementById(
            "item-form"
        );


    if (!form) {
        return;
    }


    form.reset();


    currentEditId =
        item
            ? item.id
            : null;


    // ========================================================
    // EDIT
    // ========================================================

    if (item) {

        document.getElementById(
            "modal-title"
        ).innerText =
            isJob
                ? "Edit Job"
                : "Edit Tender";


        document.getElementById(
            "form-title"
        ).value =
            item.title || "";


        document.getElementById(
            "form-description"
        ).value =
            item.description || "";


        document.getElementById(
            "form-status"
        ).value =
            item.status ||
            (
                isJob
                    ? "draft"
                    : "open"
            );


        // ====================================================
        // JOB
        // ====================================================

        if (isJob) {

            const department =
                document.getElementById(
                    "form-department"
                );


            const location =
                document.getElementById(
                    "form-location"
                );


            const jobType =
                document.getElementById(
                    "form-jobtype"
                );


            const deadline =
                document.getElementById(
                    "form-deadline"
                );


            if (department) {

                department.value =
                    item.department || "";
            }


            if (location) {

                location.value =
                    item.location || "";
            }


            if (jobType) {

                jobType.value =
                    item.employment_type ||
                    "Full-time";
            }


            if (deadline) {

                deadline.value =
                    formatDateForInput(
                        item.closing_date
                    );
            }

        }


        // ====================================================
        // TENDER
        // ====================================================

        else {

            const tenderNo =
                document.getElementById(
                    "form-tenderno"
                );


            const category =
                document.getElementById(
                    "form-category"
                );


            const deadline =
                document.getElementById(
                    "form-deadline"
                );


            if (tenderNo) {

                tenderNo.value =
                    item.tenderNumber ||
                    item.tender_number ||
                    "";
            }


            if (category) {

                category.value =
                    item.category || "";
            }


            if (deadline) {

                deadline.value =
                    formatDateForInput(
                        item.deadline
                    );
            }
        }

    }


    // ========================================================
    // CREATE
    // ========================================================

    else {

        document.getElementById(
            "modal-title"
        ).innerText =
            isJob
                ? "Add New Job"
                : "Add New Tender";


        document.getElementById(
            "form-status"
        ).value =
            isJob
                ? "draft"
                : "open";
    }


    // ========================================================
    // SHOW MODAL
    // ========================================================

    document
        .getElementById(
            "item-modal"
        )
        .classList
        .add("show");
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    const modal =
        document.getElementById(
            "item-modal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }


    currentEditId =
        null;
}


// ============================================================
// SUBMIT
// ============================================================

async function handleSubmit(event) {

    event.preventDefault();


    try {

        // ====================================================
        // JOB POSTING
        // ====================================================

        if (isJob) {

            const title =
                document.getElementById(
                    "form-title"
                ).value.trim();


            const department =
                document.getElementById(
                    "form-department"
                )?.value.trim() || "";


            const location =
                document.getElementById(
                    "form-location"
                )?.value.trim() || "";


            const employmentType =
                document.getElementById(
                    "form-jobtype"
                )?.value || "";


            const closingDate =
                document.getElementById(
                    "form-deadline"
                )?.value || "";


            const status =
                document.getElementById(
                    "form-status"
                ).value;


            const description =
                document.getElementById(
                    "form-description"
                ).value.trim();


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!title) {

                showToast(
                    "Job title is required.",
                    "error"
                );

                return;
            }


            if (
                closingDate &&
                !isValidDateString(
                    closingDate
                )
            ) {

                showToast(
                    "Please enter a valid closing date.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // SLUG
            // ------------------------------------------------

            const slug =
                createSlug(title);


            // ------------------------------------------------
            // DATA
            // ------------------------------------------------

            const data = {

                title,

                slug,

                reference_no:
                    currentEditId
                        ? undefined
                        : null,

                department:
                    department || null,

                location:
                    location || null,

                employment_type:
                    employmentType || null,

                description:
                    description || null,

                requirements:
                    null,

                application_url:
                    null,

                application_email:
                    null,

                status,

                featured:
                    0,

                opening_date:
                    currentEditId
                        ? undefined
                        : new Date()
                            .toISOString()
                            .split("T")[0],

                closing_date:
                    closingDate || null,

                published_at:
                    status === "published"
                        ? new Date().toISOString()
                        : null
            };


            // ------------------------------------------------
            // IMPORTANT
            // ------------------------------------------------
            // Do not send undefined fields to the backend.
            // This prevents overwriting existing values.
            // ------------------------------------------------

            Object.keys(data).forEach(
                key => {

                    if (
                        data[key] ===
                        undefined
                    ) {

                        delete data[key];
                    }
                }
            );


            console.log(
                "JOB POSTING PAYLOAD:",
                data
            );


            // ------------------------------------------------
            // UPDATE
            // ------------------------------------------------

            if (currentEditId) {

                await API.put(
                    `/job-postings/${currentEditId}`,
                    data
                );


                showToast(
                    "Job posting updated successfully.",
                    "success"
                );
            }


            // ------------------------------------------------
            // CREATE
            // ------------------------------------------------

            else {

                await API.post(
                    "/job-postings",
                    data
                );


                showToast(
                    "Job posting created successfully.",
                    "success"
                );
            }
        }


        // ====================================================
        // TENDER
        // FIX: endpoints corrected from /tender_alerts to
        // /tenders.
        // ====================================================

        else {

            const title =
                document.getElementById(
                    "form-title"
                ).value.trim();


            const tenderNumber =
                document.getElementById(
                    "form-tenderno"
                ).value.trim();


            const category =
                document.getElementById(
                    "form-category"
                ).value.trim();


            const deadline =
                document.getElementById(
                    "form-deadline"
                ).value;


            const status =
                document.getElementById(
                    "form-status"
                ).value;


            const description =
                document.getElementById(
                    "form-description"
                ).value.trim();


            if (!title) {

                showToast(
                    "Tender title is required.",
                    "error"
                );

                return;
            }


            const data = {

                title,

                tenderNumber:
                    tenderNumber || null,

                category:
                    category || null,

                deadline:
                    deadline || null,

                status,

                description:
                    description || null,

                postedBy:
                    currentUser.name,

                datePosted:
                    new Date()
                        .toISOString()
                        .split("T")[0]
            };


            // ------------------------------------------------
            // UPDATE
            // ------------------------------------------------

            if (currentEditId) {

                await API.put(
                    `/tenders/${currentEditId}`,
                    data
                );


                showToast(
                    "Tender updated successfully.",
                    "success"
                );
            }


            // ------------------------------------------------
            // CREATE
            // ------------------------------------------------

            else {

                await API.post(
                    "/tenders",
                    data
                );


                showToast(
                    "Tender created successfully.",
                    "success"
                );
            }
        }


        closeModal();

        await refresh();

    }
    catch (error) {

        console.error(
            "SAVE ALERT ERROR:",
            error
        );


        showToast(
            error.message ||
            "Failed to save record.",
            "error"
        );
    }
}


// ============================================================
// EDIT
// ============================================================

window.editItem =
    async function(id) {

        try {

            let item;


            // =================================================
            // JOB
            // =================================================

            if (isJob) {

                const response =
                    await API.get(
                        `/job-postings/${id}`
                    );


                item =
                    response.jobPosting ||
                    response.job ||
                    response.data ||
                    response;
            }


            // =================================================
            // TENDER
            // FIX: endpoint corrected from /tender_alerts to
            // /tenders.
            // =================================================

            else {

                const response =
                    await API.get(
                        `/tenders/${id}`
                    );


                item =
                    response.tender ||
                    response.data ||
                    response;
            }


            if (!item) {

                showToast(
                    "Record not found.",
                    "error"
                );

                return;
            }


            openModal(item);

        }
        catch (error) {

            console.error(
                "EDIT ALERT ERROR:",
                error
            );


            showToast(
                error.message ||
                "Failed to load record.",
                "error"
            );
        }
    };


// ============================================================
// DELETE
// ============================================================

window.deleteItem =
    async function(id) {

        const item =
            allItems.find(
                currentItem =>
                    String(
                        currentItem.id
                    ) ===
                    String(id)
            );


        if (!item) {
            return;
        }


        const itemName =
            item.title ||
            "this record";


        if (
            !confirm(
                `Delete "${itemName}"?`
            )
        ) {

            return;
        }


        try {

            if (isJob) {

                await API.delete(
                    `/job-postings/${id}`
                );

            } else {

                // FIX: endpoint corrected from /tender_alerts
                // to /tenders.
                await API.delete(
                    `/tenders/${id}`
                );
            }


            showToast(
                isJob
                    ? "Job posting deleted successfully."
                    : "Tender deleted successfully.",
                "success"
            );


            await refresh();

        }
        catch (error) {

            console.error(
                "DELETE ALERT ERROR:",
                error
            );


            showToast(
                error.message ||
                "Delete failed.",
                "error"
            );
        }
    };


// ============================================================
// SLUG GENERATOR
// ============================================================

function createSlug(value) {

    return String(value)

        .toLowerCase()

        .trim()

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );
}


// ============================================================
// DATE VALIDATION
// ============================================================

function isValidDateString(value) {

    if (!value) {
        return true;
    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    return (
        !Number.isNaN(
            date.getTime()
        )
    );
}


// ============================================================
// DATE DISPLAY
// ============================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// ============================================================
// DATE INPUT
// ============================================================

function formatDateForInput(value) {

    if (!value) {
        return "";
    }


    // Handle YYYY-MM-DD directly.
    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        return value;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


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


// ============================================================
// LOGOUT
// ============================================================

function adminLogout() {

    AuthAPI.logout();

    window.location.href =
        "./login.html";
}