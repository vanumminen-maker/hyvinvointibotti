const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { shopItems } = require('../data/shopItems');

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('⚠️ DATABASE_URL puuttuu ympäristömuuttujista!');
    }
    // Railwayn sisäisessä verkossa (*.railway.internal) tai paikallisesti SSL ei ole käytössä.
    // Vain ulkoiset yhteydet (kuten *.proxy.rlwy.net) vaativat SSL:n.
    const isInternal = !connectionString ||
      connectionString.includes('railway.internal') ||
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isInternal ? false : { rejectUnauthorized: false }
    });

    pool.on('error', (err) => {
      console.error('Odottamaton PostgreSQL-virhe poolissa:', err);
    });
  }
  return pool;
}

/**
 * Alustaa tietokantataulut schema.sql -tiedostosta
 */
async function initDb() {
  const p = getPool();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await p.connect();
  try {
    await client.query(schemaSql);
    console.log('✅ Tietokantataulut alustettu onnistuneesti.');
  } finally {
    client.release();
  }
}

/**
 * Kirjaa käyttäjän hyvinvointiteon
 * Säännöt:
 * - Enintään 1 teko per kategoria per päivä (Helsingin aikaa)
 * - Enintään 5 tekoa per päivä
 */
async function logAction(discordId, username, category, description) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');

    // Tarkistetaan tämän päivän kirjaukset käyttäjältä (Helsinki-aikavyöhyke)
    const checkQuery = `
      SELECT category
      FROM point_logs
      WHERE discord_id = $1
        AND (logged_at AT TIME ZONE 'Europe/Helsinki')::date = (NOW() AT TIME ZONE 'Europe/Helsinki')::date
    `;
    const checkRes = await client.query(checkQuery, [discordId]);
    const loggedToday = checkRes.rows.map(r => r.category);

    if (loggedToday.includes(category)) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'CATEGORY_ALREADY_LOGGED' };
    }

    if (loggedToday.length >= 5) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'DAILY_LIMIT_REACHED' };
    }

    // Lisätään tai päivitetään käyttäjä
    await client.query(`
      INSERT INTO users (discord_id, username, total_points)
      VALUES ($1, $2, 1)
      ON CONFLICT (discord_id)
      DO UPDATE SET
        username = EXCLUDED.username,
        total_points = users.total_points + 1
    `, [discordId, username]);

    // Kirjataan teko lokiin
    await client.query(`
      INSERT INTO point_logs (discord_id, category, description)
      VALUES ($1, $2, $3)
    `, [discordId, category, description.trim()]);

    // Lisätään piste yhteisöpottiin
    await client.query(`
      UPDATE community_pool
      SET total_points = total_points + 1
      WHERE id = 1
    `);

    await client.query('COMMIT');
    return {
      success: true,
      loggedCountToday: loggedToday.length + 1
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Virhe teon kirjaamisessa:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Hakee käyttäjän henkilökohtaiset tilastot (vain itselle näkyvä)
 */
async function getUserStats(discordId) {
  const p = getPool();
  
  // Käyttäjän kokonaispisteet
  const userRes = await p.query(
    'SELECT total_points FROM users WHERE discord_id = $1',
    [discordId]
  );
  const totalPoints = userRes.rows[0]?.total_points || 0;

  // Viikon pisteet (maanantaista lähtien Helsinki-aikaa)
  const weekRes = await p.query(`
    SELECT COUNT(*)::int AS week_points
    FROM point_logs
    WHERE discord_id = $1
      AND (logged_at AT TIME ZONE 'Europe/Helsinki') >= DATE_TRUNC('week', NOW() AT TIME ZONE 'Europe/Helsinki')
  `, [discordId]);
  const weekPoints = weekRes.rows[0]?.week_points || 0;

  // Tänään kirjatut kategoriat
  const todayRes = await p.query(`
    SELECT category
    FROM point_logs
    WHERE discord_id = $1
      AND (logged_at AT TIME ZONE 'Europe/Helsinki')::date = (NOW() AT TIME ZONE 'Europe/Helsinki')::date
  `, [discordId]);
  const categoriesToday = todayRes.rows.map(r => r.category);

  return {
    totalPoints,
    weekPoints,
    categoriesToday
  };
}

/**
 * Hakee yhteisöpotin tilan
 */
async function getCommunityPool() {
  const p = getPool();
  const res = await p.query('SELECT total_points, total_donations FROM community_pool WHERE id = 1');
  if (res.rows.length === 0) {
    return { total_points: 0, total_donations: 0 };
  }
  return res.rows[0];
}

/**
 * Hakee tämän päivän teot koosteeseen (anonyymit kuvaukset kategorioittain)
 */
async function getDailyActions() {
  const p = getPool();
  const res = await p.query(`
    SELECT category, description, logged_at
    FROM point_logs
    WHERE (logged_at AT TIME ZONE 'Europe/Helsinki')::date = (NOW() AT TIME ZONE 'Europe/Helsinki')::date
    ORDER BY logged_at ASC
  `);

  const categoryCounts = {
    liikunta: 0,
    ravitsemus: 0,
    luovuus: 0,
    sosiaaliset: 0,
    lepo: 0
  };

  const grouped = {
    liikunta: [],
    ravitsemus: [],
    luovuus: [],
    sosiaaliset: [],
    lepo: []
  };

  for (const row of res.rows) {
    if (grouped[row.category]) {
      grouped[row.category].push(row.description);
      categoryCounts[row.category]++;
    }
  }

  return {
    totalToday: res.rows.length,
    categoryCounts,
    grouped
  };
}

/**
 * Hakee kuluvan viikon tilastot
 */
async function getWeeklyStats() {
  const p = getPool();
  const res = await p.query(`
    SELECT category, COUNT(*)::int AS count
    FROM point_logs
    WHERE (logged_at AT TIME ZONE 'Europe/Helsinki') >= DATE_TRUNC('week', NOW() AT TIME ZONE 'Europe/Helsinki')
    GROUP BY category
  `);

  const counts = {
    liikunta: 0,
    ravitsemus: 0,
    luovuus: 0,
    sosiaaliset: 0,
    lepo: 0
  };

  let totalWeekly = 0;
  for (const row of res.rows) {
    if (counts[row.category] !== undefined) {
      counts[row.category] = row.count;
      totalWeekly += row.count;
    }
  }

  return {
    totalWeekly,
    counts
  };
}

/**
 * Hakee akvaarion esineet ja kalat
 */
async function getAquariumItems() {
  const p = getPool();
  const res = await p.query(`
    SELECT id, item_key, item_type, item_name, emoji, color, size, pos_x, pos_y, purchased_at
    FROM aquarium_items
    ORDER BY id ASC
  `);
  return res.rows;
}

/**
 * Ylläpito: Osta esine yhteisöpisteillä
 */
async function buyItem(itemKey) {
  const item = shopItems.find(i => i.key.toLowerCase() === itemKey.toLowerCase());
  if (!item) {
    return { success: false, reason: 'ITEM_NOT_FOUND' };
  }

  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');

    const poolRes = await client.query('SELECT total_points FROM community_pool WHERE id = 1 FOR UPDATE');
    const currentPoints = poolRes.rows[0]?.total_points || 0;

    if (currentPoints < item.price) {
      await client.query('ROLLBACK');
      return {
        success: false,
        reason: 'NOT_ENOUGH_POINTS',
        required: item.price,
        current: currentPoints
      };
    }

    // Vähennetään pisteet poolista
    await client.query(`
      UPDATE community_pool
      SET total_points = total_points - $1
      WHERE id = 1
    `, [item.price]);

    if (item.type === 'donation') {
      // Lahjoituksen kirjaus
      await client.query(`
        UPDATE community_pool
        SET total_donations = total_donations + 1
        WHERE id = 1
      `);
      await client.query(`
        INSERT INTO donations_log (item_name, cost)
        VALUES ($1, $2)
      `, [item.name, item.price]);

      await client.query('COMMIT');
      return { success: true, item, isDonation: true };
    }

    // Lasketaan satunnainen sijainti akvaariossa (800x400)
    let posX = Math.floor(Math.random() * 640) + 80;
    let posY;
    if (item.type === 'decoration') {
      // Pohjalle (y = 290 - 340)
      posY = Math.floor(Math.random() * 50) + 290;
    } else {
      // Kalat uivat vedessä (y = 70 - 260)
      posY = Math.floor(Math.random() * 190) + 70;
    }

    const insertRes = await client.query(`
      INSERT INTO aquarium_items (item_key, item_type, item_name, emoji, color, size, pos_x, pos_y)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [item.key, item.type, item.name, item.emoji, item.color, item.size, posX, posY]);

    await client.query('COMMIT');
    return {
      success: true,
      item,
      aquariumItemId: insertRes.rows[0].id,
      isDonation: false
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Virhe ostotapahtumassa:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ylläpito: Myy esine akvaariosta takaisin pisteiksi
 */
async function sellItem(identifier) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');

    // Voidaan etsiä joko suoraan ID:llä tai item_key / item_name mukaan
    let findQuery;
    let findParam;
    if (!isNaN(identifier)) {
      findQuery = 'SELECT * FROM aquarium_items WHERE id = $1 LIMIT 1 FOR UPDATE';
      findParam = parseInt(identifier, 10);
    } else {
      findQuery = `
        SELECT * FROM aquarium_items
        WHERE LOWER(item_key) = LOWER($1) OR LOWER(item_name) LIKE LOWER($2)
        ORDER BY id DESC LIMIT 1 FOR UPDATE
      `;
      findParam = identifier.trim();
    }

    const itemRes = !isNaN(identifier)
      ? await client.query(findQuery, [findParam])
      : await client.query(findQuery, [findParam, `%${findParam}%`]);

    if (itemRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'ITEM_NOT_IN_AQUARIUM' };
    }

    const itemInAquarium = itemRes.rows[0];
    const shopItem = shopItems.find(i => i.key === itemInAquarium.item_key);
    const refund = shopItem ? shopItem.sellPrice : Math.floor(itemInAquarium.size * 5);

    // Poistetaan esine akvaariosta
    await client.query('DELETE FROM aquarium_items WHERE id = $1', [itemInAquarium.id]);

    // Palautetaan pisteet pooliin
    await client.query(`
      UPDATE community_pool
      SET total_points = total_points + $1
      WHERE id = 1
    `, [refund]);

    await client.query('COMMIT');
    return {
      success: true,
      soldItem: itemInAquarium,
      refund
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Virhe myyntitapahtumassa:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getPool,
  initDb,
  logAction,
  getUserStats,
  getCommunityPool,
  getDailyActions,
  getWeeklyStats,
  getAquariumItems,
  buyItem,
  sellItem
};
