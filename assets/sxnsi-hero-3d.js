const canvas = document.getElementById("sxnsiHero3d");
const shell = document.querySelector(".hero-logo");

if (canvas && shell) {
  const ctx = canvas.getContext("2d", { alpha: true });
  const image = new Image();
  image.src = "assets/yojhan-logo.png";

  const shards = [];
  const sparks = [];
  const letters = "YOJHAN STORE".split("");
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let startTime = performance.now();
  let animationReady = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeInOut = (t) => {
    const x = clamp(t);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };
  const pulse = (phase, from, to) => {
    if (phase <= from || phase >= to) return 0;
    return Math.sin(((phase - from) / (to - from)) * Math.PI);
  };

  function resize() {
    const rect = shell.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function makeShards() {
    shards.length = 0;
    const cols = 8;
    const rows = 6;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const u = x / cols;
        const v = y / rows;
        const fromCenterX = u - 0.5;
        const fromCenterY = v - 0.5;
        const angle = Math.atan2(fromCenterY, fromCenterX) + (Math.random() - 0.5) * 0.8;
        const power = 0.75 + Math.random() * 0.75;
        shards.push({
          sx: x / cols,
          sy: y / rows,
          sw: 1 / cols,
          sh: 1 / rows,
          ox: Math.cos(angle) * power,
          oy: Math.sin(angle) * power,
          spin: (Math.random() - 0.5) * 1.5,
          delay: Math.random() * 0.12,
          lift: Math.random() * 0.35
        });
      }
    }
  }

  function makeSparks() {
    sparks.length = 0;
    for (let i = 0; i < 90; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.35 + Math.random() * 1.1;
      sparks.push({
        angle,
        speed,
        size: 1.1 + Math.random() * 3.5,
        life: 0.45 + Math.random() * 0.55,
        delay: Math.random() * 0.18
      });
    }
  }

  function clearStage() {
    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "rgba(255,255,255,0.07)");
    bg.addColorStop(0.28, "rgba(0,0,0,0.72)");
    bg.addColorStop(0.72, "rgba(22,23,25,0.88)");
    bg.addColorStop(1, "rgba(255,255,255,0.08)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    const gap = Math.max(28, width / 14);
    for (let x = -gap; x < width + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + width * 0.16, height);
      ctx.stroke();
    }
    for (let y = 0; y < height + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLens(time, strength) {
    const cx = width * 0.52;
    const cy = height * 0.5;
    const radius = Math.max(width, height) * (0.35 + strength * 0.18);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, `rgba(255,255,255,${0.18 + strength * 0.28})`);
    glow.addColorStop(0.45, `rgba(150,154,164,${0.08 + strength * 0.16})`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.18 + strength * 0.32;
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(time * 0.0007) * 0.12);
    const beam = ctx.createLinearGradient(-width * 0.5, 0, width * 0.5, 0);
    beam.addColorStop(0, "rgba(255,255,255,0)");
    beam.addColorStop(0.48, "rgba(255,255,255,0.9)");
    beam.addColorStop(0.52, "rgba(255,255,255,0.9)");
    beam.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = beam;
    ctx.fillRect(-width * 0.52, -2 - strength * 10, width * 1.04, 4 + strength * 20);
    ctx.restore();
  }

  function drawImageCover(img, dx, dy, dw, dh, alpha = 1) {
    const ratio = Math.min(dw / img.width, dh / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h);
    ctx.restore();
  }

  function drawWholeLogo(phase, time, alpha = 1) {
    const logoSize = Math.min(width * 0.56, height * 0.78);
    const breathe = Math.sin(time * 0.0022) * 0.02;
    const scale = 0.82 + breathe + pulse(phase, 0.08, 0.18) * 0.22;
    const cx = width * 0.53;
    const cy = height * 0.48;
    const size = logoSize * scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(time * 0.0011) * 0.035);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 30 + pulse(phase, 0.08, 0.18) * 55;
    drawImageCover(image, -size / 2, -size / 2, size, size, alpha);
    ctx.restore();
  }

  function drawShatteredLogo(phase, time) {
    const breakAmount = easeOut((phase - 0.16) / 0.18);
    const returnAmount = easeInOut((phase - 0.72) / 0.18);
    const spread = breakAmount * (1 - returnAmount);
    const logoSize = Math.min(width * 0.58, height * 0.8);
    const baseX = width * 0.53 - logoSize / 2;
    const baseY = height * 0.48 - logoSize / 2;

    for (const shard of shards) {
      const localSpread = clamp((spread - shard.delay) / (1 - shard.delay));
      const sx = shard.sx * image.width;
      const sy = shard.sy * image.height;
      const sw = shard.sw * image.width;
      const sh = shard.sh * image.height;
      const dw = logoSize * shard.sw;
      const dh = logoSize * shard.sh;
      const homeX = baseX + logoSize * shard.sx + dw / 2;
      const homeY = baseY + logoSize * shard.sy + dh / 2;
      const distance = Math.max(width, height) * 0.38;
      const x = homeX + shard.ox * distance * localSpread;
      const y = homeY + shard.oy * distance * localSpread - shard.lift * height * localSpread;
      const rot = shard.spin * Math.PI * localSpread + Math.sin(time * 0.004 + shard.spin) * 0.04;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = 1 - Math.max(0, spread - 0.7) * 0.5;
      ctx.shadowColor = "#f5f5f5";
      ctx.shadowBlur = 18 + localSpread * 20;
      ctx.drawImage(image, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
      ctx.strokeStyle = `rgba(255,255,255,${0.18 + localSpread * 0.38})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }
  }

  function drawSparks(phase) {
    const amount = pulse(phase, 0.16, 0.38) + pulse(phase, 0.66, 0.82) * 0.6;
    if (amount <= 0.001) return;
    const cx = width * 0.53;
    const cy = height * 0.49;
    for (const spark of sparks) {
      const life = clamp((amount - spark.delay) / spark.life);
      if (life <= 0) continue;
      const distance = Math.max(width, height) * spark.speed * easeOut(life);
      const x = cx + Math.cos(spark.angle) * distance;
      const y = cy + Math.sin(spark.angle) * distance * 0.62;
      ctx.save();
      ctx.globalAlpha = (1 - life) * 0.85;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, y, spark.size * (1 - life * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawChromeText(text, x, y, size, reveal, align = "center") {
    if (reveal <= 0) return;
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
    ctx.lineJoin = "round";
    ctx.globalAlpha = reveal;
    for (let i = 11; i >= 1; i -= 1) {
      ctx.fillStyle = `rgba(0,0,0,${0.045 + i * 0.018})`;
      ctx.fillText(text, x + i * 1.6, y + i * 1.05);
    }
    ctx.strokeStyle = "#020203";
    ctx.lineWidth = Math.max(10, size * 0.09);
    ctx.strokeText(text, x, y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(2, size * 0.018);
    ctx.strokeText(text, x, y);
    const gradient = ctx.createLinearGradient(0, y - size * 0.7, 0, y + size * 0.7);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.26, "#8b8e96");
    gradient.addColorStop(0.45, "#ffffff");
    gradient.addColorStop(0.7, "#4d5057");
    gradient.addColorStop(1, "#f7f7f7");
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 18 * reveal;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawTitle(phase, time) {
    const reveal = easeOut((phase - 0.31) / 0.18) * (1 - easeOut((phase - 0.78) / 0.1));
    if (reveal <= 0.001) return;

    const top = Math.min(width * 0.19, height * 0.29);
    const bottom = Math.min(width * 0.086, height * 0.14);
    const cx = width * 0.5;
    const shake = Math.sin(time * 0.02) * 2 * (1 - reveal);

    drawChromeText("YOJHAN", cx + shake, height * 0.43, top, reveal);
    drawChromeText("HACK", cx - shake, height * 0.62, bottom, reveal);

    ctx.save();
    ctx.globalAlpha = reveal * 0.9;
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.19, height * 0.72);
    ctx.lineTo(width * 0.81, height * 0.72);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = reveal * 0.28;
    ctx.fillStyle = "#ffffff";
    letters.forEach((letter, index) => {
      if (letter === " ") return;
      const angle = (index / letters.length) * Math.PI * 2 + time * 0.0006;
      const radius = Math.min(width, height) * 0.34;
      ctx.font = `900 ${Math.max(14, width * 0.028)}px Impact, Arial Black, sans-serif`;
      ctx.fillText(letter, cx + Math.cos(angle) * radius, height * 0.53 + Math.sin(angle) * radius * 0.45);
    });
    ctx.restore();
  }

  function drawCracks(phase) {
    const crack = pulse(phase, 0.12, 0.28);
    if (crack <= 0.001) return;
    const cx = width * 0.53;
    const cy = height * 0.49;
    ctx.save();
    ctx.globalAlpha = crack;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.7;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 14;
    const paths = [
      [[0, 0], [-110, -62], [-170, -110], [-230, -94]],
      [[0, 0], [95, -88], [155, -150], [230, -132]],
      [[0, 0], [125, 48], [195, 82], [275, 70]],
      [[0, 0], [-76, 91], [-132, 155], [-205, 168]],
      [[0, 0], [18, -126], [42, -210]]
    ];
    paths.forEach((path) => {
      ctx.beginPath();
      path.forEach(([x, y], index) => {
        const px = cx + x * Math.min(width / 760, 1.3);
        const py = cy + y * Math.min(height / 420, 1.3);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawFlash(phase) {
    const flash = pulse(phase, 0.135, 0.205) + pulse(phase, 0.69, 0.75) * 0.55;
    if (flash <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = flash * 0.58;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function render(now) {
    if (!animationReady) return;
    const elapsed = now - startTime;
    const cycleMs = 7600;
    const phase = (elapsed % cycleMs) / cycleMs;
    const logoAlpha = phase < 0.18 ? 1 : phase > 0.72 ? easeOut((phase - 0.72) / 0.16) : 0;

    clearStage();
    drawLens(now, pulse(phase, 0.1, 0.22) + pulse(phase, 0.64, 0.8));

    if (phase < 0.18 || phase > 0.72) {
      drawWholeLogo(phase, now, phase < 0.18 ? 1 : logoAlpha);
    }
    if (phase >= 0.12 && phase <= 0.9) {
      drawShatteredLogo(phase, now);
    }

    drawCracks(phase);
    drawSparks(phase);
    drawTitle(phase, now);
    drawFlash(phase);

    requestAnimationFrame(render);
  }

  image.addEventListener("load", () => {
    resize();
    makeShards();
    makeSparks();
    animationReady = true;
    shell.classList.add("is-animated");
    startTime = performance.now();
    requestAnimationFrame(render);
  });

  image.addEventListener("error", () => {
    shell.classList.remove("is-animated");
  });

  window.addEventListener("resize", () => {
    resize();
    makeShards();
    makeSparks();
  }, { passive: true });
}
