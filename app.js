/* Main Application Logic - Toro & García Firma Legal */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Configuración de Temas (Claro / Oscuro)
    // ----------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Cargar preferencia guardada o usar oscuro por defecto (estilo premium)
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
            showToast('Modo Claro activado', 'success');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            showToast('Modo Oscuro Premium activado', 'success');
        }
    });

    // ----------------------------------------------------
    // 2. Navegación Sticky & Menú Mobile
    // ----------------------------------------------------
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Cambiar estilo de navbar al hacer scroll
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Smart Navbar: Hide on scroll down, show on scroll up
        if (currentScrollY > 100 && currentScrollY > lastScrollY && !navMenu.classList.contains('active')) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        lastScrollY = currentScrollY;

        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active State Link por Scroll
        let current = '';
        const sections = document.querySelectorAll('section, header');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Menú Responsive Toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Cerrar menú mobile al hacer click en enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // ----------------------------------------------------
    // 3. Efecto Parallax en Hero & Scroll Reveals
    // ----------------------------------------------------
    const heroBg = document.querySelector('.hero-parallax-bg');
    window.addEventListener('scroll', () => {
        if (heroBg) {
            let offset = window.scrollY;
            heroBg.style.transform = `translateY(${offset * 0.4}px)`;
        }
    });

    // Intersection Observer para animar elementos
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Si tiene números métricos, animarlos
                const numbers = entry.target.querySelectorAll('.metric-num');
                if (numbers.length > 0) {
                    numbers.forEach(num => animateMetricNumber(num));
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Animación de números métricos
    function animateMetricNumber(element) {
        const target = parseInt(element.getAttribute('data-val'));
        let count = 0;
        const speed = target / 50; // Velocidad de conteo
        const updateCount = () => {
            count += speed;
            if (count < target) {
                element.innerText = Math.floor(count);
                setTimeout(updateCount, 25);
            } else {
                element.innerText = target;
            }
        };
        updateCount();
    }

    // ----------------------------------------------------
    // 4. Mapa Leaflet (Ubicación en Calacoto, La Paz)
    // ----------------------------------------------------
    // Coordenadas exactas del Edificio Flor de Loto, Calacoto, Calle 12, La Paz
    
    const firmLat = -16.54062120707868;
    const firmLng = -68.0873790985817;
    
    try {
        const map = L.map('map', {
            center: [firmLat, firmLng],
            zoom: 16,
            scrollWheelZoom: false
        });

        // Tile layer elegante OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Icono de pin premium
        const goldIcon = L.divIcon({
            html: '<i class="fa-solid fa-location-pin" style="color: #C9A227; font-size: 2.2rem; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.5));"></i>',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            className: 'custom-leaflet-icon'
        });

        const marker = L.marker([firmLat, firmLng], { icon: goldIcon }).addTo(map);
        marker.bindPopup("<b>Toro & García</b><br>Edif. Flor de Loto Empresarial, Piso 6A<br>La Paz, Bolivia<br><a href='https://maps.app.goo.gl/2X8aQnn9PTSpRf6y5' target='_blank' style='color:#1D4E89; text-decoration:underline; font-weight:bold; margin-top:5px; display:inline-block;'>Ver en Google Maps</a>").openPopup();
    } catch (e) {
        console.error("Error cargando el mapa de Leaflet: ", e);
    }

    // ----------------------------------------------------
    // 5. Carrusel de Testimonios
    // ----------------------------------------------------
    const track = document.getElementById('carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('carousel-next');
    const prevButton = document.getElementById('carousel-prev');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = Array.from(dotsNav.children);

    const slideWidth = slides[0].getBoundingClientRect().width;

    // Disponer slides secuencialmente
    const setSlidePosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    };
    slides.forEach(setSlidePosition);

    const moveToSlide = (track, currentSlide, targetSlide) => {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current-indicator');
        targetDot.classList.add('current-indicator');
    };

    // Botón Izquierdo
    prevButton.addEventListener('click', e => {
        const currentSlide = track.querySelector('.current-slide');
        const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1]; // Loop al final
        const currentDot = dotsNav.querySelector('.current-indicator');
        const prevDot = currentDot.previousElementSibling || dots[dots.length - 1];

        moveToSlide(track, currentSlide, prevSlide);
        updateDots(currentDot, prevDot);
    });

    // Botón Derecho
    nextButton.addEventListener('click', e => {
        const currentSlide = track.querySelector('.current-slide');
        const nextSlide = currentSlide.nextElementSibling || slides[0]; // Loop al inicio
        const currentDot = dotsNav.querySelector('.current-indicator');
        const nextDot = currentDot.nextElementSibling || dots[0];

        moveToSlide(track, currentSlide, nextSlide);
        updateDots(currentDot, nextDot);
    });

    // Indicadores de puntitos
    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;

        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-indicator');
        const targetIndex = dots.indexOf(targetDot);
        const targetSlide = slides[targetIndex];

        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
    });

    // Auto-slide cada 6 segundos
    let autoSlideInterval = setInterval(() => {
        nextButton.click();
    }, 6000);

    // Reiniciar intervalo al interactuar
    const resetAutoSlide = () => {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            nextButton.click();
        }, 6000);
    };

    nextButton.addEventListener('click', resetAutoSlide);
    prevButton.addEventListener('click', resetAutoSlide);
    dotsNav.addEventListener('click', resetAutoSlide);

    // ----------------------------------------------------
    // 6. Sistema de Modals (Socios & Documentación Legal)
    // ----------------------------------------------------
    const partnerModal = document.getElementById('partner-modal');
    const partnerModalBody = document.getElementById('partner-modal-body');
    const legalModal = document.getElementById('legal-modal');
    const legalModalBody = document.getElementById('legal-modal-body');

    // Datos detallados de Socios para inyección dinámica
    const partnersData = {
        toro: {
            name: "Dr. Alejandro Toro Canedo, PhD.",
            role: "Socio Fundador / Director Académico",
            img: "images/socios-toro.jpg",
            bio: "El Dr. Alejandro Toro Canedo es una de las figuras jurídicas más respetadas del país. Combina una rigurosa preparación académica a nivel internacional con más de 25 años de litigación activa en cortes bolivianas y defensa empresarial preventiva.",
            studies: [
                "Doctorado (PhD) en Derecho Constitucional - Universidad Complutense de Madrid.",
                "Maestría en Asesoría Jurídica de Empresas - Universidad Mayor de San Andrés.",
                "Ex-consultor de organismos internacionales y entes reguladores estatales.",
                "Catedrático de pregrado y posgrado en Derecho Comercial y Administrativo."
            ],
            areas: "Derecho Civil, Comercial, Administrativo, Constitucional, Auditorías de Cumplimiento Legal.",
            contact: "alertoro@hotmail.com | Piso 6A, Oficina A"
        },
        garcia: {
            name: "Dr. César García",
            role: "Socio Fundador / Especialista Litigante",
            img: "images/socios-garcia.jpg",
            bio: "El Dr. César García se distingue por una práctica jurídica de excelencia y una probada efectividad en la representación corporativa y litigación compleja. Su enfoque riguroso garantiza la defensa estratégica y resolutiva de los intereses de sus clientes ante cualquier instancia.",
            studies: [
                "Titulado con honores Summa «Cum Laude» de la Universidad de Aquino Bolivia.",
                "Colegiado con honores en el Ilustre Colegio de Abogados de La Paz.",
                "Diplomado de Altos Estudios Nacionales.",
                "Magíster en Seguridad, Defensa y Desarrollo del Estado."
            ],
            areas: "Derecho Laboral, Civil, Procesos de Daños y Perjuicios, Consultoría de Sociedades Comerciales.",
            contact: "cgarcia@torogarcialegal.com | Piso 6A, Oficina B"
        }
    };

    window.openPartnerModal = (key) => {
        const data = partnersData[key];
        if (!data) return;

        partnerModalBody.innerHTML = `
            <div class="modal-partner-grid">
                <div>
                    <img src="${data.img}" alt="${data.name}" class="modal-partner-img">
                    <div style="margin-top:20px; text-align:center;">
                        <span class="partner-role" style="font-size:0.7rem; display:block;">Contacto Directo</span>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:5px;"><i class="fa-solid fa-envelope text-gold"></i> ${data.contact.split('|')[0].trim()}</p>
                    </div>
                </div>
                <div class="modal-partner-details">
                    <h3 class="modal-partner-name">${data.name}</h3>
                    <span class="modal-partner-title">${data.role}</span>
                    
                    <div class="modal-partner-bio">
                        <h4>Perfil Profesional</h4>
                        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:15px;">${data.bio}</p>
                        
                        <h4>Áreas Clave de Especialidad</h4>
                        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:15px; font-weight:500;"><i class="fa-solid fa-scale-balanced text-gold"></i> ${data.areas}</p>
                        
                        <h4>Formación & Destacados</h4>
                        <ul>
                            ${data.studies.map(study => `<li><i class="fa-solid fa-award"></i> ${study}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        partnerModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    };

    window.closePartnerModal = () => {
        partnerModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Datos de Documentos Legales para Modal
    const legalData = {
        aviso: {
            title: "Aviso Legal",
            content: `<h3>Información de Titularidad</h3><p>El dominio de este sitio web pertenece a <b>Toro & García Firma Legal</b> con domicilio corporativo en el Edificio Flor de Loto Empresarial, Piso 6A, Calacoto, La Paz - Bolivia.</p><h3>Uso del Sitio</h3><p>La información contenida en esta página web es de carácter estrictamente informativo y referencial sobre los servicios de la firma. No constituye asesoramiento legal formal ni establece una relación abogado-cliente. Para una evaluación concreta de su situación jurídica, le instamos a programar una consulta profesional presencial o virtual.</p>`
        },
        privacidad: {
            title: "Política de Privacidad",
            content: `<h3>Tratamiento de Datos de Consulta</h3><p>En <b>Toro & García</b> tomamos la confidencialidad con la máxima seriedad jurídica. Los datos suministrados mediante nuestro formulario de contacto (Nombre, Correo, Teléfono y Mensaje) serán procesados exclusivamente con el fin de responder a su requerimiento de asesoría y coordinar consultas legales.</p><h3>Derechos del Usuario</h3><p>No compartiremos su información personal con terceras partes bajo ningún concepto, excepto por estricta orden judicial del Estado Plurinacional de Bolivia. Usted podrá solicitar la supresión o actualización de sus datos de contacto escribiendo a <i>alertoro@hotmail.com</i>.</p>`
        },
        terminos: {
            title: "Términos del Servicio",
            content: `<h3>Aceptación de Condiciones</h3><p>Al navegar por la web oficial de Toro & García, usted acepta voluntariamente las condiciones de uso descritas. La firma se reserva el derecho de actualizar la información sobre áreas de práctica, tarifas de consulta inicial y perfiles profesionales en cualquier momento sin notificación previa.</p><h3>Propiedad Intelectual</h3><p>Todos los logotipos, textos, fotografías de socios y artículos de análisis jurídico contenidos en este portal web son propiedad de la firma y están protegidos por el marco nacional e internacional de propiedad intelectual.</p>`
        }
    };

    window.openLegalModal = (type) => {
        const doc = legalData[type];
        if (!doc) return;

        legalModalBody.innerHTML = `
            <h3 class="section-title" style="margin-bottom: 20px;">${doc.title}</h3>
            <div class="legal-text-content" style="max-height: 400px; overflow-y: auto; padding-right:10px;">
                ${doc.content}
            </div>
            <div style="margin-top: 30px; text-align:right;">
                <button class="btn btn-gold-solid btn-sm" onclick="closeLegalModal()">Entendido</button>
            </div>
        `;
        legalModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLegalModal = () => {
        legalModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Cerrar modals al hacer click fuera del contenedor
    [partnerModal, legalModal].forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ----------------------------------------------------
    // 7. Blog Autoadministrable (localStorage Integración)
    // ----------------------------------------------------
    const defaultPosts = [
        {
            id: 1,
            title: "Aspectos legales para empresas en Bolivia",
            category: "Derecho Comercial",
            author: "Dr. Alejandro Toro Canedo, PhD.",
            date: "05 Jun, 2026",
            img: "images/justicia-comercial.png",
            excerpt: "Guía práctica para emprendedores e inversionistas extranjeros sobre los requisitos de constitución de sociedades colectivas, de responsabilidad limitada (SRL) y sociedades anónimas en el marco del Código de Comercio boliviano vigente."
        },
        {
            id: 2,
            title: "Contratos y protección jurídica corporativa",
            category: "Derecho Civil",
            author: "Firma Toro & García",
            date: "28 May, 2026",
            img: "images/hero-bg.png",
            excerpt: "La importancia de las cláusulas penales y la resolución alternativa de conflictos en los contratos comerciales. Cómo blindar jurídicamente sus activos ante posibles incumplimientos de proveedores."
        },
        {
            id: 3,
            title: "Derechos laborales actualizados en 2026",
            category: "Derecho Laboral",
            author: "Dr. César García",
            date: "12 May, 2026",
            img: "images/justicia-comercial.png",
            excerpt: "Análisis pormenorizado del cálculo de finiquitos, desahucios y la estabilidad laboral reforzada en Bolivia. Herramientas de cumplimiento para empleadores y resguardo del talento humano."
        },
        {
            id: 4,
            title: "Procedimientos administrativos ante entes públicos",
            category: "Derecho Administrativo",
            author: "Dr. Alejandro Toro Canedo, PhD.",
            date: "02 May, 2026",
            img: "images/hero-bg.png",
            excerpt: "Cómo responder a fiscalizaciones estatales impositivas o de regulación sectorial. Estructura de recursos de alzada y recursos jerárquicos para garantizar el debido proceso corporativo."
        }
    ];

    // Cargar posts del localStorage o inicializar por defecto
    let currentPosts = JSON.parse(localStorage.getItem('legal_posts'));
    if (!currentPosts || currentPosts.length === 0) {
        currentPosts = defaultPosts;
        localStorage.setItem('legal_posts', JSON.stringify(currentPosts));
    }

    const blogGrid = document.getElementById('blog-grid');
    const blogAdminModal = document.getElementById('blog-admin-modal');
    const btnAdminBlog = document.getElementById('btn-admin-blog');
    const closeBlogAdminModal = document.getElementById('close-blog-admin-modal');
    const blogAdminForm = document.getElementById('blog-admin-form');

    // Función para renderizar posts
    const renderBlogPosts = () => {
        blogGrid.innerHTML = '';
        currentPosts.forEach(post => {
            blogGrid.innerHTML += `
                <article class="blog-card scroll-reveal revealed">
                    <div class="blog-img-container">
                        <img src="${post.img}" alt="${post.title}" class="blog-card-img">
                        <span class="blog-card-category">${post.category}</span>
                    </div>
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span><i class="fa-solid fa-calendar-days text-gold"></i> ${post.date}</span>
                            <span><i class="fa-solid fa-user-tie text-gold"></i> ${post.author.split(',')[0]}</span>
                        </div>
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${post.excerpt}</p>
                        <a href="#contacto" class="blog-card-link">Leer artículo completo <i class="fa-solid fa-chevron-right"></i></a>
                    </div>
                </article>
            `;
        });
    };

    // Renderizado inicial
    renderBlogPosts();

    
    // Formulario de Creación de Posts
    blogAdminForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const category = document.getElementById('post-category').value;
        const author = document.getElementById('post-author').value;
        const img = document.getElementById('post-image').value;
        const content = document.getElementById('post-content').value;
        
        // Obtener fecha actual legible
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = new Date().toLocaleDateString('es-BO', options);

        const newPost = {
            id: currentPosts.length + 1,
            title: title,
            category: category,
            author: author,
            date: formattedDate,
            img: img,
            excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : '')
        };

        // Agregar al inicio del feed
        currentPosts.unshift(newPost);
        localStorage.setItem('legal_posts', JSON.stringify(currentPosts));
        
        renderBlogPosts();
        blogAdminForm.reset();
        blogAdminModal.classList.remove('active');
        document.body.style.overflow = '';
        
        showToast('Artículo publicado y guardado localmente', 'success');
    });

    // ----------------------------------------------------
    // 8. Formulario de Contacto Corporativo
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const btnSubmitForm = document.getElementById('btn-submit-form');

    contactForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('form-name').value;
        const phone = document.getElementById('form-phone').value;
        const email = document.getElementById('form-email').value;
        const message = document.getElementById('form-message').value;

        // Mostrar estado cargando en el botón premium
        btnSubmitForm.disabled = true;
        btnSubmitForm.innerHTML = 'Enviando requerimiento... <i class="fa-solid fa-spinner fa-spin"></i>';

        // Simular envío de datos vía API / Servidor de correo
        setTimeout(() => {
            console.log("=== ENVÍO SIMULADO DE FORMULARIO LEGAL ===");
            console.log(`Nombre: ${name}`);
            console.log(`Teléfono: ${phone}`);
            console.log(`Email: ${email}`);
            console.log(`Mensaje: ${message}`);
            console.log("==========================================");

            btnSubmitForm.disabled = false;
            btnSubmitForm.innerHTML = 'Enviar Consulta <i class="fa-solid fa-paper-plane"></i>';
            contactForm.reset();

            // Mensaje de éxito al cliente
            showToast('Consulta enviada. Un abogado le responderá en breve.', 'success');
        }, 1500);
    });

    // ----------------------------------------------------
    // 8.1 Formulario de Consulta Express (Hero)
    // ----------------------------------------------------
    const heroExpressForm = document.getElementById('hero-express-form');
    const btnHeroSubmit = document.getElementById('btn-hero-submit');

    if (heroExpressForm) {
        heroExpressForm.addEventListener('submit', e => {
            e.preventDefault();

            const name = document.getElementById('hero-form-name').value;
            const phone = document.getElementById('hero-form-phone').value;
            const practice = document.getElementById('hero-form-practice').value;

            btnHeroSubmit.disabled = true;
            btnHeroSubmit.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>';

            setTimeout(() => {
                console.log("=== CONSULTA EXPRESS RECIBIDA ===");
                console.log(`Nombre: ${name}`);
                console.log(`Teléfono: ${phone}`);
                console.log(`Área de interés: ${practice}`);
                console.log("=================================");

                btnHeroSubmit.disabled = false;
                btnHeroSubmit.innerHTML = 'Enviar Solicitud <i class="fa-solid fa-paper-plane"></i>';
                heroExpressForm.reset();

                showToast('Solicitud recibida. Un abogado se contactará por WhatsApp/teléfono.', 'success');
            }, 1200);
        });
    }

    // ----------------------------------------------------
    // 9. Toast Notifications System
    // ----------------------------------------------------
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' 
            ? '<i class="fa-solid fa-circle-check"></i>' 
            : '<i class="fa-solid fa-triangle-exclamation"></i>';

        toast.innerHTML = `${icon} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Desvanecer después de 4 segundos
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    // Agregar animación de fadeOut en CSS dinámicamente si no existe
    if (!document.getElementById('toast-fadeout-style')) {
        const style = document.createElement('style');
        style.id = 'toast-fadeout-style';
        style.innerHTML = `@keyframes fadeOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }`;
        document.head.appendChild(style);
    }

   
    // ----------------------------------------------------
    // 11. Chatbot Asistente Jurídico Virtual (IA)
    // ----------------------------------------------------
    const aiTrigger = document.getElementById('ai-trigger-btn');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiClose = document.getElementById('ai-close-btn');
    const aiInputForm = document.getElementById('ai-input-form');
    const aiMessageInput = document.getElementById('ai-message-input');
    const aiMessages = document.getElementById('ai-messages');
    const aiSuggestions = document.getElementById('ai-suggestions');

    aiTrigger.addEventListener('click', () => {
        if (aiChatWindow.style.display === 'flex') {
            aiChatWindow.style.display = 'none';
        } else {
            aiChatWindow.style.display = 'flex';
            // Enfocar input
            aiMessageInput.focus();
        }
    });

    aiClose.addEventListener('click', () => {
        aiChatWindow.style.display = 'none';
    });

    // Respuestas preprogramadas estructuradas y formales
   const aiKnowledgeBase = {

    saludo: "Bienvenido a Toro & García. ¿En qué podemos ayudarle hoy?",

    firma: "Toro & García es una firma legal boliviana especializada en asesoría jurídica integral para personas, empresas e instituciones públicas y privadas, con sede en la ciudad de La Paz.",

    socios: "La firma está dirigida por el Dr. Alejandro Toro Canedo y el Dr. César García, profesionales con amplia experiencia en litigación, asesoría corporativa y consultoría jurídica.",

    ubicacion: "Nuestras oficinas se encuentran en el Edificio Flor de Loto Empresarial, Piso 6A, Calle 12 de Calacoto, Zona Sur de La Paz, Bolivia.",

    consulta: `
