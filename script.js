/* ===== SPOTLIGHT EFFECT ===== */
document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--x", e.clientX + "px");
    document.body.style.setProperty("--y", e.clientY + "px");
});

/* ===== SUPABASE SETUP ===== */
const SUPABASE_URL = "https://yxtcyfxupfhlgfknhfke.supabase.co";
const SUPABASE_KEY = "sb_publishable_QNNFueMNFT6fnpEhXNdzDg__s-xQm5M";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.sb = sb;

/* ===== STATE ===== */
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

const OWNER_EMAIL = "removed@example.com";
const CATEGORIES = ["All", "Ideas", "Projects", "Plans", "Diary", "Other"];
const ROLE_OPTIONS = ["Member", "Admin", "Owner"];
const TAG_OPTIONS = [
    "Co-Owner",
    "VIP",
    "Contributor",
    "Moderator",
    "Prof zager",
    "nummer 1 mama",
    "chernobly tester",
    "Langste niet ai post owner",
    "grappige spast",
    "prof website breker"
];

/* ===== ELEMENTS ===== */
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

// Account dropdown elements
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

/* ===== HELPERS ===== */
function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
        + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function showOnly(section) {
    [hero, content, communityTab, pageView, editor].forEach(el => el.classList.add("hidden"));
    section.classList.remove("hidden");
}

function showCommunitySection(section) {
    [communityFeed, communityMembers, communityAdmin, profileView, profileEditView, postEditor].forEach(el => el.classList.add("hidden"));
    section.classList.remove("hidden");
}

function getDisplayName(user) {
    if (!user) return "";
    return user.user_metadata?.name || user.email?.split("@")[0] || "User";
}

function getInitial(name) {
    return (name || "?").trim().charAt(0).toUpperCase();
}

function badgeClass(role) {
    const key = (role || "Member").toLowerCase().replace(/\s+/g, "-");
    return "badge badge-" + key;
}

function renderBadges(container, profile) {
    container.innerHTML = "";
    const role = profile.role || "Member";
    const roleBadge = document.createElement("span");
    roleBadge.className = badgeClass(role);
    roleBadge.textContent = role;
    container.appendChild(roleBadge);

    const tags = Array.isArray(profile.extra_tags) ? profile.extra_tags : [];
    tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = badgeClass(tag);
        span.textContent = tag;
        container.appendChild(span);
    });
}

function isAdminOrOwner(profile) {
    return profile && (profile.role === "Owner" || profile.role === "Admin");
}

function isOwnerUser(profile) {
    return profile && profile.role === "Owner";
}

/* ===== ACCOUNT DROPDOWN UI ===== */
function updateAccountUI() {
    if (!currentProfile) return;
    const initial = getInitial(currentProfile.display_name || currentProfile.username);
    if (accountAvatar) accountAvatar.textContent = initial;
    if (accountDropdownAvatar) accountDropdownAvatar.textContent = initial;
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
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown) dropdown.classList.remove("hidden");
    if (dropdownOverlay) dropdownOverlay.classList.remove("hidden");
    const btn = document.getElementById("accountBtn");
    if (btn) btn.setAttribute("aria-expanded", "true");
}

function closeDropdown() {
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown) dropdown.classList.add("hidden");
    if (dropdownOverlay) dropdownOverlay.classList.add("hidden");
    const btn = document.getElementById("accountBtn");
    if (btn) btn.setAttribute("aria-expanded", "false");
    showMainMenu();
}

function toggleDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById("accountDropdown");
    if (dropdown && !dropdown.classList.contains("hidden")) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

function closeDropdownOnOutsideClick(e) {
    const accountBtn = document.getElementById("accountBtn");
    const dropdown = document.getElementById("accountDropdown");
    if (!dropdown || dropdown.classList.contains("hidden")) return;
    if (!dropdown.contains(e.target) && !accountBtn.contains(e.target)) {
        closeDropdown();
    }
}

