/**
 * ==========================================================================
 * EXECUTIVE PRECISION INTERACTIVITY & CLIENT LOGIC
 * Portfolio for Malik Muhammad Abdullah (CS Student - Qarshi University)
 * strictly adhering to CV details
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. THEME TOGGLE (Dark / Light Mode) ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Check persisted preference or system preference
  const savedTheme = localStorage.getItem('portfolio_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = 'light_mode';
      localStorage.setItem('portfolio_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
      localStorage.setItem('portfolio_theme', 'light');
    }
  }

  // Initial application
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  // Toggle button event listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(!isCurrentlyDark);
    });
  }

  // --- 2. MOBILE NAVIGATION DRAWER ---
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileNav);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- 3. SINGLE PAGE SMOOTH SCROLLING CONTROLLER ---
  const headerHeight = 80;

  function smoothScrollToTarget(targetSelector) {
    if (!targetSelector || targetSelector === '#') return;
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });
  }

  // Intercept all anchor clicks with hash links
  const allHashLinks = document.querySelectorAll('a[href^="#"]');
  allHashLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetHash = this.getAttribute('href');
      if (targetHash && targetHash.startsWith('#') && targetHash.length > 1) {
        const targetElement = document.querySelector(targetHash);
        if (targetElement) {
          e.preventDefault();
          smoothScrollToTarget(targetHash);

          // Update URL hash cleanly without abrupt jumps
          if (history.pushState) {
            history.pushState(null, null, targetHash);
          } else {
            location.hash = targetHash;
          }

          // Close mobile drawer if open
          closeMobileNav();
        }
      }
    });
  });

  // --- 4. SCROLL PROGRESS & FLOATING BACK-TO-TOP BUTTON ---
  const progressBar = document.getElementById('scroll-progress-bar');
  const backToTopBtn = document.getElementById('floating-back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Update progress bar
    if (progressBar && scrollHeight > 0) {
      const progressPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // Toggle back to top button
    if (backToTopBtn) {
      if (scrollTop > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 5. SCROLLSPY / ACTIVE NAVIGATION & SIDE DOTS HIGHLIGHT ---
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const sideDots = document.querySelectorAll('.side-scroll-nav .side-dot');

  function updateActiveNav() {
    const scrollPosition = window.scrollY + headerHeight + 50;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const isAtBottom = (window.scrollY + winHeight) >= (docHeight - 60);

    let currentSectionId = '';

    if (window.scrollY < 200) {
      currentSectionId = 'hero';
    } else if (isAtBottom) {
      currentSectionId = 'contact';
    } else {
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });
    }

    // Fallback if between sections
    if (!currentSectionId && sections.length > 0) {
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 150) {
          currentSectionId = section.getAttribute('id');
        }
      });
    }

    // Update Desktop Nav
    desktopLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
    });

    // Update Mobile Nav
    mobileNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
    });

    // Update Side Dot Nav
    sideDots.forEach(dot => {
      const dotTarget = dot.getAttribute('data-section') || dot.getAttribute('href')?.replace('#', '');
      dot.classList.toggle('active', dotTarget === currentSectionId);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // --- 6. SECTION SCROLL REVEAL OBSERVER ---
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    sections.forEach(sec => {
      sec.classList.add('section-reveal');
      sectionObserver.observe(sec);
    });
  }

  // --- 7. KEYBOARD SECTION NAVIGATION (Alt + Up / Alt + Down) ---
  const sectionIdList = Array.from(sections).map(s => s.getAttribute('id'));
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const currentActiveDot = document.querySelector('.side-scroll-nav .side-dot.active');
      const currentActiveSection = currentActiveDot 
        ? (currentActiveDot.getAttribute('data-section') || currentActiveDot.getAttribute('href')?.replace('#', ''))
        : 'hero';

      let currentIndex = sectionIdList.indexOf(currentActiveSection);
      if (currentIndex === -1) currentIndex = 0;

      if (e.key === 'ArrowDown' && currentIndex < sectionIdList.length - 1) {
        smoothScrollToTarget(`#${sectionIdList[currentIndex + 1]}`);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        smoothScrollToTarget(`#${sectionIdList[currentIndex - 1]}`);
      }
    }
  });

  // --- 5. ANIMATED SKILL PROGRESS BARS ---
  const skillFills = document.querySelectorAll('.skill-fill');
  if ('IntersectionObserver' in window && skillFills.length > 0) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetPercent = entry.target.getAttribute('data-target-width');
          if (targetPercent) {
            entry.target.style.width = targetPercent;
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    skillFills.forEach(fill => skillsObserver.observe(fill));
  } else {
    skillFills.forEach(fill => {
      fill.style.width = fill.getAttribute('data-target-width') || '85%';
    });
  }

  // --- 6. TOAST NOTIFICATION UTILITY ---
  const toast = document.getElementById('toast-notice');
  const toastMsg = document.getElementById('toast-message');
  let toastTimeout;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- 7. COPY CONTACT EMAIL TO CLIPBOARD ---
  const copyBtn = document.getElementById('btn-copy-email');
  const copyStatus = document.getElementById('copy-email-status');
  const emailText = 'malikmabdullahh44@gmail.com';

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(emailText).then(() => {
          onCopySuccess();
        }).catch(() => fallbackCopy(emailText));
      } else {
        fallbackCopy(emailText);
      }
    });
  }

  function onCopySuccess() {
    if (copyStatus) copyStatus.textContent = 'Copied!';
    showToast('Email address copied to clipboard');
    setTimeout(() => {
      if (copyStatus) copyStatus.textContent = 'Copy';
    }, 2200);
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      onCopySuccess();
    } catch (err) {
      showToast('Email: ' + text);
    }
    document.body.removeChild(tempInput);
  }

  // --- 8. CHARACTER COUNTER FOR INQUIRY TEXTAREA ---
  const contactTextarea = document.getElementById('contact-message');
  const charCounter = document.getElementById('char-counter');

  if (contactTextarea && charCounter) {
    contactTextarea.addEventListener('input', () => {
      const len = contactTextarea.value.length;
      charCounter.textContent = `${len} / 1000`;
    });
  }

  // --- 9. CONTACT FORM TRANSMISSION HANDLER ---
  const contactForm = document.getElementById('portfolio-contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('btn-text');
  const feedbackBox = document.getElementById('form-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-sender-email').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = contactTextarea ? contactTextarea.value.trim() : '';

      if (!name || !email || !message) {
        showToast('Please complete all required fields.');
        return;
      }

      // Enter Loading State
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Transmitting...';

      setTimeout(() => {
        // Exit Loading State
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Transmit Message';

        if (feedbackBox) {
          feedbackBox.className = 'form-feedback-card success';
          feedbackBox.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 4px;">
              <span class="material-symbols-outlined" style="font-size: 18px;">check_circle</span>
              <span>Message Staged Successfully</span>
            </div>
            <p>Thank you, <strong>${escapeHtml(name)}</strong>. Your message regarding <em>"${escapeHtml(subject)}"</em> has been dispatched to Malik Muhammad Abdullah.</p>
          `;
        }

        // Trigger native mailto link for direct delivery
        const mailtoUri = `mailto:malikmabdullahh44@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Sender: " + name + " (" + email + ")\n\n" + message)}`;
        window.location.href = mailtoUri;

        // Reset form
        contactForm.reset();
        if (charCounter) charCounter.textContent = '0 / 1000';
        showToast('Inquiry logged and staged for dispatch.');
      }, 700);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // --- 10. WORK BREAKDOWN MODAL DIALOG ---
  const modalOverlay = document.getElementById('case-study-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const caseStudyTriggers = document.querySelectorAll('[data-case-study]');

  const caseStudyData = {
    seo: {
      tag: 'SEO Executive Experience',
      title: 'SEO Executive Work &ndash; Aj Developers',
      summary: 'Practical experience in office environment under senior supervision executing end-to-end On-Page and Off-Page search engine optimization.',
      problem: 'Ensuring digital visibility, accurate search indexing, and ranking authority across targeted key search terms.',
      solution: 'Performed structured On-Page SEO (meta tags, keyword optimization, content optimization), assisted in Off-Page SEO (backlink creation, directory submissions), and conducted thorough keyword research.',
      results: [
        'Conducted targeted Keyword Research for niche search terms',
        'Optimized On-Page meta tags, headers, and content structure',
        'Built high-quality Off-Page backlinks and directory submissions',
        'Collaborated directly under senior supervision in professional office setting'
      ],
      stack: ['On-Page SEO', 'Off-Page SEO', 'Keyword Research', 'Meta Tags', 'Backlink Creation', 'Directory Submissions']
    },
    webdev: {
      tag: 'Web Development Experience',
      title: 'Web Development & Maintenance',
      summary: 'Hands-on development of clean websites using HTML, CSS, and WordPress, including ongoing updates and content maintenance.',
      problem: 'Building accessible, functional web pages and maintaining fresh content without technical breakdown.',
      solution: 'Developed custom web pages utilizing semantic HTML and modern CSS, deployed WordPress instances, and maintained site health and updates.',
      results: [
        'Developed basic responsive websites using HTML & CSS',
        'Configured and managed WordPress content and themes',
        'Handled ongoing website updates and routine maintenance'
      ],
      stack: ['HTML', 'CSS', 'WordPress', 'Website Maintenance', 'Content Updates']
    }
  };

  function openCaseStudy(studyId) {
    const data = caseStudyData[studyId] || caseStudyData.seo;
    const modalContentContainer = document.getElementById('modal-dynamic-body');
    if (!modalContentContainer || !modalOverlay) return;

    modalContentContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <span class="category-tag" style="margin-bottom: 8px;">${data.tag}</span>
          <h3 class="font-headline-lg" style="color: var(--color-on-surface); margin-top: 6px;">${data.title}</h3>
        </div>
        <p class="font-body-md" style="color: var(--color-on-surface-variant);">${data.summary}</p>
        
        <div style="background-color: var(--color-surface-low); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border-card);">
          <h4 class="font-headline-sm" style="color: var(--color-primary-container); margin-bottom: 6px;">Key Responsibilities</h4>
          <p class="font-body-sm" style="color: var(--color-on-surface-variant);">${data.solution}</p>
        </div>

        <div>
          <h4 class="font-headline-sm" style="color: var(--color-on-surface); margin-bottom: 8px;">Practical Highlights</h4>
          <ul style="display: flex; flex-direction: column; gap: 6px;">
            ${data.results.map(r => `
              <li style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-on-surface-variant);">
                <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 16px;">check_circle</span>
                <span>${r}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div>
          <h4 class="font-headline-sm" style="color: var(--color-on-surface); margin-bottom: 8px;">Skills &amp; Technologies</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${data.stack.map(s => `<span class="skill-pill">${s}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  caseStudyTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const studyKey = trigger.getAttribute('data-case-study') || 'seo';
      openCaseStudy(studyKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // --- 11. MALIK M ABDULLAH CV DOWNLOAD ---
  const downloadCvBtns = document.querySelectorAll('.trigger-cv-download');
  downloadCvBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadMalikResumeFile();
    });
  });

  function downloadMalikResumeFile() {
    const resumeText = `===========================================================
MALIK M ABDULLAH
CS STUDENT
===========================================================

CONTACT INFO:
• Phone: +92 3297533870
• Email: malikmabdullahh44@gmail.com
• Location: Sabzazar, K Block, Lahore

PROFILE:
Dedicated and detail-oriented CS student with hands-on experience in Seo executive and web technologies. Seeking an opportunity to contribute technical knowledge and interpersonal skills in a dynamic and growth-focused organization.

EDUCATION:
• BSCS (Bachelor of Science in Computer Science) | 2024–2028 Present (5th Semester)
  Qarshi University Lahore

• Intermediate | 2022–2024
  Punjab Group of Colleges

• Matriculation | 2020–2022
  Unique School

EXPERIENCE:
• SEO Executive – Aj Developers
  - Worked in office environment under senior supervision
  - Performed On-Page SEO (Meta tags, keyword optimization, content optimization)
  - Assisted in Off-Page SEO (Backlink creation, directory submissions)
  - Conducted Keyword Research

• Web Development (Basic Level)
  - Developed basic websites using HTML, CSS, WordPress
  - Managed website updates and maintenance

SKILLS:
• SEO (On-Page, Off-Page, Keyword Research, Meta Tags)
• Web development (HTML, CSS, WordPress)
• Active listening
• Customer handling
• Effective Communication skills
• Typing skills
• Problem Solving
• Time Management
===========================================================`;

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Malik_M_Abdullah_CV.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Malik M Abdullah CV downloaded.');
  }

  // --- 12. KEYBOARD ACCESSIBILITY ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeMobileNav();
    }
  });
});
