const { createCanvas, registerFont } = require('canvas');
const path = require('path');

// Rekisteröidään DejaVu-fontit
let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  try {
    const regularPath = path.join(__dirname, '../assets/fonts/DejaVuSans.ttf');
    const boldPath = path.join(__dirname, '../assets/fonts/DejaVuSans-Bold.ttf');
    registerFont(regularPath, { family: 'DejaVuSans' });
    registerFont(boldPath, { family: 'DejaVuSans', weight: 'bold' });
    fontsRegistered = true;
  } catch (err) {
    console.warn('Fontin rekisteröinti epäonnistui:', err.message);
  }
}

/**
 * Piirtää "Hyvinvointimies" -kaavion canvasilla.
 * Ruumiinosat skaalautuvat päivän kategorioiden pistemäärien mukaan:
 * - Pää = Lepo & palautuminen (violetti)
 * - Vartalo = Ravitsemus (vihreä)
 * - Vasen käsi = Sosiaaliset kontaktit (keltainen/oranssi)
 * - Oikea käsi = Luovuus (pinkki)
 * - Jalat = Liikunta (syaani)
 *
 * @param {Object} categoryCounts { liikunta, ravitsemus, luovuus, sosiaaliset, lepo }
 * @param {number} totalToday Päivän kokonaispisteet
 * @param {string} dateStr Päivämäärämerkkijono
 * @returns {Buffer} PNG-kuvapuskuri
 */
