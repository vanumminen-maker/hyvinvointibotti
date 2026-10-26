// Kaupan tuotteet, hinnat ja kertoimet

const shopItems = [
  // 10 Kaloja
  {
    key: "kultakala",
    type: "fish",
    name: "Kultakala",
    emoji: "🐟",
    price: 150,
    sellPrice: 90,
    color: "#ff8c00",
    size: 24,
    description: "Klassinen ja iloinen oranssi kultakala."
  },
  {
    key: "neontetra",
    type: "fish",
    name: "Neontetra",
    emoji: "🐠",
    price: 200,
    sellPrice: 120,
    color: "#00d4ff",
    size: 20,
    description: "Sähkönsinisenä ja punaisena kimaltava pikkukala."
  },
  {
    key: "guppi",
    type: "fish",
    name: "Guppi",
    emoji: "🐟",
    price: 280,
    sellPrice: 170,
    color: "#ff007f",
    size: 22,
    description: "Värikkäällä ja hulmuavalla pyrstöllä varustettu suosikki."
  },
  {
    key: "kirjokala",
    type: "fish",
    name: "Kirjokala",
    emoji: "🐠",
    price: 350,
    sellPrice: 210,
    color: "#39ff14",
    size: 26,
    description: "Monivärinen rauhallinen parvikala."
  },
  {
    key: "taistelukala",
    type: "fish",
    name: "Taistelukala (Betta)",
    emoji: "🐠",
    price: 420,
    sellPrice: 250,
    color: "#9b51e0",
    size: 30,
    description: "Upea pitkäeväinen ja arvokas akvaarion komistus."
  },
  {
    key: "enkelikala",
    type: "fish",
    name: "Enkelikala",
    emoji: "🐠",
    price: 500,
    sellPrice: 300,
    color: "#f2c94c",
    size: 34,
    description: "Korkea ja arvokas hopeankeltainen lehtikala."
  },
  {
    key: "kiekkokala",
    type: "fish",
    name: "Kiekkokala",
    emoji: "🐡",
    price: 600,
    sellPrice: 360,
    color: "#eb5757",
    size: 36,
    description: "Pyöreä ja näyttävä akvaarioiden aatelinen."
  },
  {
    key: "papukaijakala",
    type: "fish",
    name: "Papukaijakala",
    emoji: "🐠",
    price: 700,
    sellPrice: 420,
    color: "#ff5e3a",
    size: 38,
    description: "Eloisa ja hymyilevän näköinen papukaijakirjoahven."
  },
  {
    key: "leijonakala",
    type: "fish",
    name: "Leijonakala",
    emoji: "🐡",
    price: 820,
    sellPrice: 490,
    color: "#bb6bd9",
    size: 40,
    description: "Eksottinen ja mahtipontinen evien levittelijä."
  },
  {
    key: "arowana",
    type: "fish",
    name: "Kultainen Arowana",
    emoji: "🐉",
    price: 1050,
    sellPrice: 630,
    color: "#ffd700",
    size: 46,
    description: "Myyttinen onnen ja vaurauden lohikäärmekala!"
  },

  // 6 Sisustuselementtiä
  {
    key: "pikkukivi",
    type: "decoration",
    name: "Kiiltävä pikkukivi",
    emoji: "🪨",
    price: 80,
    sellPrice: 50,
    color: "#828282",
    size: 26,
    description: "Sileä ja kiva pohjakivi tuomaan tunnelmaa."
  },
  {
    key: "vesikasvi",
    type: "decoration",
    name: "Rehevä vesikasvi",
    emoji: "🌿",
    price: 180,
    sellPrice: 110,
    color: "#27ae60",
    size: 55,
    description: "Kaunis vihreä pohjakasvi, jonka suojassa kalat viihtyvät."
  },
  {
    key: "koralli",
    type: "decoration",
    name: "Vaaleanpunainen koralli",
    emoji: "🪸",
    price: 350,
    sellPrice: 210,
    color: "#ff758c",
    size: 50,
    description: "Värikäs merellinen korallimuodostelma pohjalle."
  },
  {
    key: "linna",
    type: "decoration",
    name: "Ritarilinna",
    emoji: "🏰",
    price: 525,
    sellPrice: 315,
    color: "#6c5ce7",
    size: 70,
    description: "Klassinen linnoitus torneineen akvaarion keskipisteeksi!"
  },
  {
    key: "hylky",
    type: "decoration",
    name: "Merirosvolaivan hylky",
    emoji: "⛵",
    price: 680,
    sellPrice: 410,
    color: "#8d6e63",
    size: 65,
    description: "Salaperäinen vanhan purjelaivan puuhylky pohjamutiin."
  },
  {
    key: "meritorni",
    type: "decoration",
    name: "Muinainen Atlantiksen torni",
    emoji: "🏛️",
    price: 900,
    sellPrice: 540,
    color: "#00b894",
    size: 75,
    description: "Majesteettinen vedenalainen pylväikkö ja temppelitorni."
  },

  // 1 Lahjoitus (hyväntekeväisyys)
  {
    key: "lahjoitus_elainsuojelu",
    type: "donation",
    name: "Lahjoitus Eläinsuojeluyhdistykselle ❤️",
    emoji: "🐾",
    price: 840,
    sellPrice: 0,
    color: "#e84393",
    size: 0,
    description: "Yhteisön yhteinen lahjoitustavoite paikalliselle eläinsuojelutyölle!"
  }
];

module.exports = {
  shopItems
};
