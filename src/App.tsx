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

interface BookmarkedSentence {
  id: string;
  sentence: string;
  storyId: string;
  storyTitle: string;
  storyRef: string;
  timestamp: string;
}

type GranularScopeType = 'WORD_IN_SENTENCE' | 'SENTENCE_IN_VERSE' | 'VERSE_IN_PASSAGE' | 'PASSAGE_IN_BIBLE';

interface GranularAnalysisResult {
  heading: string;
  focalElement: string;
  contextualMeaning: string;
  linguisticOrLiteraryNote: string;
  practicalInsight: string;
  crossReferences: string[];
}

// Full Structured AI Biblical Scholar Analysis Interface
export interface ExtendedAnalysisData {
  overview?: string;
  observation: string;
  interpretation: string;
  application: string;
  historicalCulturalContext?: string;
  theologicalSignificance?: string;
  biblicalConnections?: Array<{
    reference: string;
    connectionType: string;
    description: string;
    significance: string;
  }>;
  keyTerms?: Array<{
    term: string;
    originalLanguage?: string;
    definition: string;
    relevance: string;
  }>;
  beginnerSummary?: string;
  keyTakeaways?: string[];
  commonMisunderstandings?: string[];
  reflectionQuestions?: Array<{
    question: string;
    level: string;
  }>;
  interpretationCaveats?: string[];
}

const BIBLICAL_LEXICON: Record<string, LexiconEntry> = {
  "God": { term: "God (Elohim / YHWH)", category: "Person", shortDef: "Webster 1828: The Supreme Being; Jehovah; the eternal and infinite Spirit, creator and sovereign of the universe.", significance: "Reveals Himself through creation, redemption, and covenant faithfulness across all of Scripture." },
  "Lord": { term: "The Lord (Adonai / Kyrios)", category: "Person", shortDef: "Webster 1828: Master; ruler; governor; a title of supreme power, applied in Scripture to God and Christ.", significance: "Affirms God's rightful rule over history and the believer's call to wholehearted allegiance." },
  "Jesus": { term: "Jesus Christ (Yeshua)", category: "Person", shortDef: "Webster 1828: Savior; Jehovah saves. The personal name of the Son of God incarnate.", significance: "Fulfils the Old Testament covenants through His life, sacrificial death, and bodily resurrection." },
  "Christ": { term: "Christ (Messiah / Anointed One)", category: "Person", shortDef: "Webster 1828: Anointed; the title given to the Savior and Deliverer of mankind, consecrated by God.", significance: "Identifies Jesus as the long-awaited King who inaugurates God's eternal Kingdom." },
  "Holy Spirit": { term: "The Holy Spirit (Ruach / Pneuma)", category: "Person", shortDef: "Webster 1828: The third person of the Holy Trinity; the divine Comforter, inspirer, and sanctifier.", significance: "Indwells believers, forms the Church at Pentecost, and produces spiritual fruit and gifts for ministry." },
  "Spirit": { term: "The Spirit of God", category: "Person", shortDef: "Webster 1828: An immaterial, intelligent being; breath; the divine influence animating the soul.", significance: "Empowers leaders, prophets, and the Church for faithful witness and transformation." },
  "Adam": { term: "Adam", category: "Person", shortDef: "Webster 1828: Earthy, red earth; the first man created by God, federal head of humanity.", significance: "Entrusted with stewarding Eden; his disobedience introduced sin, contrasting with Christ the Last Adam." },
  "Eve": { term: "Eve", category: "Person", shortDef: "Webster 1828: Living, mother of all living; the first woman, wife of Adam.", significance: "Created as an equal partner in bearing God's image and stewarding creation." },
  "Eden": { term: "Garden of Eden", category: "Place", shortDef: "Webster 1828: Pleasure, delight; the paradise prepared by God for the habitation of innocent man.", significance: "Represents unbroken fellowship with God, later echoed in the New Jerusalem of Revelation." },
  "Cain": { term: "Cain", category: "Person", shortDef: "Webster 1828: Possession, acquisition; firstborn son of Adam and Eve who slew Abel.", significance: "His jealousy and murder of Abel illustrate how quickly sin corrupts human brotherhood." },
  "Abel": { term: "Abel", category: "Person", shortDef: "Webster 1828: Vanity, breath, vapor; second son of Adam and Eve, righteous shepherd.", significance: "Offered an acceptable sacrifice by faith and became the first martyr in biblical history." },
  "Noah": { term: "Noah", category: "Person", shortDef: "Webster 1828: Rest, repose; patriarch chosen by God to build the Ark and preserve humanity.", significance: "Models steadfast obedience in a corrupt generation and receives God's rainbow covenant." },
  "Babel": { term: "Tower of Babel", category: "Place", shortDef: "Webster 1828: Confusion; the city and tower where God confounded human language.", significance: "Symbolizes collective human hubris and self-exaltation apart from God." },
  "Abraham": { term: "Abraham", category: "Person", shortDef: "Webster 1828: Father of a great multitude; patriarch called out of Ur of the Chaldees.", significance: "Model of justification by faith; through his lineage God promised to bless all nations." },
  "Isaac": { term: "Isaac", category: "Person", shortDef: "Webster 1828: Laughter, rejoicing; miracle son of promise born to Abraham and Sarah.", significance: "His near-sacrifice on Mount Moriah foreshadows God's provision of a sacrificial Lamb." },
  "Jacob": { term: "Jacob (Israel)", category: "Person", shortDef: "Webster 1828: He who supplants, heel-catcher; son of Isaac and father of the twelve tribes.", significance: "Wrestled with God at Peniel, where his name was changed from 'supplanter' to 'Israel'." },
  "Esau": { term: "Esau", category: "Person", shortDef: "Webster 1828: Hairy, formed; twin brother of Jacob who sold his birthright.", significance: "His eventual reconciliation with Jacob demonstrates the healing of deep family division." },
  "Joseph": { term: "Joseph", category: "Person", shortDef: "Webster 1828: Addition, increase; eleventh son of Jacob who governed Egypt during famine.", significance: "Exemplifies integrity under temptation, administrative wisdom, and radical forgiveness." },
  "Egypt": { term: "Egypt", category: "Place", shortDef: "Webster 1828: That troubles or oppresses; ancient empire of the Nile where Israel was enslaved.", significance: "The stage for the Exodus deliverance, symbolizing bondage from which God redeems His people." },
  "Moses": { term: "Moses", category: "Person", shortDef: "Webster 1828: Drawn out of the water; lawgiver, prophet, and leader of Israel in the Exodus.", significance: "Models humble intercessory leadership, mediating the Sinai covenant between God and Israel." },
  "Sinai": { term: "Mount Sinai (Horeb)", category: "Place", shortDef: "Webster 1828: A bush of brambles, hostility; sacred mountain where the Law was given.", significance: "Site of the burning bush, covenant ratification, and Elijah's later encounter with God's whisper." },
  "Israel": { term: "Israel", category: "Place", shortDef: "Webster 1828: Who prevails with God; covenant name given to Jacob and his descendants.", significance: "Called to be a kingdom of priests and a light to the nations." },
  "Canaan": { term: "Land of Canaan", category: "Place", shortDef: "Webster 1828: Merchant, trader, humbled; the Promised Land pledged to Abraham's seed.", significance: "Represents God's tangible inheritance and rest for a trusting community." },
  "Joshua": { term: "Joshua", category: "Person", shortDef: "Webster 1828: Jehovah is salvation; successor to Moses who led Israel into Canaan.", significance: "Demonstrates courageous obedience and faithful transition of spiritual leadership." },
  "Jericho": { term: "Jericho", category: "Place", shortDef: "Webster 1828: His moon, city of fragrance; fortified Canaanite city whose walls fell.", significance: "Proves that spiritual victory comes through unconventional obedience to God's word." },
  "Ruth": { term: "Ruth", category: "Person", shortDef: "Webster 1828: Drunken, satisfied, beauty; Moabite widow devoted to Naomi.", significance: "Great-grandmother of King David and ancestor of Jesus, showing God's inclusion of outsiders." },
  "Naomi": { term: "Naomi", category: "Person", shortDef: "Webster 1828: My pleasantness, my amenity; mother-in-law of Ruth in Bethlehem.", significance: "Her journey from bitterness ('Mara') to restoration highlights God's redeeming providence." },
  "Boaz": { term: "Boaz", category: "Person", shortDef: "Webster 1828: In him is strength; wealthy Bethlehemite landowner and kinsman-redeemer.", significance: "Foreshadows Christ as our ultimate Kinsman-Redeemer who rescues the vulnerable." },
  "Samuel": { term: "Samuel", category: "Person", shortDef: "Webster 1828: Heard of God; last judge and prophet who anointed Israel's kings.", significance: "Guided Israel through political transition while reminding kings of their accountability to God." },
  "David": { term: "King David", category: "Person", shortDef: "Webster 1828: Well-beloved, dear; shepherd-king of Israel and psalmist.", significance: "Called 'a man after God's own heart'—honored for his faith and psalms, yet humbled by repentance." },
  "Goliath": { term: "Goliath of Gath", category: "Person", shortDef: "Webster 1828: Passage, revolution, uncovered; giant champion slain by David.", significance: "Represents intimidating worldly power overcome by reliance on the living God." },
  "Bathsheba": { term: "Bathsheba", category: "Person", shortDef: "Webster 1828: Daughter of the oath, daughter of abundance; wife of Uriah, mother of Solomon.", significance: "Her story exposes David's abuse of royal power while showing God's redemptive grace in Solomon's line." },
  "Nathan": { term: "Nathan the Prophet", category: "Person", shortDef: "Webster 1828: Given, giving; faithful court prophet who rebuked David.", significance: "Models the prophetic courage required to speak truth to power." },
  "Solomon": { term: "King Solomon", category: "Person", shortDef: "Webster 1828: Peaceful, perfect; king renowned for wisdom and builder of the Temple.", significance: "Illustrates both the pinnacle of royal wisdom and the tragedy of a divided, compromised heart." },
  "Elijah": { term: "Elijah", category: "Person", shortDef: "Webster 1828: God the Lord, my God is Jehovah; Tishbite prophet of fire and zeal.", significance: "Demonstrates bold prophetic zeal followed by vulnerable exhaustion and divine renewal." },
  "Baal": { term: "Baal", category: "Concept & Artifact", shortDef: "Webster 1828: Lord, master, owner; principal male deity of Phoenicians and Canaanites.", significance: "Represents the perennial temptation to trade covenant faithfulness for cultural syncretism." },
  "Babylon": { term: "Babylon", category: "Place", shortDef: "Webster 1828: Confusion, mixture; ancient Mesopotamian empire and capital of exile.", significance: "Archetype of worldly empire and cultural pressure where believers must maintain integrity." },
  "Daniel": { term: "Daniel", category: "Person", shortDef: "Webster 1828: Judgment of God; prophet in Babylon known for wisdom and integrity.", significance: "Models unwavering prayer, wisdom, and faithfulness in a pluralistic, hostile environment." },
  "Esther": { term: "Queen Esther", category: "Person", shortDef: "Webster 1828: Secret, hidden, myrtle; Jewish queen of Persia who saved her people.", significance: "Exemplifies strategic courage and using one's platform 'for such a time as this.'" },
  "Persia": { term: "Persia", category: "Place", shortDef: "Webster 1828: Cutting, horseman; great empire under Cyrus that released exiles.", significance: "Context for Esther's advocacy and Nehemiah's commission to rebuild Jerusalem." },
  "Nehemiah": { term: "Nehemiah", category: "Person", shortDef: "Webster 1828: Comforted of Jehovah; cupbearer who rebuilt Jerusalem's walls.", significance: "Premier biblical model of prayerful planning, vision-casting, and overcoming opposition." },
  "Jerusalem": { term: "Jerusalem (Zion)", category: "Place", shortDef: "Webster 1828: Vision of peace; holy city, capital of David and site of the Temple.", significance: "Center of redemptive history, pointing toward the heavenly New Jerusalem." },
  "Jonah": { term: "Jonah", category: "Person", shortDef: "Webster 1828: Dove; prophet sent to Nineveh who fled to Tarshish.", significance: "Exposes narrow religious nationalism and highlights God's boundless compassion for all peoples." },
  "Nineveh": { term: "Nineveh", category: "Place", shortDef: "Webster 1828: Handsome, agreeable habitation; capital of Assyria that repented.", significance: "Proves that no city or culture is beyond the reach of repentance and divine mercy." },
  "Job": { term: "Job", category: "Person", shortDef: "Webster 1828: Sorrowful, hated, patient sufferer; patriarch of Uz tried by affliction.", significance: "Teaches that authentic faith clings to God Himself even when suffering remains a mystery." },
  "Isaiah": { term: "Isaiah", category: "Person", shortDef: "Webster 1828: Salvation of Jehovah; eighth-century prophet of holiness and the Messiah.", significance: "Foretold the coming Messiah and the Suffering Servant who bears the sins of many." },
  "Jeremiah": { term: "Jeremiah", category: "Person", shortDef: "Webster 1828: Exaltation of Jehovah; weeping prophet of Judah's final days.", significance: "Prophesied the New Covenant in which God writes His law directly upon human hearts." },
  "Ezekiel": { term: "Ezekiel", category: "Person", shortDef: "Webster 1828: Strength of God; priest-prophet among the captives in Babylon.", significance: "Proclaimed God as the True Shepherd and envisioned the Valley of Dry Bones restored to life." },
  "Amos": { term: "Amos", category: "Person", shortDef: "Webster 1828: Loading, weighty, burden-bearer; shepherd prophet of social justice.", significance: "Insists that religious rituals are empty unless accompanied by justice rolling like waters." },
  "Bethlehem": { term: "Bethlehem", category: "Place", shortDef: "Webster 1828: House of bread; Judean town, birthplace of David and Jesus.", significance: "Demonstrates how God chooses humble, overlooked places to bring forth salvation." },
  "John": { term: "John (Apostle / Baptist)", category: "Person", shortDef: "Webster 1828: Grace or mercy of the Lord; forerunner or beloved apostle.", significance: "Witnesses to Jesus as the Lamb of God, the eternal Word, and the source of divine love." },
  "Samaritan": { term: "Samaritan", category: "Person", shortDef: "Webster 1828: Inhabitant of Samaria; mixed race viewed with prejudice by Jews.", significance: "In Jesus' parable, the Good Samaritan redefines neighborly love across ethnic and religious divides." },
  "Pharisee": { term: "Pharisees", category: "Person", shortDef: "Webster 1828: Separated; strict religious sect in Judaism emphasizing tradition and law.", significance: "Often warned by Jesus against trading inward humility and mercy for outward self-righteousness." },
  "Peter": { term: "Simon Peter (Cephas)", category: "Person", shortDef: "Webster 1828: A rock or stone; leading apostle of the early Christian Church.", significance: "Shows how Christ restores a flawed, impulsive follower into a courageous shepherd." },
  "Judas": { term: "Judas Iscariot", category: "Person", shortDef: "Webster 1828: The praise of the Lord; disciple who betrayed Jesus for silver.", significance: "Tragic warning that proximity to spiritual things does not guarantee a surrendered heart." },
  "Pilate": { term: "Pontius Pilate", category: "Person", shortDef: "Webster 1828: Armed with a spear; Roman governor who condemned Jesus.", significance: "Illustrates the moral failure of caving to crowd pressure over truth and justice." },
  "Gethsemane": { term: "Garden of Gethsemane", category: "Place", shortDef: "Webster 1828: Valley of oil press; olive garden of Christ's agony and prayer.", significance: "Model of honest anguish surrendered to the Father's will: 'Not my will, but thine, be done.'" },
  "Pentecost": { term: "Pentecost", category: "Concept & Artifact", shortDef: "Webster 1828: Fiftieth; Jewish feast when the Holy Spirit descended in power.", significance: "Reverses the division of Babel and launches the multi-ethnic mission of the Church." },
  "Stephen": { term: "Stephen", category: "Person", shortDef: "Webster 1828: Crown, crowned; first Christian martyr stoned in Jerusalem.", significance: "Mirrored Christ by proclaiming redemptive history boldly and forgiving his executioners." },
  "Paul": { term: "Apostle Paul (Saul of Tarsus)", category: "Person", shortDef: "Webster 1828: Small, little; apostle to the Gentiles and author of epistles.", significance: "Pioneered church planting across the Roman Empire and authored much of the New Testament." },
  "Saul": { term: "Saul", category: "Person", shortDef: "Webster 1828: Demanded, asked for; Israel's first king or Paul's Hebrew name.", significance: "Highlights the contrast between proud self-will and humble surrender to Christ's lordship." },
  "Cornelius": { term: "Cornelius", category: "Person", shortDef: "Webster 1828: A horn; devout Roman centurion baptized by Peter.", significance: "Marks the historic breakthrough confirming that Gentiles receive the Spirit on equal footing." },
  "Silas": { term: "Silas (Silvanus)", category: "Person", shortDef: "Webster 1828: Woody, forest; missionary companion of Paul.", significance: "Models joyful resilience and partnership in gospel ministry during persecution." },
  "Rome": { term: "Rome", category: "Place", shortDef: "Webster 1828: Strength, power; imperial capital of the classical Western world.", significance: "Paul's journey to Rome demonstrates that the gospel advances even into the heart of empire." },
  
  // Expanded Core Biblical & Leadership Lexicon Terms
  "Stewardship": { term: "Stewardship", category: "Concept & Artifact", shortDef: "Webster 1828: The office, duties, or management of a steward; the responsible overseeing and care of another's property, resources, or household.", significance: "Establishes that leaders and believers own nothing absolute, but are accountable to God for managing time, talents, and resources faithfully." },
  "Righteousness": { term: "Righteousness (Tzedakah / Dikaiosyne)", category: "Concept & Artifact", shortDef: "Webster 1828: Purity of heart and rectitude of life; conformity of heart and life to the divine law.", significance: "The moral perfection required by God, imputed to believers through faith in Christ and expressed in upright living." },
  "Redemption": { term: "Redemption (Golel / Apyltrosis)", category: "Concept & Artifact", shortDef: "Webster 1828: Repurchase of captured goods or freedom; deliverance from sin, penalty, or bondage by the payment of a ransom.", significance: "The heart of the gospel story—Christ paying the ultimate price to liberate humanity from the slavery of sin." },
  "Faith": { term: "Faith (Pistis / Emunah)", category: "Concept & Artifact", shortDef: "Webster 1828: Belief in the divine revelation; the assent of the mind to the truth of divine propositions; the confident trust in God's promises.", significance: "The foundational posture of the believer; 'the substance of things hoped for, the evidence of things not seen' (Hebrews 11:1)." },
  "Grace": { term: "Grace (Charis)", category: "Concept & Artifact", shortDef: "Webster 1828: Unmerited favor; divine clemency and spiritual enablement freely bestowed upon humanity through Christ.", significance: "Replaces legalistic performance with empowering love, justifying the ungodly and equipping them for good works." },
  "Atonement": { term: "Atonement (Kapporeth / Hilasmos)", category: "Concept & Artifact", shortDef: "Webster 1828: Reconciliation; the satisfaction or reparation made by Jesus Christ for sin through His sufferings and death on the cross.", significance: "Bridges the infinite chasm between a holy God and sinful humanity, satisfying divine justice while offering mercy." },
  "Sanctification": { term: "Sanctification (Hagiasmos)", category: "Concept & Artifact", shortDef: "Webster 1828: The act of making holy or setting apart for sacred use; the ongoing process of moral purification and spiritual growth.", significance: "The lifelong journey wherein the Holy Spirit transforms the believer into the likeness of Jesus Christ." },
  "Covenant": { term: "Covenant (Berith / Diatheke)", category: "Concept & Artifact", shortDef: "Webster 1828: A mutual agreement, testament, or solemn pledge of grace between God and man.", significance: "Anchors leadership and faith in God's unchanging promises rather than human contract." },
  "Wisdom": { term: "Wisdom (Chokmah / Sophia)", category: "Concept & Artifact", shortDef: "Webster 1828: The right use or exercise of knowledge; the faculty of discerning what is true, proper, or best, guided by moral integrity and the fear of God.", significance: "Practical divine guidance for living skillfully and leading justly in a complex world." },
  "Mercy": { term: "Mercy (Chesed / Eleos)", category: "Concept & Artifact", shortDef: "Webster 1828: Tenderness of heart; disposition to forgive injuries or forbear punishment; compassionate clemency toward the miserable.", significance: "Reflects God's heart toward the broken, calling leaders to temper truth with compassion." },
  "Patience": { term: "Patience (Makrothymia)", category: "Concept & Artifact", shortDef: "Webster 1828: The quality of enduring evil, trouble, or suffering without murmuring or retaliation; long-suffering perseverance.", significance: "Essential virtue for spiritual leadership, mirroring God's patient endurance with human frailty." },
  "Glory": { term: "Glory (Kabod / Doxa)", category: "Concept & Artifact", shortDef: "Webster 1828: Brightness; splendor; the manifestation of divine perfection, majesty, and honor due to God alone.", significance: "The ultimate aim of all creation and leadership: that God's supreme worth be recognized and magnified." },
  "Truth": { term: "Truth (Emet / Aletheia)", category: "Concept & Artifact", shortDef: "Webster 1828: Conformity to fact or reality; exact accordance with divine revelation; integrity and faithfulness in word and deed.", significance: "Absolute standard anchored in God's character, setting people free from deception." },
  "Love": { term: "Love (Agape / Chesed)", category: "Concept & Artifact", shortDef: "Webster 1828: An affection of the mind directed toward supreme moral excellence; sacrificial goodwill and active devotion to others.", significance: "The greatest of spiritual gifts and the defining mark of Christ's disciples." },
  "Hope": { term: "Hope (Elpis)", category: "Concept & Artifact", shortDef: "Webster 1828: Desire of good coupled with expectation; confident anticipation of future blessings promised by God.", significance: "An anchor of the soul that sustains leaders through trials and points toward eternal renewal." },
  "Justice": { term: "Justice (Mishpat / Dikaiosyne)", category: "Concept & Artifact", shortDef: "Webster 1828: The invariable rendering to every man his due; equity, fairness, and the active protection of the vulnerable.", significance: "Inseparable from true worship and righteousness in God's eyes." },
  "Peace": { term: "Peace (Shalom / Eirene)", category: "Concept & Artifact", shortDef: "Webster 1828: Freedom from war, terror, or agitation; quiet, order, and harmonious reconciliation between God and humanity.", significance: "The tranquil wholeness and flourishing produced by the rule of God." },
  "Salvation": { term: "Salvation (Yeshuan / Soteria)", category: "Concept & Artifact", shortDef: "Webster 1828: Deliverance from sin, eternal death, and every evil; the attainment of spiritual happiness and eternal life through Christ.", significance: "The grand sweep of God's rescuing work from Genesis to Revelation." },
  "Holiness": { term: "Holiness (Kodesh / Hagiosyne)", category: "Concept & Artifact", shortDef: "Webster 1828: Spiritual purity; moral excellence; complete separation from sin and dedication to the service of God.", significance: "The defining attribute of God ('Be holy, for I am holy') imparted to His people." },
  "Repentance": { term: "Repentance (Metanoia)", category: "Concept & Artifact", shortDef: "Webster 1828: Sorrow for sin and a real turning from it unto God with amendment of life.", significance: "The essential gateway to spiritual renewal, restoration, and authentic leadership." }
};

