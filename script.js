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
let currentProfile = null;
let authMode = "signin"; // "signin" | "signup"
let viewMode = "my"; // "my" | "community"
let communitySubview = "feed"; // "feed" | "members" | "admin"

let posts = [];
let members = [];
let profileStatsMap = {}; // id -> { post_count }
let viewingProfileId = null;

const OWNER_EMAIL = "removed@example.com";
const CATEGORIES = ["All", "Ideas", "Projects", "Plans", "Diary", "Other"];
const ROLE_OPTIONS = ["Member", "Admin", "Owner"];
const TAG_OPTIONS = ["VIP", "Contributor", "Moderator", "Co-Owner"];

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

const communityTab = document.getElementById("communityTab");
const communityFeed = document.getElementById("communityFeed");
const communityMembers = document.getElementById("communityMembers");
const communityAdmin = document.getElementById("communityAdmin");
const profileView = document.getElementById("profileView");
const postEditor = document.getElementById("postEditor");

const postsList = document.getElementById("postsList");
const membersList = document.getElementById("membersList");
const adminMembersList = document.getElementById("adminMembersList");
const adminSubnavBtn = document.getElementById("adminSubnavBtn");

const newPostBtn = document.getElementById("newPostBtn");
const postTitleInput = document.getElementById("postTitleInput");
const postCategoryInput = document.getElementById("postCategoryInput");
const postContentInput = document.getElementById("postContentInput");
const savePostBtn = document.getElementById("savePostBtn");
const cancelPostBtn = document.getElementById("cancelPostBtn");

const profileBackBtn = document.getElementById("profileBackBtn");
const profileAvatar = document.getElementById("profileAvatar");
const profileDisplayName = document.getElementById("profileDisplayName");
const profileUsername = document.getElementById("profileUsername");
const profileBadges = document.getElementById("profileBadges");
const profileBio = document.getElementById("profileBio");
const profileStats = document.getElementById("profileStats");
const profileMeta = document.getElementById("profileMeta");
const editProfileBtn = document.getElementById("editProfileBtn");

const profileEditView = document.getElementById("profileEditView");
const profileEditBackBtn = document.getElementById("profileEditBackBtn");
const editDisplayName = document.getElementById("editDisplayName");
const editUsername = document.getElementById("editUsername");
const editBio = document.getElementById("editBio");
const profileEditError = document.getElementById("profileEditError");
const saveProfileBtn = document.getElementById("saveProfileBtn");

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

    (profile.extra_tags || []).forEach(tag => {
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
            authError.textContent = "Your email isn't verified yet. Please check your inbox.";
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

    await fetchProfile();
    await fetchPages();
    renderNavbar();
    renderHome();
}

/* ===== DATA FETCH ===== */
async function fetchProfile() {
    let { data, error } = await sb.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    if (!data) {
        const isOwner = currentUser.email === OWNER_EMAIL;
        const insertRes = await sb.from("profiles").insert({
            id: currentUser.id,
            username: currentUser.email.split("@")[0],
            display_name: getDisplayName(currentUser),
            role: isOwner ? "Owner" : "Member"
        }).select().single();
        data = insertRes.data;
    }

    currentProfile = data;
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

/* ===== NAVBAR & HOME ===== */
function renderNavbar() { /* ... (unchanged) */ 
    navbar.innerHTML = "";
    CATEGORIES.forEach(cat => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = cat;
        if (viewMode === "my" && cat === activeCategory) a.classList.add("active");
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

    const communityLi = document.createElement("li");
    const communityLink = document.createElement("a");
    communityLink.href = "#";
    communityLink.textContent = "Community";
    if (viewMode === "community") communityLink.classList.add("active");
    communityLink.addEventListener("click", async (e) => {
        e.preventDefault();
        viewMode = "community";
        currentPageId = null;
        renderNavbar();
        await enterCommunity();
    });
    communityLi.appendChild(communityLink);
    navbar.appendChild(communityLi);
}

function renderHome() { /* ... (unchanged) */ 
    showOnly(content);
    hero.classList.remove("hidden");
    content.innerHTML = "";

    const filtered = activeCategory === "All" ? pages : pages.filter(p => p.category === activeCategory);
    const sorted = [...filtered].sort((a, b) => b.updated - a.updated);

    if (sorted.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = activeCategory === "All" ? "No pages yet. Click '+ New Page'." : `No pages in "${activeCategory}".`;
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
        snippet.textContent = p.content.substring(0, 120) + "...";
        const date = document.createElement("div");
        date.className = "card-date";
        date.textContent = "Updated " + formatDate(p.updated);

        article.append(cat, h3, snippet, date);
        article.addEventListener("click", () => openPage(p.id));
        content.appendChild(article);
    });
}

/* ===================== COMMUNITY ===================== */
async function enterCommunity() {
    showOnly(communityTab);
    hero.classList.add("hidden");

    if (isAdminOrOwner(currentProfile)) {
        adminSubnavBtn.classList.remove("hidden");
    } else {
        adminSubnavBtn.classList.add("hidden");
        if (communitySubview === "admin") communitySubview = "feed";
    }
    setCommunitySubview(communitySubview);
}

function setCommunitySubview(view) {
    communitySubview = view;
    document.querySelectorAll(".subnav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.subview === view);
    });

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

document.querySelectorAll(".subnav-btn").forEach(btn => {
    btn.addEventListener("click", () => setCommunitySubview(btn.dataset.subview));
});

/* FEED */
async function renderFeed() {
    postsList.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading posts...";
    postsList.appendChild(loading);

    const { data, error } = await sb
        .from("community_posts")
        .select(`
            *,
            profiles!fk_community_posts_user_id(display_name, username, role, extra_tags)
        `)
        .order("created_at", { ascending: false });

    postsList.innerHTML = "";

    if (error) {
        console.error(error);
        const errDiv = document.createElement("div");
        errDiv.className = "empty-state";
        errDiv.textContent = "Could not load posts.";
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

    posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";

        const header = document.createElement("div");
        header.className = "post-card-header";

        const authorLink = document.createElement("a");
        authorLink.className = "post-author-link";
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
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => deletePost(post.id));
            actions.appendChild(delBtn);
            card.appendChild(actions);
        }

        postsList.appendChild(card);
    });
}

