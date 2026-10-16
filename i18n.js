// Internationalization (i18n) Module for SmartBoard Connect
// Supports Uzbek (uz), English (en), Russian (ru)

const translations = {
    uz: {
        app_title: "SmartBoard Connect",
        app_subtitle: "Noutbuk va elektron doskani masofaviy ulash va taqdimot platformasi",
        online_badge: "🌐 Online Rejimi",
        
        // Roles
        sender_title: "Uzatuvchi (Noutbuk)",
        sender_desc: "Noutbuk kompyuteringiz ekranini hamda slayd-taqdimotlarini elektron doskaga uzatish uchun kiring.",
        btn_enter_sender: "Uzatuvchi sifatida kirish",
        
        display_title: "Ko'rsatuvchi (Elektron Doska)",
        display_desc: "Elektron doska yoki proyektorda tasvir va taqdimotlarni qabul qilish hamda ko'rsatish uchun kiring.",
        btn_enter_display: "Ko'rsatuvchi sifatida kirish",
        
        // Sender Page
        back_home: "← Bosh sahifaga qaytish",
        sender_page_title: "Uzatuvchi (Noutbuk)",
        sender_page_sub: "Elektron doskaga ulaning va ekraningizni masofaviy uzating",
        connect_box_title: "Doskaga Ulanish",
        connect_box_desc: "Elektron doska ekranida chiqqan 6 xonali ulanish parolini kiriting:",
        code_placeholder: "XXXXXX",
        btn_connect: "🔗 Ulanish",
        status_connecting: "⏳ Ulash kutilmoqda...",
        status_connected_banner: "✅ Elektron doskaga muvaffaqiyatli ulandi!",
        err_invalid_code: "⚠️ Iltimos, 6 xonali ulanish parolini to‘liq kiriting!",
        
        // Main Stream Controls
        btn_start_stream: "▶️ START",
        btn_stop_stream: "⏹️ STOP",
        stream_active: "🟢 Jonli translyatsiya ketmoqda (Ultra-HD 60 FPS)...",
        
        // Windows 11 Win + P Flyout
        project_title: "Project",
        mode_pc_only_title: "PC screen only",
        mode_pc_only_sub: "Faqat kompyuter ekrani (doskada fon ko'rinadi)",
        mode_duplicate_title: "Duplicate",
        mode_duplicate_sub: "Hamma oyna, video, rasm va dasturlar jonli ko'rinadi",
        mode_extend_title: "Extend",
        mode_extend_sub: "Faqat slaydning o'zi ko'rinadi (eslatmalar va dasturlar yashirin)",
        mode_second_only_title: "Second screen only",
        mode_second_only_sub: "Faqat elektron doskada ko'rsatish",
        more_display_settings: "Windows Win + P bilan sinxronlashgan",
        btn_select_slide_window: "🎯 Slayd oynasini tanlash (PowerPoint / Canva / Slides)",

        // Display Page
        display_header: "Elektron Doska (Ko'rsatuvchi)",
        display_header_sub: "Noutbukingiz brauzeridan ushbu manzilga kiring va ulanish kodini kiriting:",
        pairing_code_label: "Ulanish uchun Random Parol:",
        random_notice: "🔑 Har safar kirilgan paytda yangi kutilmagan (random) parol yaratiladi.",
        waiting_laptop: "Noutbuk ulanishi kutilmoqda...",
        laptop_connected_msg: "✅ Noutbuk ulandi! Tasvir uzatishga tayyor.",
        standby_display_text: "SmartBoard Connect — Uzatuvchi Fon Rejimi",
        pc_only_display_text: "SmartBoard Connect — PC screen only (Noutbuk kutish rejimida)",
        
        // Footer
        footer_text: "SmartBoard Connect © 2026. Masofaviy Ulanish Tizimi."
    },
    
    en: {
        app_title: "SmartBoard Connect",
        app_subtitle: "Remote Screen & Presentation Sharing for Smartboards",
        online_badge: "🌐 Online Mode",
        
        // Roles
        sender_title: "Sender (Laptop)",
        sender_desc: "Connect your laptop screen or slide presentations to the smartboard.",
        btn_enter_sender: "Enter as Sender",
        
        display_title: "Display (Smartboard)",
        display_desc: "Enter on the smartboard or projector to receive and show streams.",
        btn_enter_display: "Enter as Display",
        
        // Sender Page
        back_home: "← Back to Home",
        sender_page_title: "Sender (Laptop)",
        sender_page_sub: "Connect to the smartboard and stream your screen",
        connect_box_title: "Connect to Smartboard",
        connect_box_desc: "Enter the 6-character pairing code shown on the smartboard screen:",
        code_placeholder: "XXXXXX",
        btn_connect: "🔗 Connect",
        status_connecting: "⏳ Connecting...",
        status_connected_banner: "✅ Successfully connected to smartboard!",
        err_invalid_code: "⚠️ Please enter the full 6-character pairing code!",
        
        // Main Stream Controls
        btn_start_stream: "▶️ START",
        btn_stop_stream: "⏹️ STOP",
        stream_active: "🟢 Live stream active (Ultra-HD 60 FPS)...",
        
        // Windows 11 Win + P Flyout
        project_title: "Project",
        mode_pc_only_title: "PC screen only",
        mode_pc_only_sub: "Show only laptop (smartboard shows background)",
        mode_duplicate_title: "Duplicate",
        mode_duplicate_sub: "Mirror all apps, videos, images, and desktop live",
        mode_extend_title: "Extend",
        mode_extend_sub: "Show slides only (notes and background apps hidden)",
        mode_second_only_title: "Second screen only",
        mode_second_only_sub: "Show only on the smartboard display",
        more_display_settings: "Synchronized with Windows Win + P",
        btn_select_slide_window: "🎯 Select Presentation Window (PowerPoint / Canva)",

        // Display Page
        display_header: "Smartboard Display (Receiver)",
        display_header_sub: "Open this URL on your laptop browser and enter the pairing code:",
        pairing_code_label: "Random Pairing Code:",
        random_notice: "🔑 A new random pairing code is generated every time this page is opened.",
        waiting_laptop: "Waiting for laptop connection...",
        laptop_connected_msg: "✅ Laptop connected! Stream ready.",
        standby_display_text: "SmartBoard Connect — Presenter Background Mode",
        pc_only_display_text: "SmartBoard Connect — PC screen only (Presenter Standby)",
        
        // Footer
        footer_text: "SmartBoard Connect © 2026. Remote System."
    },

    ru: {
        app_title: "SmartBoard Connect",
        app_subtitle: "Система дистанционного подключения ноутбука к электронной доске",
        online_badge: "🌐 Онлайн режим",
        
        // Roles
        sender_title: "Передатчик (Ноутбук)",
        sender_desc: "Войдите, чтобы транслировать экран ноутбука или презентации на электронную доску.",
        btn_enter_sender: "Войти как передатчик",
        
        display_title: "Приемник (Электронная доска)",
        display_desc: "Войдите на электронной доске для приема и отображения трансляций.",
        btn_enter_display: "Войти как приемник",
        
        // Sender Page
        back_home: "← На главную",
        sender_page_title: "Передатчик (Ноутбук)",
        sender_page_sub: "Подключитесь к доске и транслируйте ваш экран",
        connect_box_title: "Подключение к Доске",
        connect_box_desc: "Введите 6-значный код подключения, показанный на экране доски:",
        code_placeholder: "XXXXXX",
        btn_connect: "🔗 Подключить",
        status_connecting: "⏳ Подключение...",
        status_connected_banner: "✅ Успешно подключено к электронной доске!",
        err_invalid_code: "⚠️ Пожалуйста, введите полный 6-значный код!",
        
        // Main Stream Controls
        btn_start_stream: "▶️ START",
        btn_stop_stream: "⏹️ STOP",
        stream_active: "🟢 Прямая трансляция активна (Ultra-HD 60 FPS)...",
        
        // Windows 11 Win + P Flyout
        project_title: "Проецирование",
        mode_pc_only_title: "Только экран ПК",
        mode_pc_only_sub: "Только на ноутбуке (на доске фоновый экран)",
        mode_duplicate_title: "Повторяющийся (Duplicate)",
        mode_duplicate_sub: "Дублирование всех окон, видео и программ",
        mode_extend_title: "Расширить (Extend)",
        mode_extend_sub: "Показывать только слайды (заметки и окна скрыты)",
        mode_second_only_title: "Только второй экран",
        mode_second_only_sub: "Отображение только на электронной доске",
        more_display_settings: "Синхронизировано с Windows Win + P",
        btn_select_slide_window: "🎯 Выбрать окно презентации (PowerPoint / Canva)",

        // Display Page
        display_header: "Электронная Доска (Приемник)",
        display_header_sub: "Откройте этот адрес в браузере ноутбука и введите код подключения:",
        pairing_code_label: "Случайный Код Подключения:",
        random_notice: "🔑 При каждом входе генерируется новый случайный код.",
        waiting_laptop: "Ожидание подключения ноутбука...",
        laptop_connected_msg: "✅ Ноутбук подключен! Готово к трансляции.",
        standby_display_text: "SmartBoard Connect — Фоновый Режим Передатчика",
        pc_only_display_text: "SmartBoard Connect — Только экран ПК (Режим ожидания)",
        
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
