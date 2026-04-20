document.addEventListener("DOMContentLoaded", () => {
    // --- AUDIO SYSTEM ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function playSuccessSound() {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
            osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch(e) {}
    }

    function playDingSound() {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch(e) {}
    }

    // --- DATA INITIALIZATION ---
    let appData = JSON.parse(localStorage.getItem('studyTrackerData')) || [];
    let userGoals = JSON.parse(localStorage.getItem('studyTrackerGoals')) || [];
    let currentSubjectId = null;

    // --- TAB SWITCH LOGIC ---
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            if (item.id === "sidebarStatsBtn") return;

            e.preventDefault();
            navItems.forEach(n => n.classList.remove("active"));
            tabPanes.forEach(t => t.classList.remove("active"));

            item.classList.add("active");
            const tabId = item.getAttribute("data-tab");
            if (tabId) document.getElementById(tabId).classList.add("active");
        });
    });

    // Time Tracking init
    let dailyStudyMinutes = parseInt(localStorage.getItem('dailyStudyMinutes')) || 0;
    let studyHistory = JSON.parse(localStorage.getItem('studyTrackerHistory')) || {};
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    const todayStr = new Date().toISOString().split('T')[0];

    // Reset daily time if it's a new day
    if (lastLoginDate !== todayStr) {
        dailyStudyMinutes = 0;
        localStorage.setItem('dailyStudyMinutes', '0');
        localStorage.setItem('lastLoginDate', todayStr);
    }


