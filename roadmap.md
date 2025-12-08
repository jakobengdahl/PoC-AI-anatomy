# AI PoC assistent för att illustrera hur moderna AI system är uppbyggda

## 1. Syfte och målbild

Syftet med denna PoC är att demonstrera att en AI assistent i praktiken är mer än bara en språkmodell. PoC:en ska pedagogiskt visa hur olika tekniska komponenter bygger upp en allt mer kapabel assistent:

- Klient och chattgränssnitt
- Kommunikationen med språkmodellen
- Minneshantering
- Internetliknande sökkomponent
- RAG mot interna PM och styrdokument
- En resonerande orkestrering över flera steg
- MCP baserade verktyg som kan utföra uppgifter, med människa i loopen

Allt byggs kring ett återkommande scenario: en anställd på en svensk myndighet vill ordna julmat åt alla anställda. Genom sex exempel visas hur assistenten blir mer och mer användbar när fler komponenter kopplas in.

Målen:

- En React baserad app med:
  - Header med rubrik för aktuellt exempel samt pilar för att byta exempel.
  - Vänster panel: chattgränssnitt.
  - Höger panel: visualisering av aktiva komponenter i det aktuella exemplet.
  - Animation där komponenter markeras när de används och en gul prick rör sig mellan noderna för att illustrera dataflödet.
- Sex olika konfigurationer av assistenten, växlingsbara via UI.
- Backend som orkestrerar anrop till OpenAI och olika verktyg.
- Ett litet antal MCP tjänster som kan köras lokalt.
- RAG baserat på lokala markdown dokument i repot.
- Förberett för körning i GitHub Codespaces, med init script.
- Enhetstester som kan köras automatiskt och som i så stor utsträckning som möjligt kan användas av den AI agent som utvecklar vidare.

All OpenAI åtkomst ska gå via OpenAI API med nyckel i miljövariabel `OPENAI_API_KEY`.


## 2. Översiktlig arkitektur

Komponenter som återkommer i visualiseringen och i koden:

- Klient
  - React app
  - Header med rubrik och navigationspilar
  - Vänster panel: chat UI
  - Höger panel: visualisering av arkitektur och aktivt flöde
- Backend
  - HTTP API för chatt per exempel
  - Orkestrering av OpenAI anrop, minne, sök, RAG och MCP
- LLM
  - OpenAI Chat Completions
- Chatminne
  - Enkel per session minnesbuffer på backend, med maxlängd
- Internet komponent
  - Förenklad söktjänst byggd på lokala markdownfiler som representerar internetresultat
  - Kan senare bytas mot riktig sök
- RAG komponent
  - Embeddings med OpenAI
  - Enkel in memory vektorindex över lokala markdown PM
- Resonerande orkestrerare
  - En modul som kan skapa en plan med delsteg
  - Exekverar planen stegvis, använder RAG och internetsök
- MCP verktyg
  - Lokala MCP tjänster på samma Codespace
  - Exempelverktyg:
    - Utkast av e post till alla anställda
    - Generering av formulär för anmälningar
    - Export av att göra lista

Visualiseringen till höger ska spegla dessa komponenter som noder i ett diagram. När en chattinteraktion sker ska:

- De komponenter som används i aktuellt exempel markeras.
- En gul prick animera rörelsen från klient till backend, vidare till LLM, RAG, internet och MCP verktyg beroende på flödet.


## 3. Projektstruktur

Föreslagen katalogstruktur:

