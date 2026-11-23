// Internationalization (i18n) Module for SmartBoard Connect
// Supports Uzbek (uz), English (en), Russian (ru)

const translations = {
    uz: {
        app_title: "SmartBoard Connect",
        app_subtitle: "Noutbuk va elektron doskani masofaviy ulash va taqdimot platformasi",
        online_badge: "🌐 Online Rejimi",
        
        // Roles
        sender_title: "Uzatuvchi (Noutbuk / Telefon)",
        sender_desc: "Noutbuk kompyuteringiz yoki telefoningizdan ekranni elektron doskaga uzatish uchun kiring.",
        btn_enter_sender: "Uzatuvchi sifatida kirish",
        
        display_title: "Ko'rsatuvchi (Elektron Doska)",
        display_desc: "Elektron doska yoki proyektorda tasvir va taqdimotlarni qabul qilish hamda ko'rsatish uchun kiring.",
        btn_enter_display: "Ko'rsatuvchi sifatida kirish",
        
        // Sender Page
        back_home: "← Bosh sahifaga qaytish",
        sender_page_title: "Uzatuvchi (Noutbuk / Telefon)",
        sender_page_sub: "Elektron doskaga ulaning va ekraningizni masofaviy uzating",
        connect_box_title: "Doskaga Ulanish",
        connect_box_desc: "Elektron doska ekranida chiqqan 6 xonali ulanish parolini kiriting:",
        code_placeholder: "XXXXXX",
        btn_connect: "🔗 Ulanish",
        status_connecting: "⏳ Ulash kutilmoqda...",
        status_connected_banner: "✅ Elektron doskaga muvaffaqiyatli ulandi!",
        err_invalid_code: "⚠️ Iltimos, 6 xonali ulanish parolini to‘liq kiriting!",
        
        // Main Stream Controls
        btn_start_stream: "▶️ START (Ekran Uzatish)",
        btn_start_camera: "📷 Kamera orqali uzatish (Telefon)",
        btn_stop_stream: "⏹️ STOP",
        stream_active: "🟢 Jonli translyatsiya ketmoqda (Ultra-HD 60 FPS)...",
        live_preview_label: "🔴 Siz uzatayotgan jonli tasvir:",
        
        // 3 Stream Modes
        modes_title: "Uzatish Rejimini Tanlang",
        mode_duplicate_title: "🖥️ To'liq Ekran (Duplicate)",
        mode_duplicate_desc: "Noutbuk yoki telefon ekrani to'liq va barcha ilovalar jonli uzatiladi",
        mode_extend_title: "📊 Faqat Taqdimot (Extend)",
        mode_extend_desc: "Faqat slayd oynasi ko'rinadi (shaxsiy eslatmalar doskada ko'rinmaydi)",
        mode_standby_title: "🔒 Kutish Rejimi (Standby)",
        mode_standby_desc: "Aloqa saqlanadi, doska ekranida tinch fon ko'rsatiladi",
        btn_select_slide_window: "🎯 Slayd oynasini tanlash (PowerPoint / Canva / Slides)",

        // Display Page
        display_header: "Elektron Doska (Ko'rsatuvchi)",
        display_header_sub: "Noutbuk yoki telefoningizdan quyidagi manzilga kiring va kodni kiriting:",
        pairing_code_label: "Ulanish uchun Random Parol:",
        random_notice: "🔑 Har safar kirilgan paytda yangi kutilmagan (random) parol yaratiladi.",
        waiting_laptop: "Ulanish kutilmoqda...",
        laptop_connected_msg: "✅ Qurilma ulandi! Tasvir uzatishga tayyor.",
        standby_display_text: "SmartBoard Connect — Kutish Rejimi",
        waiting_stream_title: "Uzatuvchi ulandi!",
        waiting_stream_desc: "Tasvirni boshlash uchun noutbuk yoki telefonda 'START' tugmasini bosing",
        
        // Footer
        footer_text: "SmartBoard Connect © 2026. Masofaviy Ulanish Tizimi."
    },
    
    en: {
        app_title: "SmartBoard Connect",
        app_subtitle: "Remote Screen & Presentation Sharing for Smartboards",
        online_badge: "🌐 Online Mode",
        
        // Roles
        sender_title: "Sender (Laptop / Phone)",
        sender_desc: "Connect your laptop screen or phone to stream to the smartboard.",
        btn_enter_sender: "Enter as Sender",
        
        display_title: "Display (Smartboard)",
        display_desc: "Enter on the smartboard or projector to receive and show streams.",
        btn_enter_display: "Enter as Display",
        
        // Sender Page
        back_home: "← Back to Home",
        sender_page_title: "Sender (Laptop / Phone)",
        sender_page_sub: "Connect to the smartboard and stream your screen or camera",
        connect_box_title: "Connect to Smartboard",
        connect_box_desc: "Enter the 6-character pairing code shown on the smartboard screen:",
        code_placeholder: "XXXXXX",
        btn_connect: "🔗 Connect",
        status_connecting: "⏳ Connecting...",
        status_connected_banner: "✅ Successfully connected to smartboard!",
        err_invalid_code: "⚠️ Please enter the full 6-character pairing code!",
        
        // Main Stream Controls
        btn_start_stream: "▶️ START (Screen Share)",
        btn_start_camera: "📷 Stream Camera (Phone)",
        btn_stop_stream: "⏹️ STOP",
        stream_active: "🟢 Live stream active (Ultra-HD 60 FPS)...",
        live_preview_label: "🔴 Live preview of your stream:",
        
        // 3 Stream Modes
        modes_title: "Select Streaming Mode",
        mode_duplicate_title: "🖥️ Full Screen Mirror (Duplicate)",
        mode_duplicate_desc: "Mirror entire screen with all open windows and apps",
        mode_extend_title: "📊 Presentation Only (Extend)",
        mode_extend_desc: "Streams only presentation slides (notes remain private)",
        mode_standby_title: "🔒 Standby Mode",
        mode_standby_desc: "Connection maintained, smartboard displays calm holding screen",
        btn_select_slide_window: "🎯 Select Presentation Window (PowerPoint / Canva / Slides)",

        // Display Page
        display_header: "Smartboard Display (Receiver)",
        display_header_sub: "Open this URL on your laptop or phone and enter the pairing code:",
        pairing_code_label: "Random Pairing Code:",
        random_notice: "🔑 A new random pairing code is generated every time this page is opened.",
        waiting_laptop: "Waiting for connection...",
        laptop_connected_msg: "✅ Device connected! Stream ready.",
        standby_display_text: "SmartBoard Connect — Standby Mode",
        waiting_stream_title: "Sender Connected!",
        waiting_stream_desc: "To start streaming, click 'START' on your laptop or phone",
        
        // Footer
        footer_text: "SmartBoard Connect © 2026. Remote System."
    },

    ru: {
        app_title: "SmartBoard Connect",
        app_subtitle: "Система дистанционного подключения ноутбука к электронной доске",
        online_badge: "🌐 Онлайн режим",
        
        // Roles
        sender_title: "Передатчик (Ноутбук / Телефон)",
        sender_desc: "Войдите, чтобы транслировать экран ноутбука или телефона на электронную доску.",
        btn_enter_sender: "Войти как передатчик",
        
        display_title: "Приемник (Электронная доска)",
        display_desc: "Войдите на электронной доске для приема и отображения трансляций.",
        btn_enter_display: "Войти как приемник",
        
        // Sender Page
        back_home: "← На главную",
        sender_page_title: "Передатчик (Ноутбук / Телефон)",
        sender_page_sub: "Подключитесь к доске и транслируйте ваш экран или камеру",
        connect_box_title: "Подключение к Доске",
        connect_box_desc: "Введите 6-значный код подключения, показанный на экране доски:",
        code_placeholder: "XXXXXX",
        btn_connect: "🔗 Подключить",
        status_connecting: "⏳ Подключение...",
        status_connected_banner: "✅ Успешно подключено к электронной доске!",
        err_invalid_code: "⚠️ Пожалуйста, введите полный 6-значный код!",
        
        // Main Stream Controls
        btn_start_stream: "▶️ START (Трансляция экрана)",
        btn_start_camera: "📷 Трансляция с камеры (Телефон)",
        btn_stop_stream: "⏹️ STOP",
        stream_active: "🟢 Прямая трансляция активна (Ultra-HD 60 FPS)...",
        live_preview_label: "🔴 Предпросмотр вашей трансляции:",
        
        // 3 Stream Modes
        modes_title: "Выберите режим трансляции",
        mode_duplicate_title: "🖥️ Полный экран (Duplicate)",
        mode_duplicate_desc: "Полное зеркалирование экрана со всеми окнами и программами",
        mode_extend_title: "📊 Только презентация (Extend)",
        mode_extend_desc: "Транслирует только окно слайдов (личные заметки скрыты)",
        mode_standby_title: "🔒 Режим ожидания (Standby)",
        mode_standby_desc: "Связь сохраняется, на доске отображается фоновый экран",
        btn_select_slide_window: "🎯 Выбрать окно презентации (PowerPoint / Canva / Slides)",

        // Display Page
        display_header: "Электронная Доска (Приемник)",
        display_header_sub: "Откройте этот адрес в браузере ноутбука или телефона и введите код:",
        pairing_code_label: "Случайный Код Подключения:",
        random_notice: "🔑 При каждом входе генерируется новый случайный код.",
        waiting_laptop: "Ожидание подключения...",
        laptop_connected_msg: "✅ Устройство подключено! Готово к трансляции.",
        standby_display_text: "SmartBoard Connect — Режим Ожидания",
        waiting_stream_title: "Передатчик подключен!",
        waiting_stream_desc: "Чтобы начать трансляцию, нажмите кнопку 'START' на ноутбуке или телефоне",
        
        // Footer
        footer_text: "SmartBoard Connect © 2026. Система дистанционного подключения."
    }
};

let currentLang = localStorage.getItem('sb_lang') || 'uz';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('sb_lang', lang);
    applyTranslations();
}

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || (translations['uz'][key] || key);
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    document.querySelectorAll('.lang-select').forEach(select => {
        select.value = currentLang;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});
