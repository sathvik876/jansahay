const $ = id => document.getElementById(id);
const local = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const apiBase = local ? 'http://localhost:8000' : document.querySelector('meta[name="jansahay-api"]').content.trim().replace(/\/$/, '');
const pages = ['assistant','eligibility','documents','schemes','checklist','help'];
const examples = {
  en: ['Which scholarships are available for Telangana students?', 'What documents are required for an old age pension?', 'Which schemes support small farmers?'],
  hi: ['तेलंगाना के छात्रों के लिए कौन सी छात्रवृत्ति है?', 'वृद्ध पेंशन के लिए कौन से दस्तावेज चाहिए?', 'किसानों के लिए कौन सी योजनाएँ हैं?'],
  te: ['తెలంగాణ కళాశాల విద్యార్థులకు ఏ స్కాలర్‌షిప్‌లు ఉన్నాయి?', 'వృద్ధాప్య పెన్షన్‌కు ఏ పత్రాలు అవసరం?', 'చిన్న రైతులకు ఏ పథకాలు ఉన్నాయి?']
};

function el(tag, label, className) {
  const node = document.createElement(tag);
  if (label) node.textContent = label;
  if (className) node.className = className;
  return node;
}
function button(label, handler, className = 'secondary') {
  const node = el('button', label, className);
  node.type = 'button';
  node.addEventListener('click', handler);
  return node;
}
function link(label, url) {
  const node = el('a', label, 'link-button');
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  return node;
}
function status(id, message = '', error = false) {
  $(id).textContent = message;
  $(id).classList.toggle('error', error);
}
async function api(path, body) {
  if (!apiBase) throw new Error('Set the Render API URL in the frontend configuration.');
  let response;
  try {
    response = await fetch(apiBase + '/api' + path, {
      ...(body === undefined ? {} : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }),
      signal: AbortSignal.timeout(65000)
    });
  } catch {
    throw new Error('Could not connect to the JanSahay backend. Check that it is running and try again.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The backend returned an error.');
  return payload;
}

function open(page, id) {
  const next = '#' + page + (id ? '/' + encodeURIComponent(id) : '');
  if (location.hash !== next) location.hash = next;
}
function route() {
  const [name, id] = location.hash.slice(1).split('/');
  const page = pages.includes(name) ? name : 'assistant';
  pages.forEach(key => { $(key).hidden = key !== page; });
  document.querySelectorAll('.features button').forEach(item => {
    item.setAttribute('aria-current', String(item.dataset.page === page));
  });
  if (page === 'schemes') searchDirectory();
  if (page === 'eligibility') loadEligibility(id);
  if (page === 'checklist') loadChecklist(id);
}
document.querySelectorAll('[data-page]').forEach(node => node.onclick = () => open(node.dataset.page));
window.addEventListener('hashchange', route);
function list(items, ordered = false) {
  const node = el(ordered ? 'ol' : 'ul');
  items.forEach(item => node.append(el('li', item)));
  return node;
}
function sourceDates(scheme) {
  const details = el('div', '', 'source-details');
  details.append(el('small', 'Official source last verified ' + scheme.verified), link('Official source', scheme.source));
  const dates = scheme.application;
  if (dates?.status === 'confirmed') {
    const format = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'UTC' });
    details.append(el('small', 'Dates confirmed for ' + dates.cycle + ' · ' +
      format.format(new Date(dates.opens)) + ' to ' + format.format(new Date(dates.closes))), link('Official schedule', dates.source));
  } else {
    details.append(el('small', 'Application dates unconfirmed · Check the official portal.'));
  }
  return details;
}
function card(scheme, assessment) {
  const node = el('article', '', 'card');
  node.append(el('small', scheme.category + ' · ' + scheme.region), el('h3', scheme.name), el('p', scheme.benefit));
  if (assessment) {
    node.append(el('strong', assessment.status));
    const notes = [...assessment.matched.map(item => 'Met: ' + item), ...assessment.failed.map(item => 'Unmet: ' + item), ...assessment.missing.map(item => 'Verify: ' + item)];
    node.append(list(notes));
  }
  node.append(sourceDates(scheme));
  const actions = el('div', '', 'actions');
  actions.append(button('Check eligibility', () => open('eligibility', scheme.id)),
    button('Application checklist', () => open('checklist', scheme.id)),
    link('Official website', scheme.portal),
    button('Report an issue', () => openReport('scheme', [scheme.id], scheme.name), 'quiet'));
  node.append(actions);
  return node;
}

