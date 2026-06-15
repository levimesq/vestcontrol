// ==================== INITIAL MOCK DATA ====================
const INITIAL_PRODUCTS = [
    {
        id: "prod-1",
        name: "Camiseta Oversized Algodão Premium",
        category: "Camisetas",
        size: "G",
        sku: "VEST-TSH-001",
        price: 79.90,
        qty: 25,
        minQty: 10,
        imageColor: "#1E3A8A",
        dateAdded: "2026-05-10"
    },
    {
        id: "prod-2",
        name: "Calça Cargo Sarja Preta",
        category: "Calças",
        size: "42",
        sku: "VEST-CAR-002",
        price: 129.90,
        qty: 15,
        minQty: 10,
        imageColor: "#0D1B2A",
        dateAdded: "2026-05-12"
    },
    {
        id: "prod-3",
        name: "Jaqueta Jeans Classic Vintage",
        category: "Jaquetas",
        size: "GG",
        sku: "VEST-JKT-003",
        price: 199.90,
        qty: 8,
        minQty: 10, // Stock Warning
        imageColor: "#3B82F6",
        dateAdded: "2026-05-15"
    },
    {
        id: "prod-4",
        name: "Boné Aba Curva Minimalist",
        category: "Acessórios",
        size: "P",
        sku: "VEST-CAP-004",
        price: 49.90,
        qty: 30,
        minQty: 10,
        imageColor: "#F59E0B",
        dateAdded: "2026-05-18"
    },
    {
        id: "prod-5",
        name: "Moletom Canguru Classic Cinza",
        category: "Moletons",
        size: "M",
        sku: "VEST-HDY-005",
        price: 109.90,
        qty: 4,
        minQty: 6, // Critical Warning
        imageColor: "#64748B",
        dateAdded: "2026-05-20"
    },
    {
        id: "prod-6",
        name: "Tênis Casual Street Leather",
        category: "Calçados",
        size: "40",
        sku: "VEST-SHO-006",
        price: 259.90,
        qty: 6,
        minQty: 8, // Stock Warning
        imageColor: "#10B981",
        dateAdded: "2026-05-22"
    },
    {
        id: "prod-7",
        name: "Camisa Social Slim Fit Linho",
        category: "Camisetas",
        size: "M",
        sku: "VEST-SHR-007",
        price: 149.90,
        qty: 12,
        minQty: 5,
        imageColor: "#3B82F6",
        dateAdded: "2026-05-24"
    },
    {
        id: "prod-8",
        name: "Bermuda Chino Casual Sarja",
        category: "Calças",
        size: "40",
        sku: "VEST-SHO-008",
        price: 89.90,
        qty: 22,
        minQty: 10,
        imageColor: "#1E3A8A",
        dateAdded: "2026-05-25"
    },
    {
        id: "prod-9",
        name: "Blazer Masculino Modern Slim",
        category: "Jaquetas",
        size: "G",
        sku: "VEST-BLZ-009",
        price: 349.90,
        qty: 2,
        minQty: 5, // Critical Warning
        imageColor: "#0D1B2A",
        dateAdded: "2026-05-27"
    },
    {
        id: "prod-10",
        name: "Meias Vest Minimal Pack c/ 3",
        category: "Acessórios",
        size: "P",
        sku: "VEST-SOX-010",
        price: 29.90,
        qty: 0,
        minQty: 10, // Depleted
        imageColor: "#EF4444",
        dateAdded: "2026-05-28"
    }
];

const CATEGORY_COLORS = {
    "Camisetas": "#1E3A8A",
    "Calças": "#0D1B2A",
    "Jaquetas": "#3B82F6",
    "Moletons": "#64748B",
    "Calçados": "#10B981",
    "Acessórios": "#F59E0B"
};

// ==================== LOCALSTORAGE DATABASE CONTROLLER ====================
class DB {
    static init() {
        if (!localStorage.getItem("vestcontrol_products")) {
            localStorage.setItem("vestcontrol_products", JSON.stringify(INITIAL_PRODUCTS));
        }
        if (!localStorage.getItem("vestcontrol_reports_generated")) {
            localStorage.setItem("vestcontrol_reports_generated", "14");
        }
        if (!localStorage.getItem("vestcontrol_users")) {
            const defaultUser = { email: "gerente@vestcontrol.com.br", password: "vest1234", name: "Gerente", role: "master" };
            localStorage.setItem("vestcontrol_users", JSON.stringify([defaultUser]));
        }
    }

    static getProducts() {
        this.init();
        const products = JSON.parse(localStorage.getItem("vestcontrol_products")) || [];
        return products.map(p => ({
            ...p,
            qty: parseInt(p.qty) || 0,
            minQty: parseInt(p.minQty) || 0,
            price: parseFloat(p.price) || 0
        }));
    }

    static saveProducts(products) {
        localStorage.setItem("vestcontrol_products", JSON.stringify(products));
        // Trigger page updates on dashboard if active
        if (document.getElementById("app-layout").style.display !== "none") {
            updateDashboardKPIs();
            renderCategoryChart();
        }
    }

    static getReportsCount() {
        this.init();
        return parseInt(localStorage.getItem("vestcontrol_reports_generated")) || 0;
    }

    static incrementReportsCount() {
        let count = this.getReportsCount() + 1;
        localStorage.setItem("vestcontrol_reports_generated", count.toString());
        updateDashboardKPIs();
        return count;
    }

    static getUsers() {
        this.init();
        return JSON.parse(localStorage.getItem("vestcontrol_users")) || [];
    }

    static saveUsers(users) {
        localStorage.setItem("vestcontrol_users", JSON.stringify(users));
    }

    static registerUser(name, email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: "E-mail já cadastrado!" };
        }
        // New users default to employee role
        users.push({ name, email, password, role: "employee" });
        this.saveUsers(users);
        return { success: true, message: "Cadastro realizado com sucesso!" };
    }

    static loginUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            return { success: true, user: { name: user.name, email: user.email, role: user.role } };
        }
        return { success: false, message: "E-mail ou senha incorretos." };
    }
}

// ==================== STATE MANAGEMENT ====================
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 5;
let currentReportType = "stock";

// ==================== DOM LOADER ====================
document.addEventListener("DOMContentLoaded", () => {
    DB.init();
    checkAuthSession();
    setupRouting();
    setupLoginHandlers();
    setupProductHandlers();
    setupStockHandlers();
    setupReportsHandlers();
    setupThemeUIEffects();
    setupThemeToggle();
});

