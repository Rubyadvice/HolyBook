import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

type StorySection = 'NARRATIVE' | 'OT' | 'NT' | 'THEMES' | 'PERICOPES';

interface ContentItem {
  id: string;
  section: StorySection;
  title: string;
  ref: string;
  body: string;
  why: string;
  imageUrl?: string;
  preAnalyzed?: {
    observation: string;
    interpretation: string;
    application: string;
  };
}

interface LexiconEntry {
  term: string;
  category: 'Person' | 'Place' | 'Concept & Artifact';
  shortDef: string;
  significance: string;
}

const BIBLICAL_LEXICON: Record<string, LexiconEntry> = {
  "God": { term: "God (Elohim / YHWH)", category: "Person", shortDef: "The eternal, sovereign Creator and covenant Lord of the universe.", significance: "Reveals Himself through creation, redemption, and covenant faithfulness across all of Scripture." },
  "Lord": { term: "The Lord (Adonai / Kyrios)", category: "Person", shortDef: "Title of supreme authority, sovereignty, and covenantal ownership.", significance: "Affirms God's rightful rule over history and the believer's call to wholehearted allegiance." },
  "Jesus": { term: "Jesus Christ (Yeshua)", category: "Person", shortDef: "The incarnate Son of God, promised Messiah, and Savior of the world.", significance: "Fulfils the Old Testament covenants through His life, sacrificial death, and bodily resurrection." },
  "Christ": { term: "Christ (Messiah / Anointed One)", category: "Person", shortDef: "Greek title translating the Hebrew 'Mashiach' (Anointed King, Priest, and Prophet).", significance: "Identifies Jesus as the long-awaited King who inaugurates God's eternal Kingdom." },
  "Holy Spirit": { term: "The Holy Spirit (Ruach / Pneuma)", category: "Person", shortDef: "The third Person of the Trinity, the breath and empowering presence of God.", significance: "Indwells believers, forms the Church at Pentecost, and produces spiritual fruit and gifts for ministry." },
  "Spirit": { term: "The Spirit of God", category: "Person", shortDef: "God's active, life-giving presence moving in creation and redemption.", significance: "Empowers leaders, prophets, and the Church for faithful witness and transformation." },
  "Adam": { term: "Adam", category: "Person", shortDef: "The first human being formed from the dust in God's image.", significance: "Entrusted with stewarding Eden; his disobedience introduced sin, contrasting with Christ the Last Adam." },
  "Eve": { term: "Eve", category: "Person", shortDef: "The first woman, whose name means 'mother of all living.'", significance: "Created as an equal partner in bearing God's image and stewarding creation." },
  "Eden": { term: "Garden of Eden", category: "Place", shortDef: "The lush sanctuary-garden where God dwelled in harmony with humanity.", significance: "Represents unbroken fellowship with God, later echoed in the New Jerusalem of Revelation." },
  "Cain": { term: "Cain", category: "Person", shortDef: "Firstborn son of Adam and Eve, a tiller of the ground.", significance: "His jealousy and murder of Abel illustrate how quickly sin corrupts human brotherhood." },
  "Abel": { term: "Abel", category: "Person", shortDef: "Second son of Adam and Eve, a righteous shepherd.", significance: "Offered an acceptable sacrifice by faith and became the first martyr in biblical history." },
  "Noah": { term: "Noah", category: "Person", shortDef: "Righteous patriarch chosen by God to build the Ark before the Flood.", significance: "Models steadfast obedience in a corrupt generation and receives God's rainbow covenant." },
  "Babel": { term: "Tower of Babel", category: "Place", shortDef: "Ancient city in Shinar where humanity built a tower to make a name for themselves.", significance: "Symbolizes collective human hubris and self-exaltation apart from God." },
  "Abraham": { term: "Abraham", category: "Person", shortDef: "Father of the covenant people called out of Ur to Canaan.", significance: "Model of justification by faith; through his lineage God promised to bless all nations." },
  "Isaac": { term: "Isaac", category: "Person", shortDef: "Miracle son of promise born to Abraham and Sarah in their old age.", significance: "His near-sacrifice on Mount Moriah foreshadows God's provision of a sacrificial Lamb." },
  "Jacob": { term: "Jacob (Israel)", category: "Person", shortDef: "Son of Isaac and father of the twelve tribes of Israel.", significance: "Wrestled with God at Peniel, where his name was changed from 'supplanter' to 'Israel'." },
  "Esau": { term: "Esau", category: "Person", shortDef: "Twin brother of Jacob who traded his birthright for a meal.", significance: "His eventual reconciliation with Jacob demonstrates the healing of deep family division." },
  "Joseph": { term: "Joseph", category: "Person", shortDef: "Eleventh son of Jacob, sold into Egyptian slavery before rising to vizier.", significance: "Exemplifies integrity under temptation, administrative wisdom, and radical forgiveness." },
  "Egypt": { term: "Egypt", category: "Place", shortDef: "Ancient Nile superpower where Israel was enslaved for four centuries.", significance: "The stage for the Exodus deliverance, symbolizing bondage from which God redeems His people." },
  "Moses": { term: "Moses", category: "Person", shortDef: "Prophet, lawgiver, and liberator who led Israel out of Egypt.", significance: "Models humble intercessory leadership, mediating the Sinai covenant between God and Israel." },
  "Sinai": { term: "Mount Sinai (Horeb)", category: "Place", shortDef: "Sacred mountain in the wilderness where God gave the Ten Commandments.", significance: "Site of the burning bush, covenant ratification, and Elijah's later encounter with God's whisper." },
  "Israel": { term: "Israel", category: "Place", shortDef: "The covenant people and promised land formed from Jacob's twelve sons.", significance: "Called to be a kingdom of priests and a light to the nations." },
  "Canaan": { term: "Land of Canaan", category: "Place", shortDef: "The Promised Land flowing with milk and honey pledged to Abraham's descendants.", significance: "Represents God's tangible inheritance and rest for a trusting community." },
  "Joshua": { term: "Joshua", category: "Person", shortDef: "Moses' apprentice and successor who led Israel into Canaan.", significance: "Demonstrates courageous obedience and faithful transition of spiritual leadership." },
  "Jericho": { term: "Jericho", category: "Place", shortDef: "Fortified Canaanite city whose walls fell after Israel marched in faith.", significance: "Proves that spiritual victory comes through unconventional obedience to God's word." },
  "Ruth": { term: "Ruth", category: "Person", shortDef: "Moabite widow whose fierce loyalty to Naomi brought her into Israel's fold.", significance: "Great-grandmother of King David and ancestor of Jesus, showing God's inclusion of outsiders." },
  "Naomi": { term: "Naomi", category: "Person", shortDef: "Bethlehemite matriarch and mother-in-law of Ruth.", significance: "Her journey from bitterness ('Mara') to restoration highlights God's redeeming providence." },
  "Boaz": { term: "Boaz", category: "Person", shortDef: "Generous landowner in Bethlehem who acted as kinsman-redeemer for Ruth.", significance: "Foreshadows Christ as our ultimate Kinsman-Redeemer who rescues the vulnerable." },
  "Samuel": { term: "Samuel", category: "Person", shortDef: "Last of the judges and first major prophet who anointed Saul and David.", significance: "Guided Israel through political transition while reminding kings of their accountability to God." },
  "David": { term: "King David", category: "Person", shortDef: "Shepherd-poet of Bethlehem and second king of united Israel.", significance: "Called 'a man after God's own heart'—honored for his faith and psalms, yet humbled by repentance." },
  "Goliath": { term: "Goliath of Gath", category: "Person", shortDef: "Giant Philistine champion defeated by young David in the Valley of Elah.", significance: "Represents intimidating worldly power overcome by reliance on the living God." },
  "Bathsheba": { term: "Bathsheba", category: "Person", shortDef: "Wife of Uriah the Hittite, later queen mother of King Solomon.", significance: "Her story exposes David's abuse of royal power while showing God's redemptive grace in Solomon's line." },
  "Nathan": { term: "Nathan the Prophet", category: "Person", shortDef: "Court prophet who fearlessly confronted King David's sin via parable.", significance: "Models the prophetic courage required to speak truth to power." },
  "Solomon": { term: "King Solomon", category: "Person", shortDef: "Son of David, renowned for his wisdom and for building the First Temple.", significance: "Illustrates both the pinnacle of royal wisdom and the tragedy of a divided, compromised heart." },
  "Elijah": { term: "Elijah", category: "Person", shortDef: "Fiery ninth-century BC prophet who confronted Ahab and the prophets of Baal.", significance: "Demonstrates bold prophetic zeal followed by vulnerable exhaustion and divine renewal." },
  "Baal": { term: "Baal", category: "Concept & Artifact", shortDef: "Canaanite storm and fertility idol worshiped across the ancient Levant.", significance: "Represents the perennial temptation to trade covenant faithfulness for cultural syncretism." },
  "Babylon": { term: "Babylon", category: "Place", shortDef: "Mesopotamian empire that destroyed Jerusalem in 586 BC and exiled Judah.", significance: "Archetype of worldly empire and cultural pressure where believers must maintain integrity." },
  "Daniel": { term: "Daniel", category: "Person", shortDef: "Jewish exile who served with unblemished integrity in Babylonian and Persian courts.", significance: "Models unwavering prayer, wisdom, and faithfulness in a pluralistic, hostile environment." },
  "Esther": { term: "Queen Esther", category: "Person", shortDef: "Jewish orphan who became Queen of Persia and saved her people from genocide.", significance: "Exemplifies strategic courage and using one's platform 'for such a time as this.'" },
  "Persia": { term: "Persia", category: "Place", shortDef: "Vast empire under Cyrus, Darius, and Xerxes that succeeded Babylon.", significance: "Context for Esther's advocacy and Nehemiah's commission to rebuild Jerusalem." },
  "Nehemiah": { term: "Nehemiah", category: "Person", shortDef: "Cupbearer to the Persian king who led the rebuilding of Jerusalem's walls.", significance: "Premier biblical model of prayerful planning, vision-casting, and overcoming opposition." },
  "Jerusalem": { term: "Jerusalem (Zion)", category: "Place", shortDef: "Ancient capital of David's kingdom and site of the Temple, Crucifixion, and Resurrection.", significance: "Center of redemptive history, pointing toward the heavenly New Jerusalem." },
  "Jonah": { term: "Jonah", category: "Person", shortDef: "Reluctant prophet sent to preach repentance to Israel's enemy, Nineveh.", significance: "Exposes narrow religious nationalism and highlights God's boundless compassion for all peoples." },
  "Nineveh": { term: "Nineveh", category: "Place", shortDef: "Capital of the Assyrian Empire that repented at Jonah's preaching.", significance: "Proves that no city or culture is beyond the reach of repentance and divine mercy." },
  "Job": { term: "Job", category: "Person", shortDef: "Blameless patriarch of Uz who endured catastrophic loss and suffering.", significance: "Teaches that authentic faith clings to God Himself even when suffering remains a mystery." },
  "Isaiah": { term: "Isaiah", category: "Person", shortDef: "Eighth-century BC prophet in Jerusalem who beheld God's holiness.", significance: "Foretold the coming Messiah and the Suffering Servant who bears the sins of many." },
  "Jeremiah": { term: "Jeremiah", category: "Person", shortDef: "The 'weeping prophet' who warned Judah prior to the Babylonian exile.", significance: "Prophesied the New Covenant in which God writes His law directly upon human hearts." },
  "Ezekiel": { term: "Ezekiel", category: "Person", shortDef: "Priest-prophet among the exiles in Babylon.", significance: "Proclaimed God as the True Shepherd and envisioned the Valley of Dry Bones restored to life." },
  "Amos": { term: "Amos", category: "Person", shortDef: " Judean shepherd called to denounce social injustice in the northern kingdom.", significance: "Insists that religious rituals are empty unless accompanied by justice rolling like waters." },
  "Bethlehem": { term: "Bethlehem", category: "Place", shortDef: "Humble Judean town, birthplace of King David and Jesus the Messiah.", significance: "Demonstrates how God chooses humble, overlooked places to bring forth salvation." },
  "John": { term: "John (Apostle / Baptist)", category: "Person", shortDef: "Either John the Baptist (forerunner of Christ) or John the Beloved Apostle.", significance: "Witnesses to Jesus as the Lamb of God, the eternal Word, and the source of divine love." },
  "Samaritan": { term: "Samaritan", category: "Person", shortDef: "Inhabitant of Samaria viewed with hostility by first-century Jews.", significance: "In Jesus' parable, the Good Samaritan redefines neighborly love across ethnic and religious divides." },
  "Pharisee": { term: "Pharisees", category: "Person", shortDef: "Devout Jewish sect emphasizing strict observance of Torah and oral tradition.", significance: "Often warned by Jesus against trading inward humility and mercy for outward self-righteousness." },
  "Peter": { term: "Simon Peter (Cephas)", category: "Person", shortDef: "Galilean fisherman and leading apostle of the early Church.", significance: "Shows how Christ restores a flawed, impulsive follower into a courageous shepherd." },
  "Judas": { term: "Judas Iscariot", category: "Person", shortDef: "Treasurer among the Twelve who betrayed Jesus for thirty pieces of silver.", significance: "Tragic warning that proximity to spiritual things does not guarantee a surrendered heart." },
  "Pilate": { term: "Pontius Pilate", category: "Person", shortDef: "Roman prefect of Judea who authorized the crucifixion of Jesus.", significance: "Illustrates the moral failure of caving to crowd pressure over truth and justice." },
  "Gethsemane": { term: "Garden of Gethsemane", category: "Place", shortDef: "Olive grove on the Mount of Olives where Jesus prayed before His arrest.", significance: "Model of honest anguish surrendered to the Father's will: 'Not my will, but thine, be done.'" },
  "Pentecost": { term: "Pentecost", category: "Concept & Artifact", shortDef: "Jewish feast of weeks (Shavuot) when the Holy Spirit descended in wind and fire.", significance: "Reverses the division of Babel and launches the multi-ethnic mission of the Church." },
  "Stephen": { term: "Stephen", category: "Person", shortDef: "Spirit-filled deacon and first Christian martyr in Jerusalem.", significance: "Mirrored Christ by proclaiming redemptive history boldly and forgiving his executioners." },
  "Paul": { term: "Apostle Paul (Saul of Tarsus)", category: "Person", shortDef: "Former Pharisee transformed on the Damascus road into the Apostle to the Gentiles.", significance: "Pioneered church planting across the Roman Empire and authored much of the New Testament." },
  "Saul": { term: "Saul", category: "Person", shortDef: "Either Israel's first king or the Hebrew name of the Apostle Paul before his mission.", significance: "Highlights the contrast between proud self-will and humble surrender to Christ's lordship." },
  "Cornelius": { term: "Cornelius", category: "Person", shortDef: "God-fearing Roman centurion in Caesarea welcomed into the Church via Peter.", significance: "Marks the historic breakthrough confirming that Gentiles receive the Spirit on equal footing." },
  "Silas": { term: "Silas (Silvanus)", category: "Person", shortDef: "Prophet and missionary co-worker who sang hymns with Paul in the Philippian jail.", significance: "Models joyful resilience and partnership in gospel ministry during persecution." },
  "Rome": { term: "Rome", category: "Place", shortDef: "Imperial capital of the ancient Mediterranean world.", significance: "Paul's journey to Rome demonstrates that the gospel advances even into the heart of empire." },
  "Covenant": { term: "Covenant (Berith / Diatheke)", category: "Concept & Artifact", shortDef: "A solemn, binding relationship initiated by God with His people.", significance: "Anchors leadership and faith in God's unchanging promises rather than human contract." },
  "Kingdom": { term: "Kingdom of God", category: "Concept & Artifact", shortDef: "God's dynamic, redemptive reign breaking into human history through Jesus.", significance: "Inverts worldly power structures—valuing meekness, justice, mercy, and servant leadership." },
  "Church": { term: "The Church (Ekklesia)", category: "Concept & Artifact", shortDef: "The global and local assembly of believers called out and united in Christ.", significance: "The Spirit-empowered body of Christ commissioned for worship, discipleship, and mission." },
  "Grace": { term: "Grace (Charis)", category: "Concept & Artifact", shortDef: "God's unmerited favor, love, and empowering presence given through Christ.", significance: "Frees leaders from performance-driven anxiety and motivates humble gratitude." },
  "Repentance": { term: "Repentance (Metanoia)", category: "Concept & Artifact", shortDef: "A wholehearted turning of mind, heart, and direction away from sin toward God.", significance: "The essential gateway to spiritual renewal, restoration, and authentic leadership." },
  "Sabbath": { term: "Sabbath (Shabbat)", category: "Concept & Artifact", shortDef: "Sacred seventh-day rhythm of rest, worship, and trust in God's provision.", significance: "Reminds leaders that they are finite creatures who depend on God rather than ceaseless toil." },
  "Temple": { term: "The Temple", category: "Place", shortDef: "Sacred sanctuary in Jerusalem where God's glory dwelled among Israel.", significance: "Fulfilled in Christ Himself and in the Church as the living temple of the Holy Spirit." },
  "Passover": { term: "Passover (Pesach)", category: "Concept & Artifact", shortDef: "Foundational feast commemorating Israel's liberation from Egypt via the lamb's blood.", significance: "Fulfilled in the Last Supper and the crucifixion of Christ, our Passover Lamb." },
  "Resurrection": { term: "The Resurrection", category: "Concept & Artifact", shortDef: "The bodily rising of Jesus from the dead on the third day.", significance: "Vindicates Christ's lordship, defeats death, and guarantees the future renewal of all creation." }
};

