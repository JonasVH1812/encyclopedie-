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
    "prof website breker",
    "#1 homegirl"
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

// --- Tooltip elements ---
const tooltipEl = document.getElementById("tooltip");
let tooltipTimeout = null;

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
    const key = (role || "Member")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return "badge badge-" + key;
}

function renderBadges(container, profile) {
    container.innerHTML = "";
    const role = profile.role || "Member";
    const roleBadge = document.createElement("span");
    roleBadge.className = badgeClass(role);
    roleBadge.textContent = role;
    roleBadge.dataset.tooltip = role;
    container.appendChild(roleBadge);

    const tags = Array.isArray(profile.extra_tags) ? profile.extra_tags : [];
    tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = badgeClass(tag);
        span.textContent = tag;
        span.dataset.tooltip = BADGE_DESCRIPTIONS[tag] || tag;
        container.appendChild(span);
    });
}

function isAdminOrOwner(profile) {
    return profile && (profile.role === "Owner" || profile.role === "Admin");
}

function isOwnerUser(profile) {
    return profile && profile.role === "Owner";
}

function updateAccountUI() {
    if (!currentProfile) return;
    const initial = getInitial(currentProfile.display_name || currentProfile.username);

    // --- Top‑right account avatar ---
    if (accountAvatar) {
        if (currentProfile.avatar_url) {
            accountAvatar.style.backgroundImage = `url(${currentProfile.avatar_url})`;
            accountAvatar.style.backgroundSize = 'cover';
            accountAvatar.style.backgroundPosition = 'center';
            accountAvatar.textContent = '';   // remove initials
        } else {
            accountAvatar.style.backgroundImage = 'none';
            accountAvatar.style.background = 'linear-gradient(135deg, #60a5fa, #fbbf24)';
            accountAvatar.textContent = initial;
        }
    }

    // --- Dropdown avatar (same logic) ---
    if (accountDropdownAvatar) {
        if (currentProfile.avatar_url) {
            accountDropdownAvatar.style.backgroundImage = `url(${currentProfile.avatar_url})`;
            accountDropdownAvatar.style.backgroundSize = 'cover';
            accountDropdownAvatar.style.backgroundPosition = 'center';
            accountDropdownAvatar.textContent = '';
        } else {
            accountDropdownAvatar.style.backgroundImage = 'none';
            accountDropdownAvatar.style.background = 'linear-gradient(135deg, #60a5fa, #fbbf24)';
            accountDropdownAvatar.textContent = initial;
        }
    }

    // Name & role
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

// ============================================================
// NEW: Image compression helper (Canvas)
// ============================================================

async function compressImage(file, maxWidth = 1200, quality = 0.8, type = 'image/webp') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = (height / width) * maxWidth;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Compression failed'));
                }, type, quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================================
// NEW: Upload image to storage
// ============================================================

async function uploadImage(file, bucket, folder, fileName) {
    const path = `${folder}/${fileName}`;
    const { data, error } = await sb.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
}

// ============================================================
// NEW: Profile picture upload
// ============================================================

const avatarInput = document.getElementById('avatarInput');
const avatarPreviewImg = document.getElementById('avatarPreviewImg');
const avatarUploadStatus = document.getElementById('avatarUploadStatus');

avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    avatarUploadStatus.textContent = 'Compressing...';
    try {
        const compressedBlob = await compressImage(file, 800, 0.85);
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `avatar.${ext}`;
        const url = await uploadImage(
            compressedBlob,
            'profile-pictures',
            currentUser.id,
            fileName
        );
        avatarPreviewImg.src = url;
        avatarUploadStatus.textContent = '✓ Uploaded';
        // Save to profile
        const { error } = await sb.from('profiles').update({ avatar_url: url }).eq('id', currentUser.id);
        if (error) throw error;
        currentProfile.avatar_url = url;
        updateAccountUI();
        // Update profile view if open
        if (viewingProfileId === currentUser.id) {
            await openProfile(currentUser.id);
        }
    } catch (err) {
        avatarUploadStatus.textContent = '❌ Upload failed: ' + err.message;
        console.error(err);
    }
});

// ============================================================
// NEW: Post image upload (multiple)
// ============================================================

let postImageFiles = []; // store URLs of uploaded images

const postImageInput = document.getElementById('postImageInput');
const postImageDropArea = document.getElementById('postImageDropArea');
const postImagePreviews = document.getElementById('postImagePreviews');
const postImageUploadStatus = document.getElementById('postImageUploadStatus');

// Click to upload
postImageDropArea?.addEventListener('click', () => postImageInput.click());

