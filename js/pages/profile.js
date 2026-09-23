(() => {
  const profile = DemoState.profile || {
    username: DemoState.currentUser || 'DemoLion',
    email: 'demo@rawr.casino',
    bio: 'RAWR Casino enthusiast!',
    kyc: 'Not submitted'
  };
  DemoState.profile = profile;

  const username = document.getElementById('profile-name');
  const email = document.getElementById('profile-email');
  const kycStatus = document.getElementById('profile-kyc-status');
  const kycStatusCopy = document.getElementById('profile-kyc-status-copy');
  const tabs = [...document.querySelectorAll('[data-profile-tab]')];
  const panels = {
    overview: document.getElementById('overviewTab'),
    settings: document.getElementById('settingsTab'),
    kyc: document.getElementById('kycTab')
  };

  function setKycStatus(value) {
    profile.kyc = value;
    if (kycStatus) {
      const icon = value === 'Approved' ? 'fa-check-circle' : value === 'Pending' ? 'fa-hourglass-half' : 'fa-times-circle';
      kycStatus.dataset.status = value.toLowerCase().replace(/\s+/g, '-');
      kycStatus.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i> ${value}`;
    }
    if (kycStatusCopy) kycStatusCopy.textContent = value;
    const progress = document.getElementById('kycProgress');
    const percentage = document.getElementById('progressPercentage');
    const amount = value === 'Pending' ? 55 : value === 'Approved' ? 100 : 0;
    if (progress) progress.style.width = `${amount}%`;
    if (percentage) percentage.textContent = `${amount}%`;
  }

  if (username) username.textContent = profile.username;
  if (email) email.textContent = profile.email;
  const accountRecord = window.getDemoAccounts?.().find(account => account.id === DemoState.accountId);
  const referralCode = document.getElementById('profile-referral-code');
  const memberSince = document.getElementById('profile-member-since');
  if (referralCode) referralCode.textContent = profile.referralCode || accountRecord?.referralCode || 'RAWR-DEMO';
  if (memberSince) {
    const createdAt = profile.createdAt || accountRecord?.createdAt;
    const createdDate = createdAt ? new Date(createdAt) : null;
    if (createdDate && !Number.isNaN(createdDate.getTime())) {
      memberSince.textContent = createdDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
  }
  document.getElementById('settingsUsername').value = profile.username;
  document.getElementById('settingsEmail').value = profile.email;
  document.getElementById('settingsBio').value = profile.bio;
  setKycStatus(profile.kyc || 'Not submitted');

  const rawr = document.getElementById('overviewRawrBalance');
  const tickets = document.getElementById('overviewTicketsBalance');
  const mined = document.getElementById('profile-mined');
  const streak = document.getElementById('currentLoginStreak');
  if (rawr) rawr.textContent = formatDemoNumber(DemoState.rawrBalance);
  if (tickets) tickets.textContent = formatDemoNumber(DemoState.ticketBalance);
  if (mined) mined.textContent = formatDemoNumber(DemoState.totalMined);
  if (streak) streak.textContent = `${Number(DemoState.loginStreak) || 0} Days`;

  tabs.forEach(tab => tab.addEventListener('click', () => {
    const selected = tab.dataset.profileTab;
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    Object.entries(panels).forEach(([key, panel]) => {
      if (!panel) return;
      const active = key === selected;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }));

  document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
    const nextName = document.getElementById('settingsUsername').value.trim();
    if (!nextName) return demoNotice('Enter a username before saving.', 'error');
    const accounts = window.getDemoAccounts?.() || [];
    const duplicate = accounts.some(account => account.id !== DemoState.accountId && account.username.toLowerCase() === nextName.toLowerCase());
    if (duplicate) return demoNotice('That username belongs to another local demo account.', 'error');
    const account = accounts.find(item => item.id === DemoState.accountId);
    if (account) {
      try {
        account.username = nextName;
        localStorage.setItem(window.RAWR_DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
      } catch (_) {
        return demoNotice('Could not save the updated username in browser storage.', 'error');
      }
    }
    profile.username = nextName;
    profile.email = document.getElementById('settingsEmail').value;
    profile.bio = document.getElementById('settingsBio').value.trim();
    DemoState.currentUser = profile.username;
    DemoState.profile = profile;
    if (username) username.textContent = profile.username;
    saveDemoState();
    demoNotice('Profile updated in this browser.', 'success');
  });

  document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    const current = document.getElementById('currentPassword');
    const next = document.getElementById('newPassword');
    const confirm = document.getElementById('confirmNewPassword');
    if (!current.value || !next.value || !confirm.value) return demoNotice('Complete each password field first.', 'error');
    if (next.value.length < 6) return demoNotice('Use at least 6 characters for the new password.', 'error');
    if (next.value !== confirm.value) return demoNotice('New passwords do not match.', 'error');
    current.value = next.value = confirm.value = '';
    demoNotice('Password change simulated. Nothing was sent to a server.', 'success');
  });

  document.getElementById('savePersonalInfoBtn')?.addEventListener('click', () => {
    const fullName = document.getElementById('fullName').value.trim();
    if (!fullName) return demoNotice('Enter sample personal details to continue.', 'error');
    document.getElementById('kycProgress').style.width = '25%';
    document.getElementById('progressPercentage').textContent = '25%';
    demoNotice('Sample details previewed locally. They were not saved or uploaded.', 'info');
  });
  document.getElementById('sendCodeBtn')?.addEventListener('click', () => demoNotice('Email verification is simulated in this demo.', 'info'));
  document.getElementById('submitKycBtn')?.addEventListener('click', () => {
    setKycStatus('Pending');
    DemoState.profile = profile;
    saveDemoState();
    demoNotice('Demo verification request submitted locally. No documents were uploaded.', 'success');
  });

  const avatarInput = document.getElementById('avatarFileInput');
  const chooseAvatar = () => avatarInput?.click();
  document.getElementById('uploadAvatarBtn')?.addEventListener('click', chooseAvatar);
  document.getElementById('chooseAvatarBtn')?.addEventListener('click', chooseAvatar);
  avatarInput?.addEventListener('change', () => {
    const file = avatarInput.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    ['profileAvatar', 'settingsAvatarPreview'].forEach(id => {
      const target = document.getElementById(id);
      if (target) target.innerHTML = `<img src="${previewUrl}" alt="Local profile preview">`;
    });
    demoNotice('Local avatar preview updated. The image was not uploaded.', 'success');
  });
})();
