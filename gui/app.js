// State
let emails = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'priority-desc';

// Elements
const deviceBadge = document.getElementById('deviceBadge');
const deviceText = document.getElementById('deviceText');
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Forms & Inputs
const imapForm = document.getElementById('imapForm');
const imapBtn = document.getElementById('imapBtn');
const fileInput = document.getElementById('fileInput');
const fileDropArea = document.getElementById('fileDropArea');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const quickForm = document.getElementById('quickForm');

// Progress
const progressBarContainer = document.getElementById('progressBarContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');

// Table & Toolbar
const emailTableBody = document.getElementById('emailTableBody');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const filterPills = document.querySelectorAll('.pill');
const exportBtn = document.getElementById('exportBtn');

// Drawer Modal
const modalBackdrop = document.getElementById('modalBackdrop');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');
const drawerCategory = document.getElementById('drawerCategory');
const drawerSubject = document.getElementById('drawerSubject');
const drawerSender = document.getElementById('drawerSender');
const drawerDate = document.getElementById('drawerDate');
const drawerPriority = document.getElementById('drawerPriority');
const drawerUrgency = document.getElementById('drawerUrgency');
const drawerProbBars = document.getElementById('drawerProbBars');
const drawerBody = document.getElementById('drawerBody');

// Check model status on boot
async function checkModelStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    deviceText.textContent = `LAYA ACTIVE ON ${data.device || 'CUDA'}`;
    deviceBadge.classList.add('active');
  } catch (err) {
    deviceText.textContent = 'BACKEND CONNECTED';
  }
}

// Tab Switching
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Category Colors Map
const CAT_COLORS = {
  spam: '#ef4444',
  junk: '#f59e0b',
  school: '#3b82f6',
  website: '#06b6d4',
  game: '#10b981',
  personal: '#a855f7'
};

// Update Stats Cards & Pill Badges
function updateStats() {
  const counts = { all: emails.length, spam: 0, junk: 0, school: 0, website: 0, game: 0, personal: 0, urgent: 0 };

  emails.forEach(e => {
    const cat = (e.category || 'junk').toLowerCase();
    if (counts[cat] !== undefined) counts[cat]++;
    if (e.urgency_score > 0.55) counts.urgent++;
  });

  document.getElementById('statTotal').textContent = counts.all;
  document.getElementById('statSpam').textContent = counts.spam;
  document.getElementById('statJunk').textContent = counts.junk;
  document.getElementById('statSchool').textContent = counts.school;
  document.getElementById('statWebsite').textContent = counts.website;
  document.getElementById('statGame').textContent = counts.game;
  document.getElementById('statPersonal').textContent = counts.personal;
  document.getElementById('statUrgent').textContent = counts.urgent;

  document.getElementById('countAll').textContent = counts.all;
  document.getElementById('countPersonal').textContent = counts.personal;
  document.getElementById('countSchool').textContent = counts.school;
  document.getElementById('countWebsite').textContent = counts.website;
  document.getElementById('countGame').textContent = counts.game;
  document.getElementById('countJunk').textContent = counts.junk;
  document.getElementById('countSpam').textContent = counts.spam;
}