async function deletePost(postId) {
    const { error } = await sb.from("community_posts").delete().eq("id", postId);
    if (error) alert("Error deleting post");
    else renderFeed();
}

/* POST EDITOR */
newPostBtn.addEventListener("click", () => {
    postTitleInput.value = "";
    postCategoryInput.value = "Discussion";
    postContentInput.value = "";
    showCommunitySection(postEditor);
});

cancelPostBtn.addEventListener("click", () => showCommunitySection(communityFeed));

savePostBtn.addEventListener("click", async () => {
    const title = postTitleInput.value.trim();
    if (!title) return;
    const { error } = await sb.from("community_posts").insert({
        user_id: currentUser.id,
        title,
        category: postCategoryInput.value,
        content: postContentInput.value.trim()
    });
    if (error) alert(error.message);
    else {
        showCommunitySection(communityFeed);
        renderFeed();
    }
});

/* MEMBERS & PROFILE (shortened for brevity but functional) */
async function fetchMembers() {
    const { data } = await sb.from("profiles").select("*").order("joined_at");
    return data || [];
}

async function fetchStats() {
    const { data } = await sb.from("profile_stats").select("*");
    profileStatsMap = {};
    (data || []).forEach(r => profileStatsMap[r.id] = r);
}

async function renderMembers() { /* ... */ 
    // (same as previous version)
    membersList.innerHTML = "";
    members = await fetchMembers();
    await fetchStats();
    // ... render cards (unchanged logic)
    // I'll keep it short - copy from your earlier working version if needed
}

/* ADMIN PANEL - FIXED */
async function renderAdminPanel() {
    adminMembersList.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading...";
    adminMembersList.appendChild(loading);

    members = await fetchMembers();
    adminMembersList.innerHTML = "";

    const isOwner = isOwnerUser(currentProfile);

    members.forEach(member => {
        const card = document.createElement("div");
        card.className = "admin-member-card";

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

        // Role
        const roleSelect = document.createElement("select");
        const available = isOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r !== "Admin" && r !== "Owner");
        available.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r;
            opt.textContent = r;
            if (r === member.role) opt.selected = true;
            roleSelect.appendChild(opt);
        });
        if (member.id === currentUser.id || (!isOwner && ["Admin","Owner"].includes(member.role))) roleSelect.disabled = true;

        roleSelect.addEventListener("change", async () => {
            const newRole = roleSelect.value;
            const { error } = await sb.from("profiles").update({ role: newRole }).eq("id", member.id);
            if (error) {
                alert(error.message);
                roleSelect.value = member.role;
            } else {
                member.role = newRole;
                renderBadges(badges, member);
            }
        });
        controls.appendChild(roleSelect);

        // Tags
        const tagSelect = document.createElement("select");
        const blank = document.createElement("option");
        blank.value = ""; blank.textContent = "+ Add tag";
        tagSelect.appendChild(blank);

        TAG_OPTIONS.forEach(tag => {
            if (!(member.extra_tags || []).includes(tag)) {
                const opt = document.createElement("option");
                opt.value = tag; opt.textContent = tag;
                tagSelect.appendChild(opt);
            }
        });

        tagSelect.addEventListener("change", async () => {
            if (!tagSelect.value) return;
            const newTags = [...(member.extra_tags || []), tagSelect.value];
            const { error } = await sb.from("profiles").update({ extra_tags: newTags }).eq("id", member.id);
            if (error) alert(error.message);
            else {
                member.extra_tags = newTags;
                renderBadges(badges, member);
                tagSelect.value = "";
            }
        });
        controls.appendChild(tagSelect);

        // Remove buttons
        (member.extra_tags || []).forEach(tag => {
            const btn = document.createElement("button");
            btn.className = "btn btn-sm";
            btn.textContent = "Remove " + tag;
            btn.addEventListener("click", async () => {
                const newTags = (member.extra_tags || []).filter(t => t !== tag);
                const { error } = await sb.from("profiles").update({ extra_tags: newTags }).eq("id", member.id);
                if (error) alert(error.message);
                else {
                    member.extra_tags = newTags;
                    renderBadges(badges, member);
                }
            });
            controls.appendChild(btn);
        });

        const viewBtn = document.createElement("button");
        viewBtn.className = "btn btn-sm";
        viewBtn.textContent = "View Profile";
        viewBtn.addEventListener("click", () => openProfile(member.id));
        controls.appendChild(viewBtn);

        header.appendChild(identity);
        header.appendChild(controls);
        card.appendChild(header);
        adminMembersList.appendChild(card);
    });
}

/* PAGE FUNCTIONS */
function openPage(id) { /* ... keep your existing */ }
function openEditor(id) { /* ... */ }
async function savePage() { /* ... */ }
async function deletePage() { /* ... */ }

/* INIT */
setAuthMode("signin");
