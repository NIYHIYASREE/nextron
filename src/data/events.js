export const events = [
  {
    id: "paper-presentation",
    name: "Paper Presentation",
    category: "Technical",
    icon: "FileText",
    shortDescription: "Present original ideas, research, and engineering insights with clarity and technical depth.",
    description:
      "A platform for students to communicate innovative concepts, research outcomes, and practical ECE-focused solutions before a technical panel.",
    rules: [
      "Individual or team participation is allowed based on event instructions.",
      "Presentations must be original and technically relevant.",
      "Participants should bring their presentation file in a compatible format.",
      "Time limits and judging criteria will be announced before the event.",
      "The judges' decisions will be final.",
    ],
  },
  {
    id: "project-presentation",
    name: "Project Presentation",
    category: "Technical",
    icon: "Cpu",
    shortDescription: "Demonstrate working prototypes, embedded systems, circuits, or software-enabled innovations.",
    description:
      "Showcase a project that solves a real problem through engineering design, electronics, communication systems, automation, or computing.",
    rules: [
      "Projects may be hardware, software, simulation, or hybrid demonstrations.",
      "Participants are responsible for bringing required components and files.",
      "The project should be explained with problem statement, method, and outcome.",
      "Originality, practicality, and presentation quality will be considered.",
      "Event instructions must be followed throughout.",
    ],
  },
  {
    id: "technical-quiz",
    name: "Technical Quiz",
    category: "Technical",
    icon: "BrainCircuit",
    shortDescription: "Compete across electronics, communication, logic, technology, and engineering fundamentals.",
    description:
      "A fast-paced quiz designed to test technical awareness, fundamentals, logical thinking, and current technology knowledge.",
    rules: [
      "Rounds and scoring will be explained before the quiz begins.",
      "Mobile phones and external references are not allowed during active rounds.",
      "Tie-breaker rounds may be conducted if required.",
      "Questions may cover ECE, computing, aptitude, and technology trends.",
      "The quiz master's decision will be final.",
    ],
  },
  {
    id: "esports",
    name: "Esports",
    category: "Non-Technical",
    icon: "Gamepad2",
    shortDescription: "Squad up for Clash Squad battles with clear rules and on-spot team coordination.",
    description:
      "A competitive mobile gaming event for registered symposium participants, conducted in Clash Squad mode.",
    rules: [
      "Team size: 4 members",
      "Each member should register separately for the symposium.",
      "Registration fee: Rs. 100 per team on spot.",
      "Mode: Clash Squad",
      "All participants must follow the event instructions.",
      "Any form of cheating will result in disqualification.",
      "No grenade.",
      "No rooftop.",
      "Decision of the event organizers will be final.",
    ],
    note:
      "The Rs. 100 Esports team fee is payable on spot and is separate from the Rs. 250 symposium registration fee.",
  },
  {
    id: "dance",
    name: "Sound Party",
    category: "Non-Technical",
    icon: "Music2",
    shortDescription: "Bring performance, rhythm, stage presence, and energy to the NEXTRON floor.",
    description:
      "A stage event for expressive solo or group performances judged on energy, synchronization, creativity, and presentation.",
    rules: [
      "Participants should report before the scheduled performance slot.",
      "Tracks must be submitted in the format requested before the event.",
      "Performance duration and team limits will be announced before the event.",
      "Content must be suitable for a college symposium stage.",
      "Judges' decisions will be final.",
    ],
  },
  {
    id: "memory-clash",
    name: "Memory Clash",
    category: "Non-Technical",
    icon: "Map",
    shortDescription: "Decode clues, move fast, and solve campus challenges with your team.",
    description:
      "A collaborative clue-solving event that blends observation, logic, speed, and teamwork across the event space.",
    rules: [
      "Teams must stay within the permitted hunt area.",
      "Clues and tasks must not be damaged or removed unless instructed.",
      "Event instructions and time limits must be followed.",
      "Unfair assistance or tampering leads to disqualification.",
      "Final decisions rest with the event organizers.",
    ],
  },
  {
    id: "cine-cypher",
    name: "Cine Cypher",
    category: "Non-Technical",
    icon: "Clapperboard",
    shortDescription: "Celebrate cinema knowledge, quick recall, and entertainment challenges.",
    description:
      "A cinema-themed event with engaging rounds built around movie knowledge, audio-visual clues, and team participation.",
    rules: [
      "Rounds and team rules will be announced before the event.",
      "Participants must avoid using phones or external help during active rounds.",
      "Answers must be submitted within the given time.",
      "Tie-breakers may be conducted when required.",
      "Organizer decisions will be final.",
    ],
  },
];

export const eventCategories = ["Technical", "Non-Technical"];

export const getEventById = (id) => events.find((event) => event.id === id);