// ==================== AUTHENTICATION MANAGEMENT ====================
function checkAuthSession() {
    const loggedInUser = localStorage.getItem("vestcontrol_user");
    if (loggedInUser) {
        showDashboardShell(JSON.parse(loggedInUser));
    }
}

function setupLoginHandlers() {
    const loginForm = document.getElementById("login-form");
    const googleLoginBtn = document.getElementById("btn-google-login");
    const forgotPasswordLink = document.getElementById("btn-forgot-password");
    const logoutBtn = document.getElementById("btn-logout");
    
    // Recovery Password Modal controls
    const forgotModal = document.getElementById("forgot-password-modal");
    const cancelForgotBtn = document.getElementById("btn-cancel-forgot");
    const closeForgotBtn = document.getElementById("btn-close-forgot-modal");
    const forgotForm = document.getElementById("forgot-password-form");

    // Toggle Password visibility
    const togglePasswordBtn = document.getElementById("btn-toggle-password");
    const passwordInput = document.getElementById("login-password");
    
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            
            if (isPassword) {
                // Eye Off Icon
                togglePasswordBtn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                `;
                togglePasswordBtn.setAttribute("aria-label", "Esconder senha");
            } else {
                // Eye On Icon
                togglePasswordBtn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                `;
                togglePasswordBtn.setAttribute("aria-label", "Mostrar senha");
            }
        });
    }

    // Toggle Register Password visibility
    const toggleRegisterPasswordBtn = document.getElementById("btn-toggle-register-password");
    const registerPasswordInput = document.getElementById("register-password");
    
    if (toggleRegisterPasswordBtn && registerPasswordInput) {
        toggleRegisterPasswordBtn.addEventListener("click", () => {
            const isPassword = registerPasswordInput.getAttribute("type") === "password";
            registerPasswordInput.setAttribute("type", isPassword ? "text" : "password");
            
            if (isPassword) {
                toggleRegisterPasswordBtn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                `;
                toggleRegisterPasswordBtn.setAttribute("aria-label", "Esconder senha");
            } else {
                toggleRegisterPasswordBtn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                `;
                toggleRegisterPasswordBtn.setAttribute("aria-label", "Mostrar senha");
            }
        });
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        const res = DB.loginUser(email, password);
        if (res.success) {
            const loggedUser = { ...res.user, role: res.user.role || "master" };
localStorage.setItem("vestcontrol_user", JSON.stringify(loggedUser));
            showToast("Login Efetuado", `Bem-vindo de volta, ${res.user.name}!`, "success");
            showDashboardShell(loggedUser);
        } else {
            showToast("Erro no Login", res.message, "error");
        }
    });

    // Registration UI Handlers
    const loginView = document.getElementById("login-view");
    const registerView = document.getElementById("register-view");
    const btnGoToRegister = document.getElementById("btn-go-to-register");
    const btnGoToLogin = document.getElementById("btn-go-to-login");
    const registerForm = document.getElementById("register-form");

    if (btnGoToRegister && btnGoToLogin && registerView) {
        btnGoToRegister.addEventListener("click", (e) => {
            e.preventDefault();
            loginView.style.display = "none";
            loginView.classList.remove("active");
            registerView.style.display = "flex";
            setTimeout(() => registerView.classList.add("active"), 50);
        });

        btnGoToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            registerView.style.display = "none";
            registerView.classList.remove("active");
            loginView.style.display = "flex";
            setTimeout(() => loginView.classList.add("active"), 50);
        });

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            const res = DB.registerUser(name, email, password);
            if (res.success) {
                showToast("Cadastro Efetuado", res.message, "success");
                // Automatically log in with employee role
                const user = { name, email, role: "employee" };
                localStorage.setItem("vestcontrol_user", JSON.stringify(user));
                showDashboardShell(user);
                registerForm.reset();
            } else {
                showToast("Erro no Cadastro", res.message, "error");
            }
        });
    }

    googleLoginBtn.addEventListener("click", () => {
        const user = {
            email: "google.user@vestcontrol.com",
            name: "Convidado Google",
            role: "employee"
        };
        localStorage.setItem("vestcontrol_user", JSON.stringify(user));
        showToast("Login com Google", "Autenticado via Google com sucesso!", "success");
        showDashboardShell(user);
    });

    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        forgotModal.classList.add("active");
    });

    cancelForgotBtn.addEventListener("click", () => forgotModal.classList.remove("active"));
    closeForgotBtn.addEventListener("click", () => forgotModal.classList.remove("active"));
    
    forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("forgot-email").value;
        forgotModal.classList.remove("active");
        showToast("E-mail Enviado", `Instruções de recuperação enviadas para ${email}`, "success");
    });

    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("vestcontrol_user");
        hideDashboardShell();
        showToast("Sessão Encerrada", "Você saiu do sistema com segurança.", "warning");
    });
}

function showDashboardShell(user) {
    document.getElementById("login-view").style.display = "none";
    document.getElementById("login-view").classList.remove("active");
    
    document.getElementById("app-layout").style.display = "flex";
    
    // Set user headers
    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("welcome-user-name").textContent = user.name;
    document.getElementById("user-avatar-initials").textContent = user.name.charAt(0).toUpperCase();

    // Role-based UI restrictions
    const reportsMenu = document.querySelector('[data-view="reports"]');
    const revenueCard = document.getElementById("card-revenue");
    if (user.role === "employee") {
        if (reportsMenu) reportsMenu.style.display = "none";
        if (revenueCard) revenueCard.style.display = "none";
    } else {
        if (reportsMenu) reportsMenu.style.display = "flex";
        if (revenueCard) revenueCard.style.display = "flex";
    }

    // Trigger initial updates
    currentProducts = DB.getProducts();
    updateDashboardKPIs();
    renderCategoryChart();
    renderDashboardRecentTable();
    
    // Set view to Dashboard default
    switchView("dashboard");
}

function hideDashboardShell() {
    document.getElementById("app-layout").style.display = "none";
    document.getElementById("login-view").style.display = "flex";
    setTimeout(() => {
        document.getElementById("login-view").classList.add("active");
    }, 50);
}

