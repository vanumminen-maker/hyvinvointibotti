const { createCanvas } = require('canvas');

/**
 * Piirtää yhteisön akvaarion Canvasilla.
 *
 * @param {Array} items Akvaariossa olevat esineet ja kalat
 * @param {number} totalPoolPoints Yhteisöpotin pisteet
 * @param {number} totalDonations Tehdyt eläinsuojelulahjoitukset
 * @returns {Buffer} PNG-kuvapuskuri
 */
function drawAquarium(items = [], totalPoolPoints = 0, totalDonations = 0) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Veden syvyysgradientti
  const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
  waterGrad.addColorStop(0, '#0f3460');
  waterGrad.addColorStop(0.3, '#16213e');
  waterGrad.addColorStop(0.8, '#1a1a2e');
  waterGrad.addColorStop(1, '#12121e');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Valonsäteet veden pinnalta
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#64dfdf';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(80 + i * 140, 0);
    ctx.lineTo(130 + i * 140, 0);
    ctx.lineTo(210 + i * 150, height);
    ctx.lineTo(120 + i * 150, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 3. Kuplia vedessä
  ctx.save();
  const bubbleCoords = [
    { x: 120, y: 150, r: 6 }, { x: 130, y: 120, r: 4 }, { x: 125, y: 80, r: 3 },
    { x: 380, y: 220, r: 8 }, { x: 390, y: 170, r: 5 }, { x: 385, y: 130, r: 4 },
    { x: 650, y: 260, r: 7 }, { x: 660, y: 200, r: 5 }, { x: 655, y: 140, r: 4 }
  ];
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  for (const b of bubbleCoords) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 4. Hiekkapohja (aallokas dyyni)
  const sandGrad = ctx.createLinearGradient(0, 340, 0, height);
  sandGrad.addColorStop(0, '#d4a373');
  sandGrad.addColorStop(0.3, '#c5925d');
  sandGrad.addColorStop(1, '#8c5828');
  ctx.fillStyle = sandGrad;
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.bezierCurveTo(200, 340, 350, 375, 500, 350);
  ctx.bezierCurveTo(650, 330, 720, 365, width, 355);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Hiekan varjostusviiva
  ctx.strokeStyle = '#b07d4b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.bezierCurveTo(200, 340, 350, 375, 500, 350);
  ctx.bezierCurveTo(650, 330, 720, 365, width, 355);
  ctx.stroke();

  // Pieniä koristekiviä pohjalla oletuksena
  drawDefaultPebbles(ctx);

  // Erotellaan sisustuselementit ja kalat
  const decorations = items.filter(i => i.item_type === 'decoration');
  const fishList = items.filter(i => i.item_type === 'fish');

  // 5. Piirretään sisustuselementit pohjalle
  for (const item of decorations) {
    const x = item.pos_x || 400;
    const y = item.pos_y || 350;
    drawDecoration(ctx, item.item_key, x, y, item.color, item.size || 50, item.item_name);
  }

  // 6. Piirretään kalat uimaan
  for (const fish of fishList) {
    const x = fish.pos_x || 300;
    const y = fish.pos_y || 180;
    drawFish(ctx, fish.item_key, x, y, fish.color || '#ff8c00', fish.size || 30, fish.item_name);
  }

  // 7. Jos akvaario on täysin tyhjä
  if (items.length === 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'italic 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Akvaario odottaa asukkaita!', width / 2, 200);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('Ylläpito voi hankkia kaloja ja koristeita komennolla /osta', width / 2, 230);
    ctx.textAlign = 'left';
  }

  // 8. Kehys ja lasiheijastus
  ctx.save();
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  // Lasin viisto heijastusviiva
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(220, 0);
  ctx.lineTo(80, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 9. Yläpalkki (HUD)
  ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';
  ctx.beginPath();
  ctx.roundRect(15, 15, width - 30, 48, 8);
  ctx.fill();
  ctx.strokeStyle = '#0077b6';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Otsikko
  ctx.fillStyle = '#caf0f8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('🐠 YHTEISÖN HYVINVOINTIAKVAARIO', 30, 45);

  // Yhteisöpotti & lahjoitukset
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 15px sans-serif';
  let hudInfo = `Potti: ${totalPoolPoints} lusikkaa 🥄`;
  if (totalDonations > 0) {
    hudInfo += `  |  Lahjoitukset: ${totalDonations} kpl 🐾`;
  }
  ctx.fillText(hudInfo, width - 35, 45);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

/**
 * Pienten oletuskivien piirto
 */
function drawDefaultPebbles(ctx) {
  const pebbles = [
    { x: 50, y: 395, r: 8, col: '#a37956' },
    { x: 75, y: 405, r: 6, col: '#8d6343' },
    { x: 260, y: 410, r: 9, col: '#9c6f4a' },
    { x: 480, y: 420, r: 7, col: '#7e5334' },
    { x: 720, y: 400, r: 8, col: '#8d6343' }
  ];
  for (const p of pebbles) {
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Kalojen piirtologaritmi
 */
function drawFish(ctx, key, x, y, color, size, name) {
  ctx.save();
  ctx.translate(x, y);

  // Kalan vartalo (soikio)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pyrstöevä
  ctx.beginPath();
  ctx.moveTo(size * 0.7, 0);
  ctx.lineTo(size * 1.35, -size * 0.55);
  ctx.lineTo(size * 1.2, 0);
  ctx.lineTo(size * 1.35, size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Selkäevä
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.5);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.9, size * 0.5, -size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Silmä
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-size * 0.55, -size * 0.12, Math.max(3, size * 0.16), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-size * 0.6, -size * 0.12, Math.max(1.8, size * 0.08), 0, Math.PI * 2);
  ctx.fill();

  // Nimi tai laji pienenä kalan yläpuolella
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 0, -size * 0.85);

  ctx.restore();
}

/**
 * Sisustuselementtien piirtologaritmi
 */
function drawDecoration(ctx, key, x, y, color, size, name) {
  ctx.save();
  ctx.translate(x, y);

  if (key === 'vesikasvi') {
    // Monihaarainen huojuva vesikasvi
    ctx.strokeStyle = color || '#27ae60';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 7, 0);
      ctx.bezierCurveTo(i * 12 + 15, -size * 0.4, i * 6 - 15, -size * 0.7, i * 15, -size);
      ctx.stroke();
    }
  } else if (key === 'linna') {
    // Ritarilinna
    ctx.fillStyle = color || '#6c5ce7';
    // Keskiosa
    ctx.fillRect(-size * 0.5, -size * 0.7, size, size * 0.7);
    // Vasen torni
    ctx.fillRect(-size * 0.65, -size, size * 0.3, size);
    // Oikea torni
    ctx.fillRect(size * 0.35, -size, size * 0.3, size);
    // Keskiharja
    ctx.fillRect(-size * 0.2, -size * 0.85, size * 0.4, size * 0.2);
    // Oviportti
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -size * 0.3, size * 0.18, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-size * 0.18, -size * 0.3, size * 0.36, size * 0.3);
  } else if (key === 'koralli') {
    // Korallirykelmä
    ctx.fillStyle = color || '#ff758c';
    for (let angle = -0.6; angle <= 0.6; angle += 0.3) {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.roundRect(-8, -size * 0.8, 16, size * 0.8, 8);
      ctx.fill();
      ctx.restore();
    }
  } else if (key === 'hylky') {
    // Puulaivan hylky
    ctx.fillStyle = color || '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, 0);
    ctx.quadraticCurveTo(-size * 0.4, -size * 0.5, size * 0.6, -size * 0.3);
    ctx.lineTo(size * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    // Mastontynkä
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.lineTo(10, -size * 0.8);
    ctx.stroke();
  } else if (key === 'meritorni') {
    // Atlantiksen temppelipylväät
    ctx.fillStyle = color || '#00b894';
    // Jalusta
    ctx.fillRect(-size * 0.5, -12, size, 12);
    // Pylväät
    ctx.fillRect(-size * 0.35, -size * 0.8, 10, size * 0.7);
    ctx.fillRect(-size * 0.05, -size * 0.8, 10, size * 0.7);
    ctx.fillRect(size * 0.25, -size * 0.8, 10, size * 0.7);
    // Katto/arkkitraavi
    ctx.fillRect(-size * 0.45, -size * 0.9, size * 0.9, 14);
  } else {
    // Pikkukivi / yleisesine
    ctx.fillStyle = color || '#828282';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.3, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Koristeen nimi pienenä
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 0, 16);

  ctx.restore();
}

module.exports = {
  drawAquarium
};
