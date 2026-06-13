/* ===== SPOTLIGHT EFFECT ===== */
document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--x", e.clientX + "px");
    document.body.style.setProperty("--y", e.clientY + "px");
});

/* ===== SUPABASE SETUP ===== */
const SUPABASE_URL = "https://yxtcyfxupfhlgfknhfke.supabase.co";
const SUPABASE_KEY = "sb_publishable_QNNFueMNFT6fnpEhXNdzDg__s-xQm5M";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ===== STATE ===== */
let pages = [];
let currentPageId = null;
let activeCategory = "All";
let currentUser = null;
let authMode = "signin"; // "signin" | "signup"

const CATEGORIES = ["All", "Ideas", "Projects", "Plans", "Diary", "Other"];

/* ===== ELEMENTS ===== */
const pageTitle = document.getElementById("pageTitle");
const navbar = document.getElementById("navbar");
const content = document.getElementById("content");
const hero = document.getElementById("hero");
const welcomeHeading = document.getElementById("welcomeHeading");
const appContent = document.getElementById("appContent");

const authBox = document.getElementById("authBox");
const authHeading = document.getElementById("authHeading");
const authName = document.getElementById("authName");
const authNameLabel = document.getElementById("authNameLabel");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authError = document.getElementById("authError");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authSwitchText = document.getElementById("authSwitchText");
const authSwitchLink = document.getElementById("authSwitchLink");

const pageView = document.getElementById("pageView");
const pageTitleDisplay = document.getElementById("pageTitleDisplay");
const pageMeta = document.getElementById("pageMeta");
const pageContentDisplay = document.getElementById("pageContentDisplay");

const editor = document.getElementById("editor");
const editorHeading = document.getElementById("editorHeading");
const pageTitleInput = document.getElementById("pageTitleInput");
const pageCategoryInput = document.getElementById("pageCategoryInput");
const pageContentInput = document.getElementById("pageContentInput");

const newPageBtn = document.getElementById("newPageBtn");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

/* ===== HELPERS ===== */
function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric"
    }) + " " + d.toLocaleTimeString(undefined, {
        hour: "2-digit", minute: "2-digit"
    });
}

function showOnly(section) {
    [hero, content, pageView, editor].forEach(el => el.classList.add("hidden"));
    section.classList.remove("hidden");
}

function getDisplayName(user) {
    if (!user) return "";
    return user.user_metadata?.name || user.email?.split("@")[0] || "User";
}

/* ===== AUTH UI ===== */
function setAuthMode(mode) {
    authMode = mode;
    authError.classList.add("hidden");
    authError.textContent = "";

    if (mode === "signin") {
        authHeading.textContent = "Sign In";
        authSubmitBtn.textContent = "Sign In";
        authSwitchText.textContent = "Don't have an account?";
        authSwitchLink.textContent = "Sign up";
        authName.classList.add("hidden");
        authNameLabel.classList.add("hidden");
    } else {
        authHeading.textContent = "Sign Up";
        authSubmitBtn.textContent = "Create Account";
        authSwitchText.textContent = "Already have an account?";
        authSwitchLink.textContent = "Sign in";
        authName.classList.remove("hidden");
        authNameLabel.classList.remove("hidden");
    }
}

authSwitchLink.addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode(authMode === "signin" ? "signup" : "signin");
});

authSubmitBtn.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    authError.classList.add("hidden");

    if (!email || !password) {
        authError.textContent = "Please fill in email and password.";
        authError.classList.remove("hidden");
        return;
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Please wait...";

    try {
        if (authMode === "signup") {
            const { data, error } = await sb.auth.signUp({
                email,
                password,
                options: { data: { name: name || email.split("@")[0] } }
            });

            if (error) throw error;

            if (data.user && !data.session) {
                authError.textContent = "Account created! Check your email to confirm, then sign in.";
                authError.classList.remove("hidden");
                setAuthMode("signin");
            }
        } else {
            const { error } = await sb.auth.signInWithPassword({ email, password });
            if (error) throw error;
        }
    } catch (err) {
        authError.textContent = err.message || "Something went wrong.";
        authError.classList.remove("hidden");
    } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = authMode === "signup" ? "Create Account" : "Sign In";
    }
});

logoutBtn.addEventListener("click", async () => {
    await sb.auth.signOut();
});

/* ===== AUTH STATE LISTENER ===== */
sb.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;

    if (currentUser) {
        showApp();
    } else {
        showAuth();
    }
});

function showAuth() {
    authBox.classList.remove("hidden");
    appContent.classList.add("hidden");
    pageTitle.textContent = "Encyclopedie";
    navbar.innerHTML = "";
}

async function showApp() {
    authBox.classList.add("hidden");
    appContent.classList.remove("hidden");

    const name = getDisplayName(currentUser);
    pageTitle.textContent = `Encyclopedie van ${name}`;
    welcomeHeading.textContent = `Welcome, ${name}`;

    await fetchPages();
    renderNavbar();
    renderHome();
}

/* ===== DATA: FETCH ===== */
async function fetchPages() {
    const { data, error } = await sb
        .from("pages")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        console.error(error);
        pages = [];
        return;
    }

    pages = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        content: row.content,
        created: new Date(row.created_at).getTime(),
        updated: new Date(row.updated_at).getTime()
    }));
}

/* ===== RENDER NAVBAR ===== */
function renderNavbar() {
    navbar.innerHTML = "";

    CATEGORIES.forEach(cat => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = cat;

        if (cat === activeCategory) {
            a.classList.add("active");
        }

        a.addEventListener("click", (e) => {
            e.preventDefault();
            activeCategory = cat;
            currentPageId = null;
            renderNavbar();
            renderHome();
        });

        li.appendChild(a);
        navbar.appendChild(li);
    });
}