// Drag & drop
postImageDropArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    postImageDropArea.classList.add('dragover');
});
postImageDropArea?.addEventListener('dragleave', () => {
    postImageDropArea.classList.remove('dragover');
});
postImageDropArea?.addEventListener('drop', async (e) => {
    e.preventDefault();
    postImageDropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) await handlePostImageFiles(files);
});

postImageInput?.addEventListener('change', async (e) => {
    if (e.target.files.length) await handlePostImageFiles(e.target.files);
});

async function handlePostImageFiles(fileList) {
    postImageUploadStatus.textContent = 'Compressing...';
    const files = Array.from(fileList);
    const total = files.length;
    let uploaded = 0;
    for (const file of files) {
        try {
            const compressed = await compressImage(file, 1200, 0.8);
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const url = await uploadImage(
                compressed,
                'community-posts',
                currentUser.id,
                fileName
            );
            // Store the URL and preview
            postImageFiles.push(url);
            addPostImagePreview(url);
            uploaded++;
            postImageUploadStatus.textContent = `Uploaded ${uploaded}/${total}`;
        } catch (err) {
            console.error('Image upload error:', err);
            postImageUploadStatus.textContent = `❌ Failed: ${err.message}`;
        }
    }
    if (uploaded === total) postImageUploadStatus.textContent = '✓ All images uploaded';
}

function addPostImagePreview(url) {
    const container = document.createElement('div');
    container.className = 'image-preview-item';
    const img = document.createElement('img');
    img.src = url;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = postImageFiles.indexOf(url);
        if (idx > -1) {
            postImageFiles.splice(idx, 1);
            container.remove();
        }
    });
    container.append(img, removeBtn);
    postImagePreviews.appendChild(container);
}

// When editing a post, load existing images
function loadPostImages(imageUrls) {
    postImagePreviews.innerHTML = '';
    postImageFiles = imageUrls ? [...imageUrls] : [];
    postImageFiles.forEach(url => addPostImagePreview(url));
}

// ============================================================
// NEW: Post editing permissions
// ============================================================

function canEditPost(post) {
    if (!currentUser) return false;
    if (post.user_id === currentUser.id) return true;
    const role = currentProfile?.role;
    return role === 'Admin' || role === 'Owner';
}

function canEditComment(comment) {
    if (!currentUser) return false;
    if (comment.user_id === currentUser.id) return true;
    const role = currentProfile?.role;
    return role === 'Admin' || role === 'Owner';
}

// ============================================================
// RENDER FEED (updated)
// ============================================================

