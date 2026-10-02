class DayNightCycle {
  constructor(config = {}) {
    const defaults = {
      dayLengthSeconds: 180,
      sunColor: 0xFFF4A3,
      moonColor: 0xCFE3FF,
      sunriseStart: 0.20,
      sunriseEnd: 0.30,
      sunsetStart: 0.70,
      sunsetEnd: 0.80,
      // A blue night wash preserves the painted town's details.
      minDarkAlpha: 0.62,
      maxLightAlpha: 0.0,
      overlayColor: 0x071b30,
    };
    this.config = { ...defaults, ...config };
    this.setDayLength(this.config.dayLengthSeconds);

    this.scene = null;
    this.timeOfDay = 0; // 0..1
    this.elapsed = 0;
    this.currentDayCount = 0;
    this.executionsThisDay = 0;
    this.lastHour = -1;

    // game object references
    this.container = null;
    this.sun = null;
    this.moon = null;
    this.overlay = null;

    // callbacks
    this.fullDayHandlers = [];
    this.hourHandlers = [];
  }

  /**
   * Create visual elements and overlay. Call from scene.create().
   * @param {Phaser.Scene} scene
   * @param {object} layers - depth configuration
   * @param {number} layers.backCloudsDepth - depth of back cloud layer
   * @param {number} [layers.overlayDepth] - depth for the lighting overlay
   */
  init(scene, layers = {}) {
    this.scene = scene;
    const { overlayDepth = 28.9, celestialDepth = overlayDepth + .1 } = layers;

    // Painted town backgrounds are opaque, so the sky ornaments sit above
    // the wash while remaining below characters and gameplay targets.
    this.container = scene.add.container(0, 0).setDepth(celestialDepth);
    this.stars = scene.add.graphics();
    for (let i=0;i<90;i++) {
      const x=i===0?10:i===1?scene.scale.width-10:Math.random()*scene.scale.width;
      const y=scene.scale.height*(i===2?.59:.03+Math.random()*.58);
      this.stars.fillStyle(0xf4ead5,.75+(i%3)*.1).fillCircle(x,y,i%5===0?3.4:2.1);
    }
    this.container.add(this.stars);

    // Create sun
    this.sun = scene.add.circle(0, 0, 30, this.config.sunColor);
    this.sun.setAlpha(0);
    this.container.add(this.sun);

    // Cut a real transparent crescent, rather than drawing a black disc.
    const moonKey='crescent-moon-clear';
    if (!scene.textures.exists(moonKey)) {
      const texture=scene.textures.createCanvas(moonKey,80,80), ctx=texture.context;
      ctx.fillStyle='#'+this.config.moonColor.toString(16).padStart(6,'0');
      ctx.beginPath();ctx.arc(40,40,36,0,Math.PI*2);ctx.fill();
      ctx.globalCompositeOperation='destination-out';
      ctx.beginPath();ctx.arc(57,29,33,0,Math.PI*2);ctx.fill();
      ctx.globalCompositeOperation='source-over';texture.refresh();
    }

    this.moon = scene.add.image(0, 0, moonKey).setDisplaySize(48,48);
    this.moon.setAlpha(1);
    this.container.add(this.moon);

    // Fullscreen light/dark overlay
    this.overlay = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      this.config.overlayColor,
      1
    );
    this.overlay.setDepth(overlayDepth);
    this.overlay.setScrollFactor(0);
    this.overlay.setAlpha(this.config.minDarkAlpha);

    return this;
  }

  setDayLength(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new RangeError('Day length must be a positive number of seconds.');
    }
    this.config.dayLengthSeconds = seconds;
  }

  getTimeOfDay() {
    return this.timeOfDay;
  }

  onFullDay(cb) {
    if (cb) this.fullDayHandlers.push(cb);
  }

  onHourlyExecution(cb) {
    if (cb) this.hourHandlers.push(cb);
  }

  update(deltaSeconds) {
    if (!this.scene || !Number.isFinite(deltaSeconds) || deltaSeconds < 0) return;
    const startHour = Math.floor(this.timeOfDay * 24);
    const totalHours = (this.timeOfDay + deltaSeconds / this.config.dayLengthSeconds) * 24;
    if (!Number.isFinite(totalHours) || totalHours > Number.MAX_SAFE_INTEGER) return;
    // Snap tiny floating-point errors at exact hour boundaries. A full day
    // ends at the same clock time it started, so comparing clock times alone
    // cannot tell us how many midnights have passed.
    const endHours = Math.abs(totalHours - Math.round(totalHours)) < 1e-9
      ? Math.round(totalHours) : totalHours;
    this.lastHour = startHour;
    for (let boundary = startHour + 1; boundary <= Math.floor(endHours); boundary++) {
      const hour = boundary % 24;
      this.timeOfDay = hour / 24;
      if (hour === 0) {
        this.executionsThisDay = 0;
        this.currentDayCount++;
        this.fullDayHandlers.forEach(fn => fn(this.currentDayCount));
      }
      this.lastHour = hour;
      this.executionsThisDay++;
      this.hourHandlers.forEach(fn => fn(hour));
    }
    this.timeOfDay = (endHours % 24) / 24;

    this.updateOverlay();
    this.updateCelestials();
  }

  // Smoothly adjust overlay alpha based on time of day
  updateOverlay() {
    if (!this.overlay) return;
    const { minDarkAlpha, maxLightAlpha } = this.config;
    const alpha =
      minDarkAlpha +
      (maxLightAlpha - minDarkAlpha) * 0.5 *
        (1 - Math.cos(this.timeOfDay * Math.PI * 2));
    this.overlay.setAlpha(alpha);
  }

  // Position and fade the sun and moon
  updateCelestials() {
    const { sunriseStart, sunriseEnd, sunsetStart, sunsetEnd } = this.config;
    const width = this.scene.scale.width;
    const baseY = this.scene.scale.height * .43;
    const arc = this.scene.scale.height * .19;
    const t = this.timeOfDay;

    // --- Sun ---
    if (t >= sunriseStart && t <= sunsetEnd) {
      const sunT = Phaser.Math.Clamp((t - sunriseStart) / (sunsetEnd - sunriseStart), 0, 1);
      const angle = sunT * Math.PI;
      this.sun.setPosition(-60 + (width+120)*sunT, baseY - Math.sin(angle) * arc);
      if (t < sunriseEnd) {
        const p = (t - sunriseStart) / (sunriseEnd - sunriseStart);
        this.sun.setAlpha(Phaser.Math.Easing.Quadratic.InOut(p));
      } else if (t > sunsetStart) {
        const p = 1 - (t - sunsetStart) / (sunsetEnd - sunsetStart);
        this.sun.setAlpha(Phaser.Math.Easing.Quadratic.InOut(p));
      } else {
        this.sun.setAlpha(1);
      }
    } else {
      this.sun.setAlpha(0);
    }

    // --- Moon ---
    const nightLength = (1 - sunsetStart) + sunriseEnd;
    let moonT;
    if (t >= sunsetStart) {
      moonT = (t - sunsetStart) / nightLength;
    } else {
      moonT = (t + (1 - sunsetStart)) / nightLength;
    }
    const moonAngle = moonT * Math.PI;
    this.moon.setPosition(-60 + (width+120)*moonT, baseY - Math.sin(moonAngle) * arc);

    let moonAlpha = 0;
    if (t >= sunsetStart && t <= sunsetEnd) {
      const p = (t - sunsetStart) / (sunsetEnd - sunsetStart);
      moonAlpha = Phaser.Math.Easing.Quadratic.InOut(p);
    } else if (t >= sunriseStart && t <= sunriseEnd) {
      const p = 1 - (t - sunriseStart) / (sunriseEnd - sunriseStart);
      moonAlpha = Phaser.Math.Easing.Quadratic.InOut(p);
    } else if (t <= sunriseStart || t >= sunsetEnd) {
      moonAlpha = 1;
    }
    this.moon.setAlpha(moonAlpha);
    this.stars.setAlpha(moonAlpha*.8);
  }
}

// Expose globally
window.DayNightCycle = DayNightCycle;