const LEXICON_KEYS_SORTED = Object.keys(BIBLICAL_LEXICON).sort((a, b) => b.length - a.length);

const findLexiconEntry = (word: string): LexiconEntry | undefined => {
  const exact = BIBLICAL_LEXICON[word];
  if (exact) return exact;
  const lower = word.toLowerCase();
  const matchedKey = LEXICON_KEYS_SORTED.find(k => k.toLowerCase() === lower);
  return matchedKey ? BIBLICAL_LEXICON[matchedKey] : undefined;
};

// Fallback Webster 1828 Dictionary definition generator for any arbitrary word tapped by the user
const getKjvDictionaryEntry = (word: string): LexiconEntry => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  const existing = findLexiconEntry(cleanWord);
  if (existing) return existing;

  const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
  return {
    term: capitalized,
    category: "Concept & Artifact",
    shortDef: `Webster 1828 Dictionary: "${capitalized}" — a classical English term found within the King James Bible vocabulary denoting a specific action, object, or attribute.`,
    significance: `Frequently utilized in classical 1611 scripture translations to express exact moral, historical, or theological nuances.`
  };
};

const getSacredIllustrationUri = (key: string, label?: string): string => {
  let svgBody = '';
  switch (key) {
    case 'NAR-01':
      svgBody = `
        <defs>
          <radialGradient id="g1" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#fffdf2"/>
            <stop offset="22%" stop-color="#fde08d"/>
            <stop offset="55%" stop-color="#3b6998"/>
            <stop offset="100%" stop-color="#0b1528"/>
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#g1)"/>
        <circle cx="400" cy="160" r="56" fill="#fffbeb" opacity="0.95"/>
      `;
      break;
    default:
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
        <text x="400" y="235" text-anchor="middle" fill="#f3dcb2" font-family="Georgia, serif" font-size="28" font-weight="bold" letter-spacing="3">${safeLabel.toUpperCase()}</text>
      `;
      break;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">${svgBody}</svg>`)}`;
};

const NARRATIVE_ART_SEARCH_TERMS: Record<string, string> = {
  "NAR-01": "Creation of Light Gustave Dore Genesis painting",
  "NAR-02": "Expulsion from the Garden of Eden Thomas Cole painting",
  "NAR-03": "Abraham sacrifice Isaac Rembrandt biblical painting",
  "NAR-04": "Crossing the Red Sea Nicolas Poussin painting",
  "NAR-05": "David with the Harp Rembrandt biblical painting",
  "NAR-06": "Daniel in the Lions Den Rubens biblical painting",
  "NAR-07": "Prophet Isaiah Michelangelo Sistine Chapel painting",
  "NAR-08": "Resurrection of Christ Carl Bloch biblical painting",
  "NAR-09": "Pentecost Jean II Restout biblical painting",
  "NAR-10": "The New Jerusalem Gustave Dore Revelation biblical art"
};

const NARRATIVE_STORIES: ContentItem[] = [
  {
    id: "NAR-01", section: "NARRATIVE", title: "1. Creation", ref: "Genesis 1-2",
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
  { id: "NT-26", section: "NT", title: "26. Extra: NT Epistles", ref: "Romans; Corinthians; Galatians", body: "Instructional material across the Epistles.", why: "Provides the framework for early Christian community." }
];

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

const PERICOPE_STORIES: ContentItem[] = Array.from({ length: 355 }, (_, i) => {
  const num = i + 1;
  const coreItem = CORE_PERICOPES[i % CORE_PERICOPES.length];
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
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="4.5" width="3.5" height="15" rx="1.75" />
          <rect x="17.5" y="4.5" width="3.5" height="15" rx="1.75" />
          <path d="M6.5 6.5h11M6.5 17.5h11" />
          <path d="M9.5 10.5h5M9.5 13.5h3" />
        </svg>
      );
    case 'NT':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 5.5C9.5 4 5.5 4.2 3 6v12.5c2.5-1.8 6.5-2 9-.5 2.5-1.5 6.5-1.3 9 .5V6c-2.5-1.8-6.5-2-9-.5z" />
          <path d="M12 5.5V18" />
          <path d="M16.5 9.2v4.8M14.7 11h3.6" strokeWidth="1.9" />
        </svg>
      );
    case 'THEMES':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M8 20V9.5a4.2 4.2 0 1 1 8.4 0c0 1.8-1 3-2.2 3.8" />
          <path d="M18 4.5v6M15 7.5h6" strokeWidth="2" />
          <circle cx="18" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'PERICOPES':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M7.5 5H5v14h2.5" />
          <path d="M16.5 5H19v14h-2.5" />
          <path d="M9.5 9h5M9.5 12h5M9.5 15h3" />
        </svg>
      );
  }
};

const renderDoveIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
    <path d="M47 41 C43 32, 37 22, 39 10 C42 16, 46 23, 51 30 C56 36, 56 41, 49 46 C46 43, 45 41, 43 37 C40 32, 36 25, 36 17 C33 22, 35 30, 41 37 C37 35, 34 30, 33 24 C32 30, 36 37, 45 43 Z" />
    <path d="M46 49 C47 42, 42 36, 33 31 C24 26, 17 18, 14 12 C12 18, 16 28, 22 34 C17 31, 13 25, 11 20 C11 27, 16 35, 24 41 C18 39, 13 34, 11 30 C11 37, 17 44, 26 48 C20 47, 15 44, 13 40 C13 46, 19 52, 28 54 C22 54, 17 52, 16 49 C16 54, 22 58, 30 59 C25 60, 20 59, 19 57 C20 61, 25 63, 33 62 C29 64, 24 64, 23 62 C25 66, 31 66, 38 63 C35 67, 29 70, 22 69 C16 68, 11 66, 8 64 C7 67, 7 71, 9 73 C13 74, 19 74, 25 73 C18 75, 12 75, 8 75 C8 78, 10 81, 13 82 C17 82, 23 80, 29 76 C22 81, 16 83, 12 84 C13 87, 16 89, 20 89 C24 88, 29 83, 34 78 C29 85, 24 89, 20 91 C22 93, 25 94, 29 93 C31 87, 35 80, 42 75 C52 68, 59 58, 63 45 C65 40, 68 38, 72 39 C70 36, 66 35, 62 35 C56 35, 51 41, 46 49 Z M60 40 C58.3 40, 57 38.7, 57 37 C57 35.3, 58.3 34, 60 34 C61.7 34, 63 35.3, 63 37 C63 38.7,61.7 40, 60 40 Z" />
    <path d="M72 37 C72 31, 77 27, 83 28 C83 34, 78 38, 72 37 Z" />
    <path d="M72 40 C78 39, 83 43, 83 49 C77 49, 72 45, 72 40 Z" />
  </svg>
);

export default function App() {
  const [selectedStory, setSelectedStory] = useState<ContentItem>(MASTER_CONTENT[0]);
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<StorySection>('NARRATIVE');

  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState<boolean>(false);
  const [dropdownFilter, setDropdownFilter] = useState<string>('');

  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  
  // Word Selection & Unified Liquid Glass Sentence Focus State
  const [boldedWordToken, setBoldedWordToken] = useState<string | null>(null);
  const [activeSentence, setActiveSentence] = useState<string | null>(null);
  const [displaySentence, setDisplaySentence] = useState<string>("");
  const [sentenceToolView, setSentenceToolView] = useState<'NONE' | 'WORD' | 'PASSAGE' | 'NARRATIVE' | 'CHAPTER' | 'SEARCH'>('NONE');
  const [wordLookupEntry, setWordLookupEntry] = useState<{ entry: LexiconEntry } | null>(null);
  const [chapterLookupText, setChapterLookupText] = useState<string | null>(null);
  const [isFetchingChapter, setIsFetchingChapter] = useState<boolean>(false);
  const [popupOrigin, setPopupOrigin] = useState<{ x: string; y: string }>({ x: '50%', y: '50%' });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Concentric 4-Level AI Scope Analysis State for Liquid Glass Pill Buttons
  const [granularAnalysis, setGranularAnalysis] = useState<GranularAnalysisResult | null>(null);
  const [isAnalyzingScope, setIsAnalyzingScope] = useState<boolean>(false);
  const [granularCache, setGranularCache] = useState<Record<string, GranularAnalysisResult>>({});

  // Interactive Liquid Glass Tactile Distortion & Specular Physics State
  const [glassDrag, setGlassDrag] = useState<{
    isPressed: boolean;
    dx: number;
    dy: number;
    scaleX: number;
    scaleY: number;
    rotateX: number;
    rotateY: number;
    skewX: number;
    skewY: number;
    glareX: number;
    glareY: number;
  }>({
    isPressed: false,
    dx: 0,
    dy: 0,
    scaleX: 1,
    scaleY: 1,
    rotateX: 0,
    rotateY: 0,
    skewX: 0,
    skewY: 0,
    glareX: 35,
    glareY: 0,
  });

  const glassDragOriginRef = useRef<{
    startX: number;
    startY: number;
    rectWidth: number;
    rectHeight: number;
    rectLeft: number;
    rectTop: number;
  } | null>(null);

  const handleGlassPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, a, details, summary')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    glassDragOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      rectWidth: rect.width || 320,
      rectHeight: rect.height || 200,
      rectLeft: rect.left,
      rectTop: rect.top,
    };
    const relX = ((e.clientX - rect.left) / (rect.width || 320)) * 100;
    const relY = ((e.clientY - rect.top) / (rect.height || 200)) * 100;

    setGlassDrag({
      isPressed: true,
      dx: 0,
      dy: 0,
      scaleX: 1.018,
      scaleY: 0.986,
      rotateX: ((50 - relY) / 50) * 3.5,
      rotateY: ((relX - 50) / 50) * 3.5,
      skewX: 0,
      skewY: 0,
      glareX: relX,
      glareY: relY,
    });
  };

  const handleGlassPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!glassDragOriginRef.current) return;
    const { startX, startY, rectWidth, rectHeight, rectLeft, rectTop } = glassDragOriginRef.current;
    const rawDx = e.clientX - startX;
    const rawDy = e.clientY - startY;

    const maxPull = 26;
    const dx = Math.tanh(rawDx / 95) * maxPull;
    const dy = Math.tanh(rawDy / 95) * maxPull;

    const absX = Math.min(1, Math.abs(rawDx) / 170);
    const absY = Math.min(1, Math.abs(rawDy) / 170);

    const scaleX = 1 + absX * 0.052 - absY * 0.022;
    const scaleY = 1 + absY * 0.052 - absX * 0.022;

    const skewX = Math.tanh((rawDx * (rawDy >= 0 ? 1 : -1)) / 260) * 2.2;
    const skewY = Math.tanh((rawDy * (rawDx >= 0 ? 1 : -1)) / 260) * 1.6;

    const rotateY = Math.tanh(rawDx / 110) * 7.5;
    const rotateX = -Math.tanh(rawDy / 110) * 7.5;

    const glareX = Math.max(0, Math.min(100, ((e.clientX - rectLeft) / rectWidth) * 100));
    const glareY = Math.max(0, Math.min(100, ((e.clientY - rectTop) / rectHeight) * 100));

    setGlassDrag({
      isPressed: true,
      dx,
      dy,
      scaleX,
      scaleY,
      rotateX,
      rotateY,
      skewX,
      skewY,
      glareX,
      glareY,
    });
  };

  const handleGlassPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!glassDragOriginRef.current) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    glassDragOriginRef.current = null;
    setGlassDrag({
      isPressed: false,
      dx: 0,
      dy: 0,
      scaleX: 1,
      scaleY: 1,
      rotateX: 0,
      rotateY: 0,
      skewX: 0,
      skewY: 0,
      glareX: 35,
      glareY: 0,
    });
  };

  // Bookmarks & Top-Right Red Ribbon Drawer State
  const [bookmarks, setBookmarks] = useState<BookmarkedSentence[]>([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);

  const captureTapOrigin = (clientX: number, clientY: number) => {
    const rect = pageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.max(12, Math.min(88, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(12, Math.min(88, ((clientY - rect.top) / rect.height) * 100));
    setPopupOrigin({ x: `${xPct.toFixed(1)}%`, y: `${yPct.toFixed(1)}%` });
  };

  React.useEffect(() => {
    if (activeSentence) {
      setDisplaySentence(activeSentence);
    }
  }, [activeSentence]);

  const getPrimaryWordFromSentence = (sentenceText: string): string => {
    if (boldedWordToken) return boldedWordToken;
    const words = (sentenceText.match(/[A-Za-z']+/g) || []).map(w => w.replace(/[^a-zA-Z]/g, ''));
    const lexiconMatch = words.find(w => Boolean(findLexiconEntry(w)));
    if (lexiconMatch) return lexiconMatch;
    const stopWords = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'unto', 'they', 'them', 'their', 'have', 'were', 'said', 'into', 'upon', 'shall', 'will', 'for', 'not', 'but', 'his', 'her', 'him', 'she', 'was', 'are']);
    const significant = words.find(w => w.length >= 4 && !stopWords.has(w.toLowerCase()));
    return significant || words[0] || 'Word';
  };

  const handleToggleSentenceBookmark = (sentenceToSave: string) => {
    const clean = sentenceToSave.trim();
    if (!clean) return;
    setBookmarks(prev => {
      const exists = prev.some(b => b.sentence === clean && b.storyId === selectedStory.id);
      if (exists) {
        return prev.filter(b => !(b.sentence === clean && b.storyId === selectedStory.id));
      }
      return [
        {
          id: `${selectedStory.id}-${Date.now()}`,
          sentence: clean,
          storyId: selectedStory.id,
          storyTitle: selectedStory.title,
          storyRef: selectedStory.ref,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ];
    });
  };

  // Concentric 4-Button AI Scope Analyzer
  const handleGranularScopeAnalysis = async (
    viewType: 'WORD' | 'PASSAGE' | 'CHAPTER' | 'NARRATIVE',
    scopeType: GranularScopeType,
    overrideWord?: string,
    overrideSentence?: string
  ) => {
    const activeSent = (overrideSentence ?? displaySentence).trim();
    const targetWord = (overrideWord ?? getPrimaryWordFromSentence(activeSent)).replace(/[^a-zA-Z']/g, '');
    const cacheKey = `${selectedStory.id}::${scopeType}::${targetWord.toLowerCase()}::${activeSent.slice(0, 60)}`;

    setSentenceToolView(viewType);

    if (scopeType === 'WORD_IN_SENTENCE') {
      setWordLookupEntry({ entry: getKjvDictionaryEntry(targetWord) });
    }

    if (granularCache[cacheKey]) {
      setGranularAnalysis(granularCache[cacheKey]);
      return;
    }

    setIsAnalyzingScope(true);
    setGranularAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: selectedStory.id,
          title: selectedStory.title,
          ref: selectedStory.ref,
          body: selectedStory.body,
          why: selectedStory.why,
          scriptureText: passageText || '',
          granularScope: scopeType,
          targetWord,
          targetSentence: activeSent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scope analysis HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error('Invalid granular scope payload');
      }

      setGranularAnalysis(json.data);
      setGranularCache(prev => ({ ...prev, [cacheKey]: json.data }));
    } catch (err) {
      const lex = getKjvDictionaryEntry(targetWord);
      const cleanTitle = selectedStory.title.replace(/^[0-9.]+\s*/, '').trim();
      let fallback: GranularAnalysisResult;

      if (scopeType === 'WORD_IN_SENTENCE') {
        fallback = {
          heading: `1. Word in Sentence Context`,
          focalElement: `"${lex.term}" within "${activeSent}"`,
          contextualMeaning: `Within this specific sentence, "${targetWord}" anchors the clause's theological and moral weight. ${lex.shortDef}`,
          linguisticOrLiteraryNote: `Lexical Category (${lex.category}): ${lex.significance}`,
          practicalInsight: `Pay close attention to how "${targetWord}" shapes the action and posture required in ${selectedStory.ref}.`,
          crossReferences: [selectedStory.ref.split(/[|;&]/)[0].trim()]
        };
      } else if (scopeType === 'SENTENCE_IN_VERSE') {
        fallback = {
          heading: `2. Sentence in Verse Context`,
          focalElement: activeSent,
          contextualMeaning: `In the immediate verse structure of ${selectedStory.ref}, this statement establishes the primary premise and connects the surrounding clauses into a unified witness.`,
          linguisticOrLiteraryNote: `Biblical verses often employ synthetic or antithetic parallelism—this sentence supplies the core movement that the rest of the verse reinforces.`,
          practicalInsight: selectedStory.preAnalyzed?.observation || `Observe how the immediate wording in ${selectedStory.ref} reveals God's direct involvement.`,
          crossReferences: [selectedStory.ref.split(/[|;&]/)[0].trim()]
        };
      } else if (scopeType === 'VERSE_IN_PASSAGE') {
        fallback = {
          heading: `3. Verse in Passage Context (${cleanTitle})`,
          focalElement: `${selectedStory.ref} — ${cleanTitle}`,
          contextualMeaning: `Within the broader pericope of ${cleanTitle}, this verse serves as a pivotal turning point: ${selectedStory.body}`,
          linguisticOrLiteraryNote: selectedStory.preAnalyzed?.interpretation || `Literary Setting: Positioned within ${selectedStory.ref} to highlight covenant faithfulness and human responsibility.`,
          practicalInsight: `Leadership Principle: ${selectedStory.why}`,
          crossReferences: selectedStory.ref.split(/[|;&]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
        };
      } else {
        const sectionLabel = SECTIONS.find(s => s.id === selectedStory.section)?.label || 'Biblical Narrative';
        fallback = {
          heading: `4. Passage in the Context of the Bible`,
          focalElement: `${cleanTitle} (${selectedStory.ref}) in the Canon`,
          contextualMeaning: `Situated within the ${sectionLabel} movement of Scripture, ${cleanTitle} advances the overarching redemptive arc from Creation and Covenant toward fulfillment in Christ and the New Creation.`,
          linguisticOrLiteraryNote: `Canonical Trajectory: Connects the historical witness of ${selectedStory.ref} to the enduring theology of God's Kingdom and covenant people.`,
          practicalInsight: selectedStory.preAnalyzed?.application || `Live out the canonical witness of ${cleanTitle} through faithful stewardship and humble obedience.`,
          crossReferences: ['Genesis 12:1-3', 'Luke 24:27', 'Revelation 21:1-5']
        };
      }

      setGranularAnalysis(fallback);
    } finally {
      setIsAnalyzingScope(false);
    }
  };

  const handleChapterLookup = async (story: ContentItem) => {
    setSentenceToolView('CHAPTER');
    setIsFetchingChapter(true);
    setChapterLookupText(null);
    try {
      let rawRef = story.ref.split(/[|;&]/)[0].trim();
      rawRef = rawRef.split(',')[0].trim();
      rawRef = rawRef.replace(/^The\s+Book\s+of\s+/i, '').replace(/^Book\s+of\s+/i, '').trim();
      rawRef = rawRef.replace(/\s*\(.*?\)\s*/g, '').trim();
      if (/^Psalms$/i.test(rawRef)) rawRef = 'Psalm 23';

      const match = rawRef.match(/^([1-3]?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(\d+)?/);
      let bookCode = 'JHN';
      let chapterNum = 1;
      if (match && match[1]) {
        const bookName = match[1].trim().toLowerCase();
        chapterNum = match[2] ? parseInt(match[2], 10) : 1;
        if (bookName.includes('gen')) bookCode = 'GEN';
        else if (bookName.includes('psalm')) bookCode = 'PSA';
        else if (bookName.includes('matt')) bookCode = 'MAT';
        else if (bookName.includes('john')) bookCode = 'JHN';
        else if (bookName.includes('rom')) bookCode = 'ROM';
        else if (bookName.includes('exod')) bookCode = 'EXO';
      }

      const res = await fetch(`https://helloao.org/api/eng_kjv/${bookCode}/${chapterNum}.json`);
      if (!res.ok) throw new Error(`Could not load chapter from helloao.org`);
      const data = await res.json();
      
      const extractHelloAoText = (contentArray: any[]): string => {
        let text = "";
        for (const item of contentArray) {
          if (item.type === 'verse' && item.text) {
            text += `[${item.number}] ${item.text} `;
          } else if (item.content && Array.isArray(item.content)) {
            text += extractHelloAoText(item.content);
          }
        }
        return text;
      };

      if (data.chapter && data.chapter.content) {
        const fullText = extractHelloAoText(data.chapter.content).trim();
        setChapterLookupText(
          fullText ? `${story.ref} (KJV via helloao.org)\n\n${fullText}` : `Chapter Summary (${story.ref}): ${story.body} — ${story.why}`
        );
      } else {
        throw new Error("No chapter content array found.");
      }
    } catch (err: any) {
      // Fallback to bible-api if helloao fails
      try {
        let rawRef = story.ref.split(/[|;&]/)[0].trim().split(',')[0].trim();
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(rawRef)}?translation=kjv`);
        const data = await response.json();
        setChapterLookupText(
          data.text ? `${data.reference || story.ref} (KJV)\n\n${data.text.replace(/\s+/g, ' ').trim()}` : `Chapter Summary (${story.ref}): ${story.body} — ${story.why}`
        );
      } catch (innerErr) {
        setChapterLookupText(`Chapter Summary (${story.ref}): ${story.body} — ${story.why}`);
      }
    } finally {
      setIsFetchingChapter(false);
    }
  };

  const handleCrossReferenceClick = async (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    captureTapOrigin(e.clientX, e.clientY);
    setSentenceToolView('CHAPTER');
    setIsFetchingChapter(true);
    setChapterLookupText(null);
    setDisplaySentence(`Scripture Reference: ${ref}`);
    setActiveSentence(`Scripture Reference: ${ref}`);

    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setChapterLookupText(
        data.text ? `${data.reference || ref} (KJV)\n\n${data.text.replace(/\s+/g, ' ').trim()}` : `Could not load passage.`
      );
    } catch (err) {
      setChapterLookupText(`Could not load passage for ${ref}.`);
    } finally {
      setIsFetchingChapter(false);
    }
  };

  const filteredStories = MASTER_CONTENT.filter(s => s.section === activeSection);
  let currentIndex = filteredStories.findIndex(s => s.id === selectedStory.id);
  if (currentIndex === -1) currentIndex = 0;
  
  const nextStory = filteredStories[(currentIndex + 1) % filteredStories.length];
  const prevStory = filteredStories[(currentIndex - 1 + filteredStories.length) % filteredStories.length];

  const nextStoryRef = useRef(nextStory);
  const prevStoryRef = useRef(prevStory);
  React.useEffect(() => {
    nextStoryRef.current = nextStory;
    prevStoryRef.current = prevStory;
  }, [nextStory, prevStory]);

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

  const [analysisResult, setAnalysisResult] = useState<ExtendedAnalysisData | null>(
    MASTER_CONTENT[0].preAnalyzed 
      ? {
          observation: MASTER_CONTENT[0].preAnalyzed.observation,
          interpretation: MASTER_CONTENT[0].preAnalyzed.interpretation,
          application: MASTER_CONTENT[0].preAnalyzed.application,
        }
      : null
  );
  const [activeStudyTab, setActiveStudyTab] = useState<'CORE' | 'BEGINNER' | 'HISTORY' | 'THEOLOGY' | 'QUESTIONS'>('CORE');
  const [activeCitations, setActiveCitations] = useState<Array<{ uri?: string; title?: string }>>([]);
  const [isAiGrounded, setIsAiGrounded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passageText, setPassageText] = useState<string | null>(null);
  const [isFetchingText, setIsFetchingText] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  const [bibleArt, setBibleArt] = useState<{
    imageUrl: string;
    title: string;
    artist?: string;
    pageUrl: string;
  } | null>(null);
  const [artCache, setArtCache] = useState<Record<string, {
    imageUrl: string;
    title: string;
    artist?: string;
    pageUrl: string;
  }>>({});
  const artCacheRef = useRef<Record<string, {
    imageUrl: string;
    title: string;
    artist?: string;
    pageUrl: string;
  }>>({});
  const [isFetchingArt, setIsFetchingArt] = useState<boolean>(false);

  const [waves, setWaves] = useState<{id: number, x: number, y: number}[]>([]);

  React.useEffect(() => {
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
    setAnalysisResult(
      story.preAnalyzed 
        ? {
            observation: story.preAnalyzed.observation,
            interpretation: story.preAnalyzed.interpretation,
            application: story.preAnalyzed.application,
          }
        : null
    );
    setActiveCitations([]);
    setIsAiGrounded(false);
    setActiveStudyTab('CORE');
    setPassageText(null);
    setError(null);
    setTextError(null);
    setBoldedWordToken(null);
    setActiveSentence(null);
    setWordLookupEntry(null);
    setIsContextDropdownOpen(false);
    setDropdownFilter('');

    const cached = artCacheRef.current[story.id];
    if (cached) {
      setBibleArt(cached);
    } else if (story.section === 'NARRATIVE') {
      fetchBibleArt(story);
    } else {
      setBibleArt(null);
    }
  };

  const handleDailyPericope = () => {
    if (!pageContainerRef.current) return;
    const pericopes = MASTER_CONTENT.filter(s => s.section === 'PERICOPES');
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const dailyIndex = dayOfYear % pericopes.length;
    handleStoryChange(pericopes[dailyIndex]);
  };

  const fetchBibleArt = async (story: ContentItem, isBackgroundPrefetch = false) => {
    const existing = artCacheRef.current[story.id];
    if (existing) {
      if (!isBackgroundPrefetch) setBibleArt(existing);
      return;
    }

    if (!isBackgroundPrefetch) setIsFetchingArt(true);
    try {
      const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();
      const customQuery = NARRATIVE_ART_SEARCH_TERMS[story.id] || `${cleanTitle} biblical art painting`;
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=4&gsrsearch=${encodeURIComponent(customQuery)}&prop=pageimages&pithumbsize=700`;

      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error("Image search API failed");

      const data = await response.json();
      const pages = data.query?.pages;

      let imageUrl: string | null = null;
      let pageTitle = cleanTitle;

      if (pages) {
        const pageWithThumb: any = Object.values(pages).find((p: any) => p?.thumbnail?.source);
        if (pageWithThumb?.thumbnail?.source) {
          imageUrl = pageWithThumb.thumbnail.source;
          pageTitle = pageWithThumb.title;
        }
      }

      if (imageUrl) {
        const resolvedArt = {
          imageUrl,
          title: `Historical Art: ${pageTitle}`,
          pageUrl: 'https://bible.art/'
        };
        artCacheRef.current[story.id] = resolvedArt;
        setArtCache(prev => ({ ...prev, [story.id]: resolvedArt }));
        if (!isBackgroundPrefetch) setBibleArt(resolvedArt);
      } else {
        throw new Error("No image found in search");
      }
    } catch (err: any) {
      const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();
      const fallbackArt = {
        imageUrl: getSacredIllustrationUri(story.id, cleanTitle),
        title: `Sacred Art: ${cleanTitle}`,
        pageUrl: 'https://bible.art/'
      };
      artCacheRef.current[story.id] = fallbackArt;
      setArtCache(prev => ({ ...prev, [story.id]: fallbackArt }));
      if (!isBackgroundPrefetch) setBibleArt(fallbackArt);
    } finally {
      if (!isBackgroundPrefetch) setIsFetchingArt(false);
    }
  };

  React.useEffect(() => {
    if (selectedStory.section === 'NARRATIVE' || selectedStory.preAnalyzed) {
      fetchBibleArt(selectedStory, false);
    }
    if (nextStory && (nextStory.section === 'NARRATIVE' || nextStory.preAnalyzed)) {
      fetchBibleArt(nextStory, true);
    }
    if (prevStory && (prevStory.section === 'NARRATIVE' || prevStory.preAnalyzed)) {
      fetchBibleArt(prevStory, true);
    }
  }, [selectedStory.id, nextStory?.id, prevStory?.id]);

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
    setIsLoading(true);
    setError(null);
    fetchBibleArt(story);

    try {
      // First ensure passage text is available for genuine analysis
      let activeText = overrideText !== undefined ? overrideText : passageText;
      if (!activeText) {
        activeText = await fetchPassageText(story);
      }

      // Live POST request to Vercel Serverless Gemini 3.8 Flash Biblical Analysis Engine
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          title: story.title,
          ref: story.ref,
          body: story.body,
          why: story.why,
          scriptureText: activeText || ''
        })
      });

      if (!response.ok) {
        throw new Error(`AI Analysis service responded with status: ${response.status}`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Invalid AI analysis payload received.');
      }

      setAnalysisResult(json.data);
      if (json.citations && Array.isArray(json.citations)) {
        setActiveCitations(json.citations);
      }
      setIsAiGrounded(Boolean(json.groundedWithRag));
    } catch (err: any) {
      console.warn('Falling back to local scholarship foundation:', err.message);
      // Graceful fallback to rich canonical study synthesis if offline or credentials unconfigured
      const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();
      setAnalysisResult({
        overview: `A canonical analysis of ${story.ref} (${cleanTitle}), examining its literary structure, original setting, and enduring theological principles.`,
        observation: story.preAnalyzed?.observation || `Key textual movements in ${story.ref}: ${story.body}`,
        interpretation: story.preAnalyzed?.interpretation || `Theological & Historical Context: ${story.why}`,
        application: story.preAnalyzed?.application || `Living by Faith: Apply the lessons of ${cleanTitle} through humble obedience and servant leadership.`,
        historicalCulturalContext: `Set within the redemptive history of Israel and the early Church, addressing covenant obedience and spiritual formation.`,
        theologicalSignificance: `Demonstrates God's unyielding covenant faithfulness and the requirement for authentic faith over mere formal observance.`,
        beginnerSummary: `This passage shows how God guides, tests, and redeems His people through pivotal moments of decision and trust.`,
        keyTakeaways: [
          `Authority in Scripture is always given as a stewardship from God.`,
          `Faithfulness matters most when circumstances seem uncertain.`,
          `Integrity and humility define authentic biblical leadership.`
        ]
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPassageText = async (overrideStory?: ContentItem) => {
    const story = overrideStory || selectedStory;
    setIsFetchingText(true);
    setTextError(null);
    setPassageText('');
    fetchBibleArt(story);
    
    try {
      let rawRef = story.ref.split(/[|;&]/)[0].trim();
      rawRef = rawRef.split(',')[0].trim();
      rawRef = rawRef.replace(/^The\s+Book\s+of\s+/i, '').replace(/^Book\s+of\s+/i, '').trim();
      rawRef = rawRef.replace(/\s*\(.*?\)\s*/g, '').trim();

      if (/^Psalms$/i.test(rawRef)) {
        rawRef = 'Psalm 23';
      }

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

      const extractedText = data.text.replace(/\s+/g, ' ').trim();
      const words = extractedText.split(' ');

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

    const toX = targetFlipped
      ? (isBackSwipe ? W * 2.02 : -W * 0.98)
      : (isBackSwipe ? 2 : W);
    const toY = originY;

    let curX = fromX;
    let curY = fromY;
    let velX = initialVelocityPxPerMs * 1000;
    let velY = 0;
    const stiffness = 290;
    const damping = 28;
    let lastTime = performance.now();

    const step = (now: number) => {
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
    setBoldedWordToken(null);
    setActiveSentence(null);
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
        flapWidth: 0,
      };
    }

    const isBack = curlState.isBackSwipe;
    const Ox = isBack ? 0 : W;
    const Oy = curlState.originY;

    let Px = isBack ? Math.max(4, curlState.pointerX) : Math.min(W - 4, curlState.pointerX);
    let Py = curlState.pointerY;

    if (!isBack) {
      const maxR0 = Math.sqrt(Math.max(0, W * W - Px * Px + Oy * Oy));
      const maxRH = Math.sqrt(Math.max(0, W * W - Px * Px + (H - Oy) * (H - Oy)));
      Py = Math.max(-maxR0, H - maxRH, Math.min(maxR0, H + maxRH, Py));
    } else {
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

    const signedDist = (p: { x: { valueOf(): number } | number; y: { valueOf(): number } | number }) =>
      (Number(p.x) - Mx) * nx + (Number(p.y) - My) * ny;

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
    const flapWidth = vLen * 0.5;

    return {
      isCurling: foldedPts.length >= 3,
      frontClip: toPolyStr(frontPts),
      reflectedBackClip: toPolyStr(reflectedPts),
      matrix: `matrix(${a.toFixed(5)}, ${b.toFixed(5)}, ${c.toFixed(5)}, ${d.toFixed(5)}, ${tx.toFixed(1)}, ${ty.toFixed(1)})`,
      creaseX: Mx,
      creaseY: My,
      normalAngleDeg,
      flapWidth,
    };
  };

  const curlGeo = computePageCurlGeometry();

  const renderPageContent = (story: ContentItem, isBacksideCopy = false, isTargetPage = false) => {
    const isActive = story.id === selectedStory.id;
    const showAnalysis = isActive ? (story.preAnalyzed ? story.preAnalyzed : analysisResult) : (story.preAnalyzed || null);
    const showPassage = isActive ? passageText : null;
    const showLoading = isActive ? isLoading : false;
    const showFetchingText = isActive ? isFetchingText : false;
    const showTextError = isActive ? textError : null;
    const showAppError = isActive ? error : null;
    const interactive = !isBacksideCopy && !isTargetPage;

    const storyIdx = filteredStories.findIndex(s => s.id === story.id);
    const displayIndex = storyIdx !== -1 ? storyIdx + 1 : currentIndex + 1;

    // Two-tap interactive text tokenizer helper
    const renderInteractiveText = (rawText: string) => {
      if (!rawText) return rawText;

      // Tokenize into sentences first to allow Liquid Glass sentence tapping
      const sentences = rawText.match(/[^.?!]+[.?!]+(?:\s+|$)|[^.?!]+$/g) || [rawText];

      return sentences.map((sentence, sIdx) => {
        const tokens = sentence.match(/[\w']+|[^\w\s]|\s+/g) || [sentence];

        return (
          <span
            key={sIdx}
            className="cursor-pointer hover:bg-[#c5a059]/10 rounded transition-colors"
            onClick={(e) => {
              if (!interactive) return;
              captureTapOrigin(e.clientX, e.clientY);
              setSentenceToolView('NONE');
              setActiveSentence(sentence);
            }}
            title="Tap sentence to focus"
          >
            {tokens.map((token, i) => {
              const trimmedWord = token.replace(/[^a-zA-Z]/g, '');
              const isWord = trimmedWord.length > 0;

              if (!isWord) {
                return <span key={i}>{token}</span>;
              }

              const isLexiconMatched = Boolean(findLexiconEntry(trimmedWord));
              const isBolded = boldedWordToken?.toLowerCase() === trimmedWord.toLowerCase();

              // If Dove lexicon scanner is active and it's a known biblical term, open the Liquid Glass dialogue directly to the Word Lookup view
              if (isHighlightMode && isLexiconMatched) {
                const entry = findLexiconEntry(trimmedWord)!;
                return (
                  <span
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!interactive) return;
                      captureTapOrigin(e.clientX, e.clientY);
                      setBoldedWordToken(trimmedWord);
                      setDisplaySentence(sentence);
                      setActiveSentence(sentence);
                      setWordLookupEntry({ entry });
                      handleGranularScopeAnalysis('WORD', 'WORD_IN_SENTENCE', trimmedWord, sentence);
                    }}
                    className="text-[#8b0000] font-bold underline decoration-[#8b0000]/60 decoration-dotted underline-offset-2 cursor-pointer hover:bg-[#8b0000]/15 px-0.5 rounded transition-colors"
                    title={`Click for AI Word-in-Sentence analysis on "${entry.term}"`}
                  >
                    {token}
                  </span>
                );
              }

              // Single unified Liquid Glass focus with inline word bolding
              return (
                <span
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!interactive) return;
                    captureTapOrigin(e.clientX, e.clientY);
                    setBoldedWordToken(trimmedWord);
                    setDisplaySentence(sentence);
                    setActiveSentence(sentence);

                    if (isBolded) {
                      const entry = getKjvDictionaryEntry(trimmedWord);
                      setWordLookupEntry({ entry });
                      handleGranularScopeAnalysis('WORD', 'WORD_IN_SENTENCE', trimmedWord, sentence);
                    } else {
                      setSentenceToolView('NONE');
                    }
                  }}
                  className={`cursor-pointer transition-colors px-0.5 rounded ${
                    isBolded
                      ? 'font-bold bg-[#c5a059]/25 text-[#382117] underline decoration-[#c5a059]'
                      : 'hover:bg-stone-300/30'
                  }`}
                  title={`Tap to focus in Liquid Glass (tap again or press aA for AI Word-in-Sentence Analysis)`}
                >
                  {token}
                </span>
              );
            })}
          </span>
        );
      });
    };

    const markdownComponents = {
      p: ({ children }: any) => (
        <p>
          {React.Children.map(children, (child) =>
            typeof child === 'string' ? renderInteractiveText(child) : child
          )}
        </p>
      ),
      li: ({ children }: any) => (
        <li>
          {React.Children.map(children, (child) =>
            typeof child === 'string' ? renderInteractiveText(child) : child
          )}
        </li>
      ),
    };

    const bibleGatewaySearch = encodeURIComponent(story.ref.replace(/\|/g, ';').replace(/Book of/g, '').trim());
    const bibleGatewayLink = `https://www.biblegateway.com/passage/?search=${bibleGatewaySearch}&version=KJV`;

    const visibleDropdownOptions = dropdownFilter.trim()
      ? filteredStories.filter(
          (s) =>
            s.title.toLowerCase().includes(dropdownFilter.toLowerCase()) ||
            s.ref.toLowerCase().includes(dropdownFilter.toLowerCase())
        )
      : filteredStories;

    const storyArt = isActive
      ? (bibleArt || artCache[story.id])
      : artCache[story.id];
    const heroArtUrl = storyArt?.imageUrl || story.imageUrl || (story.section === 'NARRATIVE' ? getSacredIllustrationUri(story.id, story.title.replace(/^[0-9.]+\s*/, '').trim()) : undefined);
    const heroArtTitle = storyArt?.title || `Historical Art: ${story.title.replace(/^[0-9.]+\s*/, '').trim()}`;
    const heroArtPageUrl = storyArt?.pageUrl || (story.section === 'NARRATIVE' ? 'https://bible.art/' : undefined);

    return (
      <div className="w-full max-w-[356px] mx-auto flex flex-col gap-3.5 h-full reading-font">
        <aside className="w-full flex flex-col gap-2.5 shrink-0 relative z-40">
          
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

          <div className="flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ui-font">
                Select Context
              </label>
              <span className="text-[9px] text-[#c5a059] font-semibold tracking-wider uppercase ui-font">
                {displayIndex} of {filteredStories.length}
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

            {interactive && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute left-0 right-0 top-full z-50 grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top ${
                  isContextDropdownOpen
                    ? 'grid-rows-[1fr] opacity-100 mt-1.5 scale-y-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none mt-0 scale-y-95'
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
              disabled={showLoading || showFetchingText}
              className="flex-1 bg-[#8b0000] text-[#fdfaf2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 hover:bg-[#660000] active:scale-[0.98] active:opacity-60 transition-all disabled:opacity-50 shadow-sm rounded-md flex items-center justify-center gap-1.5"
            >
              {showLoading ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                  <span>AI Scholar...</span>
                </>
              ) : (
                <>
                  <span>✦</span>
                  <span>AI Analyze</span>
                </>
              )}
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
                setIsHighlightMode(prev => !prev);
              } : undefined}
              title={isHighlightMode ? "Disable Webster's 1828 Biblical Key Terms Scanner" : "Scan & Highlight Names, Places, and Key Terms with Webster's 1828 definitions"}
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
            if (boldedWordToken) setBoldedWordToken(null);
            if (activeSentence) setActiveSentence(null);
            if (isContextDropdownOpen) setIsContextDropdownOpen(false);
          }}
        >
          {heroArtUrl && !showLoading && (!showFetchingText || showPassage) && (
            <div className="mb-4 bg-[#fdfaf2] p-2.5 rounded border border-[#c5a059]/60 shadow-sm flex flex-col items-center text-center shrink-0">
              <div className="w-full aspect-[16/9] overflow-hidden rounded-sm border border-stone-200 bg-stone-900 flex items-center justify-center">
                <img
                  src={heroArtUrl}
                  alt={heroArtTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getSacredIllustrationUri(story.id, story.title.replace(/^[0-9.]+\s*/, '').trim());
                  }}
                />
              </div>
              <p className="text-[11px] font-bold text-[#4a3b32] mt-1.5 line-clamp-1">
                {heroArtTitle}
              </p>
              {heroArtPageUrl && heroArtPageUrl !== '#' && (
                <a
                  href={heroArtPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest text-[#8b0000] hover:underline mt-0.5 font-sans"
                >
                  {storyArt?.artist ? `${storyArt.artist} • ` : ''}View on Bible.art ↗
                </a>
              )}
            </div>
          )}

          {!showAnalysis && !showLoading && !showPassage && !showFetchingText && !showTextError && !showAppError && (
            <div className="flex-1 flex flex-col items-center text-center p-2">
              <h3 className="text-base font-bold text-[#4a3b32] mb-1 uppercase tracking-widest">
                {renderInteractiveText(story.title)}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-1 block w-full">{story.ref}</span>
              
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
                  {renderInteractiveText(story.body)}
                </p>
              </div>

              <div className="text-left bg-[#fffafa] p-3 rounded border border-[#8b0000]/20 shadow-sm w-full">
                <h4 className="text-[10px] font-bold text-[#8b0000] uppercase tracking-widest mb-1.5">Why it matters for Leaders</h4>
                <p className="text-sm leading-relaxed text-stone-800 italic">
                  {renderInteractiveText(story.why)}
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
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Passage Retrieval Failed</h4>
                  <p className="text-xs italic">{showTextError}</p>
                </div>
              </div>
            </div>
          )}

          {showPassage !== null && showPassage !== '' && !showTextError && (
            <article className="mb-6 bg-stone-100/50 p-4 rounded border border-stone-200 shadow-inner">
              <div className="text-xs font-bold text-[#8b0000] uppercase tracking-widest border-b border-[#c5a059]/45 pb-1 mb-2 flex items-center justify-between">
                <span>Original Text Extract {isFetchingText && <span className="animate-pulse inline-block w-2 h-2 bg-[#8b0000] rounded-full ml-1" />}</span>
              </div>
              <p className="text-sm leading-relaxed text-stone-800 text-justify italic reading-font">
                "{renderInteractiveText(showPassage)}"
              </p>
            </article>
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
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Analysis Failed</h4>
                <p className="text-xs italic">{showAppError}</p>
              </div>
            </div>
          )}

          {showAnalysis && !showLoading && !showAppError && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#4a3b32] mb-1 uppercase tracking-widest text-center">
                {renderInteractiveText(story.title)}
              </h2>
              <p className="text-center text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-1">{story.ref}</p>
              
              <div className="text-center mb-2 flex items-center justify-center gap-2">
                <a
                  href={bibleGatewayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest text-[#8b0000] hover:underline font-sans"
                >
                  Read on Bible Gateway (KJV) ↗
                </a>
                {isAiGrounded && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/15 px-2 py-0.5 rounded-full ui-font">
                    ✦ RAG Verified
                  </span>
                )}
              </div>

              {/* Multi-Section Study Navigation Tabs */}
              <div className="flex bg-[#fdfaf2] border border-[#c5a059]/60 rounded-md p-0.5 shadow-sm text-[10px] font-bold uppercase tracking-wider ui-font overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('CORE')}
                  className={`flex-1 py-1 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'CORE'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  OIA Core
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('BEGINNER')}
                  className={`flex-1 py-1 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'BEGINNER'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  Guide
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('HISTORY')}
                  className={`flex-1 py-1 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'HISTORY'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('THEOLOGY')}
                  className={`flex-1 py-1 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'THEOLOGY'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  Theology
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('QUESTIONS')}
                  className={`flex-1 py-1 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'QUESTIONS'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  Reflect
                </button>
              </div>

              {/* Tab 1: Classic OIA Core View */}
              {activeStudyTab === 'CORE' && (
                <div className="space-y-3 animate-fade-in">
                  {showAnalysis.overview && (
                    <div className="p-3 bg-[#fdfaf2] border border-[#c5a059]/40 rounded-sm text-xs italic text-stone-700 leading-relaxed">
                      {renderInteractiveText(showAnalysis.overview)}
                    </div>
                  )}

                  <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#8b0000]/80"></div>
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-2">Observation</h3>
                    <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 reading-font">
                      <ReactMarkdown components={markdownComponents}>{showAnalysis.observation}</ReactMarkdown>
                    </div>
                  </article>

                  <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#c5a059]"></div>
                    <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Interpretation</h3>
                    <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 reading-font">
                      <ReactMarkdown components={markdownComponents}>{showAnalysis.interpretation}</ReactMarkdown>
                    </div>
                  </article>

                  <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-stone-700"></div>
                    <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-2">Application</h3>
                    <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 reading-font">
                      <ReactMarkdown components={markdownComponents}>{showAnalysis.application}</ReactMarkdown>
                    </div>
                  </article>
                </div>
              )}

              {/* Tab 2: Beginner's Guide View */}
              {activeStudyTab === 'BEGINNER' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fdfaf2] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-1.5">Plain Language Summary</h3>
                    <p className="text-sm leading-relaxed text-stone-800">
                      {renderInteractiveText(showAnalysis.beginnerSummary || showAnalysis.overview || story.body)}
                    </p>
                  </div>

                  {showAnalysis.keyTakeaways && showAnalysis.keyTakeaways.length > 0 && (
                    <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                      <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Key Takeaways</h3>
                      <ul className="space-y-1.5 text-xs text-stone-800 list-disc list-inside">
                        {showAnalysis.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {renderInteractiveText(takeaway)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {showAnalysis.commonMisunderstandings && showAnalysis.commonMisunderstandings.length > 0 && (
                    <div className="bg-[#fffcf5] p-4 rounded border border-stone-200 shadow-sm">
                      <h3 className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-2">Common Misconceptions</h3>
                      <ul className="space-y-1.5 text-xs text-stone-700 list-disc list-inside">
                        {showAnalysis.commonMisunderstandings.map((mis, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {renderInteractiveText(mis)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Historical & Cultural Context */}
              {activeStudyTab === 'HISTORY' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-2">Historical Setting & Customs</h3>
                    <p className="text-xs leading-relaxed text-stone-800">
                      {renderInteractiveText(showAnalysis.historicalCulturalContext || "Examining the ancient Near Eastern and Greco-Roman world that framed this biblical witness.")}
                    </p>
                  </div>

                  {showAnalysis.keyTerms && showAnalysis.keyTerms.length > 0 && (
                    <div className="bg-[#fdfaf2] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                      <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Passage Terminology & Linguistics</h3>
                      <div className="divide-y divide-stone-200/60">
                        {showAnalysis.keyTerms.map((termItem, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#382117]">{termItem.term}</span>
                              {termItem.originalLanguage && (
                                <span className="text-[10px] italic text-[#8b0000]">{termItem.originalLanguage}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-700 mt-0.5">{termItem.definition}</p>
                            <p className="text-[10px] text-stone-500 italic mt-0.5">{termItem.relevance}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Theology & Scripture Cross-References */}
              {activeStudyTab === 'THEOLOGY' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-2">Theological Significance</h3>
                    <p className="text-xs leading-relaxed text-stone-800">
                      {renderInteractiveText(showAnalysis.theologicalSignificance || "Revelation of God's character and redemptive covenant.")}
                    </p>
                  </div>

                  {showAnalysis.biblicalConnections && showAnalysis.biblicalConnections.length > 0 && (
                    <div className="bg-[#fdfaf2] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                      <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Scriptural Connections</h3>
                      <div className="space-y-2">
                        {showAnalysis.biblicalConnections.map((conn, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white/70 border border-stone-200">
                            <div className="flex items-center justify-between mb-1">
                              <button 
                                onClick={(e) => handleCrossReferenceClick(conn.reference, e)}
                                className="font-bold text-xs text-[#8b0000] hover:underline active:opacity-70 flex items-center gap-1 text-left"
                                title={`Read ${conn.reference}`}
                              >
                                {conn.reference} ↗
                              </button>
                              <span className="text-[9px] uppercase font-bold text-[#c5a059]">{conn.connectionType}</span>
                            </div>
                            <p className="text-[11px] text-stone-800">{conn.description}</p>
                            <p className="text-[10px] text-stone-500 italic mt-1">{conn.significance}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAnalysis.interpretationCaveats && showAnalysis.interpretationCaveats.length > 0 && (
                    <details className="p-3 bg-stone-100/70 border border-stone-200 rounded text-[11px] text-stone-600 group cursor-pointer">
                      <summary className="font-bold text-stone-700 mb-1 select-none flex items-center gap-1 outline-none">
                        <span className="group-open:rotate-90 transition-transform">▶</span> 
                        Scholarly Considerations & Caveats
                      </summary>
                      <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-stone-300 italic">
                        {showAnalysis.interpretationCaveats.map((caveat, i) => (
                          <p key={i}>• {caveat}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Tab 5: Reflection Questions */}
              {activeStudyTab === 'QUESTIONS' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-2">Questions for Reflection</h3>
                    {showAnalysis.reflectionQuestions && showAnalysis.reflectionQuestions.length > 0 ? (
                      <div className="space-y-2">
                        {showAnalysis.reflectionQuestions.map((q, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white/80 border border-stone-200">
                            <span className="text-[9px] font-bold uppercase text-[#c5a059] block mb-0.5">{q.level}</span>
                            <p className="text-xs font-medium text-[#382117]">{q.question}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="text-xs text-stone-700 space-y-2 list-disc list-inside">
                        <li>What does this passage reveal about the character and heart of God?</li>
                        <li>How does the response of the main figures challenge your own choices this week?</li>
                        <li>In what area of your life or leadership is God calling you to deeper trust?</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Verified Grounding Citations Drawer */}
              {activeCitations.length > 0 && (
                <div className="pt-2 border-t border-[#c5a059]/30 text-[10px] text-stone-500 ui-font">
                  <span className="font-bold text-[#8b0000] uppercase tracking-widest block mb-1">
                    Grounded Scholarly Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCitations.map((cite, i) => (
                      <a
                        key={i}
                        href={cite.uri || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#382117] hover:underline"
                      >
                        {cite.title || cite.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
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

        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
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

          {/* Red Bookmark Ribbon Strung Over the Top Right Corner */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarksOpen(prev => !prev);
            }}
            title={`Saved Bookmarks (${bookmarks.length})`}
            aria-label="Open Saved Sentence Bookmarks"
            className="absolute -top-0.5 right-4 sm:right-5 z-50 group focus:outline-none active:scale-95 transition-transform"
          >
            <div className="relative flex flex-col items-center">
              <svg
                viewBox="0 0 36 64"
                className="w-7 h-12 sm:w-8 sm:h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:translate-y-0.5"
              >
                <defs>
                  <linearGradient id="crimsonRibbonGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#b31217" />
                    <stop offset="55%" stopColor="#8b0000" />
                    <stop offset="100%" stopColor="#5a0000" />
                  </linearGradient>
                </defs>
                <path
                  d="M4 0 H32 V58 L18 46 L4 58 Z"
                  fill="url(#crimsonRibbonGrad)"
                  stroke="#e3c178"
                  strokeWidth="1.2"
                />
                <path
                  d="M7 2 V51 L18 41.5 L29 51 V2"
                  fill="none"
                  stroke="rgba(255,235,180,0.35)"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
              </svg>
              {bookmarks.length > 0 && (
                <span className="absolute top-3.5 text-[9px] font-bold text-[#fdfaf2] ui-font drop-shadow">
                  {bookmarks.length}
                </span>
              )}
            </div>
          </button>

          {/* Bookmarks Drawer Overlay when clicking the Top-Right Red Ribbon */}
          {isBookmarksOpen && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarksOpen(false);
              }}
              className="absolute inset-0 z-50 bg-black/25 backdrop-blur-[2px] flex items-start justify-end p-4 pt-14"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[320px] max-h-[75%] bg-[#fdfaf2] border-2 border-[#c5a059] rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-popover-spring"
                style={{ transformOrigin: 'top right' }}
              >
                <div className="px-4 py-2.5 bg-[#8b0000] text-[#fdfaf2] flex items-center justify-between border-b border-[#c5a059]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#e3c178]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest ui-font">
                      Ribbon Bookmarks ({bookmarks.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBookmarksOpen(false)}
                    className="text-xs font-bold text-[#fdfaf2]/80 hover:text-white px-1.5 py-0.5"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-[#e6d9c3]/70 no-scrollbar">
                  {bookmarks.length === 0 ? (
                    <div className="py-8 px-3 text-center text-xs text-stone-500 italic reading-font">
                      No bookmarked sentences yet. Tap any sentence on the page and press the bookmark icon to save it to your crimson ribbon.
                    </div>
                  ) : (
                    bookmarks.map((bm) => (
                      <div key={bm.id} className="pt-2.5 first:pt-0 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              const target = MASTER_CONTENT.find(s => s.id === bm.storyId);
                              if (target) {
                                setActiveSection(target.section);
                                handleStoryChange(target);
                              }
                              setIsBookmarksOpen(false);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#8b0000] hover:underline ui-font text-left truncate"
                          >
                            {bm.storyTitle} • {bm.storyRef}
                          </button>
                          <button
                            onClick={() => setBookmarks(prev => prev.filter(item => item.id !== bm.id))}
                            className="text-[10px] text-stone-400 hover:text-[#8b0000] px-1 ui-font"
                            title="Remove bookmark"
                          >
                            ✕
                          </button>
                        </div>
                        <p
                          onClick={() => {
                            const target = MASTER_CONTENT.find(s => s.id === bm.storyId);
                            if (target) {
                              setActiveSection(target.section);
                              handleStoryChange(target);
                              setTimeout(() => setActiveSentence(bm.sentence), 60);
                            }
                            setIsBookmarksOpen(false);
                          }}
                          className="text-xs italic text-[#2c1810] leading-relaxed cursor-pointer hover:bg-[#c5a059]/15 p-1.5 rounded transition-colors reading-font"
                        >
                          "{bm.sentence}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            ref={pageContainerRef}
            className="w-full h-full relative flex-1 min-h-0 grid-stack overflow-hidden"
          >
            
            {/* Underlying Target Page */}
            <div
              style={{
                paddingTop: 'calc(max(0.5rem, var(--safe-top)) + 1.25rem)',
                paddingBottom: 'calc(max(0.5rem, var(--safe-bottom)) + 1.25rem)',
              }}
              className="grid-layer bg-[#fffcf5] px-6 sm:px-8 flex flex-col gap-4 relative overflow-hidden select-none z-0 pointer-events-none"
            >
               <div className="absolute inset-2 sm:inset-3 border border-[#e6d9c3] pointer-events-none z-20" />
               {renderPageContent(curlState?.isBackSwipe ? selectedStory : nextStory, false, true)}
               <span className="absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 ui-font pointer-events-none">
                 {curlState?.isBackSwipe 
                   ? (currentIndex + 1) 
                   : (currentIndex + 2 > filteredStories.length ? 1 : currentIndex + 2)}
               </span>
            </div>

            {/* Crease Shadow */}
            {curlGeo.isCurling && (
              <div className="grid-layer pointer-events-none z-[5] relative overflow-hidden">
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: '4000px',
                    height: '4000px',
                    left: `${curlGeo.creaseX}px`,
                    top: `${curlGeo.creaseY}px`,
                    transform: `translate(-50%, -50%) rotate(${curlGeo.normalAngleDeg}deg)`,
                    background: curlState?.isBackSwipe
                      ? 'linear-gradient(to left, rgba(20,12,6,0) 49.85%, rgba(20,12,6,0.34) 50.05%, rgba(28,16,8,0.18) 50.8%, rgba(28,16,8,0.06) 52.2%, rgba(28,16,8,0) 54.5%)'
                      : 'linear-gradient(to right, rgba(20,12,6,0) 49.85%, rgba(20,12,6,0.34) 50.05%, rgba(28,16,8,0.18) 50.8%, rgba(28,16,8,0.06) 52.2%, rgba(28,16,8,0) 54.5%)',
                  }}
                />
              </div>
            )}

            {/* Current Page */}
            <div 
              className="grid-layer relative overflow-hidden select-none z-10"
              style={{
                pointerEvents: curlGeo.isCurling ? 'none' : 'auto',
              }}
            >
              <div
                className="w-full h-full bg-[#fffcf5] px-6 sm:px-8 flex flex-col gap-4 relative overflow-hidden"
                style={{
                  clipPath: curlGeo.frontClip,
                  paddingTop: 'calc(max(0.5rem, var(--safe-top)) + 1.25rem)',
                  paddingBottom: 'calc(max(0.5rem, var(--safe-bottom)) + 1.25rem)',
                }}
              >
                <div className="absolute inset-2 sm:inset-3 border border-[#e6d9c3] pointer-events-none z-20" />
                {renderPageContent(curlState?.isBackSwipe ? prevStory : selectedStory, false, false)}
                <span className="absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 ui-font pointer-events-none">
                  {curlState?.isBackSwipe
                    ? ((currentIndex - 1 + filteredStories.length) % filteredStories.length) + 1 
                    : (currentIndex + 1)}
                </span>

                {curlGeo.isCurling && (
                  <div
                    className="absolute pointer-events-none z-30"
                    style={{
                      width: '4000px',
                      height: '4000px',
                      left: `${curlGeo.creaseX}px`,
                      top: `${curlGeo.creaseY}px`,
                      transform: `translate(-50%, -50%) rotate(${curlGeo.normalAngleDeg}deg)`,
                      background: curlState?.isBackSwipe
                        ? `linear-gradient(to right, rgba(18,10,5,0) 50%, rgba(18,10,5,0.22) 50.15%, rgba(18,10,5,0.28) calc(50% + ${Math.min(340, curlGeo.flapWidth).toFixed(0)}px), rgba(18,10,5,0.12) calc(50% + ${(Math.min(340, curlGeo.flapWidth) + 22).toFixed(0)}px), rgba(18,10,5,0) calc(50% + ${(Math.min(340, curlGeo.flapWidth) + 58).toFixed(0)}px))`
                        : `linear-gradient(to left, rgba(18,10,5,0) 50%, rgba(18,10,5,0.22) 50.15%, rgba(18,10,5,0.28) calc(50% + ${Math.min(340, curlGeo.flapWidth).toFixed(0)}px), rgba(18,10,5,0.12) calc(50% + ${(Math.min(340, curlGeo.flapWidth) + 22).toFixed(0)}px), rgba(18,10,5,0) calc(50% + ${(Math.min(340, curlGeo.flapWidth) + 58).toFixed(0)}px))`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Backside Flap */}
            {curlGeo.isCurling && (
              <div className="grid-layer pointer-events-none z-20 relative overflow-hidden">
                <div
                  className="w-full h-full bg-[#efe5d0] relative select-none"
                  style={{
                    clipPath: curlGeo.reflectedBackClip,
                  }}
                >
                  <div
                    className="w-full h-full px-6 sm:px-8 flex flex-col gap-5 opacity-[0.16] pointer-events-none relative"
                    style={{
                      transformOrigin: '0 0',
                      transform: curlGeo.matrix,
                      paddingTop: 'calc(max(0.5rem, var(--safe-top)) + 1.25rem)',
                      paddingBottom: 'calc(max(0.5rem, var(--safe-bottom)) + 1.25rem)',
                    }}
                  >
                    <div className="absolute inset-2 sm:inset-3 border border-[#e6d9c3] pointer-events-none" />
                    {renderPageContent(curlState?.isBackSwipe ? prevStory : selectedStory, true, false)}
                  </div>

                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: '4000px',
                      height: '4000px',
                      left: `${curlGeo.creaseX}px`,
                      top: `${curlGeo.creaseY}px`,
                      transform: `translate(-50%, -50%) rotate(${curlGeo.normalAngleDeg}deg)`,
                      background: curlState?.isBackSwipe
                        ? 'linear-gradient(to right, rgba(40,24,12,0.22) 49.95%, rgba(255,253,248,0.88) 50.45%, rgba(235,222,196,0.38) 51.5%, rgba(28,16,8,0.16) 53.2%, rgba(0,0,0,0) 56%)'
                        : 'linear-gradient(to left, rgba(40,24,12,0.22) 49.95%, rgba(255,253,248,0.88) 50.45%, rgba(235,222,196,0.38) 51.5%, rgba(28,16,8,0.16) 53.2%, rgba(0,0,0,0) 56%)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Left Edge Swiping Zone */}
            <div
              style={{ top: activeSection === 'PERICOPES' ? '265px' : '225px' }}
              className="absolute bottom-0 left-0 w-10 cursor-grab active:cursor-grabbing z-30 bg-transparent touch-none"
              onPointerDown={(e) => handlePointerDown(e, true)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Drag or tap from left edge to turn back"
            />

            {/* Right Edge Swiping Zone */}
            <div
              style={{ top: activeSection === 'PERICOPES' ? '265px' : '225px' }}
              className="absolute bottom-0 right-0 w-10 cursor-grab active:cursor-grabbing z-30 bg-transparent touch-none"
              onPointerDown={(e) => handlePointerDown(e, false)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Drag or tap from right edge to turn forward"
            />

            {/* High-Transparency Liquid Glass Sentence Focus Popup */}
            <div
              className={`absolute inset-0 z-40 flex items-center justify-center px-4 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                activeSentence
                  ? 'pointer-events-auto bg-transparent opacity-100'
                  : 'pointer-events-none opacity-0'
              }`}
              style={{ perspective: '1100px' }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSentence(null);
              }}
            >
              {/* Outer Wrapper: Apple-style fluid spring morph from tapped word coordinates */}
              <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-[330px] will-change-transform transition-[transform,opacity,filter] duration-[560ms] ease-[cubic-bezier(0.32,1.25,0.37,1.02)] ${
                  activeSentence
                    ? 'scale-100 translate-y-0 opacity-100 blur-0'
                    : 'scale-[0.12] translate-y-3 opacity-0 blur-[6px]'
                }`}
                style={{
                  transformOrigin: `${popupOrigin.x} ${popupOrigin.y}`,
                }}
              >
                {/* Inner Interactive Liquid Glass Lens: Tactile press & drag distension */}
                <div
                  onPointerDown={handleGlassPointerDown}
                  onPointerMove={handleGlassPointerMove}
                  onPointerUp={handleGlassPointerUp}
                  onPointerCancel={handleGlassPointerUp}
                  className="relative w-full overflow-hidden p-4 text-[#24130c] cursor-grab active:cursor-grabbing touch-none select-none will-change-transform"
                  style={{
                    borderRadius: glassDrag.isPressed
                      ? `${26 + Math.round(glassDrag.dy * 0.18)}px ${26 - Math.round(glassDrag.dx * 0.18)}px ${26 - Math.round(glassDrag.dy * 0.18)}px ${26 + Math.round(glassDrag.dx * 0.18)}px`
                      : '26px',
                    transform: `translate3d(${glassDrag.dx.toFixed(2)}px, ${glassDrag.dy.toFixed(2)}px, 0) rotateX(${glassDrag.rotateX.toFixed(2)}deg) rotateY(${glassDrag.rotateY.toFixed(2)}deg) scale3d(${glassDrag.scaleX.toFixed(4)}, ${glassDrag.scaleY.toFixed(4)}, 1) skew(${glassDrag.skewX.toFixed(2)}deg, ${glassDrag.skewY.toFixed(2)}deg)`,
                    transition: glassDrag.isPressed
                      ? 'transform 45ms linear, border-radius 90ms linear, box-shadow 120ms ease-out'
                      : 'transform 680ms cubic-bezier(0.22, 1.35, 0.36, 1), border-radius 680ms cubic-bezier(0.22, 1.35, 0.36, 1), box-shadow 500ms ease-out',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.04) 55%, rgba(255, 255, 255, 0.11) 100%)',
                    backdropFilter: glassDrag.isPressed
                      ? 'blur(11px) saturate(175%) brightness(107%)'
                      : 'blur(9px) saturate(155%) brightness(105%)',
                    WebkitBackdropFilter: glassDrag.isPressed
                      ? 'blur(11px) saturate(175%) brightness(107%)'
                      : 'blur(9px) saturate(155%) brightness(105%)',
                    border: '1px solid rgba(255, 255, 255, 0.56)',
                    boxShadow: glassDrag.isPressed
                      ? `
                        ${(-glassDrag.dx * 0.45).toFixed(1)}px ${(18 - glassDrag.dy * 0.45).toFixed(1)}px 42px rgba(36, 19, 12, 0.22),
                        0 4px 14px rgba(36, 19, 12, 0.10),
                        inset 0 1.5px 2px rgba(255, 255, 255, 0.92),
                        inset 0 -1.5px 3px rgba(197, 160, 89, 0.28),
                        inset 0 12px 24px rgba(255, 255, 255, 0.22)
                      `
                      : `
                        0 14px 36px rgba(36, 19, 12, 0.16),
                        0 3px 10px rgba(36, 19, 12, 0.08),
                        inset 0 1px 1.5px rgba(255, 255, 255, 0.8),
                        inset 0 -1px 2px rgba(197, 160, 89, 0.2),
                        inset 0 10px 20px rgba(255, 255, 255, 0.14)
                      `,
                  }}
                >
                  {/* Dynamic Refractive Light Overlay that follows finger/cursor pull */}
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                      opacity: glassDrag.isPressed ? 0.78 : 0.55,
                      background: `radial-gradient(circle at ${glassDrag.glareX.toFixed(1)}% ${glassDrag.glareY.toFixed(1)}%, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.18) 34%, transparent 65%)`,
                    }}
                  />

                  <div className="relative z-10 flex flex-col">
                    <div className="flex items-center justify-between gap-2 border-b border-[#4a3b32]/15 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-[#8b0000] ui-font truncate"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.10) 100%)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.55)',
                          }}
                        >
                          {selectedStory.ref}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveSentence(null)}
                        className="h-6 w-6 rounded-full flex items-center justify-center text-xs text-[#382117] active:scale-95 transition-all ui-font shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.10) 100%)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.55)',
                        }}
                        aria-label="Close sentence focus"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="mt-3 text-[15px] leading-relaxed font-semibold text-[#1f100a] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] reading-font italic">
                      "{displaySentence.trim()}"
                    </p>

                    <div
                      className={`grid transition-[grid-template-rows,opacity,margin-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        sentenceToolView !== 'NONE'
                          ? 'grid-rows-[1fr] opacity-100 mt-3'
                          : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                      }`}
                    >
                    <div className="overflow-hidden">
                      <div
                        className="rounded-2xl p-3 text-xs text-[#1f100a] max-h-52 overflow-y-auto no-scrollbar reading-font transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.10) 100%)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.52)',
                          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        {(sentenceToolView === 'WORD' ||
                          sentenceToolView === 'PASSAGE' ||
                          sentenceToolView === 'CHAPTER' ||
                          sentenceToolView === 'NARRATIVE') && (
                          <div className="animate-fade-in space-y-2">
                            <div className="flex items-center justify-between gap-2 border-b border-[#4a3b32]/15 pb-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b0000] ui-font">
                                {sentenceToolView === 'WORD' && '1 • Word in Sentence Context'}
                                {sentenceToolView === 'PASSAGE' && '2 • Sentence in Verse Context'}
                                {sentenceToolView === 'CHAPTER' && '3 • Verse in Passage Context'}
                                {sentenceToolView === 'NARRATIVE' && '4 • Passage in Bible Context'}
                              </span>
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#8b0000]/10 text-[#8b0000] ui-font">
                                ✦ AI Scholar
                              </span>
                            </div>

                            {isAnalyzingScope ? (
                              <div className="py-4 flex flex-col items-center justify-center gap-2 text-center">
                                <span className="w-4 h-4 rounded-full border-2 border-[#8b0000]/30 border-t-[#8b0000] animate-spin" />
                                <p className="text-[11px] italic text-stone-700 animate-pulse">
                                  Analyzing {sentenceToolView === 'WORD' ? `"${getPrimaryWordFromSentence(displaySentence)}" in sentence` : sentenceToolView === 'PASSAGE' ? 'sentence in verse' : sentenceToolView === 'CHAPTER' ? 'verse in passage' : 'passage in the Bible'}...
                                </p>
                              </div>
                            ) : granularAnalysis ? (
                              <div className="space-y-1.5">
                                <div className="text-xs font-bold text-[#382117]">
                                  {granularAnalysis.focalElement}
                                </div>
                                <p className="leading-relaxed text-[11.5px] text-[#1f100a]">
                                  <strong>Contextual Analysis:</strong> {granularAnalysis.contextualMeaning}
                                </p>
                                <p className="leading-relaxed text-[11px] text-[#382117]/90">
                                  <strong>Linguistic & Literary Note:</strong> {granularAnalysis.linguisticOrLiteraryNote}
                                </p>
                                <p className="italic text-[11px] text-[#8b0000]/95 leading-relaxed">
                                  <strong>Insight:</strong> {granularAnalysis.practicalInsight}
                                </p>
                                {granularAnalysis.crossReferences && granularAnalysis.crossReferences.length > 0 && (
                                  <div className="pt-1 flex flex-wrap items-center gap-1 ui-font">
                                    <span className="text-[9px] font-bold uppercase text-stone-600">Refs:</span>
                                    {granularAnalysis.crossReferences.map((refStr, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/40 border border-white/60 text-[#8b0000]"
                                      >
                                        {refStr}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {sentenceToolView === 'SEARCH' && (
                          <div className="animate-fade-in space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8b0000] ui-font">
                              Webster's 1828 & Scripture Search
                            </div>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search term or passage..."
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/45 border border-white/60 text-[#24130c] placeholder:text-stone-500 focus:outline-none focus:border-[#8b0000] ui-font"
                            />
                            {(() => {
                              const q = (searchQuery.trim() || getPrimaryWordFromSentence(displaySentence)).trim();
                              const lexEntry = getKjvDictionaryEntry(q);
                              const matchingPassages = MASTER_CONTENT.filter(
                                item =>
                                  item.title.toLowerCase().includes(q.toLowerCase()) ||
                                  item.body.toLowerCase().includes(q.toLowerCase()) ||
                                  item.why.toLowerCase().includes(q.toLowerCase())
                              ).slice(0, 3);

                              return (
                                <div className="space-y-1.5 pt-0.5">
                                  <div className="p-2 rounded-lg bg-white/30 border border-white/40">
                                    <div className="font-bold text-[#382117] text-[11px]">{lexEntry.term}</div>
                                    <div className="text-[11px] leading-snug text-[#24130c] mt-0.5">{lexEntry.shortDef}</div>
                                  </div>
                                  {matchingPassages.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="text-[9px] font-bold uppercase tracking-wider text-stone-600 ui-font">
                                        Related Passages
                                      </div>
                                      {matchingPassages.map(mp => (
                                        <button
                                          key={mp.id}
                                          type="button"
                                          onClick={() => {
                                            setActiveSection(mp.section);
                                            handleStoryChange(mp);
                                          }}
                                          className="w-full text-left px-2 py-1 rounded bg-white/25 hover:bg-white/45 transition-colors flex items-center justify-between gap-2 ui-font"
                                        >
                                          <span className="text-[10px] font-bold text-[#382117] truncate">{mp.title}</span>
                                          <span className="text-[9px] text-[#8b0000] shrink-0">{mp.ref}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Separate Liquid Glass Pills Row: [Word, Passage, Chapter, Narrative] + [Search, Bookmark] */}
                  <div className="mt-3.5 flex items-center justify-between gap-2 ui-font select-none">
                    {/* Pill 1: Word (aA), Passage (List), Chapter (Paper), Broader Narrative (Bookmark in Square) */}
                    <div
                      className="flex items-center gap-1 rounded-full px-2 py-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 100%)',
                        backdropFilter: 'blur(12px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                        border: '1px solid rgba(255, 255, 255, 0.55)',
                        boxShadow: `
                          0 6px 18px rgba(36, 19, 12, 0.12),
                          inset 0 1px 1px rgba(255, 255, 255, 0.75),
                          inset 0 -1px 1px rgba(197, 160, 89, 0.18)
                        `,
                      }}
                    >
                      {/* 1. "aA": Word in the context of the sentence */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sentenceToolView === 'WORD') {
                            setSentenceToolView('NONE');
                            return;
                          }
                          handleGranularScopeAnalysis('WORD', 'WORD_IN_SENTENCE');
                        }}
                        title="1) Analyze Word in the Context of the Sentence"
                        aria-label="Analyze Word in the Context of the Sentence"
                        className={`h-8 w-9 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                          sentenceToolView === 'WORD'
                            ? 'bg-white/45 text-[#8b0000] shadow-inner'
                            : 'text-[#24130c] hover:bg-white/25'
                        }`}
                      >
                        <svg className="w-[20px] h-[18px]" viewBox="0 0 26 24" fill="currentColor">
                          <text x="1" y="17.5" fontSize="11.5" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">a</text>
                          <text x="9.5" y="17.5" fontSize="15.5" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">A</text>
                        </svg>
                      </button>

                      {/* 2. Bullet List: Sentence in the context of the verse */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sentenceToolView === 'PASSAGE') {
                            setSentenceToolView('NONE');
                            return;
                          }
                          handleGranularScopeAnalysis('PASSAGE', 'SENTENCE_IN_VERSE');
                        }}
                        title="2) Analyze Sentence in the Context of the Verse"
                        aria-label="Analyze Sentence in the Context of the Verse"
                        className={`h-8 w-8 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                          sentenceToolView === 'PASSAGE'
                            ? 'bg-white/45 text-[#8b0000] shadow-inner'
                            : 'text-[#24130c] hover:bg-white/25'
                        }`}
                      >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="4.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                          <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
                          <circle cx="4.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
                          <line x1="9" y1="6.5" x2="19.5" y2="6.5" />
                          <line x1="9" y1="12" x2="19.5" y2="12" />
                          <line x1="9" y1="17.5" x2="19.5" y2="17.5" />
                        </svg>
                      </button>

                      {/* 3. Paper Icon: Verse in the context of the passage */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sentenceToolView === 'CHAPTER') {
                            setSentenceToolView('NONE');
                            return;
                          }
                          handleGranularScopeAnalysis('CHAPTER', 'VERSE_IN_PASSAGE');
                        }}
                        title="3) Analyze Verse in the Context of the Passage"
                        aria-label="Analyze Verse in the Context of the Passage"
                        className={`h-8 w-8 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                          sentenceToolView === 'CHAPTER'
                            ? 'bg-white/45 text-[#8b0000] shadow-inner'
                            : 'text-[#24130c] hover:bg-white/25'
                        }`}
                      >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="4" width="16" height="16" rx="2.5" />
                          <path d="M4 8h16" strokeWidth="2.5" />
                          <line x1="7.5" y1="12" x2="16.5" y2="12" strokeWidth="1.8" strokeLinecap="round" />
                          <line x1="7.5" y1="15" x2="16.5" y2="15" strokeWidth="1.8" strokeLinecap="round" />
                          <line x1="7.5" y1="18" x2="12.5" y2="18" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>

                      {/* 4. Bookmark in Square: Passage in the context of the Bible */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sentenceToolView === 'NARRATIVE') {
                            setSentenceToolView('NONE');
                            return;
                          }
                          handleGranularScopeAnalysis('NARRATIVE', 'PASSAGE_IN_BIBLE');
                        }}
                        title="4) Analyze Passage in the Context of the Bible"
                        aria-label="Analyze Passage in the Context of the Bible"
                        className={`h-8 w-8 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                          sentenceToolView === 'NARRATIVE'
                            ? 'bg-white/45 text-[#8b0000] shadow-inner'
                            : 'text-[#24130c] hover:bg-white/25'
                        }`}
                      >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
                          <path d="M13.5 4.5v7l2.25-1.6L18 11.5v-7" fill="currentColor" stroke="none" />
                        </svg>
                      </button>
                    </div>

                    {/* Pill 2: Search (Magnifying Glass) & Bookmark (Ribbon) */}
                    <div
                      className="flex items-center gap-1 rounded-full px-2 py-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 100%)',
                        backdropFilter: 'blur(12px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                        border: '1px solid rgba(255, 255, 255, 0.55)',
                        boxShadow: `
                          0 6px 18px rgba(36, 19, 12, 0.12),
                          inset 0 1px 1px rgba(255, 255, 255, 0.75),
                          inset 0 -1px 1px rgba(197, 160, 89, 0.18)
                        `,
                      }}
                    >
                      {/* 5. Magnifying Glass: In-App Concordance & Lexicon Search */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sentenceToolView === 'SEARCH') {
                            setSentenceToolView('NONE');
                          } else {
                            setSearchQuery(getPrimaryWordFromSentence(displaySentence));
                            setSentenceToolView('SEARCH');
                          }
                        }}
                        title="Search Lexicon & Passages"
                        aria-label="Search Lexicon and Passages"
                        className={`h-8 w-8 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                          sentenceToolView === 'SEARCH'
                            ? 'bg-white/45 text-[#8b0000] shadow-inner'
                            : 'text-[#24130c] hover:bg-white/25'
                        }`}
                      >
                        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="10.5" cy="10.5" r="6.5" />
                          <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" />
                        </svg>
                      </button>

                      {/* 6. Bookmark Icon: Save Sentence to Top-Right Red Ribbon */}
                      {(() => {
                        const isSaved = bookmarks.some(
                          b => b.sentence === displaySentence.trim() && b.storyId === selectedStory.id
                        );
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSentenceBookmark(displaySentence);
                            }}
                            title={isSaved ? "Remove Sentence from Ribbon Bookmarks" : "Bookmark Sentence to Red Ribbon"}
                            aria-label="Bookmark Sentence"
                            className={`h-8 w-8 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                              isSaved
                                ? 'bg-[#8b0000]/20 text-[#8b0000] shadow-inner'
                                : 'text-[#24130c] hover:bg-white/25'
                            }`}
                          >
                            <svg
                              className="w-[17px] h-[17px]"
                              viewBox="0 0 24 24"
                              fill={isSaved ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="2.1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" />
                            </svg>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}