// ==================== SPA ROUTING ====================
function setupRouting() {
    const menuItems = document.querySelectorAll(".sidebar-menu-item");
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const sidebar = document.getElementById("app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const viewAllBtn = document.getElementById("btn-view-all-dashboard");

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const viewName = item.getAttribute("data-view");
            
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            switchView(viewName);
            
            // Close mobile menu if open
            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("active");
        });
    });

    // Mobile Hamburger
    hamburgerBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("active");
    });

    // Dashboard view all shortcut
    viewAllBtn.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        document.querySelector('[data-view="products"]').classList.add("active");
        switchView("products");
    });

    // Notification bell shortcut to low stock
    const notificationBell = document.getElementById("header-notifications");
    if (notificationBell) {
        notificationBell.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            document.querySelector('[data-view="stock"]').classList.add("active");
            switchView("stock");
            
            const stockFilter = document.getElementById("filter-stock-status");
            if (stockFilter) {
                stockFilter.value = "baixo";
                // Trigger the filter event manually to update table
                applyStockFilters();
            }
        });
        notificationBell.style.cursor = "pointer";
    }
}

function switchView(viewName) {
    // Hide all subviews
    document.querySelectorAll(".subview").forEach(view => {
        view.style.display = "none";
    });

    // Translate view codes to Titles
    const viewTitles = {
        "dashboard": "Dashboard",
        "products": "Gestão de Produtos",
        "stock": "Controle de Estoque",
        "reports": "Relatórios e Estatísticas"
    };

    document.getElementById("view-title").textContent = viewTitles[viewName] || "Painel";
    
    const targetSubView = document.getElementById(`view-${viewName}`);
    if (targetSubView) {
        targetSubView.style.display = "flex";
    }

    // Refresh state data
    currentProducts = DB.getProducts();

    if (viewName === "dashboard") {
        updateDashboardKPIs();
        renderCategoryChart();
        renderDashboardRecentTable();
    } else if (viewName === "products") {
        applyProductFilters();
    } else if (viewName === "stock") {
        renderStockTable();
    } else if (viewName === "reports") {
        calculateReportsSidebar();
        generateSelectedReport();
    }
}

// ==================== DASHBOARD RENDERINGS ====================
function updateDashboardKPIs() {
    const products = DB.getProducts();
    const reportsCount = DB.getReportsCount();
    
    // Calculations
    const totalProducts = products.length;
    let lowStockCount = 0;
    let totalItems = 0;
    let totalValuation = 0;

    products.forEach(p => {
        totalItems += p.qty;
        totalValuation += p.qty * p.price;
        if (p.qty <= p.minQty) {
            lowStockCount++;
        }
    });

    // Simulated Faturamento reflects the scale of total valuation
    const simulatedRevenue = 24580.00 + (totalValuation * 0.15);

    // Apply values to UI
    document.getElementById("kpi-total-products").textContent = totalProducts;
    document.getElementById("kpi-low-stock").textContent = lowStockCount;
    document.getElementById("kpi-total-items").textContent = totalItems;
    document.getElementById("kpi-revenue").textContent = formatCurrency(simulatedRevenue);
    
    // Notifications counter badge (Low stock count)
    const badge = document.getElementById("notification-badge");
    if (lowStockCount > 0) {
        badge.style.display = "flex";
        badge.textContent = lowStockCount;
    } else {
        badge.style.display = "none";
    }
}

function renderCategoryChart() {
    const products = DB.getProducts();
    const categories = {};
    
    // Group quantities
    let totalStock = 0;
    products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + p.qty;
        totalStock += p.qty;
    });

    const chartSvg = document.getElementById("category-donut-chart");
    const legendContainer = document.getElementById("chart-legend");
    
    // Reset SVG and Legend
    chartSvg.innerHTML = '<circle class="chart-hole" cx="50" cy="50" r="30"></circle>';
    legendContainer.innerHTML = '';
    
    if (totalStock === 0) {
        // Empty State: Gray Circle
        chartSvg.innerHTML += `<circle class="chart-segment" cx="50" cy="50" r="30" stroke="#E2E8F0" stroke-dasharray="188.4 188.4" stroke-dashoffset="0"></circle>`;
        legendContainer.innerHTML = `<div class="legend-item"><span class="legend-label"><span class="legend-color" style="background-color: #E2E8F0;"></span>Sem estoque</span><span class="legend-percentage">0%</span></div>`;
        document.getElementById("chart-total-val").textContent = 0;
        return;
    }

    document.getElementById("chart-total-val").textContent = totalStock;

    // SVG parameters
    const r = 30;
    const circumference = 2 * Math.PI * r; // 188.495
    let accumulatedPercent = 0;

    Object.keys(categories).forEach(cat => {
        const qty = categories[cat];
        const percentage = (qty / totalStock);
        const percentValue = Math.round(percentage * 100);
        const color = CATEGORY_COLORS[cat] || "#94A3B8";

        // Draw Circle segment
        const strokeLength = percentage * circumference;
        const strokeOffset = circumference - (accumulatedPercent * circumference);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "chart-segment");
        circle.setAttribute("cx", "50");
        circle.setAttribute("cy", "50");
        circle.setAttribute("r", r.toString());
        circle.setAttribute("stroke", color);
        circle.setAttribute("stroke-dasharray", `${strokeLength} ${circumference}`);
        circle.setAttribute("stroke-dashoffset", strokeOffset.toString());
        chartSvg.appendChild(circle);

        accumulatedPercent += percentage;

        // Build Legend Item
        const legItem = document.createElement("div");
        legItem.className = "legend-item";
        legItem.innerHTML = `
            <span class="legend-label">
                <span class="legend-color" style="background-color: ${color};"></span>
                ${cat} (${qty} un)
            </span>
            <span class="legend-percentage">${percentValue}%</span>
        `;
        legendContainer.appendChild(legItem);
    });

    // Make sure center text hole is drawn on top
    const centerHole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerHole.setAttribute("class", "chart-hole");
    centerHole.setAttribute("cx", "50");
    centerHole.setAttribute("cy", "50");
    centerHole.setAttribute("r", "20");
    chartSvg.appendChild(centerHole);
}