// Render Table
function renderTable() {
  let filtered = emails.filter(e => {
    const matchesFilter = (currentFilter === 'all') || (e.category.toLowerCase() === currentFilter);
    const searchTarget = `${e.sender} ${e.subject} ${e.body}`.toLowerCase();
    const matchesSearch = !currentSearch || searchTarget.includes(currentSearch);
    return matchesFilter && matchesSearch;
  });

  // Sorting
  if (currentSort === 'priority-desc') {
    filtered.sort((a, b) => b.importance - a.importance);
  } else if (currentSort === 'priority-asc') {
    filtered.sort((a, b) => a.importance - b.importance);
  } else if (currentSort === 'latency') {
    filtered.sort((a, b) => a.inference_ms - b.inference_ms);
  }

  if (filtered.length === 0) {
    emailTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">
          <div class="empty-state">
            <p>No emails match current filter</p>
            <span>Try selecting another category or clearing your search query.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  emailTableBody.innerHTML = filtered.map((e, idx) => {
    const cat = (e.category || 'junk').toLowerCase();
    const stars = '★'.repeat(Math.min(5, Math.max(1, Math.round(e.importance))));
    const isUrgent = e.urgency_score > 0.55;
    const urgentBadge = isUrgent
      ? `<span class="urgent-badge">🚨 URGENT</span>`
      : `<span class="normal-badge">Normal</span>`;

    const cleanSubject = escapeHtml(e.subject || '(No Subject)');
    const cleanSender = escapeHtml(e.sender || '(Unknown)');
    const cleanSnippet = escapeHtml((e.body || '').slice(0, 100));

    return `
      <tr onclick="openDrawer(${e.originalIndex})">
        <td style="color: var(--text-dim); font-family: monospace;">${idx + 1}</td>
        <td><span class="cat-badge ${cat}">${cat.toUpperCase()}</span></td>
        <td>
          <span class="stars">${stars}</span>
          <span class="priority-score">${e.importance.toFixed(1)}/5</span>
        </td>
        <td>${urgentBadge}</td>
        <td><div class="sender-cell" title="${cleanSender}">${cleanSender}</div></td>
        <td>
          <div class="subject-cell">
            <span class="subject-title">${cleanSubject}</span>
            <span class="subject-snippet">${cleanSnippet}</span>
          </div>
        </td>
        <td><span class="latency-cell">${Math.round(e.inference_ms)} ms</span></td>
        <td><button class="btn-view" onclick="event.stopPropagation(); openDrawer(${e.originalIndex})">View</button></td>
      </tr>
    `;
  }).join('');
}

// Drawer Modal
window.openDrawer = function(index) {
  const email = emails[index];
  if (!email) return;

  const cat = (email.category || 'junk').toLowerCase();
  drawerCategory.className = `cat-badge ${cat}`;
  drawerCategory.textContent = cat.toUpperCase();

  drawerSubject.textContent = email.subject || '(No Subject)';
  drawerSender.textContent = email.sender || '(Unknown Sender)';
  drawerDate.textContent = email.date || 'Unknown Date';

  const stars = '★'.repeat(Math.min(5, Math.max(1, Math.round(email.importance))));
  drawerPriority.textContent = `${stars} (${email.importance.toFixed(1)} / 5)`;
  drawerUrgency.textContent = `${(email.urgency_score * 100).toFixed(1)}% (${email.urgency_score > 0.55 ? 'Requires Attention' : 'Low urgency'})`;

  drawerBody.textContent = email.body || '(No text body)';

  // Probability Bars
  const probs = email.probabilities || {};
  const sortedProbs = Object.entries(probs).sort((a, b) => b[1] - a[1]);

  drawerProbBars.innerHTML = sortedProbs.map(([k, v]) => {
    const color = CAT_COLORS[k] || '#6366f1';
    const pct = (v * 100).toFixed(1);
    return `
      <div class="prob-item">
        <div class="prob-item-header">
          <span>${k.toUpperCase()}</span>
          <span style="font-family: monospace; color: ${color};">${pct}%</span>
        </div>
        <div class="prob-track">
          <div class="prob-fill" style="width: ${pct}%; background: ${color};"></div>
        </div>
      </div>
    `;
  }).join('');

  modalBackdrop.classList.add('active');
};

drawerCloseBtn.addEventListener('click', () => modalBackdrop.classList.remove('active'));
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
});

// Category Filter Pills
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.filter;
    renderTable();
  });
});

// Search and Sort
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value.toLowerCase().trim();
  renderTable();
});

sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderTable();
});

