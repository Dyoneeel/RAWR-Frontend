(function () {
  const fixtures = window.RAWR_DEMO_DATA;
  if (!fixtures) return;

  try {
    const prior = JSON.parse(localStorage.getItem('rawr_demo_admin_data') || 'null');
    if (prior) {
      fixtures.users = Array.isArray(prior.users) ? prior.users : fixtures.users;
      fixtures.kycRequests = Array.isArray(prior.kycRequests) ? prior.kycRequests : fixtures.kycRequests;
    }
  } catch (_) { /* Keep the bundled fictional examples if storage is unavailable. */ }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const lower = value => String(value ?? '').trim().toLowerCase();
  const accountBanned = user => ['banned', 'suspended'].includes(lower(user.status));
  const statusLabel = user => accountBanned(user) ? 'Banned' : 'Active';
  const kycClass = status => {
    const value = lower(status).replaceAll(' ', '-');
    return ['pending', 'approved', 'rejected'].includes(value) ? value : 'not-verified';
  };
  const joined = user => user.joined ? new Date(`${user.joined}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 1, 2025';

  function persist() {
    try { localStorage.setItem('rawr_demo_admin_data', JSON.stringify({ users: fixtures.users, kycRequests: fixtures.kycRequests })); } catch (_) { /* UI still works for this session. */ }
  }

  function getRequestsForUser(user) {
    return fixtures.kycRequests.find(request => request.username === user.username);
  }

  function avatar(user) {
    const initials = String(user.username || 'U').split(/[^a-z0-9]+/i).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    return `<span class="user-avatar demo-avatar" aria-hidden="true">${esc(initials || 'U')}</span>`;
  }

  function actionButtons(user) {
    const id = Number(user.id);
    return `<div class="actions"><button class="btn btn-sm btn-view" type="button" data-user-kyc="${id}" aria-label="View KYC for ${esc(user.username)}"><i class="fas fa-eye" aria-hidden="true"></i></button><a class="btn btn-sm btn-edit" href="pages/admin/edit-user.html?id=${id}" aria-label="Edit ${esc(user.username)}"><i class="fas fa-edit" aria-hidden="true"></i></a></div>`;
  }

  function userRow(user) {
    const status = statusLabel(user);
    const kyc = String(user.kyc || 'Not submitted');
    return `<tr><td><div class="user-info">${avatar(user)}<span>${esc(user.username)}</span></div></td><td>${esc(user.email)}</td><td>${Number(user.balance || 0).toFixed(2)}</td><td>${Number(user.tickets || 0).toLocaleString()}</td><td>${esc(joined(user))}</td><td><span class="status-badge ${status === 'Active' ? 'active' : 'banned'}">${status}</span>${kyc.toLowerCase() !== 'not submitted' ? ` <span class="status-badge ${esc(kycClass(kyc))}">${esc(kyc)}</span>` : ''}</td><td>${actionButtons(user)}</td></tr>`;
  }

  function renderUserTable(rows = fixtures.users) {
    const body = document.getElementById('user-table-body');
    if (!body) return;
    body.innerHTML = rows.length ? rows.map(userRow).join('') : '<tr><td colspan="7" class="empty-cell">No users found matching your criteria.</td></tr>';
    const count = document.getElementById('user-result-count');
    if (count) count.textContent = `Showing ${rows.length} of ${fixtures.users.length} demo users`;
  }

  function currentFilters() {
    const query = lower(document.getElementById('user-search')?.value);
    const status = lower(document.getElementById('user-status-filter')?.value || 'all');
    const kyc = lower(document.getElementById('user-kyc-filter')?.value || 'all');
    return fixtures.users.filter(user => {
      const matchesQuery = !query || `${user.username} ${user.email} ${user.status} ${user.kyc}`.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || (status === 'banned' ? accountBanned(user) : !accountBanned(user));
      const matchesKyc = kyc === 'all' || lower(user.kyc || 'not submitted') === kyc;
      return matchesQuery && matchesStatus && matchesKyc;
    });
  }

  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  function openUser(user) {
    const title = document.getElementById('userModalTitle');
    const body = document.getElementById('userModalBody');
    if (!title || !body) return;
    title.textContent = `User Details — ${user.username}`;
    body.innerHTML = `<div class="demo-user-modal"><div class="demo-user-avatar">${esc(user.username.slice(0, 1).toUpperCase())}</div><p><strong>Email:</strong> ${esc(user.email)}</p><p><strong>RAWR Balance:</strong> ${Number(user.balance || 0).toFixed(2)}</p><p><strong>Ticket Balance:</strong> ${Number(user.tickets || 0)}</p><p><strong>Status:</strong> <span class="status-badge ${accountBanned(user) ? 'banned' : 'active'}">${statusLabel(user)}</span></p><p><strong>KYC:</strong> <span class="status-badge ${esc(kycClass(user.kyc))}">${esc(user.kyc || 'Not submitted')}</span></p><p><strong>Joined:</strong> ${esc(joined(user))}</p></div>`;
    showModal('userModal');
  }

  function openKyc(user) {
    const modal = document.getElementById('userKycModal') || document.getElementById('kycModal');
    const title = document.getElementById('userKycModalTitle') || document.getElementById('kycModalTitle');
    const body = document.getElementById('userKycModalBody') || document.getElementById('kycModalBody');
    const footer = document.getElementById('kycModalFooter');
    if (!modal || !title || !body) return;
    const request = getRequestsForUser(user);
    title.textContent = `KYC Request — ${user.username}`;
    body.innerHTML = `<div class="modal-section"><p><strong>Request ID:</strong> ${esc(request?.id || `KYC-${user.id}`)}</p><p><strong>Submitted:</strong> ${esc(request?.submitted || joined(user))}</p><p><strong>Verification type:</strong> ${esc(request?.type || 'Demo verification')}</p><p><strong>Status:</strong> <span class="status-badge ${esc(kycClass(user.kyc))}">${esc(user.kyc || 'Not submitted')}</span></p>${lower(user.kyc) === 'rejected' ? '<div class="rejection-reason"><strong>Review note:</strong> This is a fictional portfolio record.</div>' : ''}</div><div class="modal-section"><h3><i class="fas fa-file-image" aria-hidden="true"></i> Identity documents</h3><div class="id-documents-row"><div class="id-doc-col"><strong>Front</strong><div class="document-placeholder">Omitted in public demo</div></div><div class="id-doc-col"><strong>Back</strong><div class="document-placeholder">Omitted in public demo</div></div></div></div>`;
    if (footer) footer.innerHTML = lower(user.kyc) === 'pending' ? `<button type="button" class="btn btn-primary" data-review-user="${Number(user.id)}" data-review-status="Approved"><i class="fas fa-check" aria-hidden="true"></i> Approve</button> <button type="button" class="btn btn-delete" data-review-user="${Number(user.id)}" data-review-status="Rejected"><i class="fas fa-times" aria-hidden="true"></i> Reject</button>` : '<span class="form-help">This request has been reviewed.</span>';
    showModal(modal.id);
  }

  function applyKycStatus(user, status) {
    user.kyc = status;
    const request = getRequestsForUser(user);
    if (request) request.status = status;
    else if (status !== 'Not submitted') fixtures.kycRequests.push({ id: `KYC-${user.id}`, username: user.username, type: 'Demo verification', submitted: user.joined || '2025-01-01', status });
    persist();
    renderUserTable(currentFilters());
    renderDashboardStats();
    renderKycTables();
    const modal = document.getElementById('kycModal') || document.getElementById('userKycModal');
    if (modal) closeModal(modal);
    window.demoNotice?.(`KYC request ${status.toLowerCase()} in this browser demo.`, 'success');
  }

  function renderDashboardStats() {
    const set = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
    const users = fixtures.users;
    const pending = users.filter(user => lower(user.kyc) === 'pending').length;
    const banned = users.filter(accountBanned).length;
    const rawr = users.reduce((sum, user) => sum + Number(user.balance || 0), 0);
    const tickets = users.reduce((sum, user) => sum + Number(user.tickets || 0), 0);
    set('admin-total-users', '1,247');
    set('admin-active-users', (1247 - (51 + banned)).toLocaleString());
    set('admin-banned-users', String(51 + banned));
    set('admin-pending-kyc', String(21 + pending));
    set('admin-total-rawr', rawr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    set('admin-total-tickets', tickets.toLocaleString());
    set('kyc-pending-count', String(pending));
    set('kyc-approved-count', String(users.filter(user => lower(user.kyc) === 'approved').length));
    set('kyc-rejected-count', String(users.filter(user => lower(user.kyc) === 'rejected').length));
    const chart = document.getElementById('userGrowthChart');
    if (chart && window.Chart && !chart.dataset.ready) {
      chart.dataset.ready = 'true';
      const labels = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(); date.setDate(date.getDate() - (29 - index));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      new Chart(chart.getContext('2d'), { type: 'line', data: { labels, datasets: [{ label: 'New Users', data: labels.map((_, index) => index % 6 === 0 ? 3 + (index % 4) : index % 3 === 0 ? 1 : 0), fill: true, backgroundColor: 'rgba(255,215,0,.2)', borderColor: 'rgba(255,215,0,1)', tension: .4, pointBackgroundColor: '#fff', pointBorderColor: 'rgba(255,215,0,1)', pointBorderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#ccc' } }, x: { grid: { display: false }, ticks: { color: '#ccc', maxTicksLimit: 8 } } }, plugins: { legend: { display: false } } } });
    }
  }

  function requestFor(user) {
    return getRequestsForUser(user) || { id: `KYC-${user.id}`, username: user.username, type: 'Demo verification', submitted: user.joined || '2025-01-01', status: user.kyc };
  }

  function renderKycTables() {
    const rows = fixtures.users.filter(user => lower(user.kyc) !== 'not submitted');
    const byStatus = status => rows.filter(user => lower(user.kyc) === status);
    const pendingBody = document.getElementById('kyc-pending-body');
    if (pendingBody) {
      const pending = byStatus('pending');
      pendingBody.innerHTML = pending.length ? pending.map(user => `<tr><td><div class="user-info">${avatar(user)}<span>${esc(user.username)}</span></div></td><td>${esc(user.email)}</td><td>${Number(user.balance || 0).toFixed(2)}</td><td>${Number(user.tickets || 0).toLocaleString()}</td><td>${esc(joined(user))}</td><td><span class="status-badge pending">Pending</span></td><td><div class="actions"><button type="button" class="btn btn-sm btn-view" data-kyc-review="${Number(user.id)}" aria-label="Review ${esc(user.username)}"><i class="fas fa-eye" aria-hidden="true"></i></button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="no-requests"><i class="fas fa-check-circle" aria-hidden="true"></i><p>No pending KYC requests at this time.</p></div></td></tr>';
    }
    const approvedBody = document.getElementById('kyc-approved-body');
    if (approvedBody) {
      const approved = byStatus('approved');
      approvedBody.innerHTML = approved.length ? approved.map(user => `<tr><td>${Number(user.id)}</td><td>${esc(user.username)}</td><td>${esc(user.email)}</td><td>${Number(user.balance || 0).toFixed(2)}</td><td>${Number(user.tickets || 0).toLocaleString()}</td><td>${esc(joined(user))}</td><td><div class="actions"><button type="button" class="btn btn-sm btn-view" data-kyc-review="${Number(user.id)}" aria-label="View ${esc(user.username)}"><i class="fas fa-eye" aria-hidden="true"></i></button><button type="button" class="btn btn-sm btn-delete" data-ban-user="${Number(user.id)}" aria-label="Ban ${esc(user.username)}"><i class="fas fa-ban" aria-hidden="true"></i></button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="no-requests"><i class="fas fa-check-circle" aria-hidden="true"></i><p>No approved KYC requests found.</p></div></td></tr>';
    }
    const rejectedBody = document.getElementById('kyc-rejected-body');
    if (rejectedBody) {
      const rejected = byStatus('rejected');
      rejectedBody.innerHTML = rejected.length ? rejected.map(user => { const request = requestFor(user); return `<tr><td>#${esc(request.id)}</td><td><div class="user-info">${avatar(user)}<span>${esc(user.username)}</span></div></td><td>Demo record</td><td>${esc(request.submitted || joined(user))}</td><td>Reviewed in demo</td><td><span class="status-badge rejected">Rejected</span></td><td><button type="button" class="btn btn-sm btn-view" data-kyc-review="${Number(user.id)}" aria-label="View ${esc(user.username)}"><i class="fas fa-eye" aria-hidden="true"></i></button></td></tr>`; }).join('') : '<tr><td colspan="7"><div class="no-requests"><i class="fas fa-check-circle" aria-hidden="true"></i><p>No rejected KYC requests found.</p></div></td></tr>';
    }
  }

  function setupEditForm() {
    const form = document.getElementById('edit-user-form');
    if (!form) return;
    const id = Number(new URLSearchParams(location.search).get('id'));
    const user = fixtures.users.find(item => Number(item.id) === id) || fixtures.users[0];
    if (!user) return;
    document.getElementById('edit-user-name').firstChild.textContent = user.username;
    document.getElementById('edit-user-email').textContent = user.email;
    document.getElementById('edit-user-joined').textContent = `Joined: ${joined(user)}`;
    document.getElementById('edit-user-balance').textContent = Number(user.balance || 0).toFixed(2);
    document.getElementById('edit-user-tickets').textContent = Number(user.tickets || 0).toLocaleString();
    const avatarRoot = document.getElementById('edit-user-avatar');
    if (avatarRoot) avatarRoot.innerHTML = `<span>${esc(user.username.slice(0, 1).toUpperCase())}</span>`;
    form.elements.is_banned.checked = accountBanned(user);
    const initialKyc = lower(user.kyc) === 'not submitted' ? 'not_verified' : lower(user.kyc);
    const radio = form.querySelector(`input[name="kyc_status"][value="${initialKyc}"]`);
    if (radio) radio.checked = true;
    const rejection = document.getElementById('rejection_reason');
    if (rejection) rejection.value = user.rejectionReason || '';
    const group = document.getElementById('rejection-reason-group');
    if (group) group.hidden = initialKyc !== 'rejected';
    const statusBadge = document.getElementById('edit-user-kyc-badge');
    if (statusBadge) {
      statusBadge.className = initialKyc === 'not_verified' ? 'status-badge status-not_verified' : `status-badge status-${initialKyc}`;
      statusBadge.textContent = initialKyc === 'not_verified' ? 'Not Verified' : (user.kyc || 'Pending');
    }
    form.querySelectorAll('input[name="kyc_status"]').forEach(input => input.addEventListener('change', () => { if (group) group.hidden = input.value !== 'rejected'; }));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const selectedKyc = form.querySelector('input[name="kyc_status"]:checked')?.value || 'not_verified';
      if (selectedKyc === 'rejected' && !rejection.value.trim()) {
        group.hidden = false; rejection.focus(); window.demoNotice?.('Add a rejection reason before saving.', 'error'); return;
      }
      user.status = form.elements.is_banned.checked ? 'Suspended' : 'Active';
      user.kyc = selectedKyc === 'not_verified' ? 'Not submitted' : selectedKyc[0].toUpperCase() + selectedKyc.slice(1);
      user.rejectionReason = rejection.value.trim();
      const request = getRequestsForUser(user);
      if (request && user.kyc !== 'Not submitted') request.status = user.kyc;
      persist();
      window.demoNotice?.('Demo user updated.', 'success');
      window.setTimeout(() => { location.href = 'pages/admin/manage-users.html'; }, 650);
    });
  }

  document.addEventListener('click', event => {
    const close = event.target.closest('[data-modal-close]');
    if (close) closeModal(close.closest('.modal'));
    const outsideModal = event.target.classList?.contains('modal') ? event.target : null;
    if (outsideModal) closeModal(outsideModal);
    const userButton = event.target.closest('[data-user-view]');
    const kycButton = event.target.closest('[data-user-kyc], [data-kyc-review]');
    const reviewButton = event.target.closest('[data-review-user]');
    const banButton = event.target.closest('[data-ban-user]');
    if (banButton) {
      const user = fixtures.users.find(item => Number(item.id) === Number(banButton.dataset.banUser));
      if (user) {
        const wasBanned = accountBanned(user);
        user.status = wasBanned ? 'Active' : 'Suspended';
        persist();
        renderUserTable(currentFilters());
        renderKycTables();
        renderDashboardStats();
        window.demoNotice?.(`${user.username} ${wasBanned ? 'unbanned' : 'banned'} in this browser demo.`, 'success');
      }
      return;
    }
    if (reviewButton) {
      const user = fixtures.users.find(item => Number(item.id) === Number(reviewButton.dataset.reviewUser));
      if (user) applyKycStatus(user, reviewButton.dataset.reviewStatus);
      return;
    }
    if (userButton) {
      const user = fixtures.users.find(item => Number(item.id) === Number(userButton.dataset.userView));
      if (user) openUser(user);
    } else if (kycButton) {
      const user = fixtures.users.find(item => Number(item.id) === Number(kycButton.dataset.userKyc || kycButton.dataset.kycReview));
      if (user) openKyc(user);
    }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.modal.show').forEach(closeModal); });

  const search = document.getElementById('user-search');
  search?.addEventListener('input', () => renderUserTable(currentFilters()));
  document.getElementById('user-status-filter')?.addEventListener('change', () => renderUserTable(currentFilters()));
  document.getElementById('user-kyc-filter')?.addEventListener('change', () => renderUserTable(currentFilters()));
  document.getElementById('user-search-button')?.addEventListener('click', () => renderUserTable(currentFilters()));
  document.querySelectorAll('.tab-btn[data-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(tab => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); });
    document.querySelectorAll('.tab-content').forEach(panel => panel.classList.toggle('active', panel.id === button.dataset.tab));
  }));

  renderUserTable(currentFilters());
  renderDashboardStats();
  renderKycTables();
  setupEditForm();
})();