function setupAccountDropdown() {
    const accountBtn = document.getElementById("accountBtn");
    if (!accountBtn) return;

    accountBtn.addEventListener("click", toggleDropdown);
    document.addEventListener("click", closeDropdownOnOutsideClick);

    if (dropdownSettingsBtn) dropdownSettingsBtn.addEventListener("click", showSettingsMenu);
    if (dropdownSettingsBackBtn) dropdownSettingsBackBtn.addEventListener("click", showMainMenu);
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener("click", () => {
            closeDropdown();
            logoutBtn.click();
        });
    }
    if (dropdownNewPageBtn) {
        dropdownNewPageBtn.addEventListener("click", () => {
            closeDropdown();
            newPageBtn.click();
        });
    }
    if (dropdownProfileBtn) {
        dropdownProfileBtn.addEventListener("click", () => {
            closeDropdown();
            const communityLink = document.querySelector('.navbar a[data-community]') ||
                [...document.querySelectorAll('.navbar a')].find(a => a.textContent.trim() === 'Community');
            if (communityLink) communityLink.click();
            setTimeout(() => {
                if (typeof openProfile === 'function' && currentUser) {
                    openProfile(currentUser.id);
                }
            }, 300);
        });
    }
    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener("click", async () => {
            const displayName = settingsDisplayName.value.trim();
            const username = settingsUsername.value.trim();
            const bio = settingsBio.value.trim();
            if (!displayName || !username) {
                if (settingsError) {
                    settingsError.textContent = "Display name and username are required.";
                    settingsError.classList.remove("hidden");
                }
                return;
            }
            settingsSaveBtn.disabled = true;
            settingsSaveBtn.textContent = "Saving...";
            const { error } = await sb.from("profiles").update({
                display_name: displayName,
                username,
                bio,
                updated_at: new Date().toISOString()
            }).eq("id", currentUser.id);
            settingsSaveBtn.disabled = false;
            settingsSaveBtn.textContent = "Save Changes";
            if (error) {
                if (settingsError) {
                    settingsError.textContent = error.message;
                    settingsError.classList.remove("hidden");
                }
                return;
            }
            await fetchProfile();
            updateAccountUI();
            if (viewMode === 'my' && renderHome) renderHome();
            pageTitle.textContent = `Encyclopedie van ${currentProfile.display_name || currentProfile.username}`;
            welcomeHeading.textContent = `Welcome, ${currentProfile.display_name || currentProfile.username}`;
            if (settingsError) settingsError.classList.add("hidden");
            settingsSaveBtn.textContent = "✓ Saved!";
            setTimeout(() => { if (settingsSaveBtn) settingsSaveBtn.textContent = "Save Changes"; }, 1500);
        });
    }
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
    const email    = authEmail.value.trim();
    const password = authPassword.value;
    const name     = authName.value.trim();

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
                authError.textContent = "Account created! Check your email.";
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

logoutBtn.addEventListener("click", async () => await sb.auth.signOut());

sb.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
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

    const name = getDisplayName(currentUser);
    pageTitle.textContent = `Encyclopedie van ${name}`;
    welcomeHeading.textContent = `Welcome, ${name}`;

    await fetchProfile();
    updateAccountUI();
    if (accountWrap) accountWrap.classList.remove("hidden");
    setupAccountDropdown();

    await fetchPages();
    viewMode = "community";
    renderNavbar();
    await enterCommunity();
}

/* ===== DATA ===== */
async function fetchProfile() {
    let { data, error } = await sb.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
    if (error) console.error("fetchProfile error:", error);

    if (!data) {
        const isOwner = currentUser.email === OWNER_EMAIL;
        const { data: newData, error: insertErr } = await sb.from("profiles").insert({
            id: currentUser.id,
            username: currentUser.email.split("@")[0],
            display_name: getDisplayName(currentUser),
            role: isOwner ? "Owner" : "Member",
            extra_tags: []
        }).select().single();
        if (insertErr) console.error("fetchProfile insert error:", insertErr);
        data = newData;
    }
    if (data && !Array.isArray(data.extra_tags)) data.extra_tags = [];
    currentProfile = data;
    window.currentProfile = currentProfile;
    return data;
}

async function fetchPages() {
    const { data, error } = await sb.from("pages").select("*").order("updated_at", { ascending: false });
    if (error) console.error(error);
    pages = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        content: row.content,
        created: new Date(row.created_at).getTime(),
        updated: new Date(row.updated_at).getTime()
    }));
}

/* ===== NAVBAR & HOME (All first, then Community, then categories) ===== */
function renderNavbar() {
    navbar.innerHTML = "";

    const addLink = (text, isCommunity = false, cat = null) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = text;
        if (isCommunity) a.setAttribute("data-community", "true");
        if (viewMode === "my" && cat === activeCategory) a.classList.add("active");
        if (viewMode === "community" && isCommunity) a.classList.add("active");
        a.addEventListener("click", async (e) => {
            e.preventDefault();
            if (isCommunity) {
                viewMode = "community";
                currentPageId = null;
                renderNavbar();
                await enterCommunity();
            } else {
                viewMode = "my";
                activeCategory = cat;
                currentPageId = null;
                renderNavbar();
                renderHome();
            }
        });
        li.appendChild(a);
        navbar.appendChild(li);
    };

    addLink("All", false, "All");
    addLink("Community", true);
    CATEGORIES.forEach(cat => {
        if (cat !== "All") addLink(cat, false, cat);
    });
}

