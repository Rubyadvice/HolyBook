import React, { useState, useRef } from 'react';

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
  volumeRef?: string;
  shortDef: string;
  significance: string;
  rank?: number;
  isTop100?: boolean;
}

const AYBD_BASE_URL = "https://www.theologyandreligiononline.com/custom-browse?docid=AnchorYaleBibleDictionaryAZ";

const getAybdSearchUrl = (query?: string) => {
  if (!query || !query.trim()) return AYBD_BASE_URL;
  return `https://www.theologyandreligiononline.com/search?q=${encodeURIComponent(query.trim() + " Anchor Yale Bible Dictionary")}`;
};

interface BookmarkedSentence {
  id: string;
  sentence: string;
  storyId: string;
  storyTitle: string;
  storyRef: string;
  timestamp: string;
}

type OiaPhaseId = 'OBSERVATION' | 'INTERPRETATION' | 'APPLICATION';

interface OiaAnalysisData {
  observation: {
    journalistic_baseline: {
      who: string;
      what: string;
      where: string;
      when: string;
      why_here: string;
    };
    grammar_and_structure: {
      verbs_analysis: string;
      key_conjunctions: string;
      pronoun_tracing: string;
    };
    literary_features: {
      repetition: string[];
      comparisons_contrasts: string;
      tone: string;
    };
  };
  interpretation: {
    contextual_analysis: {
      immediate_context: string;
      book_context: string;
      cultural_historical_context: string;
    };
    theological_analysis: {
      theology_proper: string;
      christology: string;
      anthropology: string;
    };
    principlizing_bridge: string;
  };
  application: {
    spacepets_audit: {
      applicable_categories: string[];
      audit_explanation: string;
    };
    action_plan: {
      internal_alignment: string;
      relational_impact: string;
      measurable_action: string;
    };
  };
}

const RAW_TOP_PEOPLE: [number, string, string][] = [
  [1, "Jesus", "The central figure of the New Testament; also referred to as Christ, Lord, and Son of Man."],
  [2, "David", "King of Israel, credited with many Psalms; the most mentioned Old Testament figure."],
  [3, "Moses", "Prophet and lawgiver who led the Exodus out of Egypt."],
  [4, "Jacob (Israel)", "Patriarch whose 12 sons became the tribes of Israel."],
  [5, "Saul", "The first King of Israel (and the original name of the Apostle Paul)."],
  [6, "Aaron", "Moses' brother and the first High Priest of Israel."],
  [7, "Abraham (Abram)", "The founding patriarch of the Israelites."],
  [8, "Solomon", "Son of David; King known for his wisdom and building the first Temple."],
  [9, "Joseph", "Son of Jacob who became a ruler in Egypt (also Jesus' earthly father in the NT)."],
  [10, "Joshua", "Moses' successor who led the Israelites into Canaan."],
  [11, "Paul", "Apostle to the Gentiles and author of much of the New Testament."],
  [12, "Peter (Simon)", "Leading Apostle of Jesus."],
  [13, "Jeremiah", "The weeping prophet of the Old Testament."],
  [14, "Samuel", "Prophet and judge who anointed Saul and David."],
  [15, "Isaac", "Son of Abraham and father of Jacob."],
  [16, "John (The Baptist)", "The prophet who prepared the way for Jesus."],
  [17, "John (The Apostle)", "Disciple of Jesus and traditional author of a Gospel, Epistles, and Revelation."],
  [18, "Elijah", "Major prophet of the Northern Kingdom of Israel."],
  [19, "Isaiah", "Major Old Testament prophet widely quoted in the New Testament."],
  [20, "Mary (Mother of Jesus)", "The most mentioned woman in the Bible."],
  [21, "Daniel", "Prophet known for his visions and surviving the lions' den."],
  [22, "Ezekiel", "Major Old Testament prophet during the Babylonian exile."],
  [23, "Hezekiah", "One of the most prominent kings of Judah."],
  [24, "Joab", "Commander of King David's army."],
  [25, "Absalom", "David's rebellious son."],
  [26, "Elisha", "Prophet who succeeded Elijah and performed numerous miracles."],
  [27, "Ahab", "One of the most wicked kings of northern Israel, married to Jezebel."],
  [28, "Jeroboam", "The first king of the divided northern kingdom of Israel."],
  [29, "Sarah (Sarai)", "Wife of Abraham and matriarch of the Jewish people."],
  [30, "Jonathan", "King Saul's son and King David's most loyal friend."],
  [31, "Gideon", "A judge who delivered Israel from the Midianites with only 300 men."],
  [32, "Herod", "A dynasty of Roman-appointed rulers, including Herod the Great and Herod Antipas."],
  [33, "Pilate (Pontius)", "The Roman governor of Judea who authorized the crucifixion of Jesus."],
  [34, "James", "Refers primarily to the Apostle and the half-brother of Jesus."],
  [35, "Josiah", "A righteous king of Judah who instituted major religious reforms."],
  [36, "Judas (Iscariot)", "The disciple who betrayed Jesus for thirty pieces of silver."],
  [37, "Asa", "An early king of Judah noted for stripping away foreign idols."],
  [38, "Jehoshaphat", "A generally righteous king of Judah who allied with the northern kingdom."],
  [39, "Esau", "Jacob's twin brother who sold his birthright; ancestor of the Edomites."],
  [40, "Rachel", "Jacob's favored wife and the mother of Joseph and Benjamin."],
  [41, "Job", "The central figure of the Book of Job, tested by suffering to demonstrate faithfulness."],
  [42, "Nehemiah", "The cupbearer to the Persian king who returned to rebuild the walls of Jerusalem."],
  [43, "Ezra", "A priest and scribe who led exiles back to Jerusalem and restored the Torah."],
  [44, "Timothy", "A young pastor and Paul's closest protégé, recipient of two New Testament letters."],
  [45, "Barnabas", "An early Christian leader and Paul's first missionary companion."],
  [46, "Ishmael", "Abraham's first son (by Hagar)."],
  [47, "Ruth", "A Moabite woman who showed intense loyalty to Naomi, becoming an ancestor of David."],
  [48, "Esther", "A Jewish woman who became Queen of Persia and saved her people from genocide."],
  [49, "Stephen", "The first recorded Christian martyr, stoned to death in Acts."],
  [50, "Miriam", "Moses and Aaron's sister, a prophetess who led the Israelites in worship."],
  [51, "Abner", "Commander of King Saul's army and a major player in Israel's early civil wars."],
  [52, "Rebekah", "Wife of Isaac and mother of the twins Jacob and Esau."],
  [53, "Balaam", "The foreign prophet who was hired to curse Israel but was rebuked by his donkey."],
  [54, "Zedekiah", "The last, tragic king of Judah, whose rebellion led to the destruction of Jerusalem."],
  [55, "Samson", "The famously strong, tragic Judge of Israel who fought the Philistines."],
  [56, "Jehu", "The furious chariot-driving king of Israel who violently wiped out Ahab's royal line."],
  [57, "Lot", "Abraham's nephew who barely escaped the destruction of Sodom."],
  [58, "Silas", "A leading member of the early church and Paul's primary companion on his second journey."],
  [59, "Titus", "A Gentile convert and trusted troubleshooter for the Apostle Paul."],
  [60, "Luke", "A physician, traveling companion of Paul, and author of a Gospel and Acts."],
  [61, "Mary Magdalene", "A devoted follower of Jesus and the first recorded witness to his resurrection."],
  [62, "Martha", "The pragmatic, hardworking sister of Mary and Lazarus."],
  [63, "Lazarus", "The friend of Jesus who was famously raised from the dead after four days."],
  [64, "Thomas", "The Apostle best known for demanding physical proof of Jesus' resurrection."],
  [65, "Nicodemus", "A Pharisee and member of the Sanhedrin who secretly sought out Jesus at night."],
  [66, "Caleb", "Along with Joshua, the only spy who believed God would give Israel the Promised Land."],
  [67, "Manasseh", "Joseph's son (tribal patriarch) or the wicked king in Judah's history who repented."],
  [68, "Leah", "Jacob's unloved first wife, but the mother of Judah and ancestor of Jesus."],
  [69, "Levi", "Son of Jacob and the patriarch of the tribe that became Israel's priests."],
  [70, "Judah", "Son of Jacob who suggested selling Joseph, later offering himself as a substitute for Benjamin."],
  [71, "Benaiah", "One of David's mighty men; later Solomon's army commander."],
  [72, "Boaz", "The honorable landowner who served as Ruth's kinsman-redeemer."],
  [73, "Hagar", "Sarah's Egyptian handmaid and the mother of Ishmael."],
  [74, "Zechariah", "Prophet who urged rebuilding the Temple; also John the Baptist's father."],
  [75, "Hosea", "Prophet commanded to marry an unfaithful woman as a metaphor for God and Israel."],
  [76, "Noah", "The righteous man chosen to build the Ark and survive the global flood."],
  [77, "Rehoboam", "Solomon's son whose harsh policies caused the kingdom to split in two."],
  [78, "Laban", "Jacob's uncle and father-in-law, known for his cunning and trickery."],
  [79, "Abimelech", "A recurring Philistine royal title, and the name of Gideon's ruthless son."],
  [80, "Ahaz", "A notoriously wicked king of Judah who practiced child sacrifice."],
  [81, "Uzziah (Azariah)", "A mostly righteous king of Judah who was struck with leprosy for pride."],
  [82, "Haman", "The arrogant Persian official who plotted a genocide of the Jews."],
  [83, "Mordecai", "Esther's cousin and guardian who helped her thwart Haman's plot."],
  [84, "Ahasuerus (Xerxes)", "The volatile King of the Persian Empire who made Esther his queen."],
  [85, "Jonah", "The reluctant prophet swallowed by a great fish after fleeing his mission to Nineveh."],
  [86, "Eli", "The High Priest and judge at Shiloh who mentored the boy Samuel."],
  [87, "Uriah (the Hittite)", "One of David's elite warriors, murdered to cover up David's affair."],
  [88, "Bathsheba", "Uriah's wife, who became David's queen and the mother of King Solomon."],
  [89, "Amos", "A shepherd-turned-prophet who condemned the northern kingdom for social injustice."],
  [90, "Micah", "A prophet who championed the poor and foretold the Messiah's birth in Bethlehem."],
  [91, "Philip", "Refers to an original Apostle and Philip the Evangelist who preached in Samaria."],
  [92, "Apollos", "An eloquent Jewish Christian from Alexandria who became a key leader."],
  [93, "Mark (John Mark)", "Companion of Paul and Peter, traditional author of the Gospel of Mark."],
  [94, "Cornelius", "A Roman centurion whose conversion opened the Gospel to Gentiles."],
  [95, "Agrippa", "The Roman-appointed Jewish king who heard Paul's defense in Caesarea."],
  [96, "Felix", "The corrupt Roman governor of Judea who kept Paul imprisoned for two years."],
  [97, "Festus", "Felix's successor, who eventually sent Paul to Rome to stand trial."],
  [98, "Priscilla", "A Jewish Christian tentmaker who risked her life for Paul and instructed Apollos."],
  [99, "Aquila", "Priscilla's husband and co-laborer in early church planting."],
  [100, "Enoch", "A patriarch before the flood who walked with God, and he was not, for God took him."]
];

