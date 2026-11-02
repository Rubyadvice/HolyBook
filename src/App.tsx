import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// The 46 Essential Biblical Stories for Church Leaders
const ESSENTIAL_STORIES = [
  // PART I - OLD TESTAMENT
  {
    id: "OT-01",
    title: "1. Creation and the Fall",
    ref: "Genesis 1-3",
    body: "God creates the world, humanity, and the Garden of Eden. Adam and Eve disobey God, introducing sin, alienation, shame, and death into human existence.",
    why: "Establishes human dignity, humanity's responsibility to creation, the nature of sin, free will, temptation, and the need for redemption. Every Christian understanding of humanity begins here."
  },
  {
    id: "OT-02",
    title: "2. Cain and Abel",
    ref: "Genesis 4:1-16",
    body: "Cain becomes jealous of his brother Abel and murders him. God confronts Cain, asking, 'Where is your brother?'",
    why: "Explores jealousy, anger, resentment, violence, accountability, and responsibility for others. It is an important story about the destructive consequences of unchecked sin."
  },
  {
    id: "OT-03",
    title: "3. Noah and the Flood",
    ref: "Genesis 6-9",
    body: "Human corruption becomes widespread. God judges the world through a flood, preserves Noah and his family, and establishes a covenant symbolized by the rainbow.",
    why: "Introduces divine judgment, human corruption, obedience, preservation, covenant, and God's commitment to creation."
  },
  {
    id: "OT-04",
    title: "4. The Tower of Babel",
    ref: "Genesis 11:1-9",
    body: "Humanity unites to build a tower reaching heaven, seeking to make a name for itself. God confuses their language and disperses them.",
    why: "A cautionary story about pride, ambition, self-glorification, and collective power detached from humility before God."
  },
  {
    id: "OT-05",
    title: "5. Abraham and the Covenant",
    ref: "Genesis 12, 15, 17, 22",
    body: "God calls Abraham to leave his homeland and promises to make him the father of a great nation. Abraham trusts God's promise despite uncertainty. The story culminates in the binding of Isaac.",
    why: "Foundational to understanding faith, obedience, covenant, sacrifice, and the biblical theme of blessing all nations. Abraham becomes a central model of faith in Romans 4 and Hebrews 11."
  },
  {
    id: "OT-06",
    title: "6. Jacob, Esau, and Wrestling with God",
    ref: "Genesis 25-33",
    body: "Jacob deceives his brother and father to obtain the blessing. Later, he wrestles with a mysterious figure and receives the name Israel.",
    why: "Explores deception, family conflict, reconciliation, transformation, perseverance, and the possibility that flawed people can become instruments of God's purposes."
  },
  {
    id: "OT-07",
    title: "7. Joseph: Betrayal, Suffering, Forgiveness",
    ref: "Genesis 37-50",
    body: "Joseph is betrayed by his brothers, sold into slavery, falsely accused, and imprisoned. Eventually he becomes a powerful Egyptian administrator and saves his family from famine.",
    why: "One of Scripture's richest stories about forgiveness, providence, integrity, suffering, reconciliation, and using authority to preserve rather than punish."
  },
  {
    id: "OT-08",
    title: "8. Moses and the Exodus",
    ref: "Exodus 1-14",
    body: "Israel suffers under Egyptian slavery. God calls Moses to confront Pharaoh, sends the plagues, institutes the Passover, and delivers Israel through the Red Sea.",
    why: "Arguably the most important Old Testament salvation narrative. It establishes liberation, divine intervention, deliverance, the Passover, and God's identity as the redeemer of his people."
  },
  {
    id: "OT-09",
    title: "9. Mount Sinai and the Ten Commandments",
    ref: "Exodus 19-24",
    body: "God establishes his covenant with Israel and gives Moses the commandments and instructions for communal and religious life.",
    why: "Essential for understanding morality, covenant, worship, holiness, justice, and the relationship between divine grace and obedience."
  },
  {
    id: "OT-10",
    title: "10. The Golden Calf",
    ref: "Exodus 32-34",
    body: "While Moses is on Mount Sinai, the Israelites construct an idol and worship it. Moses intercedes for the people, and God renews the covenant.",
    why: "A critical story about idolatry, impatience, institutional corruption, spiritual leadership, intercession, and divine mercy."
  },
  {
    id: "OT-11",
    title: "11. The Wilderness and the Twelve Spies",
    ref: "Numbers 11-14, 20-21",
    body: "Israel repeatedly complains, doubts God's promises, and struggles to trust Moses. Ten spies discourage the people from entering the Promised Land, while Joshua and Caleb remain confident.",
    why: "Explores spiritual maturity, collective fear, perseverance, obedience, leadership under criticism, and the consequences of persistent unbelief."
  },
  {
    id: "OT-12",
    title: "12. David and Goliath",
    ref: "1 Samuel 17",
    body: "The young David defeats the Philistine giant Goliath when Israel's army is paralyzed by fear.",
    why: "Explores courage, faith, humility, reliance on God rather than outward appearances, and the difference between genuine confidence and arrogance."
  },
  {
    id: "OT-13",
    title: "13. David, Bathsheba, and Nathan",
    ref: "2 Samuel 11-12",
    body: "David abuses his royal authority, commits adultery with Bathsheba, and arranges the death of her husband Uriah. The prophet Nathan confronts him.",
    why: "Absolutely essential for church leadership. It addresses sexual misconduct, abuse of authority, moral compromise, accountability, repentance, and the devastating consequences of a leader's private sin."
  },
  {
    id: "OT-14",
    title: "14. Elijah and the Prophets of Baal",
    ref: "1 Kings 17-19",
    body: "Elijah confronts King Ahab and Queen Jezebel, challenges the prophets of Baal on Mount Carmel, and later flees into the wilderness in exhaustion and despair.",
    why: "A remarkable story about confronting corruption, religious compromise, courage, prophetic authority, loneliness, and spiritual exhaustion."
  },
  {
    id: "OT-15",
    title: "15. Solomon: Wisdom and Spiritual Decline",
    ref: "1 Kings 3-11",
    body: "Solomon asks God for wisdom, becomes renowned for his judgment, builds the Temple, and eventually turns toward idolatry.",
    why: "A warning that intelligence, talent, wealth, success, and even a remarkable spiritual beginning do not guarantee faithfulness."
  },
  {
    id: "OT-16",
    title: "16. Ruth and Naomi",
    ref: "Book of Ruth",
    body: "After losing their husbands, Ruth remains loyal to her mother-in-law Naomi. Ruth's faithfulness and kindness eventually lead to her marriage to Boaz.",
    why: "A beautiful story about loyalty, compassion, hospitality, dignity, grief, and the inclusion of an outsider in God's unfolding purposes."
  },
  {
    id: "OT-17",
    title: "17. Daniel in Babylon",
    ref: "Daniel 1-6",
    body: "Daniel and his companions maintain their faith while living under foreign rulers. Daniel survives the lions' den because he refuses to abandon his devotion to God.",
    why: "Essential for understanding faithfulness in a secular or hostile environment, integrity in public office, courage, prayer, and the limits of political authority."
  },
  {
    id: "OT-18",
    title: "18. Esther and Preservation of the Jews",
    ref: "Book of Esther",
    body: "Esther becomes queen of Persia and risks her life to prevent the destruction of her people, encouraged by her cousin Mordecai.",
    why: "A story about moral courage, responsible influence, providence, advocacy, and the responsibility to act when vulnerable people are threatened."
  },
  {
    id: "OT-19",
    title: "19. Nehemiah Rebuilds Jerusalem",
    ref: "Book of Nehemiah",
    body: "Nehemiah hears about Jerusalem's destruction, prays, secures royal permission, organizes the rebuilding of the walls, and addresses injustice within the community.",
    why: "One of the best biblical examples of practical organizational leadership: vision, planning, delegation, prayer, resilience, managing opposition, and institutional reform."
  },
  {
    id: "OT-20",
    title: "20. Jonah and Nineveh",
    ref: "Book of Jonah",
    body: "Jonah resists God's command to preach to Nineveh, flees, is swallowed by a great fish, and eventually delivers a warning. Nineveh repents, and Jonah becomes angry at God's mercy.",
    why: "A profound challenge to religious exclusivity, prejudice, resentment, and the desire to see others punished. It teaches that God's compassion extends beyond boundaries."
  },
  {
    id: "OT-21",
    title: "Extra: Additional Old Testament Passages",
    ref: "Psalms, Proverbs, Ecclesiastes, Prophets",
    body: "Not every essential Old Testament teaching is presented as a narrative. A church leader should also know the central messages of Psalms, Proverbs, Isaiah, Jeremiah, Ezekiel, Amos, Micah, and Malachi.",
    why: "These passages provide essential contributions on trust, repentance, God's care, wisdom, mortality, prophetic calling, the new covenant, justice, and anticipating the Messiah."
  },

  // PART II - NEW TESTAMENT
  {
    id: "NT-01",
    title: "1. The Birth and Incarnation of Jesus",
    ref: "Matthew 1-2; Luke 1-2; John 1:1-18",
    body: "Jesus is born in Bethlehem. His birth is announced through angels, witnessed by shepherds, and threatened by Herod. John's Gospel introduces Jesus as the Word made flesh.",
    why: "The foundation of Christian belief in the Incarnation: God entering human history. It also introduces humility, divine promise, salvation, and the significance of Jesus' identity."
  },
  {
    id: "NT-02",
    title: "2. The Baptism and Temptation of Jesus",
    ref: "Matthew 3-4; Mark 1; Luke 3-4",
    body: "Jesus is baptized by John, the Spirit descends upon him, and he is declared God's beloved Son. He is subsequently tempted by Satan in the wilderness.",
    why: "Establishes Jesus' identity and mission. The temptations reveal the dangers of pursuing power, spectacle, and self-interest instead of faithful obedience."
  },
  {
    id: "NT-03",
    title: "3. The Sermon on the Mount",
    ref: "Matthew 5-7",
    body: "Jesus teaches the Beatitudes, enemy love, forgiveness, prayer, generosity, humility, and the importance of inner righteousness.",
    why: "Arguably the most important extended teaching for Christian ethics and leadership. It establishes the character expected of citizens of God's Kingdom."
  },
  {
    id: "NT-04",
    title: "4. Jesus Calls the Disciples",
    ref: "Matthew 4; Mark 1-3; Luke 5-6",
    body: "Jesus calls ordinary fishermen, a tax collector, and others to follow him. He forms the Twelve and teaches them to become fishers of people.",
    why: "The foundation of discipleship and Christian ministry. Leadership is rooted in following Jesus before attempting to lead others."
  },
  {
    id: "NT-05",
    title: "5. Jesus Heals the Sick and Marginalized",
    ref: "Mark 1-5; Luke 7; John 9",
    body: "Jesus heals lepers, the blind, the paralyzed, and those suffering from various conditions. He restores people who have been excluded or neglected.",
    why: "Demonstrates compassion, dignity, mercy, and the restoration of people who have been marginalized. The Church's ministry must extend beyond teaching to caring for people."
  },
  {
    id: "NT-06",
    title: "6. The Good Samaritan",
    ref: "Luke 10:25-37",
    body: "A man is attacked by robbers. Religious figures pass him by, but a Samaritan stops to care for him.",
    why: "Love of neighbour transcends religious, ethnic, and social boundaries. Genuine faith must produce compassion and action."
  },
  {
    id: "NT-07",
    title: "7. The Prodigal Son",
    ref: "Luke 15:11-32",
    body: "A son demands his inheritance, wastes it, and returns home in shame. His father welcomes him with extraordinary compassion, while his older brother resents the celebration.",
    why: "Grace, repentance, forgiveness, restoration, and the danger of self-righteousness. Particularly important for pastoral ministry."
  },
  {
    id: "NT-08",
    title: "8. The Parable of the Sower",
    ref: "Matthew 13:1-23; Mark 4",
    body: "A farmer scatters seed on different types of ground. The seed grows differently depending on the soil.",
    why: "People respond differently to God's word. A teacher must understand spiritual receptivity, perseverance, distraction, and the conditions required for spiritual growth."
  },
  {
    id: "NT-09",
    title: "9. The Pharisee and the Tax Collector",
    ref: "Luke 18:9-14",
    body: "A Pharisee boasts about his religious righteousness, while a tax collector humbly asks God for mercy.",
    why: "Humility, repentance, and the danger of religious arrogance. A leader's spiritual authority must never become an excuse for superiority."
  },
  {
    id: "NT-10",
    title: "10. The Sheep and the Goats",
    ref: "Matthew 25:31-46",
    body: "Jesus describes the final judgment, distinguishing those who cared for the hungry, thirsty, sick, imprisoned, and vulnerable from those who neglected them.",
    why: "The seriousness of practical compassion and care for the vulnerable. Christian leadership cannot separate spiritual devotion from responsibility toward others."
  },
  {
    id: "NT-11",
    title: "11. Other Parables Worth Knowing",
    ref: "Various",
    body: "The Unforgiving Servant, The Rich Fool, The Talents, The Wise and Foolish Builders, The Lost Sheep, and The Workers in the Vineyard.",
    why: "These stories repeatedly expose the human heart, challenge religious assumptions, and explain the Kingdom of God regarding mercy, wealth, stewardship, and grace."
  },
  {
    id: "NT-12",
    title: "12. The Transfiguration",
    ref: "Matthew 17:1-9; Mark 9:2-13; Luke 9:28-36",
    body: "Jesus is revealed in glory before Peter, James, and John. Moses and Elijah appear, and a voice from heaven identifies Jesus as God's beloved Son.",
    why: "Reveals Jesus' divine significance, connects him with the Law and the Prophets, and anticipates his glory and suffering."
  },
  {
    id: "NT-13",
    title: "13. The Triumphal Entry into Jerusalem",
    ref: "Matthew 21:1-11; Mark 11; Luke 19; John 12",
    body: "Jesus enters Jerusalem on a donkey and is welcomed by crowds waving palm branches.",
    why: "Contrasts the expectations of a political or military messiah with Jesus' humble kingship. It introduces the events leading to the Passion."
  },
  {
    id: "NT-14",
    title: "14. Last Supper and Washing Feet",
    ref: "Matthew 26; Luke 22; John 13",
    body: "Jesus shares a final meal with his disciples, institutes the Eucharist or Lord's Supper, and washes their feet.",
    why: "Central to Christian worship and the theology of the Eucharist. Jesus also offers perhaps the clearest model of spiritual leadership: authority expressed through humble service."
  },
  {
    id: "NT-15",
    title: "15. Gethsemane and the Betrayal",
    ref: "Matthew 26; Mark 14; Luke 22",
    body: "Jesus prays in anguish before his arrest. Judas betrays him, Peter denies him, and his disciples abandon him.",
    why: "Explores suffering, obedience, betrayal, human weakness, fear, and the cost of faithfulness. It reminds leaders that proximity to Jesus does not automatically guarantee courage."
  },
  {
    id: "NT-16",
    title: "16. The Crucifixion",
    ref: "Matthew 27; Mark 15; Luke 23; John 19",
    body: "Jesus is condemned, mocked, tortured, and crucified. He dies on the cross.",
    why: "The central event of Christian theology. Every church leader should understand the major Christian interpretations of the cross: atonement, sacrifice, reconciliation, redemption, victory over evil, and divine love."
  },
  {
    id: "NT-17",
    title: "17. The Resurrection",
    ref: "Matthew 28; Mark 16; Luke 24; John 20",
    body: "Jesus rises from the dead. The tomb is found empty, and the risen Christ appears to his followers.",
    why: "The indispensable foundation of Christian hope. Without the Resurrection, the Christian proclamation loses its central claim."
  },
  {
    id: "NT-18",
    title: "18. Great Commission and Ascension",
    ref: "Matthew 28; Luke 24; Acts 1",
    body: "Jesus commissions his disciples to make disciples of all nations, promises the Holy Spirit, and ascends into heaven.",
    why: "Establishes the missionary purpose of the Church and the responsibility to teach, baptize, disciple, and bear witness to Christ."
  },
  {
    id: "NT-19",
    title: "19. Pentecost",
    ref: "Acts 2",
    body: "The Holy Spirit descends upon the apostles. They begin preaching publicly, and thousands respond to Peter's message.",
    why: "The birth of the Church's public mission. Essential for understanding the Holy Spirit, preaching, spiritual gifts, evangelism, community, and the Church's worldwide calling."
  },
  {
    id: "NT-20",
    title: "20. Stephen and the First Martyrdom",
    ref: "Acts 6-7",
    body: "Stephen is falsely accused, delivers a powerful account of Israel's history, and is stoned to death. Saul witnesses his death.",
    why: "Courage, persecution, forgiveness, biblical interpretation, and faithfulness under pressure. Stephen's death also becomes a turning point in the spread of the Christian movement."
  },
  {
    id: "NT-21",
    title: "21. The Conversion of Saul (Paul)",
    ref: "Acts 9; 22; 26",
    body: "Saul, who persecutes Christians, encounters the risen Jesus on the road to Damascus. His life changes, and he becomes one of Christianity's most influential missionaries.",
    why: "Transformation, grace, vocation, repentance, and the possibility of redemption even for those who have opposed the faith."
  },
  {
    id: "NT-22",
    title: "22. Peter and Cornelius",
    ref: "Acts 10-11",
    body: "Peter receives a vision that challenges his understanding of purity and encounters Cornelius, a Gentile. The Holy Spirit is given to Gentiles as well as Jews.",
    why: "A turning point in Christianity's understanding of inclusion, cultural boundaries, and the worldwide mission of the Gospel."
  },
  {
    id: "NT-23",
    title: "23. The Council of Jerusalem",
    ref: "Acts 15",
    body: "The early Church debates whether Gentile converts must observe the Jewish law, particularly circumcision. The apostles and elders gather to resolve the disagreement.",
    why: "One of the most important early examples of church governance, theological disagreement, discernment, unity, and determining what is essential to Christian faith."
  },
  {
    id: "NT-24",
    title: "24. Paul and Silas in Prison",
    ref: "Acts 16:16-40",
    body: "Paul and Silas are beaten and imprisoned in Philippi. They pray and sing hymns, an earthquake opens the prison, and the jailer and his household are baptized.",
    why: "Resilience, worship during adversity, evangelism, suffering, and the unexpected ways ministry can transform the lives of others."
  },
  {
    id: "NT-25",
    title: "25. Paul's Shipwreck",
    ref: "Acts 27-28",
    body: "Paul survives a violent storm and shipwreck while travelling to Rome as a prisoner. Even during the crisis, he encourages and helps those aboard.",
    why: "Leadership under pressure, courage, calm judgment, responsibility for others, and faithfulness when circumstances are beyond one's control."
  },
  {
    id: "NT-26",
    title: "Extra: Additional NT Passages",
    ref: "Epistles and Revelation",
    body: "Instructional material across Romans, Corinthians, Galatians, Ephesians, Philippians, Timothy, Titus, James, Peter, and Revelation.",
    why: "These provide the framework for early Christian community characteristics, fruit of the Spirit, spiritual gifts, unity, and the qualifications and responsibilities of church leaders."
  }
];