const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { status('chat-status', 'Chat history could not be saved on this device.', true); } },
  remove(key) { try { localStorage.removeItem(key); } catch { status('chat-status', 'Chat history could not be removed.', true); } }
};
const historyKey = 'jansahay.chats.v1';
const saveKey = 'jansahay.save';
let history = store.get(historyKey, []);
let session = { id: crypto.randomUUID(), messages: [] };
const pending = new Set();
let failedQuestion = null;
$('save').checked = store.get(saveKey, false);
function renderHistory() {
  $('saved-list').replaceChildren(...history.map(entry => {
    const item = el('li');
    item.append(button(entry.messages[0]?.text.slice(0, 70) || 'Conversation', () => {
      session = structuredClone(entry);
      failedQuestion = null;
      renderChat();
      status('chat-status');
      $('history').hidden = true;
    }, 'quiet'));
    return item;
  }));
}
function saveChat() {
  if (!$('save').checked || !session.messages.length) return;
  history = [structuredClone(session), ...history.filter(entry => entry.id !== session.id)].slice(0, 15);
  store.set(historyKey, history);
  renderHistory();
}
$('history-toggle').onclick = () => { $('history').hidden = !$('history').hidden; };
$('save').onchange = () => {
  store.set(saveKey, $('save').checked);
  if ($('save').checked) saveChat();
  else $('clear').click();
};
$('clear').onclick = () => {
  history = [];
  store.remove(historyKey);
  renderHistory();
};
$('new').onclick = () => {
  session = { id: crypto.randomUUID(), messages: [] };
  failedQuestion = null;
  $('question').value = '';
  status('chat-status');
  renderChat();
};
function renderChat() {
  $('welcome').hidden = Boolean(session.messages.length);
  $('messages').replaceChildren(...session.messages.map(message => {
    const article = el('div', '', 'message ' + message.role);
    article.append(el('strong', message.role === 'user' ? 'You' : 'JanSahay'));
    article.append(el('div', message.text));
    if (message.role === 'assistant') {
      article.append(button('Report an issue', () => openReport('answer',
        (message.schemes || []).map(scheme => scheme.id), 'JanSahay assistant answer'), 'quiet'));
    }
    if (message.schemes?.length) {
      const content = el('div', '', 'cards');
      content.append(...message.schemes.map(scheme => card(scheme)));
      article.append(content);
    }
    return article;
  }));
  $('send').disabled = pending.has(session.id);
}
function suggest() {
  $('suggestions').replaceChildren(...examples[$('language').value].map(text => button(text, () => sendQuestion(text))));
}
$('language').onchange = suggest;
async function sendQuestion(question, retry = false) {
  if (!question.trim() || pending.has(session.id)) return;
  const current = session;
  const previous = current.messages.filter(message => message.role === 'user' && message.text !== question).slice(-3).map(message => message.text).join(' ');
  if (!retry) current.messages.push({ role: 'user', text: question });
  $('question').value = '';
  failedQuestion = null;
  pending.add(current.id);
  renderChat();
  status('chat-status', 'Looking up official scheme information…');
  try {
    const result = await api('/chat', { message: question, language: $('language').value, context: previous });
    if (session !== current) return;
    current.messages.push({ role: 'assistant', text: result.answer, schemes: result.schemes });
    status('chat-status', result.mode === 'directory-fallback' ? 'AI response unavailable. Showing official directory results.' : '');
    saveChat();
  } catch (error) {
    if (session !== current) return;
    failedQuestion = question;
    status('chat-status', error.message + ' ', true);
    $('chat-status').append(button('Retry', () => sendQuestion(failedQuestion, true)));
  } finally {
    pending.delete(current.id);
    if (session === current) renderChat();
  }
}
$('chat-form').onsubmit = event => {
  event.preventDefault();
  sendQuestion($('question').value.trim());
};