function renderHome() {
    showOnly(content);
    hero.classList.remove("hidden");
    content.innerHTML = "";

    const filtered = activeCategory === "All" ? pages : pages.filter(p => p.category === activeCategory);
    const sorted   = [...filtered].sort((a, b) => b.updated - a.updated);

    if (sorted.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = activeCategory === "All"
            ? "No pages yet. Click '+ New Page'."
            : `No pages in "${activeCategory}" yet.`;
        content.appendChild(empty);
        return;
    }

    sorted.forEach(p => {
        const article  = document.createElement("article");
        const cat      = document.createElement("span"); cat.className = "card-category"; cat.textContent = p.category;
        const h3       = document.createElement("h3"); h3.textContent = p.title;
        const snippet  = document.createElement("p"); snippet.className = "card-snippet"; snippet.textContent = p.content;
        const date     = document.createElement("div"); date.className = "card-date"; date.textContent = "Updated " + formatDate(p.updated);

        article.append(cat, h3, snippet, date);
        article.addEventListener("click", () => openPage(p.id));
        content.appendChild(article);
    });
}

/* ===================== COMMUNITY ===================== */
async function enterCommunity() {
    showOnly(communityTab);
    hero.classList.add("hidden");

    if (isAdminOrOwner(currentProfile)) adminSubnavBtn.classList.remove("hidden");
    else {
        adminSubnavBtn.classList.add("hidden");
        if (communitySubview === "admin") communitySubview = "feed";
    }
    setCommunitySubview(communitySubview);
}

function setCommunitySubview(view) {
    communitySubview = view;
    document.querySelectorAll(".subnav-btn").forEach(btn =>
        btn.classList.toggle("active", btn.dataset.subview === view)
    );

    if (view === "feed") {
        showCommunitySection(communityFeed);
        renderFeed();
    } else if (view === "members") {
        showCommunitySection(communityMembers);
        renderMembers();
    } else if (view === "admin") {
        showCommunitySection(communityAdmin);
        renderAdminPanel();
    }
}

document.querySelectorAll(".subnav-btn").forEach(btn =>
    btn.addEventListener("click", () => setCommunitySubview(btn.dataset.subview))
);

/* FEED */
async function renderFeed() {
    postsList.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading posts...";
    postsList.appendChild(loading);

    const { data, error } = await sb
        .from("community_posts")
        .select(`*, profiles!fk_community_posts_user_id(display_name, username, role, extra_tags)`)
        .order("created_at", { ascending: false });

    postsList.innerHTML = "";

    if (error) {
        console.error(error);
        const errDiv = document.createElement("div");
        errDiv.className = "empty-state";
        errDiv.textContent = "Could not load community posts.";
        postsList.appendChild(errDiv);
        return;
    }

    posts = data || [];

    if (posts.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No posts yet. Be the first!";
        postsList.appendChild(empty);
        return;
    }

    posts.forEach(post => buildPostCard(post, postsList));
}