// Export to JSON
exportBtn.addEventListener('click', () => {
  if (emails.length === 0) return alert('No emails to export.');
  const blob = new Blob([JSON.stringify(emails, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laya_classified_emails_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Helper
function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// Set Progress Bar
function setProgress(current, total, msg = '') {
  progressBarContainer.style.display = 'block';
  const pct = Math.round((current / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressPercent.textContent = `${pct}%`;
  progressText.textContent = msg || `Classifying email ${current} of ${total}...`;
}

function hideProgress() {
  setTimeout(() => {
    progressBarContainer.style.display = 'none';
  }, 1000);
}

// 1. IMAP Submit
imapForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('imapUser').value.trim();
  const pass = document.getElementById('imapPass').value.trim();
  const host = document.getElementById('imapHost').value.trim() || 'imap.gmail.com';
  const limit = parseInt(document.getElementById('imapLimit').value, 10) || 50;
  const unreadOnly = document.getElementById('imapUnread').checked;

  const btnText = imapBtn.querySelector('.btn-text');
  const spinner = imapBtn.querySelector('.spinner');

  btnText.textContent = `Connecting & Fetching up to ${limit}...`;
  spinner.style.display = 'inline-block';
  imapBtn.disabled = true;

  emails = [];
  renderTable();
  setProgress(0, limit, 'Connecting to IMAP server...');

  try {
    const res = await fetch('/api/classify_imap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass, host, limit, unreadOnly })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch from IMAP');
    }

    const data = await res.json();
    emails = data.results.map((item, idx) => ({ ...item, originalIndex: idx }));
    setProgress(emails.length, emails.length, `Completed analysis of ${emails.length} emails!`);
    updateStats();
    renderTable();
  } catch (err) {
    alert(`Error: ${err.message}`);
    progressText.textContent = `Error: ${err.message}`;
  } finally {
    btnText.textContent = 'Connect & Classify Inbox';
    spinner.style.display = 'none';
    imapBtn.disabled = false;
    hideProgress();
  }
});

// 2. File Upload / Sample Dataset
fileDropArea.addEventListener('click', (e) => {
  if (e.target !== loadSampleBtn) fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  setProgress(0, 100, `Uploading ${file.name}...`);
  try {
    const res = await fetch('/api/classify_file', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    emails = data.results.map((item, idx) => ({ ...item, originalIndex: idx }));
    setProgress(emails.length, emails.length, `Processed ${emails.length} emails from ${file.name}`);
    updateStats();
    renderTable();
  } catch (err) {
    alert(`File processing error: ${err.message}`);
  } finally {
    hideProgress();
    fileInput.value = '';
  }
});

// Built-in Sample Dataset
loadSampleBtn.addEventListener('click', async () => {
  setProgress(0, 6, 'Loading built-in test dataset...');
  try {
    const res = await fetch('/api/load_sample');
    const data = await res.json();
    emails = data.results.map((item, idx) => ({ ...item, originalIndex: idx }));
    setProgress(6, 6, 'Loaded built-in test dataset (6 emails)');
    updateStats();
    renderTable();
  } catch (err) {
    alert(`Sample error: ${err.message}`);
  } finally {
    hideProgress();
  }
});

// 3. Quick Single Test
quickForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sender = document.getElementById('quickSender').value.trim();
  const subject = document.getElementById('quickSubject').value.trim();
  const body = document.getElementById('quickBody').value.trim();
  const btn = document.getElementById('quickBtn');

  btn.textContent = 'Analyzing with Laya...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/classify_single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, subject, body })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const newRecord = {
      sender,
      subject,
      body,
      date: new Date().toUTCString(),
      ...data,
      originalIndex: emails.length
    };
    emails.unshift(newRecord);
    emails.forEach((em, idx) => em.originalIndex = idx);
    updateStats();
    renderTable();
    openDrawer(0);
  } catch (err) {
    alert(`Analysis error: ${err.message}`);
  } finally {
    btn.textContent = 'Analyze Email Instantly';
    btn.disabled = false;
  }
});

// Boot
checkModelStatus();