$('chat-upload').onclick = () => {
  open('documents');
  requestAnimationFrame(() => $('file').focus());
};
let schemeCatalog;
async function catalog() {
  schemeCatalog ??= api('/schemes').catch(error => {
    schemeCatalog = null;
    throw error;
  });
  return schemeCatalog;
}
function populateStates(select, states) {
  if (select.options.length === 1) for (const state of states) select.add(new Option(state, state));
}
let searchVersion = 0;
async function searchDirectory() {
  const version = ++searchVersion;
  status('search-status', 'Loading schemes…');
  $('scheme-results').setAttribute('aria-busy', 'true');
  $('scheme-results').replaceChildren();
  try {
    const { categories, states } = await catalog();
    populateStates($('scheme-state'), states);
    if ($('category').options.length === 1) for (const name of categories) $('category').add(new Option(name, name));
    const params = new URLSearchParams({ q: $('search').value.trim(), category: $('category').value, state: $('scheme-state').value });
    const result = await api('/schemes?' + params);
    if (version !== searchVersion) return;
    $('scheme-results').replaceChildren(...result.schemes.map(scheme => card(scheme)));
    const count = result.schemes.length;
    status('search-status', count ? count + (count === 1 ? ' result' : ' results') : 'No schemes match these filters.');
  } catch (error) {
    if (version === searchVersion) {
      status('search-status', error.message + ' ', true);
      $('search-status').append(button('Retry', searchDirectory));
    }
  } finally {
    if (version === searchVersion) $('scheme-results').setAttribute('aria-busy', 'false');
  }
}
$('search-form').onsubmit = event => { event.preventDefault(); searchDirectory(); };
$('category').onchange = searchDirectory;
$('scheme-state').onchange = searchDirectory;

