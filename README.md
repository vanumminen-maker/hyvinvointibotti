# 🥄 Hyvinvointibotti (Discord)

Discord-hyvinvointibotti yhteisölle, joka kannustaa pieniin arjen hyvinvointitekoihin ilman suorituspaineita. Botti kerää osallistujien pisteet yhteiseen pottiin, jolla ylläpito voi hankkia yhteisölle asukkeja ja koristeita virtuaaliseen akvaarioon sekä saavuttaa oikeita eläinsuojelulahjoitustavoitteita!

---

## ✨ Tärkeimmät ominaisuudet

- **Arjen pienet teot (lusikat):** Jokaisella on käytettävissä 5 lusikkaa päivässä.
- **5 Kategoriaa:**
  - 🏃 **Liikunta** (Jalat)
  - 🥗 **Ravitsemus** (Vartalo)
  - 🎨 **Luovuus** (Oikea käsi)
  - 👥 **Sosiaaliset kontaktit** (Vasen käsi)
  - 😴 **Lepo & palautuminen** (Pää)
- **Rajoitus:** Enintään 1 teko per kategoria per päivä (yhteensä max 5/pv). Estää ylisuorittamisen ja kannustaa monipuolisuuteen.
- **Yksityisyys ja armollisuus:** Henkilökohtaisia pisteitä ei koskaan kuuluteta julkisesti muille — vain yhteinen potti näkyy. Jokainen tekee omalla tasollaan.
- **Päivittäinen "Hyvinvointimies":** Botti piirtää joka ilta klo 21:00 dynaamisen tikkuukon (`canvas`), jonka ruumiinosat kasvavat suhteessa päivän aikana tehtyihin tekoihin, ja listaa päivän anonyymit teot inspiraatioksi!
- **Virtuaalinen Akvaario (`/akvaario`):** Yhteisön pisteillä rakennettava akvaario, joka piirtyy visuaalisena kuvana suoraan Discordiin.
- **Kauppajärjestelmä (`/kauppa`, `/osta`, `/myy`):**
  - 10 erihintaista kalaa (kultakala, neontetra, taistelukala, arowana...)
  - 6 sisustuselementtiä (kivet, kasvit, ritarilinna, puulaivan hylky...)
  - Eläinsuojelulahjoitus ❤️
  - Vain ylläpitorooli voi tehdä ostoja ja myyntejä yhteisön pisteillä.
- **Pienet vinkit (`/ehdota`):** Botti jakaa foorumin ideoita hyvinvointiteoista, jos ideat ovat vähissä.

---

## 🤖 Komennot

| Komento | Kuvaus | Oikeudet |
|---------|--------|----------|
| `/hyvinvointi` | Kirjaa päivän hyvinvointiteko (kategoria + kuvaus) | Kaikki (yksityinen kuittaus) |
| `/pisteet` | Näyttää omat kerätyt lusikat ja päivän tilanteen | Kaikki (vain itselle) |
| `/ehdota [kategoria]` | Antaa esimerkkejä ja ideoita pienistä teoista | Kaikki (vain itselle) |
| `/akvaario` | Tulostaa yhteisön akvaarion nykytilanteen kuvana | Kaikki (julkinen) |
| `/kauppa` | Selaa kalojen, esineiden ja lahjoitusten hinnastoa | Kaikki |
| `/osta <tuote>` | Hankkii kalan, koristeen tai lahjoituksen yhteispisteillä | Vain Ylläpito |
| `/myy <tunnus>` | Myy akvaarion esineen takaisin yhteispisteiksi (~60%) | Vain Ylläpito |

---

## ⏰ Automaattiset ajastukset (Helsinki-aikaa)

1. **Joka ilta klo 21:00:**
   - Lähettää kooste- ja ilmoituskanavalle päivän anonyymin listauksen tehdyistä teoista.
   - Mukana generoitava **Hyvinvointimies** -kaaviokuva ja potin tilanne.
2. **Joka sunnuntai klo 18:00:**
   - Lähettää viikkokoosteen: koko viikon pistesaldo, osa-alueiden jakautuminen ja yhteisöpotin tila.

---

## 🚀 Käyttöönotto Railway-alustalla

Botti on suunniteltu ajettavaksi [Railway.app](https://railway.app/) -pilvipalvelussa.

### 1. Lisää PostgreSQL-tietokanta Railwayhin
1. Mene Railway-projektiisi.
2. Klikkaa **+ New** -> **Database** -> **Add PostgreSQL**.
3. Railway luo tietokannan ja tarjoaa automaattisesti `DATABASE_URL` -muuttujan samaan projektiin.

### 2. Aseta ympäristömuuttujat Railwayhin
Aseta projektisi Settings / Variables -osioon:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_discord_server_id_here
DAILY_CHANNEL_ID=1272505732264362075
WEEKLY_CHANNEL_ID=1272505732264362075
ADMIN_ROLE_NAME=Ylläpito
NODE_ENV=production
```

*(Huom: `DATABASE_URL` tulee automaattisesti Railwayn PostgreSQL-palvelusta, jos liität sen samaan ympäristöön).*

### 3. Rekisteröi Slash-komennot Discordiin
Komentojen rekisteröinti ajetaan kerran (tai aina kun komentojen määrittely muuttuu):

Paikallisesti:
```bash
npm run deploy
```
Tai Railwayn CLI:llä:
```bash
railway run npm run deploy
```

### 4. Käynnistys
Railway havaitsee `nixpacks.toml`-tiedoston ja asentaa automaattisesti tarvittavat järjestelmäkirjastot (`cairo`, `pango`, `libpng`) kuvien piirtoa varten.
Botti alustaa tietokantataulut automaattisesti käynnistyessään!

---

## 💻 Paikallinen kehitys

1. Asenna riippuvuudet:
   ```bash
   npm install
   ```
2. Kopioi `.env.example` nimelle `.env` ja täytä arvot:
   ```bash
   cp .env.example .env
   ```
3. Rekisteröi komennot testipalvelimelle:
   ```bash
   npm run deploy
   ```
4. Käynnistä botti:
   ```bash
   npm start
   ```