async function renderFeed() {
    postsList.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "empty-state";
    loading.textContent = "Loading posts...";
    postsList.appendChild(loading);

    const { data, error } = await sb
        .from("community_posts")
        .select(`*, profiles!fk_community_posts_user_id(display_name, username, role, extra_tags)`)
        .order("pinned", { ascending: false })
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

// ============================================================
// BUILD POST CARD (updated with images, edit, tooltips)
// ============================================================

async function buildPostCard(post, container) {
    const card = document.createElement("div");
    card.className = "post-card" + (post.pinned ? " pinned" : "");

    const header = document.createElement("div");
    header.className = "post-card-header";

    if (post.pinned) {
        const pinBadge = document.createElement("span");
        pinBadge.className = "pin-badge";
        pinBadge.textContent = "📌 Pinned";
        header.appendChild(pinBadge);
    }

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

    // --- Images ---
    const imagesDiv = document.createElement("div");
    imagesDiv.className = "post-images";
    if (post.images && post.images.length) {
        post.images.forEach(url => {
            const img = document.createElement("img");
            img.src = url;
            img.alt = "Post image";
            img.loading = "lazy";
            imagesDiv.appendChild(img);
        });
    }

    const date = document.createElement("div");
    date.className = "post-card-date";
    date.textContent = formatDate(new Date(post.created_at).getTime());

    card.append(header, h3, contentP, imagesDiv, date);

    // --- Actions ---
    const actions = document.createElement("div");
    actions.className = "post-card-actions";

    // Edit button
    if (canEditPost(post)) {
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm";
        editBtn.textContent = "✎ Edit";
        editBtn.addEventListener("click", () => openPostEditorForEdit(post));
        actions.appendChild(editBtn);
    }

    // Pin (Admin/Owner)
    if (isAdminOrOwner(currentProfile)) {
        const pinBtn = document.createElement("button");
        pinBtn.className = "btn btn-sm btn-pin";
        pinBtn.textContent = post.pinned ? "Unpin" : "📌 Pin";
        pinBtn.addEventListener("click", async () => {
            pinBtn.disabled = true;
            await togglePin(post.id, !post.pinned);
        });
        actions.appendChild(pinBtn);
    }

    // Delete
    if (post.user_id === currentUser.id || isAdminOrOwner(currentProfile)) {
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-danger btn-sm";
        delBtn.textContent = "Delete";
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
    }

    if (actions.children.length) card.appendChild(actions);

    // --- Comments section ---
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

// ============================================================
// LOAD COMMENTS (updated with edit, delete, "edited" label)
// ============================================================

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

        if (comment.updated_at && new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime()) {
            const editedSpan = document.createElement("span");
            editedSpan.className = "comment-edited-label";
            editedSpan.textContent = "(edited)";
            dateSpan.appendChild(editedSpan);
        }

        commentHeader.append(avatar, authorLink, badges, dateSpan);

        const body = document.createElement("div");
        body.className = "comment-body";
        body.textContent = comment.content;

        el.append(commentHeader, body);

        // Actions
        const actions = document.createElement("div");
        actions.className = "post-card-actions";
        actions.style.marginTop = "8px";

        if (canEditComment(comment)) {
            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-sm";
            editBtn.textContent = "✎ Edit";
            editBtn.addEventListener("click", () => {
                const editForm = document.createElement("div");
                editForm.className = "comment-edit-form";
                const textarea = document.createElement("textarea");
                textarea.value = comment.content;
                textarea.rows = 3;
                const saveEditBtn = document.createElement("button");
                saveEditBtn.className = "btn btn-primary btn-sm";
                saveEditBtn.textContent = "Save";
                const cancelEditBtn = document.createElement("button");
                cancelEditBtn.className = "btn btn-sm";
                cancelEditBtn.textContent = "Cancel";
                const actionsRow = document.createElement("div");
                actionsRow.className = "editor-actions";
                actionsRow.append(saveEditBtn, cancelEditBtn);
                editForm.append(textarea, actionsRow);

                el.replaceChild(editForm, body);
                textarea.focus();

                saveEditBtn.addEventListener("click", async () => {
                    const newContent = textarea.value.trim();
                    if (!newContent) return;
                    saveEditBtn.disabled = true;
                    saveEditBtn.textContent = "Saving...";
                    const { error } = await sb.from("post_comments")
                        .update({ content: newContent, updated_at: new Date().toISOString() })
                        .eq("id", comment.id);
                    saveEditBtn.disabled = false;
                    saveEditBtn.textContent = "Save";
                    if (error) {
                        alert("Could not update comment: " + error.message);
                        return;
                    }
                    await loadComments(postId, listEl);
                });

                cancelEditBtn.addEventListener("click", () => {
                    loadComments(postId, listEl);
                });
            });
            actions.appendChild(editBtn);
        }

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
            actions.appendChild(delBtn);
        }

        if (actions.children.length) el.appendChild(actions);
        listEl.appendChild(el);
    });
}

// ============================================================
// TOGGLE PIN, DELETE POST
// ============================================================

async function togglePin(postId, pinned) {
    const { error } = await sb.from("community_posts").update({ pinned }).eq("id", postId);
    if (error) {
        alert("Could not update pin: " + error.message);
        return;
    }
    await renderFeed();
}

async function deletePost(postId) {
    await sb.from("community_posts").delete().eq("id", postId);
    renderFeed();
}

// ============================================================
// NEW POST / EDIT POST
// ============================================================

newPostBtn.addEventListener("click", () => {
    postTitleInput.value = "";
    postCategoryInput.value = "Discussion";
    postContentInput.value = "";
    postImageFiles = [];
    postImagePreviews.innerHTML = "";
    postImageUploadStatus.textContent = "";
    postEditor.dataset.editPostId = '';
    savePostBtn.textContent = 'Post';
    savePostBtn.onclick = createNewPost;
    document.querySelector('#postEditor h2').textContent = 'New Post';
    showCommunitySection(postEditor);
    postTitleInput.focus();
});

cancelPostBtn.addEventListener("click", () => {
    postEditor.dataset.editPostId = '';
    savePostBtn.textContent = 'Post';
    savePostBtn.onclick = createNewPost;
    showCommunitySection(communityFeed);
});