function drawHyvinvointimies(categoryCounts, totalToday = 0, dateStr = '') {
  ensureFonts();

  const width = 800;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Tausta (pehmeä tummansininen / liuskekivi gradientti)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1a1c29');
  bgGrad.addColorStop(1, '#0e1017');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Koristekehys
  ctx.strokeStyle = '#2d3250';
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Otsikko
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "DejaVuSans", sans-serif';
  ctx.fillText('PÄIVÄN HYVINVOINTIMIES', 40, 55);

  ctx.fillStyle = '#9aa0a6';
  ctx.font = '15px "DejaVuSans", sans-serif';
  const subtitle = dateStr ? `${dateStr} • Yhteensä ${totalToday} tekoa` : `Yhteensä ${totalToday} tekoa tänään`;
  ctx.fillText(subtitle, 40, 82);

  // Lasketaan suhteelliset kertoimet (0 ... 1)
  const maxCategory = Math.max(
    1,
    categoryCounts.liikunta || 0,
    categoryCounts.ravitsemus || 0,
    categoryCounts.luovuus || 0,
    categoryCounts.sosiaaliset || 0,
    categoryCounts.lepo || 0
  );

  const scale = (val) => {
    const v = val || 0;
    return Math.min(1.8, Math.max(0.4, 0.5 + (v / maxCategory) * 0.9));
  };

  const scaleLepo = scale(categoryCounts.lepo);
  const scaleRavitsemus = scale(categoryCounts.ravitsemus);
  const scaleSosiaaliset = scale(categoryCounts.sosiaaliset);
  const scaleLuovuus = scale(categoryCounts.luovuus);
  const scaleLiikunta = scale(categoryCounts.liikunta);

  // Hahmon keskipiste vasemmalla
  const manX = 220;
  const manY = 280;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. JALAT (Liikunta) - Sininen/Syaani (#00cec9)
  const legWidth = Math.round(12 * scaleLiikunta);
  ctx.strokeStyle = '#00cec9';
  ctx.lineWidth = legWidth;

  // Vasen jalka
  ctx.beginPath();
  ctx.moveTo(manX - 16, manY + 60);
  ctx.lineTo(manX - 38 * scaleLiikunta, manY + 150);
  ctx.stroke();

  // Oikea jalka
  ctx.beginPath();
  ctx.moveTo(manX + 16, manY + 60);
  ctx.lineTo(manX + 38 * scaleLiikunta, manY + 150);
  ctx.stroke();

  // 2. KROPPA / VARTALO (Ravitsemus) - Vihreä (#2ecc71)
  const torsoWidth = Math.round(24 * scaleRavitsemus);
  ctx.fillStyle = '#2ecc71';
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 3;

  const torsoHeight = 90;
  const torsoTop = manY - 30;
  ctx.beginPath();
  const r = torsoWidth / 2;
  const left = manX - r;
  const top = torsoTop;
  const w = torsoWidth;
  const h = torsoHeight;
  ctx.roundRect(left, top, w, h, 16);
  ctx.fill();
  ctx.stroke();

  // 3. VASEN KÄSI (Sosiaaliset kontaktit) - Keltainen (#f1c40f)
  const armLeftWidth = Math.round(10 * scaleSosiaaliset);
  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = armLeftWidth;
  ctx.beginPath();
  ctx.moveTo(manX - torsoWidth / 2, manY - 10);
  ctx.lineTo(manX - 55 * scaleSosiaaliset, manY - 10);
  ctx.lineTo(manX - 75 * scaleSosiaaliset, manY - 60 * scaleSosiaaliset);
  ctx.stroke();

  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.arc(manX - 75 * scaleSosiaaliset, manY - 60 * scaleSosiaaliset, armLeftWidth / 2 + 4, 0, Math.PI * 2);
  ctx.fill();

  // 4. OIKEA KÄSI (Luovuus) - Pinkki/Violetti (#fd79a8)
  const armRightWidth = Math.round(10 * scaleLuovuus);
  ctx.strokeStyle = '#fd79a8';
  ctx.lineWidth = armRightWidth;
  ctx.beginPath();
  ctx.moveTo(manX + torsoWidth / 2, manY - 10);
  ctx.lineTo(manX + 55 * scaleLuovuus, manY + 10);
  ctx.lineTo(manX + 80 * scaleLuovuus, manY - 35 * scaleLuovuus);
  ctx.stroke();

  ctx.fillStyle = '#e84393';
  ctx.beginPath();
  ctx.arc(manX + 80 * scaleLuovuus, manY - 35 * scaleLuovuus, armRightWidth / 2 + 5, 0, Math.PI * 2);
  ctx.fill();

  // 5. PÄÄ (Lepo & palautuminen) - Pehmeä violetti (#a29bfe)
  const headRadius = Math.round(30 * scaleLepo);
  const headY = torsoTop - headRadius - 8;
  ctx.fillStyle = '#a29bfe';
  ctx.beginPath();
  ctx.arc(manX, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Kasvot: rentoutunut hymy ja suljetut silmät (lepo)
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(manX - 10 * scaleLepo, headY - 4 * scaleLepo, 6 * scaleLepo, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(manX + 10 * scaleLepo, headY - 4 * scaleLepo, 6 * scaleLepo, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(manX, headY + 5 * scaleLepo, 12 * scaleLepo, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Oikea puoli: Tilastot ja selitteet
  const rightX = 430;
  let barY = 130;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px "DejaVuSans", sans-serif';
  ctx.fillText('PÄIVÄN JAKAUTUMINEN', rightX, barY);
  barY += 35;

  const categories = [
    { key: 'lepo', name: 'Lepo & palautuminen (Pää)', color: '#a29bfe', count: categoryCounts.lepo || 0 },
    { key: 'ravitsemus', name: 'Ravitsemus (Vartalo)', color: '#2ecc71', count: categoryCounts.ravitsemus || 0 },
    { key: 'sosiaaliset', name: 'Sosiaaliset kontaktit (Vasen käsi)', color: '#f1c40f', count: categoryCounts.sosiaaliset || 0 },
    { key: 'luovuus', name: 'Luovuus (Oikea käsi)', color: '#fd79a8', count: categoryCounts.luovuus || 0 },
    { key: 'liikunta', name: 'Liikunta (Jalat)', color: '#00cec9', count: categoryCounts.liikunta || 0 }
  ];

  const barMaxWidth = 230;

  for (const cat of categories) {
    // Nimiteksti
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px "DejaVuSans", sans-serif';
    ctx.fillText(cat.name, rightX, barY);

    // Lukumäärä oikeaan reunaan
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "DejaVuSans", sans-serif';
    ctx.fillText(`${cat.count} kpl`, rightX + barMaxWidth + 65, barY);

    barY += 8;

    // Palkin tausta
    ctx.fillStyle = '#262a3d';
    ctx.beginPath();
    ctx.roundRect(rightX, barY, barMaxWidth, 12, 6);
    ctx.fill();

    // Palkin täyttö
    const barWidth = totalToday > 0 ? Math.max(8, Math.round((cat.count / totalToday) * barMaxWidth)) : 0;
    if (barWidth > 0) {
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      ctx.roundRect(rightX, barY, barWidth, 12, 6);
      ctx.fill();
    }

    barY += 34;
  }

  // Alareunan tsemppilause
  ctx.fillStyle = '#718096';
  ctx.font = 'italic 13px "DejaVuSans", sans-serif';
  ctx.fillText('Jokainen pienikin teko vie yhteisöä eteenpäin!', 40, height - 35);

  return canvas.toBuffer('image/png');
}

module.exports = {
  drawHyvinvointimies
};
