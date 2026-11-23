
// ใช้ Publishable key สำหรับหน้าเว็บเท่านั้น ห้ามนำ Secret/service_role key มาใส่
const SUPABASE_URL = "https://pnwekgkfutzjiwyzpjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_j2NxMLThJzH9dx1d7EfWfw_6uKfiD30";
let supabaseClient = null;
let currentUser = null;

const modes = ["To-Do List", "Disaster", "Settings"];
let currentModeIdx = 0;
const translations = {
    th: {
        navTodo: "รายการงาน", navDisaster: "ภัยพิบัติ", navSettings: "ตั้งค่า",
        settingsTitle: "ตั้งค่า", settingsSubtitle: "จัดการบัญชีและปรับแต่งประสบการณ์ใช้งาน Yuno",
        accountTitle: "บัญชีผู้ใช้", accountName: "บัญชี Yuno", signedIn: "เข้าสู่ระบบแล้ว",
        signedOut: "ยังไม่ได้เข้าสู่ระบบ", signOut: "ออกจากระบบ",
        accountHint: "เข้าสู่ระบบผ่านหน้า To-Do เพื่อซิงก์รายการงานกับบัญชีของคุณ",
        appearanceTitle: "รูปลักษณ์", themeLabel: "ธีม", themeDescription: "เลือกธีมที่เหมาะกับคุณ",
        themeSystem: "ตามอุปกรณ์", themeLight: "สว่าง", themeDark: "มืด",
        languageTitle: "ภาษา", languageLabel: "ภาษาของแอป", languageDescription: "เลือกภาษาที่ใช้แสดงผล",
        aboutTitle: "เกี่ยวกับ Yuno", versionLabel: "เวอร์ชันแอป",
        aboutDescription: "ข้อมูลเวอร์ชันของแอปพลิเคชัน",
        earthquakeDescription: "ระบบดึงข้อมูลรายงานแผ่นดินไหวล่าสุดแบบเรียลไทม์",
        earthquakeRefresh: "🌐 อัปเดตข้อมูลแผ่นดินไหวล่าสุด",
        loginTitle: "เข้าสู่ระบบ Yuno",
        loginDescription: "สมัครสมาชิกหรือเข้าสู่ระบบเพื่อบันทึกรายการ To-Do ไว้ในบัญชีของคุณ",
        emailPlaceholder: "อีเมล", passwordPlaceholder: "รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)",
        loginButton: "เข้าสู่ระบบ", signupButton: "สมัครสมาชิก",
        taskPlaceholder: "พิมพ์รายการสิ่งที่ต้องทำ... (กด Enter หรือปุ่ม ^ เพื่อเพิ่ม)",
        addTaskTitle: "เพิ่มรายการ", deleteTaskTitle: "ลบรายการ"
    },
    en: {
        navTodo: "To-Do", navDisaster: "Disaster", navSettings: "Settings",
        settingsTitle: "Settings", settingsSubtitle: "Manage your account and personalize your Yuno experience.",
        accountTitle: "Account", accountName: "Yuno Account", signedIn: "Signed in",
        signedOut: "Signed out", signOut: "Sign out",
        accountHint: "Sign in from the To-Do page to sync tasks with your account.",
        appearanceTitle: "Appearance", themeLabel: "Theme", themeDescription: "Choose the look that works for you.",
        themeSystem: "System", themeLight: "Light", themeDark: "Dark",
        languageTitle: "Language", languageLabel: "App language", languageDescription: "Choose your display language.",
        aboutTitle: "About Yuno", versionLabel: "App version",
        aboutDescription: "Application version information.",
        earthquakeDescription: "Get the latest earthquake reports in real time.",
        earthquakeRefresh: "🌐 Refresh latest earthquake data",
        loginTitle: "Sign in to Yuno",
        loginDescription: "Create an account or sign in to save your To-Do list.",
        emailPlaceholder: "Email", passwordPlaceholder: "Password (at least 6 characters)",
        loginButton: "Sign in", signupButton: "Create account",
        taskPlaceholder: "Type a task... (Press Enter or ^ to add)",
        addTaskTitle: "Add task", deleteTaskTitle: "Delete task"
    }
};

