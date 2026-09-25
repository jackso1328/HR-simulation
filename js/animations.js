window.HRAnim = {
    /**
     * Animates a number counting up from `start` to `end` over `duration` ms.
     * Updates the element's innerText each frame.
     */
    animateValue: function(el, start, end, duration) {
        if (!el) return;
        var startTs = null;
        var range = end - start;

        function step(ts) {
            if (!startTs) startTs = ts;
            var progress = Math.min((ts - startTs) / duration, 1);
            // ease-out quad
            var eased = 1 - (1 - progress) * (1 - progress);
            el.innerText = Math.floor(eased * range + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.innerText = end;
            }
        }
        window.requestAnimationFrame(step);
    },

    /**
     * Animates a CSS skill bar (sets the width via inline style).
     * The bar must have transition: width set in CSS.
     */
    animateSkillBar: function(barEl, targetPct, delayMs) {
        delayMs = delayMs || 50;
        setTimeout(function() {
            if (barEl) barEl.style.width = targetPct + "%";
        }, delayMs);
    }
};
