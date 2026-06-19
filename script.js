document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--x", e.clientX + "px");
    document.body.style.setProperty("--y", e.clientY + "px");
});

const SUPABASE_URL = "https://yxtcyfxupfhlgfknhfke.supabase.co";
const SUPABASE_KEY = "sb_publishable_QNNFueMNFT6fnpEhXNdzDg__s-xQm5M";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.sb = sb;

let pages = [];
let currentPageId = null;
let activeCategory = "All";
let currentUser = null;
let currentProfile = null;
let authMode = "signin";
let viewMode = "my";
let communitySubview = "feed";

let posts = [];
let members = [];
let profileStatsMap = {};
let viewingProfileId = null;

let postSortOrder = "hot";
let userVotes = {};
let postVoteCounts = {};

const CATEGORIES = ["All", "Ideas", "Projects", "Plans", "Diary", "Other"];
const ROLE_OPTIONS = ["Member", "Admin", "Owner"];
const TAG_OPTIONS = [
    "Co-Owner", "VIP", "Contributor", "Moderator",
    "Prof zager", "nummer 1 mama", "chernobly tester",
    "Langste niet ai post owner", "grappige spast",
    "prof website breker", "#1 homegirl"
];
const BADGE_DESCRIPTIONS = {
    "Co-Owner": "Co-owner van de community",
    "VIP": "Very Important Person",
    "Contributor": "Active contributor",
    "Moderator": "Community moderator",
    "Prof zager": "Professional zager",
    "nummer 1 mama": "De aller beste mama",
    "chernobly tester": "website getest in de dagen dat hij elke dag kon exploderen en dat ook deed",
    "Langste niet ai post owner": "lansge bullshit post dat geen ai is",
    "grappige spast": "speciale badge voor lars de spast",
    "prof website breker": "krijg je als je de website 1 of meerdere keren breekt of meer dan 5 fouten vind",
    "#1 homegirl": "speciale badge voor de beste home girl"
};

const pageTitle      = document.getElementById("pageTitle");
const navbar         = document.getElementById("navbar");
const content        = document.getElementById("content");
const hero           = document.getElementById("hero");
const welcomeHeading = document.getElementById("welcomeHeading");
const appContent     = document.getElementById("appContent");
const authBox        = document.getElementById("authBox");
const authHeading    = document.getElementById("authHeading");
const authName       = document.getElementById("authName");
const authNameLabel  = document.getElementById("authNameLabel");
const authEmail      = document.getElementById("authEmail");
const authPassword   = document.getElementById("authPassword");
const authError      = document.getElementById("authError");
const authSubmitBtn  = document.getElementById("authSubmitBtn");
const authSwitchText = document.getElementById("authSwitchText");
const authSwitchLink = document.getElementById("authSwitchLink");
const pageView           = document.getElementById("pageView");
const pageTitleDisplay   = document.getElementById("pageTitleDisplay");
const pageMeta           = document.getElementById("pageMeta");
const pageContentDisplay = document.getElementById("pageContentDisplay");
const editor           = document.getElementById("editor");
const editorHeading    = document.getElementById("editorHeading");
const pageTitleInput   = document.getElementById("pageTitleInput");
const pageCategoryInput= document.getElementById("pageCategoryInput");
const pageContentInput = document.getElementById("pageContentInput");
const communityTab    = document.getElementById("communityTab");
const communityFeed   = document.getElementById("communityFeed");
const communityMembers= document.getElementById("communityMembers");
const communityAdmin  = document.getElementById("communityAdmin");
const profileView     = document.getElementById("profileView");
const postEditor      = document.getElementById("postEditor");
const postsList        = document.getElementById("postsList");
const membersList      = document.getElementById("membersList");
const adminMembersList = document.getElementById("adminMembersList");
const adminSubnavBtn   = document.getElementById("adminSubnavBtn");
const newPostBtn        = document.getElementById("newPostBtn");
const postTitleInput    = document.getElementById("postTitleInput");
const postCategoryInput = document.getElementById("postCategoryInput");
const postContentInput  = document.getElementById("postContentInput");
const savePostBtn       = document.getElementById("savePostBtn");
const cancelPostBtn     = document.getElementById("cancelPostBtn");
const profileBackBtn     = document.getElementById("profileBackBtn");
const profileAvatar      = document.getElementById("profileAvatar");
const profileDisplayName = document.getElementById("profileDisplayName");
const profileUsername    = document.getElementById("profileUsername");
const profileBadges      = document.getElementById("profileBadges");
const profileBio         = document.getElementById("profileBio");
const profileStats       = document.getElementById("profileStats");
const profileMeta        = document.getElementById("profileMeta");
const editProfileBtn     = document.getElementById("editProfileBtn");
const profileEditView    = document.getElementById("profileEditView");
const profileEditBackBtn = document.getElementById("profileEditBackBtn");
const editDisplayName    = document.getElementById("editDisplayName");
const editUsername       = document.getElementById("editUsername");
const editBio            = document.getElementById("editBio");
const profileEditError   = document.getElementById("profileEditError");
const saveProfileBtn     = document.getElementById("saveProfileBtn");
const newPageBtn = document.getElementById("newPageBtn");
const editBtn    = document.getElementById("editBtn");
const deleteBtn  = document.getElementById("deleteBtn");
const closeBtn   = document.getElementById("closeBtn");
const saveBtn    = document.getElementById("saveBtn");
const cancelBtn  = document.getElementById("cancelBtn");
const logoutBtn  = document.getElementById("logoutBtn");
const accountWrap        = document.getElementById("accountWrap");
const accountAvatar      = document.getElementById("accountAvatar");
const accountDropdownAvatar = document.getElementById("accountDropdownAvatar");
const accountDropdownName   = document.getElementById("accountDropdownName");
const accountDropdownRole   = document.getElementById("accountDropdownRole");
const settingsDisplayName   = document.getElementById("settingsDisplayName");
const settingsUsername      = document.getElementById("settingsUsername");
const settingsBio           = document.getElementById("settingsBio");
const settingsSaveBtn       = document.getElementById("settingsSaveBtn");
const settingsError         = document.getElementById("settingsError");
const dropdownLogoutBtn     = document.getElementById("dropdownLogoutBtn");
const dropdownNewPageBtn    = document.getElementById("dropdownNewPageBtn");
const dropdownProfileBtn    = document.getElementById("dropdownProfileBtn");
const dropdownSettingsBtn   = document.getElementById("dropdownSettingsBtn");
const dropdownSettingsBackBtn = document.getElementById("dropdownSettingsBackBtn");
const accountMainMenu       = document.getElementById("accountMainMenu");
const accountSettingsMenu   = document.getElementById("accountSettingsMenu");
const dropdownOverlay       = document.getElementById("dropdownOverlay");
const tooltipEl = document.getElementById("tooltip");
let tooltipTimeout = null;

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

function showToast(message, type, duration) {
    type = type || "info";
    duration = duration || 3000;
    var toast = document.createElement("div");
    toast.className = "toast " + type;
    var icons = { success: "✓", error: "✕", info: "ℹ" };
    toast.innerHTML =
        '<span class="toast-icon">' + (icons[type] || icons.info) + "</span>" +
        '<span class="toast-message">' + message + "</span>" +
        '<div class="toast-progress" style="animation-duration:' + duration + 'ms"></div>';
    toastContainer.appendChild(toast);
    setTimeout(function () {
        toast.style.animation = "toastSlideOut 0.3s ease forwards";
        setTimeout(function () { toast.remove(); }, 300);
    }, duration);
}

// ============================================================
// DELETE DIALOG
// ============================================================