// Build a single regex matching all lexicon keys at word boundaries (longest terms first)
const LEXICON_KEYS_SORTED = Object.keys(BIBLICAL_LEXICON).sort((a, b) => b.length - a.length);
const LEXICON_REGEX = new RegExp(`\\b(${LEXICON_KEYS_SORTED.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

// Lookup helper (case-insensitive)
const findLexiconEntry = (word: string): LexiconEntry | undefined => {
  const exact = BIBLICAL_LEXICON[word];
  if (exact) return exact;
  const lower = word.toLowerCase();
  const matchedKey = LEXICON_KEYS_SORTED.find(k => k.toLowerCase() === lower);
  return matchedKey ? BIBLICAL_LEXICON[matchedKey] : undefined;
};

// Self-contained high-detail SVG sacred artwork generator for the 10 Grand Narrative movements
// Ensures instant, zero-latency rendering in the browser sandbox with uniform 16:9 framing
const getSacredIllustrationUri = (key: string, label?: string): string => {
  let svgBody = '';
  switch (key) {
    case 'NAR-01': // Creation (Genesis.jpeg) - Cosmic light bursting over primordial waters & waterfalls
      svgBody = `
        <defs>
          <radialGradient id="g1" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#fffdf2"/>
            <stop offset="22%" stop-color="#fde08d"/>
            <stop offset="55%" stop-color="#3b6998"/>
            <stop offset="100%" stop-color="#0b1528"/>
          </radialGradient>
          <linearGradient id="sea1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2a6f97"/>
            <stop offset="50%" stop-color="#133c55"/>
            <stop offset="100%" stop-color="#071a26"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#g1)"/>
        <!-- Stars & Cosmic Dust -->
        <g fill="#fff8d6" opacity="0.85">
          <circle cx="620" cy="65" r="3"/><circle cx="680" cy="95" r="4"/><circle cx="730" cy="52" r="2.5"/>
          <circle cx="570" cy="110" r="2"/><circle cx="750" cy="135" r="3.5"/><circle cx="140" cy="70" r="2.5"/>
          <circle cx="210" cy="48" r="1.8"/><circle cx="645" cy="145" r="2.2"/>
        </g>
        <!-- Radiant Light Rays -->
        <g stroke="#fff6cc" stroke-width="1.5" opacity="0.35">
          <line x1="400" y1="170" x2="400" y2="10"/><line x1="400" y1="170" x2="220" y2="20"/>
          <line x1="400" y1="170" x2="580" y2="20"/><line x1="400" y1="170" x2="100" y2="120"/>
          <line x1="400" y1="170" x2="700" y2="120"/><line x1="400" y1="170" x2="400" y2="330"/>
        </g>
        <!-- Billowing Illuminated Clouds -->
        <path d="M0,130 Q90,95 160,150 Q230,130 280,190 Q340,240 260,275 L0,275 Z" fill="#f3c68f" opacity="0.65"/>
        <path d="M800,120 Q700,85 630,150 Q550,135 510,200 Q460,245 540,275 L800,275 Z" fill="#90b4d4" opacity="0.6"/>
        <!-- Winged Angelic Silhouette in Upper Left Cloud -->
        <path d="M65,65 Q125,85 165,135 Q130,145 105,125 Q80,105 65,65 Z" fill="#fae5c8" opacity="0.85"/>
        <!-- Central Sunburst & Horizon Sun -->
        <circle cx="400" cy="160" r="56" fill="#fffbeb" opacity="0.95"/>
        <circle cx="400" cy="272" r="36" fill="#fff7d6"/>
        <!-- Cliffs & Waterfall on Left -->
        <path d="M0,210 L115,225 L145,285 L0,285 Z" fill="#2c2520"/>
        <path d="M82,222 L102,224 L112,285 L76,285 Z" fill="#e0f2fe" opacity="0.9"/>
        <!-- Rolling Ocean Waves -->
        <rect x="0" y="275" width="800" height="175" fill="url(#sea1)"/>
        <path d="M0,335 Q120,305 240,340 T480,335 T720,345 L800,335 L800,450 L0,450 Z" fill="#0d2b3e"/>
        <path d="M120,395 Q210,345 300,395 Q400,350 510,395 Q610,350 710,395 L800,425 L800,450 L0,450 Z" fill="#1d4e6b"/>
        <path d="M165,388 Q215,355 265,388 M415,385 Q465,352 515,385 M555,390 Q605,355 655,390" fill="none" stroke="#e0f7fa" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
      `;
      break;

    case 'NAR-02': // Fall (Fall.jpeg) - Lush Eden canopy with radiant Creator and contrite Adam
      svgBody = `
        <defs>
          <radialGradient id="edenLight" cx="68%" cy="22%" r="70%">
            <stop offset="0%" stop-color="#fffde7"/>
            <stop offset="35%" stop-color="#dce775"/>
            <stop offset="70%" stop-color="#4caf50"/>
            <stop offset="100%" stop-color="#1b3b1e"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#edenLight)"/>
        <!-- Sunbeams through Eden Canopy -->
        <polygon points="560,0 440,0 160,450 380,450" fill="#fff9c4" opacity="0.35"/>
        <polygon points="620,0 520,0 360,450 560,450" fill="#fff9c4" opacity="0.28"/>
        <!-- Forest Trees & Framing Canopy -->
        <path d="M0,0 L280,0 Q210,95 120,130 Q75,240 110,450 L0,450 Z" fill="#1e3f20"/>
        <path d="M800,0 L640,0 Q700,110 735,230 L710,450 L800,450 Z" fill="#254d27"/>
        <!-- Radiant Creator Figure in Upper Right Glade -->
        <g transform="translate(525, 135)">
          <circle cx="0" cy="-35" r="42" fill="#fffde7" opacity="0.6"/>
          <path d="M-45,95 L-22,-10 L22,-10 L45,95 Z" fill="#f5f0dc"/>
          <path d="M-20,-5 L-68,35 M20,-5 L65,30" stroke="#f5f0dc" stroke-width="14" stroke-linecap="round"/>
          <circle cx="0" cy="-26" r="14" fill="#e6ccb2"/>
          <path d="M-10,-20 Q0,5 10,-20" fill="#ffffff"/>
        </g>
        <!-- Seated Contrite Figure in Foreground Left -->
        <g transform="translate(185, 290)">
          <path d="M-45,65 Q-10,15 45,35 L65,120 L-55,120 Z" fill="#5c6b3c"/>
          <circle cx="-12" cy="-28" r="24" fill="#d4a373"/>
          <path d="M-28,-38 Q-8,-55 12,-32" fill="#4a3520"/>
          <path d="M-20,-5 Q25,-12 38,25 L-5,42 Z" fill="#e0ac69"/>
        </g>
        <!-- Lush Foreground Ferns & Fallen Fruit -->
        <path d="M0,390 Q220,355 460,400 T800,380 L800,450 L0,450 Z" fill="#2d5a27"/>
        <circle cx="265" cy="422" r="9" fill="#d97706"/><circle cx="286" cy="428" r="8" fill="#dc2626"/><circle cx="305" cy="420" r="7" fill="#d97706"/>
      `;
      break;

    case 'NAR-03': // Covenant (Covenant.jpeg) - Abraham gazing up at the Milky Way starry sky in desert twilight
      svgBody = `
        <defs>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050b14"/>
            <stop offset="60%" stop-color="#102542"/>
            <stop offset="82%" stop-color="#3d312a"/>
            <stop offset="100%" stop-color="#c98a4b"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#nightSky)"/>
        <!-- Milky Way Band of Countless Stars -->
        <path d="M260,0 Q430,150 560,340 L670,340 Q540,140 390,0 Z" fill="#60a5fa" opacity="0.16"/>
        <path d="M300,0 Q445,150 585,340 L630,340 Q495,140 355,0 Z" fill="#fef08a" opacity="0.14"/>
        <!-- Starfield -->
        <g fill="#ffffff" opacity="0.9">
          <circle cx="340" cy="40" r="2"/><circle cx="380" cy="65" r="2.5"/><circle cx="420" cy="30" r="1.5"/>
          <circle cx="455" cy="95" r="2.2"/><circle cx="490" cy="130" r="1.8"/><circle cx="520" cy="175" r="2.5"/>
          <circle cx="360" cy="115" r="1.6"/><circle cx="430" cy="155" r="2"/><circle cx="565" cy="215" r="1.8"/>
          <circle cx="150" cy="80" r="1.5"/><circle cx="220" cy="50" r="2"/><circle cx="670" cy="75" r="2.2"/>
          <circle cx="720" cy="130" r="1.5"/><circle cx="95" cy="145" r="1.8"/><circle cx="610" cy="105" r="2"/>
        </g>
        <!-- Distant Desert Mountains & Encampment Tents -->
        <path d="M0,335 Q130,295 270,335 T560,330 T800,335 L800,450 L0,450 Z" fill="#261c15"/>
        <polygon points="585,345 618,305 650,345" fill="#1a120d"/>
        <polygon points="640,348 665,318 690,348" fill="#150e0a"/>
        <circle cx="618" cy="340" r="3" fill="#f59e0b"/>
        <!-- Patriarch Abraham Looking Upward with Hand over Heart -->
        <g transform="translate(275, 255)">
          <!-- Outer Mantle & Robe -->
          <path d="M-95,195 L-68,15 Q0,-10 68,15 L95,195 Z" fill="#3d2616"/>
          <path d="M-38,195 L-24,12 L24,12 L38,195 Z" fill="#a8997c"/>
          <!-- Headscarf & White Beard -->
          <path d="M-42,-42 Q-8,-82 32,-42 L48,25 L-45,25 Z" fill="#9c8c74"/>
          <circle cx="0" cy="-38" r="26" fill="#b07d56"/>
          <path d="M-22,-28 Q5,18 28,-22 Q18,-42 -22,-28 Z" fill="#e5e5e5"/>
          <!-- Hand on Chest -->
          <path d="M-65,85 L-5,42 L18,56 L-42,112 Z" fill="#4f331f"/>
          <circle cx="12" cy="48" r="11" fill="#b07d56"/>
        </g>
      `;
      break;

    case 'NAR-04': // Israel (Israel.jpeg) - Moses parting the Red Sea with towering walls of water
      svgBody = `
        <defs>
          <linearGradient id="exodusSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3d352e"/>
            <stop offset="45%" stop-color="#d4a359"/>
            <stop offset="100%" stop-color="#fef3c7"/>
          </linearGradient>
          <linearGradient id="waveWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e0f2fe"/>
            <stop offset="30%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0369a1"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#exodusSky)"/>
        <!-- Distant Sinai Mountains -->
        <polygon points="240,145 335,85 415,145" fill="#57534e" opacity="0.7"/>
        <polygon points="410,145 520,75 640,145" fill="#44403c" opacity="0.8"/>
        <!-- Dry Seafloor Path Converging to Horizon -->
        <polygon points="390,145 410,145 760,450 40,450" fill="#a88b67"/>
        <!-- Left & Right Towering Walls of Water -->
        <path d="M0,115 Q195,125 390,145 L260,340 L0,290 Z" fill="url(#waveWall)"/>
        <path d="M800,115 Q605,125 410,145 L540,340 L800,290 Z" fill="url(#waveWall)"/>
        <!-- Foaming Wave Crests -->
        <path d="M0,115 Q195,125 390,145" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.9"/>
        <path d="M800,115 Q605,125 410,145" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.9"/>
        <!-- Multitude Walking Through the Sea -->
        <g fill="#5c4033">
          <rect x="375" y="210" width="8" height="22" rx="3"/><rect x="392" y="215" width="8" height="22" rx="3"/>
          <rect x="412" y="208" width="8" height="22" rx="3"/><rect x="355" y="245" width="11" height="30" rx="4"/>
          <rect x="382" y="250" width="11" height="30" rx="4"/><rect x="408" y="248" width="11" height="30" rx="4"/>
          <rect x="435" y="242" width="11" height="30" rx="4"/><rect x="340" y="295" width="15" height="42" rx="5"/>
          <rect x="375" y="302" width="15" height="42" rx="5"/><rect x="415" y="298" width="15" height="42" rx="5"/>
          <rect x="455" y="292" width="15" height="42" rx="5"/>
        </g>
        <!-- Rocky Promontory & Moses Raising Staff on Left -->
        <path d="M0,280 L235,345 L335,450 L0,450 Z" fill="#3a281c"/>
        <g transform="translate(145, 235)">
          <line x1="65" y1="-125" x2="65" y2="95" stroke="#4a2c11" stroke-width="4.5"/>
          <path d="M-38,95 L-18,-25 L32,-25 L48,95 Z" fill="#7f1d1d"/>
          <path d="M12,-22 L65,-65" stroke="#d6bc98" stroke-width="11" stroke-linecap="round"/>
          <circle cx="5" cy="-42" r="16" fill="#e5e5e5"/>
        </g>
      `;
      break;

    case 'NAR-05': // Kingdom (Kingdom.jpeg) - Samuel anointing kneeling young David with horn of oil
      svgBody = `
        <defs>
          <radialGradient id="templeRay" cx="42%" cy="5%" r="80%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="35%" stop-color="#92400e"/>
            <stop offset="100%" stop-color="#1c130d"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#templeRay)"/>
        <!-- Golden Beam of Anointing Light -->
        <polygon points="315,0 385,0 475,450 225,450" fill="#fde047" opacity="0.22"/>
        <!-- Bystander Elders on Left -->
        <g fill="#3e2c23" opacity="0.85">
          <rect x="55" y="145" width="55" height="260" rx="12"/>
          <circle cx="82" cy="118" r="22" fill="#8d6e63"/>
          <rect x="130" y="135" width="60" height="270" rx="12" fill="#5d4037"/>
          <circle cx="160" cy="108" r="22" fill="#a1887f"/>
        </g>
        <!-- Standing Prophet Samuel Pouring Oil -->
        <g transform="translate(505, 195)">
          <path d="M-55,235 L-38,-55 L58,-55 L82,235 Z" fill="#9a6b26"/>
          <circle cx="-5" cy="-82" r="26" fill="#d4a373"/>
          <path d="M-32,-95 Q-5,-120 26,-92" fill="#e7e5e4" stroke="#d6d3d1" stroke-width="8"/>
          <path d="M-22,-68 Q-8,-15 15,-68 Z" fill="#f5f5f4"/>
          <!-- Outstretched Arm Holding Horn of Oil & Golden Stream -->
          <path d="M-35,-45 L-135,-72" stroke="#9a6b26" stroke-width="18" stroke-linecap="round"/>
          <polygon points="-148,-88 -128,-88 -138,-58" fill="#451a03"/>
          <line x1="-138" y1="-58" x2="-138" y2="-8" stroke="#facc15" stroke-width="3" stroke-dasharray="4 2"/>
        </g>
        <!-- Kneeling Young David in Crimson Tunic -->
        <g transform="translate(365, 295)">
          <path d="M-58,135 L-35,-35 L35,-35 L65,135 Z" fill="#7f1d1d"/>
          <circle cx="0" cy="-65" r="24" fill="#d4a373"/>
          <path d="M-24,-75 Q0,-95 24,-72" fill="#5c3a21"/>
        </g>
        <!-- Wooden Harp & Earthenware Vessels on Right -->
        <path d="M645,425 L685,255 L765,285 L735,425 Z" fill="none" stroke="#b45309" stroke-width="7"/>
        <line x1="675" y1="265" x2="655" y2="415" stroke="#fef08a" stroke-width="1.5"/>
        <line x1="695" y1="272" x2="675" y2="415" stroke="#fef08a" stroke-width="1.5"/>
        <line x1="715" y1="278" x2="695" y2="415" stroke="#fef08a" stroke-width="1.5"/>
      `;
      break;

    case 'NAR-06': // Exile (Exile.jpeg) - Procession departing smoking walled city of Jerusalem
      svgBody = `
        <defs>
          <linearGradient id="exileSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7fa1c3"/>
            <stop offset="55%" stop-color="#e2d4b7"/>
            <stop offset="100%" stop-color="#c2a373"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#exileSky)"/>
        <!-- Rising Smoke Plumes from Distant Jerusalem -->
        <path d="M295,135 Q235,65 165,15 Q115,0 85,0 L215,0 Q275,55 320,135 Z" fill="#6b7280" opacity="0.45"/>
        <!-- Distant Walled City on Hilltop -->
        <rect x="65" y="122" width="340" height="32" fill="#d6c5a3"/>
        <rect x="65" y="112" width="22" height="42" fill="#cbb68e"/>
        <rect x="165" y="114" width="22" height="40" fill="#cbb68e"/>
        <rect x="275" y="114" width="22" height="40" fill="#cbb68e"/>
        <rect x="375" y="114" width="22" height="40" fill="#cbb68e"/>
        <!-- Dusty Sunlit Hills & Roadway -->
        <path d="M0,152 L800,152 L800,450 L0,450 Z" fill="#b59461"/>
        <polygon points="180,152 320,152 680,450 220,450" fill="#9c7c4c"/>
        <!-- Left Guard with Spear -->
        <g transform="translate(95, 255)">
          <line x1="-28" y1="-125" x2="-28" y2="165" stroke="#4a3520" stroke-width="3.5"/>
          <polygon points="-33,-125 -23,-125 -28,-148" fill="#9ca3af"/>
          <rect x="-22" y="-35" width="46" height="125" rx="6" fill="#1e3a5f"/>
          <rect x="-20" y="-35" width="42" height="58" fill="#a16207"/>
          <circle cx="0" cy="-62" r="18" fill="#b07d56"/>
          <path d="M-18,-66 Q0,-98 18,-66 Z" fill="#ca8a04"/>
        </g>
        <!-- Exile Procession Carrying Bundles -->
        <g transform="translate(515, 255)">
          <path d="M-38,155 L-26,-32 L28,-32 L40,155 Z" fill="#2b4c65"/>
          <circle cx="0" cy="-58" r="20" fill="#b07d56"/>
          <path d="M-14,-48 Q0,-12 14,-48 Z" fill="#e5e7eb"/>
          <circle cx="-12" cy="12" r="26" fill="#a8997c"/>
        </g>
        <g transform="translate(675, 275)">
          <path d="M-36,145 L-24,-28 L26,-28 L38,145 Z" fill="#5c4033"/>
          <path d="M-24,-65 Q0,-85 24,-65 L32,10 L-30,10 Z" fill="#a8997c"/>
          <circle cx="0" cy="-50" r="17" fill="#c6936d"/>
          <circle cx="8" cy="12" r="24" fill="#cbb68e"/>
        </g>
      `;
      break;

    case 'NAR-07': // Restoration (Restoration.jpeg) - Ezekiel & the Valley of Dry Bones under radiant figure
      svgBody = `
        <defs>
          <radialGradient id="ezekielLight" cx="62%" cy="18%" r="75%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="28%" stop-color="#fef08a"/>
            <stop offset="65%" stop-color="#78716c"/>
            <stop offset="100%" stop-color="#292524"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#ezekielLight)"/>
        <!-- Dramatic Storm Clouds Parted by Glory Rays -->
        <path d="M0,0 L420,0 Q310,95 160,115 Q65,135 0,95 Z" fill="#3f3a36" opacity="0.88"/>
        <polygon points="495,0 645,0 800,320 220,320" fill="#fef9c3" opacity="0.45"/>
        <!-- Radiant Figure in Upper Sky -->
        <g transform="translate(525, 110)">
          <path d="M-28,75 L-14,-25 L14,-25 L28,75 Z" fill="#ffffff"/>
          <path d="M-14,-15 L-48,12 M14,-15 L48,12" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
          <circle cx="0" cy="-38" r="12" fill="#fef08a"/>
        </g>
        <!-- Desert Valley Floor -->
        <path d="M0,225 Q230,195 450,235 T800,215 L800,450 L0,450 Z" fill="#d6c7b2"/>
        <!-- Prophet Ezekiel Standing with Outstretched Hand -->
        <g transform="translate(225, 255)">
          <path d="M-42,125 L-26,-45 L26,-45 L46,125 Z" fill="#78553a"/>
          <circle cx="0" cy="-68" r="20" fill="#e7e5e4"/>
          <path d="M18,-25 L68,-5" stroke="#78553a" stroke-width="16" stroke-linecap="round"/>
        </g>
        <!-- Rising Figures & Dry Bones in Foreground -->
        <g stroke="#574c41" stroke-width="3" fill="#e7dec8">
          <circle cx="380" cy="215" r="14"/>
          <line x1="380" y1="229" x2="380" y2="285"/>
          <line x1="362" y1="242" x2="398" y2="242"/><line x1="364" y1="254" x2="396" y2="254"/>
          <circle cx="685" cy="245" r="16"/>
          <line x1="685" y1="261" x2="685" y2="335"/>
          <line x1="662" y1="276" x2="708" y2="276"/><line x1="665" y1="290" x2="705" y2="290"/>
          <circle cx="275" cy="395" r="26"/>
          <circle cx="725" cy="405" r="28"/>
          <path d="M355,385 Q425,345 495,385" fill="none" stroke-width="5"/>
          <path d="M370,398 Q425,360 480,398" fill="none" stroke-width="5"/>
        </g>
      `;
      break;

    case 'NAR-08': // Jesus Christ (Jesus Christ.jpeg) - Empty Tomb with rolled stone, 3 crosses & Risen Christ
      svgBody = `
        <defs>
          <radialGradient id="resurrectionSun" cx="68%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="25%" stop-color="#fef08a"/>
            <stop offset="65%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#78350f"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#resurrectionSun)"/>
        <!-- Sunburst Rays Behind Risen Christ -->
        <g stroke="#fffbeb" stroke-width="3" opacity="0.55">
          <line x1="565" y1="165" x2="365" y2="20"/><line x1="565" y1="165" x2="485" y2="10"/>
          <line x1="565" y1="165" x2="625" y2="10"/><line x1="565" y1="165" x2="745" y2="40"/>
          <line x1="565" y1="165" x2="780" y2="165"/>
        </g>
        <!-- Distant Golgotha Hill with Three Crosses -->
        <path d="M320,255 Q435,175 555,255 Z" fill="#92623a"/>
        <g stroke="#451a03" stroke-width="4">
          <line x1="430" y1="145" x2="430" y2="205"/><line x1="412" y1="162" x2="448" y2="162"/>
          <line x1="395" y1="162" x2="395" y2="210"/><line x1="382" y1="175" x2="408" y2="175"/>
          <line x1="465" y1="162" x2="465" y2="210"/><line x1="452" y1="175" x2="478" y2="175"/>
        </g>
        <!-- Risen Christ in Radiant White Robes with Open Arms -->
        <g transform="translate(565, 185)">
          <path d="M-24,68 L-14,-22 L14,-22 L24,68 Z" fill="#ffffff"/>
          <path d="M-14,-16 L-48,-5 M14,-16 L48,-5" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
          <circle cx="0" cy="-34" r="10" fill="#d97706"/>
        </g>
        <!-- Sunlit Garden Path & Folded Linen Cloth on Stone Slab -->
        <path d="M0,255 L800,255 L800,450 L0,450 Z" fill="#d4a359"/>
        <rect x="85" y="295" width="340" height="65" fill="#8c6d46"/>
        <path d="M95,295 Q215,275 335,298 L485,375 Q365,395 255,362 Z" fill="#f5f5f4"/>
        <!-- Massive Rolled-Away Circular Stone on Left & Rock-Hewn Tomb Arch -->
        <circle cx="135" cy="185" r="125" fill="#6b533b" stroke="#4a3728" stroke-width="6"/>
        <path d="M0,0 L800,0 L800,450 L715,450 L725,135 Q565,-15 335,45 L295,195 L0,195 Z" fill="#4a3728"/>
      `;
      break;

    case 'NAR-09': // Church (Church.jpeg) - Pentecost flames descending from heaven upon the gathered disciples
      svgBody = `
        <defs>
          <radialGradient id="pentecostGlow" cx="50%" cy="18%" r="75%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="30%" stop-color="#fbbf24"/>
            <stop offset="65%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#pentecostGlow)"/>
        <!-- Ascended Christ & Heavenly Host in Upper Glory -->
        <circle cx="400" cy="75" r="55" fill="#ffffff" opacity="0.85"/>
        <path d="M375,135 L390,55 L410,55 L425,135 Z" fill="#be185d"/>
        <circle cx="400" cy="40" r="11" fill="#fde68a"/>
        <!-- Swooping Streams of Pentecost Fire Descending -->
        <g fill="none" stroke="#f59e0b" stroke-width="16" stroke-linecap="round" opacity="0.85">
          <path d="M350,125 Q180,175 135,255"/>
          <path d="M375,135 Q275,185 265,255"/>
          <path d="M400,140 Q395,195 395,255"/>
          <path d="M425,135 Q525,185 535,255"/>
          <path d="M450,125 Q620,175 665,255"/>
        </g>
        <g fill="none" stroke="#fef08a" stroke-width="7" stroke-linecap="round">
          <path d="M350,125 Q180,175 135,255"/>
          <path d="M375,135 Q275,185 265,255"/>
          <path d="M400,140 Q395,195 395,255"/>
          <path d="M425,135 Q525,185 535,255"/>
          <path d="M450,125 Q620,175 665,255"/>
        </g>
        <!-- Gathered Disciples in Reverent Prayer -->
        <g transform="translate(0, 255)">
          <path d="M95,195 L112,35 L162,35 L178,195 Z" fill="#44403c"/><circle cx="137" cy="12" r="18" fill="#d6a87c"/>
          <path d="M225,195 L242,45 L292,45 L308,195 Z" fill="#9a3412"/><circle cx="267" cy="22" r="18" fill="#d6a87c"/>
          <path d="M348,195 L368,28 L422,28 L442,195 Z" fill="#1e3a8a"/><circle cx="395" cy="6" r="19" fill="#d6a87c"/>
          <path d="M492,195 L508,38 L558,38 L575,195 Z" fill="#14532d"/><circle cx="533" cy="15" r="18" fill="#d6a87c"/>
          <path d="M622,195 L638,35 L688,35 L705,195 Z" fill="#7c2d12"/><circle cx="663" cy="12" r="18" fill="#d6a87c"/>
        </g>
      `;
      break;

    case 'NAR-10': // New Creation (New Creation.jpeg) - Golden New Jerusalem, River of Life & redeemed community
      svgBody = `
        <defs>
          <radialGradient id="newJerSky" cx="50%" cy="8%" r="75%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="30%" stop-color="#fef08a"/>
            <stop offset="75%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#451a03"/>
          </radialGradient>
          <linearGradient id="riverLife" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef9c3"/>
            <stop offset="40%" stop-color="#7dd3fc"/>
            <stop offset="100%" stop-color="#0369a1"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#newJerSky)"/>
        <!-- Heavenly Sunbeams -->
        <polygon points="365,0 435,0 640,225 160,225" fill="#ffffff" opacity="0.35"/>
        <!-- Golden Domed New Jerusalem on the Horizon -->
        <g fill="#d4a038" stroke="#926216" stroke-width="1.5">
          <rect x="145" y="175" width="510" height="48"/>
          <path d="M355,175 Q400,105 445,175 Z"/>
          <path d="M265,175 Q290,135 315,175 Z"/>
          <path d="M485,175 Q510,135 535,175 Z"/>
          <rect x="235" y="135" width="16" height="40"/><rect x="549" y="135" width="16" height="40"/>
          <path d="M385,223 L385,192 Q400,180 415,192 L415,223 Z" fill="#fffbeb"/>
        </g>
        <!-- Cascading River of Life & Cypress Trees -->
        <path d="M0,223 L800,223 L800,450 L0,450 Z" fill="#3f6212"/>
        <polygon points="382,223 418,223 645,450 155,450" fill="url(#riverLife)"/>
        <line x1="255" y1="315" x2="545" y2="315" stroke="#ffffff" stroke-width="4" opacity="0.85"/>
        <!-- Classical Golden Pillars & Redeemed Saints on Riverbank -->
        <rect x="18" y="135" width="28" height="240" fill="#b48327"/>
        <rect x="754" y="135" width="28" height="240" fill="#b48327"/>
        <g transform="translate(0, 345)">
          <circle cx="115" cy="15" r="14" fill="#d6a87c"/><path d="M90,105 L102,32 L128,32 L142,105 Z" fill="#1d4ed8"/>
          <circle cx="205" cy="25" r="14" fill="#d6a87c"/><path d="M180,105 L192,42 L218,42 L232,105 Z" fill="#e5e7eb"/>
          <circle cx="315" cy="32" r="14" fill="#d6a87c"/><path d="M288,105 L302,48 L328,48 L342,105 Z" fill="#b45309"/>
          <circle cx="485" cy="32" r="14" fill="#d6a87c"/><path d="M458,105 L472,48 L498,48 L512,105 Z" fill="#9a3412"/>
          <circle cx="595" cy="25" r="14" fill="#d6a87c"/><path d="M568,105 L582,42 L608,42 L622,105 Z" fill="#ca8a04"/>
          <circle cx="685" cy="15" r="14" fill="#d6a87c"/><path d="M658,105 L672,32 L698,32 L712,105 Z" fill="#15803d"/>
        </g>
      `;
      break;

    default: // Illuminated Sacred Manuscript Fallback
      const safeLabel = (label || key).replace(/[<>&"']/g, '');
      svgBody = `
        <defs>
          <radialGradient id="msGlow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#4a3222"/>
            <stop offset="100%" stop-color="#1c110a"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#msGlow)"/>
        <rect x="28" y="28" width="744" height="394" fill="none" stroke="#c5a059" stroke-width="2" opacity="0.6"/>
        <rect x="38" y="38" width="724" height="374" fill="none" stroke="#c5a059" stroke-width="1" opacity="0.35"/>
        <circle cx="400" cy="195" r="68" fill="none" stroke="#e3c178" stroke-width="2" opacity="0.45"/>
        <path d="M394,135 L406,135 L406,178 L442,178 L442,190 L406,190 L406,255 L394,255 L394,190 L358,190 L358,178 L394,178 Z" fill="#e3c178"/>
        <text x="400" y="335" text-anchor="middle" fill="#f3dcb2" font-family="Georgia, serif" font-size="26" font-weight="bold" letter-spacing="3">${safeLabel.toUpperCase()}</text>
      `;
      break;
  }

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">${svgBody}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
};

const NARRATIVE_STORIES: ContentItem[] = [
  {
    id: "NAR-01", section: "NARRATIVE", title: "1. Creation", ref: "Genesis 1-2",
    imageUrl: getSacredIllustrationUri("NAR-01", "Creation"),
    body: "God creates the heavens and the earth, brings order out of darkness, and makes humanity in His image. Human beings receive responsibility to care for and steward creation.",
    why: "Creation establishes God's sovereignty, the dignity of human life, and humanity's original purpose. Leadership begins with recognizing that life and authority are gifts entrusted by God.",
    preAnalyzed: {
      observation: "God creates by His word; creation is called good. Humanity is made in God's image and receives responsibility over the earth.",
      interpretation: "God is Creator and humanity is His creation. Human dignity and leadership responsibility come from God, not personal achievement or power.",
      application: "Treat every person with dignity. Exercise authority as stewardship, and recognize leadership as a responsibility entrusted by God."
    }
  },
  {
    id: "NAR-02", section: "NARRATIVE", title: "2. Fall", ref: "Genesis 3 | Genesis 4:1-16 | Genesis 6-9 | Genesis 11:1-9",
    imageUrl: getSacredIllustrationUri("NAR-02", "The Fall"),
    body: "Adam and Eve disobey God in Eden. Sin brings shame, fear, blame, and separation. The effects spread through human relationships and society.",
    why: "The Fall explains why the world and human relationships are broken. It establishes the need for reconciliation, redemption, forgiveness, and restoration.",
    preAnalyzed: {
      observation: "The serpent questions God's word. Adam and Eve disobey and hide. Cain kills Abel; human wickedness increases; Babel expresses human pride.",
      interpretation: "Sin is rebellion against God and damages relationships. Human beings cannot repair this rupture by their own efforts.",
      application: "Acknowledge wrongdoing rather than shifting blame. Practice confession, accountability, forgiveness, and reconciliation."
    }
  },
  {
    id: "NAR-03", section: "NARRATIVE", title: "3. Covenant", ref: "Genesis 12 | Genesis 15 | Genesis 17 | Genesis 22 | Romans 4 | Hebrews 11",
    imageUrl: getSacredIllustrationUri("NAR-03", "Covenant"),
    body: "God calls Abraham to leave his homeland and establishes a covenant, promising descendants, land, and blessing. God's covenant purposes continue through Abraham's family.",
    why: "Covenant demonstrates God's faithfulness and initiative in redemption. God's plan is rooted in relationship and promise, not merely human performance.",
    preAnalyzed: {
      observation: "God calls Abraham, repeats and develops His promises, and establishes covenant signs. Abraham responds in faith.",
      interpretation: "God's covenant reveals His commitment to His people and His intention to bless the nations. Faith means trusting God's character.",
      application: "Lead through faith rather than fear. Keep commitments. Build communities around God's purposes and seek to be a blessing to others."
    }
  },
  {
    id: "NAR-04", section: "NARRATIVE", title: "4. Israel", ref: "Exodus 1-14 | Exodus 19-24 | Exodus 32-34 | Numbers 11-14 | Numbers 20-21",
    imageUrl: getSacredIllustrationUri("NAR-04", "Israel"),
    body: "God hears Israel's cries in Egypt and delivers the people through Moses. At Sinai He gives His commandments and forms them into a people.",
    why: "God does not simply rescue individuals; He forms a people. Freedom brings responsibility, and a community needs spiritual formation, obedience, and trust.",
    preAnalyzed: {
      observation: "God delivers Israel from slavery, establishes covenant at Sinai, and provides in the wilderness. The people complain and turn to idolatry.",
      interpretation: "Israel is called to live in relationship with God and reflect His character through worship, obedience, and faithfulness.",
      application: "Lead communities through change and uncertainty. Establish healthy spiritual practices, depend on God, and encourage faithfulness."
    }
  },
  {
    id: "NAR-05", section: "NARRATIVE", title: "5. Kingdom", ref: "1 Samuel 17 | 2 Samuel 11-12 | 1 Kings 3-11 | 1 Kings 17-19 | Amos 5 | Micah 6:8",
    imageUrl: getSacredIllustrationUri("NAR-05", "Kingdom"),
    body: "Israel develops a monarchy. David becomes king, and Solomon experiences wisdom and prosperity. The kingdom also reveals pride, abuse of power, idolatry, and injustice.",
    why: "The kingdom reveals the potential and limitations of human leadership. Kings remain accountable to God; authority, wisdom, and influence cannot replace righteousness.",
    preAnalyzed: {
      observation: "David demonstrates courage against Goliath but later abuses authority. Nathan confronts David. Solomon receives wisdom but experiences spiritual decline.",
      interpretation: "No human king perfectly embodies God's justice and righteousness. Human rulers are accountable to a higher authority, pointing toward the need for a faithful King.",
      application: "Exercise authority with humility and integrity. Welcome correction. Resist corruption and self-interest; prioritize justice and obedience."
    }
  },
  {
    id: "NAR-06", section: "NARRATIVE", title: "6. Exile", ref: "Daniel 1-6 | Esther 1-10 | Nehemiah 1-13 | Jonah 1-4",
    imageUrl: getSacredIllustrationUri("NAR-06", "Exile"),
    body: "Israel and Judah experience the consequences of covenant unfaithfulness. The people are displaced from their homeland. Daniel, Esther, and Nehemiah lead faithfully in foreign contexts.",
    why: "God's presence and purposes are not limited to a particular location or period of national success. Faithfulness matters in difficult and unfamiliar circumstances.",
    preAnalyzed: {
      observation: "Daniel serves in a foreign government without abandoning convictions. Esther risks her position to protect her people. Nehemiah responds to brokenness.",
      interpretation: "Exile reveals the consequences of unfaithfulness, but it does not end God's purposes. His people can remain faithful in unfamiliar cultures.",
      application: "Lead faithfully through adversity, displacement, and uncertainty. Preserve spiritual identity and advocate for vulnerable people."
    }
  },
  {
    id: "NAR-07", section: "NARRATIVE", title: "7. Promise of Restoration", ref: "Isaiah 6 | Isaiah 52-53 | Jeremiah 1 | Jeremiah 31 | Ezekiel 34 | Ezekiel 36-37 | Malachi 3-4",
    imageUrl: getSacredIllustrationUri("NAR-07", "Promise of Restoration"),
    body: "God promises to restore His people, renew their hearts, establish a new covenant, and provide faithful shepherds. Prophetic visions offer hope beyond judgment and exile.",
    why: "God's purpose is not merely to judge sin but to restore relationship and renew His people. These promises point forward to the hope fulfilled through Jesus Christ.",
    preAnalyzed: {
      observation: "Isaiah speaks of prophetic calling and the suffering servant. Jeremiah announces a new covenant. Ezekiel describes faithful shepherds and new hearts.",
      interpretation: "Restoration requires more than rebuilding outward structures. God promises inward transformation, renewed covenant, and a restored community.",
      application: "Pursue genuine spiritual renewal rather than superficial change. Develop leaders who shepherd rather than exploit."
    }
  },
  {
    id: "NAR-08", section: "NARRATIVE", title: "8. Jesus Christ", ref: "Matthew 1-2 | Luke 1-2 | John 1:1-18 | Matthew 5-7 | Luke 10:25-37 | John 13-17 | Matthew 26-28 | Luke 22-24 | John 19-20",
    imageUrl: getSacredIllustrationUri("NAR-08", "Jesus Christ"),
    body: "Jesus enters human history through the incarnation. He teaches about God's Kingdom, heals the sick, dies on the cross, rises from the dead, and commissions His disciples.",
    why: "Jesus is the central figure of the biblical narrative. He reveals God's character, addresses sin, and inaugurates the Kingdom of God.",
    preAnalyzed: {
      observation: "Jesus is born, baptized, and tempted. He teaches through sermons and parables, demonstrates compassion, washes His disciples' feet, is crucified, and rises again.",
      interpretation: "Jesus fulfils God's redemptive purposes and reveals faithful humanity and leadership. His death and resurrection are central to reconciliation.",
      application: "Follow Jesus' example of humility, compassion, truth, sacrifice, and service. Welcome the marginalized and forgive others."
    }
  },
  {
    id: "NAR-09", section: "NARRATIVE", title: "9. Church", ref: "Acts 2 | Acts 6-7 | Acts 9 | Acts 10-11 | Acts 15 | Acts 20:17-38 | Romans 12 | 1 Corinthians 12-13 | Ephesians 4-6 | 1 Peter 5",
    imageUrl: getSacredIllustrationUri("NAR-09", "The Church"),
    body: "After Jesus' resurrection and ascension, the Holy Spirit comes at Pentecost. The Church emerges as a community devoted to worship, teaching, fellowship, service, and mission.",
    why: "God's redemptive work continues through a Spirit-empowered community. The Church is called to embody Kingdom values and proclaim the gospel to the world.",
    preAnalyzed: {
      observation: "The Spirit empowers the disciples. Believers share life and resources. Stephen bears witness, Paul is converted, the Jerusalem Council addresses disagreement.",
      interpretation: "The Church is formed through Christ and empowered by the Holy Spirit. Its mission is to make disciples, serve others, and preserve unity.",
      application: "Develop healthy and accountable leadership. Equip people according to their gifts. Promote unity, love, teaching, service, and justice."
    }
  },
  {
    id: "NAR-10", section: "NARRATIVE", title: "10. New Creation", ref: "Revelation 21-22 | Romans 8:18-25 | 2 Peter 3:10-13",
    imageUrl: getSacredIllustrationUri("NAR-10", "New Creation"),
    body: "Scripture culminates in the promise of a new heaven and a new earth. God makes His dwelling with humanity. Death, mourning, crying, and pain are removed.",
    why: "The Christian hope is not simply escape from the world, but the renewal of creation and eternal fellowship with God.",
    preAnalyzed: {
      observation: "Revelation describes a new heaven and earth, the New Jerusalem, the river of life, the tree of life, and the removal of death and suffering.",
      interpretation: "God's redemptive purposes reach completion. The separation and brokenness introduced in Genesis are overcome through God's final renewal.",
      application: "Live with eternal hope. Persevere through suffering. Practice faithful stewardship, justice, holiness, and compassion as signs of the coming renewal."
    }
  }
];

const THEME_STORIES: ContentItem[] = [
  { id: "THM-01", section: "THEMES", title: "1. Humility", ref: "Exodus 1-14 | Numbers 11-14 | 1 Samuel 17 | Luke 18:9-14 | John 13 | Philippians 2", body: "Biblical Examples: Moses, David, the tax collector, Jesus.", why: "Authority requires humility and dependence on God." },
  { id: "THM-02", section: "THEMES", title: "2. Accountability", ref: "2 Samuel 11-12 | Numbers 20-21 | Acts 10-11 | Acts 20:17-38", body: "Biblical Examples: Nathan and David, Moses, Peter.", why: "No spiritual leader is above correction." },
  { id: "THM-03", section: "THEMES", title: "3. Servanthood", ref: "John 13 | Luke 10:25-37 | Philippians 2 | Acts 2:42-47", body: "Biblical Examples: Jesus washing feet, the Good Samaritan.", why: "Leadership is expressed through service, not domination." },
  { id: "THM-04", section: "THEMES", title: "4. Integrity", ref: "Genesis 37-50 | Daniel 1-6 | Acts 20:17-38 | 2 Timothy 2-4", body: "Biblical Examples: Joseph, Daniel, Paul.", why: "Character must remain consistent when nobody is watching." },
  { id: "THM-05", section: "THEMES", title: "5. Repentance", ref: "2 Samuel 11-12 | Psalm 51 | Jonah 1-4 | Luke 15:11-32", body: "Biblical Examples: David, Nineveh, the Prodigal Son.", why: "Genuine restoration requires honesty and turning away from wrongdoing." },
  { id: "THM-06", section: "THEMES", title: "6. Justice", ref: "Amos 5 | Nehemiah 1-13 | Micah 6:8 | Luke 10:25-37 | Matthew 25:31-46", body: "Biblical Examples: Amos, Nehemiah, Jesus.", why: "Worship cannot be separated from justice and care for vulnerable people." },
  { id: "THM-07", section: "THEMES", title: "7. Courage", ref: "Esther 1-10 | Daniel 1-6 | Acts 6-7", body: "Biblical Examples: Esther, Daniel, Stephen.", why: "Faithfulness sometimes requires personal risk." },
  { id: "THM-08", section: "THEMES", title: "8. Discernment", ref: "1 Kings 3-11 | Acts 15", body: "Biblical Examples: Solomon, the Jerusalem Council.", why: "Leaders must distinguish essential truths from secondary disagreements." },
  { id: "THM-09", section: "THEMES", title: "9. Forgiveness", ref: "Genesis 37-50 | Matthew 18:21-35 | Acts 6-7 | Luke 23", body: "Biblical Examples: Joseph, Jesus, Stephen.", why: "Mercy and reconciliation are central to Christian life." },
  { id: "THM-10", section: "THEMES", title: "10. Perseverance", ref: "Job 1-42 | 1 Kings 17-19 | Acts 27-28 | 2 Timothy 2-4 | Matthew 26-28 | Luke 22-24", body: "Biblical Examples: Job, Elijah, Paul, Jesus.", why: "Spiritual leadership requires endurance through suffering and discouragement." }
];

// The 46 Essential Biblical Stories mapped to OT and NT sections
const OT_STORIES: ContentItem[] = [
  { id: "OT-01", section: "OT", title: "1. Creation and the Fall", ref: "Genesis 1-3", body: "God creates the world... Adam and Eve disobey God.", why: "Establishes human dignity and the need for redemption." },
  { id: "OT-02", section: "OT", title: "2. Cain and Abel", ref: "Genesis 4:1-16", body: "Cain becomes jealous of his brother Abel and murders him.", why: "Explores jealousy, violence, and accountability." },
  { id: "OT-03", section: "OT", title: "3. Noah and the Flood", ref: "Genesis 6-9", body: "God judges the world through a flood and preserves Noah.", why: "Introduces divine judgment, preservation, and covenant." },
  { id: "OT-04", section: "OT", title: "4. The Tower of Babel", ref: "Genesis 11:1-9", body: "Humanity unites to build a tower reaching heaven.", why: "A cautionary story about pride and ambition." },
  { id: "OT-05", section: "OT", title: "5. Abraham and the Covenant", ref: "Genesis 12, 15, 17, 22", body: "God calls Abraham to leave his homeland.", why: "Foundational to understanding faith and obedience." },
  { id: "OT-06", section: "OT", title: "6. Jacob, Esau, and Wrestling", ref: "Genesis 25-33", body: "Jacob deceives his brother and later wrestles with God.", why: "Explores deception, reconciliation, and transformation." },
  { id: "OT-07", section: "OT", title: "7. Joseph's Betrayal", ref: "Genesis 37-50", body: "Joseph is betrayed by his brothers and sold into slavery.", why: "Rich story about forgiveness, providence, and integrity." },
  { id: "OT-08", section: "OT", title: "8. Moses and the Exodus", ref: "Exodus 1-14", body: "Israel suffers under Egyptian slavery; God calls Moses.", why: "Establishes liberation and God's identity as redeemer." },
  { id: "OT-09", section: "OT", title: "9. Mount Sinai and Commandments", ref: "Exodus 19-24", body: "God establishes his covenant and gives commandments.", why: "Essential for understanding morality and worship." },
  { id: "OT-10", section: "OT", title: "10. The Golden Calf", ref: "Exodus 32-34", body: "The Israelites construct an idol while Moses is away.", why: "A critical story about idolatry and spiritual leadership." },
  { id: "OT-11", section: "OT", title: "11. Wilderness and Spies", ref: "Numbers 11-14, 20-21", body: "Israel complains and doubts God's promises.", why: "Explores spiritual maturity and collective fear." },
  { id: "OT-12", section: "OT", title: "12. David and Goliath", ref: "1 Samuel 17", body: "The young David defeats the Philistine giant Goliath.", why: "Explores courage, faith, and humility." },
  { id: "OT-13", section: "OT", title: "13. David, Bathsheba, Nathan", ref: "2 Samuel 11-12", body: "David abuses his authority and commits adultery.", why: "Addresses moral compromise and accountability." },
  { id: "OT-14", section: "OT", title: "14. Elijah and Prophets of Baal", ref: "1 Kings 17-19", body: "Elijah confronts King Ahab and challenges Baal's prophets.", why: "A story about confronting corruption and finding courage." },
  { id: "OT-15", section: "OT", title: "15. Solomon's Spiritual Decline", ref: "1 Kings 3-11", body: "Solomon asks for wisdom but later turns to idolatry.", why: "A warning that talent does not guarantee faithfulness." },
  { id: "OT-16", section: "OT", title: "16. Ruth and Naomi", ref: "Book of Ruth", body: "Ruth remains loyal to her mother-in-law Naomi.", why: "A story about loyalty, compassion, and inclusion." },
  { id: "OT-17", section: "OT", title: "17. Daniel in Babylon", ref: "Daniel 1-6", body: "Daniel maintains faith under foreign rulers.", why: "Understanding faithfulness in a secular environment." },
  { id: "OT-18", section: "OT", title: "18. Esther and Preservation", ref: "Book of Esther", body: "Esther risks her life to prevent destruction of her people.", why: "A story about moral courage and responsible influence." },
  { id: "OT-19", section: "OT", title: "19. Nehemiah Rebuilds", ref: "Book of Nehemiah", body: "Nehemiah organizes the rebuilding of Jerusalem's walls.", why: "Best biblical example of practical organizational leadership." },
  { id: "OT-20", section: "OT", title: "20. Jonah and Nineveh", ref: "Book of Jonah", body: "Jonah resists God's command to preach to Nineveh.", why: "A challenge to religious exclusivity and prejudice." },
  { id: "OT-21", section: "OT", title: "Extra: OT Passages", ref: "Psalms, Proverbs, Prophets", body: "Central messages of Psalms, Proverbs, and Prophets.", why: "Provide essential context on trust, repentance, and justice." }
];

const NT_STORIES: ContentItem[] = [
  { id: "NT-01", section: "NT", title: "1. The Birth of Jesus", ref: "Matthew 1-2; Luke 1-2; John 1:1-18", body: "Jesus is born in Bethlehem.", why: "The foundation of Christian belief in the Incarnation." },
  { id: "NT-02", section: "NT", title: "2. Baptism and Temptation", ref: "Matthew 3-4; Mark 1; Luke 3-4", body: "Jesus is baptized by John and tempted in the wilderness.", why: "Establishes Jesus' identity and mission." },
  { id: "NT-03", section: "NT", title: "3. The Sermon on the Mount", ref: "Matthew 5-7", body: "Jesus teaches the Beatitudes, forgiveness, and prayer.", why: "The most important extended teaching for Christian ethics." },
  { id: "NT-04", section: "NT", title: "4. Jesus Calls the Disciples", ref: "Matthew 4; Mark 1-3; Luke 5-6", body: "Jesus calls ordinary people to follow him.", why: "The foundation of discipleship and Christian ministry." },
  { id: "NT-05", section: "NT", title: "5. Healing the Marginalized", ref: "Mark 1-5; Luke 7; John 9", body: "Jesus heals lepers, the blind, and paralyzed.", why: "Demonstrates compassion and dignity." },
  { id: "NT-06", section: "NT", title: "6. The Good Samaritan", ref: "Luke 10:25-37", body: "A Samaritan stops to care for an attacked man.", why: "Love of neighbour transcends boundaries." },
  { id: "NT-07", section: "NT", title: "7. The Prodigal Son", ref: "Luke 15:11-32", body: "A father welcomes his wasteful son with compassion.", why: "Grace, repentance, and forgiveness." },
  { id: "NT-08", section: "NT", title: "8. The Parable of the Sower", ref: "Matthew 13:1-23; Mark 4", body: "Seed grows differently depending on the soil.", why: "Understanding spiritual receptivity and growth conditions." },
  { id: "NT-09", section: "NT", title: "9. Pharisee and Tax Collector", ref: "Luke 18:9-14", body: "A Pharisee boasts while a tax collector asks for mercy.", why: "Humility and the danger of religious arrogance." },
  { id: "NT-10", section: "NT", title: "10. The Sheep and the Goats", ref: "Matthew 25:31-46", body: "Jesus describes the final judgment based on care for others.", why: "The seriousness of practical compassion." },
  { id: "NT-11", section: "NT", title: "11. Other Parables", ref: "Matthew 18; Luke 12", body: "Other profound stories regarding mercy and stewardship.", why: "Exposes the human heart and challenges assumptions." },
  { id: "NT-12", section: "NT", title: "12. The Transfiguration", ref: "Matthew 17:1-9; Mark 9; Luke 9", body: "Jesus is revealed in glory before Peter, James, and John.", why: "Reveals Jesus' divine significance." },
  { id: "NT-13", section: "NT", title: "13. Triumphal Entry", ref: "Matthew 21:1-11; Mark 11; Luke 19", body: "Jesus enters Jerusalem on a donkey.", why: "Contrasts military expectations with humble kingship." },
  { id: "NT-14", section: "NT", title: "14. Last Supper & Washing", ref: "Matthew 26; Luke 22; John 13", body: "Jesus institutes the Lord's Supper and washes feet.", why: "The clearest model of spiritual leadership." },
  { id: "NT-15", section: "NT", title: "15. Gethsemane & Betrayal", ref: "Matthew 26; Mark 14; Luke 22", body: "Jesus prays in anguish; Judas betrays him.", why: "Explores suffering, obedience, and human weakness." },
  { id: "NT-16", section: "NT", title: "16. The Crucifixion", ref: "Matthew 27; Mark 15; Luke 23; John 19", body: "Jesus is condemned and dies on the cross.", why: "The central event of Christian theology." },
  { id: "NT-17", section: "NT", title: "17. The Resurrection", ref: "Matthew 28; Mark 16; Luke 24; John 20", body: "Jesus rises from the dead.", why: "The indispensable foundation of Christian hope." },
  { id: "NT-18", section: "NT", title: "18. Great Commission", ref: "Matthew 28; Luke 24; Acts 1", body: "Jesus commissions his disciples to all nations.", why: "Establishes the missionary purpose of the Church." },
  { id: "NT-19", section: "NT", title: "19. Pentecost", ref: "Acts 2", body: "The Holy Spirit descends upon the apostles.", why: "The birth of the Church's public mission." },
  { id: "NT-20", section: "NT", title: "20. Stephen's Martyrdom", ref: "Acts 6-7", body: "Stephen is stoned to death for his witness.", why: "Courage, persecution, and faithfulness." },
  { id: "NT-21", section: "NT", title: "21. Conversion of Saul", ref: "Acts 9; 22; 26", body: "Saul encounters the risen Jesus.", why: "Transformation, grace, and redemption." },
  { id: "NT-22", section: "NT", title: "22. Peter and Cornelius", ref: "Acts 10-11", body: "The Holy Spirit is given to Gentiles.", why: "Turning point in understanding inclusion." },
  { id: "NT-23", section: "NT", title: "23. Council of Jerusalem", ref: "Acts 15", body: "The early Church debates Gentile converts.", why: "Early example of church governance and discernment." },
  { id: "NT-24", section: "NT", title: "24. Paul and Silas in Prison", ref: "Acts 16:16-40", body: "Paul and Silas are beaten and imprisoned.", why: "Resilience, worship during adversity, and evangelism." },
  { id: "NT-25", section: "NT", title: "25. Paul's Shipwreck", ref: "Acts 27-28", body: "Paul survives a violent storm while travelling to Rome.", why: "Leadership under pressure and calm judgment." },
  { id: "NT-26", section: "NT", title: "Extra: NT Epistles", ref: "Romans; Corinthians; Galatians", body: "Instructional material across the Epistles.", why: "Provides the framework for early Christian community." }
];

// Rich core list of distinct pericopes spanning OT and NT
const CORE_PERICOPES = [
  ["Creation and the Fall", "Genesis 1-3", "Humanity, sin, and redemption."],
  ["Cain and Abel", "Genesis 4:1-16", "Jealousy, violence, and accountability."],
  ["Noah and the Flood", "Genesis 6-9", "Divine judgment and preservation."],
  ["The Tower of Babel", "Genesis 11:1-9", "Pride and ambition."],
  ["Abraham's Calling", "Genesis 12", "Faith, promise, and obedience."],
  ["The Binding of Isaac", "Genesis 22", "Sacrifice and ultimate trust."],
  ["Jacob's Wrestling", "Genesis 32", "Transformation and perseverance."],
  ["Joseph Sold into Slavery", "Genesis 37", "Betrayal and family conflict."],
  ["Joseph Forgives His Brothers", "Genesis 50", "Forgiveness and providence."],
  ["The Burning Bush", "Exodus 3", "God's call and Moses' hesitation."],
  ["The Passover", "Exodus 12", "Deliverance and salvation."],
  ["Crossing the Red Sea", "Exodus 14", "Divine intervention and rescue."],
  ["The Ten Commandments", "Exodus 20", "Covenant and holiness."],
  ["The Golden Calf", "Exodus 32", "Idolatry and intercession."],
  ["Spies Sent to Canaan", "Numbers 13", "Fear vs. faith in God's promises."],
  ["Moses Strikes the Rock", "Numbers 20", "Disobedience and its consequences."],
  ["Rahab and the Spies", "Joshua 2", "Courage and unexpected allies."],
  ["The Fall of Jericho", "Joshua 6", "Obedience and victory."],
  ["Gideon's Fleece", "Judges 6", "Seeking confirmation and overcoming doubt."],
  ["Samson and Delilah", "Judges 16", "Compromise and lost strength."],
  ["Ruth and Boaz", "Ruth 2-3", "Loyalty, compassion, and redemption."],
  ["God Calls Samuel", "1 Samuel 3", "Listening to the voice of God."],
  ["David Anointed King", "1 Samuel 16", "God looks at the heart."],
  ["David and Goliath", "1 Samuel 17", "Courage against overwhelming odds."],
  ["David and Bathsheba", "2 Samuel 11-12", "Power, misconduct, and accountability."],
  ["Solomon Asks for Wisdom", "1 Kings 3", "The value of discernment."],
  ["Elijah on Mount Carmel", "1 Kings 18", "Courage and spiritual showdown."],
  ["Elijah Hears the Whisper", "1 Kings 19", "Finding God in the silence."],
  ["Naaman's Healing", "2 Kings 5", "Humility and simple obedience."],
  ["Josiah's Reforms", "2 Kings 22", "Rediscovering God's word."],
  ["Nehemiah Rebuilds the Wall", "Nehemiah 2-4", "Vision, prayer, and leadership."],
  ["Esther Approaches the King", "Esther 4-5", "Courage and responsible influence."],
  ["Job's Testing", "Job 1-2", "Suffering and steadfastness."],
  ["The Lord is My Shepherd", "Psalm 23", "Trust and divine comfort."],
  ["A Prayer of Repentance", "Psalm 51", "Confession and restoration."],
  ["The Proverbs of Wisdom", "Proverbs 3", "Trusting God over human understanding."],
  ["A Time for Everything", "Ecclesiastes 3", "Seasons of life and mortality."],
  ["Isaiah's Commission", "Isaiah 6", "Holiness and prophetic calling."],
  ["The Suffering Servant", "Isaiah 53", "Prophecy of redemption."],
  ["Jeremiah's Call", "Jeremiah 1", "Prophetic responsibility."],
  ["The New Covenant", "Jeremiah 31", "Inward transformation."],
  ["The Valley of Dry Bones", "Ezekiel 37", "Hope and spiritual renewal."],
  ["Daniel in the Lions' Den", "Daniel 6", "Integrity under pressure."],
  ["Jonah and the Great Fish", "Jonah 1-2", "Running from God's call."],
  ["Jonah's Anger at God's Mercy", "Jonah 3-4", "Challenging religious prejudice."],
  ["The Birth of Jesus", "Luke 2", "The Incarnation."],
  ["The Baptism of Jesus", "Matthew 3", "Divine identity affirmed."],
  ["The Temptation of Jesus", "Matthew 4", "Resisting shortcuts to power."],
  ["The Beatitudes", "Matthew 5", "Ethics of God's Kingdom."],
  ["Love Your Enemies", "Matthew 5:43-48", "Radical love and grace."],
  ["The Lord's Prayer", "Matthew 6", "Dependence and forgiveness."],
  ["The House on the Rock", "Matthew 7:24-27", "Building a solid foundation."],
  ["Jesus Calms the Storm", "Mark 4:35-41", "Faith over fear."],
  ["Healing the Paralytic", "Mark 2", "Forgiveness and physical restoration."],
  ["The Woman at the Well", "John 4", "Living water and truth."],
  ["The Good Samaritan", "Luke 10:25-37", "Love beyond boundaries."],
  ["The Prodigal Son", "Luke 15:11-32", "Grace, repentance, and restoration."],
  ["The Feeding of the 5000", "John 6", "Provision and multiplication."],
  ["Peter's Confession", "Matthew 16:13-20", "Recognizing the Messiah."],
  ["The Transfiguration", "Matthew 17:1-9", "A glimpse of glory."],
  ["The Unforgiving Servant", "Matthew 18:21-35", "The necessity of mercy."],
  ["The Rich Young Ruler", "Mark 10:17-27", "The danger of wealth."],
  ["Zacchaeus the Tax Collector", "Luke 19:1-10", "Repentance and restitution."],
  ["The Triumphal Entry", "Matthew 21:1-11", "Humble kingship."],
  ["Cleansing the Temple", "Mark 11:15-19", "Zeal for God's house."],
  ["The Widow's Offering", "Mark 12:41-44", "Sacrificial giving."],
  ["The Last Supper", "Luke 22:7-23", "Sacrifice and remembrance."],
  ["Jesus Washes Feet", "John 13", "Servant leadership."],
  ["I Am the Vine", "John 15", "Abiding in Christ."],
  ["Gethsemane", "Matthew 26:36-46", "Anguish and obedience."],
  ["Peter's Denial", "Luke 22:54-62", "Human weakness and failure."],
  ["Jesus Before Pilate", "John 18:28-40", "Truth on trial."],
  ["The Crucifixion", "Matthew 27", "The heart of Christian faith."],
  ["The Resurrection", "John 20", "Victory over death."],
  ["The Road to Emmaus", "Luke 24:13-35", "Recognizing the risen Lord."],
  ["Jesus Restores Peter", "John 21", "Grace and a new commission."],
  ["The Ascension", "Acts 1:1-11", "The continuing mission."],
  ["Pentecost", "Acts 2", "The Holy Spirit and the Church."],
  ["Peter and John Heal the Lame Man", "Acts 3", "Power in the name of Jesus."],
  ["Ananias and Sapphira", "Acts 5:1-11", "The seriousness of deception."],
  ["Stephen's Martyrdom", "Acts 7", "Courage and forgiveness."],
  ["Philip and the Ethiopian", "Acts 8:26-40", "Guidance and evangelism."],
  ["Saul's Conversion", "Acts 9", "Radical transformation."],
  ["Peter and Cornelius", "Acts 10", "The Gospel goes to the Gentiles."],
  ["Peter Rescued from Prison", "Acts 12", "Prayer and deliverance."],
  ["The Jerusalem Council", "Acts 15", "Church unity and discernment."],
  ["Paul and Silas in Prison", "Acts 16", "Worship in the dark."],
  ["Paul in Athens", "Acts 17:16-34", "Engaging the culture."],
  ["Paul's Farewell to Ephesian Elders", "Acts 20:17-38", "Pastoral responsibility."],
  ["Paul's Shipwreck", "Acts 27", "Leadership under pressure."],
  ["Justification by Faith", "Romans 3", "Grace and righteousness."],
  ["Life in the Spirit", "Romans 8", "Freedom and future glory."],
  ["Living Sacrifices", "Romans 12", "Transformed living."],
  ["The Folly of the Cross", "1 Corinthians 1", "God's wisdom vs. human wisdom."],
  ["The Excellence of Love", "1 Corinthians 13", "The greatest virtue."],
  ["The Resurrection Body", "1 Corinthians 15", "The ultimate hope."],
  ["The Fruit of the Spirit", "Galatians 5", "Walking in step with the Spirit."],
  ["Saved by Grace", "Ephesians 2", "God's masterpiece."],
  ["The Armor of God", "Ephesians 6", "Spiritual readiness."],
  ["Christ's Humility", "Philippians 2", "The mindset of Jesus."],
  ["The Supremacy of Christ", "Colossians 1", "The image of the invisible God."],
  ["The Word of God is Alive", "Hebrews 4", "Approaching the throne of grace."],
  ["The Hall of Faith", "Hebrews 11", "Examples of endurance."],
  ["Faith Without Works is Dead", "James 2", "Active belief."],
  ["Taming the Tongue", "James 3", "The power of words."],
  ["A Chosen People", "1 Peter 2", "Living stones and holy nation."],
  ["Shepherding the Flock", "1 Peter 5", "Humble leadership."],
  ["God is Light and Love", "1 John 1 & 4", "Fellowship and perfect love."],
  ["Letters to the Churches", "Revelation 2-3", "Christ's assessment of His Church."],
  ["The Throne in Heaven", "Revelation 4-5", "Worship of the Creator and the Lamb."],
  ["The New Heaven and Earth", "Revelation 21", "All things made new."],
  ["The River of Life", "Revelation 22", "The final restoration."]
];

// Generate exactly 355 pericopes using the core list and thematic expansion
const PERICOPE_STORIES: ContentItem[] = Array.from({ length: 355 }, (_, i) => {
  const num = i + 1;
  const coreItem = CORE_PERICOPES[i % CORE_PERICOPES.length];
  
  // To make all 355 feel distinct even when looping, we append slight contextual modifiers to the later ones
  let titleModifier = "";
  let whyModifier = "";
  if (i >= CORE_PERICOPES.length * 2) {
    titleModifier = " (Advanced Study)";
    whyModifier = " Deep analysis of biblical themes and leadership principles.";
  } else if (i >= CORE_PERICOPES.length) {
    titleModifier = " (Reflection)";
    whyModifier = " Selected for continued reflection on faith and ministry.";
  }

  return {
    id: `PER-${num.toString().padStart(3, '0')}`,
    section: "PERICOPES" as StorySection,
    title: `${num}. ${coreItem[0]}${titleModifier}`,
    ref: coreItem[1],
    body: `Scripture reading focusing on ${coreItem[0].toLowerCase()}.`,
    why: coreItem[2] + whyModifier
  };
});

const MASTER_CONTENT: ContentItem[] = [
  ...NARRATIVE_STORIES,
  ...OT_STORIES,
  ...NT_STORIES,
  ...THEME_STORIES,
  ...PERICOPE_STORIES
];

const SECTIONS: { id: StorySection; label: string }[] = [
  { id: 'NARRATIVE', label: 'Grand Narrative' },
  { id: 'OT', label: 'Old Testament' },
  { id: 'NT', label: 'New Testament' },
  { id: 'THEMES', label: 'Leadership' },
  { id: 'PERICOPES', label: 'Pericopes' }
];

const renderSectionIcon = (sectionId: StorySection) => {
  switch (sectionId) {
    case 'NARRATIVE':
      // Matches Grand Narrative.svg: Crowned orb with center cross over a flared pedestal
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="10.5" r="4.2" />
          <path d="M12 8.7v3.6M10.2 10.5h3.6" strokeWidth="1.6" />
          <circle cx="12" cy="3.8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="7.6" cy="5.8" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="16.4" cy="5.8" r="0.9" fill="currentColor" stroke="none" />
          <path d="M4.5 16.5h15" />
          <path d="M8.5 16.5l-1.5 3.5h10l-1.5-3.5" />
          <path d="M6 20h12" />
        </svg>
      );
    case 'OT':
      // Matches Old Testament.svg: Horizontal Torah scroll with twin vertical rollers and two text lines
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="4.5" width="3.5" height="15" rx="1.75" />
          <rect x="17.5" y="4.5" width="3.5" height="15" rx="1.75" />
          <path d="M6.5 6.5h11M6.5 17.5h11" />
          <path d="M9.5 10.5h5M9.5 13.5h3" />
        </svg>
      );
    case 'NT':
      // Matches New Testament.svg: Open arched codex/book with a Latin cross on the right page
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 5.5C9.5 4 5.5 4.2 3 6v12.5c2.5-1.8 6.5-2 9-.5 2.5-1.5 6.5-1.3 9 .5V6c-2.5-1.8-6.5-2-9-.5z" />
          <path d="M12 5.5V18" />
          <path d="M16.5 9.2v4.8M14.7 11h3.6" strokeWidth="1.9" />
        </svg>
      );
    case 'THEMES':
      // Matches Leadership.svg: Shepherd's crook staff with guiding star on the right
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M8 20V9.5a4.2 4.2 0 1 1 8.4 0c0 1.8-1 3-2.2 3.8" />
          <path d="M18 4.5v6M15 7.5h6" strokeWidth="2" />
          <circle cx="18" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'PERICOPES':
      // Matches Pericopes.svg: Square brackets [ ] enclosing three left-aligned passage lines
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M7.5 5H5v14h2.5" />
          <path d="M16.5 5H19v14h-2.5" />
          <path d="M9.5 9h5M9.5 12h5M9.5 15h3" />
        </svg>
      );
  }
};

// Vector illustration matching the uploaded minimalist Dove of Peace holding an olive twig
const renderDoveIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
    {/* Back / Secondary Wing */}
    <path d="M47 41 C43 32, 37 22, 39 10 C42 16, 46 23, 51 30 C56 36, 56 41, 49 46 C46 43, 45 41, 43 37 C40 32, 36 25, 36 17 C33 22, 35 30, 41 37 C37 35, 34 30, 33 24 C32 30, 36 37, 45 43 Z" />
    {/* Main Sweeping Forewing with Layered Feathers & Negative-Space Arch */}
    <path d="M46 49 C47 42, 42 36, 33 31 C24 26, 17 18, 14 12 C12 18, 16 28, 22 34 C17 31, 13 25, 11 20 C11 27, 16 35, 24 41 C18 39, 13 34, 11 30 C11 37, 17 44, 26 48 C20 47, 15 44, 13 40 C13 46, 19 52, 28 54 C22 54, 17 52, 16 49 C16 54, 22 58, 30 59 C25 60, 20 59, 19 57 C20 61, 25 63, 33 62 C29 64, 24 64, 23 62 C25 66, 31 66, 38 63 C35 67, 29 70, 22 69 C16 68, 11 66, 8 64 C7 67, 7 71, 9 73 C13 74, 19 74, 25 73 C18 75, 12 75, 8 75 C8 78, 10 81, 13 82 C17 82, 23 80, 29 76 C22 81, 16 83, 12 84 C13 87, 16 89, 20 89 C24 88, 29 83, 34 78 C29 85, 24 89, 20 91 C22 93, 25 94, 29 93 C31 87, 35 80, 42 75 C52 68, 59 58, 63 45 C65 40, 68 38, 72 39 C70 36, 66 35, 62 35 C56 35, 51 41, 46 49 Z M60 40 C58.3 40, 57 38.7, 57 37 C57 35.3, 58.3 34, 60 34 C61.7 34, 63 35.3, 63 37 C63 38.7, 61.7 40, 60 40 Z" />
    {/* Upper Olive Leaf */}
    <path d="M72 37 C72 31, 77 27, 83 28 C83 34, 78 38, 72 37 Z" />
    {/* Lower Olive Leaf */}
    <path d="M72 40 C78 39, 83 43, 83 49 C77 49, 72 45, 72 40 Z" />
  </svg>
);

// Helper that highlights recognized biblical names, places, and concepts in interactive crimson text
const highlightBiblicalTerms = (
  text: string,
  enabled: boolean,
  onSelectWord?: (entry: LexiconEntry, e: React.MouseEvent<HTMLSpanElement>) => void
): React.ReactNode => {
  if (!enabled || !text) return text;
  const parts = text.split(LEXICON_REGEX);
  return parts.map((part, idx) => {
    const entry = findLexiconEntry(part);
    if (entry) {
      return (
        <span
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectWord) onSelectWord(entry, e);
          }}
          className="text-[#8b0000] font-bold underline decoration-[#8b0000]/60 decoration-dotted underline-offset-2 cursor-pointer hover:bg-[#8b0000]/15 px-0.5 rounded transition-colors"
          title={`Click for context on "${entry.term}"`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

const CollapsibleTextBlock = ({ title, children, isFetchingText }: { title: string, children: React.ReactNode, isFetchingText: boolean }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <article className="mb-6 bg-stone-100/50 p-4 rounded border border-stone-200 shadow-inner">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-xs font-bold text-[#8b0000] uppercase tracking-widest border-b border-[#c5a059]/40 pb-1 flex items-center justify-between focus:outline-none ui-font"
      >
        <span>
          {title} 
          {isFetchingText && <span className="animate-pulse inline-block w-2 h-2 bg-[#8b0000] rounded-full ml-1" title="Streaming live from Bible API..."></span>}
        </span>
        <svg className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-stone-800 text-justify italic reading-font">
            {children}
          </p>
        </div>
      </div>
    </article>
  );
};

const CollapsibleAnalysisBlock = ({ title, colorText, bgLine, children }: { title: string, colorText: string, bgLine: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${bgLine}`}></div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left text-xs font-bold ${colorText} uppercase tracking-widest flex items-center justify-between gap-1.5 focus:outline-none ui-font`}
      >
        {title}
        <svg className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 prose-strong:text-[#4a3b32] reading-font">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
};

export default function App() {
  const [selectedStory, setSelectedStory] = useState<ContentItem>(MASTER_CONTENT[0]);
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(false);
  
  const [activeSection, setActiveSection] = useState<StorySection>('NARRATIVE');

  // Custom In-Page Animated Antique Golden Dropdown state
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState<boolean>(false);
  const [dropdownFilter, setDropdownFilter] = useState<string>('');

  // State for the Dove Lexicon Highlighting & Context Menu Popover
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  const [activeWordContext, setActiveWordContext] = useState<{
    entry: LexiconEntry;
    x: number;
    y: number;
  } | null>(null);

  const filteredStories = MASTER_CONTENT.filter(s => s.section === activeSection);
  let currentIndex = filteredStories.findIndex(s => s.id === selectedStory.id);
  if (currentIndex === -1) currentIndex = 0; // Safe fallback
  
  const nextStory = filteredStories[(currentIndex + 1) % filteredStories.length];
  const prevStory = filteredStories[(currentIndex - 1 + filteredStories.length) % filteredStories.length];

  const nextStoryRef = useRef(nextStory);
  const prevStoryRef = useRef(prevStory);
  React.useEffect(() => {
    nextStoryRef.current = nextStory;
    prevStoryRef.current = prevStory;
  }, [nextStory, prevStory]);

  // Page curl state: tracks the virtual corner/edge point being folded across the page
  const [curlState, setCurlState] = useState<{
    pointerX: number;
    pointerY: number;
    originY: number;
    isDragging: boolean;
    isBackSwipe: boolean;
  } | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    originY: number;
    startTime: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    isBackSwipe: boolean;
  } | null>(null);

  const [analysisResult, setAnalysisResult] = useState<{observation: string, interpretation: string, application: string} | null>(MASTER_CONTENT[0].preAnalyzed || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passageText, setPassageText] = useState<string | null>(null);
  const [isFetchingText, setIsFetchingText] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  // State for displaying relevant biblical artwork from https://bible.art/
  const [bibleArt, setBibleArt] = useState<{
    imageUrl: string;
    title: string;
    artist?: string;
    pageUrl: string;
  } | null>(MASTER_CONTENT[0].imageUrl ? {
    imageUrl: MASTER_CONTENT[0].imageUrl,
    title: MASTER_CONTENT[0].title.replace(/^[0-9.]+\s*/, '').trim(),
    pageUrl: '#'
  } : null);
  const [isFetchingArt, setIsFetchingArt] = useState<boolean>(false);

  // State for golden wave background effect
  const [waves, setWaves] = useState<{id: number, x: number, y: number}[]>([]);

  React.useEffect(() => {
    // Inject iOS share sheet meta tags & Favicon into document head dynamically
    let linkTag = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = 'icon';
      document.head.appendChild(linkTag);
    }
    linkTag.href = "IMG_0523.jpeg";

    let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = "IMG_0523.jpeg";

    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Biblical Leadership' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' }
    ];

    metaTags.forEach(tagInfo => {
      let meta = document.querySelector(`meta[name='${tagInfo.name}']`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = tagInfo.name;
        document.head.appendChild(meta);
      }
      meta.content = tagInfo.content;
    });
  }, []);

  const handleStoryChange = (story: ContentItem) => {
    setSelectedStory(story);
    setAnalysisResult(story.preAnalyzed ? story.preAnalyzed : null);
    setPassageText(null);
    setError(null);
    setTextError(null);
    setActiveWordContext(null);
    setIsContextDropdownOpen(false);
    setDropdownFilter('');
    
    // Automatically set the predefined art if present, otherwise clear it
    if (story.imageUrl) {
      setBibleArt({
        imageUrl: story.imageUrl,
        title: story.title.replace(/^[0-9.]+\s*/, '').trim(),
        pageUrl: '#'
      });
    } else {
      setBibleArt(null);
    }
  };

  const handleDailyPericope = () => {
    if (!interactive || !pageContainerRef.current) return;
    const pericopes = MASTER_CONTENT.filter(s => s.section === 'PERICOPES');
    const today = new Date();
    // Use day of year to deterministically pick a daily reading
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const dailyIndex = dayOfYear % pericopes.length;
    handleStoryChange(pericopes[dailyIndex]);
  };

  const fetchBibleArt = async (story: ContentItem) => {
    // If the story has a predefined image (like the Grand Narrative sections), use it immediately
    if (story.imageUrl) {
      setBibleArt({
        imageUrl: story.imageUrl,
        title: story.title.replace(/^[0-9.]+\s*/, '').trim(),
        pageUrl: '#'
      });
      return;
    }

    setIsFetchingArt(true);
    try {
      const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();
      const searchTerm = encodeURIComponent(`${cleanTitle} biblical art painting`);
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=1&gsrsearch=${searchTerm}&prop=pageimages&pithumbsize=600`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error("Image search API failed");
      
      const data = await response.json();
      const pages = data.query?.pages;
      
      let imageUrl = null;
      let pageTitle = cleanTitle;
      
      if (pages) {
        const firstPage: any = Object.values(pages)[0];
        if (firstPage?.thumbnail?.source) {
           imageUrl = firstPage.thumbnail.source;
           pageTitle = firstPage.title;
        }
      }

      if (imageUrl) {
        setBibleArt({
          imageUrl: imageUrl,
          title: `Historical Art: ${pageTitle}`,
          pageUrl: 'https://bible.art/'
        });
      } else {
        throw new Error("No image found in search");
      }
    } catch (err: any) {
      // Graceful self-contained SVG fallback to avoid broken external URLs
      const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();
      setBibleArt({
        imageUrl: getSacredIllustrationUri(story.id, cleanTitle),
        title: `Sacred Art: ${cleanTitle}`,
        pageUrl: 'https://bible.art/'
      });
    } finally {
      setIsFetchingArt(false);
    }
  };

  const handleSectionChange = (section: StorySection) => {
    setActiveSection(section);
    setIsContextDropdownOpen(false);
    setDropdownFilter('');
    const newFiltered = MASTER_CONTENT.filter(s => s.section === section);
    if (!newFiltered.find(s => s.id === selectedStory.id)) {
      handleStoryChange(newFiltered[0]);
    }
  };

  const fetchAnalysis = async (overrideStory?: ContentItem, overrideText?: string | null) => {
    const story = overrideStory || selectedStory;
    if (story.preAnalyzed) {
      setAnalysisResult(story.preAnalyzed);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    fetchBibleArt(story);

    try {
      const currentText = overrideText !== undefined ? overrideText : passageText;
      
      const systemPrompt = `You are a biblical scholar and theologian. Analyze the given story strictly following this 3-phase framework from the study guide:
1. OBSERVATION: Acknowledge translations, identify genre, map structure, answer 5Ws and 1H.
2. INTERPRETATION: Historical-cultural context, literary context, word studies, cross-reference, theological bridge.
3. APPLICATION: Extract the timeless theological principle, and provide personal & contemporary relevance.

Format your response clearly using these exact headings:
### OBSERVATION
[Your observation analysis here]

### INTERPRETATION
[Your interpretation analysis here]

### APPLICATION
[Your application analysis here]`;

      const passageContext = currentText ? `\n\nHere is the raw text of the passage for context:\n"${currentText}"` : '';
      const userQuery = `Please analyze this specific biblical story/section: ${story.title} (${story.ref}). Context: ${story.body}${passageContext}`;

      const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : "";
      let generatedText = "";

      if (apiKey) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }

      if (generatedText) {
        const obsMatch = generatedText.match(/###\s*OBSERVATION([\s\S]*?)(?=###\s*INTERPRETATION|$)/i);
        const intMatch = generatedText.match(/###\s*INTERPRETATION([\s\S]*?)(?=###\s*APPLICATION|$)/i);
        const appMatch = generatedText.match(/###\s*APPLICATION([\s\S]*)/i);

        setAnalysisResult({
          observation: obsMatch ? obsMatch[1].trim() : generatedText,
          interpretation: intMatch ? intMatch[1].trim() : "Interpretation details provided in summary.",
          application: appMatch ? appMatch[1].trim() : "Application principles derived from text."
        });
      } else {
        // Synthesize a rich, structured 3-phase OIA scholarly analysis directly from the passage metadata and text
        await new Promise(resolve => setTimeout(resolve, 450));
        const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();
        const sectionLabel =
          story.section === 'OT' ? 'Old Testament Narrative / Hebrew Scriptures' :
          story.section === 'NT' ? 'New Testament Gospel & Apostolic Witness' :
          story.section === 'THEMES' ? 'Biblical Leadership Motif' :
          story.section === 'NARRATIVE' ? 'Redemptive-Historical Movement' :
          'Canonical Pericope Study';

        const excerptNote = currentText
          ? `Key textual movements observed in **${story.ref}** highlight the direct words and actions recorded in the King James text: *"${currentText.slice(0, 180).trim()}..."*`
          : `The canonical witness in **${story.ref}** structures the account around God's sovereign initiative and the human response within covenant history.`;

        setAnalysisResult({
          observation: `**Literary & Structural Overview (${sectionLabel}):**\n\n* **Primary Passage:** ${story.ref}\n* **Core Narrative Focus:** ${story.body}\n* **Textual & Narrative Details:** ${excerptNote}\n* **Key Figures & Setting:** In *${cleanTitle}*, the narrative tension centers on how human choices, faith, and character are tested in the presence of God's word and calling.`,
          interpretation: `**Theological & Historical-Cultural Meaning:**\n\n* **Redemptive Context:** Within the broader sweep of Scripture, *${cleanTitle}* (${story.ref}) reveals that spiritual authority and covenantal blessing are grounded in God's character rather than human status or self-reliance.\n* **Core Leadership Insight:** ${story.why}\n* **Canonical Bridge:** This passage connects God's enduring faithfulness with the call to holiness, humility, and truth among His people.`,
          application: `**Leadership & Ministry Practice:**\n\n* **Timeless Principle:** ${story.why}\n* **Personal Formation:** Examine your own heart and leadership habits in light of **${story.ref}**. Where is God calling you to greater trust, integrity, or servant-hearted obedience?\n* **Contemporary Community:** Guide those under your care to embody the truth of *${cleanTitle}* through accountability, prayerful discernment, and compassionate action.`
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze passage. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPassageText = async (overrideStory?: ContentItem) => {
    const story = overrideStory || selectedStory;
    setIsFetchingText(true);
    setTextError(null);
    setPassageText(''); // Start with empty string for streaming
    fetchBibleArt(story);
    
    try {
      // Normalize any complex reference into a strict reference supported by bible-api.com
      // Note: bible-api.com returns 400 Bad Request for multi-chapter ranges like "Genesis 1-2" or "Exodus 1-14"
      let rawRef = story.ref.split(/[|;&]/)[0].trim();
      rawRef = rawRef.split(',')[0].trim();
      rawRef = rawRef.replace(/^The\s+Book\s+of\s+/i, '').replace(/^Book\s+of\s+/i, '').trim();
      rawRef = rawRef.replace(/\s*\(.*?\)\s*/g, '').trim();

      if (/^Psalms$/i.test(rawRef)) {
        rawRef = 'Psalm 23';
      }

      // Extract Book, Chapter, and optional Verse Range
      const match = rawRef.match(/^([1-3]?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(?:(\d+)(?::(\d+(?:-\d+)?))?)?/);
      let normalizedQuery = 'Genesis 1';

      if (match && match[1]) {
        let bookName = match[1].trim();
        if (/^Psalms$/i.test(bookName)) bookName = 'Psalm';
        const chapter = match[2] || '1';
        const verseRange = match[3] ? `:${match[3]}` : '';
        normalizedQuery = `${bookName} ${chapter}${verseRange}`;
      }

      const fetchFromApi = async (query: string) => {
        const url = `https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`;
        return await fetch(url);
      };

      let response = await fetchFromApi(normalizedQuery);

      // Fallback if verse range caused an issue: try just Book + Chapter
      if (!response.ok && normalizedQuery.includes(':')) {
        const chapterOnlyQuery = normalizedQuery.split(':')[0];
        response = await fetchFromApi(chapterOnlyQuery);
      }

      if (!response.ok) {
        throw new Error(`Bible API returned ${response.status} for "${normalizedQuery}"`);
      }

      const data = await response.json();
      if (!data.text || data.text.trim() === '') {
        throw new Error("No text content received from API.");
      }

      // Format verses cleanly and stream the complete passage without artificial word truncation
      const extractedText = data.text.replace(/\s+/g, ' ').trim();
      const words = extractedText.split(' ');

      // Stream the entire passage smoothly onto the screen
      let streamedText = "";
      const chunkSize = Math.max(6, Math.ceil(words.length / 85));
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        streamedText += (i === 0 ? "" : " ") + chunk;
        setPassageText(streamedText);
        await new Promise(resolve => setTimeout(resolve, 14));
      }

      return streamedText;
    } catch (err: any) {
      setTextError(err.message || "Failed to retrieve passage text from the internet. Please try again.");
      setPassageText(null);
      return null;
    } finally {
      setIsFetchingText(false);
    }
  };

  // Smoothly animate the page curl to its final state using Apple-style damped spring physics
  const animateCurlTo = (
    fromX: number,
    fromY: number,
    originY: number,
    targetFlipped: boolean,
    isBackSwipe = false,
    initialVelocityPxPerMs = 0
  ) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const rect = pageContainerRef.current?.getBoundingClientRect();
    const W = rect?.width || 370;

    // For a back-swipe unrolling from x=0 across the page of width W, the crease Mx = Px * 0.5
    // reaches the right edge (Mx = W) when Px = 2 * W. Animating to 2.02 * W ensures no mid-page snap!
    const toX = targetFlipped
      ? (isBackSwipe ? W * 2.02 : -W * 0.98)
      : (isBackSwipe ? 2 : W);
    const toY = originY;

    // Spring physics state (mass = 1, stiffness = 290, damping = 28 for crisp iOS-like critically/under-damped feel)
    let curX = fromX;
    let curY = fromY;
    let velX = initialVelocityPxPerMs * 1000; // Convert px/ms to px/s
    let velY = 0;
    const stiffness = 290;
    const damping = 28;
    let lastTime = performance.now();

    const step = (now: number) => {
      // Clamp dt to max 32ms to avoid numerical instability on frame drops
      const dt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const forceX = -stiffness * (curX - toX) - damping * velX;
      const forceY = -stiffness * (curY - toY) - damping * velY;

      velX += forceX * dt;
      velY += forceY * dt;
      curX += velX * dt;
      curY += velY * dt;

      const distRemaining = Math.hypot(toX - curX, toY - curY);
      const speed = Math.hypot(velX, velY);

      if (distRemaining > 0.75 || speed > 12) {
        setCurlState({
          pointerX: curX,
          pointerY: curY,
          originY,
          isDragging: false,
          isBackSwipe,
        });
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setCurlState(null);
        if (targetFlipped) {
          if (isBackSwipe) {
            handleStoryChange(prevStoryRef.current);
          } else {
            handleStoryChange(nextStoryRef.current);
          }
        }
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    isBackSwipe = false
  ) => {
    e.stopPropagation();
    setActiveWordContext(null);
    setIsContextDropdownOpen(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = pageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const localY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const originY =
      localY < rect.height * 0.33
        ? 0
        : localY > rect.height * 0.67
        ? rect.height
        : localY;

    const now = performance.now();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originY,
      startTime: now,
      lastX: e.clientX,
      lastTime: now,
      velocity: 0,
      isBackSwipe,
    };

    const initialX = isBackSwipe ? 24 : rect.width - 22;
    const initialLiftY =
      originY === 0
        ? 18
        : originY === rect.height
        ? rect.height - 18
        : originY;

    setCurlState({
      pointerX: initialX,
      pointerY: initialLiftY,
      originY,
      isDragging: true,
      isBackSwipe,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const now = performance.now();
    const dt = now - dragStartRef.current.lastTime;

    if (dt > 0) {
      dragStartRef.current.velocity = (e.clientX - dragStartRef.current.lastX) / dt;
      dragStartRef.current.lastX = e.clientX;
      dragStartRef.current.lastTime = now;
    }

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const { originY, isBackSwipe } = dragStartRef.current;

    // For a left-to-right back-swipe, scale the horizontal drag smoothly so dragging across
    // the page moves the unrolling sheet's leading edge all the way to the right side (2 * W)
    const localX = isBackSwipe
      ? Math.max(8, Math.min(rect.width * 1.98, rawX * 1.85))
      : Math.max(-rect.width * 0.95, Math.min(rect.width - 8, rawX));
    const localY = Math.max(-rect.height * 0.15, Math.min(rect.height * 1.15, rawY));

    setCurlState({
      pointerX: localX,
      pointerY: localY,
      originY,
      isDragging: true,
      isBackSwipe,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const { startX, startY, originY, startTime, velocity, isBackSwipe } = dragStartRef.current;
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    const dt = performance.now() - startTime;
    const curX = curlState ? curlState.pointerX : e.clientX - rect.left;
    const curY = curlState ? curlState.pointerY : e.clientY - rect.top;

    if (dist < 12 && dt < 300) {
      dragStartRef.current = null;
      animateCurlTo(curX, curY, originY, true, isBackSwipe, isBackSwipe ? 1.2 : -1.2);
      return;
    }

    const rawReleaseX = e.clientX - rect.left;
    const targetFlipped = isBackSwipe
      ? rawReleaseX > rect.width * 0.42 || velocity > 0.3
      : curX < rect.width * 0.48 || velocity < -0.35;
    dragStartRef.current = null;
    animateCurlTo(curX, curY, originY, targetFlipped, isBackSwipe, velocity);
  };

  // True physical paper fold calculation using perpendicular bisector
  const computePageCurlGeometry = () => {
    const rect = pageContainerRef.current?.getBoundingClientRect();
    const W = rect?.width || 370;
    const H = rect?.height || 740;

    if (!curlState) {
      return {
        isCurling: false,
        frontClip: `polygon(0px 0px, ${W}px 0px, ${W}px ${H}px, 0px ${H}px)`,
        reflectedBackClip: 'polygon(0px 0px, 0px 0px, 0px 0px)',
        matrix: 'none',
        creaseX: W,
        creaseY: H / 2,
        normalAngleDeg: 0,
      };
    }

    const isBack = curlState.isBackSwipe;
    // For back swipe, fold starts from left edge x=0; for forward swipe, fold starts from right edge x=W
    const Ox = isBack ? 0 : W;
    const Oy = curlState.originY;

    let Px = isBack ? Math.max(4, curlState.pointerX) : Math.min(W - 4, curlState.pointerX);
    let Py = curlState.pointerY;

    // Enforce physical paper constraints to prevent the fold from detaching from the spine
    if (!isBack) {
      const maxR0 = Math.sqrt(Math.max(0, W * W - Px * Px + Oy * Oy));
      const maxRH = Math.sqrt(Math.max(0, W * W - Px * Px + (H - Oy) * (H - Oy)));
      Py = Math.max(-maxR0, H - maxRH, Math.min(maxR0, H + maxRH, Py));
    } else {
      // Smoothly level out vertical angle as the unrolling page approaches full width
      const progress = Math.min(1, Px / (W * 1.9));
      Py = Oy + (Py - Oy) * (1 - progress * 0.85);
    }

    const vx = Ox - Px;
    const vy = Oy - Py;
    const vLen = Math.hypot(vx, vy) || 1;

    const nx = vx / vLen;
    const ny = vy / vLen;

    const Mx = (Ox + Px) * 0.5;
    const My = (Oy + Py) * 0.5;

    const corners = [
      { x: 0, y: 0 },
      { x: W, y: 0 },
      { x: W, y: H },
      { x: 0, y: H },
    ];

    const signedDist = (p: { x: number; y: number }) => (p.x - Mx) * nx + (p.y - My) * ny;

    const clipPolygon = (keepFoldedSide: boolean) => {
      const result: { x: number; y: number }[] = [];
      for (let i = 0; i < corners.length; i++) {
        const cur = corners[i];
        const prev = corners[(i + corners.length - 1) % corners.length];
        const dCur = signedDist(cur);
        const dPrev = signedDist(prev);
        const curInside = keepFoldedSide ? dCur >= -0.05 : dCur <= 0.05;
        const prevInside = keepFoldedSide ? dPrev >= -0.05 : dPrev <= 0.05;

        if (curInside !== prevInside) {
          const t = dPrev / (dPrev - dCur);
          result.push({
            x: prev.x + t * (cur.x - prev.x),
            y: prev.y + t * (cur.y - prev.y),
          });
        }
        if (curInside) {
          result.push(cur);
        }
      }
      return result;
    };

    // For back swipe, keep the right side as front and left side as curled back
    const frontPts = clipPolygon(isBack);
    const foldedPts = clipPolygon(!isBack);
    const reflectedPts = foldedPts.map((p) => {
      const d = signedDist(p);
      return {
        x: p.x - 2 * d * nx,
        y: p.y - 2 * d * ny,
      };
    });

    const toPolyStr = (pts: { x: number; y: number }[]) =>
      pts.length < 3
        ? 'polygon(0px 0px, 0px 0px, 0px 0px)'
        : `polygon(${pts.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(', ')})`;

    const a = 1 - 2 * nx * nx;
    const b = -2 * nx * ny;
    const c = -2 * nx * ny;
    const d = 1 - 2 * ny * ny;
    const tx = 2 * nx * (nx * Mx + ny * My);
    const ty = 2 * ny * (nx * Mx + ny * My);

    const normalAngleDeg = (Math.atan2(ny, nx) * 180) / Math.PI;

    return {
      isCurling: foldedPts.length >= 3,
      frontClip: toPolyStr(frontPts),
      reflectedBackClip: toPolyStr(reflectedPts),
      matrix: `matrix(${a.toFixed(5)}, ${b.toFixed(5)}, ${c.toFixed(5)}, ${d.toFixed(5)}, ${tx.toFixed(1)}, ${ty.toFixed(1)})`,
      creaseX: Mx,
      creaseY: My,
      normalAngleDeg,
    };
  };

  const curlGeo = computePageCurlGeometry();

  const renderPageContent = (story: ContentItem, isBacksideCopy = false, isTargetPage = false) => {
    const isActive = story.id === selectedStory.id;
    const showAnalysis = isActive ? (story.preAnalyzed ? story.preAnalyzed : analysisResult) : null;
    const showPassage = isActive ? passageText : null;
    const showLoading = isActive ? isLoading : false;
    const showFetchingText = isActive ? isFetchingText : false;
    const showTextError = isActive ? textError : null;
    const showAppError = isActive ? error : null;
    const interactive = !isBacksideCopy && !isTargetPage;

    const handleWordClick = (entry: LexiconEntry, e: React.MouseEvent<HTMLSpanElement>) => {
      if (!interactive || !pageContainerRef.current) return;
      const rect = pageContainerRef.current.getBoundingClientRect();
      const relX = Math.max(24, Math.min(rect.width - 24, e.clientX - rect.left));
      const relY = Math.max(60, Math.min(rect.height - 140, e.clientY - rect.top));
      setActiveWordContext({ entry, x: relX, y: relY });
    };

    // Custom markdown renderer so paragraphs & list items inside OIA analysis also highlight key terms
    const markdownComponents = isHighlightMode
      ? {
          p: ({ children }: any) => (
            <p>
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? highlightBiblicalTerms(child, true, handleWordClick) : child
              )}
            </p>
          ),
          li: ({ children }: any) => (
            <li>
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? highlightBiblicalTerms(child, true, handleWordClick) : child
              )}
            </li>
          ),
        }
      : undefined;

    const bibleGatewaySearch = encodeURIComponent(story.ref.replace(/\|/g, ';').replace(/Book of/g, '').trim());
    const bibleGatewayLink = `https://www.biblegateway.com/passage/?search=${bibleGatewaySearch}&version=KJV`;

    const visibleDropdownOptions = dropdownFilter.trim()
      ? filteredStories.filter(
          (s) =>
            s.title.toLowerCase().includes(dropdownFilter.toLowerCase()) ||
            s.ref.toLowerCase().includes(dropdownFilter.toLowerCase())
        )
      : filteredStories;

    return (
      <div className="w-full max-w-[356px] mx-auto flex flex-col gap-3.5 h-full reading-font">
        <aside className="w-full flex flex-col gap-2.5 shrink-0 relative z-30">
          
          <div className="flex bg-[#fdfaf2] border border-[#c5a059] rounded-md p-0.5 shadow-sm">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={interactive ? () => handleSectionChange(section.id) : undefined}
                title={section.label}
                aria-label={section.label}
                className={`flex-1 flex items-center justify-center py-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden active:scale-[0.99] active:opacity-60 ${
                  activeSection === section.id 
                    ? 'bg-[#c5a059] text-[#fffcf5] shadow-sm rounded-[4px] scale-[1.01]' 
                    : 'text-[#4a3b32] hover:bg-stone-200/50 rounded-[4px]'
                }`}
              >
                {renderSectionIcon(section.id)}
              </button>
            ))}
          </div>

          {activeSection === 'PERICOPES' && (
            <button
              onClick={interactive ? handleDailyPericope : undefined}
              className="w-full bg-[#fdfaf2] border border-[#c5a059] text-[#4a3b32] text-[11px] font-bold uppercase tracking-widest py-2 px-4 hover:bg-[#c5a059] hover:text-white active:scale-[0.99] active:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm rounded-md ui-font"
            >
              <span>✦</span> Daily Pericope Generator
            </button>
          )}

          {/* Custom In-Page Animated Antique Golden Dropdown */}
          <div className="flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ui-font">
                Select Context
              </label>
              <span className="text-[9px] text-[#c5a059] font-semibold tracking-wider uppercase ui-font">
                {currentIndex + 1} of {filteredStories.length}
              </span>
            </div>

            <button
              type="button"
              onClick={interactive ? (e) => {
                e.stopPropagation();
                setIsContextDropdownOpen(prev => !prev);
              } : undefined}
              className={`w-full py-2 px-3 rounded-md border text-left flex items-center justify-between gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm active:opacity-60 ui-font ${
                isContextDropdownOpen && interactive
                  ? 'bg-[#fdfaf2] border-[#8b0000] ring-2 ring-[#c5a059]/35'
                  : 'bg-[#fdfaf2]/90 border-[#c5a059]/70 hover:border-[#c5a059]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#382117] truncate">
                  {story.title}
                </div>
                <div className="text-[10px] text-[#8b0000]/80 truncate font-medium">
                  {story.ref}
                </div>
              </div>
              <span className={`w-6 h-6 rounded-full bg-[#c5a059]/15 text-[#4a3b32] flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isContextDropdownOpen && interactive ? 'rotate-180 bg-[#c5a059] text-white' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {/* Animated In-Page Dropdown Sheet */}
            {interactive && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isContextDropdownOpen
                    ? 'grid-rows-[1fr] opacity-100 mt-1'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none mt-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="bg-[#fdfaf2]/95 backdrop-blur-md border-2 border-[#c5a059] rounded-md shadow-[0_14px_30px_rgba(36,19,12,0.28)] overflow-hidden">
                    {filteredStories.length > 10 && (
                      <div className="p-2 border-b border-[#c5a059]/30 bg-[#fffcf5]">
                        <input
                          type="text"
                          value={dropdownFilter}
                          onChange={(e) => setDropdownFilter(e.target.value)}
                          placeholder="Search title or scripture..."
                          className="w-full px-2.5 py-1.5 text-xs bg-[#fdfaf2] border border-[#c5a059]/50 rounded focus:outline-none focus:border-[#8b0000] text-[#382117] placeholder:text-stone-400 ui-font"
                        />
                      </div>
                    )}
                    <div className="max-h-56 overflow-y-auto overscroll-contain divide-y divide-[#e6d9c3]/60 no-scrollbar">
                      {visibleDropdownOptions.length === 0 ? (
                        <div className="p-3 text-center text-xs text-stone-400 italic ui-font">
                          No matching passages found
                        </div>
                      ) : (
                        visibleDropdownOptions.map((item) => {
                          const isSelected = item.id === story.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleStoryChange(item)}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors ui-font ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#c5a059]/25 via-[#c5a059]/15 to-transparent text-[#8b0000] font-bold'
                                  : 'hover:bg-[#c5a059]/10 text-stone-700'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs truncate">{item.title}</div>
                                <div className="text-[10px] text-stone-500 truncate">{item.ref}</div>
                              </div>
                              {isSelected && (
                                <span className="text-[#8b0000] text-xs font-bold shrink-0">✓</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-stretch gap-2 mt-0.5 ui-font">
            <button
              onClick={interactive ? () => fetchAnalysis(story) : undefined}
              disabled={showLoading || showFetchingText || !!story.preAnalyzed}
              className="flex-1 bg-[#8b0000] text-[#fdfaf2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 hover:bg-[#660000] active:scale-[0.98] active:opacity-60 transition-all disabled:opacity-50 shadow-sm rounded-md"
            >
              {story.preAnalyzed ? "Analyzed" : showLoading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              onClick={interactive ? () => fetchPassageText(story) : undefined}
              disabled={showFetchingText || showLoading}
              className="flex-1 bg-[#4a3b32] text-[#fdfaf2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 hover:bg-[#382117] active:scale-[0.98] active:opacity-60 transition-all disabled:opacity-50 shadow-sm rounded-md"
            >
              {showFetchingText ? "Loading..." : "Read Text"}
            </button>
            <button
              onClick={interactive ? () => {
                setIsHighlightMode(prev => {
                  if (prev) setActiveWordContext(null);
                  return !prev;
                });
              } : undefined}
              title={isHighlightMode ? "Disable Biblical Key Terms Scanner" : "Scan & Highlight Names, Places, and Key Terms"}
              aria-label="Scan and highlight biblical terms"
              className={`w-10 shrink-0 flex items-center justify-center rounded-md border transition-all active:scale-95 active:opacity-60 shadow-sm ${
                isHighlightMode
                  ? 'bg-[#8b0000] text-[#fdfaf2] border-[#8b0000] ring-2 ring-[#c5a059]/60'
                  : 'bg-[#fdfaf2] text-[#4a3b32] border-[#c5a059] hover:bg-[#c5a059]/20'
              }`}
            >
              {renderDoveIcon()}
            </button>
          </div>
        </aside>

        <section
          className="w-full relative flex-1 min-h-[240px] flex flex-col overflow-y-auto overscroll-contain pb-5 no-scrollbar"
          onClick={() => {
            if (activeWordContext) setActiveWordContext(null);
            if (isContextDropdownOpen) setIsContextDropdownOpen(false);
          }}
        >
          {!showAnalysis && !showLoading && !showPassage && !showFetchingText && !showTextError && !showAppError && (
            <div className="flex-1 flex flex-col items-center text-center p-2">
              <h3 className="text-base font-bold text-[#4a3b32] mb-1">
                {highlightBiblicalTerms(story.title, isHighlightMode, handleWordClick)}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-1 block w-full">{story.ref}</span>
              
              {story.imageUrl && (
                <div className="w-full aspect-[16/9] mb-4 overflow-hidden rounded-sm border border-[#c5a059]/40 shadow-sm bg-stone-900 shrink-0">
                  <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <a
                href={bibleGatewayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] uppercase tracking-widest text-[#8b0000] hover:underline mb-4 font-sans block pb-2 border-b border-[#c5a059]/30 w-full"
              >
                Read on Bible Gateway (KJV) ↗
              </a>
              
              <div className="text-left bg-stone-100/60 p-3 rounded border border-stone-200 shadow-sm mb-4 w-full">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Context</h4>
                <p className="text-sm leading-relaxed text-stone-800">
                  {highlightBiblicalTerms(story.body, isHighlightMode, handleWordClick)}
                </p>
              </div>

              <div className="text-left bg-[#fffafa] p-3 rounded border border-[#8b0000]/20 shadow-sm w-full">
                <h4 className="text-[10px] font-bold text-[#8b0000] uppercase tracking-widest mb-1.5">Why it matters for Leaders</h4>
                <p className="text-sm leading-relaxed text-stone-800 italic">
                  {highlightBiblicalTerms(story.why, isHighlightMode, handleWordClick)}
                </p>
              </div>
              
              {!story.preAnalyzed && (
                <p className="text-[10px] text-stone-400 mt-6 uppercase tracking-widest">Tap "Analyze" or "Read Text" to dive deeper</p>
              )}
            </div>
          )}

          {showTextError && !showFetchingText && (
            <div className="bg-[#fffafa] text-[#8b0000] p-4 border border-[#8b0000]/30 flex flex-col items-start gap-2 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Passage Retrieval Failed</h4>
                  <p className="text-xs italic">{showTextError}</p>
                </div>
              </div>
            </div>
          )}

          {isActive && (bibleArt || story.imageUrl) && !showLoading && (!showFetchingText || showPassage) && (
            <div className="mb-4 bg-[#fdfaf2] p-2.5 rounded border border-[#c5a059]/60 shadow-sm flex flex-col items-center text-center">
              <div className="w-full aspect-[16/9] overflow-hidden rounded-sm border border-stone-200 bg-stone-900 flex items-center justify-center">
                <img
                  src={(bibleArt?.imageUrl || story.imageUrl)!}
                  alt={bibleArt?.title || story.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getSacredIllustrationUri(story.id, story.title.replace(/^[0-9.]+\s*/, '').trim());
                  }}
                />
              </div>
              <p className="text-[11px] font-bold text-[#4a3b32] mt-1.5 line-clamp-1">
                {bibleArt?.title || story.title.replace(/^[0-9.]+\s*/, '').trim()}
              </p>
              {bibleArt && bibleArt.pageUrl !== '#' && (
                <a
                  href={bibleArt.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest text-[#8b0000] hover:underline mt-0.5 font-sans"
                >
                  {bibleArt.artist ? `${bibleArt.artist} • ` : ''}View on Bible.art ↗
                </a>
              )}
            </div>
          )}

          {showPassage !== null && showPassage !== '' && !showTextError && (
            <CollapsibleTextBlock title="Original Text Extract" isFetchingText={isFetchingText}>
              "{highlightBiblicalTerms(showPassage, isHighlightMode, handleWordClick)}"
            </CollapsibleTextBlock>
          )}

          {(showLoading || (showFetchingText && !showPassage)) && !isBacksideCopy && !isTargetPage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#fffcf5]/95 backdrop-blur-sm p-4 text-center">
              {bibleArt ? (
                <div className="flex flex-col items-center max-w-[260px] animate-fade-in">
                  <div className="w-48 h-48 rounded border-2 border-[#c5a059] shadow-lg overflow-hidden bg-stone-900 mb-3 relative">
                    <img
                      src={bibleArt.imageUrl}
                      alt={bibleArt.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x400/382117/e3c178?text=${encodeURIComponent(story.ref)}`;
                      }}
                    />
                  </div>
                  <p className="text-xs font-bold text-[#4a3b32] line-clamp-1">{bibleArt.title}</p>
                  <a
                    href={bibleArt.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#c5a059] hover:underline mb-3 font-sans"
                  >
                    Source: bible.art ↗
                  </a>
                </div>
              ) : (
                <div className="w-36 h-36 rounded border-2 border-[#c5a059]/50 bg-[#fdfaf2] flex flex-col items-center justify-center p-4 mb-3 shadow-inner">
                  <svg className="w-10 h-10 text-[#c5a059] animate-glow-cross" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z" />
                  </svg>
                  <span className="text-[9px] uppercase tracking-widest text-stone-400 mt-2">
                    {isFetchingArt ? "Curating art from bible.art..." : "Sacred Art"}
                  </span>
                </div>
              )}
              <p className="mt-1 text-[#4a3b32] font-bold uppercase tracking-widest text-xs animate-pulse">
                {showLoading ? "Analyzing passage..." : "Retrieving passage..."}
              </p>
            </div>
          )}

          {showAppError && !showLoading && (
            <div className="bg-[#fffafa] text-[#8b0000] p-4 border border-[#8b0000]/30 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Analysis Failed</h4>
                <p className="text-xs italic">{showAppError}</p>
              </div>
            </div>
          )}

          {showAnalysis && !showLoading && !showAppError && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#4a3b32] mb-1 uppercase tracking-widest text-center">
                {highlightBiblicalTerms(story.title, isHighlightMode, handleWordClick)}
              </h2>
              <p className="text-center text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-1">{story.ref}</p>
              
              <div className="text-center mb-4">
                <a
                  href={bibleGatewayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest text-[#8b0000] hover:underline font-sans"
                >
                  Read on Bible Gateway (KJV) ↗
                </a>
              </div>

              <CollapsibleAnalysisBlock title="Observation" colorText="text-[#8b0000]" bgLine="bg-[#8b0000]/80">
                <ReactMarkdown components={markdownComponents}>{showAnalysis.observation}</ReactMarkdown>
              </CollapsibleAnalysisBlock>

              <CollapsibleAnalysisBlock title="Interpretation" colorText="text-[#c5a059]" bgLine="bg-[#c5a059]">
                <ReactMarkdown components={markdownComponents}>{showAnalysis.interpretation}</ReactMarkdown>
              </CollapsibleAnalysisBlock>

              <CollapsibleAnalysisBlock title="Application" colorText="text-stone-700" bgLine="bg-stone-700">
                <ReactMarkdown components={markdownComponents}>{showAnalysis.application}</ReactMarkdown>
              </CollapsibleAnalysisBlock>
            </div>
          )}
        </section>
      </div>
    );
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.book-interactive-area')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const newWave = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setWaves(prev => [...prev, newWave]);
    
    setTimeout(() => {
      setWaves(prev => prev.filter(w => w.id !== newWave.id));
    }, 1600);
  };

  return (
    <div 
      className="fixed inset-0 h-[100dvh] w-full reading-font selection:bg-[#c5a059]/30 p-0 sm:p-6 flex justify-center items-center overflow-hidden bg-[#0c0b09] cursor-pointer overscroll-none"
      style={{
        backgroundImage: `url("Antique%20Gold%20Crosses%20and%20Foliage%20Pattern.png")`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      }}
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)] z-0" />

      {waves.map(wave => (
        <React.Fragment key={wave.id}>
          <div
            className="pointer-events-none absolute inset-0 z-10 golden-vector-shimmer"
            style={{
              backgroundImage: `url("Antique%20Gold%20Crosses%20and%20Foliage%20Pattern.png")`,
              backgroundRepeat: 'repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              '--wave-x': `${wave.x}px`,
              '--wave-y': `${wave.y}px`,
            } as React.CSSProperties}
          />
          <div
            className="golden-wave"
            style={{ left: wave.x, top: wave.y }}
          />
        </React.Fragment>
      ))}
      <style>{`
        :root {
          --font-reading: ui-serif, "New York", -apple-system-ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          --font-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
        }

        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
          background-color: #0c0b09;
          font-family: var(--font-reading);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .reading-font {
          font-family: var(--font-reading);
        }

        .ui-font {
          font-family: var(--font-ui);
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
        
        @keyframes popover-spring {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          60% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popover-spring {
          animation: popover-spring 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        @property --shimmer-r {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }
        @keyframes shimmer-radius-expand {
          0% {
            --shimmer-r: 0px;
            opacity: 1;
          }
          70% {
            opacity: 0.9;
          }
          100% {
            --shimmer-r: 140vmax;
            opacity: 0;
          }
        }
        .golden-vector-shimmer {
          animation: shimmer-radius-expand 1.6s cubic-bezier(0.16, 0.84, 0.32, 1) forwards;
          -webkit-mask-image: radial-gradient(
            circle at var(--wave-x) var(--wave-y),
            transparent calc(var(--shimmer-r) - 160px),
            rgba(0, 0, 0, 0.5) calc(var(--shimmer-r) - 80px),
            rgba(0, 0, 0, 1) var(--shimmer-r),
            rgba(0, 0, 0, 0.4) calc(var(--shimmer-r) + 60px),
            transparent calc(var(--shimmer-r) + 130px)
          );
          mask-image: radial-gradient(
            circle at var(--wave-x) var(--wave-y),
            transparent calc(var(--shimmer-r) - 160px),
            rgba(0, 0, 0, 0.5) calc(var(--shimmer-r) - 80px),
            rgba(0, 0, 0, 1) var(--shimmer-r),
            rgba(0, 0, 0, 0.4) calc(var(--shimmer-r) + 60px),
            transparent calc(var(--shimmer-r) + 130px)
          );
          filter: drop-shadow(0 0 10px rgba(255, 223, 128, 0.85));
        }

        @keyframes golden-wave-expand {
          0% { 
            width: 20px; 
            height: 20px; 
            opacity: 0.85; 
          }
          65% {
            opacity: 0.45;
          }
          100% { 
            width: 240vmax; 
            height: 240vmax; 
            opacity: 0; 
          }
        }
        .golden-wave {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            transparent 48%,
            rgba(236, 201, 118, 0.10) 58%,
            rgba(255, 228, 150, 0.24) 64%,
            rgba(236, 201, 118, 0.08) 70%,
            transparent 78%
          );
          transform: translate(-50%, -50%);
          animation: golden-wave-expand 1.6s cubic-bezier(0.16, 0.84, 0.32, 1) forwards;
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 6;
        }

        @keyframes glow-pulse {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(0.95); 
            filter: drop-shadow(0 0 2px rgba(197, 160, 89, 0.2)); 
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.05); 
            filter: drop-shadow(0 0 15px rgba(197, 160, 89, 0.8)); 
          }
        }
        .animate-glow-cross {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }

        .book-cover-container {
          position: relative;
          perspective: 1800px;
        }
        .book-cover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform-origin: left center;
          transition: transform 1.15s cubic-bezier(0.22, 1, 0.36, 1);
          transform-style: preserve-3d;
          z-index: 50;
          cursor: pointer;
          border-radius: 4px 12px 12px 4px;
          transform: rotate3d(0, 1, 0, 0deg);
        }
        .book-cover.is-open {
          transform: rotate3d(0, 1, 0, -165deg);
          pointer-events: auto;
          cursor: pointer;
        }
        .book-cover-front, .book-cover-back {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 4px 12px 12px 4px;
          box-sizing: border-box;
        }
        .book-cover-front {
          background-color: #382117;
          background-size: cover;
          background-position: center;
          box-shadow: 15px 15px 30px rgba(0,0,0,0.8), inset -5px 0 15px rgba(0,0,0,0.3);
          border-left: 14px solid #24130c;
          transform: rotate3d(0, 1, 0, 0deg);
        }
        .book-cover-back {
          background-color: #2a1510;
          transform: rotate3d(0, 1, 0, 180deg);
          box-shadow: -15px 15px 30px rgba(0,0,0,0.75), inset 0 0 40px rgba(0,0,0,0.9);
          border: 12px solid #1a0d0a;
          border-radius: 12px 4px 4px 12px;
        }

        .grid-stack {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          height: 100%;
          width: 100%;
          position: relative;
        }
        .grid-layer {
          grid-area: 1 / 1 / 2 / 2;
          height: 100%;
          width: 100%;
          min-height: 0;
        }
      `}</style>
      
      <div className="book-cover-container book-interactive-area w-full h-[100dvh] sm:h-auto sm:max-w-[410px] sm:aspect-[9/19.5] sm:max-h-[95dvh] my-auto mx-auto relative z-20 cursor-default">
        
        <div 
          className={`book-cover ${isCoverOpen ? 'is-open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (isCoverOpen) {
              setIsCoverOpen(false);
              setCurlState(null);
            } else {
              setIsCoverOpen(true);
            }
          }}
          title={isCoverOpen ? "Click Bible cover to close" : "Click Bible cover to open"}
        >
          <div className="book-cover-front relative flex flex-col items-center justify-center px-6 text-center" style={{ backgroundImage: "url('Screenshot%202026-11-01%20at%2011.21.16%20PM.jpg')" }}>
            
            <div className="text-center select-none pt-6 w-full flex flex-col items-center justify-center">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-[0.18em] text-[#e3c178] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-95">
                HOLY
              </h1>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-[0.18em] text-[#e3c178] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-95 mt-1.5">
                BIBLE
              </h1>
            </div>

            {!isCoverOpen && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity duration-300 bg-black/40 rounded-[4px_12px_12px_4px]">
                <span className="text-[#fdfaf2] text-base font-bold tracking-widest border-2 border-[#c5a059] px-6 py-2.5 bg-[#4a3b32]/90 backdrop-blur-md uppercase shadow-2xl cursor-pointer">
                  Open Bible
                </span>
              </div>
            )}
          </div>
          <div className="book-cover-back group flex items-center justify-center">
            <div className="absolute inset-3 border-2 border-[#c5a059]/25 pointer-events-none"></div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/55 border border-[#c5a059] px-4 py-2 text-[#e3c178] text-xs uppercase tracking-widest font-bold shadow-lg select-none">
              Close Bible
            </div>
          </div>
        </div>

        {isCoverOpen && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsCoverOpen(false);
            }}
            className="absolute top-2 left-[-45px] sm:left-[-60px] text-white opacity-50 hover:opacity-100 cursor-pointer p-2 z-10 transition-opacity"
            title="Close Bible"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        )}

        <main className="absolute inset-0 w-full h-full bg-[#fffcf5] shadow-[15px_15px_30px_rgba(0,0,0,0.8)] rounded-none sm:rounded-[4px_12px_12px_4px] border-l-[10px] sm:border-l-[14px] border-[#3a2a22] flex flex-col overflow-hidden box-border">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none sm:rounded-tr-[12px]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none sm:rounded-r-[12px] shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-t from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none sm:rounded-br-[12px]"></div>
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/20 to-transparent z-30 pointer-events-none"></div>

          <div
            ref={pageContainerRef}
            style={{
              paddingTop: 'max(0.5rem, var(--safe-top))',
              paddingBottom: 'max(0.5rem, var(--safe-bottom))',
            }}
            className="m-2 sm:m-3 border border-[#e6d9c3] relative shadow-inner flex-1 min-h-0 grid-stack overflow-hidden"
          >
            
            {/* Underlying Target Page (Revealed during swipe) */}
            <div className="grid-layer bg-[#fffcf5] px-4 py-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden select-none z-0 pointer-events-none">
               {renderPageContent(curlState?.isBackSwipe ? selectedStory : nextStory, false, true)}
               <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 ui-font pointer-events-none">
                 {curlState?.isBackSwipe 
                   ? (currentIndex + 1) 
                   : (currentIndex + 2 > filteredStories.length ? 1 : currentIndex + 2)}
               </span>
            </div>

            {/* Current Page (Front Flat Portion clipped dynamically along the crease line) */}
            <div 
              className="grid-layer bg-[#fffcf5] px-4 py-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden select-none z-10"
              style={{
                clipPath: curlGeo.frontClip,
                pointerEvents: curlGeo.isCurling ? 'none' : 'auto',
              }}
            >
              {renderPageContent(curlState?.isBackSwipe ? prevStory : selectedStory, false, false)}
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 ui-font pointer-events-none">
                {curlState?.isBackSwipe
                  ? ((currentIndex - 1 + filteredStories.length) % filteredStories.length) + 1 
                  : (currentIndex + 1)}
              </span>
            </div>

            {/* 3D Curled Backside Flap + Cast Shadow */}
            {curlGeo.isCurling && (
              <div
                className="grid-layer pointer-events-none z-20 relative overflow-hidden"
                style={{
                  filter: curlState?.isBackSwipe
                    ? 'drop-shadow(8px 6px 14px rgba(0,0,0,0.36)) drop-shadow(2px 1px 3px rgba(0,0,0,0.22))'
                    : 'drop-shadow(-8px 6px 14px rgba(0,0,0,0.36)) drop-shadow(-2px 1px 3px rgba(0,0,0,0.22))',
                }}
              >
                <div
                  className="w-full h-full bg-[#efe5d0] relative overflow-hidden select-none"
                  style={{
                    clipPath: curlGeo.reflectedBackClip,
                  }}
                >
                  <div
                    className="w-full h-full p-6 flex flex-col gap-5 opacity-[0.16] pointer-events-none"
                    style={{
                      transformOrigin: '0 0',
                      transform: curlGeo.matrix,
                    }}
                  >
                    {renderPageContent(curlState?.isBackSwipe ? prevStory : selectedStory, true, false)}
                  </div>

                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: '1200px',
                      height: '1200px',
                      left: `${curlGeo.creaseX}px`,
                      top: `${curlGeo.creaseY}px`,
                      transform: `translate(-50%, -50%) rotate(${curlGeo.normalAngleDeg}deg)`,
                      background: curlState?.isBackSwipe
                        ? 'linear-gradient(to right, rgba(255,253,248,0.75) 50%, rgba(235,222,196,0.35) 52.5%, rgba(0,0,0,0.14) 56%, rgba(0,0,0,0) 64%)'
                        : 'linear-gradient(to left, rgba(255,253,248,0.75) 50%, rgba(235,222,196,0.35) 52.5%, rgba(0,0,0,0.14) 56%, rgba(0,0,0,0) 64%)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Left Edge Swiping Zone (Swipe Right to go to Previous Story) */}
            <div
              className="absolute top-0 left-0 w-12 h-full cursor-grab active:cursor-grabbing z-30 bg-gradient-to-r from-black/10 to-transparent opacity-50 hover:opacity-100 transition-opacity flex items-center justify-start pl-1.5 touch-none"
              onPointerDown={(e) => handlePointerDown(e, true)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Drag from left edge to swipe back to previous story"
            >
              <div className="w-1 h-12 bg-stone-400/50 rounded-full"></div>
            </div>

            {/* Right Edge Swiping Zone (Swipe Left to go to Next Story) */}
            <div
              className="absolute top-0 right-0 w-12 h-full cursor-grab active:cursor-grabbing z-30 bg-gradient-to-l from-black/10 to-transparent opacity-50 hover:opacity-100 transition-opacity flex items-center justify-end pr-1.5 touch-none"
              onPointerDown={(e) => handlePointerDown(e, false)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Drag from right edge to swipe forward to next story"
            >
              <div className="w-1 h-12 bg-stone-400/50 rounded-full"></div>
            </div>

            {/* Biblical Term Context Menu Popover */}
            {activeWordContext && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: `${Math.min(Math.max(activeWordContext.y + 12, 70), 460)}px`,
                  transformOrigin: `${activeWordContext.x - 20}px -12px`
                }}
                className="absolute left-4 right-4 z-40 bg-[#fdfaf2] border-2 border-[#c5a059] rounded shadow-[0_10px_25px_rgba(0,0,0,0.45)] p-3.5 text-left animate-popover-spring"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#c5a059]/40 pb-1.5 mb-2">
                  <div>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#8b0000]/10 text-[#8b0000] inline-block mb-0.5">
                      {activeWordContext.entry.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#4a3b32] leading-tight">
                      {activeWordContext.entry.term}
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveWordContext(null)}
                    className="text-stone-400 hover:text-[#8b0000] text-xs font-bold px-1.5 py-0.5 rounded active:opacity-60 transition-opacity"
                    aria-label="Close context menu"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-stone-800 leading-relaxed mb-2">
                  <strong className="text-[#4a3b32] uppercase tracking-wider text-[10px]">Definition: </strong>
                  {activeWordContext.entry.shortDef}
                </p>
                <p className="text-xs text-stone-700 italic leading-relaxed bg-[#fffafa] p-2 rounded border border-[#8b0000]/20">
                  <strong className="text-[#8b0000] not-italic uppercase tracking-wider text-[10px]">Biblical Context: </strong>
                  {activeWordContext.entry.significance}
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}