function renderDashboardRecentTable() {
    const products = DB.getProducts();
    
    // Sort by date added or splice last 5
    const recent = [...products].reverse().slice(0, 4);
    const tbody = document.getElementById("dashboard-recent-products");
    tbody.innerHTML = "";

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center" style="color: var(--color-text-muted); padding: 1.5rem;">Nenhum produto cadastrado.</td></tr>`;
        return;
    }

    recent.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="padding: 0.75rem 1.25rem;">
                <div class="product-cell">
                    <div class="product-cell-img" style="border-color: ${p.imageColor}; background-color: ${p.imageColor}0d;">
                        <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
                            ${getProductIcon(p.category, p.imageColor)}
                        </div>
                    </div>
                    <div class="product-cell-info">
                        <span class="product-cell-name" style="font-size: 0.85rem;">${p.name}</span>
                        <span class="product-cell-sku" style="font-size: 0.7rem;">${p.sku} | Tam: ${p.size}</span>
                    </div>
                </div>
            </td>
            <td style="padding: 0.75rem 1.25rem; font-size: 0.825rem; font-weight: 500;">${p.category}</td>
            <td style="padding: 0.75rem 1.25rem; text-align: right; font-weight: 600; font-size: 0.825rem;">${formatCurrency(p.price)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== PRODUCT MANAGEMENT CRUDS ====================
function setupProductHandlers() {
    const searchInput = document.getElementById("search-products-input");
    const catFilter = document.getElementById("filter-category");
    const sizeFilter = document.getElementById("filter-size");
    const stockFilter = document.getElementById("filter-stock-status");
    
    // Inputs & Modals
    const openAddModalBtn = document.getElementById("btn-open-add-modal");
    const productModal = document.getElementById("product-modal");
    const productForm = document.getElementById("product-form");
    const cancelModalBtn = document.getElementById("btn-cancel-product-modal");
    const closeModalBtn = document.getElementById("btn-close-product-modal");
    
    // Color dot picking
    const colorDots = document.querySelectorAll("#image-color-selector .color-dot");
    const colorInput = document.getElementById("product-image-color");

    // Event listeners filters
    searchInput.addEventListener("input", () => { currentPage = 1; applyProductFilters(); });
    catFilter.addEventListener("change", () => { currentPage = 1; applyProductFilters(); });
    sizeFilter.addEventListener("change", () => { currentPage = 1; applyProductFilters(); });
    stockFilter.addEventListener("change", () => { currentPage = 1; applyProductFilters(); });

    // Open/Close modal
    openAddModalBtn.addEventListener("click", () => {
        document.getElementById("product-modal-title").textContent = "Adicionar Produto";
        productForm.reset();
        document.getElementById("product-form-index").value = "";
        
        // Reset color dots
        colorDots.forEach(dot => dot.classList.remove("active"));
        colorDots[0].classList.add("active");
        colorInput.value = colorDots[0].getAttribute("data-color");
        
        productModal.classList.add("active");
    });

    const closeModal = () => productModal.classList.remove("active");
    cancelModalBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    // Color selectors
    colorDots.forEach(dot => {
        dot.addEventListener("click", () => {
            colorDots.forEach(d => d.classList.remove("active"));
            dot.classList.add("active");
            colorInput.value = dot.getAttribute("data-color");
        });
    });

    // Form Submission (Add or Edit)
    productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const indexValue = document.getElementById("product-form-index").value;
        const name = document.getElementById("product-name").value;
        const category = document.getElementById("product-category").value;
        const size = document.getElementById("product-size").value;
        const sku = document.getElementById("product-sku").value;
        const price = parseFloat(document.getElementById("product-price").value);
        const qty = parseInt(document.getElementById("product-qty").value);
        const minQty = parseInt(document.getElementById("product-min-qty").value);
        const color = colorInput.value;

        const products = DB.getProducts();

        if (indexValue !== "") {
            // Edit Mode
            const prodIndex = products.findIndex(p => p.id === indexValue);
            if (prodIndex > -1) {
                products[prodIndex] = {
                    ...products[prodIndex],
                    name, category, size, sku, price, qty, minQty, imageColor: color
                };
                DB.saveProducts(products);
                showToast("Produto Atualizado", `${name} foi salvo com sucesso.`, "success");
            }
        } else {
            // Add Mode
            const newProduct = {
                id: "prod-" + Date.now(),
                name, category, size, sku, price, qty, minQty,
                imageColor: color,
                dateAdded: new Date().toISOString().split("T")[0]
            };
            products.push(newProduct);
            DB.saveProducts(products);
            showToast("Produto Cadastrado", `${name} foi adicionado ao estoque.`, "success");
        }

        productModal.classList.remove("active");
        currentProducts = DB.getProducts();
        applyProductFilters();
    });

    // Delete confirm modal setup
    const deleteConfirmModal = document.getElementById("delete-confirm-modal");
    const cancelDeleteBtn = document.getElementById("btn-cancel-delete");
    const confirmDeleteBtn = document.getElementById("btn-confirm-delete");

    cancelDeleteBtn.addEventListener("click", () => deleteConfirmModal.classList.remove("active"));
    
    confirmDeleteBtn.addEventListener("click", () => {
        const idToDelete = document.getElementById("delete-product-index").value;
        const products = DB.getProducts();
        const prodIndex = products.findIndex(p => p.id === idToDelete);
        
        if (prodIndex > -1) {
            const prodName = products[prodIndex].name;
            products.splice(prodIndex, 1);
            DB.saveProducts(products);
            showToast("Produto Excluído", `${prodName} foi removido do estoque.`, "error");
        }

        deleteConfirmModal.classList.remove("active");
        currentProducts = DB.getProducts();
        applyProductFilters();
    });
}

function applyProductFilters() {
    const searchVal = document.getElementById("search-products-input").value.toLowerCase();
    const catVal = document.getElementById("filter-category").value;
    const sizeVal = document.getElementById("filter-size").value;
    const stockVal = document.getElementById("filter-stock-status").value;

    filteredProducts = currentProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.sku.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal);
        const matchesCategory = catVal === "" || p.category === catVal;
        const matchesSize = sizeVal === "" || p.size === sizeVal;
        
        let matchesStock = true;
        if (stockVal === "normal") {
            matchesStock = p.qty > p.minQty;
        } else if (stockVal === "baixo") {
            matchesStock = p.qty <= p.minQty && p.qty > 0;
        } else if (stockVal === "esgotado") {
            matchesStock = p.qty === 0;
        }

        return matchesSearch && matchesCategory && matchesSize && matchesStock;
    });

    renderProductsTable();
}