function applyLanguage(language) {
    const lang = language === "en" ? "en" : "th";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.dataset.i18nTitle;
        if (translations[lang][key]) el.title = translations[lang][key];
    });
    const email = document.getElementById("auth-email");
    const password = document.getElementById("auth-password");
    if (email) email.placeholder = translations[lang].emailPlaceholder;
    if (password) password.placeholder = translations[lang].passwordPlaceholder;
    const addButton = document.querySelector(".input-group button");
    if (addButton) addButton.title = translations[lang].addTaskTitle;
    document.querySelectorAll(".del-btn").forEach(btn => btn.title = translations[lang].deleteTaskTitle);
    updateAccountUI();
}

function saveLanguage(language) {
    localStorage.setItem("yuno-language", language);
    applyLanguage(language);
}

function saveTheme(theme) {
    localStorage.setItem("yuno-theme", theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    const selected = ["system", "light", "dark"].includes(theme) ? theme : "system";
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const activeTheme = selected === "system" ? (prefersLight ? "light" : "dark") : selected;
    document.body.dataset.theme = activeTheme;
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) themeSelect.value = selected;
}

function initializePreferences() {
    const language = localStorage.getItem("yuno-language") || "th";
    const theme = localStorage.getItem("yuno-theme") || "system";
    const languageSelect = document.getElementById("language-select");
    if (languageSelect) languageSelect.value = language;
    applyLanguage(language);
    applyTheme(theme);
}

function updateAccountUI() {
    const email = document.getElementById("account-email");
    const status = document.getElementById("account-status");
    const signout = document.getElementById("settings-signout-btn");
    const hint = document.getElementById("account-hint");
    if (!email || !status || !signout || !hint) return;
    const lang = localStorage.getItem("yuno-language") || "th";
    const t = translations[lang] || translations.th;
    email.textContent = currentUser ? currentUser.email : (lang === "en" ? "Not signed in" : "ยังไม่ได้เข้าสู่ระบบ");
    status.textContent = currentUser ? t.signedIn : t.signedOut;
    status.classList.toggle("signed-out", !currentUser);
    signout.style.display = currentUser ? "block" : "none";
    hint.style.display = currentUser ? "none" : "block";
}
let tasks = []; // รายการที่โหลดจากฐานข้อมูลของผู้ใช้ปัจจุบัน
let praiseTimer = null;

const IMG_IDLE = "static/idle.png";
const IMG_PRAISE = "static/praise.png";
const IMG_ALERT = "static/alert.png";

// เชื่อมต่อ Supabase และตรวจสอบว่ามี session จากครั้งก่อนหรือไม่
async function initializeSupabase() {
    if (!window.supabase) {
        document.getElementById("auth-panel").style.display = "block";
        showAuthMessage("โหลด Supabase ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรช");
        return;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        document.getElementById("auth-panel").style.display = "block";
        showAuthMessage("ตรวจสอบสถานะเข้าสู่ระบบไม่สำเร็จ: " + error.message);
        return;
    }
    await handleAuthSession(data.session);
    // ฟังการเปลี่ยนแปลง Login, Logout และ session หมดอายุ
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        setTimeout(() => handleAuthSession(session), 0);
    });
}

// ตั้งค่าหน้าจอตามบัญชีที่ Login และโหลดงานของบัญชีนั้น
async function handleAuthSession(session) {
    currentUser = session ? session.user : null;
    updateAuthUI();
    updateAccountUI();
    if (currentUser) await loadTasks();
    else { tasks = []; renderTasks(); }
}

// เลือกแสดงกล่อง Login หรือรายการ To-Do ตามสถานะผู้ใช้
function updateAuthUI() {
    updateModeUI();
    updateAccountUI();
}

// แสดงข้อความแจ้งสถานะและข้อผิดพลาดในกล่อง Login
function showAuthMessage(message) {
    document.getElementById("auth-message").textContent = message;
}