const lessonImages = {
    "türkçe": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    "matematik": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
    "fizik": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800",
    "kimya": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    "coğrafya": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800",
    "tarih": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800",
    "default": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"
};

    const motivations = [
        { text: "\"Başarı, her gün tekrarlanan küçük çabaların toplamıdır.\" - Robert Collier", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Gelecek, bugünden ona hazırlananlara aittir.\" - Malcolm X", image: "https://images.unsplash.com/photo-1513258496099-481620202119?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Eğer hayal edebiliyorsan, yapabilirsin.\" - Walt Disney", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Zorluklar, sıradan insanları sıra dışı bir kadere hazırlar.\" - C.S. Lewis", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Vazgeçmediğin sürece ne kadar yavaş gittiğinin bir önemi yoktur.\" - Konfüçyüs", image: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&q=80&w=800" }
    ];

function getRandomImage(lessonName = "") {
    const name = lessonName.toString().trim().toLowerCase();
    return lessonImages[name] || lessonImages["default"];
}
    function saveData() { localStorage.setItem('studyTrackerData', JSON.stringify(appData)); }

    // --- DOM ELEMENTS ---
    const subjectView = document.getElementById("subjectView");
    const unitView = document.getElementById("unitView");
    const subjectGrid = document.getElementById("subjectGrid");

    // Profile
    let userProfile = JSON.parse(localStorage.getItem('studyTrackerProfile')) || {
        name: "Öğrenci",
        goal: "Hedef Belirlenmedi",
        image: "",
        theme: "dark-blue"
    };

    if (userProfile.theme === "light-pink") {
        document.body.classList.add("theme-light-pink");
    }
    const profileSection = document.getElementById("profileSection");
    const profilePic = document.getElementById("profilePic");
    const studentName = document.getElementById("studentName");
    const studentGoal = document.getElementById("studentGoal");

    const profileModal = document.getElementById("profileModal");
    const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const profileNameInput = document.getElementById("profileNameInput");
    const profileGoalInput = document.getElementById("profileGoalInput");
    const profileImageInput = document.getElementById("profileImageInput");
     const exportDataBtn = document.getElementById("exportDataBtn");
    const importDataInput = document.getElementById("importDataInput");

    // Goals
    const goalInput = document.getElementById("goalInput");
    const goalDateInput = document.getElementById("goalDateInput");
    const addGoalBtn = document.getElementById("addGoalBtn");
    const goalList = document.getElementById("goalList");

    // Welcome Modal
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeImage = document.getElementById("welcomeImage");
    const welcomeQuote = document.getElementById("welcomeQuote");
    const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");

    // Subject Modal
    const addSubjectModal = document.getElementById("addSubjectModal");
    const openSubjectModalBtn = document.getElementById("openSubjectModalBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const confirmAddSubjectBtn = document.getElementById("confirmAddSubjectBtn");
    const newSubjectName = document.getElementById("newSubjectName");
    const newSubjectImage = document.getElementById("newSubjectImage");
    const newSubjectImportance = document.getElementById("newSubjectImportance");

    // Unit View
    const backToSubjectsBtn = document.getElementById("backToSubjectsBtn");
    const currentSubjectTitle = document.getElementById("currentSubjectTitle");
    const currentSubjectBanner = document.getElementById("currentSubjectBanner");
    const subjectTimeDisplay = document.getElementById("subjectTimeDisplay");

    // Unit Tasks
    const unitInput = document.getElementById("unitInput");
    const addUnitBtn = document.getElementById("addUnitBtn");
    const unitList = document.getElementById("unitList");

    // Note Modal
    const noteModal = document.getElementById("noteModal");
    const closeNoteModalBtn = document.getElementById("closeNoteModalBtn");
    const saveNoteBtn = document.getElementById("saveNoteBtn");
    const unitNoteText = document.getElementById("unitNoteText");
    const noteModalTitle = document.getElementById("noteModalTitle");

    const unitFileInput = document.getElementById("unitFileInput");
    const attachedFileDisplay = document.getElementById("attachedFileDisplay");
    const attachedFileName = document.getElementById("attachedFileName");
    const removeAttachedFileBtn = document.getElementById("removeAttachedFileBtn");

    let currentEditingUnitId = null;
    let currentNoteFile = null;

    // Time Modal
    const timeModal = document.getElementById("timeModal");
    const closeTimeModalBtn = document.getElementById("closeTimeModalBtn");
    const saveTimeBtn = document.getElementById("saveTimeBtn");
    const timeSubjectSelect = document.getElementById("timeSubjectSelect");
    const timeHours = document.getElementById("timeHours");
    const timeMinutes = document.getElementById("timeMinutes");
    const timeDate = document.getElementById("timeDate");
    const dailyTimeDisplay = document.getElementById("dailyTimeDisplay");
    const addGlobalTimeBtn = document.getElementById("addGlobalTimeBtn");
    const addSubjectTimeBtn = document.getElementById("addSubjectTimeBtn");

    // Stats - now inline tab
    const sidebarStatsBtn = document.getElementById("sidebarStatsBtn");
    const statsTabPane = document.getElementById("statsTab");

    // Alert / Confirm Modal
    const alertModal = document.getElementById("alertModal");
    const alertModalTitle = document.getElementById("alertModalTitle");
    const alertModalMessage = document.getElementById("alertModalMessage");
    const alertModalButtons = document.getElementById("alertModalButtons");
    const confirmModalButtons = document.getElementById("confirmModalButtons");
    const alertOkBtn = document.getElementById("alertOkBtn");
    const confirmYesBtn = document.getElementById("confirmYesBtn");
    const confirmNoBtn = document.getElementById("confirmNoBtn");

    let currentAlertResolve = null;

    function setupAlertUI(title, message) {
        let iconHtml = '<i class="fas fa-bell"></i>';
        let iconColor = 'var(--primary-color)';
        let titleText = title;

        if(title.includes('<i')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = title;
            const iEl = tempDiv.querySelector('i');
            if(iEl) {
                iconColor = iEl.style.color || 'var(--primary-color)';
                if(iconColor === 'var(--danger-color)') iconColor = '#ef4444';
                iconHtml = iEl.outerHTML;
                iEl.remove();
            }
            titleText = tempDiv.textContent.trim();
        }

        const alertIconWrapper = document.getElementById("alertIconWrapper");
        if (alertIconWrapper) {
            alertIconWrapper.innerHTML = iconHtml;
            alertIconWrapper.style.color = iconColor;
            alertIconWrapper.style.borderColor = iconColor;
            const glowColor = iconColor.startsWith('#') ? iconColor + '30' : 'rgba(59, 130, 246, 0.2)';
            alertIconWrapper.style.boxShadow = `0 10px 20px ${glowColor}`;
            alertIconWrapper.style.background = `linear-gradient(145deg, ${glowColor}, rgba(0,0,0,0.1))`;
        }

        alertModalTitle.innerHTML = titleText;
        alertModalMessage.innerHTML = message.replace(/\n/g, '<br>');
    }

    function openCustomAlert(title, message) {
        return new Promise(resolve => {
            setupAlertUI(title, message);
            alertOkBtn.innerHTML = '<i class="fas fa-check"></i> Anladım';
            alertModalButtons.style.display = "flex";
            confirmModalButtons.style.display = "none";
            currentAlertResolve = resolve;
            alertModal.classList.add("show");
        });
    }

    function openCustomConfirm(title, message, yesBtnText = "Evet", noBtnText = "Hayır", isDanger = false) {
        return new Promise(resolve => {
            setupAlertUI(title, message);

            if (isDanger) {
                confirmYesBtn.style.background = "linear-gradient(135deg, #ef4444, #b91c1c)";
                confirmYesBtn.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.3)";
                confirmYesBtn.innerHTML = `<i class="fas fa-trash"></i> ${yesBtnText}`;
            } else {
                confirmYesBtn.style.background = "linear-gradient(135deg, var(--success-color), #059669)";
                confirmYesBtn.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
                confirmYesBtn.innerHTML = `<i class="fas fa-check-circle"></i> ${yesBtnText}`;
            }
            confirmNoBtn.innerHTML = `<i class="fas fa-times"></i> ${noBtnText}`;

            alertModalButtons.style.display = "none";
            confirmModalButtons.style.display = "flex";
            currentAlertResolve = resolve;
            alertModal.classList.add("show");
        });
    }

    function closeAlertModal(result) {
        if (currentAlertResolve) {
            currentAlertResolve(result);
            currentAlertResolve = null;
        }
        alertModal.classList.remove("show");
    }

    alertOkBtn.addEventListener("click", () => closeAlertModal(true));
    confirmYesBtn.addEventListener("click", () => closeAlertModal(true));
    confirmNoBtn.addEventListener("click", () => closeAlertModal(false));


    // --- TIME FUNCTIONS ---
    function formatTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}s ${m}dk`;
    }

    function updateGlobalTimeDisplay() {
        dailyTimeDisplay.textContent = formatTime(dailyStudyMinutes);
        localStorage.setItem('dailyStudyMinutes', dailyStudyMinutes.toString());
    }
    updateGlobalTimeDisplay();

    function updateSubjectTimeDisplay(subject) {
        subjectTimeDisplay.innerHTML = `<i class="fas fa-clock"></i> Ders Süresi: ${formatTime(subject.studiedMinutes || 0)}`;
    }

    // --- PROFILE FUNCTIONS ---
    function renderProfile() {
        studentName.textContent = userProfile.name || "Öğrenci";
        studentGoal.textContent = userProfile.goal || "Hedef Belirlenmedi";

        const welcomeName = document.getElementById("welcomeNameText");
        if(welcomeName) welcomeName.textContent = userProfile.name === "Öğrenci" ? "Şampiyon" : userProfile.name.split(" ")[0];

        if (userProfile.image && userProfile.image.trim() !== "") {
            profilePic.src = userProfile.image;
        } else {
            const encodedName = encodeURIComponent(userProfile.name || "Öğrenci");
            profilePic.src = `https://ui-avatars.com/api/?name=${encodedName}&background=3b82f6&color=fff&rounded=true&size=128`;
        }
    }

    profileSection.addEventListener("click", () => {
        profileNameInput.value = userProfile.name === "Öğrenci" ? "" : userProfile.name;
        profileGoalInput.value = userProfile.goal === "Hedef Belirlenmedi" ? "" : userProfile.goal;
        profileImageInput.value = userProfile.image || "";
         profileModal.classList.add("show");
    });

    closeProfileModalBtn.addEventListener("click", () => profileModal.classList.remove("show"));

    saveProfileBtn.addEventListener("click", () => {
        userProfile.name = profileNameInput.value.trim() || "Öğrenci";
        userProfile.goal = profileGoalInput.value.trim() || "Hedef Belirlenmedi";
        userProfile.image = profileImageInput.value.trim();


        localStorage.setItem('studyTrackerProfile', JSON.stringify(userProfile));
        renderProfile();

        if (userProfile.theme === "light-pink") {
            document.body.classList.add("theme-light-pink");
        } else {
            document.body.classList.remove("theme-light-pink");
        }

        profileModal.classList.remove("show");
    });

    renderProfile();


