import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

// The complete list of 355 pericopes from the "Composite Gospel Pericope Index"
const PERICOPES = [
  "Pericope.001: Jesus is the Word",
  "Pericope.002: God became a human being",
  "Pericope.003: Jesus' ancestry back to Adam",
  "Pericope.004: Jesus' ancestry from Abraham",
  "Pericope.005: Luke's purpose in writing",
  "Pericope.006: The angel Gabriel promises the birth of John to Zechariah",
  "Pericope.007: The angel Gabriel promises the birth of Jesus to Mary",
  "Pericope.008: Mary visits Elizabeth",
  "Pericope.009: John the Baptist is born",
  "Pericope.010: An angel appears to Joseph",
  "Pericope.011: Jesus is born in Bethlehem",
  "Pericope.012: Shepherds visit Jesus",
  "Pericope.013: Wise men visit from eastern lands",
  "Pericope.014: Mary and Joseph bring Jesus to the temple",
  "Pericope.015: Joseph takes his family to Egypt",
  "Pericope.016: Joseph returns with his family to Nazareth",
  "Pericope.017: Jesus grows up in Nazareth",
  "Pericope.018: Jesus speaks with religious teachers in the temple",
  "Pericope.019: John the Baptist comes as a witness to the light",
  "Pericope.020: John the Baptist prepares the way for Jesus",
  "Pericope.021: John the Baptist calls for repentence",
  "Pericope.022: John the Baptist tells people how to show their repentence",
  "Pericope.023: John the Baptist tells about the Christ",
  "Pericope.024: John the Baptist declares his mission",
  "Pericope.025: John baptizes Jesus",
  "Pericope.026: John the Baptist proclaims Jesus as the Messiah",
  "Pericope.027: Satan tempts Jesus in the desert",
  "Pericope.028: The first disciples follow Jesus",
  "Pericope.029: Jesus turns water into wine",
  "Pericope.030: Jesus stays in Capernaum",
  "Pericope.031: Jesus clears the temple",
  "Pericope.032: Jesus does not trust himself to people",
  "Pericope.033: Nicodemus visits Jesus at night",
  "Pericope.034: Jesus and his disciples baptize in Judea",
  "Pericope.035: John the Baptist accepts Jesus' growing popularity",
  "Pericope.036: Jesus leaves Judea for Galilee",
  "Pericope.037: Jesus talks to a Samaritan woman at the well",
  "Pericope.038: Jesus tells about the spiritual harvest",
  "Pericope.039: Many Samaritans believe in Jesus",
  "Pericope.040: Herod puts John in prison",
  "Pericope.041: Jesus preaches in Galilee",
  "Pericope.042: Jesus heals a royal official's son",
  "Pericope.043: Jesus is rejected at Nazareth",
  "Pericope.044: Jesus calls four fishermen to follow him",
  "Pericope.045: Jesus teaches with authority",
  "Pericope.046: Jesus heals Peter's mother-in-law and many others in Capernaum",
  "Pericope.047: Jesus goes out alone to pray",
  "Pericope.048: Jesus preaches throughout Galilee",
  "Pericope.049: Jesus provides a miraculous catch of fish",
  "Pericope.050: Jesus heals a man with leprosy",
  "Pericope.051: Jesus heals a paralyzed man",
  "Pericope.052: Jesus calls a tax collector to follow him",
  "Pericope.053: The religious leaders ask Jesus about fasting",
  "Pericope.054: Jesus heals a lame man by the pool of Bethesda",
  "Pericope.055: Jesus claims to be God's Son",
  "Pericope.056: Jesus supports his claim to be God's Son",
  "Pericope.057: The disciples pick wheat on the Sabbath",
  "Pericope.058: Jesus heals a man's hand on the Sabbath",
  "Pericope.059: Large crowds follow Jesus",
  "Pericope.060: Jesus selects the twelve disciples",
  "Pericope.061: Jesus gives the Beatitudes",
  "Pericope.062: Jesus warns against temporary comfort",
  "Pericope.063: Jesus teaches about salt",
  "Pericope.064: Jesus teaches about light",
  "Pericope.065: Jesus teaches about fulfilling the law",
  "Pericope.066: Jesus teaches about anger",
  "Pericope.067: Jesus teaches about lust",
  "Pericope.068: Jesus teaches about divorce",
  "Pericope.069: Jesus teaches about oaths",
  "Pericope.070: Jesus teaches about retaliation",
  "Pericope.071: Jesus teaches about loving enemies",
  "Pericope.072: Jesus teaches about giving to the needy",
  "Pericope.073: Jesus teaches about prayer",
  "Pericope.074: Jesus teaches about fasting",
  "Pericope.075: Jesus teaches about treasure",
  "Pericope.076: Jesus teaches about having a sound eye",
  "Pericope.077: Jesus teaches about serving two masters",
  "Pericope.078: Jesus teaches about worry",
  "Pericope.079: Jesus teaches about criticizing others",
  "Pericope.080: Jesus teaches about profaning holy things",
  "Pericope.081: Jesus teaches about asking, seeking, knocking",
  "Pericope.082: Jesus sums up the Law",
  "Pericope.083: Jesus teaches about the narrow road to life",
  "Pericope.084: Jesus teaches about the fruit of people's lives",
  "Pericope.085: Jesus teaches about putting his words into practice",
  "Pericope.086: The crowds are astonished at Jesus' teaching",
  "Pericope.087: A Roman centurion shows great faith",
  "Pericope.088: Jesus raises a widow's son from the dead",
  "Pericope.089: Jesus eases John the Baptist's doubts",
  "Pericope.090: Jesus teaches about John the Baptist",
  "Pericope.091: A sinful woman anoints Jesus' feet",
  "Pericope.092: Women accompany Jesus and the disciples",
  "Pericope.093: Jesus describes his true family",
  "Pericope.094: Jesus tells the parable of the four soils",
  "Pericope.095: Jesus explains why he speaks in parables",
  "Pericope.096: Jesus explains the parable of the four soils",
  "Pericope.097: Jesus teaches people to consider carefully what they hear",
  "Pericope.098: Jesus tells the parable of the growing seed",
  "Pericope.099: Jesus tells the parable of the weeds",
  "Pericope.100: Jesus tells the parable of the mustard seed",
  "Pericope.101: Jesus tells the parable of the yeast",
  "Pericope.102: Jesus uses many parables in his teaching",
  "Pericope.103: Jesus explains the parable of the weeds",
  "Pericope.104: Jesus tells the parable of hidden treasure",
  "Pericope.105: Jesus tells the parable of the pearl merchant",
  "Pericope.106: Jesus tells the parable of the fishing net",
  "Pericope.107: Jesus teaches about new and old treasure",
  "Pericope.108: Jesus calms the storm",
  "Pericope.109: Jesus sends demons into a herd of pigs",
  "Pericope.110: The Gerasenes ask Jesus to leave",
  "Pericope.111: A synagogue ruler asks Jesus to help his daughter",
  "Pericope.112: Jesus heals a bleeding woman",
  "Pericope.113: Jesus restores the daughter of a synagogue rule to life",
  "Pericope.114: Jesus heals two blind men",
  "Pericope.115: Jesus heals a mute demoniac",
  "Pericope.116: The people of Nazareth refuse to believe in Jesus",
  "Pericope.117: Jesus tells the disciples to pray for workers",
  "Pericope.118: Jesus sends out the twelve disciples",
  "Pericope.119: Jesus prepares the disciples for persecution",
  "Pericope.120: Herod wonders if John the Baptist has been raised from the dead",
  "Pericope.121: Herod kills John the Baptist",
  "Pericope.122: Jesus feeds five thousand",
  "Pericope.123: Jesus walks on water",
  "Pericope.124: Jesus heals all who touch him",
  "Pericope.125: Jesus proclaims he is the true bread from heaven",
  "Pericope.126: The Jews disagree that Jesus is from heaven",
  "Pericope.127: Many disciples desert Jesus",
  "Pericope.128: The religious leaders criticize Jesus about ceremonial washing",
  "Pericope.129: Jesus teaches the crowd about the source of uncleanness",
  "Pericope.130: Jesus teaches the disciples about the source of uncleanness",
  "Pericope.131: Jesus sends a demon out of a girl",
  "Pericope.132: Jesus heals a deaf man",
  "Pericope.133: The crowd marvels at Jesus' healings",
  "Pericope.134: Jesus feeds four thousand",
  "Pericope.135: The religious leaders ask for a sign in the sky",
  "Pericope.136: Jesus warns against wrong teaching",
  "Pericope.137: Jesus restores sight to a blind man",
  "Pericope.138: Peter declares Jesus is the Messiah",
  "Pericope.139: Jesus predicts his death the first time",
  "Pericope.140: Jesus calls his disciples to deny themselves",
  "Pericope.141: Jesus is transfigured on the mountain",
  "Pericope.142: The disciples ask about the coming of Elijah",
  "Pericope.143: Jesus heals a demon-possessed boy",
  "Pericope.144: The disciples ask why they couldn't heal the demon-possessed boy",
  "Pericope.145: Jesus predicts his death the second time",
  "Pericope.146: Peter finds the coin in the fish's mouth",
  "Pericope.147: Jesus teaches about being the least of all",
  "Pericope.148: Jesus warns against forbidding others to work in his name",
  "Pericope.149: Jesus warns against temptations to sin",
  "Pericope.150: Jesus warns against looking down on others",
  "Pericope.151: Jesus teaches how to treat a believer who sins",
  "Pericope.152: Jesus teaches about the power of agreeing in prayer",
  "Pericope.153: Jesus teaches about forgiving others",
  "Pericope.154: Jesus tells the parable of the unforgiving debtor",
  "Pericope.155: Jesus sends out seventy-two messengers",
  "Pericope.156: Jesus warns cities that have not repented",
  "Pericope.157: Jesus teaches about people's response to his messengers",
  "Pericope.158: The seventy-two messengers return",
  "Pericope.159: Jesus praises the Father for revealing His truth",
  "Pericope.160: Jesus promises rest for the soul",
  "Pericope.161: Jesus teaches the disciples that they are blessed for what they see",
  "Pericope.162: A lawyer asks Jesus about eternal life",
  "Pericope.163: Jesus tells the parable of the Good Samaritan",
  "Pericope.164: Jesus visits Mary and Martha",
  "Pericope.165: Jesus teaches his disciples how to pray",
  "Pericope.166: Jesus tells about the friend who asks for help at midnight",
  "Pericope.167: Jesus answers accusers about how he drives out demons",
  "Pericope.168: Jesus warns against blaspheming the Holy Spirit",
  "Pericope.169: Jesus warns the religious leaders about their words and their hearts",
  "Pericope.170: Jesus warns about demons returning",
  "Pericope.171: Jesus tells a woman about obeying God's word",
  "Pericope.172: Jesus warns against unbelief",
  "Pericope.173: Jesus criticizes the religious leaders",
  "Pericope.174: Jesus teaches about acknowledging him before others",
  "Pericope.175: Jesus tells the parable of the rich fool",
  "Pericope.176: Jesus warns about coming division",
  "Pericope.177: Jesus warns about the future crisis",
  "Pericope.178: Jesus teaches about reconciliation",
  "Pericope.179: Jesus calls people to repent",
  "Pericope.180: Jesus tells the parable of the fruitless tree",
  "Pericope.181: Jesus heals a crippled woman",
  "Pericope.182: Jesus' brothers ridicule him",
  "Pericope.183: Jesus is rejected at a Samaritan village",
  "Pericope.184: Jesus teaches about the cost of following him",
  "Pericope.185: Jesus travels to Jerusalem in secret",
  "Pericope.186: Jesus teaches openly at the temple",
  "Pericope.187: The religious leaders attempt to arrest Jesus",
  "Pericope.188: Jesus teaches about living water",
  "Pericope.189: The people are divided over Jesus",
  "Pericope.190: The religious leaders refuse to believe in Jesus",
  "Pericope.191: Jesus forgives an adulterous woman",
  "Pericope.192: Jesus is the light of the world",
  "Pericope.193: Jesus warns of coming judgment",
  "Pericope.194: Jesus speaks about true freedom",
  "Pericope.195: Jesus speaks about God's true children",
  "Pericope.196: Jesus declares that he is eternal",
  "Pericope.197: Jesus heals a man who was born blind",
  "Pericope.198: The religious leaders question the blind man",
  "Pericope.199: Jesus teaches about spiritual blindness",
  "Pericope.200: Jesus is the Good Shepherd",
  "Pericope.201: The Jews are divided about Jesus",
  "Pericope.202: The Jews confront Jesus at the temple",
  "Pericope.203: Jesus goes beyond the Jordan",
  "Pericope.204: Jesus teaches about entering the kingdom",
  "Pericope.205: The Pharisees warn Jesus that Herod wants to kill Him",
  "Pericope.206: Jesus grieves over Jerusalem",
  "Pericope.207: Jesus heals a man with dropsy",
  "Pericope.208: Jesus warns against seeking honor",
  "Pericope.209: Jesus tells the parable of the great feast",
  "Pericope.210: Jesus teaches about the cost of being a disciple",
  "Pericope.211: Jesus tells the parable of the lost sheep",
  "Pericope.212: Jesus tells the parable of the lost coin",
  "Pericope.213: Jesus tells the parable of the lost son",
  "Pericope.214: Jesus tells the parable of the shrewd manager",
  "Pericope.215: Jesus teaches about being faithful",
  "Pericope.216: Jesus criticizes the Pharisees for their love of money",
  "Pericope.217: Jesus teaches about the Law and the Kingdom",
  "Pericope.218: Jesus tells about the rich man and the beggar",
  "Pericope.219: Jesus teaches about faith",
  "Pericope.220: Jesus teaches about doing your duty",
  "Pericope.221: Lazarus becomes ill and dies",
  "Pericope.222: Jesus comforts Mary and Martha",
  "Pericope.223: Jesus raises Lazarus from the dead",
  "Pericope.224: Caiaphas advises the religious leaders to kill Jesus",
  "Pericope.225: Jesus withdraws to Ephraim",
  "Pericope.226: Jesus heals ten men with leprosy",
  "Pericope.227: Jesus answers the Pharisees about the coming of the Kingdom of God",
  "Pericope.228: Jesus teaches about the coming day of the Son of Man",
  "Pericope.229: Jesus tells the parable of the persistent widow",
  "Pericope.230: Jesus tells the parable of two men who prayed",
  "Pericope.231: Jesus teaches about marriage and divorce",
  "Pericope.232: Jesus teaches the disciples about celibacy",
  "Pericope.233: Jesus teaches the disciples about marriage and divorce",
  "Pericope.234: Jesus blesses little children",
  "Pericope.235: Jesus speaks to a rich young ruler",
  "Pericope.236: Jesus teaches about riches",
  "Pericope.237: Jesus teaches about the rewards of following him",
  "Pericope.238: Jesus tells the parable of the workers paid equally",
  "Pericope.239: Jesus predicts his death the third time",
  "Pericope.240: Jesus teaches about serving others",
  "Pericope.241: Jesus heals a blind beggar",
  "Pericope.242: Jesus goes to Zacchaeus's house",
  "Pericope.243: Jesus tells the parable of the king's ten servants",
  "Pericope.244: A woman anoints Jesus with expensive perfume",
  "Pericope.245: The religious leaders plot to kill Lazarus",
  "Pericope.246: Jesus rides into Jerusalem on a donkey",
  "Pericope.247: Jesus weeps over Jerusalem",
  "Pericope.248: Jesus curses a fig tree",
  "Pericope.249: Jesus clears the temple again",
  "Pericope.250: The religious leaders conspire against Jesus",
  "Pericope.251: Jesus explains why he must die",
  "Pericope.252: Most of the people do not believe in Jesus",
  "Pericope.253: Jesus summarizes his message",
  "Pericope.254: Jesus teaches about faith and prayer",
  "Pericope.255: The religious leaders challenge Jesus' authority",
  "Pericope.256: Jesus tells the parable of the two sons",
  "Pericope.257: Jesus tells the parable of the wicked tenants",
  "Pericope.258: Jesus tells the parable of the wedding feast",
  "Pericope.259: The religious leaders question Jesus about paying taxes",
  "Pericope.260: The religious leaders question Jesus about the resurrection",
  "Pericope.261: The religious leaders question Jesus about the greatest commandment",
  "Pericope.262: Jesus questions religious leaders about the Christ",
  "Pericope.263: Jesus warns against the practices of the religious leaders",
  "Pericope.264: Jesus condemns the religious leaders",
  "Pericope.265: A poor widow gives all she has",
  "Pericope.266: Jesus predicts the destruction of the Temple",
  "Pericope.267: Jesus predicts the signs before the end",
  "Pericope.268: Jesus predicts persecutions before the end",
  "Pericope.269: Jesus tells about the desolating sacrilege",
  "Pericope.270: Jesus warns about false Christs and prophets",
  "Pericope.271: Jesus tells about his return",
  "Pericope.272: Jesus tells the parable of the fig tree",
  "Pericope.273: Jesus compares his coming to the days of Noah",
  "Pericope.274: Jesus tells about remaining watchful",
  "Pericope.275: Jesus warns against not watching for his coming",
  "Pericope.276: Jesus tells about the wise and foolish managers",
  "Pericope.277: Jesus tells the parable of the ten bridesmaids",
  "Pericope.278: Jesus tells the parable of the loaned money",
  "Pericope.279: Jesus tells about the final judgment",
  "Pericope.280: Jesus teaches daily in the temple",
  "Pericope.281: Jesus tells his disciples about his coming crucifixion",
  "Pericope.282: The religious leaders plot to kill Jesus",
  "Pericope.283: Judas agrees to betray Jesus",
  "Pericope.284: Disciples prepare for the Passover",
  "Pericope.285: Jesus washes the disciples' feet",
  "Pericope.286: Jesus teaches the disciples after washing their feet",
  "Pericope.287: Jesus declares that one of the disciples will betray him",
  "Pericope.288: Jesus and the disciples have the Last Supper",
  "Pericope.289: Jesus teaches about servanthood",
  "Pericope.290: Jesus commands the disciples to love one another",
  "Pericope.291: Jesus predicts Peter's denial",
  "Pericope.292: Jesus is the way to the Father",
  "Pericope.293: Jesus promises the Holy Spirit",
  "Pericope.294: Jesus teaches about the vine and the branches",
  "Pericope.295: Jesus warns about the world's hatred",
  "Pericope.296: Jesus teaches about the Holy Spirit",
  "Pericope.297: Jesus tells the disciples their sorrow will turn to joy",
  "Pericope.298: Jesus teaches about using his name in prayer",
  "Pericope.299: Jesus predicts that the disciples will be scattered",
  "Pericope.300: Jesus prays for himself",
  "Pericope.301: Jesus prays for his disciples",
  "Pericope.302: Jesus prays for future believers",
  "Pericope.303: Jesus tells the disciples to prepare for his arrest",
  "Pericope.304: Jesus and the disciples go to the Mount of Olives",
  "Pericope.305: Jesus again predicts Peter's denial",
  "Pericope.306: Jesus agonizes in the garden",
  "Pericope.307: Jesus is betrayed and arrested",
  "Pericope.308: Jesus identifies himself to those who have come to arrest him",
  "Pericope.309: Peter strikes the high priest's servant",
  "Pericope.310: Jesus questions why they have brought weapons to arrest him",
  "Pericope.311: The last follower runs away naked",
  "Pericope.312: Jesus is bound and taken to Annas",
  "Pericope.313: Peter denies knowing Jesus a first time",
  "Pericope.314: Annas questions Jesus",
  "Pericope.315: Caiaphas questions Jesus",
  "Pericope.316: Peter denies knowing Jesus",
  "Pericope.317: Jesus' captors mock him",
  "Pericope.318: The council of religious leaders condemns Jesus",
  "Pericope.319: Judas kills himself",
  "Pericope.320: The chief priests use Judas' money to buy a field",
  "Pericope.321: The religious leaders accuse Jesus before Pilate",
  "Pericope.322: Pilate questions Jesus",
  "Pericope.323: Pilate answers the religious leaders",
  "Pericope.324: Jesus stands trial before Herod",
  "Pericope.325: Pilate answers the religious leaders a second time",
  "Pericope.326: Jesus is flogged",
  "Pericope.327: The crowd calls for crucifixion",
  "Pericope.328: Pilate questions Jesus again",
  "Pericope.329: Pilate hands Jesus over to be crucified",
  "Pericope.330: Roman soldiers mock Jesus",
  "Pericope.331: Simon of Cyrene carries Jesus' cross",
  "Pericope.332: Jesus speaks to those who follow and mourn",
  "Pericope.333: Jesus is crucified",
  "Pericope.334: Jesus is mocked on the cross",
  "Pericope.335: A criminal asks Jesus to remember him",
  "Pericope.336: Jesus dies on the cross",
  "Pericope.337: Women watch the crucifixion from a distance",
  "Pericope.338: Jesus is laid in the tomb",
  "Pericope.339: Guards are posted at the tomb",
  "Pericope.340: Some women find the tomb empty",
  "Pericope.341: The women tell the disciples of the empty tomb",
  "Pericope.342: Peter and John go to the empty tomb",
  "Pericope.343: Jesus appears to Mary Magdalene",
  "Pericope.344: Jesus appears to the women",
  "Pericope.345: The religious leaders bribe the guards",
  "Pericope.346: Jesus appears to two believers traveling on the road",
  "Pericope.347: Jesus appears to the disciples behind locked doors",
  "Pericope.348: Jesus appears to the eleven disciples as they are eating",
  "Pericope.349: Jesus appears to the disciples including Thomas",
  "Pericope.350: John's purpose in writing",
  "Pericope.351: Jesus appears to the disciples while fishing",
  "Pericope.352: Jesus talks with Peter",
  "Pericope.353: Jesus appears to the disciples in Jerusalem",
  "Pericope.354: Jesus gives the Great Commission",
  "Pericope.355: Jesus ascends into heaven"
];