// สมัครสมาชิกใหม่ด้วยอีเมลและรหัสผ่าน
async function signUp() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    if (!email || !password) return showAuthMessage("กรุณากรอกอีเมลและรหัสผ่านก่อนค่ะ");
    if (password.length < 6) return showAuthMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรค่ะ");
    showAuthMessage("กำลังสมัครสมาชิก...");
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return showAuthMessage("สมัครสมาชิกไม่สำเร็จ: " + error.message);
    if (!data.session) showAuthMessage("สมัครสมาชิกแล้วค่ะ กรุณาเปิดอีเมลและกดลิงก์ยืนยันก่อนเข้าสู่ระบบ");
    else showAuthMessage("สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...");
}

// เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่สมัครไว้
async function signIn() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    if (!email || !password) return showAuthMessage("กรุณากรอกอีเมลและรหัสผ่านก่อนค่ะ");
    showAuthMessage("กำลังเข้าสู่ระบบ...");
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return showAuthMessage("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    showAuthMessage("เข้าสู่ระบบสำเร็จค่ะ");
}

// ออกจากระบบผ่าน Supabase Auth
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) showAuthMessage("ออกจากระบบไม่สำเร็จ: " + error.message);
}

// โหลดรายการจากตาราง tasks; RLS จำกัดข้อมูลให้เห็นเฉพาะเจ้าของบัญชี
async function loadTasks() {
    const { data, error } = await supabaseClient.from("tasks")
        .select("id, text, done, created_at").order("created_at", { ascending: true });
    if (error) {
        setDialogue("โหลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้งค่ะ", IMG_ALERT);
        console.error("loadTasks:", error);
        return;
    }
    tasks = data || [];
    renderTasks();
}

function toggleExtraOptions() {
    const panel = document.getElementById("extra-options");
    const button = document.getElementById("extra-options-toggle");
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    button.textContent = isOpening ? "<" : ">";
    button.setAttribute("aria-expanded", String(isOpening));
    button.setAttribute("aria-label", isOpening ? "ซ่อนตัวเลือกเสริม" : "แสดงตัวเลือกเสริม");
}

function changeOpacity(val) {
    document.getElementById('chat-box').style.setProperty(
        '--chat-opacity',
        val
    );
}

function setDialogue(text, imgPath) {
    document.getElementById('dialogue-text').innerText = text;
    if (imgPath) {
        document.getElementById('char-img').src = imgPath;
    }
}

function showMode(index) {
    currentModeIdx = Math.max(0, Math.min(2, Number(index)));
    updateModeUI();
}

function updateModeUI() {
    const isTodo = currentModeIdx === 0;
    const isEarthquake = currentModeIdx === 1;
    const isSettings = currentModeIdx === 2;
    document.getElementById("todo-section").style.display = isTodo && currentUser ? "block" : "none";
    document.getElementById("auth-panel").style.display = isTodo && !currentUser ? "block" : "none";
    document.getElementById("earthquake-section").style.display = isEarthquake ? "block" : "none";
    document.getElementById("settings-section").style.display = isSettings ? "block" : "none";
    document.getElementById("nav-todo").classList.toggle("active", isTodo);
    document.getElementById("nav-earthquake").classList.toggle("active", isEarthquake);
    document.getElementById("nav-settings").classList.toggle("active", isSettings);
    if (isSettings) updateAccountUI();
    if (isEarthquake) checkEarthquake();
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        addTask();
    }
}

// เพิ่มรายการใหม่ลงฐานข้อมูลก่อน แล้วจึงแสดงบนหน้าจอ
async function addTask() {
    const input = document.getElementById('task-input');
    const val = input.value.trim();
    if (!val || !currentUser) return;
    const { data, error } = await supabaseClient.from("tasks")
        .insert({ user_id: currentUser.id, text: val, done: false })
        .select("id, text, done, created_at").single();
    if (error) {
        setDialogue("บันทึกรายการไม่สำเร็จ กรุณาลองอีกครั้งค่ะ", IMG_ALERT);
        console.error("addTask:", error);
        return;
    }
    tasks.push(data);
    input.value = '';
    renderTasks();
    setDialogue('จดรายการ "' + val + '" เรียบร้อยแล้วค่ะ!', IMG_IDLE);
}