// Faithful 1600x900 reconstruction of "Antique Gold Crosses and Foliage Pattern.png"
// Separate SVG for base vs. illuminated shimmer mask so clicking exclusively makes the vectors themselves glow gold with zero red tint
const buildPatternSvg = (color: string, glowFilter = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  ${glowFilter ? `<defs>
    <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>` : ''}
  <defs>
    <!-- Classic slender Latin cross with subtle flared terminals matching the uploaded image -->
    <g id="cross" fill="${color}" ${glowFilter ? 'filter="url(#goldGlow)"' : ''}>
      <path d="M -2.2,-38 L 2.2,-38 L 1.7,58 L -1.7,58 Z" />
      <path d="M -26,-14.2 L 26,-14.2 L 26,-10.2 L -26,-10.2 Z" />
      <polygon points="-3.2,-38 3.2,-38 2,-33 -2,-33" />
      <polygon points="-3,58 3,58 1.8,52 -1.8,52" />
      <polygon points="-26,-15.2 -26,-9.2 -21,-10.4 -21,-14" />
      <polygon points="26,-15.2 26,-9.2 21,-10.4 21,-14" />
    </g>

    <!-- Detailed multi-twig botanical olive/laurel branch curving upward-left (stem at bottom-left, tip at top-right) -->
    <g id="sprigR" fill="${color}" stroke="${color}" ${glowFilter ? 'filter="url(#goldGlow)"' : ''}>
      <!-- Main sweeping arched stem -->
      <path d="M -75,42 C -32,42 12,18 62,-44" fill="none" stroke-width="2.1" stroke-linecap="round" />
      <!-- Secondary side twigs -->
      <path d="M -42,36 C -30,22 -24,6 -20,-8" fill="none" stroke-width="1.4" stroke-linecap="round" />
      <path d="M -14,24 C 6,28 24,22 38,12" fill="none" stroke-width="1.4" stroke-linecap="round" />
      <path d="M 12,4 C 14,-12 20,-26 26,-38" fill="none" stroke-width="1.3" stroke-linecap="round" />
      <path d="M 28,-10 C 44,-8 56,-14 68,-22" fill="none" stroke-width="1.3" stroke-linecap="round" />

      <!-- Almond-shaped botanical leaves along lower stem -->
      <path d="M -52,39 C -60,27 -54,15 -45,25 C -42,30 -46,37 -52,39 Z" stroke="none" />
      <path d="M -36,36 C -26,44 -14,41 -22,31 C -27,26 -33,31 -36,36 Z" stroke="none" />

      <!-- Leaves on first upper sub-twig -->
      <path d="M -31,22 C -41,14 -37,1 -28,10 C -25,14 -27,20 -31,22 Z" stroke="none" />
      <path d="M -25,11 C -15,13 -9,4 -18,0 C -23,-2 -25,6 -25,11 Z" stroke="none" />
      <path d="M -20,-6 C -24,-18 -15,-22 -14,-10 C -13,-5 -17,-4 -20,-6 Z" stroke="none" />

      <!-- Leaves along middle stem & right sub-twig -->
      <path d="M -6,19 C -14,7 -8,-6 0,5 C 3,10 -1,17 -6,19 Z" stroke="none" />
      <path d="M 6,26 C 14,35 27,31 19,21 C 14,17 8,21 6,26 Z" stroke="none" />
      <path d="M 21,23 C 30,29 41,23 32,15 C 27,12 23,18 21,23 Z" stroke="none" />
      <path d="M 36,13 C 47,16 53,7 42,4 C 37,3 35,9 36,13 Z" stroke="none" />

      <!-- Leaves on upper sub-twig -->
      <path d="M 16,-10 C 7,-20 12,-33 20,-22 C 23,-17 19,-11 16,-10 Z" stroke="none" />
      <path d="M 24,-34 C 21,-47 30,-50 31,-37 C 31,-32 27,-31 24,-34 Z" stroke="none" />

      <!-- Leaves near crown tip -->
      <path d="M 34,-14 C 28,-25 35,-36 42,-25 C 44,-20 39,-15 34,-14 Z" stroke="none" />
      <path d="M 44,-11 C 54,-4 65,-10 55,-18 C 50,-21 46,-15 44,-11 Z" stroke="none" />
      <path d="M 65,-20 C 76,-18 80,-27 69,-29 C 64,-29 63,-24 65,-20 Z" stroke="none" />
      <path d="M 49,-30 C 44,-42 52,-51 58,-39 C 60,-34 54,-30 49,-30 Z" stroke="none" />
      <path d="M 56,-37 C 66,-33 75,-40 64,-46 C 59,-48 56,-42 56,-37 Z" stroke="none" />
      <path d="M 61,-43 C 68,-55 77,-51 69,-39 C 66,-35 62,-39 61,-43 Z" stroke="none" />
    </g>

    <!-- Horizontally mirrored sprig for paired symmetrical arches -->
    <g id="sprigL">
      <use href="#sprigR" transform="scale(-1, 1)" />
    </g>
  </defs>

  <!-- ================= CROSS POSITIONS (Matched to reference layout) ================= -->
  <!-- Top Row -->
  <use href="#cross" transform="translate(530, 108)" />
  <use href="#cross" transform="translate(1100, 108)" />
  <!-- Upper-Mid Row -->
  <use href="#cross" transform="translate(202, 168)" />
  <use href="#cross" transform="translate(812, 198)" />
  <use href="#cross" transform="translate(1330, 168)" />
  <!-- Mid-Upper Row -->
  <use href="#cross" transform="translate(324, 285)" />
  <use href="#cross" transform="translate(1420, 285)" />
  <!-- Center Row -->
  <use href="#cross" transform="translate(53, 418)" />
  <use href="#cross" transform="translate(1065, 382)" />
  <!-- Lower-Mid Row -->
  <use href="#cross" transform="translate(492, 498)" />
  <use href="#cross" transform="translate(735, 552)" />
  <use href="#cross" transform="translate(1365, 532)" />
  <!-- Bottom-Upper Row -->
  <use href="#cross" transform="translate(248, 675)" />
  <use href="#cross" transform="translate(1128, 678)" />
  <use href="#cross" transform="translate(1592, 675)" />
  <!-- Bottom Row -->
  <use href="#cross" transform="translate(88, 765)" />
  <use href="#cross" transform="translate(522, 775)" />
  <use href="#cross" transform="translate(902, 855)" />
  <use href="#cross" transform="translate(1410, 775)" />

  <!-- ================= FOLIAGE SPRIG POSITIONS (Matched to reference layout) ================= -->
  <!-- Top border sprigs -->
  <use href="#sprigL" transform="translate(42, 72) rotate(-18) scale(0.95)" />
  <use href="#sprigL" transform="translate(152, 34) rotate(-25) scale(0.88)" />
  <use href="#sprigR" transform="translate(375, 78) rotate(8) scale(1.02)" />
  <use href="#sprigL" transform="translate(690, 52) rotate(-12) scale(1.0)" />
  <use href="#sprigR" transform="translate(918, 42) rotate(14) scale(0.98)" />
  <use href="#sprigL" transform="translate(1265, 36) rotate(-16) scale(0.95)" />
  <use href="#sprigR" transform="translate(1485, 82) rotate(10) scale(1.0)" />

  <!-- Upper Paired Arch & Flanking Sprigs -->
  <use href="#sprigL" transform="translate(65, 248) rotate(-14) scale(0.96)" />
  <use href="#sprigL" transform="translate(495, 238) rotate(-10) scale(0.98)" />
  <use href="#sprigR" transform="translate(642, 222) rotate(14) scale(0.94)" />
  <use href="#sprigL" transform="translate(998, 185) rotate(-32) scale(0.96)" />
  <use href="#sprigR" transform="translate(1175, 238) rotate(12) scale(0.98)" />
  <use href="#sprigL" transform="translate(1585, 235) rotate(-15) scale(0.95)" />

  <!-- Central Paired Arch & Surrounding Sprigs -->
  <use href="#sprigR" transform="translate(198, 415) rotate(-38) scale(0.96)" />
  <use href="#sprigR" transform="translate(378, 428) rotate(168) scale(1.0)" />
  <use href="#sprigL" transform="translate(605, 405) rotate(-26) scale(1.02)" />
  <use href="#sprigL" transform="translate(755, 345) rotate(-8) scale(0.96)" />
  <use href="#sprigR" transform="translate(895, 328) rotate(14) scale(0.96)" />
  <use href="#sprigR" transform="translate(895, 482) rotate(172) scale(1.0)" />
  <use href="#sprigL" transform="translate(1210, 448) rotate(-38) scale(0.94)" />
  <use href="#sprigL" transform="translate(1312, 398) rotate(-18) scale(1.02)" />
  <use href="#sprigR" transform="translate(1505, 428) rotate(15) scale(0.98)" />

  <!-- Lower-Middle Row Sprigs -->
  <use href="#sprigL" transform="translate(118, 565) rotate(-162) scale(0.98)" />
  <use href="#sprigL" transform="translate(382, 595) rotate(-12) scale(0.98)" />
  <use href="#sprigR" transform="translate(578, 622) rotate(12) scale(1.0)" />
  <use href="#sprigL" transform="translate(868, 678) rotate(-158) scale(0.96)" />
  <use href="#sprigR" transform="translate(1042, 568) rotate(165) scale(1.04)" />
  <use href="#sprigL" transform="translate(1268, 632) rotate(-14) scale(0.98)" />
  <use href="#sprigR" transform="translate(1488, 592) rotate(168) scale(0.98)" />

  <!-- Bottom Row Sprigs -->
  <use href="#sprigL" transform="translate(12, 635) rotate(-15) scale(0.9)" />
  <use href="#sprigR" transform="translate(142, 875) rotate(-28) scale(0.95)" />
  <use href="#sprigR" transform="translate(332, 772) rotate(12) scale(1.0)" />
  <use href="#sprigL" transform="translate(698, 765) rotate(-155) scale(1.0)" />
  <use href="#sprigL" transform="translate(1058, 795) rotate(-20) scale(1.0)" />
  <use href="#sprigR" transform="translate(1245, 788) rotate(-22) scale(0.95)" />
  <use href="#sprigL" transform="translate(1565, 795) rotate(-18) scale(0.96)" />
  <use href="#sprigL" transform="translate(652, 892) rotate(-12) scale(0.92)" />
  <use href="#sprigR" transform="translate(1115, 895) rotate(15) scale(0.92)" />
  <use href="#sprigL" transform="translate(1345, 888) rotate(-15) scale(0.92)" />
</svg>`;

const BASE_PATTERN_URI = `data:image/svg+xml;utf8,${encodeURIComponent(buildPatternSvg('#b59453', false))}`;
const GLOW_PATTERN_URI = `data:image/svg+xml;utf8,${encodeURIComponent(buildPatternSvg('#fff0b8', true))}`;

export default function App() {
  const [selectedStory, setSelectedStory] = useState(ESSENTIAL_STORIES[0]);
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(false);
  
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');

  const filteredStories = ESSENTIAL_STORIES.filter(s =>
    testamentFilter === 'ALL' ? true : s.id.startsWith(testamentFilter)
  );
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

  const [analysisResult, setAnalysisResult] = useState<{observation: string, interpretation: string, application: string} | null>(null);
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
  } | null>(null);
  const [isFetchingArt, setIsFetchingArt] = useState<boolean>(false);

  // State for golden wave background effect
  const [waves, setWaves] = useState<{id: number, x: number, y: number}[]>([]);

  const handleStoryChange = (story: typeof ESSENTIAL_STORIES[0]) => {
    setSelectedStory(story);
    setAnalysisResult(null);
    setPassageText(null);
    setError(null);
    setTextError(null);
    setBibleArt(null);
  };

  const fetchBibleArt = async (story: typeof ESSENTIAL_STORIES[0]) => {
    setIsFetchingArt(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

      const imgPayload = {
        contents: [
          {
            parts: [
              {
                text: `Classical museum oil painting in the style of Rembrandt and Caravaggio depicting the biblical scene: ${story.title} (${story.ref}). ${story.body}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      };

      const imgRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imgPayload),
      });

      if (imgRes.ok) {
        const imgData = await imgRes.json();
        const base64Data = imgData?.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData
        )?.inlineData?.data;
        if (base64Data) {
          setBibleArt({
            imageUrl: `data:image/png;base64,${base64Data}`,
            title: story.title.replace(/^\d+\.\s*/, ''),
            artist: 'Bible.art Curated Collection',
            pageUrl: `https://bible.art`,
          });
          return;
        }
      }
      
      // Fallback gallery image if model doesn't return image data
      setBibleArt({
        imageUrl: `https://images.unsplash.com/photo-1543791187-df84c251390d?auto=format&fit=crop&w=800&q=80`,
        title: story.title.replace(/^\d+\.\s*/, ''),
        artist: 'Bible.art Gallery',
        pageUrl: 'https://bible.art'
      });
    } catch (e) {
      setBibleArt({
        imageUrl: `https://images.unsplash.com/photo-1543791187-df84c251390d?auto=format&fit=crop&w=800&q=80`,
        title: story.title.replace(/^\d+\.\s*/, ''),
        artist: 'Bible.art Gallery',
        pageUrl: 'https://bible.art'
      });
    } finally {
      setIsFetchingArt(false);
    }
  };

  const handleTestamentChange = (filter: 'ALL' | 'OT' | 'NT') => {
    setTestamentFilter(filter);
    const newFiltered = ESSENTIAL_STORIES.filter(s => filter === 'ALL' ? true : s.id.startsWith(filter));
    if (!newFiltered.find(s => s.id === selectedStory.id)) {
      handleStoryChange(newFiltered[0]);
    }
  };

  const fetchAnalysis = async (overrideStory?: typeof ESSENTIAL_STORIES[0], overrideText?: string | null) => {
    const story = overrideStory || selectedStory;
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

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

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
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const text = candidate.content.parts[0].text;
        
        // Parse sections robustly using headings
        const obsMatch = text.match(/###\s*OBSERVATION([\s\S]*?)(?=###\s*INTERPRETATION|$)/i);
        const intMatch = text.match(/###\s*INTERPRETATION([\s\S]*?)(?=###\s*APPLICATION|$)/i);
        const appMatch = text.match(/###\s*APPLICATION([\s\S]*)/i);

        setAnalysisResult({
          observation: obsMatch ? obsMatch[1].trim() : text,
          interpretation: intMatch ? intMatch[1].trim() : "Interpretation details provided in summary.",
          application: appMatch ? appMatch[1].trim() : "Application principles derived from text."
        });
      } else {
        throw new Error("The model did not return a valid response.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze passage. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPassageText = async (overrideStory?: typeof ESSENTIAL_STORIES[0]) => {
    const story = overrideStory || selectedStory;
    setIsFetchingText(true);
    setTextError(null);
    setPassageText(null);
    fetchBibleArt(story);
    
    try {
      const systemPrompt = `You are a biblical scholar and text historian. The user will provide a biblical story title and reference. Your task is to provide a faithful, accurate biblical scripture passage corresponding to the reference (e.g. King James Version or standard biblical text). Provide ONLY the passage text and reference heading. Do not include conversational filler or analysis.`;
      const userQuery = `Provide the full biblical passage text for: ${story.title} (${story.ref}).`;

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
          contents: [{ parts: [{ text: userQuery }] }],
          tools: [{ "google_search": {} }],
          systemInstruction: {
              parts: [{ text: systemPrompt }]
          },
      };

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const text = candidate.content.parts[0].text;
        setPassageText(text);
        return text;
      } else {
        throw new Error("The model did not return a valid response.");
      }
    } catch (err: any) {
      setTextError(err.message || "Failed to retrieve passage text. Please try again.");
      return null;
    } finally {
      setIsFetchingText(false);
    }
  };

  const handleDailyPericope = async () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = (hash << 5) - hash + dateString.charCodeAt(i);
      hash |= 0;
    }
    const dailyIndex = Math.abs(hash) % ESSENTIAL_STORIES.length;
    const dailyStory = ESSENTIAL_STORIES[dailyIndex];
    
    setTestamentFilter('ALL');
    handleStoryChange(dailyStory);
    
    const fetchedText = await fetchPassageText(dailyStory);
    await fetchAnalysis(dailyStory, fetchedText);
  };

  // Smoothly animate the page curl to its final state on release or tap
  const animateCurlTo = (
    fromX: number,
    fromY: number,
    originY: number,
    targetFlipped: boolean,
    isBackSwipe = false
  ) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const rect = pageContainerRef.current?.getBoundingClientRect();
    const W = rect?.width || 370;
    const H = rect?.height || 740;

    const toX = targetFlipped ? (isBackSwipe ? W * 1.05 : -W * 0.98) : (isBackSwipe ? -W * 0.1 : W);
    const toY = originY;
    const animStart = performance.now();
    const duration = 380;

    const step = (now: number) => {
      const t = Math.min(1, (now - animStart) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const curX = fromX + (toX - fromX) * ease;
      const curY = fromY + (toY - fromY) * ease;

      if (t < 1) {
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

    const initialX = isBackSwipe ? 10 : rect.width - 22;
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
      ? Math.max(-10, Math.min(rect.width * 0.95, rawX))
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
      animateCurlTo(curX, curY, originY, true, isBackSwipe);
      return;
    }

    const targetFlipped = isBackSwipe ? curX > rect.width * 0.52 || velocity > 0.35 : curX < rect.width * 0.48 || velocity < -0.35;
    dragStartRef.current = null;
    animateCurlTo(curX, curY, originY, targetFlipped, isBackSwipe);
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

    const dxRaw = isBack ? Px : Ox - Px;
    const maxDy = Math.min(H * 0.65, dxRaw * 0.85);
    let dyRaw = Oy - Py;

    if (Math.abs(dyRaw) > maxDy) {
      Py = Oy - Math.sign(dyRaw) * maxDy;
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

  const renderPageContent = (story: typeof ESSENTIAL_STORIES[0], isBacksideCopy = false, isTargetPage = false) => {
    const isActive = story.id === selectedStory.id;
    const showAnalysis = isActive ? analysisResult : null;
    const showPassage = isActive ? passageText : null;
    const showLoading = isActive ? isLoading : false;
    const showFetchingText = isActive ? isFetchingText : false;
    const showTextError = isActive ? textError : null;
    const showAppError = isActive ? error : null;

    return (
      <div className="w-full max-w-[340px] mx-auto flex flex-col gap-4 h-full">
        <aside className="w-full flex flex-col gap-3 shrink-0 relative">
          
          <div className="flex bg-[#fdfaf2] border border-[#c5a059] rounded-sm p-0.5 shadow-sm">
            {(['ALL', 'OT', 'NT'] as const).map(filter => (
              <button
                key={filter}
                onClick={!isBacksideCopy && !isTargetPage ? () => handleTestamentChange(filter) : undefined}
                className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 transition-colors ${
                  testamentFilter === filter 
                    ? 'bg-[#c5a059] text-white shadow-sm' 
                    : 'text-[#4a3b32] hover:bg-stone-200/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={!isBacksideCopy && !isTargetPage ? handleDailyPericope : undefined}
            className="w-full bg-[#fdfaf2] border border-[#c5a059] text-[#4a3b32] text-xs font-bold uppercase tracking-widest py-2.5 px-4 hover:bg-[#c5a059] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm rounded-sm"
          >
            Daily Pericope
          </button>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select an Essential Story</label>
            <select
              value={story.id}
              onChange={!isBacksideCopy && !isTargetPage ? (e) => {
                const found = filteredStories.find(s => s.id === e.target.value);
                if (found) handleStoryChange(found);
              } : undefined}
              disabled={isBacksideCopy || isTargetPage}
              className="w-full py-2 px-1 border-b border-stone-300 bg-transparent focus:outline-none focus:border-[#8b0000] font-bold text-xs text-stone-700 font-sans cursor-pointer transition-colors truncate"
            >
              {filteredStories.map((s) => (
                <option key={s.id} value={s.id}>{s.title} ({s.ref})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={!isBacksideCopy && !isTargetPage ? () => fetchAnalysis(story) : undefined}
              disabled={showLoading || showFetchingText || isBacksideCopy || isTargetPage}
              className="w-full bg-[#8b0000] text-[#fdfaf2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 hover:bg-[#660000] transition-colors disabled:opacity-50 shadow-sm rounded-sm"
            >
              {showLoading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              onClick={!isBacksideCopy && !isTargetPage ? () => fetchPassageText(story) : undefined}
              disabled={showFetchingText || showLoading || isBacksideCopy || isTargetPage}
              className="w-full bg-[#4a3b32] text-[#fdfaf2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 hover:bg-[#382117] transition-colors disabled:opacity-50 shadow-sm rounded-sm"
            >
              {showFetchingText ? "Loading..." : "Read Text"}
            </button>
          </div>
        </aside>

        <section className="w-full relative flex-1 min-h-[260px] flex flex-col overflow-y-auto pb-4">
          {!showAnalysis && !showLoading && !showPassage && !showFetchingText && !showTextError && !showAppError && (
            <div className="flex-1 flex flex-col items-center text-center p-2">
              <h3 className="text-base font-bold text-[#4a3b32] mb-1">{story.title}</h3>
              <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-4 block pb-2 border-b border-[#c5a059]/30 w-full">{story.ref}</span>
              
              <div className="text-left bg-stone-100/60 p-3 rounded border border-stone-200 shadow-sm mb-4 w-full">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">The Story</h4>
                <p className="text-sm leading-relaxed text-stone-800">{story.body}</p>
              </div>

              <div className="text-left bg-[#fffafa] p-3 rounded border border-[#8b0000]/20 shadow-sm w-full">
                <h4 className="text-[10px] font-bold text-[#8b0000] uppercase tracking-widest mb-1.5">Why it matters for Leaders</h4>
                <p className="text-sm leading-relaxed text-stone-800 italic">{story.why}</p>
              </div>
              
              <p className="text-[10px] text-stone-400 mt-6 uppercase tracking-widest">Tap "Analyze" or "Read Text" to dive deeper</p>
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

          {isActive && bibleArt && !showLoading && !showFetchingText && (
            <div className="mb-4 bg-[#fdfaf2] p-2.5 rounded border border-[#c5a059]/60 shadow-sm flex flex-col items-center text-center">
              <div className="w-full h-36 overflow-hidden rounded-sm border border-stone-200 bg-stone-900 flex items-center justify-center">
                <img
                  src={bibleArt.imageUrl}
                  alt={bibleArt.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x400/382117/e3c178?text=${encodeURIComponent(story.ref)}`;
                  }}
                />
              </div>
              <p className="text-[11px] font-bold text-[#4a3b32] mt-1.5 line-clamp-1">{bibleArt.title}</p>
              <a
                href={bibleArt.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] uppercase tracking-widest text-[#8b0000] hover:underline mt-0.5 font-sans"
              >
                {bibleArt.artist ? `${bibleArt.artist} • ` : ''}View on Bible.art ↗
              </a>
            </div>
          )}

          {showPassage && !showFetchingText && !showTextError && (
            <article className="mb-6 bg-stone-100/50 p-4 rounded border border-stone-200 shadow-inner">
              <h2 className="text-xs font-bold text-[#8b0000] mb-2 uppercase tracking-widest border-b border-[#c5a059]/40 pb-1">Original Text Extract</h2>
              <p className="text-sm leading-relaxed text-stone-800 text-justify italic">
                "{showPassage}"
              </p>
            </article>
          )}

          {(showLoading || showFetchingText) && !isBacksideCopy && !isTargetPage && (
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
                {story.title}
              </h2>
              <p className="text-center text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-4">{story.ref}</p>

              <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#8b0000]/80"></div>
                <h3 className="text-xs font-bold text-[#8b0000] mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  Observation
                </h3>
                <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 prose-strong:text-[#4a3b32]">
                  <ReactMarkdown>{showAnalysis.observation}</ReactMarkdown>
                </div>
              </article>

              <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#c5a059]"></div>
                <h3 className="text-xs font-bold text-[#c5a059] mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  Interpretation
                </h3>
                <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 prose-strong:text-[#4a3b32]">
                  <ReactMarkdown>{showAnalysis.interpretation}</ReactMarkdown>
                </div>
              </article>

              <article className="bg-[#fffafa] p-4 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-stone-700"></div>
                <h3 className="text-xs font-bold text-stone-700 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  Application
                </h3>
                <div className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-p:text-stone-800 prose-strong:text-[#4a3b32]">
                  <ReactMarkdown>{showAnalysis.application}</ReactMarkdown>
                </div>
              </article>
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
      className="h-screen w-screen font-serif selection:bg-[#c5a059]/30 p-2 sm:p-6 flex justify-center items-center overflow-hidden relative bg-[#0c0b09] cursor-pointer"
      style={{
        backgroundImage: `url("${BASE_PATTERN_URI}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '800px 450px',
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
              backgroundImage: `url("${GLOW_PATTERN_URI}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '800px 450px',
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
          transition: transform 1.4s cubic-bezier(0.25, 1, 0.5, 1);
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
      
      <div className="book-cover-container book-interactive-area w-full max-w-[400px] aspect-[9/19.5] max-h-[94vh] my-auto mx-auto relative z-20 cursor-default">
        
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
              setCurlState(null);
            }}
            title="Click cover spine to close Bible"
            className="absolute left-0 top-0 bottom-0 w-[16px] z-40 cursor-pointer bg-transparent hover:bg-[#c5a059]/25 transition-colors rounded-l-[4px]"
          />
        )}

        <main className="absolute inset-0 w-full h-full bg-[#fffcf5] shadow-[15px_15px_30px_rgba(0,0,0,0.8)] rounded-[4px_12px_12px_4px] border-l-[14px] border-[#3a2a22] flex flex-col overflow-hidden box-border">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none rounded-tr-[12px]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none rounded-r-[12px] shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-t from-[#b38b22] via-[#f7e099] to-[#b38b22] z-30 pointer-events-none rounded-br-[12px]"></div>
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/20 to-transparent z-30 pointer-events-none"></div>

          <div ref={pageContainerRef} className="m-3 border border-[#e6d9c3] relative shadow-inner flex-1 min-h-0 grid-stack overflow-hidden">
            
            {/* Previous Page (Shown underneath when swiping backward from left edge) */}
            <div className="grid-layer bg-[#fffcf5] p-6 flex flex-col gap-5 relative overflow-hidden select-none z-0">
               {renderPageContent(prevStory, false, true)}
               <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 font-sans pointer-events-none">{((currentIndex - 1 + filteredStories.length) % filteredStories.length) + 1}</span>
            </div>

            {/* Next Page (Shown underneath when swiping forward from right edge) */}
            <div className="grid-layer bg-[#fffcf5] p-6 flex flex-col gap-5 relative overflow-hidden select-none z-0">
               {renderPageContent(nextStory, false, true)}
               <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 font-sans pointer-events-none">{(currentIndex + 2 > filteredStories.length ? 1 : currentIndex + 2)}</span>
            </div>

            {/* Current Page (Front Flat Portion clipped dynamically along the crease line) */}
            <div 
              className="grid-layer bg-[#fffcf5] p-6 flex flex-col gap-5 relative overflow-hidden select-none z-10"
              style={{
                clipPath: curlGeo.frontClip,
                pointerEvents: curlGeo.isCurling ? 'none' : 'auto',
              }}
            >
              {renderPageContent(selectedStory, false, false)}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 font-sans pointer-events-none">{(currentIndex + 1)}</span>
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

          </div>
        </main>
      </div>
    </div>
  );
}