function showDeleteDialog(title, message, onConfirm) {
    var overlay = document.createElement("div");
    overlay.className = "delete-dialog-overlay";
    overlay.innerHTML =
        '<div class="delete-dialog">' +
        '<div class="delete-dialog-icon">🗑️</div>' +
        "<h3>" + title + "</h3>" +
        "<p>" + message + "</p>" +
        '<div class="delete-dialog-actions">' +
        '<button class="btn" id="dlgCancelBtn">Cancel</button>' +
        '<button class="btn btn-danger" id="dlgConfirmBtn">Delete</button>' +
        "</div></div>";
    document.body.appendChild(overlay);
    var close = function () {
        overlay.style.animation = "fadeIn 0.2s ease reverse forwards";
        setTimeout(function () { overlay.remove(); }, 200);
    };
    overlay.querySelector("#dlgCancelBtn").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#dlgConfirmBtn").addEventListener("click", async function () {
        var btn = overlay.querySelector("#dlgConfirmBtn");
        btn.disabled = true;
        btn.textContent = "Deleting...";
        try {
            await onConfirm();
            close();
            showToast("Successfully deleted", "success");
        } catch (err) {
            btn.disabled = false;
            btn.textContent = "Delete";
            showToast(err.message || "Failed to delete", "error");
        }
    });
}

// ============================================================
// UTILITIES
// ============================================================

function formatDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
        " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function showOnly(section) {
    [hero, content, communityTab, pageView, editor].forEach(function (el) { el.classList.add("hidden"); });
    section.classList.remove("hidden");
}

function showCommunitySection(section) {
    [communityFeed, communityMembers, communityAdmin, profileView, profileEditView, postEditor].forEach(function (el) { el.classList.add("hidden"); });
    section.classList.remove("hidden");
}

function getDisplayName(user) {
    if (!user) return "";
    return (user.user_metadata && user.user_metadata.name) || (user.email && user.email.split("@")[0]) || "User";
}

function getInitial(name) { return (name || "?").trim().charAt(0).toUpperCase(); }

function badgeClass(role) {
    var key = (role || "Member").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return "badge badge-" + key;
}

function renderBadges(container, profile) {
    container.innerHTML = "";
    var role = profile.role || "Member";
    var roleBadge = document.createElement("span");
    roleBadge.className = badgeClass(role);
    roleBadge.textContent = role;
    roleBadge.dataset.tooltip = role;
    container.appendChild(roleBadge);
    var tags = Array.isArray(profile.extra_tags) ? profile.extra_tags : [];
    tags.forEach(function (tag) {
        var span = document.createElement("span");
        span.className = badgeClass(tag);
        span.textContent = tag;
        span.dataset.tooltip = BADGE_DESCRIPTIONS[tag] || tag;
        container.appendChild(span);
    });
}

function isAdminOrOwner(p) { return p && (p.role === "Owner" || p.role === "Admin"); }
function isOwnerUser(p) { return p && p.role === "Owner"; }
function canEditPost(post) {
    if (!currentUser) return false;
    if (post.user_id === currentUser.id) return true;
    var r = currentProfile && currentProfile.role;
    return r === "Admin" || r === "Owner";
}
function canEditComment(c) {
    if (!currentUser) return false;
    if (c.user_id === currentUser.id) return true;
    var r = currentProfile && currentProfile.role;
    return r === "Admin" || r === "Owner";
}

// ============================================================
// ACCOUNT UI
// ============================================================

function updateAccountUI() {
    if (!currentProfile) return;
    var initial = getInitial(currentProfile.display_name || currentProfile.username);
    [accountAvatar, accountDropdownAvatar].forEach(function (el) {
        if (!el) return;
        if (currentProfile.avatar_url) {
            el.style.backgroundImage = "url(" + currentProfile.avatar_url + ")";
            el.style.backgroundSize = "cover";
            el.style.backgroundPosition = "center";
            el.textContent = "";
        } else {
            el.style.backgroundImage = "none";
            el.style.background = "linear-gradient(135deg, #60a5fa, #fbbf24)";
            el.textContent = initial;
        }
    });
    if (accountDropdownName) accountDropdownName.textContent = currentProfile.display_name || currentProfile.username;
    if (accountDropdownRole) accountDropdownRole.textContent = currentProfile.role || "Member";
}

function showMainMenu() {
    if (accountSettingsMenu) accountSettingsMenu.classList.add("hidden");
    if (accountMainMenu) accountMainMenu.classList.remove("hidden");
}
function showSettingsMenu() {
    if (currentProfile) {
        if (settingsDisplayName) settingsDisplayName.value = currentProfile.display_name || "";
        if (settingsUsername) settingsUsername.value = currentProfile.username || "";
        if (settingsBio) settingsBio.value = currentProfile.bio || "";
    }
    if (accountMainMenu) accountMainMenu.classList.add("hidden");
    if (accountSettingsMenu) accountSettingsMenu.classList.remove("hidden");
    if (settingsError) settingsError.classList.add("hidden");
}
function openDropdown() {
    var d = document.getElementById("accountDropdown");
    if (d) d.classList.remove("hidden");
    if (dropdownOverlay) dropdownOverlay.classList.remove("hidden");
    var b = document.getElementById("accountBtn");
    if (b) b.setAttribute("aria-expanded", "true");
}
function closeDropdown() {
    var d = document.getElementById("accountDropdown");
    if (d) d.classList.add("hidden");
    if (dropdownOverlay) dropdownOverlay.classList.add("hidden");
    var b = document.getElementById("accountBtn");
    if (b) b.setAttribute("aria-expanded", "false");
    showMainMenu();
}
function toggleDropdown(e) {
    e.stopPropagation();
    var d = document.getElementById("accountDropdown");
    if (d && !d.classList.contains("hidden")) closeDropdown(); else openDropdown();
}
function closeDropdownOnOutsideClick(e) {
    var btn = document.getElementById("accountBtn");
    var d = document.getElementById("accountDropdown");
    if (!d || d.classList.contains("hidden")) return;
    if (!d.contains(e.target) && !btn.contains(e.target)) closeDropdown();
}

function setupAccountDropdown() {
    var btn = document.getElementById("accountBtn");
    if (!btn) return;
    btn.addEventListener("click", toggleDropdown);
    document.addEventListener("click", closeDropdownOnOutsideClick);
    if (dropdownSettingsBtn) dropdownSettingsBtn.addEventListener("click", showSettingsMenu);
    if (dropdownSettingsBackBtn) dropdownSettingsBackBtn.addEventListener("click", showMainMenu);
    if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener("click", function () { closeDropdown(); logoutBtn.click(); });
    if (dropdownNewPageBtn) dropdownNewPageBtn.addEventListener("click", function () { closeDropdown(); newPageBtn.click(); });
    if (dropdownProfileBtn) {
        dropdownProfileBtn.addEventListener("click", function () {
            closeDropdown();
            var link = document.querySelector('.navbar a[data-community]') ||
                Array.from(document.querySelectorAll(".navbar a")).find(function (a) { return a.textContent.trim() === "Community"; });
            if (link) link.click();
            setTimeout(function () { if (currentUser) openProfile(currentUser.id); }, 300);
        });
    }
    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener("click", async function () {
            var dn = settingsDisplayName.value.trim();
            var un = settingsUsername.value.trim();
            var bio = settingsBio.value.trim();
            if (!dn || !un) {
                if (settingsError) { settingsError.textContent = "Display name and username are required."; settingsError.classList.remove("hidden"); }
                return;
            }
            settingsSaveBtn.disabled = true;
            settingsSaveBtn.textContent = "Saving...";
            var res = await sb.from("profiles").update({ display_name: dn, username: un, bio: bio, updated_at: new Date().toISOString() }).eq("id", currentUser.id);
            settingsSaveBtn.disabled = false;
            settingsSaveBtn.textContent = "Save Changes";
            if (res.error) {
                if (settingsError) { settingsError.textContent = res.error.message; settingsError.classList.remove("hidden"); }
                return;
            }
            await fetchProfile();
            updateAccountUI();
            if (viewMode === "my") renderHome();
            var n = currentProfile.display_name || currentProfile.username;
            pageTitle.textContent = "Encyclopedie van " + n;
            welcomeHeading.textContent = "Welcome, " + n;
            if (settingsError) settingsError.classList.add("hidden");
            settingsSaveBtn.textContent = "✓ Saved!";
            setTimeout(function () { if (settingsSaveBtn) settingsSaveBtn.textContent = "Save Changes"; }, 1500);
        });
    }
}

