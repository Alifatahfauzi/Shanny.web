document.addEventListener('DOMContentLoaded', function() {
    const loginPage = document.getElementById('login-page');
    const dataPage = document.getElementById('data-page');
    const registerModal = document.getElementById('register-modal');
    const settingModal = document.getElementById('setting-modal');
    const chatModal = document.getElementById('chat-modal');

    const loginBtn = document.getElementById('login-btn');
    const showRegisterModalBtn = document.getElementById('show-register-modal');
    const registerBtn = document.getElementById('register-btn');
    const closeModalBtn = document.getElementById('close-register-modal');
    const showSettingModalBtn = document.getElementById('show-setting-modal');
    const closeSettingModalBtn = document.getElementById('close-setting-modal');
    const saveSettingBtn = document.getElementById('save-setting-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const showChatModalBtn = document.getElementById('show-chat-modal');
    const closeChatModalBtn = document.getElementById('close-chat-modal');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatCooldownMessage = document.getElementById('chat-cooldown-message');

    const loginIpInput = document.getElementById('login-ip');
    const loginPasswordInput = document.getElementById('login-password');
    const registerNameInput = document.getElementById('register-name');
    const registerNomorInput = document.getElementById('register-nomor');
    const registerIpInput = document.getElementById('register-ip');
    const settingNameInput = document.getElementById('setting-name');
    const settingNomorInput = document.getElementById('setting-nomor');
    const settingIpInput = document.getElementById('setting-ip');
    const settingPasswordInput = document.getElementById('setting-password');
    const chatInputText = document.getElementById('chat-input-text');

    const loginMessageDiv = document.getElementById('login-message');
    const registerMessageDiv = document.getElementById('register-message');
    const settingMessageDiv = document.getElementById('setting-message');
    const loginLoadingDiv = document.getElementById('login-loading');
    const registerLoadingDiv = document.getElementById('register-loading');
    const settingLoadingDiv = document.getElementById('setting-loading');

    const userName = document.getElementById('user-name');
    const userNomor = document.getElementById('user-nomor');
    const userIp = document.getElementById('user-ip');
    const userPassword = document.getElementById('user-password');
    const messageList = document.getElementById('message-list');
    
    const TOKEN = ""; // TOKEN ISI DI SINI
    const API_URL = ``; // URL API MU DI SINI OM KU
    const COMMIT_MESSAGE = 'Tambahkan pengguna baru';
    const COMMIT_MESSAGE_UPDATE = 'Perbarui data pengguna';
    const COMMIT_MESSAGE_CHAT = 'Tambahkan pesan chat baru';
    
    let currentSha = null;
    let chatInterval = null;
    
    const COOLDOWN_TIME = 5 * 60 * 1000;
    const CHAT_COOLDOWN_TIME = 10 * 1000;

    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        particlesContainer.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 15 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            const posX = Math.random() * 100;
            particle.style.left = `${posX}%`;
            
            const delay = Math.random() * 15;
            const duration = 15 + Math.random() * 10;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            const hue = 210 + Math.random() * 20;
            const opacity = 0.3 + Math.random() * 0.4;
            particle.style.background = `hsla(${hue}, 80%, 65%, ${opacity})`;
            
            particlesContainer.appendChild(particle);
        }
    }

    function generatePassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomPart = '';
        for (let i = 0; i < 6; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `SH4NY-${randomPart}`;
    }

    function showMessage(type, text, messageDiv, passwordToCopy = null) {
        messageDiv.innerHTML = '';
        const messageText = document.createElement('span');
        messageText.textContent = text;
        messageDiv.appendChild(messageText);

        if (type === 'success' && passwordToCopy) {
            const copyButton = document.createElement('button');
            copyButton.classList.add('copy-btn');
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Salin Password';
            
            copyButton.addEventListener('click', () => {
                const tempInput = document.createElement('textarea');
                tempInput.value = passwordToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                tempInput.setSelectionRange(0, 99999);
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                copyButton.innerHTML = '<i class="fas fa-check"></i> Disalin!';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Salin Password';
                }, 2000);
            });
            
            messageDiv.appendChild(copyButton);
        }

        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'flex';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
    }

    function showPage(pageId) {
        loginPage.style.display = 'none';
        dataPage.style.display = 'none';
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'block';
            page.classList.add('fade-in');
        }
    }
    
    function displayUserData(user) {
        userName.textContent = user.name;
        userNomor.textContent = user.nomor;
        userIp.textContent = user.ip;
        userPassword.textContent = user.password;
    }

    function validateIp(ip) {
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipPattern.test(ip);
    }
    
    async function getDatabase() {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data dari GitHub.');
        }
        
        const fileContentBase64 = await response.json();
        currentSha = fileContentBase64.sha;
        return JSON.parse(atob(fileContentBase64.content));
    }
    
    async function updateDatabase(newContent, commitMessage) {
        const base64Content = btoa(unescape(encodeURIComponent(JSON.stringify(newContent, null, 2))));
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: base64Content,
                sha: currentSha
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal memperbarui file di GitHub.');
        }
    }

    function renderMessages(messages) {
        messageList.innerHTML = '';
        const currentUser = JSON.parse(localStorage.getItem('userData'));
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            if (msg.ip === currentUser.ip) {
                messageElement.classList.add('self');
            }
            
            const header = document.createElement('div');
            header.classList.add('chat-message-header');
            
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('chat-name');
            nameSpan.textContent = (msg.ip === currentUser.ip) ? currentUser.name : msg.name;
            
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('chat-time');
            const date = new Date(msg.timestamp);
            timeSpan.textContent = date.toLocaleTimeString();

            header.appendChild(nameSpan);
            header.appendChild(timeSpan);

            const textP = document.createElement('p');
            textP.classList.add('chat-text');
            textP.textContent = msg.text;
            
            messageElement.appendChild(header);
            messageElement.appendChild(textP);
            messageList.appendChild(messageElement);
        });
        messageList.scrollTop = messageList.scrollHeight;
    }
    
    async function fetchMessages() {
        try {
            const data = await getDatabase();
            if (data.live_chat_messages) {
                renderMessages(data.live_chat_messages);
            }
        } catch (error) {
            console.error("Gagal memuat pesan:", error);
        }
    }
    
    async function sendMessage() {
        const text = chatInputText.value.trim();
        if (!text) return;
        
        const lastChatTimestamp = localStorage.getItem('lastChatTimestamp');
        const currentTime = Date.now();

        if (lastChatTimestamp && (currentTime - parseInt(lastChatTimestamp)) < CHAT_COOLDOWN_TIME) {
            chatCooldownMessage.style.display = 'block';
            sendChatBtn.disabled = true;
            setTimeout(() => {
                chatCooldownMessage.style.display = 'none';
                sendChatBtn.disabled = false;
            }, CHAT_COOLDOWN_TIME - (currentTime - parseInt(lastChatTimestamp)));
            return;
        }
        
        const currentUser = JSON.parse(localStorage.getItem('userData'));
        const newMessage = {
            name: currentUser.name,
            ip: currentUser.ip,
            text: text,
            timestamp: new Date().toISOString()
        };

        sendChatBtn.disabled = true;

        try {
            const data = await getDatabase();
            if (!data.live_chat_messages) {
                data.live_chat_messages = [];
            }
            data.live_chat_messages.push(newMessage);
            
            await updateDatabase(data, COMMIT_MESSAGE_CHAT);
            localStorage.setItem('lastChatTimestamp', Date.now());
            chatInputText.value = '';
            fetchMessages();
        } catch (error) {
            console.error("Gagal mengirim pesan:", error);
            alert("Gagal mengirim pesan. Coba lagi.");
        } finally {
            sendChatBtn.disabled = false;
        }
    }

    createParticles();
    
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
            showPage('data-page');
            displayUserData(JSON.parse(savedUserData));
        } else {
            localStorage.removeItem('isLoggedIn');
            showPage('login-page');
        }
    } else {
        showPage('login-page');
    }

    showRegisterModalBtn.addEventListener('click', function() {
        registerModal.style.display = 'flex';
    });
    
    closeModalBtn.addEventListener('click', function() {
        registerModal.style.display = 'none';
    });
    
    showSettingModalBtn.addEventListener('click', function() {
        const savedUserData = JSON.parse(localStorage.getItem('userData'));
        if (savedUserData) {
            settingNameInput.value = savedUserData.name;
            settingNomorInput.value = savedUserData.nomor;
            settingIpInput.value = savedUserData.ip;
            settingPasswordInput.value = '';
        }
        settingModal.style.display = 'flex';
    });

    closeSettingModalBtn.addEventListener('click', function() {
        settingModal.style.display = 'none';
    });
    
    showChatModalBtn.addEventListener('click', function() {
        chatModal.style.display = 'flex';
        fetchMessages();
        chatInterval = setInterval(fetchMessages, 3000);
    });
    
    closeChatModalBtn.addEventListener('click', function() {
        chatModal.style.display = 'none';
        clearInterval(chatInterval);
    });
    
    sendChatBtn.addEventListener('click', sendMessage);
    chatInputText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    window.onclick = function(event) {
        if (event.target == registerModal) {
            registerModal.style.display = 'none';
        }
        if (event.target == settingModal) {
            settingModal.style.display = 'none';
        }
        if (event.target == chatModal) {
            chatModal.style.display = 'none';
            clearInterval(chatInterval);
        }
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('lastChatTimestamp');
        showPage('login-page');
        loginIpInput.value = '';
        loginPasswordInput.value = '';
    });

    loginBtn.addEventListener('click', async function() {
        const ip = loginIpInput.value.trim();
        const password = loginPasswordInput.value.trim();
        
        if (!ip || !password) {
            showMessage('error', 'Harap isi IP dan Password', loginMessageDiv);
            return;
        }

        if (!validateIp(ip)) {
            showMessage('error', 'Format IP tidak valid', loginMessageDiv);
            return;
        }
        
        loginLoadingDiv.style.display = 'block';
        loginBtn.disabled = true;

        try {
            const data = await getDatabase();
            const user = data.user.find(u => u.ip === ip && u.password === password);
            
            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userData', JSON.stringify(user));
                showPage('data-page');
                displayUserData(user);
            } else {
                showMessage('error', 'IP atau Password salah.', loginMessageDiv);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('error', 'Terjadi kesalahan: ' + error.message, loginMessageDiv);
        } finally {
            loginLoadingDiv.style.display = 'none';
            loginBtn.disabled = false;
        }
    });

    registerBtn.addEventListener('click', async function() {
        const name = registerNameInput.value.trim();
        const nomor = registerNomorInput.value.trim();
        const ip = registerIpInput.value.trim();
        const password = generatePassword();
        
        if (!name || !nomor || !ip) {
            showMessage('error', 'Harap isi Nama, Nomor Telepon, dan Alamat IP.', registerMessageDiv);
            return;
        }

        if (!validateIp(ip)) {
            showMessage('error', 'Format IP tidak valid.', registerMessageDiv);
            return;
        }
        
        registerLoadingDiv.style.display = 'block';
        registerBtn.disabled = true;

        try {
            const data = await getDatabase();
            if (!data.user) {
                data.user = [];
            }

            if (data.user.some(u => u.nomor === nomor || u.ip === ip)) {
                showMessage('error', 'Nomor telepon atau IP sudah terdaftar.', registerMessageDiv);
                return;
            }
            
            const newUser = {
                name,
                nomor,
                ip,
                password,
                lastUpdateTimestamp: Date.now()
            };
            
            data.user.push(newUser);
            
            await updateDatabase(data, COMMIT_MESSAGE);
            
            showMessage('success', `Registrasi berhasil! IP: ${ip}, Password: ${password}. Harap catat password Anda.`, registerMessageDiv, password);

            registerNameInput.value = '';
            registerNomorInput.value = '';
            registerIpInput.value = '';

        } catch (error) {
            console.error('Error:', error);
            showMessage('error', 'Terjadi kesalahan: ' + error.message, registerMessageDiv);
        } finally {
            registerLoadingDiv.style.display = 'none';
            registerBtn.disabled = false;
        }
    });

    saveSettingBtn.addEventListener('click', async function() {
        const newName = settingNameInput.value.trim();
        const newNomor = settingNomorInput.value.trim();
        const newIp = settingIpInput.value.trim();
        const newPassword = settingPasswordInput.value.trim();
        
        if (!newName || !newNomor || !newIp) {
            showMessage('error', 'Harap isi Nama, Nomor Telepon, dan Alamat IP.', settingMessageDiv);
            return;
        }

        if (!validateIp(newIp)) {
            showMessage('error', 'Format IP tidak valid.', settingMessageDiv);
            return;
        }
        
        settingLoadingDiv.style.display = 'block';
        saveSettingBtn.disabled = true;

        try {
            const savedUserData = JSON.parse(localStorage.getItem('userData'));
            if (!savedUserData) {
                throw new Error('Data pengguna tidak ditemukan.');
            }

            const data = await getDatabase();
            const userIndex = data.user.findIndex(u => u.ip === savedUserData.ip && u.password === savedUserData.password);
            
            if (userIndex === -1) {
                throw new Error('Pengguna tidak ditemukan dalam database.');
            }
            
            const userFromDb = data.user[userIndex];
            const lastUpdateTimestamp = userFromDb.lastUpdateTimestamp || 0;
            const currentTime = Date.now();

            if ((currentTime - lastUpdateTimestamp) < COOLDOWN_TIME) {
                const remainingTime = Math.ceil((COOLDOWN_TIME - (currentTime - lastUpdateTimestamp)) / 1000);
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                showMessage('error', `Harap tunggu ${minutes} menit dan ${seconds} detik sebelum melakukan perubahan lagi.`, settingMessageDiv);
                return;
            }

            if (data.user.some((u, index) => index !== userIndex && (u.nomor === newNomor || u.ip === newIp))) {
                showMessage('error', 'Nomor telepon atau IP sudah digunakan oleh pengguna lain.', settingMessageDiv);
                return;
            }
            
            const hasChanged = userFromDb.name !== newName || userFromDb.nomor !== newNomor || userFromDb.ip !== newIp || newPassword;

            userFromDb.name = newName;
            userFromDb.nomor = newNomor;
            userFromDb.ip = newIp;
            
            if (newPassword) {
                userFromDb.password = newPassword;
            }

            if (hasChanged) {
                userFromDb.lastUpdateTimestamp = currentTime;
                await updateDatabase(data, COMMIT_MESSAGE_UPDATE);
            }
            
            const updatedUser = userFromDb;
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            displayUserData(updatedUser);
            
            showMessage('success', 'Pengaturan berhasil diperbarui.', settingMessageDiv);
            
            setTimeout(() => {
                settingModal.style.display = 'none';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            showMessage('error', 'Terjadi kesalahan: ' + error.message, settingMessageDiv);
        } finally {
            settingLoadingDiv.style.display = 'none';
            saveSettingBtn.disabled = false;
        }
    });
});