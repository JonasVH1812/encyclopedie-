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
let sharedPages = [];
let currentPageId = null;
let activeCategory = "All";
let currentUser = null;
let authMode = "signin"; // "signin" | "signup"
let viewMode = "my"; // "my" | "community"

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
const pageSharedInput = document.getElementById("pageSharedInput");

const communityContent = document.getElementById("communityContent");

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
    [hero, content, communityContent, pageView, editor].forEach(el => el.classList.add("hidden"));
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
        const msg = err.message || "Something went wrong.";

        if (msg.toLowerCase().includes("email not confirmed")) {
            authError.textContent = "Your email isn't verified yet. Please check your inbox (and spam folder) for the confirmation link before signing in.";
        } else {
            authError.textContent = msg;
        }

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
        shared: row.shared,
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

        if (viewMode === "my" && cat === activeCategory) {
            a.classList.add("active");
        }

        a.addEventListener("click", (e) => {
            e.preventDefault();
            viewMode = "my";
            activeCategory = cat;
            currentPageId = null;
            renderNavbar();
            renderHome();
        });

        li.appendChild(a);
        navbar.appendChild(li);
    });

    // Community link
    const communityLi = document.createElement("li");
    const communityLink = document.createElement("a");
    communityLink.href = "#";
    communityLink.textContent = "Community";

    if (viewMode === "community") {
        communityLink.classList.add("active");
    }

    communityLink.addEventListener("click", async (e) => {
        e.preventDefault();
        viewMode = "community";
        currentPageId = null;
        renderNavbar();
        await renderCommunity();
    });

    communityLi.appendChild(communityLink);
    navbar.appendChild(communityLi);
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
        date.textContent = "Updated " + formatDate(p.updated)
            + (p.shared ? " · Shared with Community" : "");

        article.appendChild(cat);
        article.appendChild(h3);
        article.appendChild(snippet);
        article.appendChild(date);

        article.addEventListener("click", () => openPage(p.id, "my"));

        content.appendChild(article);
    });
}

/* ===== RENDER COMMUNITY ===== */
async function renderCommunity() {
    showOnly(communityContent);
    hero.classList.add("hidden");

    communityContent.innerHTML = "";

    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading shared pages...";
    communityContent.appendChild(loading);

    const { data, error } = await sb
        .from("pages")
        .select("*")
        .eq("shared", true)
        .order("updated_at", { ascending: false });

    communityContent.innerHTML = "";

    if (error) {
        const errDiv = document.createElement("div");
        errDiv.className = "empty-state";
        errDiv.textContent = "Could not load community pages.";
        communityContent.appendChild(errDiv);
        return;
    }

    sharedPages = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        content: row.content,
        author: row.author_name || "Anonymous",
        created: new Date(row.created_at).getTime(),
        updated: new Date(row.updated_at).getTime()
    }));

    if (sharedPages.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No shared pages yet. Be the first to share an idea!";
        communityContent.appendChild(empty);
        return;
    }

    sharedPages.forEach(p => {
        const article = document.createElement("article");

        const cat = document.createElement("span");
        cat.className = "card-category";
        cat.textContent = p.category;

        const h3 = document.createElement("h3");
        h3.textContent = p.title;

        const author = document.createElement("div");
        author.className = "card-author";
        author.textContent = "by " + p.author;

        const snippet = document.createElement("p");
        snippet.className = "card-snippet";
        snippet.textContent = p.content;

        const date = document.createElement("div");
        date.className = "card-date";
        date.textContent = "Updated " + formatDate(p.updated);

        article.appendChild(cat);
        article.appendChild(h3);
        article.appendChild(author);
        article.appendChild(snippet);
        article.appendChild(date);

        article.addEventListener("click", () => openPage(p.id, "community"));

        communityContent.appendChild(article);
    });
}

/* ===== OPEN PAGE (VIEW) ===== */
function openPage(id, source) {
    source = source || "my";

    let p, isOwner;

    if (source === "community") {
        p = sharedPages.find(pg => pg.id === id);
        isOwner = false;
    } else {
        p = pages.find(pg => pg.id === id);
        isOwner = true;
    }

    if (!p) return;

    currentPageId = id;
    pageView.dataset.source = source;

    pageTitleDisplay.textContent = p.title;

    let meta = `${p.category} · Created ${formatDate(p.created)} · Updated ${formatDate(p.updated)}`;
    if (source === "community") {
        meta = `By ${p.author} · ${meta}`;
    }
    pageMeta.textContent = meta;

    pageContentDisplay.textContent = p.content;

    if (isOwner) {
        editBtn.classList.remove("hidden");
        deleteBtn.classList.remove("hidden");
    } else {
        editBtn.classList.add("hidden");
        deleteBtn.classList.add("hidden");
    }

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
        pageSharedInput.checked = !!p.shared;
    } else {
        currentPageId = null;
        editorHeading.textContent = "New Page";
        pageTitleInput.value = "";
        pageCategoryInput.value = activeCategory !== "All" ? activeCategory : "Ideas";
        pageContentInput.value = "";
        pageSharedInput.checked = false;
    }

    showOnly(editor);
    pageTitleInput.focus();
}

/* ===== SAVE PAGE ===== */
async function savePage() {
    const title = pageTitleInput.value.trim();
    const category = pageCategoryInput.value;
    const text = pageContentInput.value;
    const shared = pageSharedInput.checked;

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
                    shared,
                    author_name: shared ? getDisplayName(currentUser) : null,
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
                    content: text,
                    shared,
                    author_name: shared ? getDisplayName(currentUser) : null
                })
                .select()
                .single();

            if (error) throw error;
            currentPageId = data.id;
        }

        await fetchPages();
        openPage(currentPageId, "my");
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
closeBtn.addEventListener("click", async () => {
    const source = pageView.dataset.source;
    currentPageId = null;

    if (source === "community") {
        await renderCommunity();
    } else {
        renderHome();
    }
});
saveBtn.addEventListener("click", savePage);
cancelBtn.addEventListener("click", () => {
    if (currentPageId) {
        openPage(currentPageId, "my");
    } else if (viewMode === "community") {
        renderCommunity();
    } else {
        renderHome();
    }
});

/* ===== INIT ===== */
setAuthMode("signin");
