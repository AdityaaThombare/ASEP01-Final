 $(document).ready(function() {
            let userSession = null;
            let moodLogs = [];
            let selectedMood = null;

            function navigate(view) {
                $('.view-section').removeClass('active');
                $(`#view-${view}`).addClass('active');
                window.scrollTo(0, 0);
            }

            function switchSubview(target) {
                $('.subview').addClass('d-none');
                $(`#subview-${target}`).removeClass('d-none');
                $('.sidebar-pill').removeClass('active');
                $(`.sidebar-pill[data-target="${target}"]`).addClass('active');
            }

            // Navigation Events
            $('.show-login').click(e => { e.preventDefault(); navigate('login'); });
            $('.show-register').click(e => { e.preventDefault(); navigate('register'); });
            $('#logoHome, #homeLink').click(e => { e.preventDefault(); navigate('landing'); });
            $('#appLink, #globalAvatar').click(e => {
                e.preventDefault();
                if(!userSession) navigate('login');
                else navigate('app');
            });

            $('.sidebar-pill').click(function() {
                switchSubview($(this).data('target'));
            });

            // Theme Toggle
            $('#modeSwitch').click(function() {
                const isDark = $('html').attr('data-bs-theme') === 'dark';
                $('html').attr('data-bs-theme', isDark ? 'light' : 'dark');
                $(this).find('i').toggleClass('fa-cloud-moon fa-cloud-sun');
            });

            // Auth Logic
            $('#loginForm, #registerForm').submit(function(e) {
                e.preventDefault();
                const name = $('#regFullName').val() || $('#profName').val() || "Friend";
                loginUser(name);
            });

            function loginUser(name) {
                userSession = { name: name, avatarSeed: name };
                updateUIDisplay();
                navigate('app');
                switchSubview('chat-main');
            }

            function updateUIDisplay() {
                const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${userSession.avatarSeed}&backgroundColor=ffd29d`;
                $('#globalAvatar, #profileAvatar').attr('src', avatarUrl);
                $('.logged-out-ui').addClass('d-none');
                $('.logged-in-ui').removeClass('d-none');
                $('#userHandle').text(userSession.name);
                $('#profName').val(userSession.name);
            }

            $('#logoutAction').click(function() {
                userSession = null;
                $('.logged-out-ui').removeClass('d-none');
                $('.logged-in-ui').addClass('d-none');
                navigate('landing');
            });

            // MOOD METER LOGIC
            $('.mood-meter-btn').click(function() {
                $('.mood-meter-btn').removeClass('selected');
                $(this).addClass('selected');
                selectedMood = {
                    emoji: $(this).text(),
                    label: $(this).data('mood')
                };
            });

            $('#logMoodBtn').click(function() {
                if(!selectedMood) return;
                
                const log = {
                    ...selectedMood,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toLocaleDateString()
                };
                
                moodLogs.unshift(log); // Add to front
                updateMoodHistoryUI();
                
                // Visual feedback
                const originalText = $(this).text();
                $(this).text('Logged! ✨').addClass('btn-success').removeClass('btn-primary');
                setTimeout(() => {
                    $(this).text(originalText).removeClass('btn-success').addClass('btn-primary');
                    $('.mood-meter-btn').removeClass('selected');
                    selectedMood = null;
                }, 2000);
            });

            function updateMoodHistoryUI() {
                const container = $('#moodHistoryList');
                if(moodLogs.length === 0) return;
                
                container.empty();
                moodLogs.forEach(log => {
                    container.append(`
                        <div class="mood-history-item shadow-sm">
                            <span class="fs-3 me-3">${log.emoji}</span>
                            <div class="flex-grow-1">
                                <h6 class="mb-0 fw-bold">Feeling ${log.label}</h6>
                                <small class="text-muted">${log.date} at ${log.timestamp}</small>
                            </div>
                            <i class="fas fa-chevron-right text-light"></i>
                        </div>
                    `);
                });
            }

            // PROFILE LOGIC
            $('#refreshAvatar').click(function(e) {
                e.preventDefault();
                userSession.avatarSeed = Math.random().toString(36).substring(7);
                updateUIDisplay();
            });

            $('#updateProfileForm').submit(function(e) {
                e.preventDefault();
                userSession.name = $('#profName').val();
                updateUIDisplay();
                
                const btn = $(this).find('button');
                btn.text('Profile Saved!').addClass('btn-success');
                setTimeout(() => btn.text('Save Profile').removeClass('btn-success'), 2000);
            });

            // CHAT LOGIC (Existing)
            $('#chatInputForm').submit(function(e) {
                e.preventDefault();
                const text = $('#chatInput').val().trim();
                if(!text) return;

                $('#msgWindow').append(`<div class="msg-bubble msg-user shadow-sm">${text}</div>`);
                $('#chatInput').val('');
                const win = $('#msgWindow');
                win.scrollTop(win[0].scrollHeight);

                setTimeout(() => {
                    const responses = [
                        "I hear you. That sounds like a heavy weight to carry. I'm right here with you.",
                        "Thank you for trusting me with that. Your feelings are valid and important.",
                        "It's okay to feel this way. Take a breath with me...",
                        "I'm listening. You are safe to explore these thoughts here."
                    ];
                    const rand = responses[Math.floor(Math.random() * responses.length)];
                    $('#msgWindow').append(`<div class="msg-bubble msg-bot shadow-sm">${rand}</div>`);
                    win.scrollTop(win[0].scrollHeight);
                }, 1000);
            });

            $('#clearBtn').click(() => {
                $('#msgWindow').empty().append('<div class="msg-bubble msg-bot shadow-sm">I have cleared our space for a fresh start. I am ready to listen.</div>');
            });

            // List of English Questions
const assessmentQuestions = [
    "Have you felt unusually tired or low on energy?",
    "Have you found it difficult to enjoy things you normally love?",
    "Do you feel anxious or worried about small things?",
    "Have you had trouble concentrating on your work or studies?",
    "Do you find it hard to fall asleep or stay asleep at night?",
    "Have you felt overwhelmed by your daily responsibilities?",
    "Have you felt hopeless or discouraged about the future?",
    "Do you prefer staying alone rather than meeting people?",
    "Have you noticed a significant change in your appetite?",
    "Do you feel like your thoughts are moving too fast to control?"
];

// Function to load questions into the HTML
function loadWellnessTest() {
    const container = $('#questionsContainer');
    container.empty(); 
    
    assessmentQuestions.forEach((q, index) => {
        container.append(`
            <div class="mb-4 pb-3 border-bottom text-start">
                <p class="fw-bold mb-3" style="font-size: 0.95rem;">${index + 1}. ${q}</p>
                <div class="d-flex justify-content-between align-items-center px-1">
                    <span class="small text-muted">Never</span>
                    <div class="d-flex gap-3">
                        ${[1, 2, 3, 4].map(num => `
                            <div class="form-check form-check-inline m-0 d-flex flex-column align-items-center">
                                <input class="form-check-input" type="radio" name="q${index}" value="${num}" required>
                                <label class="small mt-1 text-muted">${num}</label>
                            </div>
                        `).join('')}
                    </div>
                    <span class="small text-muted">Always</span>
                </div>
            </div>
        `);
    });
}

// Initial load when the script runs
loadWellnessTest();

// Handle Form Submission
$(document).on('submit', '#assessmentForm', function(e) {
    e.preventDefault();
    let totalScore = 0;
    
    for(let i = 0; i < assessmentQuestions.length; i++) {
        totalScore += parseInt($(`input[name="q${i}"]:checked`).val());
    }

    // Display Results
    $('#scoreValue').text(totalScore);
    let message = "";
    
    if(totalScore <= 15) {
        message = "You seem to be in a good mental space! Keep practicing mindfulness.";
    } else if(totalScore <= 25) {
        message = "You're experiencing some stress. It might be a good time to rest and use the Breathing Space tool.";
    } else if(totalScore <= 35) {
        message = "You're carrying a heavy load right now. Please consider sharing your thoughts with our Companion chat.";
    } else {
        message = "Your wellness score is high. Please reach out to a professional or a loved one. You don't have to face this alone.";
    }

    $('#scoreMessage').text(message);
    $('#assessmentForm').hide(); // Hide form
    $('#assessmentResult').removeClass('d-none').hide().fadeIn(); // Show result smoothly
});

// Handle Retake Button
$(document).on('click', '#retakeTestBtn', function() {
    $('#assessmentResult').addClass('d-none'); // Hide result
    $('#assessmentForm').trigger('reset').fadeIn(); // Reset and show form
    loadWellnessTest(); // Refresh questions
});
        });