// ============================================================
// AUTH
// ============================================================

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

authSwitchLink.addEventListener("click", function (e) { e.preventDefault(); setAuthMode(authMode === "signin" ? "signup" : "signin"); });

authSubmitBtn.addEventListener("click", async function () {
    var email = authEmail.value.trim();
    var password = authPassword.value;
    var name = authName.value.trim();
    authError.classList.add("hidden");
    if (!email || !password) { authError.textContent = "Please fill in email and password."; authError.classList.remove("hidden"); return; }
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Please wait...";
    try {
        if (authMode === "signup") {
            var res = await sb.auth.signUp({ email: email, password: password, options: { data: { name: name || email.split("@")[0] } } });
            if (res.error) throw res.error;
            if (res.data.user && !res.data.session) { authError.textContent = "Account created! Check your email."; authError.classList.remove("hidden"); setAuthMode("signin"); }
        } else {
            var res = await sb.auth.signInWithPassword({ email: email, password: password });
            if (res.error) throw res.error;
        }
    } catch (err) { authError.textContent = err.message || "Something went wrong."; authError.classList.remove("hidden"); }
    finally { authSubmitBtn.disabled = false; authSubmitBtn.textContent = authMode === "signup" ? "Create Account" : "Sign In"; }
});

logoutBtn.addEventListener("click", async function () { await sb.auth.signOut(); });

sb.auth.onAuthStateChange(function (event, session) {
    currentUser = session && session.user || null;
    if (currentUser) showApp(); else showAuth();
});

function showAuth() {
    authBox.classList.remove("hidden");
    appContent.classList.add("hidden");
    pageTitle.textContent = "Encyclopedie";
    navbar.innerHTML = "";
    if (accountWrap) accountWrap.classList.add("hidden");
}

async function showApp() {
    authBox.classList.add("hidden");
    appContent.classList.remove("hidden");
    var name = getDisplayName(currentUser);
    pageTitle.textContent = "Encyclopedie van " + name;
    welcomeHeading.textContent = "Welcome, " + name;
    await fetchProfile();
    updateAccountUI();
    if (accountWrap) accountWrap.classList.remove("hidden");
    setupAccountDropdown();
    await fetchPages();
    viewMode = "community";
    renderNavbar();
    await enterCommunity();
}

async function fetchProfile() {
    var res = await sb.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
    if (res.error) console.error("fetchProfile error:", res.error);
    var data = res.data;
    if (!data) {
        var ins = await sb.from("profiles").insert({ id: currentUser.id, username: currentUser.email.split("@")[0], display_name: getDisplayName(currentUser), role: "Member", extra_tags: [] }).select().single();
        if (ins.error) console.error("fetchProfile insert error:", ins.error);
        data = ins.data;
    }
    if (data && !Array.isArray(data.extra_tags)) data.extra_tags = [];
    currentProfile = data;
    window.currentProfile = currentProfile;
    return data;
}

async function fetchPages() {
    var res = await sb.from("pages").select("*").order("updated_at", { ascending: false });
    if (res.error) console.error(res.error);
    pages = (res.data || []).map(function (r) {
        return { id: r.id, title: r.title, category: r.category, content: r.content, created: new Date(r.created_at).getTime(), updated: new Date(r.updated_at).getTime() };
    });
}

// ============================================================
// NAVBAR
// ============================================================

function renderNavbar() {
    navbar.innerHTML = "";
    function addLink(text, isCommunity, cat) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#";
        a.textContent = text;
        if (isCommunity) a.setAttribute("data-community", "true");
        if (viewMode === "my" && cat === activeCategory) a.classList.add("active");
        if (viewMode === "community" && isCommunity) a.classList.add("active");
        a.addEventListener("click", async function (e) {
            e.preventDefault();
            if (isCommunity) { viewMode = "community"; currentPageId = null; renderNavbar(); await enterCommunity(); }
            else { viewMode = "my"; activeCategory = cat; currentPageId = null; renderNavbar(); renderHome(); }
        });
        li.appendChild(a);
        navbar.appendChild(li);
    }
    addLink("All", false, "All");
    addLink("Community", true);
    CATEGORIES.forEach(function (c) { if (c !== "All") addLink(c, false, c); });
}

// ============================================================
// HOME / PAGES
// ============================================================

function renderHome() {
    showOnly(content);
    hero.classList.remove("hidden");
    content.innerHTML = "";
    var filtered = activeCategory === "All" ? pages : pages.filter(function (p) { return p.category === activeCategory; });
    var sorted = filtered.slice().sort(function (a, b) { return b.updated - a.updated; });
    if (sorted.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = activeCategory === "All" ? "No pages yet. Click '+ New Page'." : 'No pages in "' + activeCategory + '" yet.';
        content.appendChild(empty);
        return;
    }
    sorted.forEach(function (p) {
        var article = document.createElement("article");
        var cat = document.createElement("span"); cat.className = "card-category"; cat.textContent = p.category;
        var h3 = document.createElement("h3"); h3.textContent = p.title;
        var snippet = document.createElement("p"); snippet.className = "card-snippet"; snippet.textContent = p.content;
        var date = document.createElement("div"); date.className = "card-date"; date.textContent = "Updated " + formatDate(p.updated);
        article.append(cat, h3, snippet, date);
        article.addEventListener("click", function () { openPage(p.id); });
        content.appendChild(article);
    });
}

function openPage(id) {
    currentPageId = id;
    var page = pages.find(function (p) { return p.id === id; });
    if (!page) return;
    showOnly(pageView);
    hero.classList.add("hidden");
    pageTitleDisplay.textContent = page.title;
    pageMeta.textContent = page.category + " · Created " + formatDate(page.created) + " · Updated " + formatDate(page.updated);
    pageContentDisplay.textContent = page.content;
}

editBtn.addEventListener("click", function () {
    var page = pages.find(function (p) { return p.id === currentPageId; });
    if (!page) return;
    showOnly(editor);
    hero.classList.add("hidden");
    editorHeading.textContent = "Edit Page";
    pageTitleInput.value = page.title;
    pageCategoryInput.value = page.category;
    pageContentInput.value = page.content;
    saveBtn.onclick = saveExistingPage;
});

deleteBtn.addEventListener("click", function () {
    var page = pages.find(function (p) { return p.id === currentPageId; });
    if (!page) return;
    showDeleteDialog("Delete Page", 'Are you sure you want to delete "' + page.title + '"? This cannot be undone.', async function () {
        await sb.from("pages").delete().eq("id", currentPageId);
        pages = pages.filter(function (p) { return p.id !== currentPageId; });
        currentPageId = null;
        renderHome();
    });
});

closeBtn.addEventListener("click", function () { currentPageId = null; renderHome(); });

newPageBtn.addEventListener("click", function () {
    showOnly(editor);
    hero.classList.add("hidden");
    editorHeading.textContent = "New Page";
    pageTitleInput.value = "";
    pageCategoryInput.value = "Ideas";
    pageContentInput.value = "";
    saveBtn.onclick = saveNewPage;
    pageTitleInput.focus();
});