function renderProductsTable() {
    const tbody = document.getElementById("products-table-body");
    tbody.innerHTML = "";

    const totalCount = filteredProducts.length;
    document.getElementById("pagination-total-count").textContent = totalCount;

    if (totalCount === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="color: var(--color-text-muted); padding: 3rem;">
                    <div class="flex flex-col align-center justify-center gap-2" style="align-items: center;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; color: var(--color-text-light); margin-bottom: 0.5rem;">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <span style="font-weight: 500;">Nenhum produto correspondente encontrado.</span>
                        <button class="btn btn-outline" id="btn-clear-filters" style="margin-top: 0.75rem; padding: 0.45rem 1rem; font-size: 0.8rem; width: auto; font-weight: 600;">Limpar Filtros</button>
                    </div>
                </td>
            </tr>
        `;
        document.getElementById("pagination-showing-start").textContent = 0;
        document.getElementById("pagination-showing-end").textContent = 0;
        renderPaginationControls(0);
        
        // Wire clear filters
        const clearBtn = document.getElementById("btn-clear-filters");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                document.getElementById("search-products-input").value = "";
                document.getElementById("filter-category").value = "";
                document.getElementById("filter-size").value = "";
                document.getElementById("filter-stock-status").value = "";
                applyProductFilters();
            });
        }
        return;
    }

    // Paginate items
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, totalCount);

    document.getElementById("pagination-showing-start").textContent = startIdx + 1;
    document.getElementById("pagination-showing-end").textContent = endIdx;

    const paginatedItems = filteredProducts.slice(startIdx, endIdx);

    paginatedItems.forEach(p => {
        // Status calculations
        let statusBadge = "";
        if (p.qty === 0) {
            statusBadge = `<span class="badge badge-danger"><span class="badge-dot"></span>Esgotado</span>`;
        } else if (p.qty <= p.minQty) {
            statusBadge = `<span class="badge badge-warning"><span class="badge-dot"></span>Estoque Baixo</span>`;
        } else {
            statusBadge = `<span class="badge badge-success"><span class="badge-dot"></span>Disponível</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Produto">
                <div class="product-cell">
                    <div class="product-cell-img" style="border-color: ${p.imageColor}; background-color: ${p.imageColor}0d;">
                        <div style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                            ${getProductIcon(p.category, p.imageColor)}
                        </div>
                    </div>
                    <div class="product-cell-info">
                        <span class="product-cell-name">${p.name}</span>
                        <span class="product-cell-sku">${p.sku}</span>
                    </div>
                </div>
            </td>
            <td data-label="Categoria">${p.category}</td>
            <td data-label="Tamanho" style="font-weight: 600;">${p.size}</td>
            <td data-label="Preço" style="text-align: right; font-weight: 600;">${formatCurrency(p.price)}</td>
            <td data-label="Quantidade" style="text-align: center;">
                <div class="flex flex-col align-center gap-2">
                    <span style="font-weight: 700;">${p.qty} un</span>
                    ${statusBadge}
                </div>
            </td>
            <td data-label="Ações" style="text-align: center;">
                <div class="table-actions" style="justify-content: center;">
                    <button class="btn-icon btn-icon-edit" data-id="${p.id}" title="Editar Produto">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                    ${JSON.parse(localStorage.getItem("vestcontrol_user"))?.role !== "employee" ? `
                    <button class="btn-icon btn-icon-delete" data-id="${p.id}" title="Excluir Produto">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Wire edit & delete triggers
    document.querySelectorAll(".btn-icon-edit").forEach(btn => {
        btn.addEventListener("click", () => {
            const prodId = btn.getAttribute("data-id");
            openEditProductModal(prodId);
        });
    });

    document.querySelectorAll(".btn-icon-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const prodId = btn.getAttribute("data-id");
            openConfirmDeleteModal(prodId);
        });
    });

    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const controls = document.getElementById("pagination-controls-wrapper");
    controls.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    `;
    if (currentPage > 1) {
        prevBtn.addEventListener("click", () => {
            currentPage--;
            renderProductsTable();
        });
    }
    controls.appendChild(prevBtn);

    // Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const numBtn = document.createElement("button");
        numBtn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
        numBtn.textContent = i;
        numBtn.addEventListener("click", () => {
            currentPage = i;
            renderProductsTable();
        });
        controls.appendChild(numBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    `;
    if (currentPage < totalPages) {
        nextBtn.addEventListener("click", () => {
            currentPage++;
            renderProductsTable();
        });
    }
    controls.appendChild(nextBtn);
}

function openEditProductModal(id) {
    const products = DB.getProducts();
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById("product-modal-title").textContent = "Editar Produto";
    
    // Fill Form fields
    document.getElementById("product-form-index").value = p.id;
    document.getElementById("product-name").value = p.name;
    document.getElementById("product-category").value = p.category;
    document.getElementById("product-size").value = p.size;
    document.getElementById("product-sku").value = p.sku;
    document.getElementById("product-price").value = p.price;
    document.getElementById("product-qty").value = p.qty;
    document.getElementById("product-min-qty").value = p.minQty;
    document.getElementById("product-image-color").value = p.imageColor;

    // Set active color dot picker
    const colorDots = document.querySelectorAll("#image-color-selector .color-dot");
    colorDots.forEach(dot => {
        if (dot.getAttribute("data-color") === p.imageColor) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    document.getElementById("product-modal").classList.add("active");
}

function openConfirmDeleteModal(id) {
    const products = DB.getProducts();
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById("delete-product-index").value = p.id;
    document.getElementById("delete-product-details").textContent = `${p.name} (SKU: ${p.sku} | Tam: ${p.size})`;
    
    document.getElementById("delete-confirm-modal").classList.add("active");
}

// ==================== QUICK STOCK ADJUSTMENTS ====================
function setupStockHandlers() {
    const searchInput = document.getElementById("search-stock-input");
    searchInput.addEventListener("input", renderStockTable);
}

function renderStockTable() {
    const products = DB.getProducts();
    const searchVal = document.getElementById("search-stock-input").value.toLowerCase();
    
    const tbody = document.getElementById("stock-table-body");
    tbody.innerHTML = "";

    const filtered = products.filter(p => {
        return p.name.toLowerCase().includes(searchVal) || p.sku.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--color-text-muted); padding: 3rem;">Nenhum produto correspondente no estoque.</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        // Status calculations
        let statusBadge = "";
        if (p.qty === 0) {
            statusBadge = `<span class="badge badge-danger" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Crítico (Esgotado)</span>`;
        } else if (p.qty < 5) {
            statusBadge = `<span class="badge badge-danger" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Crítico (&lt;5)</span>`;
        } else if (p.qty <= p.minQty) {
            statusBadge = `<span class="badge badge-warning" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Baixo (${p.qty} un)</span>`;
        } else {
            statusBadge = `<span class="badge badge-success" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Normal</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="Produto">
                <div class="product-cell">
                    <div class="product-cell-img" style="border-color: ${p.imageColor}; background-color: ${p.imageColor}0d;">
                        <div style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                            ${getProductIcon(p.category, p.imageColor)}
                        </div>
                    </div>
                    <div class="product-cell-info">
                        <span class="product-cell-name">${p.name}</span>
                        <span class="product-cell-sku">${p.sku} | Tam: ${p.size}</span>
                    </div>
                </div>
            </td>
            <td data-label="Quantidade Atual" style="text-align: center; font-weight: 700; font-size: 1rem;" id="stock-qty-text-${p.id}">${p.qty} un</td>
            <td data-label="Mínimo Alerta" style="text-align: center; color: var(--color-text-muted); font-weight: 500;">${p.minQty} un</td>
            <td data-label="Status" id="stock-badge-container-${p.id}">${statusBadge}</td>
            <td data-label="Ajuste Rápido" style="text-align: center;">
                <div class="stock-adjust-group" style="justify-content: center;">
                    <button class="btn-adjust btn-decrement" data-id="${p.id}">-</button>
                    <input type="number" class="stock-adjust-input" id="stock-input-${p.id}" value="${p.qty}" data-id="${p.id}" min="0">
                    <button class="btn-adjust btn-increment" data-id="${p.id}">+</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Wire Adjustments triggers
    document.querySelectorAll(".btn-decrement").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            adjustStockValue(id, -1);
        });
    });

    document.querySelectorAll(".btn-increment").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            adjustStockValue(id, 1);
        });
    });

    document.querySelectorAll('.stock-adjust-input').forEach(input => {
        const handleInputChange = () => {
            if (input.value === '') return;
            const id = input.getAttribute('data-id');
            const val = parseInt(input.value);
            setStockValue(id, isNaN(val) || val < 0 ? 0 : val);
        };
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', handleInputChange);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });
}

function adjustStockValue(id, amount) {
    const products = DB.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
        const currentQty = parseInt(products[idx].qty) || 0;
        const amountVal = parseInt(amount) || 0;
        let newQty = currentQty + amountVal;
        if (newQty < 0) newQty = 0;
        
        const oldQty = currentQty;
        products[idx].qty = newQty;
        DB.saveProducts(products);

        const inputEl = document.getElementById('stock-input-' + id);
        if (inputEl) {
            inputEl.value = newQty;
        }
        
        const qtyText = document.getElementById('stock-qty-text-' + id);
        if (qtyText) {
            qtyText.textContent = newQty + ' un';
            qtyText.classList.remove('qty-changed-up', 'qty-changed-down');
            void qtyText.offsetWidth; // trigger reflow
            qtyText.classList.add(amountVal > 0 ? 'qty-changed-up' : 'qty-changed-down');
        }

        updateStockBadge(id, products[idx]);
        checkStockNotification(products[idx], oldQty, newQty);
    }
}

