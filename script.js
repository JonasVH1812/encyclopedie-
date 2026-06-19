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

// Voting state
let postSortOrder = "hot";
let userVotes = {};
let postVoteCounts = {};

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

const tooltipEl = document.getElementById("tooltip");
let tooltipTimeout = null;

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };

    toast.innerHTML =
        '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
        '<span class="toast-message">' + message + '</span>' +
        '<div class="toast-progress" style="animation-duration: ' + duration + 'ms"></div>';

    toastContainer.appendChild(toast);

    setTimeout(function() {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(function() { toast.remove(); }, 300);
    }, duration);
}

// ============================================================
// DELETE DIALOG SYSTEM
// ============================================================

function showDeleteDialog(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'delete-dialog-overlay';

    overlay.innerHTML =
        '<div class="delete-dialog">' +
            '<div class="delete-dialog-icon">🗑️</div>' +
            '<h3>' + title + '</h3>' +
            '<p>' + message + '</p>' +
            '<div class="delete-dialog-actions">' +
                '<button class="btn" id="deleteCancelBtn">Cancel</button>' +
                '<button class="btn btn-danger" id="deleteConfirmBtn">Delete</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    var close = function() {
        overlay.style.animation = 'fadeIn 0.2s ease reverse forwards';
        setTimeout(function() { overlay.remove(); }, 200);
    };

    overlay.querySelector('#deleteCancelBtn').addEventListener('click', close);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) close();
    });

    overlay.querySelector('#deleteConfirmBtn').addEventListener('click', async function() {
        var confirmBtn = overlay.querySelector('#deleteConfirmBtn');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';

        try {
            await onConfirm();
            close();
            showToast('Successfully deleted', 'success');
        } catch (err) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete';
            showToast(err.message || 'Failed to delete', 'error');
        }
    });
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
        + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function showOnly(section) {
    [hero, content, communityTab, pageView, editor].forEach(function(el) { el.classList.add("hidden"); });
    section.classList.remove("hidden");
}