function buildPostCard(post, container) {
    const card = document.createElement("div");
    card.className = "post-card";

    const header = document.createElement("div");
    header.className = "post-card-header";

    const authorLink = document.createElement("a");
    authorLink.className = "post-author-link";
    authorLink.href = "#";
    authorLink.textContent = post.profiles?.display_name || "Unknown";
    authorLink.addEventListener("click", (e) => { e.preventDefault(); openProfile(post.user_id); });
    header.appendChild(authorLink);

    if (post.profiles) {
        const badgeWrap = document.createElement("span");
        badgeWrap.className = "member-badges";
        renderBadges(badgeWrap, post.profiles);
        header.appendChild(badgeWrap);
    }

    const catSpan = document.createElement("span");
    catSpan.className = "post-card-category";
    catSpan.textContent = post.category;
    header.appendChild(catSpan);

    const h3 = document.createElement("h3");
    h3.textContent = post.title;

    const contentP = document.createElement("p");
    contentP.className = "post-card-content";
    contentP.textContent = post.content;

    const date = document.createElement("div");
    date.className = "post-card-date";
    date.textContent = formatDate(new Date(post.created_at).getTime());

    card.append(header, h3, contentP, date);

    if (post.user_id === currentUser.id || isAdminOrOwner(currentProfile)) {
        const actions = document.createElement("div");
        actions.className = "post-card-actions";
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-danger btn-sm";
        delBtn.textContent = "Delete post";
        delBtn.addEventListener("click", () => {
            let confirmBar = card.querySelector(".delete-confirm");
            if (confirmBar) return confirmBar.remove();

            confirmBar = document.createElement("div");
            confirmBar.className = "delete-confirm";

            const text = document.createElement("span");
            text.textContent = `Delete "${post.title}"? This cannot be undone.`;

            const yesBtn = document.createElement("button");
            yesBtn.className = "btn btn-danger";
            yesBtn.textContent = "Yes, delete";
            yesBtn.addEventListener("click", async () => {
                yesBtn.disabled = true;
                yesBtn.textContent = "Deleting...";
                await deletePost(post.id);
            });

            const noBtn = document.createElement("button");
            noBtn.className = "btn";
            noBtn.textContent = "Cancel";
            noBtn.addEventListener("click", () => confirmBar.remove());

            confirmBar.append(text, yesBtn, noBtn);
            actions.appendChild(confirmBar);
        });
        actions.appendChild(delBtn);
        card.appendChild(actions);
    }

    const commentsSection = document.createElement("div");
    commentsSection.className = "comments-section";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "comments-toggle-btn";
    toggleBtn.textContent = "💬 Show comments";
    let commentsLoaded = false;
    let commentsOpen   = false;

    const commentsList = document.createElement("div");
    commentsList.className = "comments-list hidden";

    const composer = document.createElement("div");
    composer.className = "comment-composer";

    const textarea = document.createElement("textarea");
    textarea.className = "comment-textarea";
    textarea.placeholder = "Write a comment...";
    textarea.rows = 2;

    const submitBtn = document.createElement("button");
    submitBtn.className = "btn btn-primary btn-sm";
    submitBtn.textContent = "Post comment";

    submitBtn.addEventListener("click", async () => {
        const text = textarea.value.trim();
        if (!text) return;

        submitBtn.disabled = true;
        submitBtn.textContent = "Posting...";

        const { error } = await sb.from("post_comments").insert({
            post_id:  post.id,
            user_id:  currentUser.id,
            content:  text
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Post comment";

        if (error) {
            alert("Could not post comment: " + error.message);
            return;
        }

        textarea.value = "";
        await loadComments(post.id, commentsList);
    });

    composer.append(textarea, submitBtn);

    toggleBtn.addEventListener("click", async () => {
        commentsOpen = !commentsOpen;
        if (commentsOpen) {
            commentsList.classList.remove("hidden");
            composer.classList.remove("hidden");
            if (!commentsLoaded) {
                await loadComments(post.id, commentsList);
                commentsLoaded = true;
            }
            toggleBtn.textContent = "💬 Hide comments";
        } else {
            commentsList.classList.add("hidden");
            composer.classList.add("hidden");
            toggleBtn.textContent = "💬 Show comments";
        }
    });

    composer.classList.add("hidden");
    commentsSection.append(toggleBtn, commentsList, composer);
    card.appendChild(commentsSection);
    container.appendChild(card);
}

async function loadComments(postId, listEl) {
    listEl.innerHTML = `<div class="comment-loading">Loading...</div>`;

    const { data, error } = await sb
        .from("post_comments")
        .select(`*, profiles!post_comments_user_id_fkey(display_name, username, role, extra_tags)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    listEl.innerHTML = "";

    if (error) {
        listEl.innerHTML = `<div class="comment-loading">Could not load comments.</div>`;
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        listEl.innerHTML = `<div class="comment-loading">No comments yet. Be the first!</div>`;
        return;
    }

    data.forEach(comment => {
        const el = document.createElement("div");
        el.className = "comment";

        const commentHeader = document.createElement("div");
        commentHeader.className = "comment-header";

        const avatar = document.createElement("div");
        avatar.className = "comment-avatar";
        avatar.textContent = getInitial(comment.profiles?.display_name || comment.profiles?.username);

        const authorLink = document.createElement("a");
        authorLink.className = "post-author-link";
        authorLink.href = "#";
        authorLink.textContent = comment.profiles?.display_name || "Unknown";
        authorLink.addEventListener("click", (e) => { e.preventDefault(); openProfile(comment.user_id); });

        const badges = document.createElement("span");
        badges.className = "member-badges";
        if (comment.profiles) renderBadges(badges, comment.profiles);

        const dateSpan = document.createElement("span");
        dateSpan.className = "comment-date";
        dateSpan.textContent = formatDate(new Date(comment.created_at).getTime());

        commentHeader.append(avatar, authorLink, badges, dateSpan);

        const body = document.createElement("div");
        body.className = "comment-body";
        body.textContent = comment.content;

        el.append(commentHeader, body);

        if (comment.user_id === currentUser.id || isAdminOrOwner(currentProfile)) {
            const delBtn = document.createElement("button");
            delBtn.className = "btn btn-danger btn-sm comment-delete-btn";
            delBtn.textContent = "✕";
            delBtn.title = "Delete comment";
            delBtn.addEventListener("click", async () => {
                let confirmBar = el.querySelector(".delete-confirm");
                if (confirmBar) return confirmBar.remove();

                confirmBar = document.createElement("div");
                confirmBar.className = "delete-confirm";

                const text = document.createElement("span");
                text.textContent = "Delete this comment?";

                const yesBtn = document.createElement("button");
                yesBtn.className = "btn btn-danger btn-sm";
                yesBtn.textContent = "Yes, delete";
                yesBtn.addEventListener("click", async () => {
                    yesBtn.disabled = true;
                    yesBtn.textContent = "Deleting...";
                    const { error } = await sb.from("post_comments").delete().eq("id", comment.id);
                    if (error) { alert(error.message); yesBtn.disabled = false; yesBtn.textContent = "Yes, delete"; return; }
                    await loadComments(postId, listEl);
                });

                const noBtn = document.createElement("button");
                noBtn.className = "btn btn-sm";
                noBtn.textContent = "Cancel";
                noBtn.addEventListener("click", () => confirmBar.remove());

                confirmBar.append(text, yesBtn, noBtn);
                el.appendChild(confirmBar);
            });
            commentHeader.appendChild(delBtn);
        }

        listEl.appendChild(el);
    });
}

async function deletePost(postId) {
    await sb.from("community_posts").delete().eq("id", postId);
    renderFeed();
}

/* POST EDITOR */
newPostBtn.addEventListener("click", () => {
    postTitleInput.value = "";
    postCategoryInput.value = "Discussion";
    postContentInput.value = "";
    showCommunitySection(postEditor);
    postTitleInput.focus();
});

cancelPostBtn.addEventListener("click", () => showCommunitySection(communityFeed));

savePostBtn.addEventListener("click", async () => {
    const title = postTitleInput.value.trim();
    if (!title) return;

    savePostBtn.disabled = true;
    savePostBtn.textContent = "Posting...";

    try {
        const { error } = await sb.from("community_posts").insert({
            user_id: currentUser.id,
            title,
            category: postCategoryInput.value,
            content: postContentInput.value.trim()
        });
        if (error) throw error;

        showCommunitySection(communityFeed);
        await renderFeed();
    } catch (err) {
        alert("Could not post: " + (err.message || "unknown error"));
    } finally {
        savePostBtn.disabled = false;
        savePostBtn.textContent = "Post";
    }
});

/* MEMBERS */
async function fetchMembers() {
    const { data, error } = await sb.from("profiles").select("*").order("joined_at", { ascending: true });
    if (error) console.error(error);
    return (data || []).map(m => ({ ...m, extra_tags: Array.isArray(m.extra_tags) ? m.extra_tags : [] }));
}

async function fetchStats() {
    const { data, error } = await sb.from("profile_stats").select("*");
    if (error) return console.error(error);
    profileStatsMap = {};
    (data || []).forEach(row => profileStatsMap[row.id] = row);
}

async function renderMembers() {
    membersList.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading members...";
    membersList.appendChild(loading);

    members = await fetchMembers();
    await fetchStats();
    membersList.innerHTML = "";

    if (members.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No members found.";
        membersList.appendChild(empty);
        return;
    }

    const roleOrder = { Owner: 0, Admin: 1 };
    const sorted = [...members].sort((a, b) => {
        const ra = roleOrder[a.role] ?? 2;
        const rb = roleOrder[b.role] ?? 2;
        if (ra !== rb) return ra - rb;
        return new Date(a.joined_at) - new Date(b.joined_at);
    });

    sorted.forEach(member => {
        const card   = document.createElement("div");
        card.className = "member-card";

        const header = document.createElement("div");
        header.className = "member-card-header";

        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        avatar.textContent = getInitial(member.display_name || member.username);

        const nameWrap = document.createElement("div");
        const name     = document.createElement("div");
        name.className = "member-card-name";
        name.textContent = member.display_name || member.username || "Unknown";

        const username = document.createElement("div");
        username.className = "member-card-username";
        username.textContent = "@" + (member.username || "unknown");

        nameWrap.appendChild(name);
        nameWrap.appendChild(username);

        header.appendChild(avatar);
        header.appendChild(nameWrap);

        const badges = document.createElement("div");
        badges.className = "member-badges";
        renderBadges(badges, member);

        card.appendChild(header);
        card.appendChild(badges);

        if (member.bio) {
            const bio = document.createElement("div");
            bio.className = "member-card-bio";
            bio.textContent = member.bio;
            card.appendChild(bio);
        }

        card.addEventListener("click", () => openProfile(member.id));
        membersList.appendChild(card);
    });
}

/* PROFILE */
async function openProfile(userId) {
    viewingProfileId = userId;

    const { data: profile, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error || !profile) { alert("Profile not found."); return; }
    if (!Array.isArray(profile.extra_tags)) profile.extra_tags = [];

    const idx = members.findIndex(m => m.id === userId);
    if (idx !== -1) members[idx] = profile;

    profileAvatar.textContent = getInitial(profile.display_name || profile.username);
    profileDisplayName.textContent = profile.display_name || profile.username || "Unknown";
    profileUsername.textContent = "@" + (profile.username || "unknown");
    renderBadges(profileBadges, profile);
    profileBio.textContent = profile.bio || (userId === currentUser.id ? "No bio yet. Edit your profile." : "No bio yet.");

    if (!profileStatsMap[userId]) await fetchStats();
    const stats = profileStatsMap[userId] || { post_count: 0 };
    profileStats.innerHTML = `<div class="profile-stat"><span class="profile-stat-value">${stats.post_count}</span><span class="profile-stat-label">Posts</span></div>`;

    const joinDate = new Date(profile.joined_at);
    profileMeta.textContent = "Joined " + joinDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

    editProfileBtn.classList.toggle("hidden", userId !== currentUser.id);
    showCommunitySection(profileView);
}

profileBackBtn.addEventListener("click", () => setCommunitySubview(communitySubview === "admin" ? "admin" : "members"));
profileEditBackBtn.addEventListener("click", () => openProfile(currentUser.id));

editProfileBtn.addEventListener("click", () => {
    editDisplayName.value = currentProfile.display_name || "";
    editUsername.value    = currentProfile.username || "";
    editBio.value         = currentProfile.bio || "";
    profileEditError.classList.add("hidden");
    showCommunitySection(profileEditView);
});

saveProfileBtn.addEventListener("click", async () => {
    const displayName = editDisplayName.value.trim();
    const username    = editUsername.value.trim();
    const bio         = editBio.value.trim();

    if (!displayName || !username) {
        profileEditError.textContent = "Display name and username are required.";
        profileEditError.classList.remove("hidden");
        return;
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";

    const { error } = await sb.from("profiles").update({
        display_name: displayName,
        username,
        bio,
        updated_at: new Date().toISOString()
    }).eq("id", currentUser.id);

    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = "Save";

    if (error) {
        profileEditError.textContent = error.message;
        profileEditError.classList.remove("hidden");
        return;
    }

    currentProfile.display_name = displayName;
    currentProfile.username     = username;
    currentProfile.bio          = bio;
    updateAccountUI();
    await openProfile(currentUser.id);
});

/* ========== ADMIN PANEL ========== */
async function renderAdminPanel() {
    adminMembersList.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading members...";
    adminMembersList.appendChild(loading);

    members = await fetchMembers();
    adminMembersList.innerHTML = "";

    const isOwner = isOwnerUser(currentProfile);

    members.forEach(member => renderAdminCard(member, isOwner));
}

function renderAdminCard(member, isOwner) {
    const card = document.createElement("div");
    card.className = "admin-member-card";
    card.dataset.memberId = member.id;

    const header = document.createElement("div");
    header.className = "admin-member-header";

    const identity = document.createElement("div");
    identity.className = "admin-member-identity";

    const avatar = document.createElement("div");
    avatar.className = "member-avatar";
    avatar.textContent = getInitial(member.display_name || member.username);

    const nameWrap = document.createElement("div");
    const name = document.createElement("div");
    name.className = "member-card-name";
    name.textContent = member.display_name || member.username || "Unknown";

    const badges = document.createElement("div");
    badges.className = "member-badges";
    renderBadges(badges, member);

    nameWrap.appendChild(name);
    nameWrap.appendChild(badges);
    identity.appendChild(avatar);
    identity.appendChild(nameWrap);

    const controls = document.createElement("div");
    controls.className = "admin-role-controls";

    const statusLabel = document.createElement("span");
    statusLabel.className = "admin-save-status";
    statusLabel.style.cssText = "font-size:.8rem;color:#4ade80;display:none;";

    function showStatus(msg, ok = true) {
        statusLabel.textContent = msg;
        statusLabel.style.color = ok ? "#4ade80" : "#f87171";
        statusLabel.style.display = "inline";
        setTimeout(() => { statusLabel.style.display = "none"; }, 3000);
    }

    // Role select - only Owner can change roles
    const roleSelect = document.createElement("select");
    const availableRoles = isOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r !== "Admin" && r !== "Owner");
    const rolesToShow = availableRoles.includes(member.role) ? availableRoles : [...availableRoles, member.role];
    rolesToShow.forEach(role => {
        const opt = document.createElement("option");
        opt.value = role;
        opt.textContent = role;
        if (role === member.role) opt.selected = true;
        roleSelect.appendChild(opt);
    });
    const canChangeRole = isOwner && member.id !== currentUser.id;
    if (!canChangeRole) roleSelect.disabled = true;

    roleSelect.addEventListener("change", async () => {
        const newRole = roleSelect.value;
        const prevRole = member.role;
        roleSelect.disabled = true;
        const { data: saved, error } = await sb
            .from("profiles")
            .update({ role: newRole })
            .eq("id", member.id)
            .select("role, extra_tags")
            .single();
        roleSelect.disabled = false;
        if (error) {
            showStatus("❌ " + (error.message || "Save failed"), false);
            roleSelect.value = prevRole;
            return;
        }
        member.role = saved.role;
        member.extra_tags = Array.isArray(saved.extra_tags) ? saved.extra_tags : [];
        renderBadges(badges, member);
        showStatus("✓ Role saved");
        if (member.id === currentUser.id) {
            currentProfile.role = member.role;
            updateAccountUI();
        }
    });
    controls.appendChild(roleSelect);

    // Tag add select - Admins can add tags to Members only
    const tagSelect = document.createElement("select");
    const blankOpt = document.createElement("option");
    blankOpt.value = "";
    blankOpt.textContent = "+ Add tag";
    tagSelect.appendChild(blankOpt);

    // Check if current user can modify tags for this member
    const canModifyTags = isOwner || (isAdminOrOwner(currentProfile) && member.role === "Member");
    if (!canModifyTags) tagSelect.disabled = true;

    function rebuildTagSelect() {
        while (tagSelect.options.length > 1) tagSelect.remove(1);
        TAG_OPTIONS.forEach(tag => {
            if (!(member.extra_tags || []).includes(tag)) {
                const opt = document.createElement("option");
                opt.value = tag;
                opt.textContent = tag;
                tagSelect.appendChild(opt);
            }
        });
    }
    rebuildTagSelect();

    tagSelect.addEventListener("change", async () => {
        const tag = tagSelect.value;
        if (!tag) return;
        const newTags = [...(member.extra_tags || []), tag];
        tagSelect.disabled = true;
        const { data: saved, error } = await sb
            .from("profiles")
            .update({ extra_tags: newTags })
            .eq("id", member.id)
            .select("role, extra_tags")
            .single();
        tagSelect.disabled = false;
        tagSelect.value = "";
        if (error) {
            showStatus("❌ " + (error.message || "Save failed"), false);
            return;
        }
        member.extra_tags = Array.isArray(saved.extra_tags) ? saved.extra_tags : [];
        renderBadges(badges, member);
        rebuildTagSelect();
        rebuildTagList();
        showStatus("✓ Tag added");
    });
    controls.appendChild(tagSelect);

    // Tag list with reorder buttons - Admins can reorder tags for Members
    const tagListContainer = document.createElement("div");
    tagListContainer.style.cssText = "display:flex;flex-direction:column;gap:6px;margin-top:8px;width:100%;";

    function rebuildTagList() {
        tagListContainer.innerHTML = "";
        const tags = member.extra_tags || [];
        if (tags.length === 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.textContent = "No custom badges";
            emptyMsg.style.cssText = "color:#64748b; font-size:0.75rem;";
            tagListContainer.appendChild(emptyMsg);
            return;
        }
        tags.forEach((tag, idx) => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex;align-items:center;gap:8px;";

            const upBtn = document.createElement("button");
            upBtn.textContent = "▲";
            upBtn.className = "btn btn-sm";
            upBtn.style.padding = "2px 6px";
            upBtn.disabled = idx === 0 || !canModifyTags;
            upBtn.addEventListener("click", async () => {
                if (idx === 0 || !canModifyTags) return;
                const newTags = [...tags];
                [newTags[idx - 1], newTags[idx]] = [newTags[idx], newTags[idx - 1]];
                await saveTagOrder(newTags);
            });

            const downBtn = document.createElement("button");
            downBtn.textContent = "▼";
            downBtn.className = "btn btn-sm";
            downBtn.style.padding = "2px 6px";
            downBtn.disabled = idx === tags.length - 1 || !canModifyTags;
            downBtn.addEventListener("click", async () => {
                if (idx === tags.length - 1 || !canModifyTags) return;
                const newTags = [...tags];
                [newTags[idx], newTags[idx + 1]] = [newTags[idx + 1], newTags[idx]];
                await saveTagOrder(newTags);
            });

            const tagSpan = document.createElement("span");
            tagSpan.textContent = tag;
            tagSpan.className = "badge badge-custom";
            tagSpan.style.backgroundColor = "rgba(129,140,248,.1)";
            tagSpan.style.color = "#818cf8";
            tagSpan.style.padding = "2px 8px";

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "✕";
            removeBtn.className = "btn btn-danger btn-sm";
            removeBtn.style.padding = "2px 6px";
            removeBtn.disabled = !canModifyTags;
            removeBtn.addEventListener("click", async () => {
                if (!canModifyTags) return;
                const newTags = tags.filter(t => t !== tag);
                await saveTagOrder(newTags);
            });

            row.append(upBtn, downBtn, tagSpan, removeBtn);
            tagListContainer.appendChild(row);
        });
    }

    async function saveTagOrder(newTags) {
        member.extra_tags = newTags;
        renderBadges(badges, member);
        rebuildTagList();
        rebuildTagSelect();
        const { error } = await sb
            .from("profiles")
            .update({ extra_tags: newTags })
            .eq("id", member.id);
        if (error) {
            console.error("Tag reorder error:", error);
            showStatus("❌ Failed to save order", false);
            const { data: fresh } = await sb.from("profiles").select("*").eq("id", member.id).single();
            if (fresh) {
                member.extra_tags = Array.isArray(fresh.extra_tags) ? fresh.extra_tags : [];
                renderBadges(badges, member);
                rebuildTagList();
                rebuildTagSelect();
            }
        } else {
            showStatus("✓ Order saved");
        }
    }

    rebuildTagList();
    controls.appendChild(tagListContainer);
    controls.appendChild(statusLabel);

    // View profile button
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-sm";
    viewBtn.textContent = "View Profile";
    viewBtn.addEventListener("click", () => openProfile(member.id));
    controls.appendChild(viewBtn);

    header.appendChild(identity);
    header.appendChild(controls);
    card.appendChild(header);
    adminMembersList.appendChild(card);
}

/* PAGE FUNCTIONS */
function openPage(id) {
    const p = pages.find(pg => pg.id === id);
    if (!p) return;

    currentPageId = id;
    pageTitleDisplay.textContent = p.title;
    pageMeta.textContent = `${p.category} · Created ${formatDate(p.created)} · Updated ${formatDate(p.updated)}`;
    pageContentDisplay.textContent = p.content;

    editBtn.classList.remove("hidden");
    deleteBtn.classList.remove("hidden");
    showOnly(pageView);
}

function openEditor(id) {
    if (id) {
        const p = pages.find(pg => pg.id === id);
        if (!p) return;
        currentPageId = id;
        editorHeading.textContent = "Edit Page";
        pageTitleInput.value   = p.title;
        pageCategoryInput.value = p.category;
        pageContentInput.value = p.content;
    } else {
        currentPageId = null;
        editorHeading.textContent = "New Page";
        pageTitleInput.value   = "";
        pageCategoryInput.value = activeCategory !== "All" ? activeCategory : "Ideas";
        pageContentInput.value = "";
    }
    showOnly(editor);
    pageTitleInput.focus();
}

async function savePage() {
    const title    = pageTitleInput.value.trim();
    const category = pageCategoryInput.value;
    const text     = pageContentInput.value;

    if (!title) return pageTitleInput.focus();

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        if (currentPageId) {
            const { error } = await sb.from("pages").update({
                title, category, content: text, updated_at: new Date().toISOString()
            }).eq("id", currentPageId);
            if (error) throw error;
        } else {
            const { data, error } = await sb.from("pages").insert({
                user_id: currentUser.id, title, category, content: text
            }).select().single();
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

async function deletePage() {
    if (!currentPageId) return;
    const p = pages.find(pg => pg.id === currentPageId);
    if (!p) return;

    let confirmBar = document.getElementById("deleteConfirmBar");
    if (confirmBar) return confirmBar.remove();

    confirmBar = document.createElement("div");
    confirmBar.id = "deleteConfirmBar";
    confirmBar.className = "delete-confirm";

    const text   = document.createElement("span");
    text.textContent = `Delete "${p.title}"? This cannot be undone.`;

    const yesBtn = document.createElement("button");
    yesBtn.className = "btn btn-danger";
    yesBtn.textContent = "Yes, delete";
    yesBtn.addEventListener("click", async () => {
        yesBtn.disabled = true;
        yesBtn.textContent = "Deleting...";
        const { error } = await sb.from("pages").delete().eq("id", currentPageId);
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

    confirmBar.append(text, yesBtn, noBtn);
    pageView.appendChild(confirmBar);
}

/* ===== EVENT LISTENERS ===== */
newPageBtn.addEventListener("click", () => openEditor(null));
editBtn.addEventListener("click", () => openEditor(currentPageId));
deleteBtn.addEventListener("click", deletePage);
closeBtn.addEventListener("click", () => { currentPageId = null; renderHome(); });
saveBtn.addEventListener("click", savePage);
cancelBtn.addEventListener("click", () => currentPageId ? openPage(currentPageId) : renderHome());

/* ===== INIT ===== */
setAuthMode("signin");