```text
.
├─ frontend/                React app
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ Header/
│  │  │  ├─ ChatPanel/
│  │  │  ├─ VisualizationPanel/
│  │  │  └─ FlowAnimation/
│  │  ├─ examples/          Konfigurationer för de sex exemplen
│  │  ├─ state/
│  │  ├─ api/
│  │  └─ tests/
│  ├─ index.html
│  ├─ vite.config.ts
│  └─ package.json
├─ backend/
│  ├─ src/
│  │  ├─ index.ts            HTTP server
│  │  ├─ routes/
│  │  │  └─ chatRoutes.ts
│  │  ├─ services/
│  │  │  ├─ llmService.ts
│  │  │  ├─ memoryService.ts
│  │  │  ├─ internetService.ts
│  │  │  ├─ ragService.ts
│  │  │  ├─ reasoningService.ts
│  │  │  └─ mcpOrchestrator.ts
│  │  ├─ models/
│  │  ├─ config/
│  │  └─ tests/
│  ├─ package.json
│  └─ jest.config.ts
├─ mcp-tools/
│  ├─ email-broadcaster/
│  │  ├─ src/
│  │  └─ package.json
│  ├─ form-generator/
│  │  ├─ src/
│  │  └─ package.json
│  └─ task-exporter/
│     ├─ src/
│     └─ package.json
├─ rag_docs/
│  ├─ pm_julmatspolicy_myndighet_2025.md
│  └─ pm_julbord_praktisk_checklista.md
├─ internet_docs/
│  ├─ search_orebro_julbord.md
│  └─ search_solna_julbord.md
├─ scripts/
│  └─ dev-init.sh
├─ .devcontainer/
│  └─ devcontainer.json
├─ package.json             Rot för monorepo med workspaces
├─ README.md
└─ roadmap.md
````

## 4. Tekniska val

* Språk: TypeScript för både frontend och backend.
* Frontend: React + Vite.
* Backend: Node + Express eller Fastify.
* Test: Vitest eller Jest i frontend, Jest i backend.
* Bygg och pakethantering: pnpm eller npm.
* OpenAI SDK: Officiell `openai` klient.
* MCP: Officiell `modelcontextprotocol` SDK för Node (eller motsvarande när repo väl är skapat).
* Devmiljö: GitHub Codespaces med devcontainer.

## 5. Exempel och scenarier

### 5.1 Exempel 1: Enbart LLM (stateless)

* Syfte: Visa att minne inte är inbyggt i LLM utan i ramverket runt omkring.
* Beteende:

  * Varje användarmeddelande skickas som en helt ny konversation till LLM, utan tidigare historik.
  * UI kan visa att en ny session skapas internt för varje meddelande.
* Scenario:

  * Användare: "Vad behöver jag tänka på för att ordna julmat åt alla på min arbetsplats?"
  * LLM svarar generellt (ingen hänsyn till myndighet, orter etc).
  * Nästa meddelande: "Kan du anpassa detta till min myndighet?"
  * LLM saknar referens till tidigare fråga eftersom ingen historik skickas med.

Visualisering:

* Noder: Klient, Backend, LLM.
* Ingen minnesnod aktiv.

### 5.2 Exempel 2: LLM med chatminne

* Syfte: Visa hur minne i backend ger kontext.
* Beteende:

  * Backend håller en per session historik (ytterst enkel minnesbuffer).
  * Varje anrop skickar med historiken till LLM.
* Scenario:

  * Samma första fråga som i exempel 1.
  * Nästa fråga "Kan du anpassa detta till min myndighet?" refererar till första frågan.
  * LLM kan nu använda tidigare kontext, men vet fortfarande inget om vilken myndighet det är.

Visualisering:

* Noder: Klient, Backend, Chatminne, LLM.
* Gul prick visar hur historik hämtas från minnesnod innan LLM anrop.

### 5.3 Exempel 3: LLM med minne + internet

* Syfte: Visa hur en internetliknande komponent kan användas.
* Beteende:

  * Samma minneshantering som i exempel 2.
  * Backend kan vid behov anropa en `internetService` som gör förenklad sökning mot lokala markdownfiler i `internet_docs`.
  * LLM anropas med både historik och sökresultat som kontext.
* Scenario:

  * Användaren anger att myndigheten finns i Örebro.
  * Assistenten letar efter lokala cateringlösningar, men baserat på förenklade "internetresultat" kanske förslagen fortfarande är ganska generella.

Visualisering:

* Noder: Klient, Backend, Chatminne, Internet, LLM.

### 5.4 Exempel 4: LLM med minne, internet och RAG

* Syfte: Visa hur RAG med interna PM ger stor kontextuell skillnad.
* Beteende:

  * Backend har ett RAG lager som bygger index över dokument i `rag_docs`.
  * Vid fråga om julmat hämtas relevanta stycken från interna PM och skickas som kontext till LLM, tillsammans med ev internetresultat.
* Scenario:

  * PM anger att myndigheten har kontor i Örebro och Solna, att vissa regler gäller, samt en detaljerad policy för julmat.
  * Assistentens svar blir nu mer anpassat:

    * Kunna hänvisa till att myndigheten finns på två orter.
    * Ta hänsyn till kostpolicy, alkoholpolicy, budgetprinciper, upphandlingsregler etc.

Visualisering:

* Noder: Klient, Backend, Chatminne, Internet, RAG, LLM.

### 5.5 Exempel 5: LLM med minne, internet, RAG och resonerande kapacitet

* Syfte: Visa hur en planerande modul kan skapa en plan och gå igenom den stegvis.
* Beteende:

  * Användarens förfrågan "Hjälp mig lägga upp en plan för julmat åt alla på myndigheten" triggar:

    * En plan i form av deluppgifter (till exempel 5 till 8 steg) baserat på PM och ev internet.
    * Backend visar planen i UI.
    * Varje steg exekveras i turordning av en resoneringsmodul som gör LLM anrop med RAG och internet kopplade.
  * Inga MCP verktyg används än, så output är fortfarande rekommendationer.

Visualisering:

* Noder: Klient, Backend, Chatminne, Internet, RAG, Reasoning, LLM.
* Gul prick visar ett mer komplext flöde: Klient -> Backend -> Reasoning -> RAG/Internet -> LLM -> tillbaka.

### 5.6 Exempel 6: LLM med minne, internet, RAG, resonerande kapacitet och MCP verktyg

* Syfte: Visa hur assistenten både planerar och utför konkreta uppgifter, med människa i loopen.
* Beteende:

  * Samma som exempel 5, men vissa steg i planen kopplas till MCP verktyg:

    * Skapa utkast till e post som ska skickas till alla anställda.
    * Skapa ett formulär för anmälan om deltagande, inklusive kostpreferenser.
    * Skapa en att göra lista med deadlines som kan exporteras.
  * För varje sådant steg:

    * Assistenten föreslår åtgärden.
    * UI ber användaren att godkänna innan verktyget körs.
    * Efter godkännande anropas MCP tjänsten, som ger ett konkret resultat:

      * E postutkast presenteras i UI.
      * Formulärstruktur genereras och visas.
      * Att göra lista skapas och visas.

Visualisering:

* Noder: Klient, Backend, Chatminne, Internet, RAG, Reasoning, MCP Email, MCP Form, MCP Task export, LLM.
* Gul prick illustrerar loopar mellan Reasoning och MCP verktygen.

## 6. Backlog och ordning för implementation

### 6.1 Fas 0 – Grundläggande repo och verktyg

**[P0.1] Skapa monorepo struktur**

* Skapa rot `package.json` med workspaces `frontend`, `backend`, `mcp-tools/*`.
* Lägg till grundläggande README.
* Definition of done:

  * `pnpm install` eller `npm install` i roten fungerar.
  * `frontend` och `backend` har egna `package.json`.

**[P0.2] Devcontainer för GitHub Codespaces**

* Skapa `.devcontainer/devcontainer.json` med till exempel:

  * Node LTS.
  * PNPM eller NPM.
  * Portar för frontend och backend exponerade.
* Lägg till instruktion i README om att använda Codespaces.
* Definition of done:

  * Codespace startar utan fel.
  * Node finns tillgängligt i terminalen.

**[P0.3] Init script**

* Skapa `scripts/dev-init.sh` som:

  * Installerar beroenden.
  * Skapar `.env.example` i backend med `OPENAI_API_KEY=your_key_here`.
  * Kör första testkörning (till exempel `npm test` som ännu kan vara tom).
* Definition of done:

  * Script kan köras utan fel.
  * Dokumenterat i README.

Exempelinnehåll `scripts/dev-init.sh` (förenklad):

```bash
#!/usr/bin/env bash
set -e

echo "Installerar beroenden i rot..."
npm install

echo "Installerar frontend beroenden..."
cd frontend && npm install && cd ..

echo "Installerar backend beroenden..."
cd backend && npm install && cd ..

if [ ! -f backend/.env.example ]; then
  cat <<EOF > backend/.env.example
OPENAI_API_KEY=your_key_here
EOF
fi

echo "Init klart. Kopiera backend/.env.example till backend/.env och fyll i OPENAI_API_KEY."
```

**[P0.4] Gemensam kodstil och teststruktur**

* Lägg till ESLint, Prettier och Jest eller Vitest.
* Konfigurera scripts:

  * `npm run lint`
  * `npm test`
* Definition of done:

  * Lint och test körs utan fel (initialt kan tester vara triviala).

### 6.2 Fas 1 – Bas UI och visualisering

**[P1.1] Grundläggande React app**

* Skapa Vite baserad React app i `frontend/`.
* Lägg in grundlayout:

  * Header högst upp.
  * Två kolumner under: vänster chatt, höger visualisering.
* Definition of done:

  * `npm run dev` i frontend startar app.
  * En enkel dummy chatt och dummy visualisering visas.

**[P1.2] Header med rubrik och navigationspilar**

* Implementera en `Header` komponent med:

  * Rubrik i mitten som visar aktuellt exempel (till exempel "Exempel 1 – Enbart LLM").
  * Vänsterpil för föregående exempel.
  * Högerpil för nästa exempel.
  * Diskret indikator för "Steg X av 6".
* Definition of done:

  * Klick på pilarna byter exempel.
  * Rubrik och indikator uppdateras korrekt.

**[P1.3] ChatPanel komponent**

* Vänster panel:

  * Lista av meddelanden (användare + assistent).
  * Textinput med "Skicka" knapp.
  * Stöd för att nollställa chatten när man byter exempel.
* Definition of done:

  * Chatten kan skickas till en dummybackend eller mocked funktion.
  * Byte av exempel rensar chatthistoriken.

**[P1.4] VisualizationPanel komponent**

* Skapa en komponent som:

  * Renderar ett antal noder baserat på en konfiguration per exempel.
  * Varje nod har namn (till exempel "LLM", "RAG", "MCP Email").
  * Kan markera noder som aktiva.
  * Kan animera en "gul prick" som rör sig längs fördefinierade kanter mellan noder.
* Definition of done:

  * Visualiseringen kan uppdateras via props:

    * `activeNodes: string[]`
    * `activeEdges: { from: string; to: string }[]`
* Enhetstester:

  * Snapshot test för att säkerställa att rätt noder renderas för respektive exempel.
  * Test för att komponenten reagerar på ändrade props.

**[P1.5] Exempelkonfigurationer i frontend**

* Skapa en central konfiguration, till exempel `examples/config.ts`, där varje exempel definieras med:

  * Id.
  * Namn.
  * Beskrivning.
  * Lista över komponenter som ska visas i visualiseringen.
  * Vilka komponenter som typiskt ska markeras vid en standardinteraktion.
* Definition of done:

  * Header och visualisering använder samma konfiguration.
  * Lägg till enkel tooltip eller infobox med kort beskrivning per exempel.

### 6.3 Fas 2 – Backend grund och Exempel 1

**[P2.1] Backend grundstruktur**

* Skapa en enkel HTTP server i `backend/src/index.ts` med:

  * Hälsokontroll endpoint `/health`.
  * Chatt endpoint `/api/chat/:exampleId`.
* Definition of done:

  * Backend kan startas med `npm run dev`.
  * `/health` returnerar ok.

**[P2.2] OpenAI klient**

* Implementera `llmService.ts`:

  * Läser `OPENAI_API_KEY` från `.env`.
  * Wrappar OpenAI Chat Completions.
* Definition of done:

  * Enhetstest som mockar OpenAI klient och verifierar att rätt payload skickas in.

**[P2.3] Exempel 1 – stateless LLM**

* Implementera logik i `chatRoutes.ts` för `exampleId=1`:

  * Ignorera all historik.
  * Skicka endast senaste användarmeddelandet i prompten.
  * Lägg till systemprompt som beskriver scenariot:

    * Till exempel: "Du är en AI assistent som hjälper en anställd på en arbetsplats att planera julmat. Du har ingen tillgång till tidigare meddelanden eller annan kontext."
* Koppla frontend chatten till backend:

  * Skicka `exampleId` med varje request.
* Visualisering:

  * Backend svar inkluderar en enkel "trace" över använda komponenter, till exempel:

    ```json
    {
      "messages": [...],
      "trace": [
        { "from": "Client", "to": "Backend" },
        { "from": "Backend", "to": "LLM" },
        { "from": "LLM", "to": "Backend" },
        { "from": "Backend", "to": "Client" }
      ],
      "activeNodes": ["Client", "Backend", "LLM"]
    }
    ```
  * Frontend använder `trace` för att animera gul prick.
* Enhetstester:

  * Mocka LLM svar.
  * Testa att backend inte använder historik i exempel 1.

### 6.4 Fas 3 – Exempel 2 med chatminne

**[P3.1] Enkel minnesmodul**

* Implementera `memoryService.ts`:

  * Håller ett in memory store per sessionId (sessionId kan skickas från klienten eller skapas per flik).
  * Begränsar historikens längd (till exempel 10 meddelanden).
* Definition of done:

  * Enhetstest som lägger till meddelanden och verifierar att bufferten fungerar.

**[P3.2] Exempel 2 – LLM med minne**

* I `chatRoutes.ts` hantera `exampleId=2`:

  * Hämta historik från `memoryService`.
  * Skicka historik + nytt meddelande till `llmService`.
* Uppdatera visualisering:

  * Sätt `activeNodes` till `["Client", "Backend", "Memory", "LLM"]` vid svar.
  * Uppdatera `trace` så att flödet går via Memory.
* Enhetstester:

  * Mockad LLM svar.
  * Testa att historiken används.

### 6.5 Fas 4 – Exempel 3 med minne + internet

**[P4.1] InternetService med lokala markdownfiler**

* Implementera `internetService.ts`:

  * Läser markdownfilerna i `internet_docs`.
  * En mycket enkel "sök":

    * Förfrågan tokeniseras.
    * Matchar mot rubriker och stycken.
    * Returnerar ett par korta utdrag som "sökresultat".
* Definition of done:

  * Enhetstester med deterministiska sökningar.

**[P4.2] LLM med enkel verktygsliknande sökintegrering**

* I `chatRoutes.ts` för `exampleId=3`:

  * Använd ett promptmönster där LLM först får fundera på om sök behövs.
  * Alternativt använd OpenAI tools/function calling om det förenklar.
  * När backend bedömer att sök behövs:

    * Anropa `internetService`.
    * Lägg till resultaten som en del av prompten till LLM.
* Visualisering:

  * `activeNodes` inkluderar `Internet`.
  * `trace` utökas för att visa hoppet till Internet komponenten.
* Enhetstester:

  * Med mockad LLM:

    * Testa att rätt sök anropas när användaren nämner "Örebro" eller "Solna".

### 6.6 Fas 5 – Exempel 4 med RAG

**[P5.1] RAG indexering**

* Implementera `ragService.ts`:

  * Vid serverstart:

    * Läs alla markdownfiler i `rag_docs`.
    * Dela upp i stycken.
    * Skapa embeddings via OpenAI.
    * Spara i ett enkelt in memory index.
* Definition of done:

  * Enhetstest som mockar embeddings och verifierar att index byggs.

**[P5.2] RAG retrieval**

* Lägg till funktioner i `ragService`:

  * `retrieve(query: string, topK: number)` som returnerar relevanta stycken.
* Enhetstest:

  * Med stubbat embeddingsavstånd, verifiera att rätt stycken plockas.

**[P5.3] Exempel 4 – Chat med minne, internet och RAG**

* I `chatRoutes.ts` för `exampleId=4`:

  * Standardflöde:

    * Hämta minne.
    * Hämta relevanta RAG stycken.
    * Ev hämta internetresultat.
    * Skicka allt som kontext till LLM.
* Visualisering:

  * `activeNodes` inkluderar `RAG`.
* Enhetstester:

  * Mocka LLM och embeddings.
  * Testa att relevanta RAG stycken skickas med i prompten.

### 6.7 Fas 6 – Exempel 5 med resonerande kapacitet

**[P6.1] ReasoningService**

* Implementera `reasoningService.ts`:

  * Funktion `createPlan(userGoal, context)` som:

    * Anropar LLM med en prompt som ber om en numrerad lista med delsteg.
  * Funktion `executePlan(plan, context)` som:

    * Exekverar ett steg i taget.
    * För varje steg anropar LLM med relevant RAG och internet.
* UI:

  * Visa planen som en lista med steg.
  * Markera aktuellt steg och vad som pågår.
* Enhetstester:

  * Mocka LLM svar.
  * Testa att planen skapas och att stegen uppdateras korrekt.

**[P6.2] Exempel 5 integration**

* I `chatRoutes.ts` för `exampleId=5`:

  * När användaren uttrycker ett mål (till exempel första meddelandet):

    * Skapa en plan.
    * Returnera både plan och första steg till klienten.
  * Vid fortsatta interaktioner:

    * Utför nästa steg i planen.
* Visualisering:

  * `activeNodes` inkluderar `Reasoning`.
* Enhetstester:

  * Flödestest för att kontrollera att planen går från steg 1 till sista steg.

### 6.8 Fas 7 – Exempel 6 med MCP verktyg

**[P7.1] MCP verktyg – struktur**

* Skapa tre MCP tjänster i `mcp-tools`:

  1. `email-broadcaster`

     * Tar in beskrivning av målgrupp, ämne och budskap.
     * Returnerar ett e postutkast.
  2. `form-generator`

     * Tar in en lista av frågor och fält (till exempel "Namn", "Avdelning", "Specialkost").
     * Returnerar en enkel formulärstruktur i JSON och ett markdownexempel.
  3. `task-exporter`

     * Tar in en plan med delsteg.
     * Returnerar en att göra lista i markdown.
* Alla tre kan initialt bara logga eller skriva resultat till filer i en lokal katalog, till exempel `generated/`.

**[P7.2] MCPOrchestrator**

* Implementera `mcpOrchestrator.ts`:

  * Hanterar anslutning till lokala MCP tjänster.
  * Exponerar funktioner:

    * `draftEmail(...)`
    * `generateForm(...)`
    * `exportTasks(...)`
* Enhetstester:

  * Mocka MCP klienten och verifiera att anrop skickas korrekt.

**[P7.3] Human in the loop UI**

* I frontend:

  * När ReasoningService föreslår ett steg som involverar ett MCP verktyg:

    * Visa en ruta med "Föreslagen åtgärd".
    * Visa kort beskrivning.
    * Ge knappar "Godkänn" och "Avbryt".
  * Vid godkännande:

    * Skicka en begäran till backend att exekvera MCP funktionen.
    * Visa resultatet i UI (till exempel e postutkastet).
* Enhetstester:

  * Simulera användaren som klickar på "Godkänn" och säkerställ att backend anropas.

**[P7.4] Exempel 6 integration**

* I `chatRoutes.ts` för `exampleId=6`:

  * ReasoningService får instruktion att dela upp planen i steg där:

    * Vissa steg leder till rekommendationer (RAG + internet).
    * Vissa steg leder till MCP anrop som kräver godkännande.
* Visualisering:

  * `activeNodes` inkluderar alla MCP noder.
  * `trace` visar flödet via MCP verktyg.

### 6.9 Fas 8 – Tester och stabilisering

**[P8.1] Enhetstester frontend**

* Täcka:

  * Header navigation.
  * ChatPanel beteende.
  * VisualizationPanel renderingslogik.
  * Human in the loop UI flöden.

**[P8.2] Enhetstester backend**

* Täcka:

  * MemoryService.
  * InternetService.
  * RagService.
  * ReasoningService.
  * MCPOrchestrator.
  * Chat routes för alla sex exempel, med mockad LLM.

**[P8.3] End to end scenarion med mockad LLM**

* Skapa ett antal fördefinierade scenarion med stubbdatan för LLM, så att regressions tester blir stabila.

## 7. Innehåll för RAG och "internet"

### 7.1 PM: Julmatspolicy för myndighet

Filen `rag_docs/pm_julmatspolicy_myndighet_2025.md` ska innehålla följande text:

```markdown
# PM – Policy för julmat och julaktiviteter vid Myndigheten för Statistik och Analys

## 1. Syfte

Syftet med denna policy är att säkerställa att planering och genomförande av julmat och julrelaterade aktiviteter vid Myndigheten för Statistik och Analys sker på ett rättssäkert, likvärdigt och kostnadseffektivt sätt, i enlighet med gällande lagstiftning och interna riktlinjer.

## 2. Omfattning

Policyn gäller samtliga anställda vid myndigheten, oavsett anställningsform, samt samtliga verksamhetsställen.

Myndigheten har två huvudsakliga kontor:
- Örebro
- Solna

## 3. Grundprinciper

- Julaktiviteter ska ha ett tydligt samband med verksamheten och bidra till trivsel och samhörighet.
- Kostnader ska vara måttliga och försvarbara ur ett skattebetalarperspektiv.
- Likabehandling ska eftersträvas mellan orter och avdelningar.
- Hänsyn ska tas till medarbetare med särskilda kostpreferenser och religiösa eller kulturella skäl.

## 4. Budget och ekonomiska ramar

- Budget för julmat beslutas årligen av myndighetens ledning.
- Rekommenderad riktkostnad är högst 450 kronor per person, inklusive moms.
- I budgeten ska kostnader för både mat och icke alkoholhaltiga drycker ingå.
- Alkohol bekostas normalt inte av myndigheten.

## 5. Upphandling och inköp

- Vid val av leverantör ska i första hand befintliga ramavtal följas.
- Om ramavtal saknas ska upphandling ske i enlighet med LOU och myndighetens interna inköpsriktlinjer.
- Leverantörer ska kunna erbjuda alternativ för specialkost, inklusive:
  - Vegetariskt
  - Veganskt
  - Laktosfritt
  - Glutenfritt
  - Övriga allergier vid behov

## 6. Genomförande per ort

### 6.1 Örebro

- Julmaten genomförs normalt som gemensam julbuffé per avdelning eller enhet.
- Lokal kan vara myndighetens egna lokaler eller extern restaurang enligt ramavtal.
- Arrangören ansvarar för att boka lokal, mat och eventuella aktiviteter.

### 6.2 Solna

- Motsvarande upplägg som i Örebro ska eftersträvas.
- Eventuella skillnader i utbud mellan orter ska dokumenteras och motiveras.

## 7. Anmälan och deltagande

- Anmälan ska ske via ett digitalt formulär.
- Formuläret ska som minimum innehålla:
  - Namn
  - Avdelning/enhet
  - Val av kostalternativ
  - Information om allergier
- Sista anmälningsdatum ska vara minst två veckor före genomförandet.
- Chefer ansvarar för att informera samtliga medarbetare om datum och anmälan.

## 8. Dokumentation

- Ansvarig arrangör ska dokumentera:
  - Antal deltagare per ort
  - Totalkostnad och kostnad per person
  - Vilken leverantör som använts
  - Eventuella avvikelser från denna policy

Dokumentationen ska sparas i myndighetens diarieföringssystem.

## 9. Ansvar

- Generaldirektören beslutar om övergripande policy och budgetramar.
- Respektive avdelningschef ansvarar för genomförandet inom sin avdelning.
- En utsedd koordinator per ort ansvarar för praktisk planering och uppföljning.

## 10. Uppföljning

- Policyn ska följas upp årligen.
- Eventuella brister eller förbättringsförslag ska dokumenteras och tas upp i ledningsgruppen.
```

### 7.2 PM: Praktisk checklista för julbord

Filen `rag_docs/pm_julbord_praktisk_checklista.md` ska innehålla följande text:

```markdown
# PM – Praktisk checklista för planering av julbord

Denna checklista används som stöd av den som planerar julbord vid Myndigheten för Statistik och Analys.

## Steg 1 – Förankring och datum

1. Säkerställ budget med närmaste chef.
2. Föreslå datum och tidpunkt, i dialog med avdelningen.
3. Kontrollera krockar med andra större möten eller aktiviteter.

## Steg 2 – Val av upplägg

1. Bestäm om julbordet ska genomföras:
   - I myndighetens lokaler med catering
   - På extern restaurang
2. Kontrollera om det finns gällande ramavtal med aktuell leverantör.
3. Stäm av med HR om eventuella begränsningar eller riktlinjer.

## Steg 3 – Anmälningsformulär

1. Skapa digitalt formulär för anmälan.
2. Inkludera följande fält:
   - Namn
   - Avdelning/enhet
   - Val av kostalternativ
   - Allergier eller övriga önskemål
3. Ange sista svarsdatum och kontaktperson.

## Steg 4 – Bokning av leverantör

1. Skicka preliminär förfrågan till leverantör med:
   - Datum, tid och plats
   - Ungefärligt antal deltagare
   - Krav på specialkost
2. Bekräfta bokning skriftligt när antalet deltagare är mer känt.
3. Kontrollera faktureringsuppgifter och referenser.

## Steg 5 – Kommunikation till medarbetare

1. Skicka inbjudan med länk till anmälningsformulär.
2. Påminn en gång innan sista svarsdatum.
3. Skicka praktisk information när bokningen är bekräftad:
   - Tid och plats
   - Eventuell klädkod
   - Kontaktperson vid frågor

## Steg 6 – Uppföljning före genomförandet

1. Sammanställ antal deltagare och kostalternativ.
2. Skicka uppdaterat antal till leverantören i god tid.
3. Säkerställ att lokalen är bokad och tillgänglig.

## Steg 7 – Genomförande

1. Var på plats i god tid före start.
2. Kontrollera att:
   - Mat och dryck är uppdukad enligt överenskommelse.
   - Specialkost är tydligt märkt.
3. Hälsa leverantör och medarbetare välkomna.

## Steg 8 – Efterarbete

1. Kontrollera faktura mot beställning och deltagarlista.
2. Säkerställ att kostnaden bokförs på korrekt projekt eller kostnadsställe.
3. Dokumentera erfarenheter:
   - Vad fungerade bra
   - Vad kan förbättras till nästa år
```

### 7.3 "Internet" stubbfiler

Filen `internet_docs/search_orebro_julbord.md`:

```markdown
# Sökresultat – Julbord Örebro

## Restaurang Exempelköket Örebro

- Plats: Centrala Örebro
- Profil: Traditionellt svenskt julbord med fokus på lokala råvaror.
- Alternativ: Vegetariskt, veganskt, laktosfritt, glutenfritt.
- Övrigt: Möjlighet att beställa catering till större sällskap.

## Cateringfirman Goda Gåvan

- Plats: Strax utanför Örebro
- Profil: Catering med flexibla upplägg för företag och myndigheter.
- Erbjuder:
  - Julbuffé på plats
  - Leverans och uppdukning i egna lokaler
  - Särskilda alternativ för allergier och specialkost.
```

Filen `internet_docs/search_solna_julbord.md`:

```markdown
# Sökresultat – Julbord Solna

## Restaurang Stadskällaren Solna

- Plats: Nära Solna station
- Profil: Klassiskt julbord för större sällskap.
- Notering: Möjlighet till separata salar för olika avdelningar.

## Solna Konferens & Catering

- Plats: Solna Business Park
- Profil: Konferensanläggning med julmenyer anpassade för företag.
- Erbjuder:
  - Julbuffé i konferenslokaler
  - Catering till kundens lokaler
  - Specialkost efter överenskommelse.
```

## 8. Körning i GitHub Codespaces

Förväntat arbetssätt:

1. Skapa Codespace på repositoriet.
2. Script `scripts/dev-init.sh` körs en gång.
3. Kopiera `backend/.env.example` till `backend/.env` och fyll i `OPENAI_API_KEY`.
4. Starta backend:

   * `cd backend && npm run dev`
5. Starta frontend:

   * `cd frontend && npm run dev`
6. Öppna frontendens port i Codespaces för att visa appen.

Den AI agent som ska arbeta vidare med detta repo ska:

* Alltid läsa igenom denna roadmap först.
* Genomföra uppgifterna i faserna i ordning där det är rimligt.
* Sätta upp och köra tester löpande.
* Hålla implementationen så enkel och stabil som möjligt för PoC syftet.

````

---