const RAW_TOP_PLACES: [number, string, string][] = [
  [1, "Jerusalem (Zion)", "The political and spiritual capital of biblical Israel."],
  [2, "Israel", "The nation, the land, and the people descended from Jacob."],
  [3, "Egypt", "The empire where the Israelites were enslaved, and a frequent refuge."],
  [4, "Judah", "The southern kingdom and the primary tribe of the Jewish people."],
  [5, "Babylon", "The empire that destroyed Jerusalem and exiled the Jews."],
  [6, "Canaan", "The Promised Land before the Israelite conquest."],
  [7, "Jordan (River)", "The major water source and boundary crossing."],
  [8, "Ephraim", "The dominant tribe of the northern kingdom, often used as a synonym for the north."],
  [9, "Samaria", "The capital of the northern kingdom, later a region despised by Judeans."],
  [10, "Edom", "The nation descended from Esau, Jacob's brother."],
  [11, "Moab", "A neighboring nation to Israel, descended from Lot."],
  [12, "Damascus", "Capital of Syria; site of Paul's conversion."],
  [13, "Assyria", "The empire that conquered and exiled the northern kingdom of Israel."],
  [14, "Galilee", "The northern region of Israel where Jesus conducted most of his ministry."],
  [15, "Bethel", "A major religious site where Jacob had his ladder dream."],
  [16, "Gilead", "A mountainous region east of the Jordan River."],
  [17, "Bethlehem", "The birthplace of both King David and Jesus."],
  [18, "Sinai (Horeb)", "The mountain where God gave the Law to Moses."],
  [19, "Tyre", "A wealthy Phoenician coastal city frequently condemned by prophets."],
  [20, "Jericho", "The first city conquered by Joshua; a prominent New Testament stop."],
  [21, "Rome", "Capital of the ruling empire in the New Testament; Paul's final destination."],
  [22, "Philistia", "The coastal territory of Israel's perennial enemies, the Philistines."],
  [23, "Antioch (Syria)", "The city where believers were first called Christians."],
  [24, "Nazareth", "The hometown where Jesus was raised."],
  [25, "Ephesus", "A major Roman city and recipient of one of Paul's letters."],
  [26, "Aram (Syria)", "An ancient region northeast of Israel, often at war with the Israelite kings."],
  [27, "Hebron", "King David's first capital and the burial site of the patriarchs."],
  [28, "Shechem", "An ancient Canaanite city where Joshua renewed the covenant."],
  [29, "Shiloh", "The primary religious center and resting place of the Ark before the Temple."],
  [30, "Gilgal", "The first camp of the Israelites after crossing the Jordan River."],
  [31, "Corinth", "A wealthy Greek trading city and recipient of two of Paul's letters."],
  [32, "Nineveh", "The fierce capital of the Assyrian Empire and destination of Jonah."],
  [33, "Sodom", "A city famously destroyed by God for its extreme wickedness."],
  [34, "Beersheba", "The southernmost major city of ancient Israel."],
  [35, "Bashan", "A fertile region east of the Sea of Galilee."],
  [36, "Euphrates", "The major river of Mesopotamia, marking the eastern boundary of the biblical world."],
  [37, "Mount Carmel", "Where Elijah had his fiery showdown with the prophets of Baal."],
  [38, "Mount of Olives", "The ridge east of Jerusalem central to Jesus' final week."],
  [39, "Gath", "One of the five major Philistine cities and hometown of Goliath."],
  [40, "Macedonia", "A Roman province in northern Greece where Paul established churches."],
  [41, "Thessalonica", "The capital of Macedonia and a major hub for early Christian expansion."],
  [42, "Sea of Galilee", "The lake where Jesus walked on water and called his disciples."],
  [43, "Philippi", "A Roman colony and site of the first Christian church in Europe."],
  [44, "Ur (of Chaldeans)", "The wealthy Mesopotamian city where Abraham originally lived."],
  [45, "Susa (Shushan)", "The winter capital of the Persian Empire, setting for Esther and Nehemiah."],
  [46, "Ashdod", "A major Philistine city where the Ark of the Covenant toppled Dagon."],
  [47, "Gaza", "A Philistine stronghold where Samson destroyed the temple of Dagon."],
  [48, "Capernaum", "A fishing village that served as the home base for Jesus' ministry."],
  [49, "Gethsemane", "The olive grove where Jesus prayed and was arrested."],
  [50, "Golgotha (Calvary)", "The hill outside Jerusalem's walls where Jesus was crucified."],
  [51, "Midian", "The wilderness region where Moses fled as a fugitive."],
  [52, "Ammon", "A nation east of the Jordan River, frequently at war with Israel."],
  [53, "Sidon", "A wealthy Phoenician coastal city paired in judgment with Tyre."],
  [54, "Gibeon", "The Canaanite city that tricked Joshua; site where the sun stood still."],
  [55, "Mizpah", "A frequent gathering place for national assembly and repentance."],
  [56, "Ramah", "The hometown and base of operations for the prophet Samuel."],
  [57, "Mount Nebo", "The peak where Moses viewed the Promised Land before his death."],
  [58, "Kadesh-Barnea", "The wilderness oasis where Israel tragically refused to enter the Promised Land."],
  [59, "Tarsus", "A major intellectual hub in Asia Minor; hometown of Paul."],
  [60, "Cyprus", "A Mediterranean island, homeland of Barnabas, first stop on Paul's journey."],
  [61, "Athens", "The intellectual center where Paul debated philosophers on Mars Hill."],
  [62, "Colossae", "A city in Asia Minor and recipient of Paul's letter to the Colossians."],
  [63, "Galatia", "A Roman province in central Asia Minor where Paul established churches."],
  [64, "Joppa", "The seaport where Jonah fled, and where Peter had his vision."],
  [65, "Caesarea (Maritima)", "The Roman coastal capital of Judea where Paul was imprisoned."],
  [66, "Caesarea Philippi", "A heavily pagan city where Peter confessed You are the Christ."],
  [67, "Mount Seir", "The rugged, mountainous homeland of the Edomites."],
  [68, "Red Sea", "The body of water miraculously parted by God for the Exodus."],
  [69, "Nile River", "The lifeblood of Egypt; site of the plague of blood."],
  [70, "Dead Sea", "The lowest point on earth and eastern boundary of Judah."],
  [71, "Megiddo", "A highly strategic fortress city; prophesied as the site of Armageddon."],
  [72, "Peniel (Penuel)", "Where Jacob wrestled with God and his name was changed to Israel."],
  [73, "Patmos", "The rocky prison island where John received the visions of Revelation."],
  [74, "Babel", "Site of humanity's rebellion and God's confusion of languages."],
  [75, "Gomorrah", "The neighboring city to Sodom, associated with extreme wickedness."],
  [76, "Dan", "The northernmost city of ancient Israel, infamous for idol worship."],
  [77, "Ziklag", "A Philistine city given to David as a refuge when fleeing Saul."],
  [78, "En-gedi", "A lush oasis near the Dead Sea where David spared Saul's life."],
  [79, "Jezreel", "A strategic valley and the winter capital of Ahab and Jezebel."],
  [80, "Ramoth-Gilead", "A highly contested city where King Ahab was killed in battle."],
  [81, "Jabesh-Gilead", "City whose residents bravely recovered the bodies of Saul and his sons."],
  [82, "Hazor", "A massive Canaanite stronghold in the north that Joshua destroyed."],
  [83, "Mount Hermon", "The highest snow-capped peak, marking Israel's northern boundary."],
  [84, "Mount Tabor", "Rallying point for Deborah; traditionally the Mount of Transfiguration."],
  [85, "Valley of Hinnom", "A cursed ravine outside Jerusalem, later becoming a symbol for Hell (Gehenna)."],
  [86, "Kidron Valley", "The ravine crossed by Jesus before his arrest in Gethsemane."],
  [87, "Tarshish", "A distant maritime location that Jonah tried to escape to."],
  [88, "Ophir", "A legendary region famous for supplying King Solomon with gold."],
  [89, "Sheba", "A wealthy kingdom in southern Arabia whose queen visited Solomon."],
  [90, "Troas", "The coastal city where Paul received his vision calling him to Europe."],
  [91, "Miletus", "A seaport where Paul gave a tearful farewell to the Ephesian elders."],
  [92, "Iconium", "A city in Asia Minor where Paul faced intense opposition but made converts."],
  [93, "Lystra", "A city where Paul was worshipped, then nearly stoned to death."],
  [94, "Derbe", "The furthest city reached on Paul's first missionary journey."],
  [95, "Berea (Beroea)", "A city praised because its residents eagerly searched the Scriptures."],
  [96, "Crete", "A large island where Paul left Titus to organize the early churches."],
  [97, "Malta", "The island where Paul was shipwrecked on his way to Rome."],
  [98, "Laodicea", "A wealthy city housing the lukewarm church severely rebuked in Revelation."],
  [99, "Smyrna", "A city housing a persecuted church in Revelation, told to remain faithful."],
  [100, "Pergamum", "A city described in Revelation as the place where Satan has his throne."]
];

const RAW_TOP_CONCEPTS: [number, string, string][] = [
  [1, "God / Lord", "The supreme deity; the most frequently used nouns in the entire Bible."],
  [2, "King / Kingdom", "The concept of earthly rulers and the sovereign reign of God."],
  [3, "Law / Commandment", "The Torah, the rules, and the divine instructions for living."],
  [4, "Sin / Iniquity / Evil", "Human rebellion and failure to meet divine standards."],
  [5, "Son / Children", "Used for human lineage, the Children of Israel, and the Son of God."],
  [6, "Love / Mercy", "God's loyal devotion (Hesed) and unconditional love (Agape)."],
  [7, "Faith / Belief", "Trust in God's promises; the central mechanism of salvation."],
  [8, "Righteousness", "Moral purity and the equitable treatment of others."],
  [9, "Covenant", "The binding agreements between God and humanity."],
  [10, "Blood / Sacrifice", "The cost of atonement and the sealing of covenants."],
  [11, "Holy / Holiness", "To be set apart; the defining attribute of God's nature."],
  [12, "Grace / Favor", "Unmerited divine assistance and goodwill."],
  [13, "Truth", "Ultimate reality as defined by God's character and word."],
  [14, "Spirit", "The breath of life, the human soul, and the Holy Spirit."],
  [15, "Wisdom", "Practical insight for living a godly life, highly emphasized in Proverbs."],
  [16, "Life / Eternal Life", "Both physical existence and spiritual salvation."],
  [17, "Death / Sheol", "The consequence of sin and the realm of the dead."],
  [18, "Peace (Shalom)", "Wholeness, well-being, and the absence of conflict."],
  [19, "Flesh", "Physical humanity, often contrasted with the Spirit in Paul's writings."],
  [20, "Heaven", "The sky, the cosmos, and the dwelling place of God."],
  [21, "Earth / World", "The physical creation and the systems of human society."],
  [22, "Light / Darkness", "The primary metaphor for good vs. evil and truth vs. ignorance."],
  [23, "Salvation", "Deliverance from enemies, slavery, or spiritual death."],
  [24, "Glory", "The heavy, radiant weight of God's presence and honor."],
  [25, "Prophet / Prophecy", "The mouthpieces of God warning of judgment and promising restoration."],
  [26, "Heart", "The seat of the human will, intellect, and decision-making."],
  [27, "Temple / Tabernacle", "Structures representing God's localized presence among His people."],
  [28, "Priest / Priesthood", "The mediators appointed to offer sacrifices and intercede."],
  [29, "Praise / Worship", "The act of ascribing ultimate worth, honor, and adoration to God."],
  [30, "Fear (of the Lord)", "Deep reverence and submission, often called the beginning of wisdom."],
  [31, "Blessing", "Divine favor, multiplication, and empowerment for success."],
  [32, "Curse", "The removal of divine protection and the imposition of judgment."],
  [33, "Word", "Scripture, prophecies, and theologically Jesus himself (the Logos)."],
  [34, "Joy / Rejoicing", "A deep gladness rooted in God's character rather than circumstances."],
  [35, "Prayer", "Direct communication with God, including petition and lament."],
  [36, "Angel", "Spiritual beings serving as God's messengers and warriors."],
  [37, "Soul", "The living essence of a person; the whole self."],
  [38, "Hope", "A confident expectation of future salvation based on God's faithfulness."],
  [39, "Forgiveness", "The canceling of a moral debt or offense."],
  [40, "Repentance", "A complete change of mind and direction; turning away from sin."],
  [41, "Judgment", "God's righteous evaluation of human actions."],
  [42, "Wrath", "God's active, settled, and holy hostility toward evil."],
  [43, "Sabbath", "The seventh day of rest, instituted at creation."],
  [44, "Cross / Crucifixion", "Roman execution method that became the symbol of Christian atonement."],
  [45, "Resurrection", "The physical raising of the dead to new, immortal life."],
  [46, "Satan / Devil", "The primary spiritual adversary; the accuser."],
  [47, "Bread", "Daily sustenance; used metaphorically by Jesus as the Bread of Life."],
  [48, "Wine", "A symbol of joy, the blood of the New Covenant, and God's wrath."],
  [49, "Remnant", "A small, surviving group of faithful people whom God preserves."],
  [50, "Creation", "God's act of bringing the universe into existence out of nothing."],
  [51, "Altar", "A raised structure used for offering sacrifices and incense."],
  [52, "Anointing (Oil)", "Pouring of oil to symbolize consecration and the Holy Spirit's power."],
  [53, "Ark", "Noah's vessel of salvation and the gold-covered Ark of the Covenant."],
  [54, "Fasting", "Intentional abstention from food to express mourning or focus on prayer."],
  [55, "Idolatry / Idols", "The creation and worship of false gods."],
  [56, "Circumcision", "The physical removal of the foreskin, sign of the Abrahamic covenant."],
  [57, "Tithes / Offerings", "The requirement to give a tenth of wealth back to God."],
  [58, "Atonement", "Covering over sin and turning away divine wrath through a substitute."],
  [59, "Fire", "A frequent symbol of God's holy presence, purification, and judgment."],
  [60, "Water", "A dual symbol representing cleansing and destructive chaos."],
  [61, "Shepherd / Sheep", "Metaphor for leadership, vulnerability, and God's tender care."],
  [62, "Visions / Dreams", "Methods of divine revelation for warnings and prophecies."],
  [63, "Fool / Folly", "Moral deficiency and the stubborn rejection of God's ways."],
  [64, "Gospel (Good News)", "Announcement of Jesus' victory and invitation into his kingdom."],
  [65, "Church (Ekklesia)", "The gathered community of believers called out by God."],
  [66, "Mystery", "A part of God's redemptive plan once hidden but revealed in Christ."],
  [67, "Fruit / Harvest", "A metaphor for spiritual maturity and the final ingathering of souls."],
  [68, "Crown", "Symbol of royal authority, victory, and eternal reward."],
  [69, "Famine", "A shortage of food, frequently a tool of divine testing or discipline."],
  [70, "Plague / Pestilence", "Outbreaks of disease or ecological disaster used as divine judgment."],
  [71, "Genealogy", "Tracing of family lines to prove inheritances and Messianic promises."],
  [72, "Exile / Captivity", "The ultimate covenant curse: being forcibly removed from the Land."],
  [73, "Redeemer (Kinsman)", "A close relative responsible for buying back family land or avenging."],
  [74, "Widows and Orphans", "Vulnerable members of society whose treatment tested a nation's justice."],
  [75, "New Heavens & Earth", "The final, perfected state of creation where God dwells with humanity."],
  [76, "Inheritance", "The physical land promised to Israel, and the eternal kingdom."],
  [77, "Wilderness", "A desolate place representing divine testing and reliance on God."],
  [78, "Firstfruits", "Giving God the first and best portion of the harvest."],
  [79, "Firstborn", "The eldest son who held special status and belonged to God."],
  [80, "Jubilee", "The 50th year when debts were canceled and slaves freed."],
  [81, "Oath / Vow", "A solemn, binding promise made before God."],
  [82, "Justification", "The legal declaration of a sinner being made right before God."],
  [83, "Sanctification", "The ongoing process of being made holy and purified."],
  [84, "Humility / Meekness", "A virtue characterized by lowliness and submission to God's will."],
  [85, "Pride", "The fundamental sin of elevating self above God and others."],
  [86, "Hypocrisy", "Pretending to be morally righteous while masking inward sin."],
  [87, "Blasphemy", "Speaking sacrilegiously against God."],
  [88, "Conscience", "The internal moral compass bearing witness to God's universal law."],
  [89, "Leaven / Yeast", "A frequent symbol of the pervasive, spreading nature of sin."],
  [90, "Yoke", "A harness; metaphor for slavery, burdensome laws, or submission."],
  [91, "Cornerstone", "The foundational stone of a building; primary metaphor for Jesus."],
  [92, "Vine / Vineyard", "Metaphor representing the nation of Israel, and later Jesus."],
  [93, "Sword", "Symbol of war, divine judgment, and the truth of the Word of God."],
  [94, "Trumpet (Shofar)", "Used to sound alarms, gather assemblies, and announce the end times."],
  [95, "Incense", "A fragrant offering symbolizing the prayers of God's people."],
  [96, "Manna", "The miraculous bread from heaven that sustained the Israelites."],
  [97, "Adoption", "The reality of believers being legally brought into God's family."],
  [98, "Election", "God sovereignly selecting individuals or nations for His purposes."],
  [99, "Hospitality", "The sacred duty of welcoming and protecting strangers."],
  [100, "Refuge", "God as a safe shelter; also physical Cities of Refuge for manslayers."]
];

