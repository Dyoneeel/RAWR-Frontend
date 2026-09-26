/**
 * RAWR Admin UI
 * Right-side sidebar toggle for desktop, tablet, and mobile.
 */
(function () {
    'use strict';

    function initAdminSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const toggle = document.querySelector('.menu-toggle');
        let backdrop = document.querySelector('.sidebar-backdrop');

        if (!sidebar || !toggle) return;

        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.id = 'sidebarBackdrop';
            document.body.appendChild(backdrop);
        }

        function setOpen(open) {
            sidebar.classList.toggle('active', open);
            toggle.classList.toggle('active', open);
            backdrop.classList.toggle('active', open);
            document.body.classList.toggle('admin-sidebar-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close Admin Menu' : 'Open Admin Menu');
        }

        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(!sidebar.classList.contains('active'));
        });

        backdrop.addEventListener('click', function () {
            setOpen(false);
        });

        sidebar.querySelectorAll('.sidebar-item').forEach(function (item) {
            item.addEventListener('click', function () {
                setOpen(false);
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        });

        // Always start closed when entering an admin page.
        setOpen(false);
    }

    function initProfileDropdown() {
        const toggle = document.querySelector('.profile-toggle');
        const menu = document.querySelector('.profile-menu');

        if (!toggle || !menu) return; // Exit if elements don't exist

        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            menu.classList.toggle('active');
        });

        menu.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        document.addEventListener('click', function () {
            menu.classList.remove('active');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initAdminSidebar();
        initProfileDropdown();
    });
})();
