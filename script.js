
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
        addTaskTitle: "เพิ่มรายการ", deleteTaskTitle: "ลบรายการ",
        floodDescription: "ตรวจสอบจังหวัดที่มีสถานการณ์น้ำท่วมและสถานีวัดน้ำที่อยู่ใกล้ตำแหน่งของคุณ",
        floodButton: "🌊 ตรวจสอบน้ำท่วมใกล้ฉัน",
        floodGpsNote: "ระบบจะขออนุญาตใช้ตำแหน่ง GPS เฉพาะเมื่อคุณกดปุ่ม",
        floodFullTitle: "รายงานสถานการณ์น้ำท่วมฉบับเต็ม",
        floodViewDetails: "📋 ดูรายงานฉบับเต็ม",
        floodHideDetails: "ซ่อนรายงานฉบับเต็ม",
        floodLoading: "กำลังตรวจสอบสถานการณ์น้ำท่วมและขอตำแหน่ง GPS หากคุณอนุญาตค่ะ...",
        floodTitle: "🌊 รายงานสถานการณ์น้ำท่วมประเทศไทย",
        floodStale: "⚠️ ข้อมูลจังหวัดอาจไม่ใช่ข้อมูลล่าสุด โปรดตรวจสอบประกาศทางการ",
        floodUpdated: "อัปเดตข้อมูลจังหวัด: ",
        floodHighestProvince: "จังหวัดระดับสูงสุด: ",
        floodAssessment: "ระดับประเมิน: ",
        floodDetailsLabel: "รายละเอียด: ",
        floodNoProvince: "ไม่พบจังหวัดที่ถูกจัดอยู่ในระดับเฝ้าระวังขึ้นไปจากข้อมูลชุดนี้",
        floodGpsToStation: "จาก GPS ถึงสถานีวัดน้ำในจังหวัดระดับสูงสุดที่ใกล้ที่สุด: ",
        floodNoTopStation: "ยังหาสถานีข้อมูลปัจจุบันในจังหวัดระดับสูงสุดเพื่อคำนวณระยะทางไม่ได้",
        floodNearbyStation: "สถานีใกล้ตำแหน่งคุณ: ",
        floodWaterLevel: "ค่าระดับน้ำสถานี: ",
        floodNoPercent: "ไม่มีค่าเปอร์เซ็นต์",
        floodStationStatus: "สถานะสถานี: ",
        floodReadAt: " · เวลาอ่านค่า ",
        floodNoGps: "ยังไม่ได้รับตำแหน่ง GPS จึงคำนวณระยะทางไม่ได้",
        floodGpsHint: " · อนุญาต GPS เพื่อดูระยะทางจากตำแหน่งคุณได้",
        floodNoNearbyStation: "ยังไม่มีข้อมูลสถานีวัดน้ำใกล้ตำแหน่ง",
        floodNoFreshStation: "ไม่พบสถานีวัดน้ำที่มีข้อมูลปัจจุบัน",
        floodNoStationData: "ไม่มีข้อมูลสถานี",
        floodGpsDenied: "ไม่ได้อนุญาต GPS",
        floodNearestDistance: "ระยะถึงสถานีในจังหวัดระดับสูงสุด: ",
        floodSeeFull: "ดูรายงานฉบับเต็มเพื่อดูรายละเอียด",
        floodNoLevel: "ไม่ทราบระดับน้ำ",
        floodNoProvinceData: "⚠️ ข้อมูลจังหวัดอาจเก่า",
        floodCritical: "วิกฤต",
        floodWatch: "เฝ้าระวัง",
        floodNormal: "ปกติ",
        floodNoData: "ไม่มีข้อมูล",
        floodDisclaimer: "หมายเหตุ: ระดับจังหวัดเป็นการประเมินของ Thailand Flood Watch ไม่ใช่ประกาศเตือนภัยทางการ และระยะทางเป็นเส้นตรงถึงสถานีวัดน้ำ ไม่ใช่ระยะทางเดินทาง",
        floodError: "ขออภัยค่ะ ตอนนี้ดึงข้อมูลน้ำท่วมไม่ได้ กรุณาลองใหม่ภายหลัง และตรวจประกาศจาก ปภ. หรือหน่วยงานท้องถิ่นโดยตรงนะคะ",
        floodDistanceUnit: " กม. ",
        floodNoNearbySummary: "ยังไม่มีข้อมูลสถานีวัดน้ำใกล้ตำแหน่ง",
        floodDistanceSummary: " กม. ถึงสถานีในจังหวัดระดับสูงสุด",
        floodShortProvincePrefix: "จังหวัดระดับสูงสุด: ",
        floodShortStationPrefix: "สถานีใกล้คุณ: ",
        floodMeterUnit: " ม. ",
        floodCapacity: "% ของความจุลำน้ำ"
    
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
        addTaskTitle: "Add task", deleteTaskTitle: "Delete task",
        floodDescription: "Check flood-affected provinces and nearby water-level stations.",
        floodButton: "🌊 Check nearby flood conditions",
        floodGpsNote: "Yuno only requests GPS access when you tap the button.",
        floodFullTitle: "Full flood situation report",
        floodViewDetails: "📋 View full report",
        floodHideDetails: "Hide full report",
        floodLoading: "Checking flood conditions. GPS access will be requested if you allow it...",
        floodTitle: "🌊 Thailand flood situation report",
        floodStale: "⚠️ Province data may be outdated. Please check official alerts.",
        floodUpdated: "Province data updated: ",
        floodHighestProvince: "Highest alert provinces: ",
        floodAssessment: "Assessment: ",
        floodDetailsLabel: "Details: ",
        floodNoProvince: "No provinces are currently marked as watch level or above in this dataset.",
        floodGpsToStation: "Distance from your GPS location to the nearest station in a highest-alert province: ",
        floodNoTopStation: "No current station data is available in the highest-alert provinces to calculate distance.",
        floodNearbyStation: "Nearest station to you: ",
        floodWaterLevel: "Station water level: ",
        floodNoPercent: "percentage unavailable",
        floodStationStatus: "Station status: ",
        floodReadAt: " · Reading time ",
        floodNoGps: "GPS permission was not granted, so distance cannot be calculated.",
        floodGpsHint: " · Allow GPS to see distances from your location.",
        floodNoNearbyStation: "No nearby water-level station data is available.",
        floodNoFreshStation: "No station with current data was found.",
        floodNoStationData: "No station data",
        floodGpsDenied: "GPS not allowed",
        floodNearestDistance: "Distance to a station in a highest-alert province: ",
        floodSeeFull: "View the full report for more details.",
        floodNoLevel: "Water level unavailable",
        floodNoProvinceData: "⚠️ Province data may be outdated",
        floodCritical: "Critical",
        floodWatch: "Watch",
        floodNormal: "Normal",
        floodNoData: "No data",
        floodDisclaimer: "Note: Province-level alerts are assessments by Thailand Flood Watch, not official emergency warnings. Distances are straight-line distances to monitoring stations, not travel distances.",
        floodError: "Sorry, flood data is unavailable right now. Please try again later and check official announcements from the Department of Disaster Prevention and Mitigation or local authorities.",
        floodDistanceUnit: " km ",
        floodNoNearbySummary: "No nearby water-level station data is available.",
        floodDistanceSummary: " km to a station in a highest-alert province",
        floodShortProvincePrefix: "Highest-alert provinces: ",
        floodShortStationPrefix: "Nearest station: ",
        floodMeterUnit: " m ",
        floodCapacity: "% of river capacity"
    
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
let floodIdleTimer = null;

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
    clearTimeout(floodIdleTimer);
    const dialogue = document.getElementById('dialogue-text');
    // Normalize escaped newline text from any feature into real line breaks.
    dialogue.textContent = String(text).replace(/\\n/g, "\n");
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

