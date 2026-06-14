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

    await fetchProfile();
    await fetchPages();
    renderNavbar();
    renderHome();
}

/* ===== DATA: FETCH PROFILE ===== */
async function fetchProfile() {
    let { data, error } = await sb
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) {
        console.error(error);
        currentProfile = null;
        return;
    }

    if (!data) {
        // Profile may not exist yet if trigger hasn't run - create one
        const isOwner = currentUser.email === OWNER_EMAIL;
        const insertRes = await sb
            .from("profiles")
            .insert({
                id: currentUser.id,
                username: currentUser.email.split("@")[0],
                display_name: getDisplayName(currentUser),
                role: isOwner ? "Owner" : "Member"
            })
            .select()
            .single();

        data = insertRes.data;
    }

    currentProfile = data;
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
        await enterCommunity();
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
        date.textContent = "Updated " + formatDate(p.updated);

        article.appendChild(cat);
        article.appendChild(h3);
        article.appendChild(snippet);
        article.appendChild(date);

        article.addEventListener("click", () => openPage(p.id));

        content.appendChild(article);
    });
}

/* ===================== COMMUNITY MODULE ===================== */

async function enterCommunity() {
    showOnly(communityTab);
    hero.classList.add("hidden");

    // Show/hide admin subnav based on role
    if (isAdminOrOwner(currentProfile)) {
        adminSubnavBtn.classList.remove("hidden");
    } else {
        adminSubnavBtn.classList.add("hidden");
        if (communitySubview === "admin") {
            communitySubview = "feed";
        }
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

/* ---------- FEED ---------- */
async function renderFeed() {
    postsList.innerHTML = "";

    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading posts...";
    postsList.appendChild(loading);

    const { data, error } = await sb
        .from("community_posts")
        .select("*, profiles(display_name, username, role, extra_tags)")
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
        empty.textContent = "No posts yet. Be the first to share something!";
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
        authorLink.href = "#";
        authorLink.textContent = post.profiles?.display_name || "Unknown";
        authorLink.addEventListener("click", (e) => {
            e.preventDefault();
            openProfile(post.user_id);
        });
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

        card.appendChild(header);
        card.appendChild(h3);
        card.appendChild(contentP);
        card.appendChild(date);

        // Delete button: owner of post, or admin/owner role
        const canDelete = post.user_id === currentUser.id || isAdminOrOwner(currentProfile);
        if (canDelete) {
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
    const { error } = await sb
        .from("community_posts")
        .delete()
        .eq("id", postId);

    if (error) {
        alert("Could not delete post: " + error.message);
        return;
    }

    await renderFeed();
}

/* ---------- POST EDITOR ---------- */
newPostBtn.addEventListener("click", () => {
    postTitleInput.value = "";
    postCategoryInput.value = "Discussion";
    postContentInput.value = "";
    showCommunitySection(postEditor);
    postTitleInput.focus();
});

cancelPostBtn.addEventListener("click", () => {
    showCommunitySection(communityFeed);
});

savePostBtn.addEventListener("click", async () => {
    const title = postTitleInput.value.trim();
    const category = postCategoryInput.value;
    const text = postContentInput.value.trim();

    if (!title) {
        postTitleInput.focus();
        return;
    }

    savePostBtn.disabled = true;
    savePostBtn.textContent = "Posting...";

    try {
        const { error } = await sb
            .from("community_posts")
            .insert({
                user_id: currentUser.id,
                title,
                category,
                content: text
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

/* ---------- MEMBERS ---------- */
async function fetchMembers() {
    const { data, error } = await sb
        .from("profiles")
        .select("*")
        .order("joined_at", { ascending: true });

    if (error) {
        console.error(error);
        return [];
    }

    return data || [];
}

async function fetchStats() {
    const { data, error } = await sb
        .from("profile_stats")
        .select("*");

    if (error) {
        console.error(error);
        return;
    }

    profileStatsMap = {};
    (data || []).forEach(row => {
        profileStatsMap[row.id] = row;
    });
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

    // Sort: Owner first, then Admins, then everyone else by join date
    const roleOrder = { Owner: 0, Admin: 1 };
    const sorted = [...members].sort((a, b) => {
        const ra = roleOrder[a.role] ?? 2;
        const rb = roleOrder[b.role] ?? 2;
        if (ra !== rb) return ra - rb;
        return new Date(a.joined_at) - new Date(b.joined_at);
    });

    sorted.forEach(member => {
        const card = document.createElement("div");
        card.className = "member-card";

        const header = document.createElement("div");
        header.className = "member-card-header";

        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        avatar.textContent = getInitial(member.display_name || member.username);

        const nameWrap = document.createElement("div");

        const name = document.createElement("div");
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

/* ---------- PROFILE VIEW ---------- */
async function openProfile(userId) {
    viewingProfileId = userId;

    let profile = members.find(m => m.id === userId);

    if (!profile) {
        const { data } = await sb
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
        profile = data;
    }

    if (!profile) {
        alert("Profile not found.");
        return;
    }

    profileAvatar.textContent = getInitial(profile.display_name || profile.username);
    profileDisplayName.textContent = profile.display_name || profile.username || "Unknown";
    profileUsername.textContent = "@" + (profile.username || "unknown");
    renderBadges(profileBadges, profile);
    profileBio.textContent = profile.bio || (userId === currentUser.id ? "No bio yet. Edit your profile to add one!" : "No bio yet.");

    if (!profileStatsMap[userId]) {
        await fetchStats();
    }
    const stats = profileStatsMap[userId] || { post_count: 0 };

    profileStats.innerHTML = "";
    const postStat = document.createElement("div");
    postStat.className = "profile-stat";
    postStat.innerHTML = `<span class="profile-stat-value">${stats.post_count}</span><span class="profile-stat-label">Posts</span>`;
    profileStats.appendChild(postStat);

    const joinDate = new Date(profile.joined_at);
    profileMeta.textContent = "Joined " + joinDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

    // Show "Edit Profile" button only on own profile
    if (userId === currentUser.id) {
        editProfileBtn.classList.remove("hidden");
        editProfileBtn.dataset.profileId = profile.id;
    } else {
        editProfileBtn.classList.add("hidden");
    }

    showCommunitySection(profileView);
}

profileBackBtn.addEventListener("click", () => {
    setCommunitySubview(communitySubview === "admin" ? "admin" : "members");
});

profileEditBackBtn.addEventListener("click", () => openProfile(currentUser.id));

editProfileBtn.addEventListener("click", () => {
    editDisplayName.value = currentProfile.display_name || "";
    editUsername.value = currentProfile.username || "";
    editBio.value = currentProfile.bio || "";
    profileEditError.classList.add("hidden");

    showCommunitySection(profileEditView);
});

saveProfileBtn.addEventListener("click", async () => {
    const displayName = editDisplayName.value.trim();
    const username = editUsername.value.trim();
    const bio = editBio.value.trim();

    if (!displayName || !username) {
        profileEditError.textContent = "Display name and username are required.";
        profileEditError.classList.remove("hidden");
        return;
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";

    const { error } = await sb
        .from("profiles")
        .update({
            display_name: displayName,
            username,
            bio,
            updated_at: new Date().toISOString()
        })
        .eq("id", currentUser.id);

    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = "Save";

    if (error) {
        profileEditError.textContent = error.message;
        profileEditError.classList.remove("hidden");
        return;
    }

    currentProfile.display_name = displayName;
    currentProfile.username = username;
    currentProfile.bio = bio;

    await openProfile(currentUser.id);
});

/* ---------- ADMIN PANEL ---------- */
async function renderAdminPanel() {
    adminMembersList.innerHTML = "";

    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading members...";
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

        // Role select - only Owner can set Admin/Owner roles
        const roleSelect = document.createElement("select");
        const availableRoles = isOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r !== "Admin" && r !== "Owner");

        // Always include the member's current role even if restricted, so it displays correctly
        const rolesToShow = availableRoles.includes(member.role) ? availableRoles : [...availableRoles, member.role];

        rolesToShow.forEach(role => {
            const opt = document.createElement("option");
            opt.value = role;
            opt.textContent = role;
            if (role === member.role) opt.selected = true;
            roleSelect.appendChild(opt);
        });

        // Disable role select if not owner and member is currently Admin/Owner (can't demote)
        if (!isOwner && (member.role === "Admin" || member.role === "Owner")) {
            roleSelect.disabled = true;
        }
        // Can't change own role
        if (member.id === currentUser.id) {
            roleSelect.disabled = true;
        }

        roleSelect.addEventListener("change", async () => {
            const newRole = roleSelect.value;
            const { error } = await sb
                .from("profiles")
                .update({ role: newRole })
                .eq("id", member.id);

            if (error) {
                alert("Could not update role: " + error.message);
                roleSelect.value = member.role;
                return;
            }

            member.role = newRole;
            renderBadges(badges, member);
        });

        controls.appendChild(roleSelect);

        // Tag input for extra badges (Admin/Owner can manage these)
        const tagSelect = document.createElement("select");
        const blankOpt = document.createElement("option");
        blankOpt.value = "";
        blankOpt.textContent = "+ Add tag";
        tagSelect.appendChild(blankOpt);

        TAG_OPTIONS.forEach(tag => {
            if (!(member.extra_tags || []).includes(tag)) {
                const opt = document.createElement("option");
                opt.value = tag;
                opt.textContent = tag;
                tagSelect.appendChild(opt);
            }
        });

        tagSelect.addEventListener("change", async () => {
            if (!tagSelect.value) return;

            const newTags = [...(member.extra_tags || []), tagSelect.value];
            const { error } = await sb
                .from("profiles")
                .update({ extra_tags: newTags })
                .eq("id", member.id);

            if (error) {
                alert("Could not add tag: " + error.message);
                return;
            }

            member.extra_tags = newTags;
            renderBadges(badges, member);
            renderAdminPanel();
        });

        controls.appendChild(tagSelect);

        // Remove tag buttons
        (member.extra_tags || []).forEach(tag => {
            const removeBtn = document.createElement("button");
            removeBtn.className = "btn btn-sm";
            removeBtn.textContent = "Remove " + tag;
            removeBtn.addEventListener("click", async () => {
                const newTags = (member.extra_tags || []).filter(t => t !== tag);
                const { error } = await sb
                    .from("profiles")
                    .update({ extra_tags: newTags })
                    .eq("id", member.id);

                if (error) {
                    alert("Could not remove tag: " + error.message);
                    return;
                }

                member.extra_tags = newTags;
                renderBadges(badges, member);
                renderAdminPanel();
            });
            controls.appendChild(removeBtn);
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

/* ===== OPEN PAGE (VIEW) ===== */
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
