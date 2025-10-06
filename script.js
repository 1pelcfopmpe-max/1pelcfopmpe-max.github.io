document.addEventListener('DOMContentLoaded', () => {
    // --- CONEXÃO COM O SUPABASE ---
    const supabaseUrl = 'https://svijubigtigsrpfqzcgf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWp1YmlndGlnc3JwZnF6Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjMwMDAsImV4cCI6MjA3NDM5OTAwMH0.Ar58k-Hfe25v2xqkhpdffQXMJkQXTTOnMkyMJiH8e9k';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    // ---------------------------------
    
    // --- CONFIGURAÇÕES E ESTADO INICIAL ---
    const config = {
        COURSE_START_DATE: '2025-05-26T00:00:00',
        TOTAL_COURSE_DAYS: 365,
        BASE_EXP_TO_LEVEL: 100, LEVEL_EXP_MULTIPLIER: 1.2,
        PASS_DAY_EXP: 5,
        TASK_REWARDS: { easy: 10, medium: 25, hard: 50 }
    };
    let userProfile = {};
    let game = {};
    let calendarInstance;
    const defaultAvatar = 'https://i.imgur.com/K3wY2mn.png';

    // --- BANCO DE DADOS (constantes) ---
    const titleUnlocks = [
        { level: 50, title: "Lenda da Academia 💀" }, { level: 40, title: "Cadete de Brigada 🦅" },
        { level: 30, title: "Veterano 🎖️" }, { level: 25, title: "Cadete Antigo ⚔️" },
        { level: 20, title: "Cadete Raso ⭐⭐" }, { level: 15, title: "Cadete Moderno I ⭐" },
        { level: 10, title: "Cadete Moderno II" }, { level: 7, title: "Bizurado 🧠" },
        { level: 4, title: "Aluno Dedicado 🔰" }, { level: 1,  title: "Aluno Novinho 🌱" }
    ];
    const subjectList = ["Sistema de Segurança Pública", "Teoria Geral da Administração", "Gestão Pública Geral Aplicada", "Gestão de Pessoas, Comando e Liderança", "Gestão de Logística, Orçamento e Finanças Públicas", "Fundamentos da Polícia Comunitária", "Psicologia Aplicada", "Análise Criminal e Estatística", "Qualidade do Atendimento aos Grupos Vulneráveis", "Direitos Humanos Aplicados à Atividade Policial Militar", "Gerenciamento de Crises", "Saúde Mental e Qualidade de Vida", "Treinamento Físico Militar I", "Treinamento Físico Militar II", "Gestão de Processos no Sistema Eletrônico", "Tecnologia da Informação e Comunicação", "Comunicação, Mídias Sociais e Cerimonial Militar", "Inteligência e Sistema de Informação", "Ética, Cidadania e Relações Interpessoais", "Ordem Unida I", "Ordem Unida II", "Instrução Geral", "Defesa Pessoal Policial I", "Defesa Pessoal Policial II", "Uso Diferenciado da Força", "Pronto Socorrismo", "Atendimento Pré-Hospitalar Tático", "Planejamento Operacional e Especializado", "Elaboração de Projetos e Captação de Recursos", "Planejamento Estratégico", "Gestão Por Resultados e Avaliação de Políticas Públicas", "Trabalho de Comando e Estado Maior", "Polícia Judiciária Militar", "Direito Administrativo Disciplinar Militar", "Direito Penal e Processual Penal Militar", "Legislação Policial Militar e Organizacional", "Procedimento em Ocorrência", "Economia Aplicada ao Setor Público", "História da PMPE", "Abordagem a Pessoas", "Abordagem a Veículos", "Abordagem a Edificações", "Patrulhamento Urbano", "Armamento e Munição", "Tiro Policial", "Tiro Defensivo (Método Giraldi)", "Ações Básicas de Apoio Aéreo", "Manobras Acadêmicas I", "Manobras Acadêmicas II", "Metodologia da Pesquisa Científica", "Teoria e Prática do Ensino", "Trabalho de Conclusão de Curso"];
    const dailyQuestsPool = [ { text: "Treino Físico (Corrida/Musculação)", exp: 20 }, { text: "Estudo Individual (Mín. 1h)", exp: 15 }, { text: "Organização do Alojamento/Material", exp: 5 } ];

    // --- SELETORES DE UI ---
    const ui = {
        authContainer: document.getElementById('auth-container'),
        loginPanel: document.getElementById('login-panel'), 
        signupPanel: document.getElementById('signup-panel'),
        loginForm: document.getElementById('login-form'), 
        loginNumericaInput: document.getElementById('login-numerica'), 
        loginPasswordInput: document.getElementById('login-password'), 
        loginError: document.getElementById('login-error'),
        signupForm: document.getElementById('signup-form'), 
        signupPasswordInput: document.getElementById('signup-password'), 
        signupGuerraInput: document.getElementById('signup-guerra'), 
        signupNumericaInput: document.getElementById('signup-numerica'), 
        switchToSignupBtn: document.getElementById('switch-to-signup'),
        switchToLoginBtn: document.getElementById('switch-to-login'),
        signupError: document.getElementById('signup-error'),
        gameContainer: document.getElementById('game-container'), 
        profilePic: document.getElementById('profile-pic'), 
        uploadPicButton: document.getElementById('upload-pic-button'),
        uploadPicInput: document.getElementById('upload-pic-input'),
        playerName: document.getElementById('player-name'), 
        level: document.getElementById('level'), 
        playerTitle: document.getElementById('player-title'), 
        expBar: document.getElementById('exp-bar'), 
        expText: document.getElementById('exp-text'),
        logoutButton: document.getElementById('logout-button'),
        countdownDisplay: document.getElementById('countdown-display'),
        tabs: document.querySelectorAll('.tab'),
        tabButtons: document.querySelectorAll('.tab-button'),
        dailyQuestsList: document.getElementById('daily-quests-list'),
        upcomingEventsList: document.getElementById('upcoming-events-list'),
        tasksList: document.getElementById('tasks-list'),
        taskNameInput: document.getElementById('task-name-input'),
        taskDifficultySelect: document.getElementById('task-difficulty-select'),
        addTaskButton: document.getElementById('add-task-button'),
        calendar: document.getElementById('calendar'),
        eventNameInput: document.getElementById('event-name-input'),
        eventDateInput: document.getElementById('event-date-input'),
        addEventButton: document.getElementById('add-event-button'),
        qtsScheduleContainer: document.getElementById('qts-schedule-container'),
        gradesContainer: document.getElementById('grades-container'),
        gradesAverage: document.getElementById('grades-average'),
        achievementsGrid: document.getElementById('achievements-grid'),
        notificationToast: document.getElementById('notification-toast')
    };
    
    // --- FUNÇÕES DE AUTENTICAÇÃO ---
    async function handleLogin(e) {
        e.preventDefault();
        ui.loginError.textContent = '';
        const numerica = ui.loginNumericaInput.value;
        const password = ui.loginPasswordInput.value;
        const email = `${numerica}@cfo.pmpe.br`;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            ui.loginError.textContent = `Erro: Numérica ou senha inválidos.`;
            return;
        }
        if (data.user) {
            await loadProfileAndStart(data.user);
        }
    }

    async function handleSignUp(e) {
        e.preventDefault();
        ui.signupError.textContent = '';
        const nomeDeGuerra = ui.signupGuerraInput.value.trim().toUpperCase();
        const numerica = ui.signupNumericaInput.value;
        const password = ui.signupPasswordInput.value;
        if (password.length < 6) {
            ui.signupError.textContent = 'Erro: A senha precisa ter no mínimo 6 caracteres.';
            return;
        }
        const email = `${numerica}@cfo.pmpe.br`;
        
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) {
            ui.signupError.textContent = `Erro: ${authError.message}`;
            return;
        }

        if (authData.user) {
            const initialGameData = createNewGameDataObject();
            const initialProfile = {
                id: authData.user.id,
                nome_de_guerra: nomeDeGuerra,
                numerica: parseInt(numerica, 10),
                game_data: initialGameData
            };

            const { error: profileError } = await supabase.from('profiles').insert(initialProfile);
            if (profileError) {
                ui.signupError.textContent = `Erro ao criar perfil: ${profileError.message}`;
                return;
            }
            alert("Conta criada com sucesso! Por favor, faça o login para começar.");
            location.reload();
        }
    }
    
    async function handleLogout() {
        await supabase.auth.signOut();
        location.reload();
    }
    
    // --- FUNÇÕES DE DADOS ---
    async function loadProfileAndStart(user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if(error || !data) {
            console.error("Perfil não encontrado, forçando logout", error);
            await handleLogout();
            return false;
        }
        userProfile = data;
        game = data.game_data || createNewGameDataObject();
        
        // Converte as datas de string para objeto Date ao carregar
        if (game.time && game.time.startDate) game.time.startDate = new Date(game.time.startDate);
        if (game.time && game.time.currentDate) game.time.currentDate = new Date(game.time.currentDate);

        startGame();
        return true;
    }
    
    async function saveGame() {
        if (!userProfile.id) return;
        const { error } = await supabase.from('profiles').update({ game_data: game }).eq('id', userProfile.id);
        if (error) {
            console.error("Erro ao salvar:", error);
            notify('Erro ao salvar progresso.', 'error');
        }
    }
    
    // --- FUNÇÕES DE LÓGICA DO JOGO ---
    function createNewGameDataObject() {
        const startDate = new Date(config.COURSE_START_DATE);
        const currentDate = new Date();
        currentDate.setHours(0,0,0,0);
    
        let newGame = { 
            level: 1,
            exp: 0,
            title: "Aluno Novinho 🌱",
            tasks: [],
            events: [],
            qts: {},
            grades: {},
            achievements: [],
            time: {
                startDate: startDate.toISOString(),
                currentDate: currentDate.toISOString()
            }
        };
    
        subjectList.forEach(subject => {
            newGame.grades[subject] = { nota: 0 };
        });
    
        return newGame;
    }

    const getExpToNextLevel = (level) => Math.floor(config.BASE_EXP_TO_LEVEL * Math.pow(config.LEVEL_EXP_MULTIPLIER, level - 1));
    const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    function gainExp(amount) {
        if (!amount) return;
        game.exp = (game.exp || 0) + amount;
        
        let expNeeded = getExpToNextLevel(game.level);
        while (game.exp >= expNeeded) {
            game.level++;
            game.exp -= expNeeded;
            checkTitleUnlocks();
        }
        updateProfileUI();
        saveGame();
    }
    
    function checkTitleUnlocks() {
        for (const unlock of titleUnlocks) {
            if (game.level >= unlock.level) {
                if (game.title !== unlock.title) {
                    game.title = unlock.title;
                }
                return;
            }
        }
    }
    
    function updateProfileUI() {
        if(!ui.playerName) return; // Checagem de segurança
        ui.playerName.textContent = userProfile.nome_de_guerra;
        ui.level.textContent = `NÍVEL ${game.level}`;
        ui.title.textContent = game.title;
        const expNeeded = getExpToNextLevel(game.level);
        ui.expText.textContent = `EXP: ${game.exp} / ${expNeeded}`;
        ui.expBar.style.width = `${(game.exp / expNeeded) * 100}%`;
        ui.profilePic.src = userProfile.profile_pic || defaultAvatar;
    }
    
    function updateCountdown() {
        const endDate = new Date(config.COURSE_START_DATE);
        endDate.setFullYear(endDate.getFullYear() + 1);
        const now = new Date();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        ui.countdownDisplay.innerHTML = `${daysLeft}<br><span style="font-size: 0.5em;">dias restantes</span>`;
    }

    function renderDailyQuests() {
        ui.dailyQuestsList.innerHTML = '';
        dailyQuestsPool.forEach((quest, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${quest.text} <strong>(+${quest.exp} EXP)</strong></span>`;
            ui.dailyQuestsList.appendChild(li);
        });
    }

    function renderUpcomingEvents() {
        ui.upcomingEventsList.innerHTML = '';
        if(!game.events || game.events.length === 0) {
            ui.upcomingEventsList.innerHTML = '<li>Nenhum evento agendado.</li>';
            return;
        }
        const now = new Date();
        const upcoming = game.events
            .filter(event => new Date(event.start) >= now)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 3);

        if(upcoming.length === 0) {
            ui.upcomingEventsList.innerHTML = '<li>Nenhum evento futuro agendado.</li>';
            return;
        }

        upcoming.forEach(event => {
            const li = document.createElement('li');
            li.textContent = `${formatDate(new Date(event.start))}: ${event.title}`;
            ui.upcomingEventsList.appendChild(li);
        });
    }
    
    // --- FUNÇÕES DE INICIALIZAÇÃO ---
    function initGameUI() {
        ui.authContainer.classList.add('hidden');
        ui.gameContainer.classList.remove('hidden');

        updateProfileUI();
        updateCountdown();
        renderDailyQuests();
        renderUpcomingEvents();
        
        ui.logoutButton.addEventListener('click', handleLogout);
    }
    
    function startGame() {
        initGameUI();
    }

    // --- PONTO DE ENTRADA ---
    async function main() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await loadProfileAndStart(session.user);
        } else {
            ui.authContainer.classList.remove('hidden');
            ui.loginPanel.classList.remove('hidden');
            ui.signupPanel.classList.add('hidden');

            ui.switchToSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.loginPanel.classList.add('hidden');
                ui.signupPanel.classList.remove('hidden');
            });
            ui.switchToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ui.signupPanel.classList.add('hidden');
                ui.loginPanel.classList.remove('hidden');
            });

            ui.loginForm.addEventListener('submit', handleLogin);
            ui.signupForm.addEventListener('submit', handleSignUp);
        }
    }

    main();
});