// --- GOALS FUNCTIONS (SAATLİ VE BİLDİRİMLİ) ---
    function renderGoals() {
        goalList.innerHTML = "";
        if (userGoals.length === 0) {
            goalList.innerHTML = "<p style='color: var(--text-muted); font-size: 14px;'>Henüz bir hedefin yok. Başlamak bitirmenin yarısıdır!</p>";
            return;
        }

        // Hedefleri tarihe ve başlama saatine göre sırala
        userGoals.sort((a, b) => {
            let dateA = new Date((a.deadline || "2099-01-01") + "T" + (a.startTime || "00:00"));
            let dateB = new Date((b.deadline || "2099-01-01") + "T" + (b.startTime || "00:00"));
            return dateA - dateB;
        });

        const now = new Date();

        userGoals.forEach(goal => {
            const li = document.createElement("li");
            li.className = `task-item ${goal.completed ? 'completed' : ''}`;

            const span = document.createElement("span");
            span.style.flex = "1";
            let spanHtml = `<strong style="font-size: 16px;">${goal.text}</strong>`;

            let badgeColor = "#10b981"; // Yeşil
            let badgeText = "";
            let timeStr = "";

            if (goal.startTime && goal.endTime) {
                timeStr = ` | <i class="far fa-clock"></i> ${goal.startTime} - ${goal.endTime}`;
            }

            if (goal.deadline) {
                const goalEndDate = new Date(goal.deadline + "T" + (goal.endTime || "23:59"));

                if (goal.completed) {
                    badgeColor = "var(--text-muted)";
                    badgeText = "Tamamlandı";
                } else if (now > goalEndDate) {
                    // SÜRE GEÇTİ İSE (Senin istediğin uyarı durumu)
                    badgeColor = "#ef4444";
                    badgeText = "⚠️ Süre Kaçırıldı!";
                    li.style.borderLeft = "4px solid #ef4444"; // Kartı kırmızıyla işaretle
                } else {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const deadlineDay = new Date(goal.deadline);
                    deadlineDay.setHours(0,0,0,0);
                    const diffDays = Math.ceil((deadlineDay - today) / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) { badgeColor = "#f59e0b"; badgeText = "Bugün"; }
                    else { badgeText = `${diffDays} gün kaldı`; }
                }

                spanHtml += `<br><span style="display:inline-block; margin-top:6px; font-size:12px; padding:3px 8px; border-radius:6px; background:rgba(255,255,255,0.05); border: 1px solid ${badgeColor}; color:${badgeColor};"><i class="far fa-calendar-alt"></i> ${goal.deadline} ${timeStr} <strong>(${badgeText})</strong></span>`;
            }

            span.innerHTML = spanHtml;

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "task-actions";

            const completeBtn = document.createElement("button");
            completeBtn.className = "complete-btn";
            completeBtn.innerHTML = goal.completed ? '<i class="fas fa-times-circle"></i> Geri Al' : '<i class="fas fa-check-circle"></i> Tamam';
            completeBtn.onclick = () => {
                goal.completed = !goal.completed;
                if (goal.completed) {
                    if(typeof playSuccessSound === "function") playSuccessSound();
                }
                localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
                renderGoals();
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Sil';
            deleteBtn.onclick = () => {
                li.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.9)' }], { duration: 200 }).onfinish = () => {
                    userGoals = userGoals.filter(g => g.id !== goal.id);
                    localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
                    renderGoals();
                };
            };

            actionsDiv.appendChild(completeBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(span);
            li.appendChild(actionsDiv);
            goalList.appendChild(li);
        });
    }

    // Hedef Ekleme Butonu Mantığı
    const goalStartTime = document.getElementById("goalStartTime");
    const goalEndTime = document.getElementById("goalEndTime");

    addGoalBtn.addEventListener("click", () => {
        const text = goalInput.value.trim();
        const dateVal = goalDateInput.value;
        const startVal = goalStartTime ? goalStartTime.value : "";
        const endVal = goalEndTime ? goalEndTime.value : "";

        if (text) {
            userGoals.push({
                id: Date.now().toString(),
                text: text,
                deadline: dateVal || null,
                startTime: startVal || null,
                endTime: endVal || null,
                completed: false
            });
            localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
            goalInput.value = "";

            // Tarih ve saatleri sıfırlamıyoruz ki art arda aynı güne hedef eklemek kolay olsun.

            renderGoals();
            if(typeof playDingSound === "function") playDingSound();
        }
    });

    goalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addGoalBtn.click();
    });

    // Sayfada her 1 dakikada bir kontrol et, süresi geçen olursa ekranda güncellensin
    setInterval(() => {
        renderGoals();
    }, 60000);


    // --- RENDER SUBJECTS ---
    function renderSubjects() {
        subjectGrid.innerHTML = "";

        if (appData.length === 0) {
            subjectGrid.innerHTML = "<p style='color: var(--text-muted); grid-column: 1/-1;'>Henüz hiç ders eklemediniz. 'Yeni Ders Ekle' butonundan başlayabilirsiniz.</p>";
            return;
        }

        const sortedData = [...appData].sort((a, b) => {
            const p = { 'high': 3, 'medium': 2, 'low': 1 };
            const pA = p[a.importance || 'medium'];
            const pB = p[b.importance || 'medium'];
            return pB - pA;
        });

        let totalWeights = 0;
        appData.forEach(s => {
            const val = s.importance || 'medium';
            if (val === 'high') totalWeights += 3;
            else if (val === 'low') totalWeights += 1;
            else totalWeights += 2;
        });

        sortedData.forEach(subject => {
            const card = document.createElement("div");
            card.className = "subject-card";

            const totalUnits = subject.units.length;
            const completedUnits = subject.units.filter(u => u.completed).length;
            const progressPercent = totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);

            const studyTimeStr = (subject.studiedMinutes > 0) ? ` | ⏱ ${formatTime(subject.studiedMinutes)}` : "";

            const importanceVal = subject.importance || 'medium';
            let importanceBadgeHtml = '';
            let weight = 2;

            if (importanceVal === 'high') {
                importanceBadgeHtml = `<span class="importance-badge importance-high">🔥 Yüksek Önem</span>`;
                weight = 3;
            } else if (importanceVal === 'low') {
                importanceBadgeHtml = `<span class="importance-badge importance-low">🌱 Düşük Önem</span>`;
                weight = 1;
            } else {
                importanceBadgeHtml = `<span class="importance-badge importance-medium">⭐ Orta Önem</span>`;
            }

            let recMinutes = Math.round((weight / totalWeights) * 360);
            if (weight === 3) recMinutes = Math.min(180, Math.max(60, recMinutes));
            else if (weight === 2) recMinutes = Math.min(120, Math.max(40, recMinutes));
            else if (weight === 1) recMinutes = Math.min(60, Math.max(20, recMinutes));
            recMinutes = Math.round(recMinutes / 5) * 5;

            card.innerHTML = `
                ${importanceBadgeHtml}
                <img src="${subject.image}" alt="${subject.name}" class="subject-image">
                <button class="delete-subject-btn" data-id="${subject.id}" title="Dersi Sil"><i class="fas fa-trash"></i></button>
                <div class="subject-content">
                    <div class="subject-title">${subject.name}</div>
                    <div class="subject-progress-text">${completedUnits} / ${totalUnits} Ünite Tamamlandı${studyTimeStr}</div>
                    <div class="subject-recommendation-text">
                        <i class="fas fa-robot"></i> Yapay Zeka Önerisi: Günlük <strong>${formatTime(recMinutes)}</strong>
                    </div>
                    <div class="subject-progress-bar">
                        <div class="subject-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            `;

            const deleteBtn = card.querySelector(".delete-subject-btn");
            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const confirmed = await openCustomConfirm(
                    `<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i> Dersi Sil`,
                    `"${subject.name}" dersini ve içindeki tüm üniteleri silmek istediğine emin misin?`,
                    "Evet, Sil", "Vazgeç", true
                );
                if (confirmed) {
                    appData = appData.filter(s => s.id !== subject.id);
                    saveData();
                    renderSubjects();
                }
            });

            card.addEventListener("click", () => openSubject(subject.id));
            subjectGrid.appendChild(card);
        });
    }

    // --- RENDER UNITS FOR A SUBJECT ---
    function openSubject(subjectId) {
        currentSubjectId = subjectId;
        const subject = appData.find(s => s.id === subjectId);
        if (!subject) return;

        subjectView.style.display = "none";
        unitView.style.display = "block";

        currentSubjectTitle.textContent = subject.name;
        currentSubjectBanner.style.backgroundImage = `url('${subject.image}')`;
        updateSubjectTimeDisplay(subject);

        renderUnits();
    }

    function renderUnits() {
        const subject = appData.find(s => s.id === currentSubjectId);
        if (!subject) return;

        unitList.innerHTML = "";

        if (subject.units.length === 0) {
            unitList.innerHTML = "<p style='color: var(--text-muted); padding: 10px 0;'>Bu derse henüz ünite eklemediniz.</p>";
            return;
        }

        subject.units.forEach(unit => {
            const li = document.createElement("li");
            li.className = `task-item ${unit.completed ? 'completed' : ''}`;

            const contentDiv = document.createElement("div");
            contentDiv.className = "task-content";

            const span = document.createElement("span");
            span.textContent = unit.name;
            contentDiv.appendChild(span);

            if (unit.notes && unit.notes.trim() !== "") {
                const notePreview = document.createElement("div");
                notePreview.className = "unit-note-preview";

                // Notun uzunluğunu kontrol edelim (Çok uzunsa düzeni bozmasın diye 70 karakterle sınırlıyoruz)
                const shortNote = unit.notes.length > 70 ? unit.notes.substring(0, 70) + "..." : unit.notes;

                // Sadece 'Not eklendi' yazmak yerine senin notunu ekrana basıyoruz
                notePreview.innerHTML = `<i class="fas fa-sticky-note" style="margin-top: 2px; color: var(--primary-color);"></i>
                                         <span style="color: var(--text-color); font-style: normal; line-height: 1.4;">${shortNote}</span>`;
                notePreview.style.alignItems = "flex-start"; // Uzun metinlerde ikonun yukarıda düzgün durması için
                contentDiv.appendChild(notePreview);
            }

            if (unit.file && unit.file.name) {
                const fileLink = document.createElement("a");
                fileLink.className = "unit-file-link";
                fileLink.innerHTML = `<i class="fas fa-paperclip"></i> Eklentiyi Gör (${unit.file.name})`;
                fileLink.href = unit.file.data;
                fileLink.download = unit.file.name;
                contentDiv.appendChild(fileLink);
            }

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "task-actions";

            const completeBtn = document.createElement("button");
            completeBtn.className = "complete-btn";
            completeBtn.innerHTML = unit.completed ? '<i class="fas fa-times-circle"></i> Geri Al' : '<i class="fas fa-check-circle"></i> Tamam';
            completeBtn.onclick = () => {
                unit.completed = !unit.completed;
                if (unit.completed) playSuccessSound();
                saveData();
                renderUnits();
            };

            const noteBtn = document.createElement("button");
            noteBtn.className = "note-btn";
            noteBtn.innerHTML = '<i class="fas fa-edit"></i> Not';
            noteBtn.onclick = () => openNoteModal(unit.id, unit.name, unit.notes, unit.file);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Sil';
            deleteBtn.onclick = () => {
                li.animate([
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.9)' }
                ], { duration: 200 }).onfinish = () => {
                    subject.units = subject.units.filter(u => u.id !== unit.id);
                    saveData();
                    renderUnits();
                };
            };

            actionsDiv.appendChild(completeBtn);
            actionsDiv.appendChild(noteBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(contentDiv);
            li.appendChild(actionsDiv);
            unitList.appendChild(li);
        });
    }

    // --- EVENT LISTENERS ---
    backToSubjectsBtn.addEventListener("click", () => {
        unitView.style.display = "none";
        subjectView.style.display = "block";
        currentSubjectId = null;
        renderSubjects();
    });

    addUnitBtn.addEventListener("click", () => {
        const text = unitInput.value.trim();
        if (text && currentSubjectId) {
            const subject = appData.find(s => s.id === currentSubjectId);
            subject.units.push({
                id: Date.now().toString(),
                name: text,
                completed: false,
                notes: "",
                file: null
            });
            saveData();
            unitInput.value = "";
            renderUnits();
            playDingSound();
        }
    });

    unitInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addUnitBtn.click();
    });

    // --- NOTE MODAL LOGIC ---
    function openNoteModal(unitId, unitName, notes, fileData) {
        currentEditingUnitId = unitId;
        noteModalTitle.textContent = `Not: ${unitName}`;
        unitNoteText.value = notes || "";
        currentNoteFile = fileData ? { ...fileData } : null;
        updateFileDisplay();
        noteModal.classList.add("show");
        unitNoteText.focus();
    }

    function updateFileDisplay() {
        if (currentNoteFile && currentNoteFile.name) {
            attachedFileDisplay.style.display = "flex";
            attachedFileName.textContent = currentNoteFile.name;
            unitFileInput.value = "";
        } else {
            attachedFileDisplay.style.display = "none";
        }
    }

    unitFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1.5 * 1024 * 1024) {
            openCustomAlert(`<i class="fas fa-exclamation-triangle" style="color:var(--danger-color);"></i> Hata`, "Dosya boyutu sistem sınırları gereği 1.5MB'dan büyük olamaz!");
            unitFileInput.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            currentNoteFile = { name: file.name, data: ev.target.result };
            updateFileDisplay();
        };
        reader.readAsDataURL(file);
    });

    removeAttachedFileBtn.addEventListener("click", () => {
        currentNoteFile = null;
        updateFileDisplay();
    });

    closeNoteModalBtn.addEventListener("click", () => {
        noteModal.classList.remove("show");
        currentEditingUnitId = null;
        currentNoteFile = null;
    });

    saveNoteBtn.addEventListener("click", () => {
        if (!currentSubjectId || !currentEditingUnitId) return;
        const subject = appData.find(s => s.id === currentSubjectId);
        if (subject) {
            const unit = subject.units.find(u => u.id === currentEditingUnitId);
            if (unit) {
                unit.notes = unitNoteText.value;
                unit.file = currentNoteFile;
                try {
                    saveData();
                    renderUnits();
                    noteModal.classList.remove("show");
                    currentEditingUnitId = null;
                    currentNoteFile = null;
                } catch(e) {
                    openCustomAlert(`<i class="fas fa-exclamation-triangle" style="color:var(--danger-color);"></i> Hata`, "Tarayıcınızın depolama limiti dolmuş olabilir. Lütfen daha küçük bir dosya yüklemeyi deneyin.");
                }
            }
        }
    });

    // --- TIME MODAL LOGIC ---
    function openTimeModal(presetSubjectId = 'general', presetH = 0, presetM = 0) {
        timeSubjectSelect.innerHTML = '<option value="general">Genel (Ders Bağımsız)</option>';
        appData.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = s.name;
            timeSubjectSelect.appendChild(opt);
        });
        timeSubjectSelect.value = presetSubjectId;
        timeHours.value = presetH;
        timeMinutes.value = presetM;
        timeDate.value = todayStr;
        timeModal.classList.add("show");
    }

    addGlobalTimeBtn.addEventListener("click", () => openTimeModal());
    addSubjectTimeBtn.addEventListener("click", () => {
        if (currentSubjectId) openTimeModal(currentSubjectId);
    });
    closeTimeModalBtn.addEventListener("click", () => timeModal.classList.remove("show"));

    saveTimeBtn.addEventListener("click", async () => {
        const h = parseInt(timeHours.value) || 0;
        const m = parseInt(timeMinutes.value) || 0;
        const addedMinutes = (h * 60) + m;
        const selectedDate = timeDate.value || todayStr;

        if (addedMinutes <= 0) {
            await openCustomAlert(`<i class="fas fa-exclamation-circle" style="color:#f59e0b;"></i> Uyarı`, "Lütfen geçerli bir süre girin.");
            return;
        }

        if (selectedDate === todayStr) {
            dailyStudyMinutes += addedMinutes;
            updateGlobalTimeDisplay();
        }

        const selectedSubjectId = timeSubjectSelect.value;

        if (!studyHistory[selectedDate]) {
            studyHistory[selectedDate] = { total: 0, subjects: {} };
        } else if (typeof studyHistory[selectedDate] === 'number') {
            studyHistory[selectedDate] = { total: studyHistory[selectedDate], subjects: {} };
        }

        studyHistory[selectedDate].total += addedMinutes;
        if (!studyHistory[selectedDate].subjects[selectedSubjectId]) {
            studyHistory[selectedDate].subjects[selectedSubjectId] = 0;
        }
        studyHistory[selectedDate].subjects[selectedSubjectId] += addedMinutes;

        localStorage.setItem('studyTrackerHistory', JSON.stringify(studyHistory));

        if (selectedSubjectId !== 'general') {
            const subject = appData.find(s => s.id === selectedSubjectId);
            if (subject) {
                subject.studiedMinutes = (subject.studiedMinutes || 0) + addedMinutes;
                saveData();
                if (currentSubjectId === selectedSubjectId) {
                    updateSubjectTimeDisplay(subject);
                }
            }
        }

        renderSubjects();
        timeModal.classList.remove("show");
    });

    // ============================================================
    // İSTATİSTİK - AYNI EKRANDA TAB PANELİ OLARAK
    // ============================================================
    let subjectChartInstance = null;
    let yearlyChartInstance = null;
    let monthlyChartInstance = null;
    let weeklyChartInstance = null;

    let chartYear = new Date().getFullYear();
    let chartMonth = new Date().getMonth();
    let chartWeek = 1;
    let currentWeekDataMap = [];

    function getDailyTotal(dateStr) {
        let minEntry = studyHistory[dateStr];
        if (!minEntry) return 0;
        return typeof minEntry === 'number' ? minEntry : minEntry.total;
    }

    function getDailySubjects(dateStr) {
        let minEntry = studyHistory[dateStr];
        if (!minEntry || typeof minEntry === 'number') return {};
        return minEntry.subjects || {};
    }

    function renderLinkedCharts() {
        const isLight = userProfile && userProfile.theme === 'light-pink';
        const themeTextColor = isLight ? '#1e293b' : '#94a3b8';
        const mainGridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

        const barNormal = isLight ? '#f472b6' : '#3b82f6';
        const barHover = isLight ? '#ec4899' : '#60a5fa';
        const barActive = isLight ? '#be185d' : '#8b5cf6';

        const yearChartTitle = document.getElementById('yearChartTitle');
        const monthChartTitle = document.getElementById('monthChartTitle');
        const weekChartTitle = document.getElementById('weekChartTitle');
        const dailyStatsPanel = document.getElementById('dailyStatsPanel');
        const dailyStatsTitle = document.getElementById('dailyStatsTitle');
        const dailyStatsList = document.getElementById('dailyStatsList');
        const dailyStatsTotal = document.getElementById('dailyStatsTotal');

        // Yearly
        if (document.getElementById('yearlyStatsChart')) {
            const yCtx = document.getElementById('yearlyStatsChart').getContext('2d');
            if (yearlyChartInstance) yearlyChartInstance.destroy();
            if (yearChartTitle) yearChartTitle.textContent = `${chartYear} Yılı Çalışma Dengesi`;
            let yLabels = ["Ock", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Ekm", "Kas", "Arl"];
            let yData = new Array(12).fill(0);
            for (let dateStr in studyHistory) {
                const d = new Date(dateStr);
                if (d.getFullYear() === chartYear) yData[d.getMonth()] += getDailyTotal(dateStr);
            }
            yearlyChartInstance = new Chart(yCtx, {
                type: 'bar',
                data: { labels: yLabels, datasets: [{ label: 'Çalışma (Dakika)', data: yData, backgroundColor: yData.map((v, i) => i === chartMonth ? barActive : barNormal), hoverBackgroundColor: barHover, borderRadius: 6, borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, onClick: (e, activeEls) => { if (activeEls.length > 0) { chartMonth = activeEls[0].index; chartWeek = 1; renderLinkedCharts(); } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } }, scales: { y: { beginAtZero: true, grid: { color: mainGridColor }, ticks: { color: themeTextColor } }, x: { grid: { display: false }, ticks: { color: themeTextColor } } } }
            });
        }

        // Monthly
        if (document.getElementById('monthlyStatsChart')) {
            const mCtx = document.getElementById('monthlyStatsChart').getContext('2d');
            if (monthlyChartInstance) monthlyChartInstance.destroy();
            if (monthChartTitle) monthChartTitle.textContent = `${monthNames[chartMonth]} ${chartYear} Haftalık Dağılımı`;
            let mLabels = ["1. Hafta (1-7)", "2. Hafta (8-14)", "3. Hafta (15-21)", "4. Hafta (22-28)", "5. Hafta (29+)"];
            let mData = new Array(5).fill(0);
            for (let dateStr in studyHistory) {
                const d = new Date(dateStr);
                if (d.getFullYear() === chartYear && d.getMonth() === chartMonth) {
                    let w = Math.ceil(d.getDate() / 7) - 1;
                    if (w > 4) w = 4;
                    mData[w] += getDailyTotal(dateStr);
                }
            }
            monthlyChartInstance = new Chart(mCtx, {
                type: 'bar',
                data: { labels: mLabels, datasets: [{ label: 'Çalışma (Dakika)', data: mData, backgroundColor: mData.map((v, i) => i === (chartWeek - 1) ? barActive : barNormal), hoverBackgroundColor: barHover, borderRadius: 6, borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, onClick: (e, activeEls) => { if (activeEls.length > 0) { chartWeek = activeEls[0].index + 1; renderLinkedCharts(); } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } }, scales: { y: { beginAtZero: true, grid: { color: mainGridColor }, ticks: { color: themeTextColor } }, x: { grid: { display: false }, ticks: { color: themeTextColor } } } }
            });
        }

        // Weekly
        if (document.getElementById('weeklyStatsChart')) {
            const wCtx = document.getElementById('weeklyStatsChart').getContext('2d');
            if (weeklyChartInstance) weeklyChartInstance.destroy();
            if (weekChartTitle) weekChartTitle.innerHTML = `${monthNames[chartMonth]} / ${chartWeek}. Hafta Günlük Dağılım <small style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(Dersleri görmek için günlere tıklayın)</small>`;
            let wLabels = [], wData = [];
            currentWeekDataMap = [];
            const startDay = (chartWeek - 1) * 7 + 1;
            const endDay = chartWeek === 5 ? 31 : Math.min(startDay + 6, 31);
            for (let i = startDay; i <= endDay; i++) {
                const testDate = new Date(chartYear, chartMonth, i);
                if (testDate.getMonth() !== chartMonth) break;
                const dStr = testDate.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
                const displayStr = testDate.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
                wLabels.push(displayStr);
                currentWeekDataMap.push(dStr);
                wData.push(getDailyTotal(dStr));
            }
            weeklyChartInstance = new Chart(wCtx, {
                type: 'bar',
                data: { labels: wLabels, datasets: [{ label: 'Çalışma (Dakika)', data: wData, backgroundColor: barNormal, hoverBackgroundColor: barHover, borderRadius: 6, borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, onClick: (e, activeEls) => { if (activeEls.length > 0) { showDailyDetails(currentWeekDataMap[activeEls[0].index]); } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } }, scales: { y: { beginAtZero: true, grid: { color: mainGridColor }, ticks: { color: themeTextColor } }, x: { grid: { display: false }, ticks: { color: themeTextColor } } } }
            });
        }
    }

    function showDailyDetails(dateStr) {
        const dailyStatsPanel = document.getElementById('dailyStatsPanel');
        const dailyStatsTitle = document.getElementById('dailyStatsTitle');
        const dailyStatsList = document.getElementById('dailyStatsList');
        const dailyStatsTotal = document.getElementById('dailyStatsTotal');
        if (!dailyStatsPanel) return;
        const d = new Date(dateStr);
        dailyStatsTitle.textContent = `${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })} Günü Özeti`;
        dailyStatsList.innerHTML = "";
        const subjects = getDailySubjects(dateStr);
        let total = 0;
        const totalRaw = getDailyTotal(dateStr);
        if (Object.keys(subjects).length === 0) {
            dailyStatsList.innerHTML = "<li style='color: var(--text-muted); text-align: center; font-style: italic; padding: 10px;'>O güne ait sadece genel süre var veya detaylı ders kaydı yok.</li>";
            total = totalRaw;
        } else {
            for (let subjId in subjects) {
                let name = "Bilinmeyen Ders";
                if (subjId === 'general') name = "Genel (Ders Bağımsız)";
                else { const found = appData.find(s => s.id === subjId); if (found) name = found.name; }
                const min = subjects[subjId];
                total += min;
                const li = document.createElement('li');
                li.style.cssText = "padding:10px; border-bottom:1px solid var(--glass-border); display:flex; justify-content:space-between; color:var(--text-color);";
                li.innerHTML = `<span><i class="fas fa-book-open" style="color:var(--primary-color);"></i> ${name}</span> <strong>${formatTime(min)}</strong>`;
                dailyStatsList.appendChild(li);
            }
        }
        dailyStatsTotal.innerHTML = `Toplam Günlük Çalışma: <span style="color: var(--primary-color);">${formatTime(totalRaw)}</span>`;
        if (total === 0 && totalRaw === 0) { dailyStatsTotal.innerHTML = `Bu gün çalışılmamış.`; dailyStatsList.innerHTML = ""; }
        dailyStatsPanel.style.display = "block";
    }

    function openStats() {
        // Switch to stats tab
        navItems.forEach(n => n.classList.remove("active"));
        tabPanes.forEach(t => t.classList.remove("active"));
        sidebarStatsBtn.classList.add("active");
        const statsPane = document.getElementById("statsTab");
        if (statsPane) statsPane.classList.add("active");

        const statsTableBody = document.getElementById("statsTableBody");
        statsTableBody.innerHTML = "";
        const today = new Date();
        today.setHours(0,0,0,0);

        const dates = Object.keys(studyHistory).sort();
        let firstDate = new Date();
        if (dates.length > 0) firstDate = new Date(dates[0]);
        firstDate.setHours(0,0,0,0);
        const daysSinceStart = Math.max(1, Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) + 1);

        let daily = 0, weekly = 0, monthly = 0, yearly = 0;
        for (let dateStr in studyHistory) {
            const d = new Date(dateStr);
            d.setHours(0,0,0,0);
            const diffTime = Math.abs(today - d);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const minEntry = studyHistory[dateStr];
            const min = minEntry ? (typeof minEntry === 'number' ? minEntry : minEntry.total) : 0;
            if (diffDays === 0) daily += min;
            if (diffDays < 7) weekly += min;
            if (diffDays < 30) monthly += min;
            if (diffDays < 365) yearly += min;
        }

        const divW = Math.max(1, Math.min(7, daysSinceStart));
        const divM = Math.max(1, Math.min(30, daysSinceStart));
        const divY = Math.max(1, Math.min(365, daysSinceStart));

        const statsData = [
            { label: 'Günlük (Bugün)', total: daily, avg: daily },
            { label: 'Haftalık (Son 7 Gün)', total: weekly, avg: Math.round(weekly / divW) },
            { label: 'Aylık (Son 30 Gün)', total: monthly, avg: Math.round(monthly / divM) },
            { label: 'Yıllık (Son 365 Gün)', total: yearly, avg: Math.round(yearly / divY) }
        ];

        statsData.forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${s.label}</td><td><strong style="color: var(--primary-color);">${formatTime(s.total)}</strong></td><td>${formatTime(s.avg)} <small style="color:var(--text-muted); font-size: 11px;">/ gün</small></td>`;
            statsTableBody.appendChild(tr);
        });

        // Charts
        const isStatsLight = userProfile && userProfile.theme === 'light-pink';
        const primaryColor = isStatsLight ? '#f472b6' : '#3b82f6';
        const primaryHover = isStatsLight ? '#ec4899' : '#60a5fa';
        const gridColor = isStatsLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';
        const textColor = isStatsLight ? '#1e293b' : '#94a3b8';

        const subjectCtx = document.getElementById('subjectStatsChart').getContext('2d');
        if (subjectChartInstance) subjectChartInstance.destroy();
        const subjLabels = appData.map(s => s.name);
        const subjData = appData.map(s => s.studiedMinutes || 0);
        subjectChartInstance = new Chart(subjectCtx, {
            type: 'bar',
            data: { labels: subjLabels, datasets: [{ label: 'Toplam Çalışma (Dakika)', data: subjData, backgroundColor: primaryColor, hoverBackgroundColor: primaryHover, borderRadius: 6, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Derslere Göre Toplam Çalışma', color: 'white', font: { size: 16 } }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } }, scales: { y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } } }
        });

        chartYear = today.getFullYear();
        chartMonth = today.getMonth();
        chartWeek = Math.min(4, Math.floor((today.getDate() - 1) / 7)) + 1;
        const dailyStatsPanelEl = document.getElementById('dailyStatsPanel');
        if (dailyStatsPanelEl) dailyStatsPanelEl.style.display = "none";
        renderLinkedCharts();

        // Heatmap
        const heatmapContainer = document.getElementById("heatmapContainer");
        heatmapContainer.innerHTML = "";
        const heatmapDays = 90;
        for (let i = heatmapDays - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const minEntry = studyHistory[dStr];
            const studyMins = minEntry ? (typeof minEntry === 'number' ? minEntry : minEntry.total) : 0;
            const square = document.createElement("div");
            square.className = "heatmap-day";
            if (studyMins >= 120) square.classList.add("lvl-4");
            else if (studyMins >= 60) square.classList.add("lvl-3");
            else if (studyMins >= 30) square.classList.add("lvl-2");
            else if (studyMins > 0) square.classList.add("lvl-1");
            const displayStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            square.title = `${displayStr}: ${studyMins > 0 ? formatTime(studyMins) : 'Çalışılmadı'}`;
            heatmapContainer.appendChild(square);
        }
    }

    sidebarStatsBtn.addEventListener("click", openStats);

    // --- SUBJECT MODAL LOGIC ---
    openSubjectModalBtn.addEventListener("click", () => {
        addSubjectModal.classList.add("show");
        newSubjectName.focus();
    });
    closeModalBtn.addEventListener("click", () => addSubjectModal.classList.remove("show"));

    confirmAddSubjectBtn.addEventListener("click", async () => {
        const name = newSubjectName.value.trim();
        let image = newSubjectImage.value.trim();
        const importance = newSubjectImportance ? newSubjectImportance.value : 'medium';
        if (!name) { await openCustomAlert(`<i class="fas fa-exclamation-circle" style="color:#f59e0b;"></i> Uyarı`, "Lütfen bir ders adı girin!"); return; }
        if (!image) image = getRandomImage(name);
        appData.push({ id: Date.now().toString(), name, image, importance, studiedMinutes: 0, units: [] });
        saveData();
        renderSubjects();
        playDingSound();
        newSubjectName.value = "";
        newSubjectImage.value = "";
        if (newSubjectImportance) newSubjectImportance.value = "medium";
        addSubjectModal.classList.remove("show");
    });

    window.addEventListener("click", (e) => {
        if (e.target === addSubjectModal) addSubjectModal.classList.remove("show");
        if (e.target === noteModal) noteModal.classList.remove("show");
        if (e.target === timeModal) timeModal.classList.remove("show");
        if (e.target === welcomeModal) welcomeModal.classList.remove("show");
        if (e.target === profileModal) profileModal.classList.remove("show");
        if (e.target === alertModal) closeAlertModal(false);
    });

    // --- BACKUP / RESTORE ---
    exportDataBtn.addEventListener("click", () => {
        const exportObj = { appData, userGoals, studyHistory, userProfile, dailyStudyMinutes: localStorage.getItem('dailyStudyMinutes') || "0", lastLoginDate: localStorage.getItem('lastLoginDate') };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr);
        a.setAttribute("download", `study_tracker_backup_${todayStr}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        openCustomAlert("Başarılı", "Verileriniz başarıyla bilgisayarınıza indirildi.");
    });

    importDataInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.appData && data.userGoals) {
                    localStorage.setItem('studyTrackerData', JSON.stringify(data.appData));
                    localStorage.setItem('studyTrackerGoals', JSON.stringify(data.userGoals));
                    if (data.studyHistory) localStorage.setItem('studyTrackerHistory', JSON.stringify(data.studyHistory));
                    if (data.userProfile) localStorage.setItem('studyTrackerProfile', JSON.stringify(data.userProfile));
                    if (data.dailyStudyMinutes) localStorage.setItem('dailyStudyMinutes', data.dailyStudyMinutes);
                    if (data.lastLoginDate) localStorage.setItem('lastLoginDate', data.lastLoginDate);
                    const confirmed = await openCustomConfirm("<i class='fas fa-check-double' style='color:#10b981;'></i> Geri Yükleme Başarılı", "Veriler başarıyla yüklendi. Değişiklikleri görmek için sayfanın yenilenmesi gerekiyor. Yenilensin mi?", "Yenile", "Daha Sonra");
                    if (confirmed) location.reload();
                } else { openCustomAlert("Hata", "Geçersiz dosya formatı."); }
            } catch (err) { openCustomAlert("Hata", "Dosya okunurken bir hata oluştu."); }
        };
        reader.readAsText(file);
    });

    // --- WELCOME MODAL ---
    if (!sessionStorage.getItem('welcomeShown')) {
        const randomMotiv = motivations[Math.floor(Math.random() * motivations.length)];
        welcomeImage.style.backgroundImage = `url('${randomMotiv.image}')`;
        welcomeQuote.textContent = randomMotiv.text;
        welcomeModal.classList.add("show");
        sessionStorage.setItem('welcomeShown', 'true');
    }
    closeWelcomeBtn.addEventListener("click", () => welcomeModal.classList.remove("show"));

    // --- INIT DATA ---
    if (userGoals.length === 0 && appData.length === 0) {
        userGoals.push({ id: "101", text: "Haftalık minimum 500 TYT Matematik sorusu çöz", completed: false });
        localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
    }

    if (appData.length === 0) {
        appData.push({ id: Date.now().toString(), name: "Matematik", studiedMinutes: 45, image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&q=80&w=800", importance: "high", units: [ { id: "1", name: "Türev Konu Anlatımı", completed: false, notes: "", file: null }, { id: "2", name: "Limit Test Çözümü", completed: true, notes: "Formüllere dikkat", file: null } ] });
        dailyStudyMinutes += 45;
        if (!studyHistory[todayStr]) studyHistory[todayStr] = 0;
        studyHistory[todayStr] += 45;
        localStorage.setItem('studyTrackerHistory', JSON.stringify(studyHistory));
        updateGlobalTimeDisplay();
        saveData();
    }

    renderGoals();
    renderSubjects();

    // ============================================================
    // YENİ PREMİUM KRONOMETRE MOTORU
    // ============================================================
    (function() {
        let seconds = 0, displaySec = 0, isRunning = false, mode = "stopwatch", interval = null;
        let countdownTotal = 25 * 60; // for ring progress

        const box = document.getElementById("finalTimer");
        const handle = document.getElementById("finalHandle");
        const timeEl = document.getElementById("finalTime");
        const minInput = document.getElementById("finalMinInput");
        const ringFill = document.getElementById("timerRingFill");
        const modeMicro = document.getElementById("timerModeMicro");
        const startBtn = document.getElementById("finalStart");
        const pauseBtn = document.getElementById("finalPause");
        const finishBtn = document.getElementById("finalFinish");
        const tabStopwatch = document.getElementById("tabStopwatch");
        const tabCountdown = document.getElementById("tabCountdown");
        const inputGroup = document.getElementById("finalInputGroup");

        const CIRCUMFERENCE = 408; // 2 * PI * 65 (approx for r=65)

        function format(s) {
            const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
            return h > 0
                ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
                : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        }

        function updateRing() {
            if (!ringFill) return;
            if (mode === "stopwatch") {
                // ring fills as time goes - loop every 25 minutes for visual
                const loopSec = 25 * 60;
                const progress = (displaySec % loopSec) / loopSec;
                ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
            } else {
                if (countdownTotal <= 0) { ringFill.style.strokeDashoffset = 0; return; }
                const progress = displaySec / countdownTotal;
                ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
            }
        }

        function update() {
            timeEl.textContent = format(displaySec);
            updateRing();
        }

        function switchTab(newMode) {
            if (isRunning) return;
            mode = newMode;
            if (mode === "stopwatch") {
                tabStopwatch.classList.add("active-tab");
                tabCountdown.classList.remove("active-tab");
                inputGroup.style.display = "none";
                modeMicro.textContent = "KRONOMETRE";
                displaySec = 0; seconds = 0;
            } else {
                tabCountdown.classList.add("active-tab");
                tabStopwatch.classList.remove("active-tab");
                inputGroup.style.display = "flex";
                modeMicro.textContent = "GERİ SAYIM";
                countdownTotal = (parseInt(minInput.value) || 25) * 60;
                displaySec = countdownTotal;
                seconds = 0;
            }
            update();
        }

        tabStopwatch.addEventListener("click", () => switchTab("stopwatch"));
        tabCountdown.addEventListener("click", () => switchTab("countdown"));

        minInput.addEventListener("change", () => {
            if (!isRunning && mode === "countdown") {
                countdownTotal = (parseInt(minInput.value) || 25) * 60;
                displaySec = countdownTotal;
                seconds = 0;
                update();
            }
        });

        startBtn.addEventListener("click", () => {
            if (isRunning) return;
            if (mode === "countdown" && seconds === 0) {
                countdownTotal = (parseInt(minInput.value) || 25) * 60;
                displaySec = countdownTotal;
            }
            isRunning = true;
            startBtn.style.display = "none";
            pauseBtn.style.display = "flex";
            interval = setInterval(() => {
                seconds++;
                if (mode === "stopwatch") {
                    displaySec++;
                } else {
                    if (displaySec > 0) {
                        displaySec--;
                    } else {
                        // Time's up!
                        finishBtn.click();
                        return;
                    }
                }
                update();
            }, 1000);
        });

        pauseBtn.addEventListener("click", () => {
            isRunning = false;
            clearInterval(interval);
            pauseBtn.style.display = "none";
            startBtn.style.display = "flex";
        });

        finishBtn.addEventListener("click", async () => {
            isRunning = false;
            clearInterval(interval);
            pauseBtn.style.display = "none";
            startBtn.style.display = "flex";

            const worked = Math.floor(seconds / 60);
            if (worked > 0) {
                const confirmed = await openCustomConfirm(
                    "⏱ Çalışma Bitti!",
                    `<strong>${worked} dakika</strong> çalıştın. Bu süreyi istatistiklere kaydetmek ister misin?`,
                    "Evet, Kaydet", "Hayır"
                );
                if (confirmed) openTimeModal(currentSubjectId || 'general', Math.floor(worked / 60), worked % 60);
            } else if (seconds > 0) {
                openCustomAlert("Bilgi", "1 dakikadan az çalışmalar kaydedilmez.");
            }

            seconds = 0;
            displaySec = mode === "countdown" ? countdownTotal : 0;
            update();
        });

        // DRAG
        let drag = false, ox, oy, bx, by;
        handle.addEventListener("mousedown", (e) => {
            drag = true;
            const rect = box.getBoundingClientRect();
            bx = rect.left; by = rect.top;
            ox = e.clientX; oy = e.clientY;
            box.style.bottom = "auto"; box.style.right = "auto";
            box.style.left = bx + "px"; box.style.top = by + "px";
            e.preventDefault();
        });
        document.addEventListener("mousemove", (e) => {
            if (!drag) return;
            box.style.left = (bx + (e.clientX - ox)) + "px";
            box.style.top = (by + (e.clientY - oy)) + "px";
        });
        document.addEventListener("mouseup", () => { drag = false; });

        // Touch drag support
        handle.addEventListener("touchstart", (e) => {
            drag = true;
            const rect = box.getBoundingClientRect();
            bx = rect.left; by = rect.top;
            ox = e.touches[0].clientX; oy = e.touches[0].clientY;
            box.style.bottom = "auto"; box.style.right = "auto";
            box.style.left = bx + "px"; box.style.top = by + "px";
        }, { passive: true });
        document.addEventListener("touchmove", (e) => {
            if (!drag) return;
            box.style.left = (bx + (e.touches[0].clientX - ox)) + "px";
            box.style.top = (by + (e.touches[0].clientY - oy)) + "px";
        }, { passive: true });
        document.addEventListener("touchend", () => { drag = false; });

        update();
    })();
    // --- HIZLI TEMA DEĞİŞTİRME SİSTEMİ ---
const quickThemeToggle = document.getElementById("quickThemeToggle");

if (quickThemeToggle) {
    const updateThemeIcon = () => {
        if (document.body.classList.contains("theme-light-pink")) {
            quickThemeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            quickThemeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    };

    updateThemeIcon();

    quickThemeToggle.addEventListener("click", () => {
        document.body.classList.toggle("theme-light-pink");
        updateThemeIcon();

        userProfile.theme = document.body.classList.contains("theme-light-pink") ? "light-pink" : "dark-blue";
        localStorage.setItem('studyTrackerProfile', JSON.stringify(userProfile));
    });
}
});