// คำนวณระยะทางเส้นตรงระหว่าง GPS กับสถานีวัดน้ำ (กิโลเมตร)
function distanceKm(lat1, lon1, lat2, lon2) {
    const rad = value => value * Math.PI / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getFloodLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("อุปกรณ์นี้ไม่รองรับ GPS"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }),
            error => reject(error),
            { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
        );
    });
}

function floodLevelLabel(level, language = "th") {
    if (language === "en") return ({3: "Critical / overbank station", 2: "High alert", 1: "Watch", 0: "Normal"})[Number(level)] || "No province-level data";
    return ({
        3: "วิกฤต / มีสถานีล้นตลิ่ง",
        2: "เตือนภัยระดับสูง",
        1: "เฝ้าระวัง",
        0: "ปกติ"
    })[Number(level)] || "ไม่มีข้อมูลระดับจังหวัด";
}

function formatFloodTime(value, language = "th") {
    if (!value) return language === "en" ? "Time unavailable" : "ไม่ระบุเวลา";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return language === "en" ? "Time unavailable" : "ไม่ระบุเวลา";
    return date.toLocaleString(language === "en" ? "en-GB" : "th-TH", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
}

function toggleFloodDetails() {
    const panel = document.getElementById("flood-details");
    const button = document.getElementById("flood-details-toggle");
    if (!panel || !button) return;
    const opening = panel.hidden;
    panel.hidden = !opening;
    const t = translations[localStorage.getItem("yuno-language") || "th"];
    button.textContent = opening ? t.floodHideDetails : t.floodViewDetails;
    button.setAttribute("aria-expanded", String(opening));
}

function scheduleFloodIdle() {
    clearTimeout(floodIdleTimer);
    floodIdleTimer = setTimeout(() => {
        const character = document.getElementById("char-img");
        if (character) character.src = IMG_IDLE;
    }, 4000);
}

// ตรวจสถานการณ์น้ำท่วมจากข้อมูลจังหวัดและสถานีวัดน้ำ
async function checkFlood() {
    const lang = localStorage.getItem("yuno-language") === "en" ? "en" : "th";
    const t = translations[lang];
    setDialogue(t.floodLoading, IMG_ALERT);

    let location = null;
    let locationNote = "";
    try {
        location = await getFloodLocation();
    } catch (error) {
        locationNote = t.floodNoGps;
    }

    try {
        const [provinceResponse, stationResponse] = await Promise.all([
            fetch("https://watch.purrism.com/api/v1/provinces"),
            fetch("https://watch.purrism.com/api/v1/stations?kind=waterlevel")
        ]);
        if (!provinceResponse.ok || !stationResponse.ok) {
            throw new Error("Flood data service unavailable");
        }

        const [provinceData, stationData] = await Promise.all([
            provinceResponse.json(),
            stationResponse.json()
        ]);
        const provinces = Array.isArray(provinceData.provinces) ? provinceData.provinces : [];
        const features = Array.isArray(stationData.features) ? stationData.features : [];
        if (!provinces.length) throw new Error("No province data");

        const now = Date.now();
        const freshStations = features.filter(feature => {
            const props = feature.properties || {};
            const coords = feature.geometry && feature.geometry.coordinates;
            const ts = props.ts ? new Date(props.ts).getTime() : 0;
            return coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1]) &&
                props.status !== "stale" && ts > 0 && now - ts <= 6 * 60 * 60 * 1000;
        });

        const activeProvinces = provinces
            .filter(province => Number(province.level) > 0)
            .sort((a, b) => Number(b.level) - Number(a.level));

        const topLevel = activeProvinces.length ? Number(activeProvinces[0].level) : 0;
        const topProvinces = activeProvinces.filter(province => Number(province.level) === topLevel);
        let nearestTopStation = null;
        let nearestAnyStation = null;

        if (location && freshStations.length) {
            freshStations.forEach(feature => {
                const [lon, lat] = feature.geometry.coordinates;
                const distance = distanceKm(location.lat, location.lon, lat, lon);
                const item = { feature, distance };
                if (!nearestAnyStation || distance < nearestAnyStation.distance) nearestAnyStation = item;
                if (topProvinces.some(province => province.slug === feature.properties.province)) {
                    if (!nearestTopStation || distance < nearestTopStation.distance) nearestTopStation = item;
                }
            });
        }

        const updatedAt = provinceData.updated_at;
        const updatedMs = updatedAt ? new Date(updatedAt).getTime() : 0;
        const dataIsOld = !updatedMs || now - updatedMs > 6 * 60 * 60 * 1000;
        const fullLines = [t.floodTitle];

        fullLines.push(dataIsOld
            ? t.floodStale
            : t.floodUpdated + formatFloodTime(updatedAt, lang));

        if (topProvinces.length) {
            const names = topProvinces.slice(0, 3).map(p => p.name_th).join(", ");
            fullLines.push(t.floodHighestProvince + names);
            fullLines.push(t.floodAssessment + floodLevelLabel(topLevel, lang));
            const reasons = topProvinces[0].summary;
            if (reasons) fullLines.push(t.floodDetailsLabel + reasons);
        } else {
            fullLines.push(t.floodNoProvince);
        }

        let nearestSummary = t.floodNoNearbySummary;
        let nearbySummary = t.floodNoFreshStation;
        if (location) {
            if (nearestTopStation) {
                const props = nearestTopStation.feature.properties;
                fullLines.push(t.floodGpsToStation +
                    nearestTopStation.distance.toFixed(1) + t.floodDistanceUnit + "(" +
                    [props.name, props.amphoe, props.province].filter(Boolean).join(", ") + ")");
                nearestSummary = nearestTopStation.distance.toFixed(1) + t.floodDistanceSummary;
            } else {
                fullLines.push(t.floodNoTopStation);
            }
            if (nearestAnyStation) {
                const props = nearestAnyStation.feature.properties;
                const stationName = [props.name, props.amphoe].filter(Boolean).join(", ");
                fullLines.push(t.floodNearbyStation + stationName);
                nearbySummary = stationName || nearbySummary;
                if (Number.isFinite(Number(props.value))) {
                    fullLines.push(t.floodWaterLevel + Number(props.value).toFixed(2) +
                        t.floodMeterUnit + " · " + (Number.isFinite(Number(props.pct)) ? Number(props.pct).toFixed(1) + t.floodCapacity : t.floodNoPercent));
                }
                fullLines.push(t.floodStationStatus + (props.status === "critical" ? t.floodCritical :
                    props.status === "watch" ? t.floodWatch : t.floodNormal) +
                    t.floodReadAt + formatFloodTime(props.ts, lang));
            }
        } else {
            fullLines.push(locationNote + t.floodGpsHint);
        }

        fullLines.push(t.floodDisclaimer);

        const provinceSummary = topProvinces.length
            ? topProvinces.slice(0, 2).map(p => p.name_th).join(", ") + " · " + floodLevelLabel(topLevel, lang)
            : t.floodNoProvince;
        const nearbyLevel = nearestAnyStation
            ? (nearestAnyStation.feature.properties.status === "critical" ? t.floodCritical :
               nearestAnyStation.feature.properties.status === "watch" ? t.floodWatch : t.floodNormal)
            : t.floodNoData;
        const shortLines = [
            t.floodShortProvincePrefix + provinceSummary,
            t.floodShortStationPrefix + (nearestAnyStation ? nearbySummary : location ? t.floodNoStationData : t.floodGpsDenied),
            nearestTopStation ? t.floodNearestDistance + nearestSummary :
                (dataIsOld ? t.floodNoProvinceData : t.floodSeeFull)
        ];
        if (nearestAnyStation) {
            const p = nearestAnyStation.feature.properties;
            shortLines[1] += " · " + (Number.isFinite(Number(p.value)) ? Number(p.value).toFixed(2) + t.floodMeterUnit : t.floodNoLevel) + " · " + nearbyLevel;
        }
        setDialogue(shortLines.join("\n"), IMG_ALERT);
        scheduleFloodIdle();
        const detail = document.getElementById("flood-details-content");
        const detailButton = document.getElementById("flood-details-toggle");
        const detailPanel = document.getElementById("flood-details");
        if (detail && detailButton && detailPanel) {
            detail.textContent = fullLines.join("\n");
            detailPanel.hidden = true;
            detailButton.hidden = false;
            detailButton.textContent = t.floodViewDetails;
            detailButton.setAttribute("aria-expanded", "false");
        }
    } catch (error) {
        console.error("checkFlood:", error);
        const detailButton = document.getElementById("flood-details-toggle");
        const detailPanel = document.getElementById("flood-details");
        if (detailButton) detailButton.hidden = true;
        if (detailPanel) detailPanel.hidden = true;
        setDialogue(t.floodError, IMG_ALERT);
        scheduleFloodIdle();
    }
}

// โหลดค่าภาษาและธีมที่ผู้ใช้บันทึกไว้ก่อนเริ่มเชื่อมต่อบัญชี
initializePreferences();
// เริ่มเชื่อมต่อเมื่อ HTML โหลดครบแล้ว
initializeSupabase();
