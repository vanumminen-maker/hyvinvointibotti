// Kaupan tuotteet, hinnat ja kertoimet

const shopItems = [
  // 10 Kaloja (myyntihinta 90% ostohinnasta)
  {
    key: "kultakala",
    type: "fish",
    name: "Kultakala",
    emoji: "🐟",
    price: 150,
    sellPrice: 135,
    color: "#ff8c00",
    size: 24,
    description: "Iloinen oranssi uimari tuomaan levollista tunnelmaa ja hyvää onnea jokaisen yhteisön jäsenen arkeen."
  },
  {
    key: "neontetra",
    type: "fish",
    name: "Neontetra",
    emoji: "🐠",
    price: 200,
    sellPrice: 180,
    color: "#00d4ff",
    size: 20,
    description: "Pimeässä kimmeltävä valopilkku muistuttamaan toivosta ja tuomaan valoa heille, joilla on tänään harmaampi päivä."
  },
  {
    key: "guppi",
    type: "fish",
    name: "Guppi",
    emoji: "🐟",
    price: 280,
    sellPrice: 252,
    color: "#ff007f",
    size: 22,
    description: "Värikäs ja eloisa pyrstönheiluttaja tuomaan piristystä, hymyä ja kepeyttä silloin kun mieli tuntuu raskaalta."
  },
  {
    key: "kirjokala",
    type: "fish",
    name: "Kirjokala",
    emoji: "🐠",
    price: 350,
    sellPrice: 315,
    color: "#39ff14",
    size: 26,
    description: "Rauhallinen parvikala muistuttamaan yhteenkuuluvuudesta – kenenkään meistä ei tarvitse uida vastavirtaan yksin."
  },
  {
    key: "taistelukala",
    type: "fish",
    name: "Taistelukala (Betta)",
    emoji: "🐠",
    price: 420,
    sellPrice: 378,
    color: "#9b51e0",
    size: 30,
    description: "Uljas ja arvokas komistus tuomaan sisua, voimia ja hiljaista kestävyyttä kaikille, jotka tällä hetkellä käyvät omia taisteluitaan."
  },
  {
    key: "enkelikala",
    type: "fish",
    name: "Enkelikala",
    emoji: "🐠",
    price: 500,
    sellPrice: 450,
    color: "#f2c94c",
    size: 34,
    description: "Majesteettinen ja lempeä lehtikala tuomaan turvaa, levollisia ajatuksia ja suojelusta yhteisölle."
  },
  {
    key: "kiekkokala",
    type: "fish",
    name: "Kiekkokala",
    emoji: "🐡",
    price: 600,
    sellPrice: 540,
    color: "#eb5757",
    size: 36,
    description: "Pyöreä ja tyyni akvaarion aatelinen tuomaan harmoniaa, vakautta ja rauhoittumista kiireen keskelle."
  },
  {
    key: "papukaijakala",
    type: "fish",
    name: "Papukaijakala",
    emoji: "🐠",
    price: 700,
    sellPrice: 630,
    color: "#ff5e3a",
    size: 38,
    description: "Aina hymyilevän näköinen veijari muistuttamaan armollisuudesta itseä kohtaan ja tuomaan yhteisöön lämmintä naurua."
  },
  {
    key: "leijonakala",
    type: "fish",
    name: "Leijonakala",
    emoji: "🐡",
    price: 820,
    sellPrice: 738,
    color: "#bb6bd9",
    size: 40,
    description: "Rohkea ja näyttävä evien levittelijä tuomaan itsevarmuutta ja rohkeutta asettaa omat rajat ja levätä."
  },
  {
    key: "arowana",
    type: "fish",
    name: "Kultainen Arowana",
    emoji: "🐉",
    price: 1050,
    sellPrice: 945,
    color: "#ffd700",
    size: 46,
    description: "Myyttinen onnenkala tuomaan runsautta, jaksamisen ihmeitä ja syvää elämänvoimaa koko yhteisön tulevaisuuteen."
  },

  // 6 Sisustuselementtiä (myyntihinta 90% ostohinnasta)
  {
    key: "pikkukivi",
    type: "decoration",
    name: "Kiiltävä pikkukivi",
    emoji: "🪨",
    price: 80,
    sellPrice: 72,
    color: "#828282",
    size: 26,
    description: "Pohjassa tukevasti lepäävä kivi tuomaan maadoittumista, vakautta ja muistutuksen siitä, että pienilläkin asioilla on suuri merkitys."
  },
  {
    key: "vesikasvi",
    type: "decoration",
    name: "Rehevä vesikasvi",
    emoji: "🌿",
    price: 180,
    sellPrice: 162,
    color: "#27ae60",
    size: 55,
    description: "Vehreä suojapaikka tuomaan hengähdysrauhaa ja pehmeää turvasatamaa kaikille, jotka kaipaavat hetken omaa tilaa palautua."
  },
  {
    key: "koralli",
    type: "decoration",
    name: "Vaaleanpunainen koralli",
    emoji: "🪸",
    price: 350,
    sellPrice: 315,
    color: "#ff758c",
    size: 50,
    description: "Kauniisti kukoistava koralli tuomaan elinvoimaa, luovuuden iloa ja väriä yhteisön päiviin."
  },
  {
    key: "linna",
    type: "decoration",
    name: "Ritarilinna",
    emoji: "🏰",
    price: 525,
    sellPrice: 472,
    color: "#6c5ce7",
    size: 70,
    description: "Vankka linnake muistuttamaan yhteisön murtumattomasta tuesta: täällä jokainen on turvassa ja hyväksytty omana itsenään."
  },
  {
    key: "hylky",
    type: "decoration",
    name: "Merirosvolaivan hylky",
    emoji: "⛵",
    price: 680,
    sellPrice: 612,
    color: "#8d6e63",
    size: 65,
    description: "Salaperäinen vanha puuhylky tuomaan lohtua ja muistuttamaan, että elämän karikoista huolimatta voi aina rakentaa jotain uutta ja kaunista."
  },
  {
    key: "meritorni",
    type: "decoration",
    name: "Muinainen Atlantiksen torni",
    emoji: "🏛️",
    price: 900,
    sellPrice: 810,
    color: "#00b894",
    size: 75,
    description: "Ajaton vedenalainen pylväikkö tuomaan viisautta, perspektiiviä ja rauhaa hyväksyä asiat, joihin emme voi vaikuttaa."
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
    description: "Yhteisömme yhteinen rakkauden ja huolenpidon teko tuomaan turvaa, ruokaa ja lämpöä niille puolustuskyvyttömille eläinystäville, jotka tarvitsevat ihmisen apua."
  }
];

module.exports = {
  shopItems
};
