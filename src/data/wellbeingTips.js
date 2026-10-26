// Hyvinvointivinkit foorumilta ja yhteisön ideoista kategorioittain

const wellbeingTips = {
  liikunta: [
    "Käy ulkona kävelemässä, vaikka vain korttelin ympäri tai lähikauppaan.",
    "Tee 10 kyykkyä tai punnerrusta (esim. ruoan kiehumista odotellessa).",
    "Pieni venyttely- tai joogahetki (5–10 min).",
    "Tanssi lempikappaleesi tahtiin olohuoneessa.",
    "Käytä portaita hissin sijaan.",
    "Käy hetki luonnossa tai puistossa haistelemassa raitista ilmaa.",
    "Tee kevyt taukojumppa tai hartioiden pyörittely työn/opiskelun lomassa.",
    "Pyöräile tai kävele osa matkasta töihin tai harrastuksiin.",
    "Tee tasapainoharjoitus: seiso yhdellä jalalla hampaita pestessäsi."
  ],
  ravitsemus: [
    "Juo iso lasillinen raikasta vettä.",
    "Syö terveellinen välipala, kuten omena, banaani, kourallinen pähkinöitä tai porkkana.",
    "Tee ruokaa isompi satsi ja laita osa pakkaseen tulevia päiviä varten.",
    "Kokeile uutta kasvisruokareseptiä tai lisää lautaselle värikkäitä kasviksia.",
    "Syö ateria rauhassa ilman puhelinta tai näyttöä.",
    "Hauduta kuppi lämmintä teetä tai yrttijuomaa.",
    "Syö kunnollinen aamupala jaksamisen tueksi.",
    "Muista syödä säännöllisesti pitkin päivää verensokerin pitämiseksi tasaisena."
  ],
  luovuus: [
    "Piirrä, luonnostele tai väritä jotain 10 minuutin ajan.",
    "Kirjoita muutama ajatus tai päiväkirjamerkintä päivästäsi.",
    "Kuuntele lempialbumiasi tai etsi uutta inspiroivaa musiikkia.",
    "Kokeile käsityötä: neulo, virkkaa, askartele tai puuhaile käsilläsi.",
    "Ota valokuva jostakin kauniista tai mielenkiintoisesta yksityiskohdasta.",
    "Lue luku kiinnostavasta kirjasta tai sarjakuvasta.",
    "Soita soitinta tai kokeile tehdä omaa musiikkia.",
    "Keksi uusi luova idea tai kirjoita runonpätkä."
  ],
  sosiaaliset: [
    "Laita viesti ystävälle tai läheiselle ja kysy, mitä kuuluu.",
    "Sano ystävällinen sana tai kehu jollekulle (livenä tai verkossa).",
    "Soita lyhyt puhelu sukulaiselle tai tuttavalle.",
    "Osallistu yhteisön keskusteluun Discordissa tai foorumilla hyvässä hengessä.",
    "Vietä yhteistä aikaa perheen, kumppanin tai ystävän kanssa ilman häiriötekijöitä.",
    "Hymyile vastaantulijalle tai tervehdi naapuria.",
    "Pelaa hetki moninpeliä kaveriporukan kanssa."
  ],
  lepo: [
    "Ota 15–20 minuutin tehopäikkärit tai lepää silmiä rauhassa.",
    "Tee 5 minuutin syvähengitysharjoitus (esim. 4 sekuntia sisään, 4 pidätys, 4 ulos).",
    "Laita puhelin ja ruudut pois 30 minuuttia ennen nukkumaanmenoa.",
    "Mene tänään nukkumaan 30 minuuttia normaalia aiemmin.",
    "Käy lämpimässä suihkussa tai saunassa rentoutumassa.",
    "Istu vain hiljaa 5 minuuttia ilman suorittamista tai ärsykkeitä.",
    "Salli itsellesi laiskotteluhetki ilman huonoa omaatuntoa.",
    "Kuuntele rentouttavia luonnonääniä tai unimusiikkia."
  ]
};

const categoryNames = {
  liikunta: "🏃 Liikunta",
  ravitsemus: "🥗 Ravitsemus",
  luovuus: "🎨 Luovuus",
  sosiaaliset: "👥 Sosiaaliset kontaktit",
  lepo: "😴 Lepo & palautuminen"
};

module.exports = {
  wellbeingTips,
  categoryNames
};