Puede agendar una consulta mediante nuestro formulario web, WhatsApp, llamada telefónica o correo electrónico.

<br><br>

<a href="https://wa.me/59177720008?text=Hola%20Toro%20%26%20Garc%C3%ADa,%20deseo%20agendar%20una%20consulta%20jur%C3%ADdica."
   target="_blank"
   style="
      display:inline-block;
      padding:10px 18px;
      background:#25D366;
      color:white;
      text-decoration:none;
      border-radius:6px;
      font-weight:600;
   ">
   📱 Agendar por WhatsApp
</a>
`,

    virtual: "Sí. Ofrecemos consultas presenciales y virtuales para clientes de todo Bolivia y del exterior.",

    nacional: "Sí. Prestamos servicios jurídicos a nivel nacional.",

    duracion: "La duración dependerá de la complejidad del caso, aunque normalmente las consultas iniciales tienen una duración de 30 a 60 minutos.",

    gratuita: "La disponibilidad y condiciones de la consulta inicial serán informadas al momento de coordinar la cita.",

    civil: "Sí. Elaboramos, revisamos y negociamos contratos civiles y comerciales. También atendemos daños y perjuicios, saneamiento de bienes inmuebles, conflictos de propiedad, posesión y derechos reales.",

    comercial: "Sí. Asesoramos en la constitución de SRL, SA y otros tipos societarios. También brindamos acompañamiento legal continuo para empresas, revisión de contratos comerciales e inversión extranjera.",

    laboral: "Sí. Asesoramos tanto a trabajadores como a empleadores en conflictos laborales, despidos, beneficios sociales, contratos laborales y reglamentos internos.",

    administrativo: "Sí. Representamos a clientes ante ministerios, municipios, entidades reguladoras y organismos públicos. Elaboramos recursos de revocatoria, alzada y jerárquicos.",

    constitucional: "Sí. Patrocinamos acciones de amparo constitucional, acciones de libertad y otros mecanismos constitucionales de protección de derechos.",

    honorarios: "Los honorarios se determinan según la naturaleza, complejidad y alcance del servicio requerido.",

    empresas: "Sí. Contamos con esquemas de asesoría legal permanente para empresas y organizaciones.",

    contacto: "Puede comunicarse con Toro & García mediante teléfono, WhatsApp, correo electrónico o formulario web."
};

    function appendMessage(text, sender = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender === 'bot' ? 'bot-msg' : 'user-msg'}`;
        msgDiv.innerHTML = text;
        aiMessages.appendChild(msgDiv);
        
        // Auto Scroll
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    function handleUserQuery(query) {
        appendMessage(query, 'user');

        // Simular escritura (loading dots)
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-message bot-msg typing-msg';
        loadingDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        aiMessages.appendChild(loadingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        // Limpiar input
        aiMessageInput.value = '';

        setTimeout(() => {
            // Remover loading
            loadingDiv.remove();

            // Normalizar la consulta para reconocer palabras con o sin acentos
            const lowerQuery = query
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            let response = "";

            if (
                lowerQuery.includes('hola') ||
                lowerQuery.includes('buenos dias') ||
                lowerQuery.includes('buenas tardes') ||
                lowerQuery.includes('buenas noches') ||
                lowerQuery.includes('saludos')
            ) {
                response = aiKnowledgeBase.saludo;

            } else if (
                lowerQuery.includes('quienes son') ||
                lowerQuery.includes('firma') ||
                lowerQuery.includes('toro y garcia')
            ) {
                response = aiKnowledgeBase.firma;

            } else if (
                lowerQuery.includes('alejandro') ||
                lowerQuery.includes('cesar') ||
                lowerQuery.includes('socio')
            ) {
                response = aiKnowledgeBase.socios;

            } else if (
                lowerQuery.includes('ubicacion') ||
                lowerQuery.includes('direccion') ||
                lowerQuery.includes('donde') ||
                lowerQuery.includes('oficina') ||
                lowerQuery.includes('calacoto')
            ) {
                response = aiKnowledgeBase.ubicacion;

            } else if (
                lowerQuery.includes('consulta') ||
                lowerQuery.includes('agendar') ||
                lowerQuery.includes('cita')
            ) {
                response = aiKnowledgeBase.consulta;

            } else if (
                lowerQuery.includes('virtual') ||
                lowerQuery.includes('online')
            ) {
                response = aiKnowledgeBase.virtual;

            } else if (
                lowerQuery.includes('nacional') ||
                lowerQuery.includes('fuera de la paz')
            ) {
                response = aiKnowledgeBase.nacional;

            } else if (
                lowerQuery.includes('duracion') ||
                lowerQuery.includes('cuanto dura')
            ) {
                response = aiKnowledgeBase.duracion;

            } else if (
                lowerQuery.includes('gratuita') ||
                lowerQuery.includes('primera consulta')
            ) {
                response = aiKnowledgeBase.gratuita;

            } else if (
                lowerQuery.includes('civil') ||
                lowerQuery.includes('contrato') ||
                lowerQuery.includes('propiedad') ||
                lowerQuery.includes('danos') ||
                lowerQuery.includes('daños')
            ) {
                response = aiKnowledgeBase.civil;

            } else if (
                lowerQuery.includes('empresa permanente') ||
                lowerQuery.includes('planes para empresas') ||
                lowerQuery.includes('asesoria permanente')
            ) {
                response = aiKnowledgeBase.empresas;

            } else if (
                lowerQuery.includes('empresa') ||
                lowerQuery.includes('srl') ||
                lowerQuery.includes('sa') ||
                lowerQuery.includes('sociedad') ||
                lowerQuery.includes('comercial')
            ) {
                response = aiKnowledgeBase.comercial;

            } else if (
                lowerQuery.includes('laboral') ||
                lowerQuery.includes('trabajo') ||
                lowerQuery.includes('beneficio') ||
                lowerQuery.includes('despido')
            ) {
                response = aiKnowledgeBase.laboral;

            } else if (
                lowerQuery.includes('administrativo') ||
                lowerQuery.includes('estado') ||
                lowerQuery.includes('ministerio') ||
                lowerQuery.includes('municipio') ||
                lowerQuery.includes('multa')
            ) {
                response = aiKnowledgeBase.administrativo;

            } else if (
                lowerQuery.includes('constitucional') ||
                lowerQuery.includes('amparo') ||
                lowerQuery.includes('tribunal constitucional')
            ) {
                response = aiKnowledgeBase.constitucional;

            } else if (
                lowerQuery.includes('honorario') ||
                lowerQuery.includes('precio') ||
                lowerQuery.includes('costo')
            ) {
                response = aiKnowledgeBase.honorarios;

            } else if (
                lowerQuery.includes('contacto') ||
                lowerQuery.includes('telefono') ||
                lowerQuery.includes('correo') ||
                lowerQuery.includes('whatsapp')
            ) {
                response = aiKnowledgeBase.contacto;
            }

            // Si no encontró respuesta, mostrar opción de WhatsApp
            if (!response) {
                const mensajeWhatsapp = encodeURIComponent(
                    `Hola Toro & García, tengo una consulta jurídica: "${query}"`
                );

                response = `
No encontré una respuesta específica para su consulta.

<br><br>

Para recibir asesoramiento jurídico personalizado, puede comunicarse directamente con nuestro equipo por WhatsApp.

<br><br>

<a href="https://wa.me/59177720008?text=${mensajeWhatsapp}"
   target="_blank"
   style="
      display:inline-block;
      padding:10px 18px;
      background:#25D366;
      color:white;
      text-decoration:none;
      border-radius:6px;
      font-weight:600;
   ">
   📱 Consultar por WhatsApp
</a>
`;
            }

            appendMessage(response, 'bot');
        }, 1200);
    }

    // Submit de input
    aiInputForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = aiMessageInput.value.trim();
        if (text) {
            handleUserQuery(text);
        }
    });

    // Click en tags sugeridos
    aiSuggestions.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;

        const key = button.getAttribute('data-query');
        let queryText = button.innerText;
        
        if (key === 'consulta') {
    window.open(
        'https://wa.me/59177720008?text=Hola%20Toro%20%26%20Garc%C3%ADa,%20deseo%20agendar%20una%20consulta%20jur%C3%ADdica.',
        '_blank'
    );
    return;
}
        
        handleUserQuery(queryText);
    });

    // Agregar CSS para los puntitos de escritura del bot
    if (!document.getElementById('ai-typing-dots-style')) {
        const style = document.createElement('style');
        style.id = 'ai-typing-dots-style';
        style.innerHTML = `
            .typing-msg span { animation: typingDots 1.4s infinite both; font-weight: bold; font-size: 1.2rem; display: inline-block; width: 6px; }
            .typing-msg span:nth-child(2) { animation-delay: .2s; margin: 0 3px; }
            .typing-msg span:nth-child(3) { animation-delay: .4s; }
            @keyframes typingDots { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
        `;
        document.head.appendChild(style);
    }
});
