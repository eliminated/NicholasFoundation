/**
 * THE NICHOLAS FOUNDATION — Interactive Globe
 * globe.js — Globe.gl powered 3D globe showing global impact
 * Points with hover tooltips showing branch/office/project info
 */

'use strict';

const ImpactGlobe = (() => {
  // --- Project Locations ---
  const LOCATIONS = [
    { lat: -1.29, lng: 36.82,  city: 'Nairobi',         country: 'Kenya',          type: 'hq',      desc: 'Global Headquarters', details: 'Main hub for all TNF operations, housing 200+ engineers and researchers.' },
    { lat: 6.52,  lng: 3.38,   city: 'Lagos',            country: 'Nigeria',        type: 'office',  desc: 'West Africa Operations', details: 'Regional office managing 12 West African country deployments.' },
    { lat: -33.92,lng: 18.42,  city: 'Cape Town',        country: 'South Africa',   type: 'office',  desc: 'Southern Africa Lab', details: 'AI research lab focused on language models for African languages.' },
    { lat: 28.61, lng: 77.21,  city: 'New Delhi',        country: 'India',          type: 'project', desc: 'Federated Learning', details: 'Deploying privacy-preserving ML across 500+ rural health clinics.' },
    { lat: 13.76, lng: 100.50, city: 'Bangkok',          country: 'Thailand',       type: 'project', desc: 'Digital ID Pilot', details: 'Blockchain-based digital identity platform for stateless populations.' },
    { lat: -6.21, lng: 106.85, city: 'Jakarta',          country: 'Indonesia',      type: 'project', desc: 'Offline-First Platform', details: 'Education platform designed for areas with limited connectivity.' },
    { lat: 51.51, lng: -0.13,  city: 'London',           country: 'United Kingdom', type: 'partner', desc: 'Oxford Partnership', details: 'Joint research initiative with Oxford Internet Institute.' },
    { lat: 48.86, lng: 2.35,   city: 'Paris',            country: 'France',         type: 'partner', desc: 'WHO Digital Health', details: 'Collaborative project with WHO on global health data systems.' },
    { lat: 46.95, lng: 7.45,   city: 'Bern',             country: 'Switzerland',    type: 'partner', desc: 'UNICEF Innovation', details: 'Co-developing open-source tools for child welfare monitoring.' },
    { lat: 42.36, lng: -71.06, city: 'Boston',           country: 'USA',            type: 'partner', desc: 'MIT Media Lab', details: 'Research partnership on AI ethics and responsible deployment.' },
    { lat: 37.77, lng: -122.42,city: 'San Francisco',    country: 'USA',            type: 'office',  desc: 'AI Research Division', details: 'Core AI/ML research team, 80 engineers building FedCore.' },
    { lat: -23.55,lng: -46.63, city: 'São Paulo',        country: 'Brazil',         type: 'project', desc: 'Crisis Response APIs', details: 'Real-time disaster response coordination platform.' },
    { lat: 14.60, lng: -90.53, city: 'Guatemala City',   country: 'Guatemala',      type: 'project', desc: 'Education Platform', details: 'Bilingual K-12 learning platform reaching 50,000 students.' },
    { lat: 30.04, lng: 31.24,  city: 'Cairo',            country: 'Egypt',          type: 'project', desc: 'Blockchain Identity', details: 'Self-sovereign identity system for refugee populations.' },
    { lat: 35.69, lng: 139.69, city: 'Tokyo',            country: 'Japan',          type: 'partner', desc: 'AGI Safety Research', details: 'Joint research on safe AI alignment with RIKEN.' },
    { lat: -36.85,lng: 174.76, city: 'Auckland',         country: 'New Zealand',    type: 'project', desc: 'Pacific Connectivity', details: 'Mesh networking for remote Pacific Island communities.' },
    { lat: 27.70, lng: 85.32,  city: 'Kathmandu',        country: 'Nepal',          type: 'project', desc: 'Mountain Code Schools', details: 'Coding academies in remote mountain villages.' },
    { lat: 55.76, lng: 37.62,  city: 'Moscow',           country: 'Russia',         type: 'project', desc: 'Open Data Commons', details: 'Open government data standardization initiative.' },
  ];

  // --- Arcs (connections between locations) ---
  const ARCS = [
    { from: 0,  to: 1  }, { from: 0,  to: 2  }, { from: 0,  to: 3  },
    { from: 10, to: 9  }, { from: 10, to: 14 }, { from: 7,  to: 8  },
    { from: 7,  to: 13 }, { from: 9,  to: 6  }, { from: 3,  to: 4  },
    { from: 4,  to: 5  }, { from: 11, to: 12 }, { from: 6,  to: 17 },
    { from: 0,  to: 16 }, { from: 5,  to: 15 },
  ];

  let globe, container;

  // --- Colors by location type ---
  const TYPE_COLORS = {
    hq:      '#F5C842',
    office:  '#4F8EF7',
    project: '#10B981',
    partner: '#A78BFA',
  };

  const TYPE_LABELS = {
    hq:      '🏛️ Headquarters',
    office:  '🏢 Regional Office',
    project: '🚀 Active Project',
    partner: '🤝 Research Partner',
  };

  function getColor(type) { return TYPE_COLORS[type] || TYPE_COLORS.project; }

  function getPointSize(type) {
    return type === 'hq' ? 0.8 : type === 'office' ? 0.55 : 0.4;
  }

  // --- Build arc data ---
  function buildArcData() {
    return ARCS.map(arc => ({
      startLat: LOCATIONS[arc.from].lat,
      startLng: LOCATIONS[arc.from].lng,
      endLat:   LOCATIONS[arc.to].lat,
      endLng:   LOCATIONS[arc.to].lng,
      color:    [getColor(LOCATIONS[arc.from].type), getColor(LOCATIONS[arc.to].type)],
    }));
  }

  // --- Theme detection ---
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // --- Build rich tooltip HTML ---
  function buildTooltip(d) {
    const color = getColor(d.type);
    return `
      <div style="
        background: ${isDarkMode() ? 'rgba(10,19,40,0.95)' : 'rgba(255,255,255,0.96)'};
        border: 1px solid ${color}44;
        border-radius: 14px;
        padding: 16px 20px;
        font-family: 'Inter', system-ui, sans-serif;
        min-width: 240px;
        max-width: 300px;
        backdrop-filter: blur(16px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.4);
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${isDarkMode() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
        ">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: ${color}18;
            border-radius: 10px;
            font-size: 18px;
          ">${TYPE_LABELS[d.type].split(' ')[0]}</span>
          <div>
            <div style="font-weight:800;font-size:15px;color:${isDarkMode() ? '#EEF2FF' : '#1a1a2e'};line-height:1.2;">${d.city}</div>
            <div style="font-size:11px;color:${isDarkMode() ? '#8896B0' : '#666'};font-weight:500;">${d.country}</div>
          </div>
        </div>
        <div style="
          display:inline-block;
          padding:3px 10px;
          background:${color}18;
          color:${color};
          font-size:11px;
          font-weight:700;
          border-radius:99px;
          text-transform:uppercase;
          letter-spacing:0.05em;
          margin-bottom: 8px;
        ">${TYPE_LABELS[d.type]}</div>
        <div style="font-weight:700;font-size:13px;color:${isDarkMode() ? '#C8D6E5' : '#333'};margin-bottom:4px;">${d.desc}</div>
        <div style="font-size:12px;color:${isDarkMode() ? '#7A8BA8' : '#777'};line-height:1.6;">${d.details}</div>
      </div>
    `;
  }

  // --- Show/hide globe vs fallback ---
  function showGlobe() {
    if (!container) return;
    container.style.display = '';
    const fb = document.getElementById('globe-fallback');
    if (fb) fb.style.display = 'none';
  }

  function showFallback() {
    if (container) container.style.display = 'none';
    const fb = document.getElementById('globe-fallback');
    if (fb) fb.style.display = '';
  }

  // --- Initialize ---
  function init() {
    container = document.getElementById('globe-container');
    if (!container) return;

    if (typeof Globe === 'undefined') {
      console.warn('[ImpactGlobe] Globe.gl not loaded.');
      return;
    }

    try {
      // Container must be visible before Globe mounts (WebGL needs real dimensions)
      showGlobe();

      // Choose textures based on theme
      const darkTexture = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg';
      const lightTexture = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg';
      const bumpTexture = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png';

      globe = Globe()
        .globeImageUrl(isDarkMode() ? darkTexture : lightTexture)
        .bumpImageUrl(bumpTexture)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor(isDarkMode() ? '#4F8EF7' : '#2D70DB')
        .atmosphereAltitude(0.22)
        // Data points
        .pointsData(LOCATIONS)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(d => getColor(d.type))
        .pointAltitude(d => getPointSize(d.type) * 0.06)
        .pointRadius(d => getPointSize(d.type))
        .pointLabel(d => buildTooltip(d))
        // Rings around points (pulsing effect)
        .ringsData(LOCATIONS)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(d => () => getColor(d.type))
        .ringMaxRadius(d => d.type === 'hq' ? 5 : 3)
        .ringPropagationSpeed(d => d.type === 'hq' ? 2 : 1.5)
        .ringRepeatPeriod(d => d.type === 'hq' ? 600 : 1200)
        // Arcs
        .arcsData(buildArcData())
        .arcColor('color')
        .arcAltitudeAutoScale(0.35)
        .arcStroke(0.5)
        .arcDashLength(0.5)
        .arcDashGap(0.25)
        .arcDashAnimateTime(3000)
        (container);

      // Size to container
      function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) globe.width(w).height(h);
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      // Auto-rotate and orbit controls
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.minPolarAngle = Math.PI * 0.25;
      controls.maxPolarAngle = Math.PI * 0.75;

      // Initial view — tilted toward Africa/Asia
      globe.pointOfView({ lat: 15, lng: 30, altitude: 2.2 }, 0);

      // Hex polygon country outlines
      if (typeof topojson !== 'undefined') {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
          .then(res => res.json())
          .then(topology => {
            globe
              .hexPolygonsData(
                topojson.feature(topology, topology.objects.countries).features
              )
              .hexPolygonResolution(3)
              .hexPolygonMargin(0.45)
              .hexPolygonUseDots(true)
              .hexPolygonColor(() =>
                isDarkMode()
                  ? 'rgba(79,142,247,0.06)'
                  : 'rgba(45,112,219,0.08)'
              );
          })
          .catch(() => {});
      }

      // Pause when off-screen for performance
      const observer = new IntersectionObserver(([entry]) => {
        const visible = entry.isIntersecting;
        if (controls) controls.autoRotate = visible;
        if (visible) {
          globe.resumeAnimation && globe.resumeAnimation();
        } else {
          globe.pauseAnimation && globe.pauseAnimation();
        }
      }, { threshold: 0.1 });
      observer.observe(container);

      // Theme change listener
      const themeObs = new MutationObserver(() => {
        globe.globeImageUrl(isDarkMode() ? darkTexture : lightTexture);
        globe.atmosphereColor(isDarkMode() ? '#4F8EF7' : '#2D70DB');
        globe.hexPolygonColor && globe.hexPolygonColor(() =>
          isDarkMode()
            ? 'rgba(79,142,247,0.06)'
            : 'rgba(45,112,219,0.08)'
        );
      });
      themeObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      console.log('[ImpactGlobe] Globe initialized successfully.');

    } catch (e) {
      console.error('[ImpactGlobe] Globe init failed:', e);
      showFallback();
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ImpactGlobe.init();
});
