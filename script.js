/* ============================================================
   F5 Traction – Landing Page Scripts
   Form handling · UTM capture · Accordion · Reveal · Utilities
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. UTM Parameter Capture ────────────────────────────────
  captureUTMParameters();

  // ── 2. Form Handling ────────────────────────────────────────
  initForms();

  // ── 3. Phone Mask ───────────────────────────────────────────
  initPhoneMask();

  // ── 4. Accordion FAQ ────────────────────────────────────────
  initAccordion();

  // ── 5. Scroll Reveal Animation ──────────────────────────────
  initScrollReveal();

  // ── 6. Smooth Scroll ────────────────────────────────────────
  initSmoothScroll();
});

/* ──────────────────────────────────────────────────────────────
   1. UTM Parameter Capture
   ────────────────────────────────────────────────────────────── */
function captureUTMParameters() {
  const params = new URLSearchParams(window.location.search);
  const utmFields = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'utm_id',
    'gclid',
    'fbclid'
  ];

  utmFields.forEach((field) => {
    const value = params.get(field) || '';
    // Populate all hidden inputs with matching name
    const inputs = document.querySelectorAll(`input[name="${field}"]`);
    inputs.forEach((input) => {
      input.value = value;
    });
  });

  // Capture referrer and page URL
  const referrerInputs = document.querySelectorAll('input[name="referrer"]');
  referrerInputs.forEach((input) => {
    input.value = document.referrer || '';
  });

  const pageUrlInputs = document.querySelectorAll('input[name="page_url"]');
  pageUrlInputs.forEach((input) => {
    input.value = window.location.href;
  });
}

/* ──────────────────────────────────────────────────────────────
   2. Form Handling
   ────────────────────────────────────────────────────────────── */
function initForms() {
  const forms = document.querySelectorAll('[data-lead-form]');

  forms.forEach((form) => {
    form.addEventListener('submit', handleFormSubmit);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // ── Validation ──────────────────────────────────────────
  const errors = validateFormData(data);

  // Clear previous errors
  form.querySelectorAll('.form-error').forEach((el) => el.remove());
  form.querySelectorAll('.form-input, .form-select').forEach((el) => {
    el.style.borderColor = '';
  });

  if (errors.length > 0) {
    errors.forEach((error) => {
      const field = form.querySelector(`[name="${error.field}"]`);
      if (field) {
        field.style.borderColor = '#ef4444';
        const errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        errorEl.style.cssText =
          'color:#ef4444;font-size:12px;display:block;margin-top:0.25rem;';
        errorEl.textContent = error.message;
        field.parentNode.appendChild(errorEl);
      }
    });
    return;
  }

  // ── Save to Supabase ────────────────────────────────
  const formContainer = form.closest('[data-form-container]') || form.parentNode;
  const successEl = formContainer.querySelector('.form-success');

  try {
    await saveLeadToStorage(data);
    form.reset(); // clear the form for the user
    
    // Show the global success modal
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.add('active');
    }
  } catch (err) {
    alert('Houve um erro ao enviar seus dados. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
  }
}

function validateFormData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Por favor, insira seu nome completo.'
    });
  }

  if (!data.company || data.company.trim().length < 2) {
    errors.push({
      field: 'company',
      message: 'Por favor, insira o nome da empresa.'
    });
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Por favor, insira um e-mail válido.'
    });
  }

  if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
    errors.push({
      field: 'phone',
      message: 'Por favor, insira um telefone válido.'
    });
  }

  return errors;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* ──────────────────────────────────────────────────────────────
   3. Phone Mask
   ────────────────────────────────────────────────────────────── */
function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[name="phone"]');

  phoneInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');

      // Limit to 11 digits
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
      if (value.length > 0) {
        if (value.length <= 2) {
          value = `(${value}`;
        } else if (value.length <= 7) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
      }

      e.target.value = value;
    });

    // Prevent non-digit characters
    input.addEventListener('keypress', (e) => {
      const char = String.fromCharCode(e.charCode);
      if (!/[\d]/.test(char) && e.charCode !== 0) {
        e.preventDefault();
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   4. Accordion FAQ
   ────────────────────────────────────────────────────────────── */
function initAccordion() {
  // Use event delegation on all accordions
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.accordion-trigger');
    if (!trigger) return;

    const item = trigger.closest('.accordion-item');
    const accordion = trigger.closest('.accordion');
    if (!item || !accordion) return;

    const content = item.querySelector('.accordion-content');
    const isOpen = trigger.classList.contains('active');

    // Close all items in this accordion
    accordion.querySelectorAll('.accordion-item').forEach((otherItem) => {
      const otherTrigger = otherItem.querySelector('.accordion-trigger');
      const otherContent = otherItem.querySelector('.accordion-content');

      if (otherItem !== item) {
        otherTrigger.classList.remove('active');
        otherContent.classList.remove('open');
        otherContent.style.maxHeight = '0';
      }
    });

    // Toggle current item
    if (isOpen) {
      trigger.classList.remove('active');
      content.classList.remove('open');
      content.style.maxHeight = '0';
    } else {
      trigger.classList.add('active');
      content.classList.add('open');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
}

/* ──────────────────────────────────────────────────────────────
   5. Scroll Reveal Animation
   ────────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback: make all elements visible
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────────
   6. Smooth Scroll
   ────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    e.preventDefault();

    // Calculate offset for any fixed header
    const header = document.querySelector('header, [data-fixed-header]');
    const headerHeight = header ? header.offsetHeight : 0;
    const offset = 20; // Extra breathing room

    const targetPosition =
      targetElement.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight -
      offset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   7. Form Data Storage Utility
   ────────────────────────────────────────────────────────────── */
const supabaseUrl = 'https://fpfybbfkpaomvdgotlge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZnliYmZrcGFvbXZkZ290bGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTg1MDIsImV4cCI6MjA5OTUzNDUwMn0.uYbdg8SXLlOjWGZQJl7fOCI22TAg3RPAh-OigBzaZxA';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function saveLeadToStorage(formData) {
  const lead = {
    name: formData.name,
    company: formData.company,
    email: formData.email,
    phone: formData.phone,
    team_size: formData.teamSize,
    revenue: formData.revenue,
    utm_source: formData.utm_source,
    utm_medium: formData.utm_medium,
    utm_campaign: formData.utm_campaign,
    utm_content: formData.utm_content,
    utm_term: formData.utm_term,
    gclid: formData.gclid,
    fbclid: formData.fbclid,
    referrer: formData.referrer,
    page_url: formData.page_url,
    status: 'novo'
  };

  const { data, error } = await supabaseClient
    .from('leads')
    .insert([lead])
    .select();

  if (error) {
    console.error('Erro ao salvar lead no Supabase:', error);
    throw error;
  }
  return data[0];
}

/* ──────────────────────────────────────────────────────────────
   Fade-in keyframe (used for WhatsApp button reveal)
   ────────────────────────────────────────────────────────────── */
const fadeInStyle = document.createElement('style');
fadeInStyle.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(fadeInStyle);