const BIBLICAL_LEXICON: Record<string, LexiconEntry> = {};
const LEXICON_LOOKUP: Record<string, LexiconEntry> = {};

const registerTop100Category = (
  data: [number, string, string][],
  category: 'Person' | 'Place' | 'Concept & Artifact'
) => {
  const catLabel =
    category === 'Person'
      ? 'Top 100 Most Referenced People'
      : category === 'Place'
      ? 'Top 100 Most Referenced Places'
      : 'Top 100 Most Referenced Concepts';

  data.forEach(([rank, termStr, shortDef]) => {
    const uniqueKey = `${category}-${rank}-${termStr}`;
    const entry: LexiconEntry = {
      term: termStr,
      category,
      volumeRef: `${catLabel} • Rank #${rank}`,
      shortDef,
      significance: `Ranked #${rank} in the ${catLabel} across the Old and New Testaments.`,
      rank,
      isTop100: true,
    };

    BIBLICAL_LEXICON[uniqueKey] = entry;

    // Index all individual alias words for in-text scanner highlighting
    const aliases = termStr
      .replace(/[\(\)]/g, ' ')
      .split(/[\/,&]|\band\b|\bof\b|\bthe\b/i)
      .map(s => s.trim())
      .filter(s => s.length >= 3);

    const primaryWord = termStr.split(/[\(\/]/)[0].trim();
    if (primaryWord) {
      LEXICON_LOOKUP[primaryWord.toLowerCase()] = entry;
    }
    aliases.forEach(alias => {
      const lower = alias.toLowerCase();
      if (!LEXICON_LOOKUP[lower]) {
        LEXICON_LOOKUP[lower] = entry;
      }
      alias.split(/\s+/).forEach(part => {
        const cleanPart = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (cleanPart.length >= 3 && !LEXICON_LOOKUP[cleanPart]) {
          LEXICON_LOOKUP[cleanPart] = entry;
        }
      });
    });
  });
};

registerTop100Category(RAW_TOP_PEOPLE, 'Person');
registerTop100Category(RAW_TOP_PLACES, 'Place');
registerTop100Category(RAW_TOP_CONCEPTS, 'Concept & Artifact');

const findLexiconEntry = (word: string): LexiconEntry | undefined => {
  const clean = word.replace(/[^a-zA-Z']/g, '').toLowerCase();
  if (!clean) return undefined;
  return LEXICON_LOOKUP[clean];
};

const getKjvDictionaryEntry = (word: string): LexiconEntry => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  const existing = findLexiconEntry(cleanWord);
  if (existing) return existing;

  const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
  return {
    term: capitalized,
    category: "Concept & Artifact",
    volumeRef: "Biblical References Compilation",
    shortDef: `"${capitalized}" — canonical biblical term analyzed within historical and theological context.`,
    significance: `Selected term for inductive scripture observation and interpretation.`
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

const INTRODUCTORY_TILE_SEARCH_TERMS: Record<StorySection, string> = {
  NARRATIVE: "Creation of Light Gustave Dore Genesis painting",
  OT: "Moses with the Tablets of the Law Rembrandt painting",
  NT: "Sermon on the Mount Carl Bloch painting",
  THEMES: "David with the Harp Rembrandt biblical painting",
  PERICOPES: "St Jerome in His Study Caravaggio painting"
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
  const [sentenceToolView, setSentenceToolView] = useState<'NONE' | OiaPhaseId>('NONE');
  const [popupOrigin, setPopupOrigin] = useState<{ x: string; y: string }>({ x: '50%', y: '50%' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aybdLetterFilter, setAybdLetterFilter] = useState<string>('ALL');
  const [aybdCategoryFilter, setAybdCategoryFilter] = useState<'ALL' | 'Person' | 'Place' | 'Concept & Artifact'>('ALL');
  const [isLexiconFilterExpanded, setIsLexiconFilterExpanded] = useState<boolean>(false);
  const [aybdSearchInput, setAybdSearchInput] = useState<string>('');
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const lexiconScrollRef = useRef<HTMLDivElement>(null);
  
  const [isHomeScrolled, setIsHomeScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const handleHomeScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > 15 && currentScrollY > lastScrollY.current) {
      setIsHomeScrolled(true);
      setIsLexiconFilterExpanded(false);
    } else if (currentScrollY < lastScrollY.current - 5 || currentScrollY <= 15) {
      setIsHomeScrolled(false);
    }
    lastScrollY.current = currentScrollY;
  };

  // OIA AI Analysis State for Liquid Glass Popup
  const [oiaData, setOiaData] = useState<OiaAnalysisData | null>(null);
  const [isAnalyzingScope, setIsAnalyzingScope] = useState<boolean>(false);
  const [oiaCache, setOiaCache] = useState<Record<string, OiaAnalysisData>>({});

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

    // Rubber-band fluid resistance using hyperbolic tangent
    const maxPull = 26;
    const dx = Math.tanh(rawDx / 95) * maxPull;
    const dy = Math.tanh(rawDy / 95) * maxPull;

    const absX = Math.min(1, Math.abs(rawDx) / 170);
    const absY = Math.min(1, Math.abs(rawDy) / 170);

    // Subtle liquid distension: stretches along pull axis, compresses slightly on perpendicular axis
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

  // Bookmarks & Home Hub State (Triggered via Left-to-Right Page Curl on Ribbon Click)
  const [bookmarks, setBookmarks] = useState<BookmarkedSentence[]>([
    {
      id: 'bm-default-1',
      sentence: 'God creates the heavens and the earth, brings order out of darkness, and makes humanity in His image.',
      storyId: 'NAR-01',
      storyTitle: '1. Creation',
      storyRef: 'Genesis 1-2',
      timestamp: 'Saved Study Note',
    },
  ]);
  // 1) First page the Bible opens to is the "Home" page
  const [isTocOpen, setIsTocOpen] = useState<boolean>(true);
  const [tocTargetAfterCurl, setTocTargetAfterCurl] = useState<boolean | null>(null);
  const tocTargetAfterCurlRef = useRef<boolean | null>(null);
  const lastVisitedPageRef = useRef<{ section: StorySection; story: ContentItem }>({
    section: 'NARRATIVE',
    story: MASTER_CONTENT[0],
  });
  const [tocSubView, setTocSubView] = useState<'HUB' | 'DAILY' | 'BOOKMARKS' | 'LEXICON' | 'SEARCH'>('HUB');
  const [showPwaPrompt, setShowPwaPrompt] = useState<boolean>(false);
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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

  const [isFullscreenActive, setIsFullscreenActive] = useState<boolean>(false);
  const [isSimulatedFullscreen, setIsSimulatedFullscreen] = useState<boolean>(false);

  React.useEffect(() => {
    const onFsChange = () => {
      const isFS = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreenActive(isFS);
      if (!isFS) setIsSimulatedFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const isAnyFullscreen = isFullscreenActive || isSimulatedFullscreen;

  const handleFullscreenAndPwa = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const docEl = document.documentElement as any;
    const isNativeFS = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    // 1. If already in native or simulated fullscreen, exit cleanly
    if (isNativeFS || isSimulatedFullscreen) {
      const exitFS =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;
      if (isNativeFS && exitFS) {
        try {
          exitFS.call(document);
        } catch {}
      }
      setIsSimulatedFullscreen(false);
      setIsFullscreenActive(false);
      return;
    }

    // 2. Always enable simulated edge-to-edge fullscreen immediately for instant responsiveness,
    // and simultaneously request native browser fullscreen where supported
    setIsSimulatedFullscreen(true);

    const requestFS =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;

    if (requestFS) {
      try {
        const promise = requestFS.call(docEl);
        if (promise && typeof promise.then === 'function') {
          promise
            .then(() => {
              setIsFullscreenActive(true);
            })
            .catch(() => {
              // Keep simulated edge-to-edge fullscreen active when iframe or iOS blocks native API
              setIsSimulatedFullscreen(true);
            });
        } else {
          setIsFullscreenActive(true);
        }
      } catch {
        setIsSimulatedFullscreen(true);
      }
    }
  };

  // Build Scholarly OIA Fallback if Offline or API Unconfigured
  const buildFallbackOiaData = (
    story: ContentItem,
    targetWord: string,
    activeSent: string
  ): OiaAnalysisData => {
    const lex = getKjvDictionaryEntry(targetWord);
    const cleanTitle = story.title.replace(/^[0-9.]+\s*/, '').trim();

    return {
      observation: {
        journalistic_baseline: {
          who: "The biblical author and original covenant community.",
          what: `Action surrounding "${activeSent}"`,
          where: "Ancient Near Eastern / Greco-Roman setting.",
          when: "Redemptive historical timeline.",
          why_here: "Crucial transition in the overarching narrative."
        },
        grammar_and_structure: {
          verbs_analysis: "Primary verbs dictate the theological action.",
          key_conjunctions: "Links preceding context to the outcome.",
          pronoun_tracing: "Identifies key actors in the text."
        },
        literary_features: {
          repetition: [lex.term],
          comparisons_contrasts: "Contrasts human weakness with divine faithfulness.",
          tone: "Authoritative and pastoral."
        }
      },
      interpretation: {
        contextual_analysis: {
          immediate_context: story.body,
          book_context: `Advances the core theme of ${cleanTitle}.`,
          cultural_historical_context: "Addresses ancient societal and religious norms."
        },
        theological_analysis: {
          theology_proper: "Reveals God's sovereign covenantal nature.",
          christology: "Foreshadows or reflects the redemptive work of Christ.",
          anthropology: "Exposes human frailty and the need for grace."
        },
        principlizing_bridge: story.why
      },
      application: {
        spacepets_audit: {
          applicable_categories: ["Truth to believe", "Example to follow"],
          audit_explanation: "The text demands a response of faith and alignment with God's will."
        },
        action_plan: {
          internal_alignment: "Shift perspective to trust God's sovereignty.",
          relational_impact: "Treat others with the grace received from Christ.",
          measurable_action: story.preAnalyzed?.application || "Reflect on this truth in prayer today."
        }
      }
    };
  };

  // Inductive Bible Study (OIA) Analyzer
  const handlePhaseAnalysis = async (
    phaseId: OiaPhaseId,
    overrideWord?: string,
    overrideSentence?: string
  ) => {
    const activeSent = (overrideSentence ?? displaySentence).trim();
    const targetWord = (overrideWord ?? getPrimaryWordFromSentence(activeSent)).replace(/[^a-zA-Z']/g, '');
    const cacheKey = `${selectedStory.id}::${targetWord.toLowerCase()}::${activeSent.slice(0, 50)}`;

    setSentenceToolView(phaseId);

    if (oiaCache[cacheKey]) {
      setOiaData(oiaCache[cacheKey]);
      return;
    }

    setIsAnalyzingScope(true);

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
          targetWord,
          targetSentence: activeSent,
        }),
      });

      if (!response.ok) {
        throw new Error(`OIA analysis HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error('Invalid OIA payload');
      }

      setOiaData(json.data);
      setOiaCache(prev => ({ ...prev, [cacheKey]: json.data }));
    } catch {
      const fallback = buildFallbackOiaData(selectedStory, targetWord, activeSent);
      setOiaData(fallback);
      setOiaCache(prev => ({ ...prev, [cacheKey]: fallback }));
    } finally {
      setIsAnalyzingScope(false);
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

  const [analysisResult, setAnalysisResult] = useState<OiaAnalysisData | null>(null);
  const [activeStudyTab, setActiveStudyTab] = useState<OiaPhaseId>('OBSERVATION');
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
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Biblical Leadership' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
      { name: 'theme-color', content: '#0c0b09' }
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
    lastVisitedPageRef.current = { section: story.section, story };
    setSelectedStory(story);
    setAnalysisResult(null);
    setActiveCitations([]);
    setIsAiGrounded(false);
    setActiveStudyTab('OBSERVATION');
    setPassageText(null);
    setError(null);
    setTextError(null);
    setBoldedWordToken(null);
    setActiveSentence(null);
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

  const handleDailyPericope = (): ContentItem => {
    const pericopes = MASTER_CONTENT.filter(s => s.section === 'PERICOPES');
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const dailyIndex = dayOfYear % pericopes.length;
    const dailyStory = pericopes[dailyIndex];
    setActiveSection('PERICOPES');
    handleStoryChange(dailyStory);
    return dailyStory;
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

  // Prefetch classical biblical artwork for all Home screen tiles (Introductory + Category rows) on mount
  React.useEffect(() => {
    let isCancelled = false;

    const prefetchAllHomeTileArt = async () => {
      // 1. Fetch Introductory division tiles first
      const introEntries = Object.entries(INTRODUCTORY_TILE_SEARCH_TERMS) as [StorySection, string][];
      await Promise.all(
        introEntries.map(async ([secId, query]) => {
          const cacheKey = `INTRO-${secId}`;
          if (artCacheRef.current[cacheKey]) return;
          try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=4&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&pithumbsize=500`;
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();
            const pages = data.query?.pages;
            if (pages) {
              const pageWithThumb: any = Object.values(pages).find((p: any) => p?.thumbnail?.source);
              if (pageWithThumb?.thumbnail?.source && !isCancelled) {
                const resolved = {
                  imageUrl: pageWithThumb.thumbnail.source,
                  title: pageWithThumb.title,
                  pageUrl: 'https://bible.art/'
                };
                artCacheRef.current[cacheKey] = resolved;
                setArtCache(prev => ({ ...prev, [cacheKey]: resolved }));
              }
            }
          } catch {}
        })
      );

      // 2. Fetch artwork for every tile displayed in the Home carousels in batches
      const homeTileStories: ContentItem[] = [
        ...NARRATIVE_STORIES,
        ...OT_STORIES,
        ...NT_STORIES,
        ...THEME_STORIES,
        ...PERICOPE_STORIES.slice(0, 15)
      ];

      const batchSize = 6;
      for (let i = 0; i < homeTileStories.length; i += batchSize) {
        if (isCancelled) break;
        const batch = homeTileStories.slice(i, i + batchSize);
        await Promise.all(batch.map(story => fetchBibleArt(story, true)));
      }
    };

    prefetchAllHomeTileArt();
    return () => {
      isCancelled = true;
    };
  }, []);

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
      let activeText = overrideText !== undefined ? overrideText : passageText;
      if (!activeText) {
        activeText = await fetchPassageText(story);
      }

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
      setAnalysisResult(buildFallbackOiaData(story, 'Leadership', story.body));
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
    const stiffness = 340;
    const damping = 32;
    let lastTime = performance.now();

    const step = (now: number) => {
      const rawDt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const subSteps = 2;
      const dt = rawDt / subSteps;
      for (let i = 0; i < subSteps; i++) {
        const forceX = -stiffness * (curX - toX) - damping * velX;
        const forceY = -stiffness * (curY - toY) - damping * velY;

        velX += forceX * dt;
        velY += forceY * dt;
        curX += velX * dt;
        curY += velY * dt;
      }

      const distRemaining = Math.hypot(toX - curX, toY - curY);
      const speed = Math.hypot(velX, velY);

      if (distRemaining > 0.5 || speed > 8) {
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
        if (tocTargetAfterCurlRef.current !== null) {
          setIsTocOpen(tocTargetAfterCurlRef.current);
          tocTargetAfterCurlRef.current = null;
          setTocTargetAfterCurl(null);
        } else if (targetFlipped) {
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

  const navigateFromHomeToStory = (section: StorySection, targetStory?: ContentItem) => {
    const sectionStories = MASTER_CONTENT.filter(s => s.section === section);
    const resolvedStory = targetStory || sectionStories[0] || MASTER_CONTENT[0];

    setActiveSection(section);
    handleStoryChange(resolvedStory);
    lastVisitedPageRef.current = { section, story: resolvedStory };

    const rect = pageContainerRef.current?.getBoundingClientRect();
    const W = rect?.width || 370;
    const H = rect?.height || 740;

    tocTargetAfterCurlRef.current = false;
    setTocTargetAfterCurl(false);
    setCurlState({
      pointerX: W - 24,
      pointerY: H * 0.22,
      originY: 0,
      isDragging: false,
      isBackSwipe: false,
    });
    animateCurlTo(W - 24, H * 0.22, 0, true, false, -1.35);
  };

  const triggerRibbonTocPageTurn = () => {
    const rect = pageContainerRef.current?.getBoundingClientRect();
    const W = rect?.width || 370;
    const H = rect?.height || 740;
    setActiveSentence(null);
    setIsContextDropdownOpen(false);

    if (!isTocOpen) {
      // Save current page before curling to Home
      lastVisitedPageRef.current = { section: activeSection, story: selectedStory };
      setTocSubView('HUB');
      tocTargetAfterCurlRef.current = true;
      setTocTargetAfterCurl(true);
      setCurlState({
        pointerX: 24,
        pointerY: H * 0.22,
        originY: 0,
        isDragging: false,
        isBackSwipe: true,
      });
      animateCurlTo(24, H * 0.22, 0, true, true, 1.35);
    } else {
      // Revert back to the exact page we came from
      const prev = lastVisitedPageRef.current;
      if (prev) {
        setActiveSection(prev.section);
        setSelectedStory(prev.story);
      }
      tocTargetAfterCurlRef.current = false;
      setTocTargetAfterCurl(false);
      setCurlState({
        pointerX: W - 24,
        pointerY: H * 0.22,
        originY: 0,
        isDragging: false,
        isBackSwipe: false,
      });
      animateCurlTo(W - 24, H * 0.22, 0, true, false, -1.35);
    }
  };

  const toggleSentenceBookmark = (sentenceText: string) => {
    const clean = sentenceText.trim();
    if (!clean) return;
    setBookmarks(prev => {
      const exists = prev.some(b => b.sentence === clean && b.storyId === selectedStory.id);
      if (exists) {
        return prev.filter(b => !(b.sentence === clean && b.storyId === selectedStory.id));
      }
      return [
        {
          id: `bm-${Date.now()}`,
          sentence: clean,
          storyId: selectedStory.id,
          storyTitle: selectedStory.title,
          storyRef: selectedStory.ref,
          timestamp: new Date().toLocaleDateString(),
        },
        ...prev,
      ];
    });
  };

  // Reusable Apple Liquid Glass Bottom Navigation Dock
  const renderBottomToolbar = (interactive = true, forceVisible = false) => {
    const shouldHide = !forceVisible && isHomeScrolled && tocSubView !== 'DAILY';
    return (
      <div
        className={`absolute bottom-4 left-0 right-0 z-30 shrink-0 ui-font flex justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          shouldHide ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div
          className="flex items-center justify-around rounded-full px-2 py-1.5 border border-[#c5a059]/70 shadow-[0_10px_25px_rgba(36,19,12,0.22)] w-[95%] max-w-[340px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(253, 250, 242, 0.94) 0%, rgba(239, 229, 208, 0.88) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* 1. Home */}
          <button
            type="button"
            onClick={
              interactive
                ? () => {
                    setIsHomeScrolled(false);
                    if (!isTocOpen) {
                      setTocSubView('HUB');
                      triggerRibbonTocPageTurn();
                    } else {
                      setTocSubView('HUB');
                      homeScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
              isTocOpen && tocSubView === 'HUB'
                ? 'text-[#8b0000] font-bold bg-[#c5a059]/25'
                : 'text-[#4a3b32]/75 hover:text-[#8b0000]'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
            </svg>
            <span className="text-[9px]">Home</span>
          </button>

          {/* 2. Daily */}
          <button
            type="button"
            onClick={
              interactive
                ? () => {
                    setIsHomeScrolled(false);
                    handleDailyPericope();
                    setTocSubView('DAILY');
                    if (!isTocOpen) {
                      setIsTocOpen(true);
                    }
                  }
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
              isTocOpen && tocSubView === 'DAILY'
                ? 'text-[#8b0000] font-bold bg-[#c5a059]/25'
                : 'text-[#4a3b32]/75 hover:text-[#8b0000]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[9px]">Daily</span>
          </button>

          {/* 3. Lexicon */}
          <button
            type="button"
            onClick={
              interactive
                ? () => {
                    setIsHomeScrolled(false);
                    setIsHighlightMode(true);
                    if (!isTocOpen) {
                      setTocSubView('LEXICON');
                      setIsTocOpen(true);
                    } else {
                      setTocSubView(prev => (prev === 'LEXICON' ? 'HUB' : 'LEXICON'));
                    }
                  }
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
              isTocOpen && tocSubView === 'LEXICON'
                ? 'text-[#8b0000] font-bold bg-[#c5a059]/25'
                : 'text-[#4a3b32]/75 hover:text-[#8b0000]'
            }`}
          >
            {renderDoveIcon()}
            <span className="text-[9px]">Lexicon</span>
          </button>

          {/* 4. Library */}
          <button
            type="button"
            onClick={
              interactive
                ? () => {
                    setIsHomeScrolled(false);
                    if (!isTocOpen) {
                      setTocSubView('BOOKMARKS');
                      setIsTocOpen(true);
                    } else {
                      setTocSubView(prev => (prev === 'BOOKMARKS' ? 'HUB' : 'BOOKMARKS'));
                    }
                  }
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors relative cursor-pointer ${
              isTocOpen && tocSubView === 'BOOKMARKS'
                ? 'text-[#8b0000] font-bold bg-[#c5a059]/25'
                : 'text-[#4a3b32]/75 hover:text-[#8b0000]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-[9px]">Library</span>
          </button>

          {/* 5. Search */}
          <button
            type="button"
            onClick={
              interactive
                ? () => {
                    setIsHomeScrolled(false);
                    if (!isTocOpen) {
                      setTocSubView('SEARCH');
                      setIsTocOpen(true);
                    } else {
                      setTocSubView(prev => (prev === 'SEARCH' ? 'HUB' : 'SEARCH'));
                    }
                    setTimeout(() => {
                      const input = document.querySelector<HTMLInputElement>('#home-search-input');
                      if (input) input.focus();
                    }, 60);
                  }
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
              isTocOpen && tocSubView === 'SEARCH'
                ? 'text-[#8b0000] font-bold bg-[#c5a059]/25'
                : 'text-[#4a3b32]/75 hover:text-[#8b0000]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-[9px]">Search</span>
          </button>
        </div>
      </div>
    );
  };

  // Replaced Table of Contents with Apple TV-Style "Home" Horizontal Tile Carousel Screen
  const renderTocContent = (interactive = true) => {
    const q = searchQuery.trim().toLowerCase();
    const matchedStories = q
      ? MASTER_CONTENT.filter(
          s =>
            s.title.toLowerCase().includes(q) ||
            s.ref.toLowerCase().includes(q) ||
            s.body.toLowerCase().includes(q) ||
            s.why.toLowerCase().includes(q) ||
            s.section.toLowerCase().includes(q)
        ).slice(0, 20)
      : MASTER_CONTENT.slice(0, 8);

    const matchedLexicon = q
      ? Object.values(BIBLICAL_LEXICON)
          .filter(
            e =>
              e.term.toLowerCase().includes(q) ||
              e.shortDef.toLowerCase().includes(q) ||
              e.category.toLowerCase().includes(q) ||
              `#${e.rank}` === q
          )
          .sort((a, b) => (a.rank || 999) - (b.rank || 999))
          .slice(0, 20)
      : Object.values(BIBLICAL_LEXICON).slice(0, 6);

    const matchedBookmarks = q
      ? bookmarks.filter(
          b =>
            b.sentence.toLowerCase().includes(q) ||
            b.storyTitle.toLowerCase().includes(q) ||
            b.storyRef.toLowerCase().includes(q)
        )
      : bookmarks;

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const allLexiconEntries = Object.values(BIBLICAL_LEXICON)
      .filter(entry => {
        const matchesCategory =
          aybdCategoryFilter === 'ALL' || entry.category === aybdCategoryFilter;
        const matchesLetter =
          aybdLetterFilter === 'ALL' ||
          entry.term.toUpperCase().startsWith(aybdLetterFilter);
        const matchesQuery =
          !aybdSearchInput.trim() ||
          entry.term.toLowerCase().includes(aybdSearchInput.toLowerCase()) ||
          entry.shortDef.toLowerCase().includes(aybdSearchInput.toLowerCase()) ||
          entry.significance.toLowerCase().includes(aybdSearchInput.toLowerCase());
        return matchesCategory && matchesLetter && matchesQuery;
      })
      .sort((a, b) =>
        aybdLetterFilter !== 'ALL'
          ? a.term.localeCompare(b.term)
          : (a.rank || 999) - (b.rank || 999)
      );

    const activeCategoryLabel =
      aybdCategoryFilter === 'ALL'
        ? 'All (300)'
        : aybdCategoryFilter === 'Person'
        ? 'People (100)'
        : aybdCategoryFilter === 'Place'
        ? 'Places (100)'
        : 'Concepts (100)';

    const INTRODUCTORY_TILES: {
      id: StorySection;
      title: string;
      subtitle: string;
      gradient: string;
    }[] = [
      {
        id: 'NARRATIVE',
        title: 'Grand Narrative',
        subtitle: 'Creation to New Creation',
        gradient: 'linear-gradient(155deg, #d8b467 0%, #8b6520 55%, #2c1a0e 100%)',
      },
      {
        id: 'OT',
        title: 'OT',
        subtitle: 'Old Testament',
        gradient: 'linear-gradient(155deg, #4b382a 0%, #261a13 60%, #120b07 100%)',
      },
      {
        id: 'NT',
        title: 'NT',
        subtitle: 'New Testament',
        gradient: 'linear-gradient(155deg, #8b1e1e 0%, #4d0d0d 60%, #1d0505 100%)',
      },
      {
        id: 'THEMES',
        title: 'Leadership',
        subtitle: 'Core Virtues',
        gradient: 'linear-gradient(155deg, #7c5836 0%, #3d2716 60%, #180e07 100%)',
      },
      {
        id: 'PERICOPES',
        title: 'Pericopes',
        subtitle: '355 Passages',
        gradient: 'linear-gradient(155deg, #525b44 0%, #272d1f 60%, #11140d 100%)',
      },
    ];

    const CATEGORY_ROWS: {
      headline: string;
      section: StorySection;
      items: ContentItem[];
      gradients: string[];
    }[] = [
      {
        headline: 'Grand Narrative',
        section: 'NARRATIVE',
        items: NARRATIVE_STORIES,
        gradients: [
          'linear-gradient(160deg, #c5a059 0%, #5c4318 65%, #231709 100%)',
          'linear-gradient(160deg, #5a3d28 0%, #2c1d12 65%, #140c07 100%)',
          'linear-gradient(160deg, #7a2020 0%, #3d0e0e 65%, #1a0606 100%)',
          'linear-gradient(160deg, #3b4d5e 0%, #1c2730 65%, #0d1318 100%)',
        ],
      },
      {
        headline: 'Old Testament',
        section: 'OT',
        items: OT_STORIES,
        gradients: [
          'linear-gradient(160deg, #8c6239 0%, #4a3219 65%, #1e1308 100%)',
          'linear-gradient(160deg, #4f4339 0%, #29221c 65%, #120e0b 100%)',
          'linear-gradient(160deg, #6e472b 0%, #382212 65%, #170d06 100%)',
        ],
      },
      {
        headline: 'New Testament',
        section: 'NT',
        items: NT_STORIES,
        gradients: [
          'linear-gradient(160deg, #9e2a2b 0%, #541112 65%, #220606 100%)',
          'linear-gradient(160deg, #b08d57 0%, #594322 65%, #241a0b 100%)',
          'linear-gradient(160deg, #3d352e 0%, #211c18 65%, #0f0c0a 100%)',
        ],
      },
      {
        headline: 'Leadership',
        section: 'THEMES',
        items: THEME_STORIES,
        gradients: [
          'linear-gradient(160deg, #b89249 0%, #61491c 65%, #241a08 100%)',
          'linear-gradient(160deg, #423329 0%, #241b15 65%, #100b08 100%)',
          'linear-gradient(160deg, #732626 0%, #3b1111 65%, #180606 100%)',
        ],
      },
      {
        headline: 'Pericopes',
        section: 'PERICOPES',
        items: PERICOPE_STORIES.slice(0, 15),
        gradients: [
          'linear-gradient(160deg, #525b44 0%, #272d1f 65%, #11140d 100%)',
          'linear-gradient(160deg, #7c5836 0%, #3d2716 65%, #180e07 100%)',
          'linear-gradient(160deg, #4b382a 0%, #261a13 65%, #120b07 100%)',
        ],
      },
    ];

    return (
      <div className="w-full max-w-[356px] mx-auto flex flex-col h-full overflow-hidden reading-font select-none relative">
        {/* Top Header: Clean "Home" Title Only */}
        <header
          className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-[#c5a059]/40 pb-2.5 pt-1 px-2 bg-[#fffcf5]/95 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isHomeScrolled && tocSubView !== 'DAILY'
              ? '-translate-y-[120%] opacity-0 pointer-events-none'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={
              interactive
                ? () => {
                    setIsHomeScrolled(false);
                    setTocSubView('HUB');
                    homeScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                : undefined
            }
            className="text-left focus:outline-none group"
          >
            <h2 className="text-2xl font-bold tracking-[0.06em] text-[#382117] leading-tight group-hover:text-[#8b0000] transition-colors">
              Home
            </h2>
          </button>
          {tocSubView === 'DAILY' && (
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#8b0000] bg-[#c5a059]/20 px-2.5 py-0.5 rounded-full ui-font">
              Daily Pericope
            </span>
          )}
        </header>

        {/* Main Body Subviews: HUB | DAILY | LEXICON | BOOKMARKS | SEARCH */}
        {tocSubView === 'HUB' && (
          <div
            ref={homeScrollRef}
            onScroll={handleHomeScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y no-scrollbar space-y-5 px-0.5 pt-14 pb-20"
          >
            {/* 1. First Headline: "Introductory" with the 5 Canonical Tiles */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <button
                  type="button"
                  onClick={
                    interactive
                      ? () => navigateFromHomeToStory('NARRATIVE', NARRATIVE_STORIES[0])
                      : undefined
                  }
                  className="flex items-center gap-1 text-left group cursor-pointer focus:outline-none"
                >
                  <h3 className="text-[15px] font-bold tracking-tight text-[#382117] group-hover:text-[#8b0000] transition-colors ui-font">
                    Introductory
                  </h3>
                  <span className="text-[#8b0000] font-bold text-sm transition-transform group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
                <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold ui-font">
                  5 Divisions
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain no-scrollbar pb-1.5 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x">
                {INTRODUCTORY_TILES.map((tile, idx) => {
                  const isCurrent = activeSection === tile.id;
                  const firstInDivision = MASTER_CONTENT.find(s => s.section === tile.id);
                  const introThumb =
                    artCache[`INTRO-${tile.id}`]?.imageUrl ||
                    (firstInDivision ? artCache[firstInDivision.id]?.imageUrl : undefined);

                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={
                        interactive
                          ? () => navigateFromHomeToStory(tile.id, firstInDivision)
                          : undefined
                      }
                      style={{ background: tile.gradient }}
                      className={`snap-start shrink-0 w-[108px] h-[148px] rounded-[16px] p-3 flex flex-col justify-between text-left relative overflow-hidden apple-gpu-btn cursor-pointer shadow-[0_6px_16px_rgba(36,19,12,0.22)] border ${
                        isCurrent ? 'border-[#8b0000] ring-2 ring-[#c5a059]' : 'border-[#c5a059]/45'
                      }`}
                    >
                      {introThumb && (
                        <img
                          src={introThumb}
                          alt={tile.title}
                          className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
                        />
                      )}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(20,12,8,0.12) 0%, rgba(20,12,8,0.82) 100%)',
                        }}
                      />

                      <div className="relative z-10 flex items-start justify-between w-full">
                        <span className="text-2xl font-bold text-[#fdfaf2]/90 ui-font leading-none drop-shadow">
                          {idx + 1}
                        </span>
                        <span className="text-[#e3c178]/90 scale-90">
                          {renderSectionIcon(tile.id)}
                        </span>
                      </div>

                      <div className="relative z-10 mt-auto">
                        <div className="text-[12px] font-bold text-[#fdfaf2] leading-tight tracking-wide drop-shadow">
                          {tile.title}
                        </div>
                        <div className="text-[9px] text-[#e3c178]/90 ui-font mt-0.5 truncate">
                          {tile.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Subsequent Category Carousels */}
            {CATEGORY_ROWS.map((row) => (
              <section key={row.headline} className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <button
                    type="button"
                    onClick={
                      interactive
                        ? () => navigateFromHomeToStory(row.section, row.items[0])
                        : undefined
                    }
                    className="flex items-center gap-1 text-left group cursor-pointer focus:outline-none"
                  >
                    <h3 className="text-[15px] font-bold tracking-tight text-[#382117] group-hover:text-[#8b0000] transition-colors ui-font">
                      {row.headline}
                    </h3>
                    <span className="text-[#8b0000] font-bold text-sm transition-transform group-hover:translate-x-0.5">
                      ›
                    </span>
                  </button>
                  <span className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold ui-font">
                    {row.items.length} Tiles
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain no-scrollbar pb-1.5 pt-0.5 px-0.5 snap-x snap-mandatory touch-pan-x">
                  {row.items.map((item, idx) => {
                    const cleanTitle = item.title.replace(/^[0-9.]+\s*/, '').trim();
                    const bgGrad = row.gradients[idx % row.gradients.length];
                    const cachedThumb = artCache[item.id]?.imageUrl;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={
                          interactive
                            ? () => navigateFromHomeToStory(item.section, item)
                            : undefined
                        }
                        style={{ background: bgGrad }}
                        className="snap-start shrink-0 w-[108px] h-[148px] rounded-[16px] p-3 flex flex-col justify-between text-left relative overflow-hidden apple-gpu-btn cursor-pointer shadow-[0_6px_16px_rgba(36,19,12,0.2)] border border-[#c5a059]/40"
                      >
                        {cachedThumb && (
                          <img
                            src={cachedThumb}
                            alt={cleanTitle}
                            className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
                          />
                        )}
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(to bottom, rgba(20,12,8,0.15) 0%, rgba(20,12,8,0.82) 100%)',
                          }}
                        />

                        <span className="relative z-10 text-2xl font-bold text-[#fdfaf2]/90 ui-font leading-none drop-shadow">
                          {idx + 1}
                        </span>

                        <div className="relative z-10 mt-auto">
                          <div className="text-[11.5px] font-bold text-[#fdfaf2] leading-snug line-clamp-2 drop-shadow">
                            {cleanTitle}
                          </div>
                          <div className="text-[8.5px] text-[#e3c178] ui-font mt-0.5 truncate">
                            {item.ref.split('|')[0].trim()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* 1) Daily Tab View with Persistent Bottom Toolbar */}
        {tocSubView === 'DAILY' && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y no-scrollbar pt-14 pb-20 animate-fade-in">
            <div className="flex items-center justify-between px-1 mb-2 ui-font">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Appointed Reading of the Day
              </span>
              <button
                type="button"
                onClick={
                  interactive
                    ? () => {
                        const randomIdx = Math.floor(Math.random() * PERICOPE_STORIES.length);
                        handleStoryChange(PERICOPE_STORIES[randomIdx]);
                      }
                    : undefined
                }
                className="text-[10px] font-bold text-[#8b0000] hover:underline cursor-pointer"
              >
                ↻ Shuffle Pericope
              </button>
            </div>
            {renderPageContent(selectedStory, false, false)}
          </div>
        )}

        {/* 2 & 3) Lexicon Subview: Full-height scroll sheet when toolbar exits, collapsible "All" filter pill, Apple right-edge A-Z scrubber, and search bar exiting vertically underneath Home banner */}
        {tocSubView === 'LEXICON' && (
          <div className="flex-1 relative overflow-hidden animate-fade-in">
            {/* Search bar & Collapsible Category Pill that smoothly exit vertically underneath the "Home" banner */}
            <div
              className={`absolute top-11 left-0 right-5 z-20 flex flex-col gap-1.5 bg-[#fffcf5]/92 backdrop-blur-md pb-2 pt-1 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isHomeScrolled
                  ? '-translate-y-[150%] opacity-0 pointer-events-none'
                  : 'translate-y-0 opacity-100'
              }`}
            >
              {/* Search Headwords Input */}
              <div className="bg-[#fdfaf2] border border-[#c5a059]/80 rounded-xl px-2.5 py-1.5 shadow-2xs flex items-center gap-2 ui-font">
                <svg className="w-3.5 h-3.5 text-[#8b0000] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={aybdSearchInput}
                  onChange={(e) => setAybdSearchInput(e.target.value)}
                  placeholder="Filter 300 Top People, Places & Concepts..."
                  className="w-full text-xs bg-transparent focus:outline-none text-[#382117] placeholder:text-stone-400"
                />
                {aybdSearchInput && (
                  <button
                    type="button"
                    onClick={() => setAybdSearchInput('')}
                    className="text-[10px] text-stone-400 hover:text-[#8b0000] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Collapsible Single Button ("All") that expands into People, Places, and Concepts */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar ui-font">
                {!isLexiconFilterExpanded ? (
                  <button
                    type="button"
                    onClick={interactive ? () => setIsLexiconFilterExpanded(true) : undefined}
                    className="px-3 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-[#8b0000] text-[#fdfaf2] border border-[#8b0000] shadow-2xs flex items-center gap-1.5 cursor-pointer apple-gpu-btn"
                  >
                    <span>{activeCategoryLabel}</span>
                    <span className="text-[10px] opacity-85">▸</span>
                  </button>
                ) : (
                  (
                    [
                      { id: 'ALL', label: 'All (300)' },
                      { id: 'Person', label: 'People' },
                      { id: 'Place', label: 'Places' },
                      { id: 'Concept & Artifact', label: 'Concepts' },
                    ] as const
                  ).map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={
                        interactive
                          ? () => {
                              setAybdCategoryFilter(tab.id);
                              setIsLexiconFilterExpanded(false);
                            }
                          : undefined
                      }
                      className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider shrink-0 border cursor-pointer transition-all apple-gpu-btn ${
                        aybdCategoryFilter === tab.id
                          ? 'bg-[#8b0000] text-[#fdfaf2] border-[#8b0000] shadow-2xs'
                          : 'bg-[#fdfaf2] text-[#382117] border-[#c5a059]/60 hover:border-[#8b0000]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))
                )}

                {aybdLetterFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={interactive ? () => setAybdLetterFilter('ALL') : undefined}
                    className="px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-[#382117] text-[#e3c178] shrink-0 cursor-pointer"
                  >
                    Letter: {aybdLetterFilter} ✕
                  </button>
                )}
              </div>
            </div>

            {/* Apple-Style Vertical A–Z Index Scrubber along the Right Edge */}
            <div
              className="absolute right-0 top-12 bottom-4 z-30 w-4 flex flex-col items-center justify-center py-1 select-none ui-font rounded-full bg-[#fdfaf2]/70 backdrop-blur-xs border border-[#c5a059]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={
                  interactive
                    ? () => {
                        setAybdLetterFilter('ALL');
                        lexiconScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    : undefined
                }
                className={`text-[7.5px] font-extrabold leading-none py-0.5 w-full text-center cursor-pointer ${
                  aybdLetterFilter === 'ALL' ? 'text-[#8b0000] scale-110' : 'text-[#4a3b32]/70 hover:text-[#8b0000]'
                }`}
                title="Show All Ranks"
              >
                •
              </button>
              {ALPHABET.map(letter => (
                <button
                  key={letter}
                  type="button"
                  onClick={
                    interactive
                      ? () => {
                          setAybdLetterFilter(prev => (prev === letter ? 'ALL' : letter));
                          lexiconScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      : undefined
                  }
                  className={`text-[7.5px] font-bold leading-[1.15] w-full text-center cursor-pointer transition-transform ${
                    aybdLetterFilter === letter
                      ? 'text-[#8b0000] font-extrabold scale-125'
                      : 'text-[#4a3b32]/75 hover:text-[#8b0000]'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* 300 Top Biblical References Scroll Sheet — expands into full vertical space when top & bottom bars exit */}
            <div
              ref={lexiconScrollRef}
              onScroll={handleHomeScroll}
              className={`h-full overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y no-scrollbar space-y-2 pr-5 transition-[padding] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isHomeScrolled ? 'pt-2 pb-2' : 'pt-[118px] pb-20'
              }`}
            >
              {allLexiconEntries.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#fdfaf2] border border-[#c5a059]/60 text-center space-y-1 ui-font">
                  <p className="text-xs text-[#382117] font-semibold">
                    No matching entries for "{aybdSearchInput || aybdLetterFilter}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAybdSearchInput('');
                      setAybdLetterFilter('ALL');
                      setAybdCategoryFilter('ALL');
                    }}
                    className="text-[10px] font-bold text-[#8b0000] underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                allLexiconEntries.map(entry => (
                  <div
                    key={`${entry.category}-${entry.rank}-${entry.term}`}
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255, 252, 245, 0.96) 0%, rgba(247, 232, 196, 0.48) 50%, rgba(253, 250, 242, 0.96) 100%)',
                      boxShadow:
                        '0 4px 12px rgba(36, 19, 12, 0.06), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)',
                    }}
                    className="p-2.5 rounded-xl border border-[#c5a059]/75 space-y-1 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-br from-[#c5a059] to-[#8b6520] text-[#fffcf5] text-[9.5px] font-bold ui-font shrink-0 shadow-2xs">
                          #{entry.rank}
                        </span>
                        <span className="text-xs font-bold text-[#8b0000] truncate">
                          {entry.term}
                        </span>
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#382117]/10 text-[#382117] ui-font font-bold shrink-0 border border-[#c5a059]/50">
                        {entry.category === 'Concept & Artifact' ? 'Concept' : entry.category}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#2c1810] leading-relaxed relative z-10">
                      {entry.shortDef}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Saved Bookmarks Library View (Triggered by "Library" Dock Button) */}
        {tocSubView === 'BOOKMARKS' && (
          <div className="flex-1 overflow-y-auto p-1 space-y-2.5 no-scrollbar pt-14 pb-20 animate-fade-in" onScroll={handleHomeScroll}>
            <div className="flex items-center justify-between border-b border-[#c5a059]/40 pb-1.5 ui-font">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b0000]">
                Saved Scripture Library ({bookmarks.length})
              </span>
              <span className="text-[9.5px] text-stone-500">Tap any verse to open</span>
            </div>
            {bookmarks.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-stone-500 italic reading-font space-y-2">
                <p>No bookmarked sentences saved yet.</p>
                <p className="text-[10px] not-italic ui-font text-stone-400">
                  Tip: Tap any sentence while reading and press the Bookmark icon in the Liquid Glass popup.
                </p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-2.5 rounded-xl bg-[#fdfaf2] border border-[#c5a059]/60 shadow-2xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={
                        interactive
                          ? () => {
                              const target = MASTER_CONTENT.find(s => s.id === bm.storyId);
                              if (target) {
                                navigateFromHomeToStory(target.section, target);
                              }
                            }
                          : undefined
                      }
                      className="text-[10px] font-bold uppercase tracking-wider text-[#8b0000] hover:underline ui-font text-left truncate cursor-pointer"
                    >
                      {bm.storyTitle} • {bm.storyRef} →
                    </button>
                    <button
                      type="button"
                      onClick={
                        interactive
                          ? () => setBookmarks(prev => prev.filter(item => item.id !== bm.id))
                          : undefined
                      }
                      className="text-[10px] text-stone-400 hover:text-[#8b0000] px-1 ui-font cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p
                    onClick={
                      interactive
                        ? () => {
                            const target = MASTER_CONTENT.find(s => s.id === bm.storyId);
                            if (target) {
                              navigateFromHomeToStory(target.section, target);
                            }
                          }
                        : undefined
                    }
                    className="text-xs italic text-[#2c1810] leading-relaxed cursor-pointer hover:text-[#8b0000] transition-colors reading-font"
                  >
                    "{bm.sentence}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4) Global App Search View: Searches across Stories/Pericopes, 300 Lexicon Terms, and Saved Bookmarks */}
        {tocSubView === 'SEARCH' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in ui-font relative">
            <div
              className={`bg-[#fdfaf2] border-2 border-[#c5a059] rounded-xl p-2.5 shadow-xs mb-2 shrink-0 transition-all duration-300 ${
                isHomeScrolled ? 'mt-2' : 'mt-12'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8b0000] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  id="home-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories, 300 Lexicon terms & bookmarks..."
                  className="w-full text-xs bg-transparent focus:outline-none text-[#382117] placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={interactive ? () => setSearchQuery('') : undefined}
                    className="text-[10px] font-bold text-stone-400 hover:text-[#8b0000] px-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y no-scrollbar space-y-4 pr-0.5 ${
                isHomeScrolled ? 'pb-4' : 'pb-20'
              }`}
              onScroll={handleHomeScroll}
            >
              {matchedStories.length === 0 && matchedLexicon.length === 0 && matchedBookmarks.length === 0 ? (
                <p className="text-xs text-stone-500 italic text-center py-8">
                  No results across the app for "{searchQuery}".
                </p>
              ) : (
                <>
                  {/* Passages & Stories Section */}
                  {matchedStories.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-widest text-[#8b0000] px-1">
                        Scripture & Leadership Passages ({matchedStories.length})
                      </div>
                      {matchedStories.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={
                            interactive
                              ? () => {
                                  setSearchQuery('');
                                  navigateFromHomeToStory(item.section, item);
                                }
                              : undefined
                          }
                          className="w-full text-left p-2.5 rounded-xl bg-[#fdfaf2] hover:bg-[#c5a059]/20 border border-[#e6d9c3] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#382117] truncate">{item.title}</div>
                            <div className="text-[10px] text-stone-500 truncate">{item.why}</div>
                          </div>
                          <span className="text-[10px] font-bold text-[#8b0000] shrink-0">
                            {item.ref.split('|')[0].trim()} →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Top 100 Lexicon Compilation Section */}
                  {matchedLexicon.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-widest text-[#8b0000] px-1">
                        Top 100 Lexicon Terms ({matchedLexicon.length})
                      </div>
                      {matchedLexicon.map(entry => (
                        <button
                          key={`search-lex-${entry.category}-${entry.rank}`}
                          type="button"
                          onClick={
                            interactive
                              ? () => {
                                  setAybdCategoryFilter('ALL');
                                  setAybdLetterFilter('ALL');
                                  setAybdSearchInput(entry.term.split(/[\(\/]/)[0].trim());
                                  setTocSubView('LEXICON');
                                }
                              : undefined
                          }
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(255, 252, 245, 0.96) 0%, rgba(247, 232, 196, 0.48) 50%, rgba(253, 250, 242, 0.96) 100%)',
                          }}
                          className="w-full text-left p-2.5 rounded-xl border border-[#c5a059]/75 flex flex-col gap-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1.5 py-0.5 rounded bg-[#c5a059] text-[#fffcf5] text-[9px] font-bold shrink-0">
                                #{entry.rank}
                              </span>
                              <span className="text-xs font-bold text-[#8b0000] truncate">{entry.term}</span>
                            </div>
                            <span className="text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#382117]/10 text-[#382117] font-bold shrink-0">
                              {entry.category === 'Concept & Artifact' ? 'Concept' : entry.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#2c1810] line-clamp-2 reading-font">
                            {entry.shortDef}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Saved Bookmarks Section */}
                  {matchedBookmarks.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[9.5px] font-bold uppercase tracking-widest text-[#8b0000] px-1">
                        Saved Library Bookmarks ({matchedBookmarks.length})
                      </div>
                      {matchedBookmarks.map(bm => (
                        <button
                          key={`search-bm-${bm.id}`}
                          type="button"
                          onClick={
                            interactive
                              ? () => {
                                  const target = MASTER_CONTENT.find(s => s.id === bm.storyId);
                                  if (target) {
                                    navigateFromHomeToStory(target.section, target);
                                  }
                                }
                              : undefined
                          }
                          className="w-full text-left p-2.5 rounded-xl bg-[#fdfaf2] border border-[#c5a059]/60 flex flex-col gap-1 cursor-pointer"
                        >
                          <span className="text-[10px] font-bold text-[#8b0000]">
                            {bm.storyTitle} • {bm.storyRef} →
                          </span>
                          <p className="text-xs italic text-[#2c1810] line-clamp-2 reading-font">
                            "{bm.sentence}"
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Floating Liquid Glass Pill Dock */}
        {renderBottomToolbar(interactive, tocSubView === 'DAILY')}
      </div>
    );
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
    const showAnalysis = isActive ? analysisResult : null;
    const showPassage = isActive ? passageText : null;
    const showLoading = isActive ? isLoading : false;
    const showFetchingText = isActive ? isFetchingText : false;
    const showTextError = isActive ? textError : null;
    const showAppError = isActive ? error : null;
    const interactive = !isBacksideCopy && !isTargetPage;

    const storyIdx = filteredStories.findIndex(s => s.id === story.id);
    const displayIndex = storyIdx !== -1 ? storyIdx + 1 : currentIndex + 1;

    const renderInteractiveText = (rawText: string) => {
      if (!rawText) return rawText;

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
                      handlePhaseAnalysis('OBSERVATION', trimmedWord, sentence);
                    }}
                    style={{
                      background:
                        'linear-gradient(120deg, rgba(255,255,255,0.65) 0%, rgba(227,193,120,0.38) 48%, rgba(139,0,0,0.12) 100%)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)',
                    }}
                    className="font-bold text-[#8b0000] border-b border-[#c5a059] cursor-pointer px-1 py-0.2 rounded-sm transition-all hover:brightness-105"
                    title={`Top 100 ${entry.category} (#${entry.rank}): ${entry.term} — ${entry.shortDef}`}
                  >
                    {token}
                  </span>
                );
              }

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
                      handlePhaseAnalysis('OBSERVATION', trimmedWord, sentence);
                    } else {
                      setSentenceToolView('NONE');
                    }
                  }}
                  className={`cursor-pointer transition-colors px-0.5 rounded ${
                    isBolded
                      ? 'font-bold bg-[#c5a059]/25 text-[#382117] underline decoration-[#c5a059]'
                      : 'hover:bg-stone-300/30'
                  }`}
                  title={`Tap to focus in Liquid Glass (tap again or select any of the OIA buttons)`}
                >
                  {token}
                </span>
              );
            })}
          </span>
        );
      });
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
        <section
          key={`section-${story.id}-${isBacksideCopy}-${isTargetPage}`}
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

              <div className="flex bg-[#fdfaf2] border border-[#c5a059]/60 rounded-md p-0.5 shadow-sm text-[10px] font-bold uppercase tracking-wider ui-font overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('OBSERVATION')}
                  className={`flex-1 py-1.5 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'OBSERVATION'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  Observation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('INTERPRETATION')}
                  className={`flex-1 py-1.5 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'INTERPRETATION'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  Interpretation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStudyTab('APPLICATION')}
                  className={`flex-1 py-1.5 px-2 rounded transition-all whitespace-nowrap ${
                    activeStudyTab === 'APPLICATION'
                      ? 'bg-[#8b0000] text-white shadow-xs'
                      : 'text-[#4a3b32] hover:bg-stone-200/50'
                  }`}
                >
                  Application
                </button>
              </div>

              {activeStudyTab === 'OBSERVATION' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-3 border-b border-[#c5a059]/30 pb-1">Journalistic Baseline</h3>
                    <div className="space-y-2 text-[11.5px] text-stone-800 leading-relaxed">
                      <p><strong className="text-[#382117]">Who:</strong> {showAnalysis.observation.journalistic_baseline.who}</p>
                      <p><strong className="text-[#382117]">What:</strong> {showAnalysis.observation.journalistic_baseline.what}</p>
                      <p><strong className="text-[#382117]">Where:</strong> {showAnalysis.observation.journalistic_baseline.where}</p>
                      <p><strong className="text-[#382117]">When:</strong> {showAnalysis.observation.journalistic_baseline.when}</p>
                      <p><strong className="text-[#382117]">Why Here:</strong> {showAnalysis.observation.journalistic_baseline.why_here}</p>
                    </div>
                  </div>

                  <div className="bg-[#fdfaf2] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-3 border-b border-[#c5a059]/30 pb-1">Grammar & Structure</h3>
                    <div className="space-y-2 text-[11.5px] text-stone-800 leading-relaxed">
                      <p><strong className="text-[#382117]">Verbs:</strong> {showAnalysis.observation.grammar_and_structure.verbs_analysis}</p>
                      <p><strong className="text-[#382117]">Conjunctions:</strong> {showAnalysis.observation.grammar_and_structure.key_conjunctions}</p>
                      <p><strong className="text-[#382117]">Pronouns:</strong> {showAnalysis.observation.grammar_and_structure.pronoun_tracing}</p>
                    </div>
                  </div>

                  <div className="bg-[#fffcf5] p-4 rounded border border-stone-200 shadow-sm">
                    <h3 className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-3 border-b border-stone-200 pb-1">Literary Features</h3>
                    <div className="space-y-2 text-[11.5px] text-stone-800 leading-relaxed">
                      <p><strong className="text-[#382117]">Repetition:</strong> {showAnalysis.observation.literary_features.repetition.join(', ')}</p>
                      <p><strong className="text-[#382117]">Comparisons:</strong> {showAnalysis.observation.literary_features.comparisons_contrasts}</p>
                      <p><strong className="text-[#382117]">Tone:</strong> {showAnalysis.observation.literary_features.tone}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeStudyTab === 'INTERPRETATION' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-3 border-b border-[#c5a059]/30 pb-1">Contextual Analysis</h3>
                    <div className="space-y-2 text-[11.5px] text-stone-800 leading-relaxed">
                      <p><strong className="text-[#382117]">Immediate Context:</strong> {showAnalysis.interpretation.contextual_analysis.immediate_context}</p>
                      <p><strong className="text-[#382117]">Book Context:</strong> {showAnalysis.interpretation.contextual_analysis.book_context}</p>
                      <p><strong className="text-[#382117]">Cultural/Historical:</strong> {showAnalysis.interpretation.contextual_analysis.cultural_historical_context}</p>
                    </div>
                  </div>

                  <div className="bg-[#fdfaf2] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-3 border-b border-[#c5a059]/30 pb-1">Theological Analysis</h3>
                    <div className="space-y-2 text-[11.5px] text-stone-800 leading-relaxed">
                      <p><strong className="text-[#382117]">Theology Proper:</strong> {showAnalysis.interpretation.theological_analysis.theology_proper}</p>
                      <p><strong className="text-[#382117]">Christology:</strong> {showAnalysis.interpretation.theological_analysis.christology}</p>
                      <p><strong className="text-[#382117]">Anthropology:</strong> {showAnalysis.interpretation.theological_analysis.anthropology}</p>
                    </div>
                  </div>

                  <div className="bg-stone-100/70 p-4 rounded border border-stone-200 shadow-sm text-center">
                    <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1.5">The Principlizing Bridge</h3>
                    <p className="text-xs text-[#382117] italic leading-relaxed font-medium">"{showAnalysis.interpretation.principlizing_bridge}"</p>
                  </div>
                </div>
              )}

              {activeStudyTab === 'APPLICATION' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#8b0000] uppercase tracking-widest mb-3 border-b border-[#c5a059]/30 pb-1">The Personal Audit (SPACEPETS)</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {showAnalysis.application.spacepets_audit.applicable_categories.map((cat, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-[#8b0000]/10 text-[#8b0000] text-[9.5px] font-bold uppercase tracking-wider ui-font border border-[#8b0000]/20">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11.5px] text-stone-800 leading-relaxed">
                      {showAnalysis.application.spacepets_audit.audit_explanation}
                    </p>
                  </div>

                  <div className="bg-[#fdfaf2] p-4 rounded border border-[#c5a059]/40 shadow-sm">
                    <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-3 border-b border-[#c5a059]/30 pb-1">Action Plan</h3>
                    <div className="space-y-2 text-[11.5px] text-stone-800 leading-relaxed">
                      <p><strong className="text-[#382117]">Internal Alignment:</strong> {showAnalysis.application.action_plan.internal_alignment}</p>
                      <p><strong className="text-[#382117]">Relational Impact:</strong> {showAnalysis.application.action_plan.relational_impact}</p>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-white/50 border border-[#c5a059]/30">
                      <strong className="text-[#8b0000] uppercase text-[9px] tracking-widest block ui-font mb-1">Measurable 48-Hour Action</strong>
                      <p className="text-xs font-medium text-[#382117]">{showAnalysis.application.action_plan.measurable_action}</p>
                    </div>
                  </div>
                </div>
              )}

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
      className={`fixed inset-0 h-[100dvh] w-full reading-font selection:bg-[#c5a059]/30 flex justify-center items-center overflow-hidden bg-[#0c0b09] cursor-pointer overscroll-none ${
        isAnyFullscreen ? 'p-0' : 'p-0 sm:p-6'
      }`}
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

        /* 60fps Hardware-Accelerated Apple Fluid Animations */
        .apple-gpu-btn {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, opacity;
          transition:
            transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 200ms cubic-bezier(0.22, 1, 0.36, 1),
            background-color 220ms ease-out,
            border-color 220ms ease-out,
            color 220ms ease-out;
        }
        .apple-gpu-btn:active {
          transform: translate3d(0, 0, 0) scale(0.965);
          opacity: 0.72;
          transition:
            transform 85ms cubic-bezier(0.32, 0.72, 0, 1),
            opacity 85ms ease-out;
        }

        @keyframes apple-fade-slide-up {
          0% {
            opacity: 0;
            transform: translate3d(0, 6px, 0) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        .animate-fade-in {
          animation: apple-fade-slide-up 340ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform, opacity;
        }
        
        @keyframes popover-spring {
          0% {
            opacity: 0;
            transform: translate3d(0, -6px, 0) scale(0.84);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        .animate-popover-spring {
          animation: popover-spring 380ms cubic-bezier(0.22, 1.25, 0.36, 1) forwards;
          will-change: transform, opacity;
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
          transition: transform 920ms cubic-bezier(0.32, 0.72, 0, 1);
          transform-style: preserve-3d;
          will-change: transform;
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
      
      <div
        className={`book-cover-container book-interactive-area mx-auto relative z-20 cursor-default transition-all duration-300 ${
          isAnyFullscreen
            ? 'w-[100dvw] h-[100dvh] max-w-none max-h-none rounded-none my-0'
            : 'w-full h-[100dvh] sm:h-auto sm:max-w-[410px] sm:aspect-[9/19.5] sm:max-h-[95dvh] my-auto'
        }`}
      >
        
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

        {isCoverOpen && !isAnyFullscreen && (
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

        <main
          className={`absolute inset-0 w-full h-full bg-[#fffcf5] shadow-[15px_15px_30px_rgba(0,0,0,0.8)] border-l-[10px] sm:border-l-[14px] border-[#3a2a22] flex flex-col overflow-hidden box-border ${
            isAnyFullscreen ? 'rounded-none' : 'rounded-none sm:rounded-[4px_12px_12px_4px]'
          }`}
        >
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none sm:rounded-tr-[12px]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none sm:rounded-r-[12px] shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-t from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none sm:rounded-br-[12px]"></div>

          {/* Floating Exit Fullscreen Pill when Fullscreen is Active */}
          {isAnyFullscreen && (
            <button
              type="button"
              onClick={(e) => handleFullscreenAndPwa(e)}
              title="Exit Fullscreen Mode"
              className="absolute top-2.5 left-4 z-50 px-2.5 py-1 rounded-full bg-[#382117]/90 text-[#e3c178] border border-[#c5a059] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-md apple-gpu-btn ui-font"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4" />
              </svg>
              <span>Exit Fullscreen</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerRibbonTocPageTurn();
            }}
            title={isTocOpen ? "Return to Scripture Page" : "Turn to Home Hub"}
            aria-label="Toggle Home Hub Page"
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

          {showPwaPrompt && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowPwaPrompt(false);
              }}
              className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[320px] bg-[#fdfaf2] border-2 border-[#c5a059] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-5 text-center animate-popover-spring ui-font"
              >
                <img
                  src="/apple-touch-icon.png"
                  alt="Holybook App Icon"
                  className="w-16 h-16 mx-auto rounded-2xl shadow-md border border-[#c5a059] mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#382117]">
                  Install Fullscreen Web App
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  To experience <strong>Holybook</strong> in true edge-to-edge Fullscreen Mode as a Progressive Web App:
                </p>
                <div className="mt-3 p-3 rounded-xl bg-[#fffcf5] border border-[#e6d9c3] text-left text-xs text-[#382117] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#8b0000] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Tap the browser <strong>Share</strong> button <span className="inline-block px-1 py-0.5 bg-stone-200 rounded text-[10px]">↑</span> in Safari or Chrome.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#8b0000] text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Select <strong>"Add to Home Screen"</strong> <span className="inline-block px-1 py-0.5 bg-stone-200 rounded text-[10px]">＋</span>.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#8b0000] text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Launch <strong>Holybook</strong> from your Home Screen for distraction-free fullscreen study.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPwaPrompt(false)}
                  className="mt-4 w-full py-2.5 rounded-lg bg-[#8b0000] text-[#fdfaf2] text-xs font-bold uppercase tracking-widest apple-gpu-btn"
                >
                  Got It
                </button>
              </div>
            </div>
          )}

          <div
            ref={pageContainerRef}
            className="w-full h-full relative flex-1 min-h-0 grid-stack overflow-hidden"
          >
            
            <div
              style={{
                paddingTop: 'calc(max(0.5rem, var(--safe-top)) + 1.25rem)',
                paddingBottom: 'calc(max(0.5rem, var(--safe-bottom)) + 1.25rem)',
              }}
              className="grid-layer bg-[#fffcf5] px-6 sm:px-8 flex flex-col gap-4 relative overflow-hidden select-none z-0 pointer-events-none"
            >
               <div className="absolute inset-2 sm:inset-3 border border-[#e6d9c3] pointer-events-none z-20" />
               {tocTargetAfterCurl === true
                 ? renderPageContent(selectedStory, false, true)
                 : tocTargetAfterCurl === false
                 ? renderPageContent(selectedStory, false, true)
                 : isTocOpen
                 ? renderTocContent(false)
                 : renderPageContent(curlState?.isBackSwipe ? selectedStory : nextStory, false, true)}
               <span className="absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 ui-font pointer-events-none">
                 {isTocOpen ? 'HOME' : curlState?.isBackSwipe 
                   ? (currentIndex + 1) 
                   : (currentIndex + 2 > filteredStories.length ? 1 : currentIndex + 2)}
               </span>
            </div>

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
                {tocTargetAfterCurl === true
                  ? renderTocContent(false)
                  : tocTargetAfterCurl === false
                  ? renderTocContent(false)
                  : isTocOpen
                  ? renderTocContent(true)
                  : renderPageContent(curlState?.isBackSwipe ? prevStory : selectedStory, false, false)}
                {!isTocOpen && tocTargetAfterCurl !== true && (
                  <span className="absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 ui-font pointer-events-none">
                    {curlState?.isBackSwipe
                      ? ((currentIndex - 1 + filteredStories.length) % filteredStories.length) + 1 
                      : (currentIndex + 1)}
                  </span>
                )}

                {curlGeo.isCurling && (
                  <div
                    className="absolute pointer-events-none z-[45]"
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
                    {tocTargetAfterCurl !== null
                      ? renderTocContent(false)
                      : renderPageContent(curlState?.isBackSwipe ? prevStory : selectedStory, true, false)}
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

            {!isTocOpen && (
              <>
                <div
                  style={{ top: activeSection === 'PERICOPES' ? '265px' : '225px' }}
                  className="absolute bottom-0 left-0 w-10 cursor-grab active:cursor-grabbing z-30 bg-transparent touch-none"
                  onPointerDown={(e) => handlePointerDown(e, true)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Drag or tap from left edge to turn back"
                />

                <div
                  style={{ top: activeSection === 'PERICOPES' ? '265px' : '225px' }}
                  className="absolute bottom-0 right-0 w-10 cursor-grab active:cursor-grabbing z-30 bg-transparent touch-none"
                  onPointerDown={(e) => handlePointerDown(e, false)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Drag or tap from right edge to turn forward"
                />
              </>
            )}

            {/* High-Transparency Liquid Glass Sentence Focus Popup */}
            <div
              className={`absolute inset-0 z-40 flex items-center justify-center px-4 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
              {/* Outer Wrapper: Hardware-accelerated 60fps Apple spring morph from tapped word coordinates */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[330px]"
                style={{
                  transformOrigin: `${popupOrigin.x} ${popupOrigin.y}`,
                  transform: activeSentence
                    ? 'translate3d(0, 0, 0) scale(1)'
                    : 'translate3d(0, 6px, 0) scale(0.45)',
                  opacity: activeSentence ? 1 : 0,
                  transition: activeSentence
                    ? 'transform 420ms cubic-bezier(0.22, 1.26, 0.36, 1), opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1), opacity 160ms ease-out',
                }}
              >
                {/* Inner Interactive Liquid Glass Lens: Pure GPU transform on drag, spring on release */}
                <div
                  onPointerDown={handleGlassPointerDown}
                  onPointerMove={handleGlassPointerMove}
                  onPointerUp={handleGlassPointerUp}
                  onPointerCancel={handleGlassPointerUp}
                  className="relative w-full overflow-hidden p-4 text-[#24130c] cursor-grab active:cursor-grabbing touch-none select-none rounded-[26px]"
                  style={{
                    transform: `translate3d(${glassDrag.dx.toFixed(2)}px, ${glassDrag.dy.toFixed(2)}px, 0) rotateX(${glassDrag.rotateX.toFixed(2)}deg) rotateY(${glassDrag.rotateY.toFixed(2)}deg) scale3d(${glassDrag.scaleX.toFixed(4)}, ${glassDrag.scaleY.toFixed(4)}, 1) skew(${glassDrag.skewX.toFixed(2)}deg, ${glassDrag.skewY.toFixed(2)}deg)`,
                    transition: glassDrag.isPressed
                      ? 'none'
                      : 'transform 560ms cubic-bezier(0.22, 1.32, 0.36, 1)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.09) 60%, rgba(255, 255, 255, 0.16) 100%)',
                    backdropFilter: 'blur(12px) saturate(175%) brightness(105%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(175%) brightness(105%)',
                    border: '1px solid rgba(255, 255, 255, 0.68)',
                    boxShadow: `
                      0 16px 40px rgba(36, 19, 12, 0.18),
                      0 4px 12px rgba(36, 19, 12, 0.08),
                      inset 0 1.5px 2px rgba(255, 255, 255, 0.9),
                      inset 0 -1px 2px rgba(197, 160, 89, 0.22),
                      inset 0 12px 24px rgba(255, 255, 255, 0.2)
                    `,
                  }}
                >
                  {/* Dynamic Refractive Light Overlay that follows finger/cursor pull */}
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-200"
                    style={{
                      opacity: glassDrag.isPressed ? 0.85 : 0.65,
                      background: `radial-gradient(circle at ${glassDrag.glareX.toFixed(1)}% ${glassDrag.glareY.toFixed(1)}%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.22) 38%, transparent 68%)`,
                    }}
                  />

                  <div className="relative z-10 flex flex-col">
                    <div className="flex items-center justify-between gap-2 border-b border-[#4a3b32]/15 pb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-[#8b0000] ui-font truncate"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.2) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.7)',
                          }}
                        >
                          {selectedStory.ref}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSentenceBookmark(displaySentence)}
                          className="h-6 px-2 rounded-full flex items-center gap-1 text-[10px] font-bold text-[#8b0000] apple-gpu-btn ui-font cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.25) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.75)',
                          }}
                          title="Save sentence to Home Library"
                        >
                          <span>
                            {bookmarks.some(
                              b => b.sentence === displaySentence.trim() && b.storyId === selectedStory.id
                            )
                              ? '★ Saved'
                              : '☆ Save'}
                          </span>
                        </button>
                        <button
                          onClick={() => setActiveSentence(null)}
                          className="h-6 w-6 rounded-full flex items-center justify-center text-xs text-[#382117] apple-gpu-btn ui-font shrink-0 cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.2) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.7)',
                          }}
                          aria-label="Close sentence focus"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-[15px] leading-relaxed font-semibold text-[#1f100a] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] reading-font italic">
                      "{displaySentence.trim()}"
                    </p>

                    <div
                      className={`grid transition-[grid-template-rows,opacity,margin-top] duration-380 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[grid-template-rows,opacity] ${
                        sentenceToolView !== 'NONE'
                          ? 'grid-rows-[1fr] opacity-100 mt-3'
                          : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div
                          className="rounded-2xl p-3 text-xs text-[#1f100a] max-h-64 overflow-y-auto no-scrollbar reading-font transition-all duration-300"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.14) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.75)',
                          }}
                        >
                          {(sentenceToolView === 'OBSERVATION' ||
                            sentenceToolView === 'INTERPRETATION' ||
                            sentenceToolView === 'APPLICATION') && (
                            <div className="animate-fade-in space-y-2">
                              <div className="flex items-center justify-between gap-2 border-b border-[#4a3b32]/15 pb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b0000] ui-font">
                                  {sentenceToolView === 'OBSERVATION' && '1 • Observation (Forensic)'}
                                  {sentenceToolView === 'INTERPRETATION' && '2 • Interpretation (Exegetical)'}
                                  {sentenceToolView === 'APPLICATION' && '3 • Application (Transformational)'}
                                </span>
                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#8b0000]/10 text-[#8b0000] ui-font shrink-0">
                                  ✦ OIA Analysis
                                </span>
                              </div>

                              {isAnalyzingScope ? (
                                <div className="py-4 flex flex-col items-center justify-center gap-2 text-center">
                                  <span className="w-4 h-4 rounded-full border-2 border-[#8b0000]/30 border-t-[#8b0000] animate-spin" />
                                  <p className="text-[11px] italic text-stone-700 animate-pulse">
                                    Running OIA Inductive Bible Study...
                                  </p>
                                </div>
                              ) : oiaData ? (
                                <div className="space-y-2.5 text-[11px] leading-relaxed text-[#1f100a]">
                                  {sentenceToolView === 'OBSERVATION' && (
                                    <>
                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font">Journalistic Baseline</strong>
                                      <span className="text-[10.5px]"><strong>Who:</strong> {oiaData.observation.journalistic_baseline.who}<br/>
                                      <strong>What:</strong> {oiaData.observation.journalistic_baseline.what}<br/>
                                      <strong>Where:</strong> {oiaData.observation.journalistic_baseline.where}<br/>
                                      <strong>When:</strong> {oiaData.observation.journalistic_baseline.when}</span></p>
                                      
                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font mt-2">Grammar & Structure</strong>
                                      <span className="text-[10.5px]"><strong>Verbs:</strong> {oiaData.observation.grammar_and_structure.verbs_analysis}<br/>
                                      <strong>Transitions:</strong> {oiaData.observation.grammar_and_structure.key_conjunctions}</span></p>
                                      
                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font mt-2">Literary Features</strong>
                                      <span className="text-[10.5px]"><strong>Tone:</strong> {oiaData.observation.literary_features.tone}<br/>
                                      <strong>Repetition:</strong> {oiaData.observation.literary_features.repetition.join(', ')}</span></p>
                                    </>
                                  )}

                                  {sentenceToolView === 'INTERPRETATION' && (
                                    <>
                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font">Contextual Analysis</strong>
                                      <span className="text-[10.5px]"><strong>Immediate:</strong> {oiaData.interpretation.contextual_analysis.immediate_context}<br/>
                                      <strong>Historical:</strong> {oiaData.interpretation.contextual_analysis.cultural_historical_context}</span></p>
                                      
                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font mt-2">Theological Analysis</strong>
                                      <span className="text-[10.5px]"><strong>Theology Proper:</strong> {oiaData.interpretation.theological_analysis.theology_proper}<br/>
                                      <strong>Christology:</strong> {oiaData.interpretation.theological_analysis.christology}<br/>
                                      <strong>Anthropology:</strong> {oiaData.interpretation.theological_analysis.anthropology}</span></p>
                                      
                                      <div className="p-2 mt-2 rounded-lg bg-white/40 border border-white/50 text-center">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#382117] block ui-font mb-0.5">The Principlizing Bridge</span>
                                        <p className="text-[11px] italic font-medium">"{oiaData.interpretation.principlizing_bridge}"</p>
                                      </div>
                                    </>
                                  )}

                                  {sentenceToolView === 'APPLICATION' && (
                                    <>
                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font">The Personal Audit (SPACEPETS)</strong>
                                      <span className="flex flex-wrap gap-1 mb-1">{oiaData.application.spacepets_audit.applicable_categories.map((c, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-[#8b0000]/10 text-[#8b0000] rounded text-[8.5px] font-bold uppercase ui-font border border-[#8b0000]/20">{c}</span>
                                      ))}</span>
                                      <span className="text-[10.5px]">{oiaData.application.spacepets_audit.audit_explanation}</span></p>

                                      <p><strong className="text-[#8b0000] uppercase text-[9.5px] tracking-wider block ui-font mt-2">Internal & Relational Impact</strong>
                                      <span className="text-[10.5px]"><strong>Internal:</strong> {oiaData.application.action_plan.internal_alignment}<br/>
                                      <strong>Relational:</strong> {oiaData.application.action_plan.relational_impact}</span></p>

                                      <div className="p-2.5 mt-2 rounded-lg bg-white/50 border border-white/60">
                                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8b0000] block ui-font mb-0.5">Measurable 48-Hour Action</span>
                                        <p className="text-[11px] font-medium text-[#382117]">{oiaData.application.action_plan.measurable_action}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Single Centered Liquid Glass Pill: 3 OIA Phase Buttons */}
                    <div className="mt-3.5 flex items-center justify-center ui-font select-none">
                      <div
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 relative z-10"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.72) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.95)',
                          boxShadow: `
                            0 10px 24px rgba(36, 19, 12, 0.16),
                            0 3px 8px rgba(36, 19, 12, 0.08),
                            inset 0 1px 2px rgba(255, 255, 255, 1),
                            inset 0 -1px 1.5px rgba(197, 160, 89, 0.15)
                          `,
                        }}
                      >
                        {/* 1. Observation (Magnifying Glass) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sentenceToolView === 'OBSERVATION') {
                              setSentenceToolView('NONE');
                              return;
                            }
                            handlePhaseAnalysis('OBSERVATION');
                          }}
                          title="Phase 1: Observation"
                          aria-label="Phase 1: Observation"
                          className={`h-9 w-12 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                            sentenceToolView === 'OBSERVATION'
                              ? 'bg-[#8b0000]/15 text-[#8b0000] shadow-inner font-bold'
                              : 'text-[#24130c] hover:bg-black/5'
                          }`}
                        >
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </button>

                        {/* 2. Interpretation (Book/Lightbulb) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sentenceToolView === 'INTERPRETATION') {
                              setSentenceToolView('NONE');
                              return;
                            }
                            handlePhaseAnalysis('INTERPRETATION');
                          }}
                          title="Phase 2: Interpretation"
                          aria-label="Phase 2: Interpretation"
                          className={`h-9 w-12 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                            sentenceToolView === 'INTERPRETATION'
                              ? 'bg-[#8b0000]/15 text-[#8b0000] shadow-inner'
                              : 'text-[#24130c] hover:bg-black/5'
                          }`}
                        >
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </button>

                        {/* 3. Application (Action/Hand) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sentenceToolView === 'APPLICATION') {
                              setSentenceToolView('NONE');
                              return;
                            }
                            handlePhaseAnalysis('APPLICATION');
                          }}
                          title="Phase 3: Application"
                          aria-label="Phase 3: Application"
                          className={`h-9 w-12 rounded-full transition-all active:scale-90 active:opacity-60 flex items-center justify-center ${
                            sentenceToolView === 'APPLICATION'
                              ? 'bg-[#8b0000]/15 text-[#8b0000] shadow-inner'
                              : 'text-[#24130c] hover:bg-black/5'
                          }`}
                        >
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                          </svg>
                        </button>
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