cancelBtn.addEventListener("click", function () { currentPageId = null; renderHome(); });

async function saveNewPage() {
    var title = pageTitleInput.value.trim();
    if (!title) return;
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
        var res = await sb.from("pages").insert({ user_id: currentUser.id, title: title, category: pageCategoryInput.value, content: pageContentInput.value.trim() });
        if (res.error) throw res.error;
        await fetchPages();
        currentPageId = null;
        renderHome();
        showToast("Page created!", "success");
    } catch (err) { showToast("Could not save: " + (err.message || "unknown error"), "error"); }
    finally { saveBtn.disabled = false; saveBtn.textContent = "Save"; }
}

async function saveExistingPage() {
    var title = pageTitleInput.value.trim();
    if (!title) return;
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
        var res = await sb.from("pages").update({ title: title, category: pageCategoryInput.value, content: pageContentInput.value.trim(), updated_at: new Date().toISOString() }).eq("id", currentPageId);
        if (res.error) throw res.error;
        await fetchPages();
        openPage(currentPageId);
        showToast("Page updated!", "success");
    } catch (err) { showToast("Could not save: " + (err.message || "unknown error"), "error"); }
    finally { saveBtn.disabled = false; saveBtn.textContent = "Save"; }
}

// ============================================================
// COMMUNITY ENTRY
// ============================================================

async function enterCommunity() {
    showOnly(communityTab);
    hero.classList.add("hidden");
    if (isAdminOrOwner(currentProfile)) adminSubnavBtn.classList.remove("hidden");
    else { adminSubnavBtn.classList.add("hidden"); if (communitySubview === "admin") communitySubview = "feed"; }
    setCommunitySubview(communitySubview);
}

