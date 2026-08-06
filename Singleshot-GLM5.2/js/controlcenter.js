/* ============================================================
   macOS Tahoe — Control Center & Notification Center
   ============================================================ */

const ControlCenter = (() => {
    const overlay = document.getElementById('control-center-overlay');

    function toggle() {
        if (overlay.classList.contains('hidden')) {
            NotificationCenter.hide();
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    function hide() {
        overlay.classList.add('hidden');
    }

    function init() {
        // Toggle buttons
        document.getElementById('cc-wifi').addEventListener('click', function() {
            this.classList.toggle('cc-active');
            const label = document.getElementById('cc-wifi-label');
            const sublabel = document.getElementById('cc-wifi-sublabel');
            if (this.classList.contains('cc-active')) {
                label.textContent = 'Wi-Fi';
                sublabel.textContent = 'Home';
            } else {
                label.textContent = 'Wi-Fi';
                sublabel.textContent = 'Off';
            }
        });

        document.getElementById('cc-bluetooth').addEventListener('click', function() {
            this.classList.toggle('cc-active');
        });

        document.getElementById('cc-airdrop').addEventListener('click', function() {
            this.classList.toggle('cc-active');
        });

        document.getElementById('cc-stage-manager').addEventListener('click', function() {
            this.classList.toggle('cc-active');
        });

        document.getElementById('cc-screen-mirror').addEventListener('click', function() {
            this.classList.toggle('cc-active');
        });

        // Brightness slider
        const brightnessTile = document.querySelector('#cc-brightness-fill').parentElement.parentElement;
        makeVerticalSlider(brightnessTile, 'cc-brightness-fill');

        // Volume slider
        const volumeTile = document.querySelector('#cc-volume-fill').parentElement.parentElement;
        makeVerticalSlider(volumeTile, 'cc-volume-fill');

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hide();
        });

        // Click anywhere outside control center
        document.addEventListener('click', (e) => {
            if (!overlay.classList.contains('hidden') &&
                !e.target.closest('#control-center-overlay') &&
                !e.target.closest('#status-control-center')) {
                hide();
            }
        });

        // Now playing controls
        document.querySelectorAll('.cc-np-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('cc-np-play')) {
                    this.textContent = this.textContent === '▶' ? '⏸' : '▶';
                }
            });
        });
    }

    function makeVerticalSlider(tile, fillId) {
        const track = tile.querySelector('.cc-slider-track');
        const fill = document.getElementById(fillId);
        let dragging = false;

        track.addEventListener('mousedown', (e) => {
            dragging = true;
            updateSlider(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (dragging) updateSlider(e);
        });

        document.addEventListener('mouseup', () => { dragging = false; });

        function updateSlider(e) {
            const rect = track.getBoundingClientRect();
            let pct = 1 - (e.clientY - rect.top) / rect.height;
            pct = Math.max(0, Math.min(1, pct));
            fill.style.height = (pct * 100) + '%';
        }
    }

    return { init, toggle, hide };
})();

const NotificationCenter = (() => {
    const overlay = document.getElementById('notification-center');

    function toggle() {
        if (overlay.classList.contains('hidden')) {
            ControlCenter.hide();
            updateWidgets();
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    function hide() {
        overlay.classList.add('hidden');
    }

    function updateWidgets() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const dateEl = document.getElementById('nc-cal-date');
        if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

        const eventsEl = document.getElementById('nc-cal-events');
        if (eventsEl) {
            const events = [
                { time: '9:00 AM', title: 'Team Standup', color: '#0a84ff' },
                { time: '11:30 AM', title: 'Design Review', color: '#22c55e' },
                { time: '2:00 PM', title: '1:1 with Sarah', color: '#f97316' },
                { time: '4:00 PM', title: 'Product Launch', color: '#a855f7' },
            ];
            eventsEl.innerHTML = events.map(e => `
                <div class="nc-cal-event">
                    <div class="nc-cal-event-dot" style="background:${e.color}"></div>
                    <div>${e.time} — ${e.title}</div>
                </div>
            `).join('');
        }
    }

    function init() {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hide();
        });

        document.addEventListener('click', (e) => {
            if (!overlay.classList.contains('hidden') &&
                !e.target.closest('#notification-center') &&
                !e.target.closest('#status-datetime')) {
                hide();
            }
        });
    }

    return { init, toggle, hide };
})();

window.ControlCenter = ControlCenter;
window.NotificationCenter = NotificationCenter;
