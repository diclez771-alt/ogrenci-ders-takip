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
    "türkçe": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800", // Kitap
    "matematik": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800", // Sayılar/Hesap makinesi
    "fizik": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800", // Atom/Enerji
    "kimya": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800", // Deney tüpleri
    "coğrafya": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800", // Dünya/Harita
    "tarih": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800", // Antik yapılar/Saat
    "default": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800" // Açık Kitap/Kalem (Diğer her şey için)
};

    const motivations = [
        { text: "\"Başarı, her gün tekrarlanan küçük çabaların toplamıdır.\" - Robert Collier", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Gelecek, bugünden ona hazırlananlara aittir.\" - Malcolm X", image: "https://images.unsplash.com/photo-1513258496099-481620202119?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Eğer hayal edebiliyorsan, yapabilirsin.\" - Walt Disney", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Zorluklar, sıradan insanları sıra dışı bir kadere hazırlar.\" - C.S. Lewis", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" },
        { text: "\"Vazgeçmediğin sürece ne kadar yavaş gittiğinin bir önemi yoktur.\" - Konfüçyüs", image: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&q=80&w=800" }
    ];

   // 91. satırdaki 'getRandomImage' fonksiyonunu şununla değiştir:
function getRandomImage(lessonName = "") {
    // Gelen ders ismini küçük harfe çevirip boşlukları temizler (Örn: "Matematik " -> "matematik")
    const name = lessonName.toString().trim().toLowerCase();

    // Eğer ders ismi yukarıdaki listede varsa o görseli, yoksa "default" (açık kitap) görselini döndürür
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
    const profileThemeInput = document.getElementById("profileThemeInput");
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
    
    // File upload elements
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
    
    // Stats Modal
    const sidebarStatsBtn = document.getElementById("sidebarStatsBtn");
    const statsModal = document.getElementById("statsModal");
    const closeStatsModalBtn = document.getElementById("closeStatsModalBtn");
    const statsTableBody = document.getElementById("statsTableBody");

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
                // Basic hex normalization for glow effect
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
            // Add subtle glow
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
        
        // Hoşgeldin paneline ismini de yansıtalım
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
        profileThemeInput.value = userProfile.theme || "dark-blue";
        profileModal.classList.add("show");
    });

    closeProfileModalBtn.addEventListener("click", () => profileModal.classList.remove("show"));

    saveProfileBtn.addEventListener("click", () => {
        userProfile.name = profileNameInput.value.trim() || "Öğrenci";
        userProfile.goal = profileGoalInput.value.trim() || "Hedef Belirlenmedi";
        userProfile.image = profileImageInput.value.trim();
        userProfile.theme = profileThemeInput.value;

        localStorage.setItem('studyTrackerProfile', JSON.stringify(userProfile));
        renderProfile();
        
        if (userProfile.theme === "light-pink") {
            document.body.classList.add("theme-light-pink");
        } else {
            document.body.classList.remove("theme-light-pink");
        }
        
        profileModal.classList.remove("show");
    });

    renderProfile(); // Initial render

    // --- GOALS FUNCTIONS ---
    function renderGoals() {
        goalList.innerHTML = "";
        if (userGoals.length === 0) {
            goalList.innerHTML = "<p style='color: var(--text-muted); font-size: 14px;'>Henüz bir hedefin yok. Başlamak bitirmenin yarısıdır!</p>";
            return;
        }

        userGoals.forEach(goal => {
            const li = document.createElement("li");
            li.className = `task-item ${goal.completed ? 'completed' : ''}`;
            
            const span = document.createElement("span");
            span.style.flex = "1";
            let spanHtml = `<strong>${goal.text}</strong>`;
            
            if (goal.deadline) {
                const today = new Date();
                today.setHours(0,0,0,0);
                const deadlineDate = new Date(goal.deadline);
                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let badgeColor = "#10b981"; // green
                let badgeText = `${diffDays} gün kaldı`;
                if (diffDays < 0) { badgeColor = "#ef4444"; badgeText = "Süresi Geçti"; }
                else if (diffDays === 0) { badgeColor = "#f59e0b"; badgeText = "Bugün Son!"; }
                else if (diffDays <= 2) { badgeColor = "#f59e0b"; badgeText = `${diffDays} gün kaldı`; }

                if (goal.completed) badgeColor = "var(--text-muted)";

                spanHtml += `<br><span style="display:inline-block; margin-top:5px; font-size:11px; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.1); color:${badgeColor};"><i class="far fa-calendar-alt"></i> ${badgeText} (${goal.deadline})</span>`;
            }
            span.innerHTML = spanHtml;

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "task-actions";

            const completeBtn = document.createElement("button");
            completeBtn.className = "complete-btn";
            completeBtn.innerHTML = goal.completed ? '<i class="fas fa-times-circle"></i> Geri Al' : '<i class="fas fa-check-circle"></i> Tamam';
            completeBtn.onclick = () => {
                goal.completed = !goal.completed;
                if (goal.completed) playSuccessSound();
                localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
                renderGoals();
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Sil';
            deleteBtn.onclick = () => {
                li.animate([
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(0.9)' }
                ], { duration: 200 }).onfinish = () => {
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

    addGoalBtn.addEventListener("click", () => {
        const text = goalInput.value.trim();
        const dateVal = goalDateInput.value;
        if (text) {
            userGoals.push({
                id: Date.now().toString(),
                text: text,
                deadline: dateVal || null,
                completed: false
            });
            localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
            goalInput.value = "";
            goalDateInput.value = "";
            renderGoals();
            playDingSound();
        }
    });

    goalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addGoalBtn.click();
    });

    // --- RENDER SUBJECTS ---
    function renderSubjects() {
        subjectGrid.innerHTML = "";
        
        if (appData.length === 0) {
            subjectGrid.innerHTML = "<p style='color: var(--text-muted); grid-column: 1/-1;'>Henüz hiç ders eklemediniz. 'Yeni Ders Ekle' butonundan başlayabilirsiniz.</p>";
            return;
        }

        // Sort dynamically based on importance
        const sortedData = [...appData].sort((a, b) => {
            const p = { 'high': 3, 'medium': 2, 'low': 1 };
            const pA = p[a.importance || 'medium'];
            const pB = p[b.importance || 'medium'];
            return pB - pA;
        });

        // Calculate total weight to distribute the daily AI study budget (e.g. 6 hours / 360 mins)
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

            // AI TIME CALCULATION: Proportion of 360 mins (6 hrs) daily pool
            let recMinutes = Math.round((weight / totalWeights) * 360);
            
            // Cap extreme values so it's realistic (e.g., if there's only 1 subject, don't recommend 6 hours)
            if (weight === 3) recMinutes = Math.min(180, Math.max(60, recMinutes)); // High: 1 - 3 hours
            else if (weight === 2) recMinutes = Math.min(120, Math.max(40, recMinutes)); // Mid: 40m - 2 hours
            else if (weight === 1) recMinutes = Math.min(60, Math.max(20, recMinutes)); // Low: 20m - 1 hour
            
            // Round to nearest 5 for clean numbers
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

            // Note preview indicator
            if (unit.notes && unit.notes.trim() !== "") {
                const notePreview = document.createElement("div");
                notePreview.className = "unit-note-preview";
                notePreview.innerHTML = `<i class="fas fa-sticky-note"></i> Not eklendi`;
                contentDiv.appendChild(notePreview);
            }
            
            // File attachment indicator
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
    
    // Back from Units view
    backToSubjectsBtn.addEventListener("click", () => {
        unitView.style.display = "none";
        subjectView.style.display = "block";
        currentSubjectId = null;
        renderSubjects(); // Update overall progress and time shown
    });

    // Add Unit
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

    // --- NOTE MODAL LOGIC & FILE UPLOAD ---
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

        // Size check: ~1.5MB max for local storage reasons
        if (file.size > 1.5 * 1024 * 1024) {
            openCustomAlert(`<i class="fas fa-exclamation-triangle" style="color:var(--danger-color);"></i> Hata`, "Dosya boyutu sistem sınırları gereği 1.5MB'dan büyük olamaz!");
            unitFileInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            currentNoteFile = {
                name: file.name,
                data: ev.target.result // Base64 chunk
            };
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

    closeTimeModalBtn.addEventListener("click", () => {
        timeModal.classList.remove("show");
    });

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
        
        // Save to History for Statistics
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

    // --- STATS MODAL LOGIC ---
    let subjectChartInstance = null;
    let yearlyChartInstance = null;
    let monthlyChartInstance = null;
    let weeklyChartInstance = null;
    
    let chartYear = new Date().getFullYear();
    let chartMonth = new Date().getMonth();
    let chartWeek = 1;
    let currentWeekDataMap = [];
    
    const yearChartTitle = document.getElementById('yearChartTitle');
    const monthChartTitle = document.getElementById('monthChartTitle');
    const weekChartTitle = document.getElementById('weekChartTitle');
    
    const dailyStatsPanel = document.getElementById('dailyStatsPanel');
    const dailyStatsTitle = document.getElementById('dailyStatsTitle');
    const dailyStatsList = document.getElementById('dailyStatsList');
    const dailyStatsTotal = document.getElementById('dailyStatsTotal');

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
        
        // 1. Yıllık Grafik
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
                data: {
                    labels: yLabels,
                    datasets: [{
                        label: 'Çalışma (Dakika)',
                        data: yData,
                        backgroundColor: yData.map((v, i) => i === chartMonth ? barActive : barNormal),
                        hoverBackgroundColor: barHover,
                        borderRadius: 6, borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    onClick: (e, activeEls) => {
                        if (activeEls.length > 0) {
                            chartMonth = activeEls[0].index;
                            chartWeek = 1;
                            renderLinkedCharts();
                        }
                    },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } },
                    scales: { y: { beginAtZero: true, grid: { color: mainGridColor }, ticks: { color: themeTextColor } }, x: { grid: { display: false }, ticks: { color: themeTextColor } } }
                }
            });
        }
        
        // 2. Aylık Grafik
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
                data: {
                    labels: mLabels,
                    datasets: [{
                        label: 'Çalışma (Dakika)',
                        data: mData,
                        backgroundColor: mData.map((v, i) => i === (chartWeek - 1) ? barActive : barNormal),
                        hoverBackgroundColor: barHover,
                        borderRadius: 6, borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    onClick: (e, activeEls) => {
                        if (activeEls.length > 0) {
                            chartWeek = activeEls[0].index + 1;
                            renderLinkedCharts();
                        }
                    },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } },
                    scales: { y: { beginAtZero: true, grid: { color: mainGridColor }, ticks: { color: themeTextColor } }, x: { grid: { display: false }, ticks: { color: themeTextColor } } }
                }
            });
        }
        
        // 3. Haftalık Grafik
        if (document.getElementById('weeklyStatsChart')) {
            const wCtx = document.getElementById('weeklyStatsChart').getContext('2d');
            if (weeklyChartInstance) weeklyChartInstance.destroy();
            
            if (weekChartTitle) weekChartTitle.innerHTML = `${monthNames[chartMonth]} / ${chartWeek}. Hafta Günlük Dağılım <small style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(Dersleri görmek için günlere tıklayın)</small>`;
            let wLabels = [];
            let wData = [];
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
                data: {
                    labels: wLabels,
                    datasets: [{
                        label: 'Çalışma (Dakika)',
                        data: wData,
                        backgroundColor: barNormal,
                        hoverBackgroundColor: barHover,
                        borderRadius: 6, borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    onClick: (e, activeEls) => {
                        if (activeEls.length > 0) {
                            showDailyDetails(currentWeekDataMap[activeEls[0].index]);
                        }
                    },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + formatTime(c.raw) } } },
                    scales: { y: { beginAtZero: true, grid: { color: mainGridColor }, ticks: { color: themeTextColor } }, x: { grid: { display: false }, ticks: { color: themeTextColor } } }
                }
            });
        }
    }

    function showDailyDetails(dateStr) {
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
                else {
                    const found = appData.find(s => s.id === subjId);
                    if (found) name = found.name;
                }
                const min = subjects[subjId];
                total += min;
                
                const li = document.createElement('li');
                li.style.padding = "10px";
                li.style.borderBottom = "1px solid var(--glass-border)";
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.color = "var(--text-color)";
                li.innerHTML = `<span><i class="fas fa-book-open" style="color:var(--primary-color);"></i> ${name}</span> <strong>${formatTime(min)}</strong>`;
                dailyStatsList.appendChild(li);
            }
        }
        
        dailyStatsTotal.innerHTML = `Toplam Günlük Çalışma: <span style="color: var(--primary-color);">${formatTime(totalRaw)}</span>`;
        if (total === 0 && totalRaw === 0) {
            dailyStatsTotal.innerHTML = `Bu gün çalışılmamış.`;
            dailyStatsList.innerHTML = "";
        }
        
        dailyStatsPanel.style.display = "block";
    }

    function openStats() {
        statsTableBody.innerHTML = "";
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const dates = Object.keys(studyHistory).sort();
        let firstDate = new Date();
        if (dates.length > 0) {
            firstDate = new Date(dates[0]);
        }
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
            tr.innerHTML = `
                <td>${s.label}</td>
                <td><strong style="color: var(--primary-color);">${formatTime(s.total)}</strong></td>
                <td>${formatTime(s.avg)} <small style="color:var(--text-muted); font-size: 11px;">/ gün</small></td>
            `;
            statsTableBody.appendChild(tr);
        });

        // --- CHARTS RENDER ---
        const isStatsLight = userProfile && userProfile.theme === 'light-pink';
        const primaryColor = isStatsLight ? '#f472b6' : '#3b82f6';
        const primaryHover = isStatsLight ? '#ec4899' : '#60a5fa';
        const gridColor = isStatsLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';
        const textColor = isStatsLight ? '#1e293b' : '#94a3b8';

        // 1. Derslere Göre Grafik
        const subjectCtx = document.getElementById('subjectStatsChart').getContext('2d');
        if (subjectChartInstance) subjectChartInstance.destroy();

        const subjLabels = appData.map(s => s.name);
        const subjData = appData.map(s => s.studiedMinutes || 0);

        subjectChartInstance = new Chart(subjectCtx, {
            type: 'bar',
            data: {
                labels: subjLabels,
                datasets: [{
                    label: 'Toplam Çalışma (Dakika)',
                    data: subjData,
                    backgroundColor: primaryColor,
                    hoverBackgroundColor: primaryHover,
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Derslere Göre Toplam Çalışma', color: 'white', font: { size: 16 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' ' + formatTime(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });

        // 2. Dinamik Zaman Çizelgesi (Linked Charts)
        chartYear = today.getFullYear();
        chartMonth = today.getMonth();
        chartWeek = Math.min(4, Math.floor((today.getDate() - 1) / 7)) + 1;
        if(dailyStatsPanel) dailyStatsPanel.style.display = "none";
        renderLinkedCharts();

        // 3. Çalışma Isı Haritası (Heatmap)
        const heatmapContainer = document.getElementById("heatmapContainer");
        heatmapContainer.innerHTML = "";
        const heatmapDays = 90; // Son 90 gün
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

        statsModal.classList.add("show");
    }

    sidebarStatsBtn.addEventListener("click", openStats);
    closeStatsModalBtn.addEventListener("click", () => statsModal.classList.remove("show"));


    // --- SUBJECT MODAL LOGIC ---
    openSubjectModalBtn.addEventListener("click", () => {
        addSubjectModal.classList.add("show");
        newSubjectName.focus();
    });

    closeModalBtn.addEventListener("click", () => {
        addSubjectModal.classList.remove("show");
    });

    confirmAddSubjectBtn.addEventListener("click", async () => {
        const name = newSubjectName.value.trim();
        let image = newSubjectImage.value.trim();
        const importance = newSubjectImportance ? newSubjectImportance.value : 'medium';

        if (!name) {
            await openCustomAlert(`<i class="fas fa-exclamation-circle" style="color:#f59e0b;"></i> Uyarı`, "Lütfen bir ders adı girin!");
            return;
        }
        if (!image) image = getRandomImage(name);

        appData.push({
            id: Date.now().toString(),
            name: name,
            image: image,
            importance: importance,
            studiedMinutes: 0,
            units: []
        });

        saveData();
        renderSubjects();
        playDingSound();
        
        newSubjectName.value = "";
        newSubjectImage.value = "";
        if (newSubjectImportance) newSubjectImportance.value = "medium";
        addSubjectModal.classList.remove("show");
    });

    // Modal Background Close Handle
    window.addEventListener("click", (e) => {
        if (e.target === addSubjectModal) addSubjectModal.classList.remove("show");
        if (e.target === noteModal) noteModal.classList.remove("show");
        if (e.target === timeModal) timeModal.classList.remove("show");
        if (e.target === statsModal) statsModal.classList.remove("show");
        if (e.target === welcomeModal) welcomeModal.classList.remove("show");
        if (e.target === profileModal) profileModal.classList.remove("show");
        if (e.target === alertModal) closeAlertModal(false);
    });

    // --- BACKUP / RESTORE ---
    exportDataBtn.addEventListener("click", () => {
        const exportObj = {
            appData,
            userGoals,
            studyHistory,
            userProfile,
            dailyStudyMinutes: localStorage.getItem('dailyStudyMinutes') || "0",
            lastLoginDate: localStorage.getItem('lastLoginDate')
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `study_tracker_backup_${todayStr}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
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
                } else {
                    openCustomAlert("Hata", "Geçersiz dosya formatı.");
                }
            } catch (err) {
                openCustomAlert("Hata", "Dosya okunurken bir hata oluştu.");
            }
        };
        reader.readAsText(file);
    });

    // --- MOTIVATION MODAL SYSTEM ---
    if (!sessionStorage.getItem('welcomeShown')) {
        const randomMotiv = motivations[Math.floor(Math.random() * motivations.length)];
        welcomeImage.style.backgroundImage = `url('${randomMotiv.image}')`;
        welcomeQuote.textContent = randomMotiv.text;
        welcomeModal.classList.add("show");
        sessionStorage.setItem('welcomeShown', 'true');
    }

    closeWelcomeBtn.addEventListener("click", () => {
        welcomeModal.classList.remove("show");
    });

    // --- INITIALIZE INIT ---
    if (userGoals.length === 0 && appData.length === 0) {
        userGoals.push({ id: "101", text: "Haftalık minimum 500 TYT Matematik sorusu çöz", completed: false });
        localStorage.setItem('studyTrackerGoals', JSON.stringify(userGoals));
    }

    if (appData.length === 0) {
        appData.push({
            id: Date.now().toString(),
            name: "Matematik",
            studiedMinutes: 45, // Demo usage
            image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&q=80&w=800",
            importance: "high",
            units: [
                { id: "1", name: "Türev Konu Anlatımı", completed: false, notes: "", file: null },
                { id: "2", name: "Limit Test Çözümü", completed: true, notes: "Formüllere dikkat", file: null }
            ]
        });
        dailyStudyMinutes += 45; // Matching demo initial state if fresh day
        
        // Initial setup for history
        if (!studyHistory[todayStr]) studyHistory[todayStr] = 0;
        studyHistory[todayStr] += 45;
        localStorage.setItem('studyTrackerHistory', JSON.stringify(studyHistory));

        updateGlobalTimeDisplay();
        saveData();
    }
    
    // --- TIMER LOGIC ---
    let timerSeconds = 0;
    let timerInterval = null;
    let isTimerPlaying = false;
    
    let timerMode = "stopwatch"; // "stopwatch" or "pomodoro"
    const POMODORO_MINS = 25;

    const timerDisplay = document.getElementById("timerDisplay");
    const timerModeLabel = document.getElementById("timerModeLabel");
    const timerModeToggleBtn = document.getElementById("timerModeToggleBtn");
    
    const timerPlayBtn = document.getElementById("timerPlayBtn");
    const timerPauseBtn = document.getElementById("timerPauseBtn");
    const timerStopBtn = document.getElementById("timerStopBtn");

    function updateTimerDisplay() {
       const customValue = parseInt(document.getElementById("timerMinutesInput")?.value);
    if (!isTimerPlaying && !isNaN(customValue) && customValue > 0 && timerSeconds === 0) {
        timerSeconds = customValue * 60;
    }
        const h = Math.floor(timerSeconds / 3600);
        const m = Math.floor((timerSeconds % 3600) / 60);
        const s = timerSeconds % 60;
        if (h > 0) {
            timerDisplay.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        } else {
            timerDisplay.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }
    }

    timerModeToggleBtn.addEventListener("click", () => {
        if (isTimerPlaying) {
            openCustomAlert(`<i class="fas fa-exclamation-circle" style="color:#f59e0b;"></i> Uyarı`, "Sayacı durdurmadan mod değiştiremezsin.");
            return;
        }
        playDingSound();
        if (timerMode === "stopwatch") {
            timerMode = "pomodoro";
            // 1378. satırı şununla değiştir:
// 1379. satıra bunu yapıştır:
        const customMins = parseInt(document.getElementById("timerMinutesInput").value);
        timerSeconds = (!isNaN(customMins) && customMins > 0) ? customMins * 60 : POMODORO_MINS * 60;

        timerModeLabel.style.color = "#f59e0b";
        updateTimerDisplay();
    } else {
        // Stopwatch modu kısmı (burası kalsın)
        timerMode = "stopwatch";
        timerModeLabel.textContent = "Kronometre";
        timerModeLabel.style.color = "inherit";
        timerSeconds = 0;
        updateTimerDisplay();
    }
});

// BAŞLAT BUTONU MANTIĞI
timerPlayBtn.onclick = () => {
    if (!isTimerPlaying) {
        const inputVal = parseInt(document.getElementById("timerMinutesInput").value);

        // Eğer kutu doluysa o süreyi, boşsa mevcut süreyi başlat
        if (!isNaN(inputVal) && inputVal > 0 && timerSeconds <= 0) {
            timerSeconds = inputVal * 60;
        }

        isTimerPlaying = true;
        timerPlayBtn.style.display = "none";
        timerPauseBtn.style.display = "flex";
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            if (timerMode === "stopwatch") {
                timerSeconds++;
            } else {
                if (timerSeconds > 0) {
                    timerSeconds--;
                } else {
                    clearInterval(timerInterval);
                    isTimerPlaying = false;
                    timerPauseBtn.style.display = "none";
                    timerPlayBtn.style.display = "flex";
                    if (typeof playSuccessSound === "function") playSuccessSound();
                    if (document.getElementById("timerStopBtn")) document.getElementById("timerStopBtn").click();
                }
            }
            updateTimerDisplay();
        }, 1000);
    }
};

// DURDURMA BUTONU (Burası da silinmiş olabilir, mutlaka ekle)
timerPauseBtn.onclick = () => {
    isTimerPlaying = false;
    timerPauseBtn.style.display = "none";
    timerPlayBtn.style.display = "flex";
    clearInterval(timerInterval);
};


    timerPauseBtn.addEventListener("click", () => {
        if (isTimerPlaying) {
            isTimerPlaying = false;
            timerPauseBtn.style.display = "none";
            timerPlayBtn.style.display = "flex";
            clearInterval(timerInterval);
        }
    });

    timerStopBtn.addEventListener("click", async () => {
        let workedSeconds = timerMode === "stopwatch" ? timerSeconds : (POMODORO_MINS * 60) - timerSeconds;
        if (workedSeconds === 0) return;
        
        isTimerPlaying = false;
        clearInterval(timerInterval);
        timerPauseBtn.style.display = "none";
        timerPlayBtn.style.display = "flex";

        const totalMinutes = Math.floor(workedSeconds / 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        if (totalMinutes > 0) {
            const confirmed = await openCustomConfirm(
                `<i class="fas fa-star" style="color:#fbbf24;"></i> Süre Tamamlandı!`, 
                `Mükemmel! Toplam <b>${h > 0 ? h + ' saat ' : ''}${m} dakika</b> çalıştın.\n\nBu süreyi bugünün verilerine eklemek ister misin?`,
                "Evet, Kaydet", "Kapat"
            );
            if (confirmed) {
                openTimeModal(currentSubjectId || 'general', h, m);
            }
        } else {
            await openCustomAlert(`<i class="fas fa-info-circle" style="color:#60a5fa;"></i> Bilgi`, "Şu an kaydedilebilecek bir süre (en az 1 dakika) oluşmadı. Ekranda kronometre sıfırlanacaktır.");
        }

        if (timerMode === "stopwatch") timerSeconds = 0;
        else timerSeconds = POMODORO_MINS * 60;
        updateTimerDisplay();
    });

    // --- FLOATING TIMER DRAG LOGIC ---
    const floatingTimer = document.getElementById("floatingTimer");
    let isDraggingTimer = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let timerInitialX = 0;
    let timerInitialY = 0;

    floatingTimer.style.cursor = "grab";
    
    floatingTimer.addEventListener("mousedown", (e) => {
        // Butonlara tıklanırsa sürüklemeyi tetikleme
        if(e.target.closest("button") || e.target.nodeName === "INPUT") return;

        isDraggingTimer = true;
        floatingTimer.style.cursor = "grabbing";
        floatingTimer.classList.add("is-dragging");
        
        const rect = floatingTimer.getBoundingClientRect();
        timerInitialX = rect.left;
        timerInitialY = rect.top;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        // Transition kaldırılıyor ve sabit koordinata geçiliyor
        floatingTimer.style.transition = "none";
        floatingTimer.style.bottom = "auto";
        floatingTimer.style.right = "auto";
        
        floatingTimer.style.top = Math.max(0, timerInitialY) + "px";
        floatingTimer.style.left = Math.max(0, timerInitialX) + "px";

        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDraggingTimer) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        
        let newX = timerInitialX + dx;
        let newY = timerInitialY + dy;
        
        // Ekrandan (Vievport) taşmasını engelleme
        const maxX = window.innerWidth - floatingTimer.offsetWidth;
        const maxY = window.innerHeight - floatingTimer.offsetHeight;
        
        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(0, newY), maxY);

        floatingTimer.style.left = newX + "px";
        floatingTimer.style.top = newY + "px";
    });

    document.addEventListener("mouseup", () => {
        if (isDraggingTimer) {
            isDraggingTimer = false;
            floatingTimer.style.cursor = "grab";
            floatingTimer.style.transition = "transform 0.3s ease, box-shadow 0.3s ease"; 
            floatingTimer.classList.remove("is-dragging");
        }
    });

    renderGoals();
    renderSubjects();

    // Süre belirleme mantığı
const minutesInput = document.getElementById('timerMinutesInput');
const playBtn = document.getElementById('timerPlayBtn');

// Başlat butonuna basıldığında eğer kutuda sayı varsa o süreyi kullan
playBtn.addEventListener('click', () => {
    const customMinutes = parseInt(minutesInput.value);

    // Eğer bir sayı girilmişse ve şu an süre çalışmıyorsa süreyi güncelle
    if (!isNaN(customMinutes) && customMinutes > 0) {
        // Bu kısım senin mevcut script.js içindeki değişken ismine göre değişebilir
        // Genelde 'timeLeft' veya 'totalSeconds' kullanılır.
        // Eğer süre 25:00'dan başlıyorsa, o değişkeni burada güncelliyoruz:
        timeLeft = customMinutes * 60;
        updateTimerDisplay(); // Ekranı güncelle (00:00:00 formatında)
    }
});


});
// DOSYANIN EN ALTINA YAPIŞTIR
const customInput = document.getElementById("timerMinutesInput");

// Oynat butonuna tıklandığında her şeyi durdur ve sadece bizim süremizi kur
timerPlayBtn.addEventListener("click", () => {
    const val = parseInt(customInput.value);

    // Eğer kutuda bir sayı varsa ve süre şu an 25:00 ise (yani yeni başlıyorsa)
    if (!isNaN(val) && val > 0 && (timerSeconds === 1500 || timerSeconds === 0)) {
        timerSeconds = val * 60;
        updateTimerDisplay();
    }
}, true); // 'true' parametresi bu işlemin diğerlerinden önce yapılmasını sağlar

// DOSYANIN EN ALTINA YAPIŞTIR
document.getElementById("timerPlayBtn").addEventListener("click", () => {
    const customInput = document.getElementById("timerMinutesInput");
    const val = parseInt(customInput.value);

    // Eğer kutuda bir sayı varsa, her şeyi durdur ve sadece bizim süremizi kur
    if (!isNaN(val) && val > 0) {
        timerSeconds = val * 60;
        // Ekranı anında güncelle (25:00 yerine yazdığın sayı görünsün)
        if (typeof updateTimerDisplay === "function") {
            updateTimerDisplay();
        }
    }
}, true); // 'true' parametresi bu işlemin diğer kodlardan ÖNCE çalışmasını sağlar


// DOSYANIN EN ALTINA EKLE
document.getElementById("timerPlayBtn").onclick = function() {
    const input = document.getElementById("timerMinutesInput");
    const val = parseInt(input.value);

    // Eğer kutuda bir sayı varsa ve şu an duruyorsak, süreyi zorla güncelle
    if (!isTimerPlaying && !isNaN(val) && val > 0) {
        timerSeconds = val * 60;
        updateTimerDisplay();
    }

    // Eğer senin kodunda başlatma fonksiyonunun adı startTimer ise:
    if(typeof startTimer === "function") startTimer();
    // Eğer startCountdown ise:
    else if(typeof startCountdown === "function") startCountdown();
};

