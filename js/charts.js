/* ═══════════════════════════════════════════════════════════
   CHARTS.JS — Lightweight inline SVG/CSS charts (no library)
═══════════════════════════════════════════════════════════ */
window.HRCharts = {
  // Simple donut progress chart using conic-gradient
  donut: function(pct, color, label, size) {
    size = size || 120;
    color = color || '#4f46e5';
    var clean = Math.max(0, Math.min(100, Math.round(pct)));
    return '<div style="width:' + size + 'px; height:' + size + 'px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: conic-gradient(' + color + ' ' + clean + '%, #e2e8f0 0); position:relative;">' +
      '<div style="width:' + (size * 0.7) + 'px; height:' + (size * 0.7) + 'px; border-radius:50%; background:white; display:flex; flex-direction:column; align-items:center; justify-content:center;">' +
        '<div style="font-size:' + (size * 0.18) + 'px; font-weight:800; color:' + color + '">' + clean + '%</div>' +
        (label ? '<div style="font-size:' + (size * 0.09) + 'px; color:#94a3b8; font-weight:600; text-align:center; padding:0 4px">' + label + '</div>' : '') +
      '</div>' +
    '</div>';
  },

  // Horizontal bar
  hBar: function(label, value, max, color) {
    var pct = max > 0 ? Math.round((value / max) * 100) : 0;
    color = color || '#4f46e5';
    return '<div style="margin-bottom:10px">' +
      '<div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">' +
        '<span style="font-weight:600;">' + label + '</span>' +
        '<span style="color:#64748b">' + value + '</span>' +
      '</div>' +
      '<div style="height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">' +
        '<div style="height:100%; width:' + pct + '%; background:' + color + '; border-radius:4px; transition:width 0.9s cubic-bezier(0.4,0,0.2,1)"></div>' +
      '</div>' +
    '</div>';
  }
};