// เปลี่ยนสถานะงานในฐานข้อมูล แล้วอัปเดตหน้าจอเมื่อบันทึกสำเร็จ
async function toggleTask(idx) {
    const task = tasks[idx];
    if (!task || !currentUser) return;
    const nextDone = !task.done;
    const { error } = await supabaseClient.from("tasks").update({ done: nextDone })
        .eq("id", task.id).eq("user_id", currentUser.id);
    if (error) {
        setDialogue("อัปเดตสถานะไม่สำเร็จ กรุณาลองอีกครั้งค่ะ", IMG_ALERT);
        console.error("toggleTask:", error);
        renderTasks();
        return;
    }
    task.done = nextDone;
    renderTasks();
    if (task.done) {
        setDialogue("เก่งมากเลยค่ะ! ทำสำเร็จไปอีกอย่างแล้วนะ 👍✨", IMG_PRAISE);
        clearTimeout(praiseTimer);
        praiseTimer = setTimeout(() => setDialogue("สู้ๆ กับงานที่เหลือต่อนะคะ!", IMG_IDLE), 3000);
    } else setDialogue("ยกเลิกการเช็คแล้ว สู้ๆ นะคะ", IMG_IDLE);
}

// ลบรายการจากฐานข้อมูลก่อน แล้วนำออกจากหน้าจอ
async function deleteTask(idx) {
    const task = tasks[idx];
    if (!task || !currentUser) return;
    const { error } = await supabaseClient.from("tasks").delete()
        .eq("id", task.id).eq("user_id", currentUser.id);
    if (error) {
        setDialogue("ลบรายการไม่สำเร็จ กรุณาลองอีกครั้งค่ะ", IMG_ALERT);
        console.error("deleteTask:", error);
        return;
    }
    tasks.splice(idx, 1);
    renderTasks();
    setDialogue('ลบรายการ "' + task.text + '" แล้วค่ะ', IMG_IDLE);
}

// วาดรายการงานใหม่; textContent ป้องกันข้อความงานถูกแปลเป็น HTML
function renderTasks() {
    const listEl = document.getElementById('task-list');
    listEl.innerHTML = '';
    tasks.forEach((task, idx) => {
        const li = document.createElement('li');
        li.className = 'task-item ' + (task.done ? 'done' : '');
        const left = document.createElement('div');
        left.className = 'task-left';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', () => toggleTask(idx));
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        left.append(checkbox, taskText);
        const deleteButton = document.createElement('button');
        deleteButton.className = 'del-btn';
        deleteButton.type = 'button';
        deleteButton.title = 'ลบรายการ';
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => deleteTask(idx));
        li.append(left, deleteButton);
        listEl.appendChild(li);
    });
}

async function checkEarthquake() {
    setDialogue("กำลังดึงข้อมูลแผ่นดินไหวล่าสุด...", IMG_ALERT);
    try {
        const res = await fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=1");
        const data = await res.json();
        if (data.features && data.features.length > 0) {
            const place = data.features[0].properties.place;
            const mag = data.features[0].properties.mag;
            setDialogue(`รายงานแผ่นดินไหวล่าสุด: ขนาด ${mag} Mv ที่ ${place}`, IMG_ALERT);

            clearTimeout(praiseTimer);
            praiseTimer = setTimeout(() => {
                document.getElementById('char-img').src = IMG_IDLE;
            }, 3000);
        } else {
            setDialogue("ไม่พบรายงานแผ่นดินไหวล่าสุดค่ะ", IMG_IDLE);
        }
    } catch (e) {
        setDialogue("ไม่สามารถดึงข้อมูลแผ่นดินไหวได้ในขณะนี้", IMG_IDLE);
    }
}
// โหลดค่าภาษาและธีมที่ผู้ใช้บันทึกไว้ก่อนเริ่มเชื่อมต่อบัญชี
initializePreferences();
// เริ่มเชื่อมต่อเมื่อ HTML โหลดครบแล้ว
initializeSupabase();