let eligibleSchemes = [];
let epassCategories = [];
const assessedProfiles = new Map();
const readyDocuments = new Map();
function relevantSchemes(schemes, state) {
  return schemes.filter(scheme => !state || scheme.region === 'India' || scheme.region === state);
}
function setEligibilityOptions(id) {
  const select = $('eligibility-scheme');
  const relevant = relevantSchemes(eligibleSchemes, $('state').value);
  select.replaceChildren(new Option('All schemes', ''), ...relevant.map(scheme => new Option(scheme.name, scheme.id)));
  select.value = relevant.some(scheme => scheme.id === id) ? id : '';
  renderConditions();
}
function renderConditions() {
  const selected = eligibleSchemes.find(scheme => scheme.id === $('eligibility-scheme').value);
  const saved = assessedProfiles.get(selected?.id);
  $('conditions').replaceChildren(...(selected?.rules || []).filter(rule => typeof rule.value === 'boolean').map(rule => {
    const label = el('label', rule.label);
    const field = el('select');
    field.name = rule.field;
    field.add(new Option('Unsure', ''));
    field.add(new Option('Yes', 'true'));
    field.add(new Option('No', 'false'));
    if (typeof saved?.[rule.field] === 'boolean') field.value = String(saved[rule.field]);
    label.append(field);
    return label;
  }));
  if (selected?.id === 'epass') {
    for (const [name, title, options] of [
      ['welfareCategory', 'ePASS welfare category', [...epassCategories, 'Other']],
      ['residence', 'Rural or urban residence', ['Rural', 'Urban']]
    ]) {
      const label = el('label', title);
      const field = el('select');
      field.name = name;
      field.add(new Option('Unsure', ''));
      for (const option of options) field.add(new Option(option, option));
      field.value = saved?.[name] || '';
      label.append(field);
      $('conditions').prepend(label);
    }
  }
}
async function loadEligibility(id) {
  try {
    const { schemes, states, epassCategories: categories } = await catalog();
    eligibleSchemes = schemes;
    epassCategories = categories;
    populateStates($('state'), states);
    setEligibilityOptions(id);
    $('eligibility-results').replaceChildren();
    status('eligibility-status');
  } catch (error) {
    status('eligibility-status', error.message + ' ', true);
    $('eligibility-status').append(button('Retry', () => loadEligibility(id)));
  }
}
$('eligibility-scheme').onchange = renderConditions;
$('state').onchange = () => {
  setEligibilityOptions($('eligibility-scheme').value);
  $('eligibility-results').replaceChildren();
  status('eligibility-status');
};
$('eligibility-form').onsubmit = async event => {
  event.preventDefault();
  const submit = event.submitter;
  submit.disabled = true;
  const selected = $('eligibility-scheme').value;
  const occupation = $('occupation').value;
  const profile = {};
  if ($('state').value) profile.state = $('state').value;
  for (const field of ['age','income']) if ($(field).value !== '') profile[field] = Number($(field).value);
  $('conditions').querySelectorAll('select').forEach(field => {
    if (field.value) profile[field.name] = ['true', 'false'].includes(field.value) ? field.value === 'true' : field.value;
  });
  $('eligibility-results').replaceChildren();
  status('eligibility-status', 'Checking the listed requirements…');
  try {
    const { schemes } = await catalog();
    const matches = relevantSchemes(schemes, profile.state).filter(scheme =>
      selected ? scheme.id === selected : !occupation || scheme.category === occupation);
    const results = await Promise.all(matches.map(scheme => api('/eligibility/check', { id: scheme.id, profile })));
    if (selected !== $('eligibility-scheme').value || (profile.state || '') !== $('state').value) return;
    for (const result of results) assessedProfiles.set(result.scheme.id, profile);
    results.sort((a,b) => a.failed.length - b.failed.length || a.missing.length - b.missing.length);
    $('eligibility-results').replaceChildren(...results.map(result => card(result.scheme, result)));
    status('eligibility-status', results.length ? 'Review any unmet or unverified conditions before applying.' : 'No schemes were found for this selection.');
  } catch (error) {
    status('eligibility-status', error.message, true);
  } finally {
    submit.disabled = false;
  }
};

let checklistRequest = 0;
async function loadChecklist(id) {
  const request = ++checklistRequest;
  const content = $('checklist-content');
  content.replaceChildren(el('p', 'Loading checklist…'));
  if (!id) {
    content.replaceChildren(el('p', 'Choose a scheme from Explore Schemes to open a checklist.'));
    return;
  }
  try {
    const { scheme, assessment } = await api('/checklists/generate', { id, profile: assessedProfiles.get(id) });
    if (request !== checklistRequest) return;
    const ready = readyDocuments.get(id) || new Set();
    readyDocuments.set(id, ready);
    const progress = el('p', ready.size + ' of ' + scheme.documents.length + ' documents marked ready.');
    progress.setAttribute('role', 'status');
    const documents = scheme.documents.map(documentName => {
      const label = el('label', '', 'check-item');
      const check = el('input');
      check.type = 'checkbox';
      check.checked = ready.has(documentName);
      check.onchange = () => {
        if (check.checked) ready.add(documentName);
        else ready.delete(documentName);
        progress.textContent = ready.size + ' of ' + scheme.documents.length + ' documents marked ready.';
      };
      label.append(check, ' ' + documentName);
      return label;
    });
    const actions = el('div', '', 'actions');
    actions.append(link('Visit official portal ↗', scheme.portal), button('Update eligibility answers', () => open('eligibility', id)));
    const requirements = [...assessment.failed.map(item => 'Unmet: ' + item),
      ...assessment.missing.map(item => 'To verify: ' + item)];
    content.replaceChildren(el('h3', scheme.name), el('p', scheme.benefit),
      el('h3', 'Documents to prepare'), progress, ...documents,
      el('h3', 'Eligibility requirements to resolve'),
      requirements.length ? list(requirements) : el('p', 'Your answers meet the requirements listed here. Confirm with the official portal.'),
      el('h3', 'Application steps'), list(scheme.steps, true),
      sourceDates(scheme), actions);
  } catch (error) {
    if (request === checklistRequest) content.replaceChildren(el('p', error.message), button('Retry', () => loadChecklist(id)));
  }
}

function readAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}
$('document-form').onsubmit = async event => {
  event.preventDefault();
  const file = $('file').files[0];
  if (!file) return;
  const mimeType = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[file.name.split('.').at(-1).toLowerCase()];
  $('summary').hidden = true;
  $('summary').textContent = '';
  if (!mimeType || file.size > 5 * 1024 * 1024) return status('document-status', 'Choose a PDF, JPEG or PNG up to 5 MB.', true);
  $('analyze').disabled = true;
  status('document-status', 'Reading the notice…');
  try {
    const data = await readAttachment(file);
    const { summary } = await api('/documents/analyze', { data, mimeType, consent: $('consent').checked, language: $('language').value });
    $('summary').replaceChildren(el('h3', 'Notice explanation'), el('p', summary));
    $('summary').hidden = false;
    status('document-status');
  } catch (error) {
    status('document-status', error.message, true);
  } finally {
    $('analyze').disabled = false;
  }
};

const info = {
  privacy: ['Privacy Policy', 'Chat history is saved on this device only when you opt in. Eligibility answers and checklist progress are held in memory for the current visit. The backend saves issue reports for review. Chat prompts may be sent to Gemini when the service is configured, and document uploads require consent before being sent to Gemini. Leave out identity numbers and other personal information.'],
  about: ['About JanSahay AI', 'JanSahay AI is an independent citizen-assistance project. It helps you find schemes and prepare applications using official sources. The responsible government authority decides eligibility and operates the application portal.'],
  contact: ['Contact', 'Send feedback to the JanSahay maintainers using the issue form. For help with a specific application, use the contact information on that scheme’s official website.']
};
document.querySelectorAll('[data-info]').forEach(node => {
  node.onclick = () => {
    const [title, content] = info[node.dataset.info];
    $('info-title').textContent = title;
    $('info-copy').textContent = content;
    $('info-actions').replaceChildren();
    if (node.dataset.info === 'contact') {
      $('info-actions').append(button('Send feedback', () => {
        $('info-dialog').close();
        openReport('general', [], 'General JanSahay feedback');
      }));
    }
    $('info-dialog').showModal();
  };
});
let reportContext;
function openReport(target, schemeIds, title) {
  reportContext = { target, schemeIds };
  $('report-target').textContent = title;
  $('report-form').reset();
  $('report-submit').disabled = false;
  status('report-status');
  $('report-dialog').showModal();
}
$('report-close').onclick = () => $('report-dialog').close();
$('report-dialog').addEventListener('cancel', event => {
  if ($('report-close').disabled) event.preventDefault();
});
$('report-form').onsubmit = async event => {
  event.preventDefault();
  const details = $('report-details').value.trim();
  if (!details) return status('report-status', 'Describe the issue before submitting.', true);
  $('report-submit').disabled = true;
  $('report-close').disabled = true;
  status('report-status', 'Sending report…');
  try {
    const { id } = await api('/reports', { ...reportContext, reason: $('report-reason').value, details });
    status('report-status', 'Report received. Reference ' + id);
  } catch (error) {
    status('report-status', error.message, true);
    $('report-submit').disabled = false;
  } finally {
    $('report-close').disabled = false;
  }
};

suggest();
renderHistory();
route();