function setStockValue(id, val) {
    const products = DB.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
        const oldQty = parseInt(products[idx].qty) || 0;
        const newQty = parseInt(val) || 0;
        products[idx].qty = newQty;
        DB.saveProducts(products);

        const inputEl = document.getElementById('stock-input-' + id);
        if (inputEl) {
            inputEl.value = newQty;
        }
        
        const qtyText = document.getElementById('stock-qty-text-' + id);
        if (qtyText) {
            qtyText.textContent = newQty + ' un';
            qtyText.classList.remove('qty-changed-up', 'qty-changed-down');
            void qtyText.offsetWidth; // trigger reflow
            if (newQty > oldQty) {
                qtyText.classList.add('qty-changed-up');
            } else if (newQty < oldQty) {
                qtyText.classList.add('qty-changed-down');
            }
        }

        updateStockBadge(id, products[idx]);
        checkStockNotification(products[idx], oldQty, newQty);
    }
}



function updateStockBadge(id, product) {
    const container = document.getElementById(`stock-badge-container-${id}`);
    if (!container) return;

    let badgeHtml = "";
    if (product.qty === 0) {
        badgeHtml = `<span class="badge badge-danger" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Crítico (Esgotado)</span>`;
    } else if (product.qty < 5) {
        badgeHtml = `<span class="badge badge-danger" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Crítico (&lt;5)</span>`;
    } else if (product.qty <= product.minQty) {
        badgeHtml = `<span class="badge badge-warning" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Baixo (${product.qty} un)</span>`;
    } else {
        badgeHtml = `<span class="badge badge-success" style="padding: 0.35rem 0.75rem;"><span class="badge-dot"></span>Normal</span>`;
    }
    container.innerHTML = badgeHtml;
}

function checkStockNotification(product, oldQty, newQty) {
    if (newQty <= product.minQty && oldQty > product.minQty) {
        if (newQty === 0) {
            showToast("Estoque Zerado", `O produto ${product.name} esgotou!`, "error");
        } else {
            showToast("Alerta de Estoque", `Estoque baixo para ${product.name} (${newQty} un)`, "warning");
        }
    }
}

// ==================== REPORTS AND EXPORTS CONTROLLERS ====================
function setupReportsHandlers() {
    const reportCards = document.querySelectorAll(".report-card");
    const generateBtn = document.getElementById("btn-generate-report");
    const excelBtn = document.getElementById("btn-export-excel");
    const pdfBtn = document.getElementById("btn-export-pdf");
    const periodSelect = document.getElementById("report-period-select");

    // Report Type switcher card clicks
    reportCards.forEach(card => {
        card.addEventListener("click", () => {
            reportCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            currentReportType = card.getAttribute("data-report-type");
            generateSelectedReport();
        });
    });

    // Date/Period text changer
    periodSelect.addEventListener("change", () => {
        const textSpan = document.getElementById("report-period-text");
        const val = periodSelect.value;
        if (val === "current-month") {
            textSpan.textContent = "01/05/2026 a 31/05/2026";
        } else if (val === "last-month") {
            textSpan.textContent = "01/04/2026 a 30/04/2026";
        } else if (val === "current-year") {
            textSpan.textContent = "01/01/2026 a 31/12/2026";
        }
        calculateReportsSidebar();
        generateSelectedReport();
    });

    generateBtn.addEventListener("click", () => {
        const count = DB.incrementReportsCount();
        generateSelectedReport();
        showToast("Relatório Gerado", `Relatório nº ${count} gerado com sucesso.`, "success");
    });

    excelBtn.addEventListener("click", () => {
        exportCSVFile();
    });

    pdfBtn.addEventListener("click", () => {
        triggerPDFPrint();
    });
}