/* ===== RENDER HOME / CARD LIST ===== */
function renderHome() {
    showOnly(content);
    hero.classList.remove("hidden");

    content.innerHTML = "";

    const filtered = activeCategory === "All"
        ? pages
        : pages.filter(p => p.category === activeCategory);

    const sorted = [...filtered].sort((a, b) => b.updated - a.updated);

    if (sorted.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = activeCategory === "All"
            ? "No pages yet. Click '+ New Page' to create your first one."
            : `No pages in "${activeCategory}" yet.`;
        content.appendChild(empty);
        return;
    }

    sorted.forEach(p => {
        const article = document.createElement("article");

        const cat = document.createElement("span");
        cat.className = "card-category";
        cat.textContent = p.category;

        const h3 = document.createElement("h3");
        h3.textContent = p.title;

        const snippet = document.createElement("p");
        snippet.className = "card-snippet";
        snippet.textContent = p.content;

        const date = document.createElement("div");
        date.className = "card-date";
        date.textContent = "Updated " + formatDate(p.updated);

        article.appendChild(cat);
        article.appendChild(h3);
        article.appendChild(snippet);
        article.appendChild(date);

        article.addEventListener("click", () => openPage(p.id));

        content.appendChild(article);
    });
}

/* ===== OPEN PAGE (VIEW) ===== */
function openPage(id) {
    const p = pages.find(pg => pg.id === id);
    if (!p) return;

    currentPageId = id;

    pageTitleDisplay.textContent = p.title;
    pageMeta.textContent = `${p.category} · Created ${formatDate(p.created)} · Updated ${formatDate(p.updated)}`;
    pageContentDisplay.textContent = p.content;

    showOnly(pageView);
}

/* ===== OPEN EDITOR (NEW OR EDIT) ===== */
function openEditor(id) {
    if (id) {
        const p = pages.find(pg => pg.id === id);
        if (!p) return;

        currentPageId = id;
        editorHeading.textContent = "Edit Page";
        pageTitleInput.value = p.title;
        pageCategoryInput.value = p.category;
        pageContentInput.value = p.content;
    } else {
        currentPageId = null;
        editorHeading.textContent = "New Page";
        pageTitleInput.value = "";
        pageCategoryInput.value = activeCategory !== "All" ? activeCategory : "Ideas";
        pageContentInput.value = "";
    }

    showOnly(editor);
    pageTitleInput.focus();
}

/* ===== SAVE PAGE ===== */
async function savePage() {
    const title = pageTitleInput.value.trim();
    const category = pageCategoryInput.value;
    const text = pageContentInput.value;

    if (!title) {
        pageTitleInput.focus();
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        if (currentPageId) {
            const { error } = await sb
                .from("pages")
                .update({
                    title,
                    category,
                    content: text,
                    updated_at: new Date().toISOString()
                })
                .eq("id", currentPageId);

            if (error) throw error;
        } else {
            const { data, error } = await sb
                .from("pages")
                .insert({
                    user_id: currentUser.id,
                    title,
                    category,
                    content: text
                })
                .select()
                .single();

            if (error) throw error;
            currentPageId = data.id;
        }

        await fetchPages();
        openPage(currentPageId);
    } catch (err) {
        alert("Could not save: " + (err.message || "unknown error"));
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
    }
}

/* ===== DELETE PAGE ===== */
async function deletePage() {
    if (!currentPageId) return;

    const p = pages.find(pg => pg.id === currentPageId);
    if (!p) return;

    let confirmBar = document.getElementById("deleteConfirmBar");

    if (confirmBar) {
        confirmBar.remove();
        return;
    }

    confirmBar = document.createElement("div");
    confirmBar.id = "deleteConfirmBar";
    confirmBar.className = "delete-confirm";

    const text = document.createElement("span");
    text.textContent = `Delete "${p.title}"? This cannot be undone.`;

    const yesBtn = document.createElement("button");
    yesBtn.className = "btn btn-danger";
    yesBtn.textContent = "Yes, delete";
    yesBtn.addEventListener("click", async () => {
        yesBtn.disabled = true;
        yesBtn.textContent = "Deleting...";

        const { error } = await sb
            .from("pages")
            .delete()
            .eq("id", currentPageId);

        if (error) {
            alert("Could not delete: " + error.message);
            yesBtn.disabled = false;
            yesBtn.textContent = "Yes, delete";
            return;
        }

        await fetchPages();
        currentPageId = null;
        renderHome();
    });

    const noBtn = document.createElement("button");
    noBtn.className = "btn";
    noBtn.textContent = "Cancel";
    noBtn.addEventListener("click", () => confirmBar.remove());

    confirmBar.appendChild(text);
    confirmBar.appendChild(yesBtn);
    confirmBar.appendChild(noBtn);

    pageView.appendChild(confirmBar);
}

/* ===== EVENT LISTENERS ===== */
newPageBtn.addEventListener("click", () => openEditor(null));
editBtn.addEventListener("click", () => openEditor(currentPageId));
deleteBtn.addEventListener("click", deletePage);
closeBtn.addEventListener("click", () => {
    currentPageId = null;
    renderHome();
});
saveBtn.addEventListener("click", savePage);
cancelBtn.addEventListener("click", () => {
    if (currentPageId) {
        openPage(currentPageId);
    } else {
        renderHome();
    }
});

/* ===== INIT ===== */
setAuthMode("signin");