function setCommunitySubview(view) {
    communitySubview = view;
    document.querySelectorAll(".subnav-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.subview === view); });
    if (view === "feed") { showCommunitySection(communityFeed); renderFeed(); }
    else if (view === "members") { showCommunitySection(communityMembers); renderMembers(); }
    else if (view === "admin") { showCommunitySection(communityAdmin); renderAdminPanel(); }
}

document.querySelectorAll(".subnav-btn").forEach(function (b) { b.addEventListener("click", function () { setCommunitySubview(b.dataset.subview); }); });

// ============================================================
// IMAGE HELPERS
// ============================================================

async function compressImage(file, maxWidth, quality, type) {
    maxWidth = maxWidth || 1200; quality = quality || 0.8; type = type || "image/webp";
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement("canvas");
                var w = img.width, h = img.height;
                if (w > maxWidth) { h = (h / w) * maxWidth; w = maxWidth; }
                canvas.width = w; canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                canvas.toBlob(function (blob) { if (blob) resolve(blob); else reject(new Error("Compression failed")); }, type, quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function uploadImage(file, bucket, folder, fileName) {
    var path = folder + "/" + fileName;
    var res = await sb.storage.from(bucket).upload(path, file, { upsert: true });
    if (res.error) throw res.error;
    var urlRes = sb.storage.from(bucket).getPublicUrl(path);
    return urlRes.data.publicUrl;
}

// ============================================================
// AVATAR UPLOAD
// ============================================================

var avatarInput = document.getElementById("avatarInput");
var avatarPreviewImg = document.getElementById("avatarPreviewImg");
var avatarUploadStatus = document.getElementById("avatarUploadStatus");

avatarInput && avatarInput.addEventListener("change", async function (e) {
    var file = e.target.files[0]; if (!file) return;
    avatarUploadStatus.textContent = "Compressing...";
    try {
        var blob = await compressImage(file, 800, 0.85);
        var ext = file.name.split(".").pop() || "jpg";
        var url = await uploadImage(blob, "profile-pictures", currentUser.id, "avatar." + ext);
        avatarPreviewImg.src = url;
        avatarUploadStatus.textContent = "✓ Uploaded";
        var res = await sb.from("profiles").update({ avatar_url: url }).eq("id", currentUser.id);
        if (res.error) throw res.error;
        currentProfile.avatar_url = url;
        updateAccountUI();
        if (viewingProfileId === currentUser.id) await openProfile(currentUser.id);
    } catch (err) { avatarUploadStatus.textContent = "❌ " + err.message; console.error(err); }
});

// ============================================================
// POST IMAGE UPLOAD
// ============================================================

var postImageFiles = [];
var postImageInput = document.getElementById("postImageInput");
var postImageDropArea = document.getElementById("postImageDropArea");
var postImagePreviews = document.getElementById("postImagePreviews");
var postImageUploadStatus = document.getElementById("postImageUploadStatus");

postImageDropArea && postImageDropArea.addEventListener("click", function () { postImageInput.click(); });
postImageDropArea && postImageDropArea.addEventListener("dragover", function (e) { e.preventDefault(); postImageDropArea.classList.add("dragover"); });
postImageDropArea && postImageDropArea.addEventListener("dragleave", function () { postImageDropArea.classList.remove("dragover"); });
postImageDropArea && postImageDropArea.addEventListener("drop", async function (e) { e.preventDefault(); postImageDropArea.classList.remove("dragover"); if (e.dataTransfer.files.length) await handlePostImageFiles(e.dataTransfer.files); });
postImageInput && postImageInput.addEventListener("change", async function (e) { if (e.target.files.length) await handlePostImageFiles(e.target.files); });

async function handlePostImageFiles(fileList) {
    postImageUploadStatus.textContent = "Compressing...";
    var files = Array.from(fileList), total = files.length, uploaded = 0;
    for (var i = 0; i < files.length; i++) {
        try {
            var blob = await compressImage(files[i], 1200, 0.8);
            var ext = files[i].name.split(".").pop() || "jpg";
            var url = await uploadImage(blob, "community-posts", currentUser.id, Date.now() + "-" + Math.random().toString(36).substr(7) + "." + ext);
            postImageFiles.push(url);
            addPostImagePreview(url);
            uploaded++;
            postImageUploadStatus.textContent = "Uploaded " + uploaded + "/" + total;
        } catch (err) { console.error(err); postImageUploadStatus.textContent = "❌ " + err.message; }
    }
    if (uploaded === total) postImageUploadStatus.textContent = "✓ All images uploaded";
}

function addPostImagePreview(url) {
    var c = document.createElement("div"); c.className = "image-preview-item";
    var img = document.createElement("img"); img.src = url;
    var btn = document.createElement("button"); btn.className = "remove-image"; btn.textContent = "×";
    btn.addEventListener("click", function (e) { e.stopPropagation(); var idx = postImageFiles.indexOf(url); if (idx > -1) { postImageFiles.splice(idx, 1); c.remove(); } });
    c.append(img, btn);
    postImagePreviews.appendChild(c);
}

function loadPostImages(urls) {
    postImagePreviews.innerHTML = "";
    postImageFiles = urls ? urls.slice() : [];
    postImageFiles.forEach(addPostImagePreview);
}

// ============================================================
// VOTING SYSTEM
// ============================================================

async function fetchUserVotes(postIds) {
    if (!currentUser || !postIds.length) return;
    var res = await sb.from("post_votes").select("post_id, vote_type").eq("user_id", currentUser.id).in("post_id", postIds);
    if (res.error) { console.error("fetchUserVotes:", res.error); return; }
    userVotes = {};
    (res.data || []).forEach(function (v) { userVotes[v.post_id] = v.vote_type; });
}

async function fetchVoteCounts(postIds) {
    if (!postIds.length) return;
    var res = await sb.from("post_votes").select("post_id, vote_type");
    if (res.error) { console.error("fetchVoteCounts:", res.error); return; }
    postVoteCounts = {};
    postIds.forEach(function (id) { postVoteCounts[id] = { upvotes: 0, downvotes: 0, net: 0 }; });
    (res.data || []).forEach(function (v) {
        if (postVoteCounts[v.post_id]) {
            if (v.vote_type === 1) { postVoteCounts[v.post_id].upvotes++; postVoteCounts[v.post_id].net++; }
            else { postVoteCounts[v.post_id].downvotes++; postVoteCounts[v.post_id].net--; }
        }
    });
}

async function handleVote(postId, voteType) {
    if (!currentUser) return;
    var currentVote = userVotes[postId];
    var newVoteType = voteType;
    if (currentVote === voteType) newVoteType = 0;
    try {
        if (currentVote) {
            var res = await sb.from("post_votes").delete().eq("post_id", postId).eq("user_id", currentUser.id);
            if (res.error) throw res.error;
            if (postVoteCounts[postId]) {
                if (currentVote === 1) postVoteCounts[postId].upvotes--; else postVoteCounts[postId].downvotes--;
                postVoteCounts[postId].net = postVoteCounts[postId].upvotes - postVoteCounts[postId].downvotes;
            }
            delete userVotes[postId];
        }
        if (newVoteType !== 0) {
            var res = await sb.from("post_votes").insert({ post_id: postId, user_id: currentUser.id, vote_type: newVoteType });
            if (res.error) throw res.error;
            if (!postVoteCounts[postId]) postVoteCounts[postId] = { upvotes: 0, downvotes: 0, net: 0 };
            if (newVoteType === 1) postVoteCounts[postId].upvotes++; else postVoteCounts[postId].downvotes++;
            postVoteCounts[postId].net = postVoteCounts[postId].upvotes - postVoteCounts[postId].downvotes;
            userVotes[postId] = newVoteType;
        }
        updateVoteUI(postId);
    } catch (err) { console.error("Vote error:", err); showToast("Failed to vote", "error"); }
}

function updateVoteUI(postId) {
    var card = document.querySelector('[data-post-id="' + postId + '"]');
    if (!card) return;
    var ub = card.querySelector(".vote-btn.upvote");
    var db = card.querySelector(".vote-btn.downvote");
    var vc = card.querySelector(".vote-count");
    if (ub) ub.classList.toggle("active", userVotes[postId] === 1);
    if (db) db.classList.toggle("active", userVotes[postId] === -1);
    if (vc && postVoteCounts[postId]) {
        var n = postVoteCounts[postId].net;
        vc.textContent = n > 0 ? "+" + n : String(n);
        vc.className = "vote-count " + (n > 0 ? "positive" : n < 0 ? "negative" : "zero");
        vc.classList.add("bump");
        setTimeout(function () { vc.classList.remove("bump"); }, 150);
    }
}

// ============================================================
// SORTING
// ============================================================

function calculateHotScore(post) {
    var ageHours = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
    var v = postVoteCounts[post.id] ? postVoteCounts[post.id].net : 0;
    var sign = v > 0 ? 1 : v < 0 ? -1 : 0;
    return sign * Math.log10(Math.max(Math.abs(v), 1)) + ageHours * 3600 / 45000;
}

function sortAndRenderPosts() {
    var list = document.getElementById("postsList");
    if (!list) return;
    var sorted = posts.slice();
    if (postSortOrder === "hot") sorted.sort(function (a, b) { return calculateHotScore(b) - calculateHotScore(a); });
    else if (postSortOrder === "newest") sorted.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    else if (postSortOrder === "top") sorted.sort(function (a, b) { return ((postVoteCounts[b.id] || {}).net || 0) - ((postVoteCounts[a.id] || {}).net || 0); });
    var pinned = sorted.filter(function (p) { return p.pinned; });
    var unpinned = sorted.filter(function (p) { return !p.pinned; });
    list.innerHTML = "";
    pinned.concat(unpinned).forEach(function (p) { buildPostCard(p, list); });
}

function updateFeedToolbar() {
    var tb = document.getElementById("feedToolbar");
    if (!tb) return;
    tb.innerHTML =
        '<h2 class="feed-title">Community Feed</h2>' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
        '<div class="sort-container"><span class="sort-label">Sort by:</span>' +
        '<select class="sort-dropdown" id="postSortDropdown">' +
        '<option value="hot"' + (postSortOrder === "hot" ? " selected" : "") + ">🔥 Hot</option>" +
        '<option value="newest"' + (postSortOrder === "newest" ? " selected" : "") + ">🕐 Newest</option>" +
        '<option value="top"' + (postSortOrder === "top" ? " selected" : "") + ">📊 Top</option>" +
        "</select></div>" +
        '<button class="btn btn-primary" id="newPostBtn">+ New Post</button></div>';
    document.getElementById("newPostBtn") && document.getElementById("newPostBtn").addEventListener("click", openNewPostEditor);
    document.getElementById("postSortDropdown") && document.getElementById("postSortDropdown").addEventListener("change", function (e) { postSortOrder = e.target.value; sortAndRenderPosts(); });
}

// ============================================================
// RENDER FEED
// ============================================================

async function renderFeed() {
    postsList.innerHTML = "";
    for (var i = 0; i < 3; i++) {
        var sk = document.createElement("div"); sk.className = "skeleton-card";
        sk.innerHTML = '<div class="skeleton-votes"></div><div class="skeleton-content"><div class="skeleton-line short"></div><div class="skeleton-line title"></div><div class="skeleton-line long"></div><div class="skeleton-line medium"></div></div>';
        postsList.appendChild(sk);
    }
    updateFeedToolbar();
    var res = await sb.from("community_posts").select("*, profiles!fk_community_posts_user_id(display_name, username, role, extra_tags, avatar_url)").order("pinned", { ascending: false }).order("created_at", { ascending: false });
    postsList.innerHTML = "";
    if (res.error) { console.error(res.error); postsList.innerHTML = '<div class="empty-state">Could not load posts.</div>'; return; }
    posts = res.data || [];
    if (posts.length === 0) { postsList.innerHTML = '<div class="empty-state">No posts yet. Be the first!</div>'; return; }
    var ids = posts.map(function (p) { return p.id; });
    await Promise.all([fetchUserVotes(ids), fetchVoteCounts(ids)]);
    postsList.innerHTML = "";
    sortAndRenderPosts();
}

// ============================================================
// BUILD POST CARD
// ============================================================

function buildPostCard(post, container) {
    var card = document.createElement("div");
    card.className = "post-card" + (post.pinned ? " pinned" : "");
    card.dataset.postId = post.id;
    var votes = postVoteCounts[post.id] || { upvotes: 0, downvotes: 0, net: 0 };
    var uv = userVotes[post.id] || 0;
    var net = votes.net;

    var votesSection = document.createElement("div");
    votesSection.className = "post-card-votes";
    var vc = document.createElement("div");
    vc.className = "vote-container";
    var ub = document.createElement("button");
    ub.className = "vote-btn upvote" + (uv === 1 ? " active" : "");
    ub.innerHTML = "↑"; ub.title = "Upvote";
    ub.addEventListener("click", function () { handleVote(post.id, 1); });
    var vn = document.createElement("div");
    vn.className = "vote-count " + (net > 0 ? "positive" : net < 0 ? "negative" : "zero");
    vn.textContent = net > 0 ? "+" + net : String(net);
    var db = document.createElement("button");
    db.className = "vote-btn downvote" + (uv === -1 ? " active" : "");
    db.innerHTML = "↓"; db.title = "Downvote";
    db.addEventListener("click", function () { handleVote(post.id, -1); });
    vc.append(ub, vn, db);
    votesSection.appendChild(vc);

    var cw = document.createElement("div");
    cw.className = "post-card-content-wrapper";

    var meta = document.createElement("div");
    meta.className = "post-card-meta";
    var ai = document.createElement("div");
    ai.className = "post-card-author-info";
    var ma = document.createElement("div");
    ma.className = "post-card-mini-avatar";
    if (post.profiles && post.profiles.avatar_url) { ma.style.backgroundImage = "url(" + post.profiles.avatar_url + ")"; ma.textContent = ""; }
    else ma.textContent = getInitial(post.profiles ? post.profiles.display_name || post.profiles.username : null);
    var al = document.createElement("a");
    al.className = "post-card-author-name"; al.href = "#";
    al.textContent = post.profiles ? post.profiles.display_name || "Unknown" : "Unknown";
    al.addEventListener("click", function (e) { e.preventDefault(); openProfile(post.user_id); });
    ai.append(ma, al);
    meta.appendChild(ai);
    if (post.profiles) { var bw = document.createElement("span"); bw.className = "member-badges"; renderBadges(bw, post.profiles); meta.appendChild(bw); }
    var cs = document.createElement("span");
    cs.className = "post-card-category"; cs.textContent = post.category;
    meta.appendChild(cs);

    var h3 = document.createElement("h3"); h3.textContent = post.title;
    var cp = document.createElement("p"); cp.className = "post-card-text"; cp.textContent = post.content;

    var imgs = document.createElement("div"); imgs.className = "post-card-images";
    if (post.images && post.images.length) post.images.forEach(function (url) {
        var img = document.createElement("img"); img.src = url; img.alt = "Post image"; img.loading = "lazy"; imgs.appendChild(img);
    });

    var footer = document.createElement("div"); footer.className = "post-card-footer";
    var ts = document.createElement("span"); ts.className = "post-card-timestamp"; ts.textContent = formatDate(new Date(post.created_at).getTime());
    var actions = document.createElement("div"); actions.className = "post-card-actions";
    if (post.pinned) { var pb = document.createElement("span"); pb.className = "pin-badge"; pb.textContent = "📌 Pinned"; actions.appendChild(pb); }
    if (canEditPost(post)) {
        var eb = document.createElement("button"); eb.className = "btn btn-sm"; eb.textContent = "✎ Edit";
        eb.addEventListener("click", function () { openPostEditorForEdit(post); });
        actions.appendChild(eb);
    }
    if (isAdminOrOwner(currentProfile)) {
        var pinb = document.createElement("button"); pinb.className = "btn btn-sm btn-pin"; pinb.textContent = post.pinned ? "Unpin" : "📌 Pin";
        pinb.addEventListener("click", async function () { pinb.disabled = true; await togglePin(post.id, !post.pinned); });
        actions.appendChild(pinb);
    }
    if (post.user_id === currentUser.id || isAdminOrOwner(currentProfile)) {
        var delb = document.createElement("button"); delb.className = "btn btn-danger btn-sm"; delb.textContent = "Delete";
        delb.addEventListener("click", function () {
            showDeleteDialog("Delete Post", 'Delete "' + post.title + '"? This cannot be undone.', async function () { await deletePost(post.id); });
        });
        actions.appendChild(delb);
    }
    footer.append(ts, actions);
    cw.append(meta, h3, cp, imgs, footer);

    // Comments
    var csec = document.createElement("div"); csec.className = "comments-section"; csec.style.margin = "0 24px 20px 24px";
    var tgl = document.createElement("button"); tgl.className = "comments-toggle-btn"; tgl.textContent = "💬 Show comments";
    var cLoaded = false, cOpen = false;
    var clist = document.createElement("div"); clist.className = "comments-list hidden";
    var composer = document.createElement("div"); composer.className = "comment-composer hidden";
    var cta = document.createElement("textarea"); cta.className = "comment-textarea"; cta.placeholder = "Write a comment..."; cta.rows = 2;
    var csub = document.createElement("button"); csub.className = "btn btn-primary btn-sm"; csub.textContent = "Post comment";
    csub.addEventListener("click", async function () {
        var txt = cta.value.trim(); if (!txt) return;
        csub.disabled = true; csub.textContent = "Posting...";
        var res = await sb.from("post_comments").insert({ post_id: post.id, user_id: currentUser.id, content: txt });
        csub.disabled = false; csub.textContent = "Post comment";
        if (res.error) { showToast("Could not post comment: " + res.error.message, "error"); return; }
        cta.value = "";
        await loadComments(post.id, clist);
        showToast("Comment posted!", "success");
    });
    composer.append(cta, csub);
    tgl.addEventListener("click", async function () {
        cOpen = !cOpen;
        if (cOpen) { clist.classList.remove("hidden"); composer.classList.remove("hidden"); if (!cLoaded) { await loadComments(post.id, clist); cLoaded = true; } tgl.textContent = "💬 Hide comments"; }
        else { clist.classList.add("hidden"); composer.classList.add("hidden"); tgl.textContent = "💬 Show comments"; }
    });
    csec.append(tgl, clist, composer);
    cw.appendChild(csec);
    card.append(votesSection, cw);
    container.appendChild(card);
}

// ============================================================
// LOAD COMMENTS
// ============================================================

async function loadComments(postId, listEl) {
    listEl.innerHTML = '<div class="comment-loading">Loading...</div>';
    var res = await sb.from("post_comments").select("*, profiles!post_comments_user_id_fkey(display_name, username, role, extra_tags, avatar_url)").eq("post_id", postId).order("created_at", { ascending: true });
    listEl.innerHTML = "";
    if (res.error) { listEl.innerHTML = '<div class="comment-loading">Could not load comments.</div>'; console.error(res.error); return; }
    if (!res.data || res.data.length === 0) { listEl.innerHTML = '<div class="comment-loading">No comments yet. Be the first!</div>'; return; }
    res.data.forEach(function (comment) {
        var el = document.createElement("div"); el.className = "comment";
        var ch = document.createElement("div"); ch.className = "comment-header";
        var ca = document.createElement("div"); ca.className = "comment-avatar";
        if (comment.profiles && comment.profiles.avatar_url) { ca.style.backgroundImage = "url(" + comment.profiles.avatar_url + ")"; ca.textContent = ""; }
        else ca.textContent = getInitial(comment.profiles ? comment.profiles.display_name || comment.profiles.username : null);
        var cal = document.createElement("a"); cal.className = "post-author-link"; cal.href = "#";
        cal.textContent = comment.profiles ? comment.profiles.display_name || "Unknown" : "Unknown";
        cal.addEventListener("click", function (e) { e.preventDefault(); openProfile(comment.user_id); });
        var badges = document.createElement("span"); badges.className = "member-badges";
        if (comment.profiles) renderBadges(badges, comment.profiles);
        var ds = document.createElement("span"); ds.className = "comment-date";
        ds.textContent = formatDate(new Date(comment.created_at).getTime());
        if (comment.updated_at && new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime()) {
            var ed = document.createElement("span"); ed.className = "comment-edited-label"; ed.textContent = "(edited)"; ds.appendChild(ed);
        }
        ch.append(ca, cal, badges, ds);
        var body = document.createElement("div"); body.className = "comment-body"; body.textContent = comment.content;
        el.append(ch, body);
        var acts = document.createElement("div"); acts.className = "post-card-actions"; acts.style.marginTop = "8px";
        if (canEditComment(comment)) {
            var ebtn = document.createElement("button"); ebtn.className = "btn btn-sm"; ebtn.textContent = "✎ Edit";
            ebtn.addEventListener("click", function () {
                var ef = document.createElement("div"); ef.className = "comment-edit-form";
                var eta = document.createElement("textarea"); eta.value = comment.content; eta.rows = 3;
                var esave = document.createElement("button"); esave.className = "btn btn-primary btn-sm"; esave.textContent = "Save";
                var ecan = document.createElement("button"); ecan.className = "btn btn-sm"; ecan.textContent = "Cancel";
                var erow = document.createElement("div"); erow.className = "editor-actions"; erow.append(esave, ecan);
                ef.append(eta, erow);
                el.replaceChild(ef, body);
                eta.focus();
                esave.addEventListener("click", async function () {
                    var nc = eta.value.trim(); if (!nc) return;
                    esave.disabled = true; esave.textContent = "Saving...";
                    var r = await sb.from("post_comments").update({ content: nc, updated_at: new Date().toISOString() }).eq("id", comment.id);
                    esave.disabled = false; esave.textContent = "Save";
                    if (r.error) { showToast("Could not update: " + r.error.message, "error"); return; }
                    await loadComments(postId, listEl);
                });
                ecan.addEventListener("click", function () { loadComments(postId, listEl); });
            });
            acts.appendChild(ebtn);
        }
        if (comment.user_id === currentUser.id || isAdminOrOwner(currentProfile)) {
            var dbtn = document.createElement("button"); dbtn.className = "btn btn-danger btn-sm comment-delete-btn"; dbtn.textContent = "✕"; dbtn.title = "Delete";
            dbtn.addEventListener("click", function () {
                showDeleteDialog("Delete Comment", "Are you sure you want to delete this comment?", async function () {
                    var r = await sb.from("post_comments").delete().eq("id", comment.id);
                    if (r.error) throw r.error;
                    await loadComments(postId, listEl);
                });
            });
            acts.appendChild(dbtn);
        }
        if (acts.children.length) el.appendChild(acts);
        listEl.appendChild(el);
    });
}

// ============================================================
// TOGGLE PIN / DELETE POST (FIXED)
// ============================================================

async function togglePin(postId, pinned) {
    var res = await sb.from("community_posts").update({ pinned: pinned }).eq("id", postId);
    if (res.error) { showToast("Could not update pin: " + res.error.message, "error"); return; }
    var p = posts.find(function (x) { return x.id === postId; });
    if (p) p.pinned = pinned;
    sortAndRenderPosts();
    showToast(pinned ? "Post pinned!" : "Post unpinned", "success");
}

async function deletePost(postId) {
    var res = await sb.from("community_posts").delete().eq("id", postId);
    if (res.error) { console.error("deletePost:", res.error); throw new Error(res.error.message); }
    posts = posts.filter(function (p) { return p.id !== postId; });
    delete postVoteCounts[postId];
    delete userVotes[postId];
    var feedVisible = !communityFeed.classList.contains("hidden");
    if (feedVisible) sortAndRenderPosts();
}

// ============================================================
// NEW POST / EDIT POST
// ============================================================

function openNewPostEditor() {
    postTitleInput.value = "";
    postCategoryInput.value = "Discussion";
    postContentInput.value = "";
    postImageFiles = [];
    postImagePreviews.innerHTML = "";
    postImageUploadStatus.textContent = "";
    postEditor.dataset.editPostId = "";
    savePostBtn.textContent = "Post";
    savePostBtn.onclick = createNewPost;
    document.querySelector("#postEditor h2").textContent = "New Post";
    showCommunitySection(postEditor);
    postTitleInput.focus();
}

newPostBtn && newPostBtn.addEventListener("click", openNewPostEditor);

cancelPostBtn && cancelPostBtn.addEventListener("click", function () {
    postEditor.dataset.editPostId = "";
    savePostBtn.textContent = "Post";
    savePostBtn.onclick = createNewPost;
    showCommunitySection(communityFeed);
});

async function createNewPost() {
    var title = postTitleInput.value.trim();
    if (!title) return;
    savePostBtn.disabled = true;
    savePostBtn.textContent = "Posting...";
    try {
        var res = await sb.from("community_posts").insert({
            user_id: currentUser.id, title: title,
            category: postCategoryInput.value, content: postContentInput.value.trim(),
            images: postImageFiles.length ? postImageFiles : null
        });
        if (res.error) throw res.error;
        showCommunitySection(communityFeed);
        await renderFeed();
        showToast("Post created!", "success");
    } catch (err) { showToast("Could not post: " + (err.message || "unknown"), "error"); }
    finally { savePostBtn.disabled = false; savePostBtn.textContent = "Post"; }
}

async function openPostEditorForEdit(post) {
    showCommunitySection(postEditor);
    document.querySelector("#postEditor h2").textContent = "Edit Post";
    postTitleInput.value = post.title;
    postCategoryInput.value = post.category;
    postContentInput.value = post.content;
    loadPostImages(post.images || []);
    postEditor.dataset.editPostId = post.id;
    savePostBtn.textContent = "Update Post";
    savePostBtn.onclick = async function () { await updatePost(post.id); };
}

async function updatePost(postId) {
    var title = postTitleInput.value.trim();
    if (!title) return;
    savePostBtn.disabled = true;
    savePostBtn.textContent = "Updating...";
    try {
        var res = await sb.from("community_posts").update({
            title: title, category: postCategoryInput.value,
            content: postContentInput.value.trim(),
            images: postImageFiles.length ? postImageFiles : null,
            updated_at: new Date().toISOString()
        }).eq("id", postId);
        if (res.error) throw res.error;
        showCommunitySection(communityFeed);
        await renderFeed();
        showToast("Post updated!", "success");
    } catch (err) { showToast("Could not update: " + (err.message || "unknown"), "error"); }
    finally { savePostBtn.disabled = false; savePostBtn.textContent = "Update Post"; }
}

// ============================================================
// MEMBERS
// ============================================================

async function renderMembers() {
    membersList.innerHTML = '<div class="empty-state">Loading...</div>';
    var res = await sb.from("profiles").select("*").order("role");
    membersList.innerHTML = "";
    if (res.error) { membersList.innerHTML = '<div class="empty-state">Could not load members.</div>'; return; }
    members = res.data || [];
    if (members.length === 0) { membersList.innerHTML = '<div class="empty-state">No members found.</div>'; return; }
    members.forEach(function (m) {
        var card = document.createElement("div"); card.className = "member-card";
        var header = document.createElement("div"); header.className = "member-card-header";
        var avatar = document.createElement("div"); avatar.className = "member-avatar";
        if (m.avatar_url) { avatar.style.backgroundImage = "url(" + m.avatar_url + ")"; avatar.textContent = ""; }
        else avatar.textContent = getInitial(m.display_name || m.username);
        var info = document.createElement("div");
        var name = document.createElement("div"); name.className = "member-card-name"; name.textContent = m.display_name || m.username;
        var uname = document.createElement("div"); uname.className = "member-card-username"; uname.textContent = "@" + m.username;
        info.append(name, uname);
        header.append(avatar, info);
        card.appendChild(header);
        if (m.bio) { var bio = document.createElement("div"); bio.className = "member-card-bio"; bio.textContent = m.bio; card.appendChild(bio); }
        card.addEventListener("click", function () { openProfile(m.id); });
        membersList.appendChild(card);
    });
}

// ============================================================
// PROFILE VIEW / EDIT
// ============================================================

async function openProfile(userId) {
    viewingProfileId = userId;
    showCommunitySection(profileView);
    var res = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (res.error || !res.data) { profileDisplayName.textContent = "Unknown User"; return; }
    var p = res.data;
    if (profileAvatar) {
        if (p.avatar_url) { profileAvatar.style.backgroundImage = "url(" + p.avatar_url + ")"; profileAvatar.textContent = ""; }
        else { profileAvatar.style.backgroundImage = "none"; profileAvatar.style.background = "linear-gradient(135deg,#60a5fa,#fbbf24)"; profileAvatar.textContent = getInitial(p.display_name || p.username); }
    }
    profileDisplayName.textContent = p.display_name || p.username;
    profileUsername.textContent = "@" + p.username;
    profileBadges.innerHTML = "";
    renderBadges(profileBadges, p);
    profileBio.textContent = p.bio || "No bio yet.";
    profileBio.style.display = p.bio ? "" : "none";

    // Stats
    var statsRes = await sb.from("profile_stats").select("*").eq("id", userId).maybeSingle();
    var postCount = statsRes.data ? statsRes.data.post_count : 0;
    profileStats.innerHTML =
        '<div class="profile-stat"><div class="profile-stat-value">' + postCount + "</div><div class='profile-stat-label'>Posts</div></div>" +
        '<div class="profile-stat"><div class="profile-stat-value">' + (Array.isArray(p.extra_tags) ? p.extra_tags.length : 0) + "</div><div class='profile-stat-label'>Badges</div></div>";

    profileMeta.textContent = "Joined " + formatDate(new Date(p.joined_at).getTime());
    if (editProfileBtn) {
        if (userId === currentUser.id) { editProfileBtn.classList.remove("hidden"); }
        else editProfileBtn.classList.add("hidden");
    }
}

profileBackBtn && profileBackBtn.addEventListener("click", function () {
    viewingProfileId = null;
    showCommunitySection(communityFeed);
});

editProfileBtn && editProfileBtn.addEventListener("click", function () {
    if (!viewingProfileId) return;
    var p = members.find(function (m) { return m.id === viewingProfileId; }) || currentProfile;
    if (!p) return;
    showCommunitySection(profileEditView);
    editDisplayName.value = p.display_name || "";
    editUsername.value = p.username || "";
    editBio.value = p.bio || "";
    if (avatarPreviewImg && p.avatar_url) avatarPreviewImg.src = p.avatar_url;
    profileEditError.classList.add("hidden");
});

profileEditBackBtn && profileEditBackBtn.addEventListener("click", function () {
    if (viewingProfileId) openProfile(viewingProfileId);
    else showCommunitySection(communityFeed);
});

saveProfileBtn && saveProfileBtn.addEventListener("click", async function () {
    var dn = editDisplayName.value.trim();
    var un = editUsername.value.trim();
    var bio = editBio.value.trim();
    if (!dn || !un) { profileEditError.textContent = "Display name and username are required."; profileEditError.classList.remove("hidden"); return; }
    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";
    var res = await sb.from("profiles").update({ display_name: dn, username: un, bio: bio, updated_at: new Date().toISOString() }).eq("id", viewingProfileId);
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = "Save";
    if (res.error) { profileEditError.textContent = res.error.message; profileEditError.classList.remove("hidden"); return; }
    if (viewingProfileId === currentUser.id) { await fetchProfile(); updateAccountUI(); }
    await openProfile(viewingProfileId);
    showToast("Profile updated!", "success");
});

// ============================================================
// ADMIN PANEL
// ============================================================

async function renderAdminPanel() {
    adminMembersList.innerHTML = '<div class="empty-state">Loading...</div>';
    var res = await sb.from("profiles").select("*").order("role");
    adminMembersList.innerHTML = "";
    if (res.error) { adminMembersList.innerHTML = '<div class="empty-state">Could not load.</div>'; return; }
    var allMembers = res.data || [];
    allMembers.forEach(function (m) {
        var card = document.createElement("div"); card.className = "admin-member-card";
        var header = document.createElement("div"); header.className = "admin-member-header";
        var identity = document.createElement("div"); identity.className = "admin-member-identity";
        var avatar = document.createElement("div"); avatar.className = "member-avatar";
        if (m.avatar_url) { avatar.style.backgroundImage = "url(" + m.avatar_url + ")"; avatar.textContent = ""; }
        else avatar.textContent = getInitial(m.display_name || m.username);
        var info = document.createElement("div");
        var name = document.createElement("div"); name.className = "member-card-name"; name.textContent = m.display_name || m.username;
        var uname = document.createElement("div"); uname.className = "member-card-username"; uname.textContent = "@" + m.username;
        var badges = document.createElement("span"); badges.className = "member-badges"; renderBadges(badges, m);
        info.append(name, uname, badges);
        identity.append(avatar, info);
        header.appendChild(identity);

        if (m.id !== currentUser.id) {
            var controls = document.createElement("div"); controls.className = "admin-role-controls";
            var select = document.createElement("select");
            ROLE_OPTIONS.forEach(function (r) {
                var opt = document.createElement("option"); opt.value = r; opt.textContent = r;
                if (m.role === r) opt.selected = true;
                select.appendChild(opt);
            });
            var tagInput = document.createElement("input"); tagInput.className = "admin-tag-input"; tagInput.placeholder = "Add tag...";
            var tagBtn = document.createElement("button"); tagBtn.className = "btn btn-sm"; tagBtn.textContent = "+";
            tagBtn.addEventListener("click", async function () {
                var tag = tagInput.value.trim(); if (!tag) return;
                var tags = Array.isArray(m.extra_tags) ? m.extra_tags.slice() : [];
                if (tags.indexOf(tag) === -1) { tags.push(tag); var r = await sb.from("profiles").update({ extra_tags: tags }).eq("id", m.id); if (!r.error) { tagInput.value = ""; renderAdminPanel(); showToast("Tag added!", "success"); } }
            });
            var saveRoleBtn = document.createElement("button"); saveRoleBtn.className = "btn btn-primary btn-sm"; saveRoleBtn.textContent = "Save Role";
            saveRoleBtn.addEventListener("click", async function () {
                saveRoleBtn.disabled = true; saveRoleBtn.textContent = "Saving...";
                var r = await sb.from("profiles").update({ role: select.value }).eq("id", m.id);
                saveRoleBtn.disabled = false; saveRoleBtn.textContent = "Save Role";
                if (r.error) showToast(r.error.message, "error"); else { renderAdminPanel(); showToast("Role updated!", "success"); }
            });
            controls.append(select, tagInput, tagBtn, saveRoleBtn);
            header.appendChild(controls);
        }
        card.appendChild(header);

        if (Array.isArray(m.extra_tags) && m.extra_tags.length) {
            var tagList = document.createElement("div"); tagList.className = "member-badges";
            m.extra_tags.forEach(function (tag) {
                var b = document.createElement("span"); b.className = badgeClass(tag); b.textContent = tag; b.style.cursor = "pointer"; b.title = "Click to remove";
                b.addEventListener("click", async function () {
                    var tags = m.extra_tags.filter(function (t) { return t !== tag; });
                    var r = await sb.from("profiles").update({ extra_tags: tags }).eq("id", m.id);
                    if (!r.error) { renderAdminPanel(); showToast("Tag removed", "info"); }
                });
                tagList.appendChild(b);
            });
            card.appendChild(tagList);
        }
        adminMembersList.appendChild(card);
    });
}

// ============================================================
// TOOLTIP HANDLING
// ============================================================

document.addEventListener("mouseover", function (e) {
    var target = e.target.closest("[data-tooltip]");
    if (!target) return;
    clearTimeout(tooltipTimeout);
    tooltipEl.textContent = target.dataset.tooltip;
    tooltipEl.classList.remove("hidden");
    tooltipEl.classList.add("visible");
    var rect = target.getBoundingClientRect();
    tooltipEl.style.left = (rect.left + rect.width / 2) + "px";
    tooltipEl.style.top = (rect.top - 8) + "px";
    tooltipEl.style.transform = "translate(-50%, -100%)";
});

document.addEventListener("mouseout", function (e) {
    var target = e.target.closest("[data-tooltip]");
    if (!target) return;
    tooltipTimeout = setTimeout(function () {
        tooltipEl.classList.remove("visible");
        tooltipEl.classList.add("hidden");
    }, 100);
});