async function createNewPost() {
    const title = postTitleInput.value.trim();
    if (!title) return;

    savePostBtn.disabled = true;
    savePostBtn.textContent = "Posting...";

    try {
        const { error } = await sb.from("community_posts").insert({
            user_id: currentUser.id,
            title,
            category: postCategoryInput.value,
            content: postContentInput.value.trim(),
            images: postImageFiles.length ? postImageFiles : null
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
}

async function openPostEditorForEdit(post) {
    showCommunitySection(postEditor);
    document.querySelector('#postEditor h2').textContent = 'Edit Post';
    postTitleInput.value = post.title;
    postCategoryInput.value = post.category;
    postContentInput.value = post.content;
    loadPostImages(post.images || []);
    postEditor.dataset.editPostId = post.id;
    savePostBtn.textContent = 'Update Post';
    savePostBtn.onclick = async () => {
        await updatePost(post.id);
    };
}

async function updatePost(postId) {
    const title = postTitleInput.value.trim();
    if (!title) return;

    savePostBtn.disabled = true;
    savePostBtn.textContent = 'Updating...';

    try {
        const { error } = await sb.from('community_posts')
            .update({
                title,
                category: postCategoryInput.value,
                content: postContentInput.value.trim(),
                images: postImageFiles.length ? postImageFiles : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId);
        if (error) throw error;

        postEditor.dataset.editPostId = '';
        savePostBtn.textContent = 'Post';
        savePostBtn.onclick = createNewPost;
        showCommunitySection(communityFeed);
        await renderFeed();
    } catch (err) {
        alert("Could not update: " + (err.message || "unknown error"));
    } finally {
        savePostBtn.disabled = false;
        savePostBtn.textContent = 'Update Post';
    }
}

// Set default save button handler
savePostBtn.onclick = createNewPost;

// ============================================================
// MEMBERS & PROFILE (unchanged, but openProfile now shows avatar)
// ============================================================

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

async function openProfile(userId) {
    viewingProfileId = userId;

    const { data: profile, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error || !profile) { alert("Profile not found."); return; }
    if (!Array.isArray(profile.extra_tags)) profile.extra_tags = [];

    const idx = members.findIndex(m => m.id === userId);
    if (idx !== -1) members[idx] = profile;

    // Avatar: if available, show image; else initial
    const avatarContainer = profileAvatar;
    avatarContainer.innerHTML = '';
    if (profile.avatar_url) {
        const img = document.createElement('img');
        img.src = profile.avatar_url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        avatarContainer.appendChild(img);
    } else {
        avatarContainer.textContent = getInitial(profile.display_name || profile.username);
        avatarContainer.style.display = 'flex';
        avatarContainer.style.alignItems = 'center';
        avatarContainer.style.justifyContent = 'center';
        avatarContainer.style.fontSize = '2rem';
        avatarContainer.style.fontWeight = '700';
        avatarContainer.style.color = '#0a0f1e';
    }

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
    // Load avatar preview
    if (currentProfile.avatar_url) {
        document.getElementById('avatarPreviewImg').src = currentProfile.avatar_url;
    }
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

// ============================================================
// ADMIN PANEL (unchanged)
// ============================================================

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

    const tagSelect = document.createElement("select");
    const blankOpt = document.createElement("option");
    blankOpt.value = "";
    blankOpt.textContent = "+ Add tag";
    tagSelect.appendChild(blankOpt);

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

// ============================================================
// PAGE FUNCTIONS (unchanged)
// ============================================================

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

newPageBtn.addEventListener("click", () => openEditor(null));
editBtn.addEventListener("click", () => openEditor(currentPageId));
deleteBtn.addEventListener("click", deletePage);
closeBtn.addEventListener("click", () => { currentPageId = null; renderHome(); });
saveBtn.addEventListener("click", savePage);
cancelBtn.addEventListener("click", () => currentPageId ? openPage(currentPageId) : renderHome());

// ============================================================
// TOOLTIP SYSTEM
// ============================================================

function showTooltip(e, text) {
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }
    tooltipEl.textContent = text;
    const rect = e.target.getBoundingClientRect();
    tooltipEl.style.left = (rect.left + rect.width / 2) + 'px';
    tooltipEl.style.top = (rect.top - 10) + 'px';
    tooltipEl.style.transform = 'translateX(-50%) translateY(-100%)';
    tooltipEl.classList.add('visible');
    tooltipEl.classList.remove('hidden');
}

function hideTooltip() {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
        tooltipEl.classList.remove('visible');
        tooltipEl.classList.add('hidden');
        tooltipTimeout = null;
    }, 150);
}

document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
        const text = target.dataset.tooltip || target.textContent;
        showTooltip(e, text);
    }
});
document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
        hideTooltip();
    }
});

// ============================================================
// INIT
// ============================================================

setAuthMode("signin");