function calculateReportsSidebar() {
    const products = DB.getProducts();
    const period = document.getElementById("report-period-select").value;

    let itemsMultiplier = 1;
    let priceMultiplier = 1;
    
    if (period === "last-month") {
        itemsMultiplier = 0.9;
        priceMultiplier = 0.95;
    } else if (period === "current-year") {
        itemsMultiplier = 8.5;
        priceMultiplier = 8.2;
    }

    let valuation = 0;
    let lowStockCount = 0;
    products.forEach(p => {
        valuation += p.qty * p.price;
        if (p.qty <= p.minQty) lowStockCount++;
    });

    const soldCount = Math.round(350 * itemsMultiplier);
    const totalSales = 24580.00 * priceMultiplier;
    const avgTicket = soldCount > 0 ? (totalSales / soldCount) : 0;

    // Apply values to UI
    document.getElementById("report-summary-sales").textContent = formatCurrency(totalSales);
    document.getElementById("report-summary-items").textContent = `${soldCount} itens`;
    document.getElementById("report-summary-ticket").textContent = formatCurrency(avgTicket);
    document.getElementById("report-summary-lowstock").textContent = `${lowStockCount} itens`;
    document.getElementById("report-summary-valuation").textContent = formatCurrency(valuation);
}

function generateSelectedReport() {
    const products = DB.getProducts();
    const tableElement = document.getElementById("report-preview-table");
    const previewTitle = document.getElementById("report-preview-title");
    
    const thead = tableElement.querySelector("thead");
    const tbody = tableElement.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (currentReportType === "stock") {
        previewTitle.textContent = "Visualização do Relatório — Posição de Estoque";
        
        thead.innerHTML = `
            <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th style="text-align: right;">Preço Unitário</th>
                <th style="text-align: center;">Quantidade</th>
                <th style="text-align: right;">Total Avaliado</th>
            </tr>
        `;

        products.forEach(p => {
            const tr = document.createElement("tr");
            const valuationRow = p.qty * p.price;
            tr.innerHTML = `
                <td>
                    <span style="font-weight: 600; color: var(--color-text-dark);">${p.name}</span><br>
                    <span style="font-size: 0.75rem; color: var(--color-text-muted);">${p.sku} | Tam: ${p.size}</span>
                </td>
                <td>${p.category}</td>
                <td style="text-align: right;">${formatCurrency(p.price)}</td>
                <td style="text-align: center; font-weight: 600;">${p.qty} un</td>
                <td style="text-align: right; font-weight: 700; color: var(--color-primary);">${formatCurrency(valuationRow)}</td>
            `;
            tbody.appendChild(tr);
        });

    } else if (currentReportType === "category") {
        previewTitle.textContent = "Visualização do Relatório — Resumo por Categoria";
        
        thead.innerHTML = `
            <tr>
                <th>Categoria</th>
                <th style="text-align: center;">Produtos Únicos</th>
                <th style="text-align: center;">Peças em Estoque</th>
                <th style="text-align: right;">Faturamento / Custo Estoque</th>
                <th style="text-align: right;">Proporção</th>
            </tr>
        `;

        // Gather categories
        const catStats = {};
        let totalItems = 0;
        let totalValuation = 0;

        products.forEach(p => {
            if (!catStats[p.category]) {
                catStats[p.category] = { unique: 0, items: 0, cost: 0 };
            }
            catStats[p.category].unique++;
            catStats[p.category].items += p.qty;
            catStats[p.category].cost += (p.qty * p.price);
            
            totalItems += p.qty;
            totalValuation += (p.qty * p.price);
        });

        Object.keys(catStats).forEach(cat => {
            const data = catStats[cat];
            const ratio = totalValuation > 0 ? (data.cost / totalValuation) * 100 : 0;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--color-text-dark);">${cat}</td>
                <td style="text-align: center;">${data.unique} itens</td>
                <td style="text-align: center; font-weight: 600;">${data.items} un</td>
                <td style="text-align: right; font-weight: 700;">${formatCurrency(data.cost)}</td>
                <td style="text-align: right; color: var(--color-text-muted); font-weight: 600;">${ratio.toFixed(1)}%</td>
            `;
            tbody.appendChild(tr);
        });

    } else if (currentReportType === "depleted") {
        previewTitle.textContent = "Visualização do Relatório — Produtos Esgotados / Críticos";
        
        thead.innerHTML = `
            <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th style="text-align: center;">Quantidade Atual</th>
                <th style="text-align: center;">Limite de Segurança</th>
                <th>Status Crítico</th>
            </tr>
        `;

        const depleted = products.filter(p => p.qty <= p.minQty);

        if (depleted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--color-success); font-weight: 600; padding: 2rem;">Excelente! Não há nenhum produto com estoque baixo.</td></tr>`;
            return;
        }

        depleted.forEach(p => {
            const statusLabel = p.qty === 0 
                ? `<span class="badge badge-danger"><span class="badge-dot"></span>Esgotado</span>`
                : `<span class="badge badge-warning"><span class="badge-dot"></span>Estoque Baixo</span>`;
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <span style="font-weight: 600; color: var(--color-text-dark);">${p.name}</span><br>
                    <span style="font-size: 0.75rem; color: var(--color-text-muted);">${p.sku} | Tam: ${p.size}</span>
                </td>
                <td>${p.category}</td>
                <td style="text-align: center; font-weight: 700; color: var(--color-danger);">${p.qty} un</td>
                <td style="text-align: center; color: var(--color-text-muted);">${p.minQty} un</td>
                <td>${statusLabel}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}



function exportCSVFile() {
    const products = DB.getProducts();
    let csvData = "";
    
    if (currentReportType === "stock") {
        csvData += "Nome,Categoria,Tamanho,SKU,Preço Unitário,Quantidade,Total Avaliado\n";
        products.forEach(p => {
            const rowVal = p.qty * p.price;
            csvData += `"${p.name}","${p.category}","${p.size}","${p.sku}",${p.price},${p.qty},${rowVal.toFixed(2)}\n`;
        });
    } else if (currentReportType === "category") {
        csvData += "Categoria,Produtos Únicos,Peças em Estoque,Total Valuation\n";
        const catStats = {};
        products.forEach(p => {
            if (!catStats[p.category]) {
                catStats[p.category] = { unique: 0, items: 0, cost: 0 };
            }
            catStats[p.category].unique++;
            catStats[p.category].items += p.qty;
            catStats[p.category].cost += (p.qty * p.price);
        });
        Object.keys(catStats).forEach(cat => {
            const d = catStats[cat];
            csvData += `"${cat}",${d.unique},${d.items},${d.cost.toFixed(2)}\n`;
        });
    } else if (currentReportType === "depleted") {
        csvData += "Nome,Categoria,SKU,Tamanho,Quantidade Atual,Mínimo Alerta\n";
        const depleted = products.filter(p => p.qty <= p.minQty);
        depleted.forEach(p => {
            csvData += `"${p.name}","${p.category}","${p.sku}","${p.size}",${p.qty},${p.minQty}\n`;
        });
    }

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const formattedDate = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `VestControl-Relatorio-${currentReportType}-${formattedDate}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Planilha Gerada", "O download do arquivo CSV iniciou.", "success");
}

function triggerPDFPrint() {
    // Add printable class wrapper to our target element
    const printArea = document.getElementById("report-table-print-area");
    
    // Create print header elements
    const printHeader = document.createElement("div");
    printHeader.className = "print-area";
    printHeader.style.padding = "20px";
    printHeader.style.fontFamily = "sans-serif";
    
    const periodText = document.getElementById("report-period-text").textContent;
    
    printHeader.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px; margin-bottom: 20px;">
            <div>
                <h1 style="margin: 0; color: #1E3A8A; font-size: 22px;">VESTCONTROL — Relatório Executivo</h1>
                <p style="margin: 5px 0 0 0; color: #555; font-size: 13px;">Controle inteligente para sua loja</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold; font-size: 13px;">Período: ${periodText}</p>
                <p style="margin: 3px 0 0 0; font-size: 11px; color: #888;">Emitido em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
        </div>
        <div>
            ${printArea.innerHTML}
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 11px; text-align: center; color: #888;">
            Sistema de Gerenciamento VestControl © 2026. Documento acadêmico/profissional.
        </div>
    `;

    document.body.appendChild(printHeader);
    
    // Switch on visibility just for the print operation
    printHeader.classList.add("print-area");
    window.print();
    
    // Clean up
    document.body.removeChild(printHeader);
    showToast("PDF Exportado", "Impressão / PDF gerado com sucesso.", "success");
}

// ==================== TOAST NOTIFICATION CREATOR ====================
function showToast(title, message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    // Icon Selection
    let iconSvg = "";
    if (type === "success") {
        iconSvg = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === "error") {
        iconSvg = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === "warning") {
        iconSvg = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon toast-icon-${type}">
            ${iconSvg}
        </div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
    `;

    container.appendChild(toast);
    
    // Auto-remove toast
    setTimeout(() => {
        toast.classList.add("removing");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==================== HELPER FORMATTERS ====================
function formatCurrency(val) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(val);
}

// Custom SVGs tailored for clothes categories
function getProductIcon(category, color) {
    const defaultColor = color || "var(--color-primary)";
    const icons = {
        "Camisetas": `
            <svg viewBox="0 0 24 24" fill="none" stroke="${defaultColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M4 9 L7.5 5.5 L10 7.5 L10 4 C10 4, 12 3, 14 4 L14 7.5 L16.5 5.5 L20 9 L18 11 L18 20 L6 20 L6 11 Z" />
            </svg>
        `,
        "Calças": `
            <svg viewBox="0 0 24 24" fill="none" stroke="${defaultColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M5 4 H19 L21 8 L18 20 H13 L12 11 L11 20 H6 L3 8 Z" />
                <path d="M5 8 H19" />
            </svg>
        `,
        "Jaquetas": `
            <svg viewBox="0 0 24 24" fill="none" stroke="${defaultColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M5 5 L10 3 L12 5 L14 3 L19 5 L18 21 H6 Z" />
                <path d="M12 5 V21" />
                <path d="M10 3 L12 8 M14 3 L12 8" />
            </svg>
        `,
        "Moletons": `
            <svg viewBox="0 0 24 24" fill="none" stroke="${defaultColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M6 9 L9.5 5.5 L11.5 2 C11.5 2, 12.5 1, 13.5 2 L14.5 5.5 L18 9 L16.5 11 L15 10 L15 20 H9 L9 10 L7.5 11 Z" />
                <circle cx="12" cy="13" r="2" />
                <path d="M11 7 L11 9 M13 7 L13 9" />
            </svg>
        `,
        "Calçados": `
            <svg viewBox="0 0 24 24" fill="none" stroke="${defaultColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                <path d="M3 16 L6 9 C8 9, 12 11, 14 9 L20 12 L21 16 H3 Z" />
                <path d="M6 9 C6 9, 7 12, 11 12 M14 9 C14 9, 15 12, 18 12" />
                <path d="M3 14 H21" />
            </svg>
        `,
        "Acessórios": `
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; color: ${defaultColor}; fill: none;">
                <path d="M 50 38 C 50 28, 60 28, 60 33 C 60 38, 50 38, 50 45" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none" />
                <path d="M 15 65 L 50 45 L 85 65 C 80 67, 20 67, 15 65 Z" stroke="currentColor" stroke-width="6" stroke-linejoin="round" fill="none" />
                <path d="M 46 55 L 54 55 L 56 61 L 50 78 L 44 61 Z" fill="${defaultColor}" />
                <path d="M 45 51 L 55 51 L 53 55 L 47 55 Z" fill="${defaultColor}" opacity="0.8" />
            </svg>
        `
    };
    return icons[category] || icons["Acessórios"];
}

// ==================== GLOBAL UI DECORATIVE EFFECTS ====================
function setupThemeUIEffects() {
    // Custom button click scale effects
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(btn => {
        btn.addEventListener("mousedown", () => btn.style.transform = "scale(0.98)");
        btn.addEventListener("mouseup", () => btn.style.transform = "none");
        btn.addEventListener("mouseleave", () => btn.style.transform = "none");
    });
}

function setupThemeToggle() {
    const btnToggleTheme = document.getElementById("btn-toggle-theme");
    const sunIcon = document.getElementById("theme-icon-sun");
    const moonIcon = document.getElementById("theme-icon-moon");
    
    if (!btnToggleTheme) return;

    // Load preference
    const savedTheme = localStorage.getItem("vestcontrol_theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        if (sunIcon) sunIcon.style.display = "block";
        if (moonIcon) moonIcon.style.display = "none";
    } else {
        document.body.classList.remove("dark-theme");
        if (sunIcon) sunIcon.style.display = "none";
        if (moonIcon) moonIcon.style.display = "block";
    }

    btnToggleTheme.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem("vestcontrol_theme", isDark ? "dark" : "light");
        
        if (isDark) {
            if (sunIcon) sunIcon.style.display = "block";
            if (moonIcon) moonIcon.style.display = "none";
            showToast("Modo Escuro", "Tema alterado com sucesso!", "success");
        } else {
            if (sunIcon) sunIcon.style.display = "none";
            if (moonIcon) moonIcon.style.display = "block";
            showToast("Modo Claro", "Tema alterado com sucesso!", "success");
        }
    });
}