function showCommunitySection(section) {
    [communityFeed, communityMembers, communityAdmin, profileView, profileEditView, postEditor].forEach(function(el) { el.classList.add("hidden"); });
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
    tags.forEach(function(tag) {
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
// ACCOUNT UI
// ============================================================

function updateAccountUI() {
    if (!currentProfile) return;
    const initial = getInitial(currentProfile.display_name || currentProfile.username);

    if (accountAvatar) {
        if (currentProfile.avatar_url) {
            accountAvatar.style.backgroundImage = 'url(' + currentProfile.avatar_url + ')';
            accountAvatar.style.backgroundSize = 'cover';
            accountAvatar.style.backgroundPosition = 'center';
            accountAvatar.textContent = '';
        } else {
            accountAvatar.style.backgroundImage = 'none';
            accountAvatar.style.background = 'linear-gradient(135deg, #60a5fa, #fbbf24)';
            accountAvatar.textContent = initial;
        }
    }

    if (accountDropdownAvatar) {
        if (currentProfile.avatar_url) {
            accountDropdownAvatar.style.backgroundImage = 'url(' + currentProfile.avatar_url + ')';
            accountDropdownAvatar.style.backgroundSize = 'cover';
            accountDropdownAvatar.style.backgroundPosition = 'center';
            accountDropdownAvatar.textContent = '';
        } else {
            accountDropdownAvatar.style.backgroundImage = 'none';
            accountDropdownAvatar.style.background = 'linear-gradient(135deg, #60a5fa, #fbbf24)';
            accountDropdownAvatar.textContent = initial;
        }
    }

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
        dropdownLogoutBtn.addEventListener("click", function() {
            closeDropdown();
            logoutBtn.click();
        });
    }
    if (dropdownNewPageBtn) {
        dropdownNewPageBtn.addEventListener("click", function() {
            closeDropdown();
            newPageBtn.click();
        });
    }
    if (dropdownProfileBtn) {
        dropdownProfileBtn.addEventListener("click", function() {
            closeDropdown();
            var communityLink = document.querySelector('.navbar a[data-community]') ||
                [...document.querySelectorAll('.navbar a')].find(function(a) { return a.textContent.trim() === 'Community'; });
            if (communityLink) communityLink.click();
            setTimeout(function() {
                if (typeof openProfile === 'function' && currentUser) {
                    openProfile(currentUser.id);
                }
            }, 300);
        });
    }
    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener("click", async function() {
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
                username: username,
                bio: bio,
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
            if (viewMode === 'my' && typeof renderHome === 'function') renderHome();
            pageTitle.textContent = 'Encyclopedie van ' + (currentProfile.display_name || currentProfile.username);
            welcomeHeading.textContent = 'Welcome, ' + (currentProfile.display_name || currentProfile.username);
            if (settingsError) settingsError.classList.add("hidden");
            settingsSaveBtn.textContent = "✓ Saved!";
            setTimeout(function() { if (settingsSaveBtn) settingsSaveBtn.textContent = "Save Changes"; }, 1500);
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

authSwitchLink.addEventListener("click", function(e) {
    e.preventDefault();
    setAuthMode(authMode === "signin" ? "signup" : "signin");
});

authSubmitBtn.addEventListener("click", async function() {
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
                email: email,
                password: password,
                options: { data: { name: name || email.split("@")[0] } }
            });
            if (error) throw error;
            if (data.user && !data.session) {
                authError.textContent = "Account created! Check your email.";
                authError.classList.remove("hidden");
                setAuthMode("signin");
            }
        } else {
            const { error } = await sb.auth.signInWithPassword({ email: email, password: password });
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

logoutBtn.addEventListener("click", async function() { await sb.auth.signOut(); });

sb.auth.onAuthStateChange(function(event, session) {
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
    pageTitle.textContent = 'Encyclopedie van ' + name;
    welcomeHeading.textContent = 'Welcome, ' + name;

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
        const { data: newData, error: insertErr } = await sb.from("profiles").insert({
            id: currentUser.id,
            username: currentUser.email.split("@")[0],
            display_name: getDisplayName(currentUser),
            role: "Member",
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
    pages = (data || []).map(function(row) {
        return {
            id: row.id,
            title: row.title,
            category: row.category,
            content: row.content,
            created: new Date(row.created_at).getTime(),
            updated: new Date(row.updated_at).getTime()
        };
    });
}

// ============================================================
// NAVBAR
// ============================================================

function renderNavbar() {
    navbar.innerHTML = "";

    function addLink(text, isCommunity, cat) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = text;
        if (isCommunity) a.setAttribute("data-community", "true");
        if (viewMode === "my" && cat === activeCategory) a.classList.add("active");
        if (viewMode === "community" && isCommunity) a.classList.add("active");
        a.addEventListener("click", async function(e) {
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
    }

    addLink("All", false, "All");
    addLink("Community", true);
    CATEGORIES.forEach(function(cat) {
        if (cat !== "All") addLink(cat, false, cat);
    });
}

// ============================================================
// HOME / PAGES
// ============================================================

function renderHome() {
    showOnly(content);
    hero.classList.remove("hidden");
    content.innerHTML = "";

    const filtered = activeCategory === "All" ? pages : pages.filter(function(p) { return p.category === activeCategory; });
    const sorted   = [...filtered].sort(function(a, b) { return b.updated - a.updated; });

    if (sorted.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = activeCategory === "All"
            ? "No pages yet. Click '+ New Page'."
            : 'No pages in "' + activeCategory + '" yet.';
        content.appendChild(empty);
        return;
    }

    sorted.forEach(function(p) {
        const article  = document.createElement("article");
        const cat      = document.createElement("span"); cat.className = "card-category"; cat.textContent = p.category;
        const h3       = document.createElement("h3"); h3.textContent = p.title;
        const snippet  = document.createElement("p"); snippet.className = "card-snippet"; snippet.textContent = p.content;
        const date     = document.createElement("div"); date.className = "card-date"; date.textContent = "Updated " + formatDate(p.updated);

        article.append(cat, h3, snippet, date);
        article.addEventListener("click", function() { openPage(p.id); });
        content.appendChild(article);
    });
}

// ============================================================
// PAGE VIEW / EDIT / DELETE
// ============================================================

function openPage(id) {
    currentPageId = id;
    const page = pages.find(function(p) { return p.id === id; });
    if (!page) return;

    showOnly(pageView);
    hero.classList.add("hidden");
    pageTitleDisplay.textContent = page.title;
    pageMeta.textContent = page.category + " · Created " + formatDate(page.created) + " · Updated " + formatDate(page.updated);
    pageContentDisplay.textContent = page.content;
}

editBtn.addEventListener("click", function() {
    const page = pages.find(function(p) { return p.id === currentPageId; });
    if (!page) return;

    showOnly(editor);
    hero.classList.add("hidden");
    editorHeading.textContent = "Edit Page";
    pageTitleInput.value = page.title;
    pageCategoryInput.value = page.category;
    pageContentInput.value = page.content;
    saveBtn.onclick = saveExistingPage;
});

deleteBtn.addEventListener("click", function() {
    const page = pages.find(function(p) { return p.id === currentPageId; });
    if (!page) return;

    showDeleteDialog(
        "Delete Page",
        'Are you sure you want to delete "' + page.title + '"? This action cannot be undone.',
        async function() {
            await sb.from("pages").delete().eq("id", currentPageId);
            pages = pages.filter(function(p) { return p.id !== currentPageId; });
            currentPageId = null;
            renderHome();
        }
    );
});

closeBtn.addEventListener("click", function() {
    currentPageId = null;
    renderHome();
});

newPageBtn.addEventListener("click", function() {
    showOnly(editor);
    hero.classList.add("hidden");
    editorHeading.textContent = "New Page";
    pageTitleInput.value = "";
    pageCategoryInput.value = "Ideas";
    pageContentInput.value = "";
    saveBtn.onclick = saveNewPage;
    pageTitleInput.focus();
});

cancelBtn.addEventListener("click", function() {
    currentPageId = null;
    renderHome();
});

async function saveNewPage() {
    const title = pageTitleInput.value.trim();
    if (!title) return;

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        const { error } = await sb.from("pages").insert({
            user_id: currentUser.id,
            title: title,
            category: pageCategoryInput.value,
            content: pageContentInput.value.trim()
        });
        if (error) throw error;

        await fetchPages();
        currentPageId = null;
        renderHome();
        showToast("Page created!", "success");
    } catch (err) {
        showToast("Could not save: " + (err.message || "unknown error"), "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
    }
}

async function saveExistingPage() {
    const title = pageTitleInput.value.trim();
    if (!title) return;

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        const { error } = await sb.from("pages").update({
            title: title,
            category: pageCategoryInput.value,
            content: pageContentInput.value.trim(),
            updated_at: new Date().toISOString()
        }).eq("id", currentPageId);
        if (error) throw error;

        await fetchPages();
        openPage(currentPageId);
        showToast("Page updated!", "success");
    } catch (err) {
        showToast("Could not save: " + (err.message || "unknown error"), "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
    }
}

// ============================================================
// COMMUNITY
// ============================================================

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
    document.querySelectorAll(".subnav-btn").forEach(function(btn) {
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

document.querySelectorAll(".subnav-btn").forEach(function(btn) {
    btn.addEventListener("click", function() { setCommunitySubview(btn.dataset.subview); });
});

// ============================================================
// IMAGE COMPRESSION
// ============================================================

async function compressImage(file, maxWidth, quality, type) {
    maxWidth = maxWidth || 1200;
    quality = quality || 0.8;
    type = type || 'image/webp';
    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
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
                canvas.toBlob(function(blob) {
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

async function uploadImage(file, bucket, folder, fileName) {
    const path = folder + '/' + fileName;
    const { data, error } = await sb.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
}

// ============================================================
// AVATAR UPLOAD
// ============================================================

var avatarInput = document.getElementById('avatarInput');
var avatarPreviewImg = document.getElementById('avatarPreviewImg');
var avatarUploadStatus = document.getElementById('avatarUploadStatus');

avatarInput?.addEventListener('change', async function(e) {
    var file = e.target.files[0];
    if (!file) return;

    avatarUploadStatus.textContent = 'Compressing...';
    try {
        var compressedBlob = await compressImage(file, 800, 0.85);
        var ext = file.name.split('.').pop() || 'jpg';
        var fileName = 'avatar.' + ext;
        var url = await uploadImage(compressedBlob, 'profile-pictures', currentUser.id, fileName);
        avatarPreviewImg.src = url;
        avatarUploadStatus.textContent = '✓ Uploaded';
        var { error } = await sb.from('profiles').update({ avatar_url: url }).eq('id', currentUser.id);
        if (error) throw error;
        currentProfile.avatar_url = url;
        updateAccountUI();
        if (viewingProfileId === currentUser.id) {
            await openProfile(currentUser.id);
        }
    } catch (err) {
        avatarUploadStatus.textContent = '❌ Upload failed: ' + err.message;
        console.error(err);
    }
});

// ============================================================
// POST IMAGE UPLOAD
// ============================================================

var postImageFiles = [];

var postImageInput = document.getElementById('postImageInput');
var postImageDropArea = document.getElementById('postImageDropArea');
var postImagePreviews = document.getElementById('postImagePreviews');
var postImageUploadStatus = document.getElementById('postImageUploadStatus');

postImageDropArea?.addEventListener('click', function() { postImageInput.click(); });

postImageDropArea?.addEventListener('dragover', function(e) {
    e.preventDefault();
    postImageDropArea.classList.add('dragover');
});
postImageDropArea?.addEventListener('dragleave', function() {
    postImageDropArea.classList.remove('dragover');
});
postImageDropArea?.addEventListener('drop', async function(e) {
    e.preventDefault();
    postImageDropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) await handlePostImageFiles(e.dataTransfer.files);
});

postImageInput?.addEventListener('change', async function(e) {
    if (e.target.files.length) await handlePostImageFiles(e.target.files);
});

async function handlePostImageFiles(fileList) {
    postImageUploadStatus.textContent = 'Compressing...';
    var files = Array.from(fileList);
    var total = files.length;
    var uploaded = 0;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        try {
            var compressed = await compressImage(file, 1200, 0.8);
            var ext = file.name.split('.').pop() || 'jpg';
            var fileName = Date.now() + '-' + Math.random().toString(36).substring(7) + '.' + ext;
            var url = await uploadImage(compressed, 'community-posts', currentUser.id, fileName);
            postImageFiles.push(url);
            addPostImagePreview(url);
            uploaded++;
            postImageUploadStatus.textContent = 'Uploaded ' + uploaded + '/' + total;
        } catch (err) {
            console.error('Image upload error:', err);
            postImageUploadStatus.textContent = '❌ Failed: ' + err.message;
        }
    }
    if (uploaded === total) postImageUploadStatus.textContent = '✓ All images uploaded';
}

function addPostImagePreview(url) {
    var container = document.createElement('div');
    container.className = 'image-preview-item';
    var img = document.createElement('img');
    img.src = url;
    var removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = postImageFiles.indexOf(url);
        if (idx > -1) {
            postImageFiles.splice(idx, 1);
            container.remove();
        }
    });
    container.append(img, removeBtn);
    postImagePreviews.appendChild(container);
}

function loadPostImages(imageUrls) {
    postImagePreviews.innerHTML = '';
    postImageFiles = imageUrls ? imageUrls.slice() : [];
    postImageFiles.forEach(function(url) { addPostImagePreview(url); });
}

// ============================================================
// VOTING SYSTEM
// ============================================================

async function fetchUserVotes(postIds) {
    if (!currentUser || !postIds.length) return;

    var { data, error } = await sb
        .from('post_votes')
        .select('post_id, vote_type')
        .eq('user_id', currentUser.id)
        .in('post_id', postIds);

    if (error) {
        console.error('Error fetching user votes:', error);
        return;
    }

    userVotes = {};
    (data || []).forEach(function(v) {
        userVotes[v.post_id] = v.vote_type;
    });
}

async function fetchVoteCounts(postIds) {
    if (!postIds.length) return;

    var { data, error } = await sb
        .from('post_votes')
        .select('post_id, vote_type');

    if (error) {
        console.error('Error fetching vote counts:', error);
        return;
    }

    postVoteCounts = {};
    postIds.forEach(function(id) {
        postVoteCounts[id] = { upvotes: 0, downvotes: 0, net: 0 };
    });

    (data || []).forEach(function(v) {
        if (postVoteCounts[v.post_id]) {
            if (v.vote_type === 1) {
                postVoteCounts[v.post_id].upvotes++;
                postVoteCounts[v.post_id].net++;
            } else {
                postVoteCounts[v.post_id].downvotes++;
                postVoteCounts[v.post_id].net--;
            }
        }
    });
}

async function handleVote(postId, voteType) {
    if (!currentUser) return;

    var currentVote = userVotes[postId];
    var newVoteType = voteType;

    if (currentVote === voteType) {
        newVoteType = 0;
    }

    try {
        if (currentVote) {
            var { error } = await sb
                .from('post_votes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            if (postVoteCounts[postId]) {
                if (currentVote === 1) postVoteCounts[postId].upvotes--;
                else postVoteCounts[postId].downvotes--;
                postVoteCounts[postId].net = postVoteCounts[postId].upvotes - postVoteCounts[postId].downvotes;
            }
            delete userVotes[postId];
        }

        if (newVoteType !== 0) {
            var { error } = await sb
                .from('post_votes')
                .insert({
                    post_id: postId,
                    user_id: currentUser.id,
                    vote_type: newVoteType
                });

            if (error) throw error;

            if (!postVoteCounts[postId]) {
                postVoteCounts[postId] = { upvotes: 0, downvotes: 0, net: 0 };
            }
            if (newVoteType === 1) postVoteCounts[postId].upvotes++;
            else postVoteCounts[postId].downvotes++;
            postVoteCounts[postId].net = postVoteCounts[postId].upvotes - postVoteCounts[postId].downvotes;
            userVotes[postId] = newVoteType;
        }

        updateVoteUI(postId);

    } catch (err) {
        console.error('Vote error:', err);
        showToast('Failed to vote', 'error');
    }
}

function updateVoteUI(postId) {
    var card = document.querySelector('[data-post-id="' + postId + '"]');
    if (!card) return;

    var upvoteBtn = card.querySelector('.vote-btn.upvote');
    var downvoteBtn = card.querySelector('.vote-btn.downvote');
    var voteCountEl = card.querySelector('.vote-count');

    if (upvoteBtn) {
        upvoteBtn.classList.toggle('active', userVotes[postId] === 1);
    }
    if (downvoteBtn) {
        downvoteBtn.classList.toggle('active', userVotes[postId] === -1);
    }
    if (voteCountEl && postVoteCounts[postId]) {
        var net = postVoteCounts[postId].net;
        voteCountEl.textContent = net > 0 ? '+' + net : String(net);
        voteCountEl.className = 'vote-count ' + (net > 0 ? 'positive' : net < 0 ? 'negative' : 'zero');

        // Bump animation
        voteCountEl.classList.add('bump');
        setTimeout(function() { voteCountEl.classList.remove('bump'); }, 150);
    }
}

// ============================================================
// SORTING
// ============================================================

function calculateHotScore(post) {
    var now = Date.now();
    var postTime = new Date(post.created_at).getTime();
    var ageHours = (now - postTime) / (1000 * 60 * 60);
    var votes = postVoteCounts[post.id]?.net || 0;

    var sign = votes > 0 ? 1 : votes < 0 ? -1 : 0;
    var magnitude = Math.abs(votes);
    var order = Math.log10(Math.max(magnitude, 1));
    var seconds = ageHours * 3600;

    return sign * order + seconds / 45000;
}

function sortAndRenderPosts() {
    var postsList = document.getElementById('postsList');
    if (!postsList) return;

    var sorted = posts.slice();

    switch (postSortOrder) {
        case 'hot':
            sorted.sort(function(a, b) {
                return calculateHotScore(b) - calculateHotScore(a);
            });
            break;
        case 'newest':
            sorted.sort(function(a, b) {
                return new Date(b.created_at) - new Date(a.created_at);
            });
            break;
        case 'top':
            sorted.sort(function(a, b) {
                var votesA = postVoteCounts[a.id]?.net || 0;
                var votesB = postVoteCounts[b.id]?.net || 0;
                return votesB - votesA;
            });
            break;
    }

    var pinned = sorted.filter(function(p) { return p.pinned; });
    var unpinned = sorted.filter(function(p) { return !p.pinned; });
    sorted = pinned.concat(unpinned);

    postsList.innerHTML = '';
    sorted.forEach(function(post) { buildPostCard(post, postsList); });
}

function updateFeedToolbar() {
    var toolbar = document.getElementById('feedToolbar');
    if (!toolbar) return;

    toolbar.innerHTML =
        '<h2 class="feed-title">Community Feed</h2>' +
        '<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">' +
            '<div class="sort-container">' +
                '<span class="sort-label">Sort by:</span>' +
                '<select class="sort-dropdown" id="postSortDropdown">' +
                    '<option value="hot"' + (postSortOrder === 'hot' ? ' selected' : '') + '>🔥 Hot</option>' +
                    '<option value="newest"' + (postSortOrder === 'newest' ? ' selected' : '') + '>🕐 Newest</option>' +
                    '<option value="top"' + (postSortOrder === 'top' ? ' selected' : '') + '>📊 Top</option>' +
                '</select>' +
            '</div>' +
            '<button class="btn btn-primary" id="newPostBtn">+ New Post</button>' +
        '</div>';

    document.getElementById('newPostBtn')?.addEventListener('click', function() {
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

    document.getElementById('postSortDropdown')?.addEventListener('change', function(e) {
        postSortOrder = e.target.value;
        sortAndRenderPosts();
    });
}

// ============================================================
// RENDER FEED
// ============================================================

async function renderFeed() {
    postsList.innerHTML = "";

    for (var i = 0; i < 3; i++) {
        var skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML =
            '<div class="skeleton-votes"></div>' +
            '<div class="skeleton-content">' +
                '<div class="skeleton-line short"></div>' +
                '<div class="skeleton-line title"></div>' +
                '<div class="skeleton-line long"></div>' +
                '<div class="skeleton-line medium"></div>' +
            '</div>';
        postsList.appendChild(skeleton);
    }

    updateFeedToolbar();

    var { data, error } = await sb
        .from("community_posts")
        .select('*, profiles!fk_community_posts_user_id(display_name, username, role, extra_tags, avatar_url)')
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        postsList.innerHTML = "";
        var errDiv = document.createElement("div");
        errDiv.className = "empty-state";
        errDiv.textContent = "Could not load community posts.";
        postsList.appendChild(errDiv);
        return;
    }

    posts = data || [];

    if (posts.length === 0) {
        postsList.innerHTML = "";
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No posts yet. Be the first!";
        postsList.appendChild(empty);
        return;
    }

    var postIds = posts.map(function(p) { return p.id; });
    await Promise.all([
        fetchUserVotes(postIds),
        fetchVoteCounts(postIds)
    ]);

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
    var userVote = userVotes[post.id] || 0;
    var netVotes = votes.net;

    // Vote section
    var votesSection = document.createElement("div");
    votesSection.className = "post-card-votes";

    var voteContainer = document.createElement("div");
    voteContainer.className = "vote-container";

    var upvoteBtn = document.createElement("button");
    upvoteBtn.className = "vote-btn upvote" + (userVote === 1 ? " active" : "");
    upvoteBtn.innerHTML = "↑";
    upvoteBtn.title = "Upvote";
    upvoteBtn.addEventListener("click", function() { handleVote(post.id, 1); });

    var voteCount = document.createElement("div");
    voteCount.className = "vote-count " + (netVotes > 0 ? "positive" : netVotes < 0 ? "negative" : "zero");
    voteCount.textContent = netVotes > 0 ? "+" + netVotes : String(netVotes);

    var downvoteBtn = document.createElement("button");
    downvoteBtn.className = "vote-btn downvote" + (userVote === -1 ? " active" : "");
    downvoteBtn.innerHTML = "↓";
    downvoteBtn.title = "Downvote";
    downvoteBtn.addEventListener("click", function() { handleVote(post.id, -1); });

    voteContainer.append(upvoteBtn, voteCount, downvoteBtn);
    votesSection.appendChild(voteContainer);

    // Content wrapper
    var contentWrapper = document.createElement("div");
    contentWrapper.className = "post-card-content-wrapper";

    // Meta row
    var metaRow = document.createElement("div");
    metaRow.className = "post-card-meta";

    var authorInfo = document.createElement("div");
    authorInfo.className = "post-card-author-info";

    var miniAvatar = document.createElement("div");
    miniAvatar.className = "post-card-mini-avatar";
    if (post.profiles?.avatar_url) {
        miniAvatar.style.backgroundImage = 'url(' + post.profiles.avatar_url + ')';
        miniAvatar.textContent = '';
    } else {
        miniAvatar.textContent = getInitial(post.profiles?.display_name || post.profiles?.username);
    }

    var authorLink = document.createElement("a");
    authorLink.className = "post-card-author-name";
    authorLink.href = "#";
    authorLink.textContent = post.profiles?.display_name || "Unknown";
    authorLink.addEventListener("click", function(e) { e.preventDefault(); openProfile(post.user_id); });

    authorInfo.append(miniAvatar, authorLink);
    metaRow.appendChild(authorInfo);

    if (post.profiles) {
        var badgeWrap = document.createElement("span");
        badgeWrap.className = "member-badges";
        renderBadges(badgeWrap, post.profiles);
        metaRow.appendChild(badgeWrap);
    }

    var catSpan = document.createElement("span");
    catSpan.className = "post-card-category";
    catSpan.textContent = post.category;
    metaRow.appendChild(catSpan);

    // Title
    var h3 = document.createElement("h3");
    h3.textContent = post.title;

    // Content
    var contentP = document.createElement("p");
    contentP.className = "post-card-text";
    contentP.textContent = post.content;

    // Images
    var imagesDiv = document.createElement("div");
    imagesDiv.className = "post-card-images";
    if (post.images && post.images.length) {
        post.images.forEach(function(url) {
            var img = document.createElement("img");
            img.src = url;
            img.alt = "Post image";
            img.loading = "lazy";
            imagesDiv.appendChild(img);
        });
    }

    // Footer
    var footer = document.createElement("div");
    footer.className = "post-card-footer";

    var timestamp = document.createElement("span");
    timestamp.className = "post-card-timestamp";
    timestamp.textContent = formatDate(new Date(post.created_at).getTime());

    var actions = document.createElement("div");
    actions.className = "post-card-actions";

    if (post.pinned) {
        var pinBadge = document.createElement("span");
        pinBadge.className = "pin-badge";
        pinBadge.textContent = "📌 Pinned";
        actions.appendChild(pinBadge);
    }

    if (canEditPost(post)) {
        var editPostBtn = document.createElement("button");
        editPostBtn.className = "btn btn-sm";
        editPostBtn.textContent = "✎ Edit";
        editPostBtn.addEventListener("click", function() { openPostEditorForEdit(post); });
        actions.appendChild(editPostBtn);
    }

    if (isAdminOrOwner(currentProfile)) {
        var pinBtn = document.createElement("button");
        pinBtn.className = "btn btn-sm btn-pin";
        pinBtn.textContent = post.pinned ? "Unpin" : "📌 Pin";
        pinBtn.addEventListener("click", async function() {
            pinBtn.disabled = true;
            await togglePin(post.id, !post.pinned);
        });
        actions.appendChild(pinBtn);
    }

    if (post.user_id === currentUser.id || isAdminOrOwner(currentProfile)) {
        var delBtn = document.createElement("button");
        delBtn.className = "btn btn-danger btn-sm";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function() {
            showDeleteDialog(
                "Delete Post",
                'Are you sure you want to delete "' + post.title + '"? This action cannot be undone.',
                async function() { await deletePost(post.id); }
            );
        });
        actions.appendChild(delBtn);
    }

    footer.append(timestamp, actions);

    contentWrapper.append(metaRow, h3, contentP, imagesDiv, footer);

    // Comments section
    var commentsSection = document.createElement("div");
    commentsSection.className = "comments-section";
    commentsSection.style.margin = "0 24px 20px 24