export default function App() {
  const [selectedPericope, setSelectedPericope] = useState<string>(PERICOPES[0]);
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(false);
  const [isPageFlipped, setIsPageFlipped] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{observation: string, interpretation: string, application: string} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passageText, setPassageText] = useState<string | null>(null);
  const [isFetchingText, setIsFetchingText] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  const fetchAnalysis = async (overridePericope?: string, overrideText?: string | null) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const pericope = overridePericope || selectedPericope;
      const currentText = overrideText !== undefined ? overrideText : passageText;
      
      const systemPrompt = `You are a biblical scholar and theologian. Analyze the given pericope strictly following this 3-phase framework from the "Analysis_2" document. Be thorough and detailed. 
      
Instead of outputting the literal template headings (e.g. "Phase 1: Observation" or "- Identify genre:"), write flowing, insightful paragraphs for each phase that naturally incorporate the required points.

Phase 1 (Observation): Acknowledge translations, identify genre, map structure, answer 5Ws and 1H.
Phase 2 (Interpretation): Historical-cultural context, literary context, word studies, cross-reference, theological bridge.
Phase 3 (Application): Extract the timeless theological principle, and provide personal & contemporary relevance.

You MUST return ONLY a valid JSON object matching this schema:
{
  "observation": "markdown formatted text covering Phase 1",
  "interpretation": "markdown formatted text covering Phase 2",
  "application": "markdown formatted text covering Phase 3"
}`;

      const passageContext = currentText ? `\n\nHere is the raw text of the passage for context:\n"${currentText}"` : '';
      const userQuery = `Please analyze this specific pericope: ${pericope}${passageContext}`;

      const apiKey = ""; // API key will be automatically provided by the Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: {
              parts: [{ text: systemPrompt }]
          },
          generationConfig: {
              responseMimeType: "application/json"
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
        
        // Robust JSON extraction to ignore markdown wrappers (like ```json ... ```)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanedText = jsonMatch ? jsonMatch[0] : text;
        
        const parsedData = JSON.parse(cleanedText);
        setAnalysisResult({
          observation: parsedData.observation,
          interpretation: parsedData.interpretation,
          application: parsedData.application
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

  const handleAnalyzeClick = () => {
    fetchAnalysis();
  };

  const fetchPassageText = async (overridePericope?: string) => {
    setIsFetchingText(true);
    setTextError(null);
    setPassageText(null);
    
    try {
      const pericope = overridePericope || selectedPericope;
      const systemPrompt = `You are a biblical text retriever. The user will provide a pericope title. Your task is to provide the full biblical text for it from your knowledge base. Return ONLY the passage text (preferably in NKJV or ESV). Do not include any analysis, commentary, or conversational filler—just the scripture.`;
      const userQuery = `Retrieve the full biblical passage text for this pericope: ${pericope}`;

      const apiKey = ""; // API key will be automatically provided by the Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
          contents: [{ parts: [{ text: userQuery }] }],
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
    // Use consistent date string to get the same pericope all day
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = (hash << 5) - hash + dateString.charCodeAt(i);
      hash |= 0;
    }
    const dailyIndex = Math.abs(hash) % PERICOPES.length;
    const dailyPericope = PERICOPES[dailyIndex];
    
    setSelectedPericope(dailyPericope);
    
    const fetchedText = await fetchPassageText(dailyPericope);
    await fetchAnalysis(dailyPericope, fetchedText);
  };

  return (
    <div 
      className="min-h-screen font-serif selection:bg-[#c5a059]/30 py-8 px-4 flex justify-center items-start overflow-y-auto"
      style={{ backgroundImage: "url('Screenshot%202026-11-01%20at%203.47.02%20PM.jpg')", backgroundRepeat: 'repeat' }}
    >
      <style>{`
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
          perspective: 3000px;
          position: relative;
        }
        .book-cover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: 0% 50%;
          transition: transform 1.5s cubic-bezier(0.25, 1, 0.5, 1);
          transform-style: preserve-3d;
          z-index: 50;
          cursor: pointer;
          border-radius: 4px 12px 12px 4px;
        }
        .book-cover.is-open {
          transform: rotateY(-110deg);
          pointer-events: none;
        }
        .book-cover-front, .book-cover-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 4px 12px 12px 4px;
        }
        .book-cover-front {
          background-color: #382117;
          background-size: 100% 100%;
          background-position: center;
          box-shadow: 15px 15px 30px rgba(0,0,0,0.8), inset -5px 0 15px rgba(0,0,0,0.3);
        }
        .book-cover-back {
          background-color: #2a1510;
          transform: rotateY(180deg);
          box-shadow: inset 0 0 40px rgba(0,0,0,0.9);
          border: 12px solid #1a0d0a;
        }

        .grid-stack {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          perspective: 3000px;
          transform-style: preserve-3d;
        }
        .grid-layer {
          grid-area: 1 / 1 / 2 / 2;
        }
        .page-turner {
          transform-origin: 0% 50%;
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
          transform-style: preserve-3d;
          z-index: 20;
          transform: rotateY(0deg);
        }
        .page-turner.flipped {
          transform: rotateY(-180deg);
        }
        .page-front, .page-back {
          backface-visibility: hidden;
          width: 100%;
          height: 100%;
          background-color: #fffcf5;
          transform-style: preserve-3d;
        }
        .page-back {
          transform: rotateY(180deg);
        }

        .page-edge-hover {
          background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.08));
        }
      `}</style>
      
      {/* Main Book Container Wrapper for 3D Perspective */}
      <div className="book-cover-container w-full max-w-6xl mx-auto">
        
        {/* The 3D Cover */}
        <div 
          className={`book-cover ${isCoverOpen ? 'is-open' : ''}`}
          onClick={() => setIsCoverOpen(true)}
        >
          <div className="book-cover-front relative flex flex-col items-center justify-center" style={{ backgroundImage: "url('Screenshot%202026-11-01%20at%2011.21.16%20PM.jpg')" }}>
            
            {/* Center Gold Foil Typography matching reference image */}
            <div className="text-center select-none pt-12">
              <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-[0.2em] text-[#e3c178] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-95">
                HOLY
              </h1>
              <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-[0.2em] text-[#e3c178] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-95 mt-2">
                BIBLE
              </h1>
            </div>

            {!isCoverOpen && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-r-xl">
                <span className="text-[#fdfaf2] text-xl font-bold tracking-widest border-2 border-[#c5a059] px-8 py-3 bg-[#4a3b32]/90 backdrop-blur-md uppercase shadow-2xl cursor-pointer">
                  Open Bible
                </span>
              </div>
            )}
          </div>
          <div className="book-cover-back">
            <div className="absolute inset-4 border-2 border-[#1a0d0a] opacity-30"></div>
          </div>
        </div>

        {/* Book Inner Pages */}
        <main className="w-full h-full bg-[#fffff8] shadow-[15px_15px_30px_rgba(0,0,0,0.8)] rounded-r-md relative border-l-[24px] border-[#3a2a22]">
          
          {/* Gold Foil Gilding - Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-[#b38b22] via-[#f7e099] to-[#b38b22] z-10 opacity-100 pointer-events-none rounded-tr-md"></div>
          
          {/* Gold Foil Gilding - Right Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-[#b38b22] via-[#f7e099] to-[#b38b22] z-10 opacity-100 pointer-events-none rounded-r-md shadow-[-2px_0_5px_rgba(0,0,0,0.1)]"></div>
          
          {/* Gold Foil Gilding - Bottom Edge */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#b38b22] via-[#f7e099] to-[#b38b22] z-10 opacity-100 pointer-events-none rounded-br-md"></div>
          
          {/* Book Spine inner shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none"></div>

          {/* Close Bible Button - Fades in only on hover near the top right corner */}
          <button 
            onClick={() => {
              setIsCoverOpen(false);
              setIsPageFlipped(false);
            }}
            className="absolute top-0 right-0 w-32 h-32 z-40 flex items-start justify-end p-8 group cursor-pointer"
            title="Close Bible"
          >
            <div className="text-stone-400 hover:text-[#8b0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">
              <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Close</span>
            </div>
          </button>

          {/* Inner page container using CSS Grid Stack for layering */}
          <div className="m-6 lg:m-10 border border-[#e6d9c3] relative shadow-inner min-h-[85vh] grid-stack">
            
            {/* Page 2 (Underneath - Revealed when Page 1 flips) */}
            <div className="grid-layer p-8 lg:p-12 flex flex-col items-center justify-center opacity-40 bg-[#fffcf5]">
               <svg className="w-16 h-16 mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
               <h2 className="text-2xl font-serif text-stone-400">Blank Page</h2>
            </div>

            {/* Page 1 (Flipping Page) */}
            <div className={`grid-layer page-turner ${isPageFlipped ? 'flipped' : ''}`}>
              
              {/* Front of Page 1 (Main Content) */}
              <div className="page-front p-8 lg:p-12 flex flex-col lg:flex-row gap-12 relative shadow-[-5px_0_15px_rgba(0,0,0,0.05)]">
                
                {/* Clickable Right Edge to flip to Page 2 with gradient fade */}
                <div 
                  className="absolute top-0 right-0 w-16 h-full cursor-pointer z-30 page-edge-hover opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center group rounded-r"
                  onClick={() => setIsPageFlipped(true)}
                  title="Turn Page"
                >
                  <svg className="w-8 h-8 text-stone-500 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>

                {/* Sidebar Controls */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0 relative">
                  <button 
                    onClick={handleDailyPericope}
                    className="w-full bg-[#fdfaf2] border-2 border-[#c5a059] text-[#4a3b32] font-bold uppercase tracking-widest py-3 px-6 hover:bg-[#c5a059] hover:text-white transition-colors flex items-center justify-center gap-3 shadow-sm rounded-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Pericope of the Day
                  </button>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Select a Passage</label>
                    <select 
                      value={selectedPericope} 
                      onChange={(e) => setSelectedPericope(e.target.value)}
                      className="w-full p-3 border-b-2 border-stone-300 bg-transparent focus:outline-none focus:border-[#8b0000] font-bold text-stone-700 font-sans cursor-pointer transition-colors"
                    >
                      {PERICOPES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-4 mt-4">
                    <button 
                      onClick={handleAnalyzeClick}
                      disabled={isLoading || isFetchingText}
                      className="w-full bg-[#8b0000] text-[#fdfaf2] font-bold uppercase tracking-widest py-3 px-6 hover:bg-[#660000] transition-colors disabled:opacity-50 shadow-md rounded-sm"
                    >
                      {isLoading ? "Analyzing..." : "Analyze Passage"}
                    </button>
                    <button 
                      onClick={() => fetchPassageText()}
                      disabled={isFetchingText || isLoading}
                      className="w-full bg-[#4a3b32] text-[#fdfaf2] font-bold uppercase tracking-widest py-3 px-6 hover:bg-[#382117] transition-colors disabled:opacity-50 shadow-md rounded-sm"
                    >
                      {isFetchingText ? "Retrieving..." : "Read Passage Text"}
                    </button>
                  </div>

              <div className="mt-8 hidden lg:block opacity-30 text-center">
                 <svg className="w-full h-auto mx-auto max-w-[150px] text-[#c5a059]" viewBox="0 0 100 20" fill="currentColor">
                    <path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="50" cy="10" r="3" />
                    <circle cx="25" cy="10" r="1.5" />
                    <circle cx="75" cy="10" r="1.5" />
                 </svg>
              </div>
            </aside>

          <section className="w-full lg:w-2/3 mt-8 lg:mt-0 relative min-h-[400px] flex flex-col" style={{ perspective: '1200px' }}>
            
            {/* Empty State */}
            {!analysisResult && !isLoading && !passageText && !isFetchingText && !textError && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-stone-400 opacity-60">
                <svg className="w-20 h-20 mb-6 text-[#c5a059]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <h3 className="text-2xl font-bold mb-2 text-[#4a3b32]">Select a Pericope</h3>
                <p className="max-w-md">Choose a passage from the index and click "Analyze" to uncover its historical context, meaning, and modern application.</p>
              </div>
            )}

            {/* Error State for Text Fetch */}
            {textError && !isFetchingText && (
              <div className="bg-[#fffafa] text-[#8b0000] p-6 border-2 border-[#8b0000]/30 flex flex-col items-start gap-4 mb-8 animate-page-turn">
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-1">Passage Retrieval Failed</h4>
                    <p className="text-md italic">{textError}</p>
                  </div>
                </div>
                <a 
                  href={`https://www.semanticbible.com/cgi/2004/11/${selectedPericope.split(':')[0]}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 ml-10 text-sm font-bold uppercase tracking-wider bg-[#8b0000] text-[#fdfaf2] px-4 py-2 hover:bg-[#660000] transition-colors inline-block"
                >
                  View on SemanticBible ↗
                </a>
              </div>
            )}

            {/* Passage Text Display */}
            {passageText && !isFetchingText && !textError && (
              <article className="animate-page-turn mb-12 bg-stone-100/50 p-8 rounded border border-stone-200 shadow-inner">
                <h2 className="text-xl font-bold text-[#8b0000] mb-4 uppercase tracking-widest border-b border-[#c5a059]/40 pb-2">Original Text Extract</h2>
                <p className="text-lg leading-loose text-stone-800 text-justify italic">
                  "{passageText}"
                </p>
              </article>
            )}

            {/* Loading Glowing Cross */}
            {(isLoading || isFetchingText) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/40 backdrop-blur-[1px]">
                <img 
                  src="cross-1135370_960_720.png" 
                  alt="Loading Cross"
                  className="w-32 h-32 animate-glow-cross object-contain"
                />
                <p className="mt-8 text-[#4a3b32] font-bold uppercase tracking-widest text-sm animate-pulse">
                  {isLoading ? "Consulting texts..." : "Retrieving passage..."}
                </p>
              </div>
            )}

            {/* Error State for Analysis */}
            {error && !isLoading && (
              <div className="bg-[#fffafa] text-[#8b0000] p-6 border-2 border-[#8b0000]/30 flex items-start gap-4 animate-page-turn">
                <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-sm mb-1">Analysis Failed</h4>
                  <p className="text-md italic">{error}</p>
                </div>
              </div>
            )}

            {/* Success State for Analysis */}
            {analysisResult && !isLoading && !error && (
              <div className="animate-page-turn space-y-6">
                <h2 className="text-2xl font-bold text-[#4a3b32] mb-6 uppercase tracking-widest text-center">
                  Analysis: {selectedPericope.includes(':') ? selectedPericope.split(':')[1] : selectedPericope}
                </h2>
                
                {/* Observation Card */}
                <article className="bg-[#fffafa] p-6 lg:p-8 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#8b0000]/80"></div>
                  <h3 className="text-xl font-bold text-[#8b0000] mb-4 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Observation
                  </h3>
                  <div className="prose prose-stone max-w-none prose-p:leading-loose prose-p:text-stone-800 prose-strong:text-[#4a3b32]">
                    <ReactMarkdown>{analysisResult.observation}</ReactMarkdown>
                  </div>
                </article>

                {/* Interpretation Card */}
                <article className="bg-[#fffafa] p-6 lg:p-8 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#c5a059]"></div>
                  <h3 className="text-xl font-bold text-[#c5a059] mb-4 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Interpretation
                  </h3>
                  <div className="prose prose-stone max-w-none prose-p:leading-loose prose-p:text-stone-800 prose-strong:text-[#4a3b32]">
                    <ReactMarkdown>{analysisResult.interpretation}</ReactMarkdown>
                  </div>
                </article>

                {/* Application Card */}
                <article className="bg-[#fffafa] p-6 lg:p-8 rounded border border-[#c5a059]/40 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-stone-700"></div>
                  <h3 className="text-xl font-bold text-stone-700 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    Application
                  </h3>
                  <div className="prose prose-stone max-w-none prose-p:leading-loose prose-p:text-stone-800 prose-strong:text-[#4a3b32]">
                    <ReactMarkdown>{analysisResult.application}</ReactMarkdown>
                  </div>
                </article>
              </div>
            )}
            
          </section>
          
              </div> {/* End of page-front */}

              {/* Back of Page 1 (Visible when flipped) */}
              <div className="page-back p-8 lg:p-12 flex flex-col items-center justify-center border-r border-[#e6d9c3] shadow-[5px_0_15px_rgba(0,0,0,0.05)]">
                {/* Clickable Left Edge (physically on the right of the flipped page) to flip back */}
                <div 
                  className="absolute top-0 right-0 w-16 h-full cursor-pointer z-30 page-edge-hover opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center group"
                  onClick={() => setIsPageFlipped(false)}
                  title="Previous Page"
                >
                  <svg className="w-8 h-8 text-stone-500 opacity-60 group-hover:opacity-100 transition-opacity transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="opacity-30 flex flex-col items-center">
                   <svg className="w-12 h-12 mb-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                   <p className="font-serif">Notes</p>
                </div>
              </div>
              
            </div> {/* End of page-turner */}
          </div> {/* End of grid-stack */}
        </main>
      </div>
    </div>
  );
}