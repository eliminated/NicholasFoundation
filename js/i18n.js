/**
 * THE NICHOLAS FOUNDATION — Internationalization (i18n)
 * i18n.js — Client-side language switcher with 4 languages
 * Uses data-i18n attributes for DOM binding
 */

'use strict';

const I18n = (() => {
  const STORAGE_KEY = 'tnf-lang';
  const DEFAULT_LANG = 'en';

  // --- Translation Dictionaries ---
  const TRANSLATIONS = {
    en: {
      // Navbar
      'nav.tagline':          'Engineering the Future',
      'nav.search':           'Search (Ctrl+K)',
      'nav.theme':            'Toggle theme',
      'nav.profile':          'User profile',

      // Sidebar
      'sidebar.main':         'Main',
      'sidebar.company':      'Company',
      'sidebar.home':         'Home',
      'sidebar.about':        'About Us',
      'sidebar.products':     'Products & Services',
      'sidebar.blog':         'Blog',
      'sidebar.careers':      'Careers',
      'sidebar.contact':      'Contact Us',
      'sidebar.support':      'Support',
      'sidebar.faq':          'FAQ',
      'sidebar.privacy':      'Privacy & Terms',

      // Hero
      'hero.badge':           'Technology for Humanity',
      'hero.tagline':         'Engineering the Future of',
      'hero.subtitle':        'We build cutting-edge technology systems that solve humanity\'s greatest challenges at global scale — from open-source infrastructure to AI-powered platforms.',
      'hero.cta.explore':     'Explore Our Work',
      'hero.cta.mission':     'Our Mission',
      'hero.stat.countries':  'Countries Reached',
      'hero.stat.lives':      'Lives Impacted',
      'hero.stat.projects':   'Open-Source Projects',
      'hero.stat.api':        'API Calls / Year',

      // Sections
      'section.mission':      'Our Mission',
      'section.mission.title.1': 'Technology as a',
      'section.mission.title.2': 'Force for Good',
      'section.whatwebuild':   'What We Build',
      'section.whatwebuild.title.1': 'Systems That',
      'section.whatwebuild.title.2': 'Power Tomorrow',
      'section.impact':       'Impact Stories',
      'section.insights':     'Latest Insights',
      'section.insights.title.1': 'From Our',
      'section.insights.title.2': 'Research Lab',

      // Buttons
      'btn.learnmore':        'Learn more',
      'btn.readmore':         'Read more',
      'btn.viewall':          'View All Products & Services',
      'btn.viewposts':        'View All Posts',
      'btn.explore':          'Explore Our Platforms',
      'btn.getintouch':       'Get in Touch',
      'btn.subscribe':        'Subscribe',
      'btn.jointeam':         'Join Our Team',
      'btn.viewroles':        'View Open Roles',
      'btn.partner':          'Partner With Us',
      'btn.send':             'Send Message',
      'btn.apply':            'Apply Now',

      // Footer
      'footer.desc':          'A technology-first foundation building innovative systems that drive global impact. Open-source. Transparent. For humanity.',
      'footer.company':       'Company',
      'footer.resources':     'Resources',
      'footer.contact':       'Contact',
      'footer.stayupdated':   'Stay Updated',
      'footer.copyright':     'The Nicholas Foundation. All rights reserved.',
      'footer.privacy':       'Privacy Policy',
      'footer.terms':         'Terms of Service',
      'footer.cookies':       'Cookie Settings',
      'footer.support':       'Support Center',
      'footer.docs':          'Documentation',
      'footer.api':           'API Reference',
      'footer.opensource':     'Open Source',
      'footer.general':       'General Inquiries',
      'footer.techsupport':   'Technical Support',
      'footer.globalhq':      'Global HQ',
      'footer.worldwide':     'Available Worldwide',

      // Cookie
      'cookie.title':         '🍪 We use minimal cookies',
      'cookie.desc':          'to save your preferences and understand how our site is used.',
      'cookie.learn':         'Learn more',
      'cookie.essential':     'Essential Only',
      'cookie.accept':        'Accept All',

      // Announcement
      'announce.text':        'FedCore v3 is now live —',
      'announce.link':        'See what\'s new →',

      // Language
      'lang.label':           'Language',

      // Partners
      'partners.title':       'Trusted by Organizations Worldwide',

      // CTA
      'cta.title.1':          'Ready to Build',
      'cta.title.2':          'Something That Matters?',
      'cta.desc':             'Join thousands of engineers, researchers, and organizations using TNF technology to create global change.',

      // Scroll
      'scroll.indicator':     'Scroll',
    },

    fr: {
      'nav.tagline':          'Construire l\'Avenir',
      'nav.search':           'Rechercher (Ctrl+K)',
      'nav.theme':            'Changer le thème',
      'nav.profile':          'Profil utilisateur',

      'sidebar.main':         'Principal',
      'sidebar.company':      'Entreprise',
      'sidebar.home':         'Accueil',
      'sidebar.about':        'À Propos',
      'sidebar.products':     'Produits & Services',
      'sidebar.blog':         'Blog',
      'sidebar.careers':      'Carrières',
      'sidebar.contact':      'Nous Contacter',
      'sidebar.support':      'Assistance',
      'sidebar.faq':          'FAQ',
      'sidebar.privacy':      'Confidentialité & Conditions',

      'hero.badge':           'Technologie pour l\'Humanité',
      'hero.tagline':         'Construire l\'Avenir de',
      'hero.subtitle':        'Nous créons des systèmes technologiques de pointe qui résolvent les plus grands défis de l\'humanité à l\'échelle mondiale — de l\'infrastructure open-source aux plateformes alimentées par l\'IA.',
      'hero.cta.explore':     'Explorer Nos Travaux',
      'hero.cta.mission':     'Notre Mission',
      'hero.stat.countries':  'Pays Atteints',
      'hero.stat.lives':      'Vies Impactées',
      'hero.stat.projects':   'Projets Open-Source',
      'hero.stat.api':        'Appels API / An',

      'section.mission':      'Notre Mission',
      'section.mission.title.1': 'La Technologie comme',
      'section.mission.title.2': 'Force pour le Bien',
      'section.whatwebuild':   'Ce Que Nous Construisons',
      'section.whatwebuild.title.1': 'Des Systèmes Qui',
      'section.whatwebuild.title.2': 'Propulsent Demain',
      'section.impact':       'Histoires d\'Impact',
      'section.insights':     'Dernières Analyses',
      'section.insights.title.1': 'De Notre',
      'section.insights.title.2': 'Laboratoire de Recherche',

      'btn.learnmore':        'En savoir plus',
      'btn.readmore':         'Lire la suite',
      'btn.viewall':          'Voir Tous les Produits & Services',
      'btn.viewposts':        'Voir Tous les Articles',
      'btn.explore':          'Explorer Nos Plateformes',
      'btn.getintouch':       'Nous Contacter',
      'btn.subscribe':        'S\'abonner',
      'btn.jointeam':         'Rejoindre Notre Équipe',
      'btn.viewroles':        'Voir les Postes Ouverts',
      'btn.partner':          'Devenir Partenaire',
      'btn.send':             'Envoyer le Message',
      'btn.apply':            'Postuler Maintenant',

      'footer.desc':          'Une fondation technologique créant des systèmes innovants pour un impact mondial. Open-source. Transparente. Pour l\'humanité.',
      'footer.company':       'Entreprise',
      'footer.resources':     'Ressources',
      'footer.contact':       'Contact',
      'footer.stayupdated':   'Restez Informé',
      'footer.copyright':     'The Nicholas Foundation. Tous droits réservés.',
      'footer.privacy':       'Politique de Confidentialité',
      'footer.terms':         'Conditions d\'Utilisation',
      'footer.cookies':       'Paramètres des Cookies',
      'footer.support':       'Centre d\'Aide',
      'footer.docs':          'Documentation',
      'footer.api':           'Référence API',
      'footer.opensource':     'Open Source',
      'footer.general':       'Renseignements Généraux',
      'footer.techsupport':   'Support Technique',
      'footer.globalhq':      'Siège Mondial',
      'footer.worldwide':     'Disponible Partout',

      'cookie.title':         '🍪 Nous utilisons peu de cookies',
      'cookie.desc':          'pour sauvegarder vos préférences et comprendre l\'utilisation de notre site.',
      'cookie.learn':         'En savoir plus',
      'cookie.essential':     'Essentiels Uniquement',
      'cookie.accept':        'Tout Accepter',

      'announce.text':        'FedCore v3 est disponible —',
      'announce.link':        'Voir les nouveautés →',

      'lang.label':           'Langue',
      'partners.title':       'Approuvé par des Organisations Mondiales',

      'cta.title.1':          'Prêt à Construire',
      'cta.title.2':          'Quelque Chose Qui Compte ?',
      'cta.desc':             'Rejoignez des milliers d\'ingénieurs, chercheurs et organisations utilisant la technologie TNF pour créer un changement mondial.',

      'scroll.indicator':     'Défiler',
    },

    es: {
      'nav.tagline':          'Diseñando el Futuro',
      'nav.search':           'Buscar (Ctrl+K)',
      'nav.theme':            'Cambiar tema',
      'nav.profile':          'Perfil de usuario',

      'sidebar.main':         'Principal',
      'sidebar.company':      'Empresa',
      'sidebar.home':         'Inicio',
      'sidebar.about':        'Sobre Nosotros',
      'sidebar.products':     'Productos y Servicios',
      'sidebar.blog':         'Blog',
      'sidebar.careers':      'Carreras',
      'sidebar.contact':      'Contáctenos',
      'sidebar.support':      'Soporte',
      'sidebar.faq':          'FAQ',
      'sidebar.privacy':      'Privacidad y Términos',

      'hero.badge':           'Tecnología para la Humanidad',
      'hero.tagline':         'Diseñando el Futuro de',
      'hero.subtitle':        'Creamos sistemas tecnológicos de vanguardia que resuelven los mayores desafíos de la humanidad a escala global — desde infraestructura de código abierto hasta plataformas impulsadas por IA.',
      'hero.cta.explore':     'Explorar Nuestro Trabajo',
      'hero.cta.mission':     'Nuestra Misión',
      'hero.stat.countries':  'Países Alcanzados',
      'hero.stat.lives':      'Vidas Impactadas',
      'hero.stat.projects':   'Proyectos de Código Abierto',
      'hero.stat.api':        'Llamadas API / Año',

      'section.mission':      'Nuestra Misión',
      'section.mission.title.1': 'La Tecnología como',
      'section.mission.title.2': 'Fuerza para el Bien',
      'section.whatwebuild':   'Lo Que Construimos',
      'section.whatwebuild.title.1': 'Sistemas Que',
      'section.whatwebuild.title.2': 'Impulsan el Mañana',
      'section.impact':       'Historias de Impacto',
      'section.insights':     'Últimas Perspectivas',
      'section.insights.title.1': 'De Nuestro',
      'section.insights.title.2': 'Laboratorio de Investigación',

      'btn.learnmore':        'Más información',
      'btn.readmore':         'Leer más',
      'btn.viewall':          'Ver Todos los Productos y Servicios',
      'btn.viewposts':        'Ver Todas las Publicaciones',
      'btn.explore':          'Explorar Nuestras Plataformas',
      'btn.getintouch':       'Contáctenos',
      'btn.subscribe':        'Suscribirse',
      'btn.jointeam':         'Únete a Nuestro Equipo',
      'btn.viewroles':        'Ver Puestos Abiertos',
      'btn.partner':          'Ser Socio',
      'btn.send':             'Enviar Mensaje',
      'btn.apply':            'Aplicar Ahora',

      'footer.desc':          'Una fundación tecnológica que crea sistemas innovadores para un impacto global. Código abierto. Transparente. Para la humanidad.',
      'footer.company':       'Empresa',
      'footer.resources':     'Recursos',
      'footer.contact':       'Contacto',
      'footer.stayupdated':   'Mantente Informado',
      'footer.copyright':     'The Nicholas Foundation. Todos los derechos reservados.',
      'footer.privacy':       'Política de Privacidad',
      'footer.terms':         'Términos de Servicio',
      'footer.cookies':       'Configuración de Cookies',
      'footer.support':       'Centro de Soporte',
      'footer.docs':          'Documentación',
      'footer.api':           'Referencia API',
      'footer.opensource':     'Código Abierto',
      'footer.general':       'Consultas Generales',
      'footer.techsupport':   'Soporte Técnico',
      'footer.globalhq':      'Sede Global',
      'footer.worldwide':     'Disponible Mundialmente',

      'cookie.title':         '🍪 Usamos cookies mínimas',
      'cookie.desc':          'para guardar sus preferencias y entender cómo se usa nuestro sitio.',
      'cookie.learn':         'Más información',
      'cookie.essential':     'Solo Esenciales',
      'cookie.accept':        'Aceptar Todo',

      'announce.text':        'FedCore v3 ya está disponible —',
      'announce.link':        'Ver novedades →',

      'lang.label':           'Idioma',
      'partners.title':       'De Confianza para Organizaciones a Nivel Mundial',

      'cta.title.1':          '¿Listo para Construir',
      'cta.title.2':          'Algo Que Importa?',
      'cta.desc':             'Únase a miles de ingenieros, investigadores y organizaciones que utilizan la tecnología TNF para crear un cambio global.',

      'scroll.indicator':     'Desplazar',
    },

    sw: {
      'nav.tagline':          'Kuunda Mustakabali',
      'nav.search':           'Tafuta (Ctrl+K)',
      'nav.theme':            'Badilisha mandhari',
      'nav.profile':          'Wasifu wa mtumiaji',

      'sidebar.main':         'Kuu',
      'sidebar.company':      'Kampuni',
      'sidebar.home':         'Nyumbani',
      'sidebar.about':        'Kuhusu Sisi',
      'sidebar.products':     'Bidhaa na Huduma',
      'sidebar.blog':         'Blogu',
      'sidebar.careers':      'Kazi',
      'sidebar.contact':      'Wasiliana Nasi',
      'sidebar.support':      'Msaada',
      'sidebar.faq':          'Maswali',
      'sidebar.privacy':      'Faragha na Masharti',

      'hero.badge':           'Teknolojia kwa Ubinadamu',
      'hero.tagline':         'Kuunda Mustakabali wa',
      'hero.subtitle':        'Tunaunda mifumo ya teknolojia ya kisasa inayotatua changamoto kubwa zaidi za ubinadamu kwa kiwango cha kimataifa — kutoka miundombinu ya chanzo huru hadi majukwaa yanayoendeshwa na AI.',
      'hero.cta.explore':     'Gundua Kazi Yetu',
      'hero.cta.mission':     'Dhamira Yetu',
      'hero.stat.countries':  'Nchi Zilizofikiwa',
      'hero.stat.lives':      'Maisha Yaliyoathiriwa',
      'hero.stat.projects':   'Miradi ya Chanzo Huru',
      'hero.stat.api':        'Simu za API / Mwaka',

      'section.mission':      'Dhamira Yetu',
      'section.mission.title.1': 'Teknolojia kama',
      'section.mission.title.2': 'Nguvu ya Mema',
      'section.whatwebuild':   'Tunachounda',
      'section.whatwebuild.title.1': 'Mifumo Inayojenga',
      'section.whatwebuild.title.2': 'Kesho',
      'section.impact':       'Hadithi za Athari',
      'section.insights':     'Uchambuzi wa Hivi Karibuni',
      'section.insights.title.1': 'Kutoka',
      'section.insights.title.2': 'Maabara Yetu ya Utafiti',

      'btn.learnmore':        'Jifunze zaidi',
      'btn.readmore':         'Soma zaidi',
      'btn.viewall':          'Tazama Bidhaa na Huduma Zote',
      'btn.viewposts':        'Tazama Machapisho Yote',
      'btn.explore':          'Gundua Majukwaa Yetu',
      'btn.getintouch':       'Wasiliana Nasi',
      'btn.subscribe':        'Jiandikishe',
      'btn.jointeam':         'Jiunge na Timu Yetu',
      'btn.viewroles':        'Tazama Nafasi Zilizo Wazi',
      'btn.partner':          'Kuwa Mshirika',
      'btn.send':             'Tuma Ujumbe',
      'btn.apply':            'Omba Sasa',

      'footer.desc':          'Taasisi ya teknolojia inayounda mifumo bunifu ya athari ya kimataifa. Chanzo huru. Uwazi. Kwa ubinadamu.',
      'footer.company':       'Kampuni',
      'footer.resources':     'Rasilimali',
      'footer.contact':       'Mawasiliano',
      'footer.stayupdated':   'Baki na Habari',
      'footer.copyright':     'The Nicholas Foundation. Haki zote zimehifadhiwa.',
      'footer.privacy':       'Sera ya Faragha',
      'footer.terms':         'Masharti ya Huduma',
      'footer.cookies':       'Mipangilio ya Kuki',
      'footer.support':       'Kituo cha Msaada',
      'footer.docs':          'Nyaraka',
      'footer.api':           'Rejea ya API',
      'footer.opensource':     'Chanzo Huru',
      'footer.general':       'Maswali ya Jumla',
      'footer.techsupport':   'Msaada wa Kiufundi',
      'footer.globalhq':      'Makao Makuu ya Kimataifa',
      'footer.worldwide':     'Inapatikana Ulimwenguni',

      'cookie.title':         '🍪 Tunatumia kuki chache',
      'cookie.desc':          'kuhifadhi mapendeleo yako na kuelewa jinsi tovuti yetu inavyotumiwa.',
      'cookie.learn':         'Jifunze zaidi',
      'cookie.essential':     'Muhimu Tu',
      'cookie.accept':        'Kubali Yote',

      'announce.text':        'FedCore v3 sasa inapatikana —',
      'announce.link':        'Tazama mambo mapya →',

      'lang.label':           'Lugha',
      'partners.title':       'Kuaminiwa na Mashirika Ulimwenguni',

      'cta.title.1':          'Tayari Kuunda',
      'cta.title.2':          'Kitu Chenye Maana?',
      'cta.desc':             'Jiunge na maelfu ya wahandisi, watafiti na mashirika yanayotumia teknolojia ya TNF kuunda mabadiliko ya kimataifa.',

      'scroll.indicator':     'Sogeza',
    },
  };

  // --- Language metadata ---
  const LANGUAGES = [
    { code: 'en', label: 'English',  flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español',  flag: '🇪🇸' },
    { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  ];

  let currentLang = DEFAULT_LANG;

  // --- Get stored language ---
  function getStoredLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  // --- Apply translations ---
  function translate(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);

    // Translate all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = dict[key];
      if (translation === undefined) return;

      // Handle different element types
      const target = el.getAttribute('data-i18n-target');
      if (target === 'placeholder') {
        el.setAttribute('placeholder', translation);
      } else if (target === 'aria-label') {
        el.setAttribute('aria-label', translation);
      } else if (target === 'title') {
        el.setAttribute('title', translation);
      } else {
        // Smooth text transition
        el.style.transition = 'opacity 0.15s ease';
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = translation;
          el.style.opacity = '1';
        }, 150);
      }
    });

    // Update the lang button display
    updateSwitcherDisplay(lang);

    // Fire custom event
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  // --- Update the switcher button display ---
  function updateSwitcherDisplay(lang) {
    const info = LANGUAGES.find(l => l.code === lang);
    const btn = document.querySelector('.lang-btn');
    if (btn && info) {
      btn.querySelector('.lang-flag').textContent = info.flag;
      btn.querySelector('.lang-code').textContent = info.code.toUpperCase();
    }

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
  }

  // --- Build language switcher UI ---
  function buildSwitcher() {
    // Find all .lang-switcher-mount points
    document.querySelectorAll('.lang-switcher-mount').forEach(mount => {
      if (mount.querySelector('.lang-switcher')) return; // already built

      const switcher = document.createElement('div');
      switcher.className = 'lang-switcher';
      switcher.innerHTML = `
        <button class="lang-btn" aria-label="Change language" aria-expanded="false" aria-haspopup="listbox">
          <span class="lang-flag">🇬🇧</span>
          <span class="lang-code">EN</span>
          <svg class="lang-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="lang-dropdown" role="listbox" aria-label="Select language">
          ${LANGUAGES.map(l => `
            <button class="lang-option${l.code === currentLang ? ' active' : ''}"
                    data-lang="${l.code}" role="option"
                    aria-selected="${l.code === currentLang}">
              <span class="lang-option-flag">${l.flag}</span>
              <span class="lang-option-label">${l.label}</span>
              <span class="lang-option-check">✓</span>
            </button>
          `).join('')}
        </div>
      `;

      mount.appendChild(switcher);

      // Toggle dropdown
      const btn = switcher.querySelector('.lang-btn');
      const dropdown = switcher.querySelector('.lang-dropdown');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        // Close all other dropdowns first
        document.querySelectorAll('.lang-dropdown.open').forEach(d => {
          d.classList.remove('open');
          d.closest('.lang-switcher').querySelector('.lang-btn').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          dropdown.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      // Language option click
      dropdown.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const lang = opt.dataset.lang;
          translate(lang);
          dropdown.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.closest('.lang-switcher').querySelector('.lang-btn').setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.lang-dropdown.open').forEach(d => {
          d.classList.remove('open');
          d.closest('.lang-switcher').querySelector('.lang-btn').setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // --- Init ---
  function init() {
    currentLang = getStoredLang();
    buildSwitcher();

    // Apply stored language (only if not English — English is the default content)
    if (currentLang !== DEFAULT_LANG) {
      // Apply immediately (no fade for initial load)
      const dict = TRANSLATIONS[currentLang];
      if (dict) {
        document.documentElement.setAttribute('lang', currentLang);
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          const translation = dict[key];
          if (translation === undefined) return;
          const target = el.getAttribute('data-i18n-target');
          if (target === 'placeholder') {
            el.setAttribute('placeholder', translation);
          } else if (target === 'aria-label') {
            el.setAttribute('aria-label', translation);
          } else if (target === 'title') {
            el.setAttribute('title', translation);
          } else {
            el.textContent = translation;
          }
        });
        updateSwitcherDisplay(currentLang);
      }
    } else {
      updateSwitcherDisplay(DEFAULT_LANG);
    }
  }

  return { init, translate, currentLang: () => currentLang, LANGUAGES };
})();

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
});
