import {
  addCommunityPost,
  askAICoach,
  createAccount,
  isFirebaseReady,
  loadCommunityPosts,
  loadPublicSettings,
  loadCloudState,
  saveCloudState,
  saveAdminSettings,
  savePublicSettings,
  sendPasswordReset,
  signIn,
  signOutUser,
  startFirebaseAuth
} from "./firebase-service.js";
import { appFeatures, getAppLink, isAdminEmail, isPremiumTesterEmail } from "./firebase-config.js";

const cards = [
  {
    title: "I choose the option that expands me.",
    tier: "Free",
    prompt: "What decision would your future self make before noon today?"
  },
  {
    title: "My actions become evidence.",
    tier: "Free",
    prompt: "Name one tiny action that proves you are becoming her."
  },
  {
    title: "I can be grateful and still want more.",
    tier: "Free",
    prompt: "What are you receiving today, and what are you ready to create next?"
  },
  {
    title: "My whole life gets to expand.",
    tier: "Free",
    prompt: "Where do you want more peace, freedom, health, love, or possibility today?"
  },
  {
    title: "My nervous system gets to come with me.",
    tier: "Premium",
    prompt: "What action would feel brave and safe enough to take today?"
  },
  {
    title: "I am available for aligned income.",
    tier: "Premium",
    prompt: "What business action supports your peace, purpose, and options?"
  },
  {
    title: "I release the identity that keeps me small.",
    tier: "Premium",
    prompt: "What old story is no longer allowed to lead your choices?"
  },
  {
    title: "My future self is already practicing through me.",
    tier: "Premium",
    prompt: "What would she do in the next 20 minutes without asking fear for permission?"
  }
];

const starterState = {
  user: null,
  premium: false,
  onboarding: {
    completed: false,
    primaryPath: "Whole life",
    desiredFeeling: "",
    currentChallenge: "",
    biggestGoal: "",
    supportStyle: "Warm and practical",
    businessInterest: "Maybe later",
    lifeAreas: ["Self-trust", "Peace", "Purpose"]
  },
  activeView: "dashboard",
  coachProfile: {
    stage: "Clarity",
    focus: "Whole-life alignment and future self",
    resistance: "Overthinking before the next honest step",
    preferredStyle: "Warm, direct, practical",
    coachId: "maya",
    coachName: "Maya",
    coachIdentity: "Female coach",
    coachVoice: "warm, grounded, and gently direct",
    coachImage: "assets/coach-maya.png",
    lastCheckIn: "Today",
    evidenceLog: [
      "Completed one aligned life action",
      "Practicing identity before the result arrives"
    ],
    milestones: [
      { label: "Started OYO coaching profile", date: "Today" },
      { label: "Named future self identity", date: "Today" }
    ]
  },
  futureSelf:
    "I am calm, well-resourced, visible, and brave. I own my options before anyone else gets to define them.",
  vision: [
    "A life that feels peaceful, free, and fully mine",
    "A healthy body and clear morning routine",
    "A community of women choosing bigger options"
  ],
  journal: [
    {
      date: "Today",
      title: "Future self check-in",
      body: "I am practicing the identity before the result arrives."
    }
  ],
  notes: [
    {
      date: "Today",
      title: "Daily note",
      body: "Use this space to capture thoughts, reminders, ideas, and what you want your coach to remember today."
    }
  ],
  gratitude: ["My voice", "New choices", "People who believe in me"],
  actions: [
    { text: "Send one courageous invitation", done: false },
    { text: "Write the next version of my future self", done: false },
    { text: "Complete one aligned life action", done: true }
  ],
  cardShift: 0,
  activeExercise: 0,
  activeResource: 0,
  activeCommunityCategory: "All",
  goals: [
    { title: "Create more peace and freedom", progress: 45, area: "Life" },
    { title: "Deepen daily self-trust", progress: 70, area: "Self" }
  ],
  coachMessages: [
    {
      role: "coach",
      text:
        "Welcome back. Tell me what you want help with today, and I will coach you through life, identity, relationships, wellbeing, purpose, action, and next steps."
    }
  ],
  community: [
    {
      name: "April",
      topic: "Business Wins",
      text: "Today I chose action before overthinking. That is the option I am owning."
    },
    {
      name: "OYO Compass",
      topic: "Questions",
      text: "Ask for support, clarity, ideas, or encouragement around the option you are choosing."
    },
    {
      name: "OYO Compass",
      topic: "Lifestyle",
      text: "Share the life moments you are building this for: peace, health, family, home, freedom, and joy."
    }
  ]
};

const communityCategories = [
  "All",
  "Questions",
  "Business Wins",
  "Lifestyle",
  "Goals",
  "Gratitude",
  "Support",
  "Daily Wins"
];

const resources = [
  {
    title: "Own Your Options Starter Map",
    tier: "Free",
    type: "Guide",
    detail: "A simple map for naming the life option, self-trust option, and next action available today."
  },
  {
    title: "Future Self Scripting Prompts",
    tier: "Free",
    type: "Workbook",
    detail: "Prompts for writing the identity before the result arrives."
  },
  {
    title: "Life Compass Reset",
    tier: "Free",
    type: "Whole-life practice",
    detail: "A reset for peace, body, home, relationships, money, purpose, and future self."
  },
  {
    title: "Community Challenge Calendar",
    tier: "Free",
    type: "Community",
    detail: "A simple weekly rhythm for sharing wins, gratitude, aligned action, and owned options."
  },
  {
    title: "NLP Reframe Library",
    tier: "Premium",
    type: "Exercises",
    detail: "A collection of identity reframes, belief ladders, parts integration prompts, and future pacing practices."
  },
  {
    title: "Belief Ladder Workbook",
    tier: "Premium",
    type: "Mindset",
    detail: "Move from a hard-to-believe desire into bridge thoughts the body can actually hold."
  },
  {
    title: "Future Self Activation Vault",
    tier: "Premium",
    type: "Future self",
    detail: "Deeper prompts for becoming the person before the outside evidence catches up."
  },
  {
    title: "Manifestation Card Vault",
    tier: "Premium",
    type: "Cards",
    detail: "Premium cards for identity, receiving, aligned income, confidence, visibility, and nervous-system safety."
  },
  {
    title: "LWA Business Pathway",
    tier: "Premium",
    type: "Business as one life option",
    detail: "A bridge from life vision into aligned income, invitations, follow-up, and leadership."
  },
  {
    title: "Aligned Income Action List",
    tier: "Premium",
    type: "Business",
    detail: "Simple business actions that support income without abandoning peace, family, health, or purpose."
  },
  {
    title: "Whole-Life Goal Planner",
    tier: "Premium",
    type: "Goals",
    detail: "Plan goals across self, health, relationships, home, money, business, and purpose."
  },
  {
    title: "Premium Community Prompts",
    tier: "Premium",
    type: "Community",
    detail: "Conversation starters for support circles, weekly wins, courage posts, and reflection threads."
  },
  {
    title: "Confidence Evidence Vault",
    tier: "Premium",
    type: "Confidence",
    detail: "A place to build proof, track courage, and turn small wins into self-trust."
  },
  {
    title: "Relationship Boundary Builder",
    tier: "Premium",
    type: "Relationships",
    detail: "Prompts for kind boundaries, honest requests, and staying connected to self-respect."
  },
  {
    title: "Lifestyle Reset Menu",
    tier: "Premium",
    type: "Lifestyle",
    detail: "Small resets for home, health, peace, energy, family rhythm, and daily support."
  },
  {
    title: "Business Follow-Up Scripts",
    tier: "Premium",
    type: "Business",
    detail: "Clean invitation and follow-up scripts for aligned income without pressure."
  },
  {
    title: "Future Self Decision Guide",
    tier: "Premium",
    type: "Future self",
    detail: "A decision filter for choosing the option that matches peace, freedom, self-respect, and future identity."
  },
  {
    title: "Money Mindset Reframe Sheet",
    tier: "Premium",
    type: "Money",
    detail: "Prompts for shifting money pressure into stewardship, options, and aligned receiving."
  }
];

const nlpExercises = [
  {
    title: "Identity Reframe",
    tier: "Free",
    category: "Identity",
    body: "Replace 'I am behind' with 'I am building evidence at the pace my nervous system can hold.'"
  },
  {
    title: "Future Pacing",
    tier: "Free",
    category: "Future Self",
    body: "Imagine tonight after your aligned action is complete. What did you do first?"
  },
  {
    title: "State Shift Breath",
    tier: "Free",
    category: "State Shift",
    body: "Take three slow breaths, name the feeling, then ask: what option is still available while this feeling is here?"
  },
  {
    title: "Self-Trust Evidence Check",
    tier: "Free",
    category: "Confidence",
    body: "Find one small piece of proof that you have followed through before, then choose one action that repeats that identity."
  },
  {
    title: "Peace Before Pressure",
    tier: "Free",
    category: "Lifestyle",
    body: "Name the pressure, choose one peace-giving option, and lower the next step until it feels doable."
  },
  {
    title: "Parts Integration",
    tier: "Premium",
    category: "Parts Work",
    body: "Let the protective part and the ambitious part each state their positive intent, then choose one integrated action."
  },
  {
    title: "Belief Ladder",
    tier: "Premium",
    category: "Belief Work",
    body: "Move from doubt to believable expansion through five bridge thoughts."
  },
  {
    title: "Anchor the Future Self",
    tier: "Premium",
    category: "Future Self",
    body: "Choose one future-self feeling, pair it with a hand-on-heart anchor, and rehearse one aligned action from that state."
  },
  {
    title: "Submodalities Shift",
    tier: "Premium",
    category: "Belief Work",
    body: "Picture the limiting belief as an image. Make it smaller, farther away, dimmer, and quieter. Bring the new belief closer, brighter, and warmer."
  },
  {
    title: "Pattern Interrupt",
    tier: "Premium",
    category: "State Shift",
    body: "When the old spiral starts, stand up, change your posture, say 'new option,' and take one action that proves a new pattern."
  },
  {
    title: "Aligned Income Reframe",
    tier: "Premium",
    category: "Business",
    body: "Replace 'selling is pressure' with 'I am offering an option that may support someone's life.' Then send one clean invitation."
  },
  {
    title: "Evidence Stacking",
    tier: "Premium",
    category: "Confidence",
    body: "List five moments you already followed through. Let those become evidence that your next action is safe to begin."
  },
  {
    title: "Timeline Preview",
    tier: "Premium",
    category: "Future Self",
    body: "Imagine yourself 90 days from now after consistent aligned action. Look back and name the first three small moves that mattered."
  },
  {
    title: "Old Story Rewrite",
    tier: "Premium",
    category: "Identity",
    body: "Name the story that keeps repeating, identify who it makes you become, and rewrite it into an option-owning identity."
  },
  {
    title: "Belief Evidence Bridge",
    tier: "Premium",
    category: "Belief Work",
    body: "Take one belief that feels far away and build three evidence-based bridge thoughts your nervous system can accept."
  },
  {
    title: "Future Self Decision Filter",
    tier: "Premium",
    category: "Future Self",
    body: "Run a decision through peace, self-respect, freedom, and future-self standards before choosing the next step."
  },
  {
    title: "Nervous System Permission Slip",
    tier: "Premium",
    category: "State Shift",
    body: "Give the protective part permission to move slowly while still choosing one safe, visible action."
  },
  {
    title: "Aligned Invitation Practice",
    tier: "Premium",
    category: "Business",
    body: "Write a clean invitation that offers an option without pressure, then choose one person to send it to."
  },
  {
    title: "Follow-Up Confidence Script",
    tier: "Premium",
    category: "Business",
    body: "Create a kind follow-up message that honors the relationship, the offer, and your own confidence."
  },
  {
    title: "Boundary Rehearsal",
    tier: "Premium",
    category: "Relationships",
    body: "Practice one honest sentence that protects your peace without abandoning kindness."
  },
  {
    title: "Life Area Reset",
    tier: "Premium",
    category: "Lifestyle",
    body: "Choose one life area that feels heavy and create a 15-minute reset that brings it back into ownership."
  }
];

const exerciseDetails = {
  "Identity Reframe": {
    time: "5 minutes",
    steps: [
      "Write the sentence that feels heavy, such as 'I am behind.'",
      "Ask what identity that sentence is making you practice.",
      "Rewrite it into an identity you can believe today.",
      "Choose one action that proves the new identity."
    ],
    prompts: [
      "The old identity I am releasing is...",
      "The identity I am practicing instead is...",
      "One piece of evidence I can create today is..."
    ]
  },
  "Future Pacing": {
    time: "7 minutes",
    steps: [
      "Imagine tonight after one aligned action is complete.",
      "Notice how your body feels when you followed through.",
      "Look back from that moment and name the first tiny step you took.",
      "Do that first step now or schedule it."
    ],
    prompts: [
      "Tonight I will feel proud because...",
      "The first move that made it easier was...",
      "Future me wants me to remember..."
    ]
  },
  "State Shift Breath": {
    time: "3 minutes",
    steps: [
      "Put one hand on your chest and take three slow breaths.",
      "Name the feeling without judging it.",
      "Ask what option is still available while the feeling is here.",
      "Pick the smallest next move."
    ],
    prompts: [
      "The feeling present right now is...",
      "The option still available is...",
      "The kindest next move is..."
    ]
  },
  "Self-Trust Evidence Check": {
    time: "5 minutes",
    steps: [
      "Write one moment when you did follow through, even if it was small.",
      "Name the quality that moment proves about you.",
      "Choose one action today that uses that same quality.",
      "After you do it, add it to your evidence log."
    ],
    prompts: [
      "A time I followed through was...",
      "This proves I am someone who...",
      "Today I can use that proof by..."
    ]
  },
  "Peace Before Pressure": {
    time: "4 minutes",
    steps: [
      "Write the pressure sentence exactly as it sounds in your head.",
      "Ask what peace would choose if it still cared about the result.",
      "Lower the action until your body can begin.",
      "Take the first peaceful step."
    ],
    prompts: [
      "The pressure says...",
      "Peace would choose...",
      "The smaller first step is..."
    ]
  },
  "Parts Integration": {
    time: "12 minutes",
    steps: [
      "Name the protective part and the ambitious part.",
      "Let each part say what it is trying to do for you.",
      "Thank both parts for their positive intent.",
      "Choose one action that honors safety and growth."
    ],
    prompts: [
      "The protective part wants...",
      "The ambitious part wants...",
      "The integrated option is..."
    ]
  },
  "Belief Ladder": {
    time: "10 minutes",
    steps: [
      "Write the belief that feels too big to believe yet.",
      "Write the current doubt honestly.",
      "Create five bridge thoughts between doubt and belief.",
      "Practice the bridge thought that feels most believable."
    ],
    prompts: [
      "The belief I want to grow into is...",
      "The bridge thought I can believe today is...",
      "Evidence that supports this is..."
    ]
  },
  "Anchor the Future Self": {
    time: "8 minutes",
    steps: [
      "Choose one feeling your future self carries.",
      "Create a simple physical anchor, like hand on heart.",
      "Breathe into that feeling for 30 seconds.",
      "Take one action while holding the anchor."
    ],
    prompts: [
      "My future self feels...",
      "When I anchor this feeling, I choose...",
      "The action I will take from this state is..."
    ]
  },
  "Submodalities Shift": {
    time: "10 minutes",
    steps: [
      "Picture the limiting belief as an image.",
      "Make it smaller, dimmer, farther away, and quieter.",
      "Picture the new belief as bright, close, warm, and steady.",
      "Step into the new image and choose one action."
    ],
    prompts: [
      "The old image looked like...",
      "The new image feels like...",
      "The action that matches the new image is..."
    ]
  },
  "Pattern Interrupt": {
    time: "4 minutes",
    steps: [
      "Notice the old spiral as soon as it begins.",
      "Change posture, stand up, or move locations.",
      "Say out loud: 'new option.'",
      "Take one small action that breaks the pattern."
    ],
    prompts: [
      "The old pattern is...",
      "My interrupt phrase is...",
      "The action that proves a new pattern is..."
    ]
  },
  "Aligned Income Reframe": {
    time: "9 minutes",
    steps: [
      "Write the sales or invitation thought that feels heavy.",
      "Reframe selling as offering an option.",
      "Name who the option may support.",
      "Send one clean invitation or follow-up."
    ],
    prompts: [
      "The pressure story is...",
      "The service-based reframe is...",
      "One person I can invite or follow up with is..."
    ]
  },
  "Evidence Stacking": {
    time: "6 minutes",
    steps: [
      "List five times you followed through, even in small ways.",
      "Circle the pattern of strength they reveal.",
      "Turn that pattern into an identity statement.",
      "Choose one next action from that identity."
    ],
    prompts: [
      "Evidence I already have is...",
      "This proves I am someone who...",
      "The next aligned evidence will be..."
    ]
  },
  "Timeline Preview": {
    time: "12 minutes",
    steps: [
      "Imagine yourself 90 days from now.",
      "Look at your life, body, relationships, money, and purpose.",
      "Name the three small actions that created the biggest shift.",
      "Choose the first of those actions today."
    ],
    prompts: [
      "In 90 days I am proud because...",
      "The three actions that mattered were...",
      "Today I begin with..."
    ]
  },
  "Old Story Rewrite": {
    time: "9 minutes",
    steps: [
      "Write the old story in one honest sentence.",
      "Name what identity that story asks you to practice.",
      "Write the Own Your Options version of the story.",
      "Choose one action that proves the new story today."
    ],
    prompts: [
      "The old story is...",
      "The identity I am choosing now is...",
      "The action that proves the rewrite is..."
    ]
  },
  "Belief Evidence Bridge": {
    time: "8 minutes",
    steps: [
      "Choose one belief that feels too far away.",
      "List three pieces of evidence that make it slightly more believable.",
      "Write one bridge thought that uses that evidence.",
      "Repeat the bridge thought before your next action."
    ],
    prompts: [
      "The belief I am growing into is...",
      "The evidence I already have is...",
      "The bridge thought I can hold today is..."
    ]
  },
  "Future Self Decision Filter": {
    time: "7 minutes",
    steps: [
      "Write the decision in front of you.",
      "Ask which option protects peace, self-respect, freedom, and future self.",
      "Notice which choice creates the cleanest evidence.",
      "Choose the next step, not the whole lifetime."
    ],
    prompts: [
      "The decision is...",
      "Future self would choose...",
      "The clean next step is..."
    ]
  },
  "Nervous System Permission Slip": {
    time: "6 minutes",
    steps: [
      "Name the part of you that feels cautious.",
      "Thank it for trying to protect you.",
      "Write permission to move slowly and still move.",
      "Choose one safe action that creates evidence."
    ],
    prompts: [
      "The protective part is trying to...",
      "I give myself permission to...",
      "The safe action is..."
    ]
  },
  "Aligned Invitation Practice": {
    time: "10 minutes",
    steps: [
      "Name who the invitation could support.",
      "Write the invitation as an option, not pressure.",
      "Keep it clear, kind, and easy to respond to.",
      "Send or schedule the invitation."
    ],
    prompts: [
      "This option may support...",
      "The invitation can say...",
      "The clean next business action is..."
    ]
  },
  "Follow-Up Confidence Script": {
    time: "8 minutes",
    steps: [
      "Name the person you are following up with.",
      "Remind yourself that follow-up is service, not pressure.",
      "Write one simple check-in message.",
      "Send it or add it to your actions."
    ],
    prompts: [
      "The person I am following up with is...",
      "The kind message can say...",
      "After sending it, I will remind myself..."
    ]
  },
  "Boundary Rehearsal": {
    time: "9 minutes",
    steps: [
      "Write the truth without editing it.",
      "Name the boundary or request that protects your peace.",
      "Soften the wording while keeping the truth intact.",
      "Practice saying it out loud once."
    ],
    prompts: [
      "The truth is...",
      "The boundary/request is...",
      "The sentence I can practice is..."
    ]
  },
  "Life Area Reset": {
    time: "15 minutes",
    steps: [
      "Choose one area: body, home, money, relationship, purpose, or peace.",
      "Name what would create the most relief.",
      "Set a 15-minute timer.",
      "Do only the reset action, then stop and record the evidence."
    ],
    prompts: [
      "The area asking for care is...",
      "The reset action is...",
      "After 15 minutes, I noticed..."
    ]
  }
};

const resourceDetails = {
  "Own Your Options Starter Map": {
    sections: [
      "Name the life area asking for attention.",
      "Name the option you are ready to own.",
      "Choose one action small enough to finish today."
    ],
    prompts: ["The area of life I am reclaiming is...", "The option I choose today is..."]
  },
  "Future Self Scripting Prompts": {
    sections: [
      "Write as the future self who already trusts herself.",
      "Describe what she no longer negotiates with.",
      "Name the standards, routines, and relationships she protects."
    ],
    prompts: ["Future me wants me to know...", "She chooses this because..."]
  },
  "Life Compass Reset": {
    sections: [
      "Check peace, body, home, relationships, money, purpose, and future self.",
      "Score each area from 1 to 10.",
      "Pick the lowest area and choose one caring action."
    ],
    prompts: ["The area needing care is...", "The reset action is..."]
  },
  "Community Challenge Calendar": {
    sections: [
      "Monday: name the option.",
      "Wednesday: share evidence.",
      "Friday: celebrate the owned option."
    ],
    prompts: ["This week I am choosing...", "My evidence this week is..."]
  },
  "NLP Reframe Library": {
    sections: [
      "Use identity reframes when the self-talk is heavy.",
      "Use belief ladders when the new belief feels too far away.",
      "Use future pacing when action feels unclear."
    ],
    prompts: ["The sentence I am reframing is...", "The new option sentence is..."]
  },
  "Belief Ladder Workbook": {
    sections: [
      "Start with the honest doubt.",
      "Build bridge thoughts that feel 5 percent more possible.",
      "End with an action that creates evidence."
    ],
    prompts: ["The current doubt is...", "The believable bridge thought is..."]
  },
  "Future Self Activation Vault": {
    sections: [
      "Choose a future-self identity.",
      "Anchor it with breath and posture.",
      "Act from that identity before the feeling is perfect."
    ],
    prompts: ["Future self identity:", "Action from that identity:"]
  },
  "Manifestation Card Vault": {
    sections: [
      "Pull a premium card.",
      "Journal the prompt.",
      "Turn the reflection into one piece of daily evidence."
    ],
    prompts: ["The card is showing me...", "The evidence I will create is..."]
  },
  "LWA Business Pathway": {
    sections: [
      "Clarify the life the business is meant to support.",
      "Choose one invitation, follow-up, or leadership action.",
      "Use the LWA link inside Life + Business when ready."
    ],
    prompts: ["The life I am building through business is...", "The business action I will take is..."]
  },
  "Aligned Income Action List": {
    sections: [
      "Send one clean invitation.",
      "Follow up with one person kindly.",
      "Share one story of transformation or possibility."
    ],
    prompts: ["The invitation I will send is...", "The person I can support is..."]
  },
  "Whole-Life Goal Planner": {
    sections: [
      "Set one goal for self, body, home, relationships, money, and purpose.",
      "Pick the goal that would create the most relief.",
      "Break it into a seven-day action."
    ],
    prompts: ["The goal that matters most is...", "The seven-day action is..."]
  },
  "Premium Community Prompts": {
    sections: [
      "Share one win.",
      "Ask for support on one option.",
      "Celebrate one person who owned an option."
    ],
    prompts: ["My win is...", "The support I am asking for is..."]
  },
  "Confidence Evidence Vault": {
    sections: [
      "Track small moments of courage, visibility, follow-through, and self-trust.",
      "Turn each piece of evidence into an identity statement.",
      "Review the vault before taking a brave next step."
    ],
    prompts: ["Evidence I created today is...", "This proves I am becoming...", "The next brave action is..."]
  },
  "Relationship Boundary Builder": {
    sections: [
      "Separate the feeling, the need, and the request.",
      "Write the boundary with kindness and clarity.",
      "Choose the action that protects peace without abandoning connection."
    ],
    prompts: ["The truth I need to honor is...", "The boundary/request is...", "I can say this with kindness by..."]
  },
  "Lifestyle Reset Menu": {
    sections: [
      "Choose one life area: body, home, schedule, family, energy, or peace.",
      "Pick one reset that can happen in 15 minutes.",
      "Record how the reset changed your state."
    ],
    prompts: ["The life area asking for care is...", "A 15-minute reset could be...", "After the reset, I feel..."]
  },
  "Business Follow-Up Scripts": {
    sections: [
      "Choose an invitation or follow-up that feels clean.",
      "Make the message short, kind, and easy to respond to.",
      "Track the action as evidence, not as a verdict on your worth."
    ],
    prompts: ["The person I can follow up with is...", "The message can say...", "After I send it, I will remember..."]
  },
  "Future Self Decision Guide": {
    sections: [
      "Write the decision in front of you.",
      "Filter it through peace, freedom, health, family, self-respect, and future identity.",
      "Choose the next step that creates the cleanest evidence."
    ],
    prompts: ["The decision is...", "Future self would choose this because...", "The next aligned action is..."]
  },
  "Money Mindset Reframe Sheet": {
    sections: [
      "Name the money pressure story without judging it.",
      "Ask what option, stewardship, or aligned receiving is available.",
      "Choose one money action that creates clarity or peace."
    ],
    prompts: ["The pressure story is...", "The reframe I can practice is...", "One money action I can take is..."]
  }
};

const coachOptions = [
  {
    id: "maya",
    name: "Maya",
    identity: "Female coach",
    image: "assets/coach-maya.png",
    voice: "warm, nurturing, and emotionally grounding",
    signature: "Maya helps the person feel safe, seen, and steady before choosing their next honest option.",
    background:
      "Best for someone who wants a gentle but honest coach. Maya is supportive, emotionally aware, and helps people calm the noise before choosing their next step."
  },
  {
    id: "elena",
    name: "Elena",
    identity: "Female coach",
    image: "assets/coach-elena.png",
    voice: "intuitive, visionary, and future-self focused",
    signature: "Elena helps the person connect to desire, manifestation, identity, and aligned expansion.",
    background:
      "Best for someone who loves vision work, manifestation, journaling, and identity shifts. Elena helps the person connect with future self energy before they act."
  },
  {
    id: "marcus",
    name: "Marcus",
    identity: "Male coach",
    image: "assets/coach-marcus.png",
    voice: "steady, practical, and accountability-oriented",
    signature: "Marcus helps turn clarity into structure, daily evidence, and simple next steps.",
    background:
      "Best for someone who wants calm structure, accountability, and clear action. Marcus helps turn big goals into simple moves without pressure or overwhelm."
  },
  {
    id: "noah",
    name: "Noah",
    identity: "Male coach",
    image: "assets/coach-noah.png",
    voice: "strategic, encouraging, and purpose-driven",
    signature: "Noah helps the person connect life, business, purpose, and leadership into one grounded plan.",
    background:
      "Best for someone who wants a confident strategy coach. Noah is encouraging, direct, and helps people build their life and business without losing their purpose."
  }
];

let state = clone(starterState);
let firebaseEnabled = false;
let cloudUser = null;
let authReady = false;
let publicSettings = {};
const app = document.querySelector("#app");
const PRIVACY_VERSION = 2;

function userStateKey(uid) {
  return `oyoCoachState:${uid}`;
}

function loadStateForUser(uid) {
  try {
    const saved = localStorage.getItem(userStateKey(uid));
    if (!saved) return clone(starterState);
    const parsed = JSON.parse(saved);
    if (!isTrustedPrivateState(parsed, uid)) return clone(starterState);
    return normalizeState({ ...clone(starterState), ...parsed });
  } catch (error) {
    localStorage.removeItem(userStateKey(uid));
    return clone(starterState);
  }
}

function saveState() {
  updateGrowthProfile();
  if (firebaseEnabled && cloudUser && state.user) {
    const privateState = privateStateForSave(state);
    localStorage.setItem(userStateKey(cloudUser.uid), JSON.stringify(privateState));
    saveCloudState(cloudUser.uid, privateState).catch((error) => showNotice(error.message));
  }
}

function privateStateForSave(sourceState) {
  const privateState = clone(sourceState);
  privateState.community = clone(starterState.community);
  privateState.privacyVersion = PRIVACY_VERSION;
  privateState.dataOwnerUid = cloudUser?.uid || sourceState.user?.uid || "";
  privateState.dataOwnerEmail = normalizeEmail(cloudUser?.email || sourceState.user?.email || "");
  return privateState;
}

function isTrustedPrivateState(savedState, uid) {
  return Boolean(
    savedState &&
      savedState.privacyVersion === PRIVACY_VERSION &&
      savedState.dataOwnerUid === uid
  );
}

function normalizeState(nextState) {
  nextState.onboarding = {
    ...clone(starterState.onboarding),
    ...(nextState.onboarding || {})
  };
  if (!Array.isArray(nextState.onboarding.lifeAreas)) {
    nextState.onboarding.lifeAreas = clone(starterState.onboarding.lifeAreas);
  }
  nextState.coachProfile = {
    ...clone(starterState.coachProfile),
    ...(nextState.coachProfile || {})
  };
  applyCoachChoice(nextState.coachProfile.coachId || nextState.coachProfile.coachName, nextState.coachProfile);
  if (nextState.coachProfile.focus === "Future self and income-building") {
    nextState.coachProfile.focus = "Whole-life alignment and future self";
  }
  if (nextState.coachProfile.resistance === "Overthinking before the next brave action") {
    nextState.coachProfile.resistance = "Overthinking before the next honest step";
  }
  nextState.coachProfile.evidenceLog =
    nextState.coachProfile.evidenceLog || clone(starterState.coachProfile.evidenceLog);
  nextState.coachProfile.evidenceLog = nextState.coachProfile.evidenceLog.map((item) =>
    item === "Completed one business-building block" ? "Completed one aligned life action" : item
  );
  nextState.coachProfile.milestones =
    nextState.coachProfile.milestones || clone(starterState.coachProfile.milestones);
  nextState.vision = (nextState.vision || starterState.vision).map((item) =>
    item === "A flexible business that supports my life"
      ? "A life that feels peaceful, free, and fully mine"
      : item
  );
  nextState.journal = Array.isArray(nextState.journal) ? nextState.journal : clone(starterState.journal);
  nextState.notes = Array.isArray(nextState.notes) ? nextState.notes : clone(starterState.notes);
  nextState.gratitude = Array.isArray(nextState.gratitude) ? nextState.gratitude : clone(starterState.gratitude);
  nextState.actions = (nextState.actions || starterState.actions).map((action) => ({
    ...action,
    text:
      action.text === "Complete one business-building block"
        ? "Complete one aligned life action"
        : action.text
  }));
  nextState.goals = (nextState.goals || starterState.goals).map((goal) =>
    goal.title === "Grow recurring income"
      ? { ...goal, title: "Create more peace and freedom", area: "Life" }
      : goal
  );
  nextState.activeExercise = Number.isInteger(nextState.activeExercise) ? nextState.activeExercise : 0;
  nextState.activeResource = Number.isInteger(nextState.activeResource) ? nextState.activeResource : 0;
  nextState.activeCommunityCategory = communityCategories.includes(nextState.activeCommunityCategory)
    ? nextState.activeCommunityCategory
    : "All";
  return nextState;
}

function todayCard() {
  const availableCards = canAccessPremium() ? cards : cards.filter((card) => card.tier === "Free");
  const index = (new Date().getDate() + (state.cardShift || 0)) % availableCards.length;
  return availableCards[index];
}

function render() {
  app.innerHTML = state.user ? renderApp() : renderLogin();
  bindEvents();
  scrollChatToBottom();
}

function renderLoading(message = "Loading OYO Compass...") {
  app.innerHTML = `
    <main class="login-page">
      <section class="hero-panel">
        <div class="brand-lockup">
          <p class="brand-kicker">OYO · Responsibility · Family · Freedom</p>
          <h1><span class="brand-name">Own Your Options</span><span class="script-word">Coaching</span></h1>
          <p>${escapeHtml(message)}</p>
        </div>
      </section>
      <section class="login-card" aria-label="Loading">
        <div>
          <p class="eyebrow">OYO Compass</p>
          <h2>Getting your compass ready.</h2>
          <p class="notice">${escapeHtml(message)}</p>
        </div>
        <p class="login-copyright">© 2026 Own Your Options™. All rights reserved.</p>
      </section>
    </main>
  `;
}

function renderLogin() {
  const setupRequired = !firebaseEnabled;
  return `
    <main class="login-page">
      <section class="hero-panel">
        <div class="brand-lockup">
          <p class="brand-kicker">OYO · Responsibility · Family · Freedom</p>
          <h1><span class="brand-name">Own Your Options</span><span class="script-word">Coaching</span></h1>
          <p>An AI-guided OYO coaching home for life, self-trust, future self work, wellbeing, relationships, purpose, gratitude, daily action, and creating more options.</p>
        </div>
      </section>
      <section class="login-card" aria-label="Sign in">
        <div>
          <p class="eyebrow">OYO Compass</p>
          <h2>Step into Own Your Options.</h2>
          <p>${firebaseEnabled ? "Sign in to save your private OYO coach memory, journal, goals, and actions to your own account." : "Firebase must be connected before this app can be used live."}</p>
        </div>
        <label class="field">
          <span>Name</span>
          <input id="loginName" autocomplete="name" placeholder="April" />
        </label>
        <label class="field">
          <span>Email</span>
          <input id="loginEmail" type="email" autocomplete="email" placeholder="you@example.com" />
        </label>
        <label class="field">
          <span>Password</span>
          <input id="loginPassword" type="password" autocomplete="current-password" placeholder="At least 6 characters" />
        </label>
        <p class="notice" id="notice">${firebaseEnabled ? "Your data will be private to your login." : "Live mode is locked until your Firebase config is pasted into firebase-config.js."}</p>
        ${renderWellnessDisclaimer()}
        <div class="button-row">
          <button class="btn primary" id="loginBtn" ${setupRequired ? "disabled" : ""}>Sign In</button>
          <button class="btn" id="createAccountBtn" ${setupRequired ? "disabled" : ""}>Create Account</button>
          <button class="btn ghost" id="resetPasswordBtn" ${setupRequired ? "disabled" : ""}>Reset Password</button>
        </div>
        <p class="login-copyright">© 2026 Own Your Options™. All rights reserved.</p>
      </section>
    </main>
  `;
}

function renderApp() {
  const premiumAccess = canAccessPremium();
  const views = [
    ["dashboard", "Dashboard"],
    ["coach", "AI Coach"],
    ["growth", "Growth Memory"],
    ["future", "Future Self"],
    ["vision", "Vision + Journal"],
    ["notes", "Daily Notes"],
    ["cards", "Daily Cards"],
    ["exercises", "Exercises"],
    ["goals", "Goals"],
    ["business", "Life + Business"],
    ["library", "Library"],
    ["community", "Community"]
  ];
  if (isAdmin()) views.push(["admin", "Admin"]);

  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="logo"><span class="logo-mark">OYO</span><span>Own Your Options</span></div>
        <nav class="nav" aria-label="Primary">
          ${views
            .map(
              ([id, label]) =>
                `<button data-view="${id}" class="${state.activeView === id ? "active" : ""}">${label}</button>`
            )
            .join("")}
        </nav>
        <div class="account">
          <span class="avatar">${escapeHtml(state.user.name.slice(0, 1).toUpperCase())}</span>
          <span class="plan-pill ${premiumAccess ? "premium" : ""}">${premiumAccess ? "Premium" : "Free"}</span>
          ${isAdmin() ? `<button class="btn small primary" data-view="admin">Admin</button>` : ""}
          <button class="btn small ghost" id="logoutBtn">Log out</button>
        </div>
      </header>
      <main class="workspace">${renderView()}</main>
      ${renderCopyright()}
    </div>
  `;
}

function renderCopyright() {
  return `
    <footer class="app-footer">
      <span>© 2026 Own Your Options™. All rights reserved.</span>
      <span>OYO Compass is part of Own Your Options™.</span>
      <span>Coaching support only; not a replacement for mental health or medical care.</span>
    </footer>
  `;
}

function renderWellnessDisclaimer() {
  return `
    <div class="wellness-disclaimer" role="note">
      <strong>Wellness disclaimer:</strong>
      OYO Compass provides coaching, reflection, education, and personal growth support. It does not replace a psychologist, psychiatrist, therapist, counsellor, doctor, medical provider, legal advisor, financial advisor, diagnosis, treatment, or emergency support. If you are in crisis, feel unsafe, or may harm yourself or someone else, contact emergency services or a qualified crisis/mental-health professional right away.
    </div>
  `;
}

function renderView() {
  if (!state.onboarding?.completed) return renderOnboarding();
  const map = {
    dashboard: renderDashboard,
    coach: renderCoach,
    growth: renderGrowth,
    future: renderFuture,
    vision: renderVisionJournal,
    notes: renderDailyNotes,
    cards: renderCards,
    exercises: renderExercises,
    goals: renderGoals,
    business: renderBusiness,
    library: renderLibrary,
    community: renderCommunity,
    admin: renderAdmin
  };
  if (state.activeView === "admin" && !isAdmin()) return renderAdminLocked();
  return (map[state.activeView] || renderDashboard)();
}

function renderOnboarding() {
  const onboarding = state.onboarding || starterState.onboarding;
  const selectedAreas = new Set(onboarding.lifeAreas || []);
  const areas = ["Self-trust", "Peace", "Confidence", "Health", "Relationships", "Home", "Purpose", "Money", "Business", "Freedom"];
  return `
    <section class="onboarding-hero">
      <div>
        <p class="eyebrow">Personal Compass Setup</p>
        <h2>Let your coach learn you first.</h2>
        <p class="muted">These answers stay private to this person's account and help the built-in OYO coach personalize responses from the very beginning.</p>
      </div>
      <span class="tag">Takes 2 minutes</span>
    </section>
    <section class="module-grid two onboarding-grid">
      <div class="module">
        <label class="field"><span>What do you want this app to support most right now?</span><select id="introPrimaryPath">
          ${["Whole life", "Future self", "Confidence", "Relationships", "Wellbeing", "Business", "Money mindset", "Purpose"].map((option) => `<option ${option === onboarding.primaryPath ? "selected" : ""}>${option}</option>`).join("")}
        </select></label>
        <label class="field"><span>How do you want to feel more often?</span><input id="introDesiredFeeling" value="${escapeHtml(onboarding.desiredFeeling)}" placeholder="Peaceful, confident, free, supported..." /></label>
        <label class="field"><span>What feels hardest right now?</span><textarea id="introChallenge" placeholder="Tell your coach what you are moving through.">${escapeHtml(onboarding.currentChallenge)}</textarea></label>
        <label class="field"><span>What is one goal you want support with?</span><input id="introGoal" value="${escapeHtml(onboarding.biggestGoal)}" placeholder="A life, confidence, health, relationship, money, or business goal" /></label>
      </div>
      <div class="module accent">
        <label class="field"><span>How should your coach speak to you?</span><select id="introSupportStyle">
          ${["Warm and practical", "Gentle and nurturing", "Direct and accountable", "Visionary and future-self focused", "Strategic and business-minded"].map((option) => `<option ${option === onboarding.supportStyle ? "selected" : ""}>${option}</option>`).join("")}
        </select></label>
        <label class="field"><span>Is business or LWA part of your current path?</span><select id="introBusinessInterest">
          ${["Yes, I am building income now", "I am curious", "Maybe later", "No, I want life coaching first"].map((option) => `<option ${option === onboarding.businessInterest ? "selected" : ""}>${option}</option>`).join("")}
        </select></label>
        <div class="field">
          <span>Choose the life areas your coach should remember</span>
          <div class="choice-grid">
            ${areas.map((area) => `<label class="choice-pill"><input type="checkbox" value="${escapeHtml(area)}" data-intro-area ${selectedAreas.has(area) ? "checked" : ""} />${escapeHtml(area)}</label>`).join("")}
          </div>
        </div>
        <div class="button-row">
          <button class="btn primary" id="saveOnboarding">Start My Compass</button>
          <button class="btn ghost" id="skipOnboarding">Skip For Now</button>
        </div>
      </div>
    </section>
  `;
}

function renderDashboard() {
  const done = state.actions.filter((action) => action.done).length;
  const growth = growthInsights();
  const coach = selectedCoach();
  return `
    <section class="dashboard-hero">
      <div class="welcome">
        <div class="personal-greeting">
          <img class="coach-avatar large" src="${escapeHtml(coach.image)}" alt="${escapeHtml(coach.name)} coach portrait" />
          <div>
            <p class="eyebrow">Hello, ${escapeHtml(state.user.name)}</p>
            <h1>This is your OYO Compass.</h1>
            <p>${escapeHtml(coach.name)} is here with you today: ${escapeHtml(coach.signature)}</p>
          </div>
        </div>
        <p>${escapeHtml(state.futureSelf)}</p>
        <div class="button-row">
          <button class="btn coral" data-view="coach">Start Coaching</button>
          <button class="btn" data-view="growth">Life Compass</button>
        </div>
      </div>
      <aside class="today-card">
        <div>
          <span class="card-label">Daily Manifestation Card</span>
          <div class="manifestation-card">
            <strong>${escapeHtml(todayCard().title)}</strong>
            <span>${escapeHtml(todayCard().prompt)}</span>
          </div>
        </div>
        <button class="btn primary" data-view="cards">Open Daily Practice</button>
      </aside>
    </section>
    <section class="stats-grid">
      <div class="stat"><span class="card-label">Actions</span><strong>${done}/${state.actions.length}</strong><span class="muted">completed today</span></div>
      <div class="stat"><span class="card-label">Goals</span><strong>${state.goals.length}</strong><span class="muted">active outcomes</span></div>
      <div class="stat"><span class="card-label">Gratitude</span><strong>${state.gratitude.length}</strong><span class="muted">anchors saved</span></div>
      <div class="stat"><span class="card-label">Growth Stage</span><strong>${escapeHtml(growth.stage)}</strong><span class="muted">${escapeHtml(growth.nextStep)}</span></div>
    </section>
    <section class="module-grid two">
      <div class="module">
        <div class="section-title"><h2>Today’s Actions</h2><button class="btn small" data-view="goals">Manage</button></div>
        ${renderActionList()}
      </div>
      <div class="module accent">
        <div class="section-title"><h2>OYO Growth Path</h2><button class="btn small" data-view="growth">Memory</button></div>
        <div class="list">
          <div class="item"><span class="tag">Now</span><strong>${escapeHtml(growth.focus)}</strong><p class="muted">The coach uses this focus when suggesting actions and reframes.</p></div>
          <div class="item"><span class="tag premium">Pattern</span><strong>${escapeHtml(growth.pattern)}</strong><p class="muted">This updates as the person journals, completes actions, and asks for coaching.</p></div>
        </div>
      </div>
    </section>
  `;
}

function renderCoach() {
  const growth = growthInsights();
  const premiumAccess = canAccessPremium();
  const coach = selectedCoach();
  return `
    <section class="section-title">
      <div class="coach-heading">
        <img class="coach-avatar" src="${escapeHtml(coach.image)}" alt="${escapeHtml(coach.name)} coach portrait" />
        <div><p class="eyebrow">OYO Compass AI</p><h2>${escapeHtml(coach.name)} grows with ${escapeHtml(state.user.name)}.</h2><p>${escapeHtml(coach.identity)} · ${escapeHtml(coach.voice)}. Current memory: ${escapeHtml(growth.stage)} stage, focused on ${escapeHtml(growth.focus.toLowerCase())}.</p></div>
      </div>
      ${premiumAccess ? `<span class="tag premium">Premium depth unlocked</span>` : renderPremiumButton("Unlock premium coaching")}
    </section>
    <section class="memory-strip">
      <div><span class="card-label">${escapeHtml(coach.name)} Memory</span><strong>${escapeHtml(growth.pattern)}</strong></div>
      <div><span class="card-label">Next Best Step</span><strong>${escapeHtml(growth.nextStep)}</strong></div>
      <button class="btn small" data-view="growth">View Growth Memory</button>
    </section>
    ${renderWellnessDisclaimer()}
    <section class="module coach-module">
      <div class="chat" id="chatLog">
        ${state.coachMessages
          .map((message) => `<div class="bubble ${message.role}">${escapeHtml(message.text)}</div>`)
          .join("")}
      </div>
      <div class="coach-input">
        <input id="coachText" placeholder="Talk to your coach. Ask anything about what you are feeling, choosing, building, or moving through..." />
        <button class="btn primary" id="coachSend">Send</button>
      </div>
      <div class="quick-prompts" aria-label="Coach question prompts">
        <button class="btn small" type="button" data-coach-prompt="What should my next step be today?">Next step</button>
        <button class="btn small" type="button" data-coach-prompt="How do I move through feeling stuck?">Stuck</button>
        <button class="btn small" type="button" data-coach-prompt="How can I build confidence right now?">Confidence</button>
        <button class="btn small" type="button" data-coach-prompt="What business action should I take without losing my peace?">Business</button>
        <button class="btn small" type="button" data-coach-prompt="Help me decide what option to choose.">Decide</button>
        <button class="btn small" type="button" data-coach-prompt="What do I say in this situation?">Words</button>
      </div>
    </section>
  `;
}

function renderGrowth() {
  const growth = growthInsights();
  const coach = selectedCoach();
  return `
    <section class="section-title">
      <div><p class="eyebrow">Growth Memory</p><h2>The app learns the person over time.</h2><p>This is the living OYO profile the coach uses to personalize prompts, reframes, and action steps.</p></div>
      <div class="button-row">
        <button class="btn" id="retakeOnboarding">Retake Setup</button>
        <button class="btn primary" id="saveGrowth">Save Memory</button>
      </div>
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Living Coach Profile</h2>
        <label class="field"><span>Choose coach</span><select id="profileCoach">${coachOptions
          .map(
            (option) =>
              `<option value="${option.id}" ${option.id === coach.id ? "selected" : ""}>${option.name} - ${option.identity}</option>`
          )
          .join("")}</select></label>
        <div class="coach-card selected">
          <img class="coach-avatar" src="${escapeHtml(coach.image)}" alt="${escapeHtml(coach.name)} coach portrait" />
          <div><span class="tag">Selected Coach</span><strong>${escapeHtml(coach.name)} · ${escapeHtml(coach.identity)}</strong><p class="muted">${escapeHtml(coach.signature)}</p><p class="muted">${escapeHtml(coach.background)}</p></div>
        </div>
        <div class="list">${coachOptions
          .map(
            (option) => `
              <div class="coach-card">
                <img class="coach-avatar" src="${escapeHtml(option.image)}" alt="${escapeHtml(option.name)} coach portrait" />
                <div>
                  <span class="tag ${option.id === coach.id ? "premium" : ""}">${option.id === coach.id ? "Selected" : option.identity}</span>
                  <strong>${escapeHtml(option.name)}</strong>
                  <p class="muted">${escapeHtml(option.voice)}</p>
                  <p class="muted">${escapeHtml(option.background)}</p>
                </div>
              </div>`
          )
          .join("")}</div>
        <label class="field"><span>Main focus</span><input id="profileFocus" value="${escapeHtml(state.coachProfile.focus)}" /></label>
        <label class="field"><span>Current resistance</span><input id="profileResistance" value="${escapeHtml(state.coachProfile.resistance)}" /></label>
        <label class="field"><span>Preferred coaching style</span><input id="profileStyle" value="${escapeHtml(state.coachProfile.preferredStyle)}" /></label>
      </div>
      <div class="module accent">
        <h2>Coach Insight</h2>
        <div class="growth-meter" aria-label="Growth score">
          <span style="width: ${growth.score}%"></span>
        </div>
        <div class="list">
          <div class="item"><span class="tag">Stage</span><strong>${escapeHtml(growth.stage)}</strong><p class="muted">${escapeHtml(growth.stageNote)}</p></div>
          <div class="item"><span class="tag">Pattern</span><strong>${escapeHtml(growth.pattern)}</strong></div>
          <div class="item"><span class="tag premium">Next</span><strong>${escapeHtml(growth.nextStep)}</strong></div>
        </div>
      </div>
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Evidence Log</h2>
        <div class="list">
          ${state.coachProfile.evidenceLog
            .map((item) => `<div class="item"><span class="tag">Evidence</span>${escapeHtml(item)}</div>`)
            .join("")}
        </div>
      </div>
      <div class="module">
        <h2>Milestones</h2>
        <div class="timeline">
          ${state.coachProfile.milestones
            .map((milestone) => `<div class="timeline-item"><span>${escapeHtml(milestone.date)}</span><strong>${escapeHtml(milestone.label)}</strong></div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderFuture() {
  return `
    <section class="section-title">
      <div><p class="eyebrow">Future Self</p><h2>Write the identity before the result arrives.</h2><p>Your coach uses this as a north star for actions, reframes, and goals.</p></div>
    </section>
    <section class="module-grid two">
      <div class="module">
        <label class="field">
          <span>Future self statement</span>
          <textarea id="futureSelfText">${escapeHtml(state.futureSelf)}</textarea>
        </label>
        <button class="btn primary" id="saveFuture">Save Future Self</button>
      </div>
      <div class="module accent">
        <h2>Future Self Prompts</h2>
        <div class="list">
          <div class="item">What does she no longer negotiate with?</div>
          <div class="item">What option does she choose when fear gets loud?</div>
          <div class="item">What standard is she practicing this week?</div>
        </div>
      </div>
    </section>
  `;
}

function renderVisionJournal() {
  return `
    <section class="section-title">
      <div><p class="eyebrow">Vision Board + Journal</p><h2>See it, script it, act from it.</h2></div>
      <button class="btn primary" id="addVision">Add Vision Tile</button>
    </section>
    <section class="vision-grid">
      ${state.vision.map((item) => `<div class="vision-tile"><strong>${escapeHtml(item)}</strong></div>`).join("")}
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Journal</h2>
        <label class="field"><span>Title</span><input id="journalTitle" placeholder="Today I am choosing..." /></label>
        <label class="field"><span>Entry</span><textarea id="journalBody" placeholder="Write what future you needs to hear."></textarea></label>
        <button class="btn primary" id="addJournal">Save Entry</button>
      </div>
      <div class="module">
        <h2>Recent Entries</h2>
        <div class="list">
          ${state.journal
            .map((entry) => `<div class="item"><span class="tag">${escapeHtml(entry.date)}</span><strong>${escapeHtml(entry.title)}</strong><p class="muted">${escapeHtml(entry.body)}</p></div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderDailyNotes() {
  return `
    <section class="section-title">
      <div><p class="eyebrow">Daily Notes</p><h2>Keep the day inside the app.</h2><p>Capture thoughts, reminders, ideas, wins, or what you want your coach to remember today.</p></div>
      <span class="tag">Private</span>
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Today’s Note</h2>
        <label class="field"><span>Title</span><input id="noteTitle" placeholder="What is this note about?" /></label>
        <label class="field"><span>Note</span><textarea id="noteBody" placeholder="Write anything you want to keep in OYO Compass today."></textarea></label>
        <button class="btn primary" id="addDailyNote">Save Note</button>
      </div>
      <div class="module accent">
        <h2>Recent Notes</h2>
        <div class="list">
          ${(state.notes || [])
            .map((note) => `<div class="item"><span class="tag">${escapeHtml(note.date)}</span><strong>${escapeHtml(note.title)}</strong><p class="muted">${escapeHtml(note.body)}</p></div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCards() {
  const activeCard = todayCard();
  const premiumAccess = canAccessPremium();
  return `
    <section class="section-title">
      <div><p class="eyebrow">Daily Manifestation</p><h2>Pull the card, choose the evidence.</h2></div>
      <div class="button-row">
        ${premiumAccess ? `<span class="tag premium">Premium card vault open</span>` : renderPremiumButton("Unlock Card Vault")}
        <button class="btn primary" id="newCard" type="button">Pull New Card</button>
      </div>
    </section>
    <section class="module accent">
      <span class="tag ${activeCard.tier === "Premium" ? "premium" : ""}">Pulled Card</span>
      <h2>${escapeHtml(activeCard.title)}</h2>
      <p class="muted">${escapeHtml(activeCard.prompt)}</p>
      <button class="btn small" id="newCardAlt" type="button">Pull Another Card</button>
    </section>
    <section class="module-grid">
      ${cards
        .map(
          (card) =>
            card.tier === "Premium" && !premiumAccess
              ? renderLockedCard(card.title, "Premium manifestation card")
              : `
          <div class="prompt-card item">
            <span class="tag ${card.tier === "Premium" ? "premium" : ""}">${card.title === activeCard.title ? "Today" : card.tier}</span>
            <strong>${escapeHtml(card.title)}</strong>
            <p class="muted">${escapeHtml(card.prompt)}</p>
          </div>`
        )
        .join("")}
    </section>
    <section class="module">
      <h2>Gratitude</h2>
      <div class="coach-input">
        <input id="gratitudeText" placeholder="I am grateful for..." />
        <button class="btn primary" id="addGratitude">Add</button>
      </div>
      <div class="list">${state.gratitude.map((item) => `<div class="item">${escapeHtml(item)}</div>`).join("")}</div>
    </section>
  `;
}

function renderExercises() {
  const premiumAccess = canAccessPremium();
  const activeExercise = getActiveExercise(premiumAccess);
  const details = exerciseDetails[activeExercise.title] || {};
  return `
    <section class="section-title">
      <div><p class="eyebrow">NLP Inspired Exercises</p><h2>Shift the pattern, then move.</h2></div>
      ${premiumAccess ? `<span class="tag premium">All exercises available</span>` : renderPremiumButton("Unlock Premium")}
    </section>
    <section class="module-grid two">
      <div class="module practice-detail">
        <div class="item-header"><div><span class="tag ${activeExercise.tier === "Premium" ? "premium" : ""}">${escapeHtml(activeExercise.tier)}</span><h2>${escapeHtml(activeExercise.title)}</h2></div><span class="muted">${escapeHtml(details.time || "Practice")}</span></div>
        <p class="muted">${escapeHtml(activeExercise.body)}</p>
        <div class="steps-list">
          ${(details.steps || []).map((step, index) => `<div class="step"><span>${index + 1}</span><p>${escapeHtml(step)}</p></div>`).join("")}
        </div>
        <div class="prompt-box">
          <strong>Journal Prompts</strong>
          ${(details.prompts || []).map((prompt) => `<p>${escapeHtml(prompt)}</p>`).join("")}
        </div>
        <button class="btn primary" data-add-exercise="${escapeHtml(activeExercise.title)}">Add To My Actions</button>
      </div>
      <div class="module">
        <h2>Exercise Library</h2>
        <div class="list">
      ${nlpExercises
        .map((exercise, index) =>
          exercise.tier === "Premium" && !premiumAccess
            ? renderLockedCard(exercise.title, "Premium exercise")
            : `<div class="item"><div class="button-row"><span class="tag ${exercise.tier === "Premium" ? "premium" : ""}">${exercise.tier}</span><span class="tag">${escapeHtml(exercise.category || "Practice")}</span></div><strong>${escapeHtml(exercise.title)}</strong><p class="muted">${escapeHtml(exercise.body)}</p><button class="btn small" data-exercise-index="${index}">Open Exercise</button></div>`
        )
        .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderGoals() {
  return `
    <section class="section-title">
      <div><p class="eyebrow">Goals + Daily Actions</p><h2>Turn intention into evidence.</h2></div>
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Daily Actions</h2>
        <div class="coach-input">
          <input id="actionText" placeholder="Add one clear next action" />
          <button class="btn primary" id="addAction">Add</button>
        </div>
        ${renderActionList()}
      </div>
      <div class="module">
        <h2>Goals</h2>
        <div class="coach-input">
          <input id="goalText" placeholder="Add a life goal" />
          <button class="btn primary" id="addGoal">Add Goal</button>
        </div>
        <div class="list">
          ${state.goals
            .map(
              (goal) => `
            <div class="item">
              <div class="item-header"><strong>${escapeHtml(goal.title)}</strong><span class="tag">${escapeHtml(goal.area)}</span></div>
              <progress value="${goal.progress}" max="100"></progress>
              <span class="muted">${goal.progress}% embodied</span>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderBusiness() {
  const lwaLink = getEffectiveLink("lwa");
  const premiumAccess = canAccessPremium();
  return `
    <section class="section-title">
      <div><p class="eyebrow">Life + Business Builder</p><h2>Build a life that your work can support.</h2><p>Business is one option inside the bigger OYO Compass: peace, family, health, purpose, freedom, income, and aligned action.</p></div>
      ${premiumAccess ? `<span class="tag premium">Premium life path</span>` : renderPremiumButton("Unlock Builder")}
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Whole-Life Path</h2>
        <div class="list">
          <div class="item"><span class="tag">Step 1</span><strong>Clarify the life you want</strong><p class="muted">What do you want more of: peace, freedom, health, love, confidence, purpose, time, or income?</p></div>
          <div class="item"><span class="tag">Step 2</span><strong>Choose one aligned option</strong><p class="muted">Take a step that supports your nervous system, relationships, wellbeing, and future self.</p></div>
          ${premiumAccess ? `<div class="item"><span class="tag premium">LWA</span><strong>Explore the LWA pathway</strong><p class="muted">Use the premium pathway only when business-building supports the life you are choosing.</p>${lwaLink ? `<a class="btn primary" href="${escapeHtml(lwaLink)}" target="_blank" rel="noopener">Open LWA Link</a>` : `<p class="muted">Add your LWA link in Admin > Premium Controls.</p>`}</div>` : renderLockedCard("LWA pathway", "Premium life and business resource")}
        </div>
      </div>
      <div class="module accent">
        <h2>Today’s Life Compass Prompt</h2>
        <p class="muted">What part of your life needs the most honest option today: your peace, body, home, relationships, money, purpose, or future self?</p>
        <button class="btn primary" data-view="coach">Coach Me Through It</button>
      </div>
    </section>
  `;
}

function renderLibrary() {
  const premiumAccess = canAccessPremium();
  const activeResource = getActiveResource(premiumAccess);
  const details = resourceDetails[activeResource.title] || {};
  return `
    <section class="section-title">
      <div><p class="eyebrow">Resource Library</p><h2>Everything has a home.</h2></div>
      ${premiumAccess ? `<span class="tag premium">Premium library open</span>` : renderPremiumButton("Upgrade")}
    </section>
    <section class="module-grid two">
      <div class="module practice-detail">
        <div class="item-header"><div><span class="tag ${activeResource.tier === "Premium" ? "premium" : ""}">${escapeHtml(activeResource.tier)}</span><h2>${escapeHtml(activeResource.title)}</h2></div><span class="muted">${escapeHtml(activeResource.type)}</span></div>
        <p class="muted">${escapeHtml(activeResource.detail)}</p>
        <div class="steps-list">
          ${(details.sections || []).map((section, index) => `<div class="step"><span>${index + 1}</span><p>${escapeHtml(section)}</p></div>`).join("")}
        </div>
        <div class="prompt-box">
          <strong>Use This Resource</strong>
          ${(details.prompts || []).map((prompt) => `<p>${escapeHtml(prompt)}</p>`).join("")}
        </div>
        <button class="btn primary" data-add-resource="${escapeHtml(activeResource.title)}">Add Resource To Actions</button>
      </div>
      <div class="module">
        <h2>Resource Shelf</h2>
        <div class="list">
      ${resources
        .map((resource, index) =>
          resource.tier === "Premium" && !premiumAccess
            ? renderLockedCard(resource.title, resource.type)
            : `<div class="item"><div class="button-row"><span class="tag ${resource.tier === "Premium" ? "premium" : ""}">${resource.tier}</span><span class="tag">${escapeHtml(resource.type)}</span></div><strong>${escapeHtml(resource.title)}</strong><p class="muted">${escapeHtml(resource.detail)}</p><button class="btn small" data-resource-index="${index}">Open Resource</button></div>`
        )
        .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCommunity() {
  const premiumAccess = canAccessPremium();
  const activeCategory = communityCategories.includes(state.activeCommunityCategory)
    ? state.activeCommunityCategory
    : "All";
  const posts = (state.community || []).filter(
    (post) => activeCategory === "All" || post.topic === activeCategory
  );
  return `
    <section class="section-title">
      <div><p class="eyebrow">Community</p><h2>A built-in circle for owned options.</h2><p>Share questions, wins, lifestyle moments, goals, gratitude, support, and business growth inside one OYO space.</p></div>
      ${premiumAccess ? `<span class="tag premium">Posting enabled</span>` : renderPremiumButton("Unlock full community")}
    </section>
    <section class="community-categories" aria-label="Community categories">
      ${communityCategories
        .map(
          (category) =>
            `<button class="btn small ${category === activeCategory ? "primary" : ""}" type="button" data-community-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
        )
        .join("")}
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Share With The Circle</h2>
        ${
          premiumAccess
            ? `<label class="field"><span>Category</span><select id="communityTopic">${communityCategories
                .filter((category) => category !== "All")
                .map((category) => `<option ${category === activeCategory ? "selected" : ""}>${escapeHtml(category)}</option>`)
                .join("")}</select></label><label class="field"><span>Post</span><textarea id="communityText" placeholder="Share a question, business win, lifestyle shift, goal, gratitude, or support request."></textarea></label><button class="btn primary" id="addPost">Post</button>`
            : `<div class="paywall"><strong>Free members can read the preview.</strong><p class="muted">Premium members can post, join circles, and access life, mindset, relationships, wellbeing, and business threads.</p>${renderPremiumButton("Upgrade")}</div>`
        }
        <div class="community-prompts">
          <div class="item"><span class="tag">Questions</span><p class="muted">What do you want support, clarity, or coaching around?</p></div>
          <div class="item"><span class="tag">Business Wins</span><p class="muted">What invitation, follow-up, sale, lead, or brave business action did you take?</p></div>
          <div class="item"><span class="tag">Lifestyle</span><p class="muted">What peaceful, healthy, free, or joyful life moment are you building this for?</p></div>
        </div>
      </div>
      <div class="module">
        <h2>${escapeHtml(activeCategory)} Feed</h2>
        <div class="list">
          ${
            posts.length
              ? posts
                  .map(
                    (post) =>
                      `<article class="community-post"><span class="tag">${escapeHtml(post.topic || "Community")}</span><strong>${escapeHtml(post.name)}</strong><p class="muted">${escapeHtml(post.text)}</p></article>`
                  )
                  .join("")
              : `<div class="item"><span class="tag">${escapeHtml(activeCategory)}</span><strong>No posts here yet.</strong><p class="muted">Be the first to open this category when premium posting is available.</p></div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="section-title">
      <div><p class="eyebrow">Admin</p><h2>Owner controls for OYO Compass.</h2><p>This area only appears for the owner email listed in Firebase config and Firestore rules.</p></div>
      <span class="tag premium">Owner only</span>
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Access Controls</h2>
        <div class="list">
          <div class="item"><span class="tag">Admin email</span><strong>${escapeHtml(state.user.email)}</strong><p class="muted">Only this configured owner email can see this Admin tab.</p></div>
          <div class="item"><span class="tag">Members</span><strong>Members can only read and write their own user record.</strong><p class="muted">Protected by Firestore rules at /users/{userId}.</p></div>
          <div class="item"><span class="tag premium">Admin data</span><strong>Only admin can read and write /admin records.</strong><p class="muted">Protected by Firestore rules using the owner email.</p></div>
          <div class="item"><span class="tag">Privacy repair</span><strong>Reset this signed-in account if old cached data appears.</strong><p class="muted">This clears private goals, journal, actions, coach memory, and vision for this signed-in account only.</p><button class="btn small" id="resetPrivateData" type="button">Reset My Private Data</button></div>
        </div>
      </div>
      <div class="module accent">
        <h2>Premium Controls</h2>
        <p class="muted">Add or update your premium payment link, LWA link, and free tester access here. Signed-in members can use the premium payment link, and premium/admin/tester users can open the premium areas.</p>
        <label class="field"><span>Premium payment link</span><input id="adminPremiumPayment" value="${escapeHtml(getEffectiveLink("premiumPayment"))}" placeholder="https://your-payment-link.com" /></label>
        <label class="field"><span>LWA link</span><input id="adminLwaLink" value="${escapeHtml(getEffectiveLink("lwa"))}" placeholder="https://your-lwa-link.com" /></label>
        <label class="field"><span>Free premium tester emails</span><textarea id="adminTesterEmails" placeholder="one tester email per line">${escapeHtml(formatEmailList(publicSettings?.premiumTesterEmails))}</textarea></label>
        <p class="muted">Add a tester's sign-in email here, then click Save. They will get premium access for free when they sign in.</p>
        <div class="button-row">
          <button class="btn primary" id="adminSaveSettings">Save Premium Settings</button>
          <button class="btn" id="adminGrantSelf">Open Premium On My Account</button>
        </div>
      </div>
    </section>
    <section class="module-grid two">
      <div class="module">
        <h2>Content Areas</h2>
        <div class="list">
          <div class="item"><span class="tag">Life</span>Future self, vision board, journal, gratitude, goals, daily actions.</div>
          <div class="item"><span class="tag">Growth</span>Coach memory, stage, pattern, milestones, evidence log.</div>
          <div class="item"><span class="tag">Community</span>Wins, support, and member circles.</div>
          <div class="item"><span class="tag premium">Business</span>LWA and income-building as one pathway inside the whole-life compass.</div>
        </div>
      </div>
      <div class="module">
        <h2>Premium Pack Preview</h2>
        <div class="list">
          <button class="item admin-preview-card" type="button" data-view="exercises" data-admin-open="exercises"><span class="tag premium">Premium</span><strong>NLP Reframe Library</strong><p class="muted">Deeper exercises for identity, belief, future pacing, and parts work.</p><span class="btn small">Open NLP Exercises</span></button>
          <button class="item admin-preview-card" type="button" data-view="cards" data-admin-open="cards"><span class="tag premium">Premium</span><strong>Manifestation Card Vault</strong><p class="muted">More daily cards, prompts, and reflection pathways.</p><span class="btn small">Open Card Vault</span></button>
          <button class="item admin-preview-card" type="button" data-view="business" data-admin-open="business"><span class="tag premium">Premium</span><strong>LWA Life + Business Pathway</strong><p class="muted">The business option inside the wider life compass. The LWA link itself can be added later.</p><span class="btn small">Open Life + Business</span></button>
          <button class="item admin-preview-card" type="button" data-view="library" data-admin-open="library"><span class="tag premium">Premium</span><strong>Resource Library</strong><p class="muted">Premium resources, prompts, planners, and guided tools.</p><span class="btn small">Open Library</span></button>
          <button class="item admin-preview-card" type="button" data-view="community" data-admin-open="community"><span class="tag premium">Premium</span><strong>Full Community</strong><p class="muted">Posting, circles, support threads, and deeper member interaction.</p><span class="btn small">Open Community</span></button>
        </div>
      </div>
      <div class="module">
        <h2>What's Inside Premium</h2>
        <div class="list">
          <div class="item"><span class="tag premium">NLP</span><strong>${nlpExercises.filter((exercise) => exercise.tier === "Premium").length} premium exercises</strong><p class="muted">${escapeHtml(nlpExercises.filter((exercise) => exercise.tier === "Premium").slice(0, 4).map((exercise) => exercise.title).join(", "))}</p></div>
          <div class="item"><span class="tag premium">Cards</span><strong>${cards.filter((card) => card.tier === "Premium").length} premium manifestation cards</strong><p class="muted">${escapeHtml(cards.filter((card) => card.tier === "Premium").map((card) => card.title).join(", "))}</p></div>
          <div class="item"><span class="tag premium">Library</span><strong>${resources.filter((resource) => resource.tier === "Premium").length} premium resources</strong><p class="muted">${escapeHtml(resources.filter((resource) => resource.tier === "Premium").slice(0, 5).map((resource) => resource.title).join(", "))}</p></div>
        </div>
      </div>
      <div class="module">
        <h2>Admin Checklist</h2>
        <div class="list">
          <div class="item">Authentication: Email/Password enabled</div>
          <div class="item">Firestore: production database created</div>
          <div class="item">Rules: owner/user privacy rules published</div>
          <div class="item">Hosting: upload latest zip to GitHub or deploy with Firebase Hosting</div>
        </div>
      </div>
    </section>
  `;
}

function renderAdminLocked() {
  return `
    <section class="module">
      <p class="eyebrow">Admin</p>
      <h2>Admin access is locked.</h2>
      <p class="muted">This area is only available to the Own Your Options owner account.</p>
      <button class="btn primary" data-view="dashboard">Return to Dashboard</button>
    </section>
  `;
}

function renderLockedCard(title, label) {
  return `<div class="paywall"><span class="tag premium">Premium</span><strong>${escapeHtml(title)}</strong><p class="muted">${escapeHtml(label)} is included in the premium Own Your Options path.</p>${renderPremiumButton("Unlock Premium")}</div>`;
}

function renderPremiumButton(label) {
  const paymentLink = getEffectiveLink("premiumPayment");
  if (paymentLink) {
    return `<a class="btn coral" href="${escapeHtml(paymentLink)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
  }
  return `<button class="btn coral premiumUnlockBtn" type="button">${escapeHtml(label)}</button>`;
}

function getActiveExercise(premiumAccess) {
  const active = nlpExercises[state.activeExercise] || nlpExercises[0];
  if (active.tier === "Premium" && !premiumAccess) return nlpExercises.find((exercise) => exercise.tier === "Free") || nlpExercises[0];
  return active;
}

function getActiveResource(premiumAccess) {
  const active = resources[state.activeResource] || resources[0];
  if (active.tier === "Premium" && !premiumAccess) return resources.find((resource) => resource.tier === "Free") || resources[0];
  return active;
}

function renderActionList() {
  return `<div class="list">${state.actions
    .map(
      (action, index) => `
      <label class="item item-header">
        <span>${escapeHtml(action.text)}</span>
        <input type="checkbox" data-action="${index}" ${action.done ? "checked" : ""} aria-label="Mark action complete" />
      </label>`
    )
    .join("")}</div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      saveState();
      render();
    });
  });

  const loginBtn = document.querySelector("#loginBtn");
  loginBtn?.addEventListener("click", () => {
    if (!firebaseEnabled) {
      showNotice("Add your Firebase config first. This live app does not allow demo access.");
      return;
    }
    handleFirebaseSignIn();
  });

  document.querySelector("#createAccountBtn")?.addEventListener("click", handleFirebaseCreateAccount);
  document.querySelector("#resetPasswordBtn")?.addEventListener("click", handlePasswordReset);

  document.querySelector("#logoutBtn")?.addEventListener("click", () => {
    if (firebaseEnabled && cloudUser) {
      signOutUser().catch((error) => showNotice(error.message));
    }
    state = clone(starterState);
    state.user = null;
    cloudUser = null;
    render();
  });

  document.querySelectorAll(".premiumUnlockBtn").forEach((button) => {
    button.addEventListener("click", () => {
      if (isAdmin()) {
        state.premium = true;
        saveState();
        render();
        return;
      }
      showAppMessage("Premium is not open on this account yet. If this person is testing for you, add their sign-in email under Admin > Free premium tester emails. If they are paying, add your payment link under Admin > Premium payment link.");
    });
  });

  document.querySelector("#saveOnboarding")?.addEventListener("click", () => {
    const lifeAreas = [...document.querySelectorAll("[data-intro-area]:checked")].map((input) => input.value);
    const primaryPath = document.querySelector("#introPrimaryPath")?.value || starterState.onboarding.primaryPath;
    const desiredFeeling = document.querySelector("#introDesiredFeeling")?.value.trim() || "more aligned";
    const currentChallenge = document.querySelector("#introChallenge")?.value.trim() || "finding the next honest step";
    const biggestGoal = document.querySelector("#introGoal")?.value.trim() || "build more self-trust";
    const supportStyle = document.querySelector("#introSupportStyle")?.value || starterState.onboarding.supportStyle;
    const businessInterest = document.querySelector("#introBusinessInterest")?.value || starterState.onboarding.businessInterest;
    state.onboarding = {
      completed: true,
      primaryPath,
      desiredFeeling,
      currentChallenge,
      biggestGoal,
      supportStyle,
      businessInterest,
      lifeAreas: lifeAreas.length ? lifeAreas : clone(starterState.onboarding.lifeAreas)
    };
    state.coachProfile.focus = `${primaryPath}: ${state.onboarding.lifeAreas.join(", ")}`;
    state.coachProfile.resistance = currentChallenge;
    state.coachProfile.preferredStyle = supportStyle;
    state.futureSelf = `I am becoming someone who feels ${desiredFeeling}. I own my options in ${state.onboarding.lifeAreas.slice(0, 3).join(", ")} and I take honest steps toward ${biggestGoal}.`;
    if (!state.goals.some((goal) => goal.title.toLowerCase() === biggestGoal.toLowerCase())) {
      state.goals.unshift({ title: biggestGoal, progress: 10, area: primaryPath });
    }
    state.coachMessages = [
      {
        role: "coach",
        text: personalizedWelcomeMessage()
      }
    ];
    addMilestone("Completed personal compass setup");
    saveState();
    render();
  });

  document.querySelector("#skipOnboarding")?.addEventListener("click", () => {
    state.onboarding = { ...clone(starterState.onboarding), completed: true };
    saveState();
    render();
  });

  document.querySelector("#adminSaveSettings")?.addEventListener("click", async () => {
    try {
      const premiumPayment = document.querySelector("#adminPremiumPayment")?.value.trim() || "";
      const lwa = document.querySelector("#adminLwaLink")?.value.trim() || "";
      const premiumTesterEmails = parseEmailList(document.querySelector("#adminTesterEmails")?.value || "");
      publicSettings = {
        ...publicSettings,
        links: { premiumPayment, lwa },
        premiumTesterEmails
      };
      await savePublicSettings(cloudUser, publicSettings);
      await saveAdminSettings(cloudUser, {
        appName: "OYO Compass",
        premiumManagedByAdmin: true,
        wholeLifeFirst: true,
        links: { premiumPayment, lwa },
        premiumTesterEmails
      });
      showAppMessage("Premium settings saved.");
      render();
    } catch (error) {
      showAppMessage(error.message);
    }
  });

  document.querySelector("#adminGrantSelf")?.addEventListener("click", () => {
    if (!isAdmin()) return showAppMessage("Admin access only.");
    state.premium = true;
    saveState();
    showAppMessage("Premium is open on your admin account. Use the Premium Pack Preview buttons below to inspect each section.");
    render();
  });

  document.querySelector("#resetPrivateData")?.addEventListener("click", async () => {
    if (!cloudUser) return showAppMessage("Sign in first.");
    const confirmed = window.confirm("Reset private app data for this signed-in account only? Community posts are not deleted.");
    if (!confirmed) return;
    const currentUser = {
      name: state.user?.name || cloudUser.displayName || cloudUser.email.split("@")[0],
      email: cloudUser.email,
      uid: cloudUser.uid
    };
    state = normalizeState(clone(starterState));
    state.user = currentUser;
    state.community = await loadCommunityPosts().catch(() => clone(starterState.community));
    await saveCloudState(cloudUser.uid, privateStateForSave(state));
    localStorage.setItem(userStateKey(cloudUser.uid), JSON.stringify(privateStateForSave(state)));
    showAppMessage("Private data reset for this signed-in account.");
    render();
  });

  document.querySelectorAll("[data-admin-open]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isAdmin()) return showAppMessage("Admin access only.");
      state.premium = true;
      state.activeView = button.dataset.adminOpen;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-exercise-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeExercise = Number(button.dataset.exerciseIndex);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-resource-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeResource = Number(button.dataset.resourceIndex);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-community-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCommunityCategory = button.dataset.communityCategory;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-add-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.dataset.addExercise;
      state.actions.unshift({ text: `Complete NLP practice: ${title}`, done: false });
      addEvidence(`Chose NLP practice: ${title}`);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-add-resource]").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.dataset.addResource;
      state.actions.unshift({ text: `Use resource: ${title}`, done: false });
      addEvidence(`Opened resource: ${title}`);
      saveState();
      render();
    });
  });

  document.querySelector("#saveFuture")?.addEventListener("click", () => {
    state.futureSelf = document.querySelector("#futureSelfText").value.trim() || state.futureSelf;
    addMilestone("Updated future self identity");
    saveState();
    render();
  });

  document.querySelector("#addVision")?.addEventListener("click", () => {
    const value = prompt("What vision are you adding?");
    if (!value) return;
    state.vision.unshift(value.trim());
    saveState();
    render();
  });

  document.querySelector("#addJournal")?.addEventListener("click", () => {
    const title = document.querySelector("#journalTitle").value.trim() || "Untitled reflection";
    const body = document.querySelector("#journalBody").value.trim();
    if (!body) return;
    state.journal.unshift({ date: "Today", title, body });
    addEvidence(`Journaled: ${title}`);
    saveState();
    render();
  });

  document.querySelector("#addDailyNote")?.addEventListener("click", () => {
    const title = document.querySelector("#noteTitle").value.trim() || "Daily note";
    const body = document.querySelector("#noteBody").value.trim();
    if (!body) return;
    state.notes.unshift({ date: todayLabel(), title, body });
    addEvidence(`Added daily note: ${title}`);
    saveState();
    render();
  });

  document.querySelector("#addGratitude")?.addEventListener("click", () => {
    const input = document.querySelector("#gratitudeText");
    if (!input.value.trim()) return;
    state.gratitude.unshift(input.value.trim());
    addEvidence(`Practiced gratitude: ${input.value.trim()}`);
    saveState();
    render();
  });

  document.querySelector("#addAction")?.addEventListener("click", () => {
    const input = document.querySelector("#actionText");
    if (!input.value.trim()) return;
    state.actions.unshift({ text: input.value.trim(), done: false });
    addMilestone("Added a new aligned action");
    saveState();
    render();
  });

  document.querySelector("#addGoal")?.addEventListener("click", () => {
    const input = document.querySelector("#goalText");
    if (!input.value.trim()) return;
    state.goals.unshift({ title: input.value.trim(), progress: 10, area: "Life" });
    addMilestone("Added a new life goal");
    saveState();
    render();
  });

  document.querySelectorAll("#newCard, #newCardAlt").forEach((button) => {
    button.addEventListener("click", () => {
      const availableCards = canAccessPremium() ? cards : cards.filter((card) => card.tier === "Free");
      state.cardShift = ((state.cardShift || 0) + 1) % availableCards.length;
      addEvidence(`Pulled card: ${todayCard().title}`);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.actions[Number(checkbox.dataset.action)].done = checkbox.checked;
      if (checkbox.checked) addEvidence(`Completed action: ${state.actions[Number(checkbox.dataset.action)].text}`);
      saveState();
      render();
    });
  });

  document.querySelector("#saveGrowth")?.addEventListener("click", () => {
    applyCoachChoice(document.querySelector("#profileCoach")?.value, state.coachProfile);
    state.coachProfile.focus = document.querySelector("#profileFocus").value.trim() || state.coachProfile.focus;
    state.coachProfile.resistance =
      document.querySelector("#profileResistance").value.trim() || state.coachProfile.resistance;
    state.coachProfile.preferredStyle =
      document.querySelector("#profileStyle").value.trim() || state.coachProfile.preferredStyle;
    addMilestone("Refined coach memory profile");
    saveState();
    render();
  });

  document.querySelector("#retakeOnboarding")?.addEventListener("click", () => {
    state.onboarding.completed = false;
    saveState();
    render();
  });

  document.querySelector("#coachSend")?.addEventListener("click", sendCoachMessage);
  document.querySelector("#coachText")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendCoachMessage();
  });

  document.querySelectorAll("[data-coach-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector("#coachText");
      if (input) input.value = button.dataset.coachPrompt;
      sendCoachMessage();
    });
  });

  document.querySelector("#addPost")?.addEventListener("click", async () => {
    const input = document.querySelector("#communityText");
    if (!input.value.trim()) return;
    const topic = document.querySelector("#communityTopic")?.value || "Daily Wins";
    const post = { name: state.user.name, topic, text: input.value.trim() };
    state.activeCommunityCategory = topic;
    state.community.unshift(post);
    try {
      await addCommunityPost(cloudUser, post);
      state.community = await loadCommunityPosts();
    } catch (error) {
      showAppMessage(`Post saved on this device, but community sync failed: ${error.message}`);
    }
    saveState();
    render();
  });
}

async function sendCoachMessage() {
  const input = document.querySelector("#coachText");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  state.coachMessages.push({ role: "user", text });
  const thinkingMessage = { role: "coach", text: `${selectedCoach().name} is listening...` };
  state.coachMessages.push(thinkingMessage);
  render();
  let reply = "";
  if (appFeatures.useLiveAICoach) {
    try {
      reply = await askAICoach(buildAICoachPayload(text));
    } catch (error) {
      reply = coachReply(text);
    }
  } else {
    reply = coachReply(text);
  }
  const index = state.coachMessages.indexOf(thinkingMessage);
  if (index >= 0) {
    state.coachMessages[index] = { role: "coach", text: reply };
  } else {
    state.coachMessages.push({ role: "coach", text: reply });
  }
  saveState();
  render();
}

function buildAICoachPayload(message) {
  const growth = growthInsights();
  const coach = selectedCoach();
  const intro = onboardingInsights();
  return {
    message,
    user: {
      name: state.user?.name || "OYO Member",
      email: state.user?.email || ""
    },
    coach: {
      id: coach.id,
      name: coach.name,
      identity: coach.identity,
      voice: coach.voice,
      signature: coach.signature,
      background: coach.background
    },
    premiumAccess: canAccessPremium(),
    memory: {
      stage: growth.stage,
      focus: growth.focus,
      pattern: growth.pattern,
      nextStep: growth.nextStep,
      onboarding: state.onboarding,
      livedMemory: intro.livedMemory,
      futureSelf: state.futureSelf,
      preferredStyle: state.coachProfile.preferredStyle,
      resistance: state.coachProfile.resistance,
      evidenceLog: state.coachProfile.evidenceLog.slice(0, 6),
      milestones: state.coachProfile.milestones.slice(0, 6)
    },
    currentLife: {
      goals: state.goals.slice(0, 8),
      actions: state.actions.slice(0, 8),
      gratitude: state.gratitude.slice(0, 8),
      vision: state.vision.slice(0, 8),
      journal: state.journal.slice(0, 5),
      notes: state.notes.slice(0, 8)
    },
    recentMessages: state.coachMessages
      .filter((entry) => entry !== undefined && entry.text && entry.text !== `${coach.name} is listening...`)
      .slice(-10)
  };
}

function scrollChatToBottom() {
  const chat = document.querySelector("#chatLog");
  if (!chat) return;
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}

async function handleFirebaseSignIn() {
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value.trim();
  if (!email || !password) {
    showNotice("Enter your email and password.");
    return;
  }
  try {
    await signIn(email, password);
  } catch (error) {
    showNotice(error.message);
  }
}

async function handleFirebaseCreateAccount() {
  const name = document.querySelector("#loginName").value.trim() || "OYO Member";
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value.trim();
  if (!email || password.length < 6) {
    showNotice("Enter an email and a password with at least 6 characters.");
    return;
  }
  try {
    const user = await createAccount(name, email, password);
    state = normalizeState(clone(starterState));
    state.user = { name, email, uid: user.uid };
    await saveCloudState(user.uid, privateStateForSave(state));
  } catch (error) {
    showNotice(error.message);
  }
}

async function handlePasswordReset() {
  const email = document.querySelector("#loginEmail").value.trim();
  if (!email) {
    showNotice("Enter your email first, then click Reset Password.");
    return;
  }
  try {
    await sendPasswordReset(email);
    showNotice("Password reset email sent. Check your inbox.");
  } catch (error) {
    showNotice(error.message);
  }
}

function showNotice(message) {
  const notice = document.querySelector("#notice");
  if (notice) notice.textContent = message;
}

function showAppMessage(message) {
  window.alert(message);
}

function isAdmin() {
  return isAdminEmail(cloudUser?.email || state.user?.email);
}

function canAccessPremium() {
  const email = cloudUser?.email || state.user?.email;
  return Boolean(state.premium || isAdmin() || isPremiumTester(email));
}

function isPremiumTester(email) {
  const normalized = normalizeEmail(email);
  const savedTesterEmails = publicSettings?.premiumTesterEmails || [];
  return Boolean(
    normalized &&
      (isPremiumTesterEmail(normalized) ||
        savedTesterEmails.some((testerEmail) => normalizeEmail(testerEmail) === normalized))
  );
}

function parseEmailList(value) {
  return String(value || "")
    .split(/[\n,; ]+/)
    .map(normalizeEmail)
    .filter(Boolean)
    .filter((email, index, emails) => emails.indexOf(email) === index);
}

function formatEmailList(value) {
  return Array.isArray(value) ? value.map(normalizeEmail).filter(Boolean).join("\n") : "";
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function getEffectiveLink(name) {
  const value = publicSettings?.links?.[name] || getAppLink(name);
  return String(value || "").startsWith("http") ? value : "";
}

function selectedCoach() {
  return coachOptions.find((coach) => coach.id === state.coachProfile.coachId) || coachOptions[0];
}

function applyCoachChoice(value, profile = state.coachProfile) {
  const normalized = String(value || "").trim().toLowerCase();
  const coach =
    coachOptions.find((option) => option.id === normalized) ||
    coachOptions.find((option) => option.name.toLowerCase() === normalized) ||
    coachOptions[0];
  profile.coachId = coach.id;
  profile.coachName = coach.name;
  profile.coachIdentity = coach.identity;
  profile.coachVoice = coach.voice;
  profile.coachImage = coach.image;
  return coach;
}

function coachReply(text) {
  const lower = text.toLowerCase();
  const growth = growthInsights();
  const coach = selectedCoach();
  const intro = onboardingInsights();
  const topic = detectCoachTopic(lower);
  const intent = detectQuestionIntent(lower);
  const tone = coachTone(coach.id);
  const userName = state.user?.name || "you";
  const messageFocus = summarizeUserMessage(text);
  const premiumAccess = canAccessPremium();
  const directQuestion = isDirectQuestion(text);
  const turn = state.coachMessages.filter((message) => message.role === "user").length;
  const repeatedTopic = recentUserTopics().filter((recentTopic) => recentTopic === topic).length > 1;
  const opener = pickCoachVariant(
    [
      `${coach.name} here, ${userName}.`,
      `${userName}, I am with you.`,
      `I hear you, ${userName}.`,
      `Let us slow this down together, ${userName}.`
    ],
    turn + coach.id.length
  );
  const memoryLine = repeatedTopic
    ? `Since this theme has come up more than once, I am treating it as a pattern your OYO Compass should pay attention to.`
    : pickCoachVariant(
        [
          `I am connecting this to your ${growth.stage.toLowerCase()} stage and your current pattern: ${growth.pattern.toLowerCase()}.`,
          `Your growth memory says the next useful move is: ${growth.nextStep.toLowerCase()}.`,
          `This matters because your current focus is ${growth.focus.toLowerCase()}, not just solving one isolated problem.`,
          intro.contextSentence
        ],
        turn
      );

  const replies = {
    stuck: {
      reflection: pickCoachVariant(
        [
          `It sounds like ${messageFocus} feels heavier than it needs to feel right now.`,
          `I hear the stuck place in ${messageFocus}, and I do not want to rush you past it.`,
          `This sounds like a moment where part of you wants movement and part of you wants protection.`
        ],
        turn
      ),
      reframe: pickCoachVariant(
        [
          "Being stuck does not mean you have no options. It usually means one part of you needs safety before another part can move.",
          "The block is information, not a verdict. It is showing us where the next step needs to be smaller, safer, or clearer.",
          "You do not need to force momentum. You need one believable option that your body can say yes to."
        ],
        turn
      ),
      practice: premiumAccess
        ? "Try the Pattern Interrupt: stand up, change your posture, say 'new option,' then take the smallest action that breaks the old loop."
        : "Take three slow breaths and ask: what is still available to me while this feeling is here?",
      action: pickCoachVariant(
        [
          "Choose one action that takes less than 10 minutes and creates evidence, not perfection.",
          "Write down the next step so small it almost feels too easy, then do only that.",
          "Move your body first, then make one simple decision from a calmer state."
        ],
        turn
      ),
      question: pickCoachVariant(
        [
          "What is the smallest honest step you could take before the day ends?",
          "What would make this feel 10 percent safer to begin?",
          "What option are you avoiding because it feels too simple?"
        ],
        turn
      )
    },
    goals: {
      reflection: pickCoachVariant(
        [
          `I hear that you want movement around ${messageFocus}.`,
          `This sounds like a goal that needs to become a daily rhythm, not just an idea.`,
          `I hear the desire for progress, and I want to help you make it concrete.`
        ],
        turn
      ),
      reframe: pickCoachVariant(
        [
          "A goal becomes real when it is connected to identity, evidence, and a next action you can actually complete.",
          "The goal is not just the result. It is the person you practice becoming while you move toward it.",
          "If the goal feels too big, we shrink the action, not the desire."
        ],
        turn
      ),
      practice: pickCoachVariant(
        [
          "Write this sentence: I will do X by Y because I am becoming Z.",
          "Choose one 24-hour action and one seven-day action. Keep both measurable.",
          "Name the result, the identity, and the first piece of evidence."
        ],
        turn
      ),
      action: pickCoachVariant(
        [
          "Add one daily action that is small enough to finish today and meaningful enough to count.",
          "Pick the goal that creates the most relief first, then choose one visible step.",
          "Turn the goal into a calendar moment, not a someday intention."
        ],
        turn
      ),
      question: pickCoachVariant(
        [
          "Which goal matters most right now: peace, confidence, health, relationship, money, business, or purpose?",
          "What would count as evidence by tonight?",
          "What goal are you ready to own even if it starts small?"
        ],
        turn
      )
    },
    relationships: {
      reflection: pickCoachVariant(
        [
          `This sounds connected to relationship, home, love, or belonging.`,
          `I hear that this is not just logistics; there is care and emotion inside it.`,
          `This feels like a place where your peace and your connection both matter.`
        ],
        turn
      ),
      reframe: pickCoachVariant(
        [
          "Owning your options in relationships does not mean controlling the other person. It means choosing the boundary, conversation, or loving action that keeps you in self-respect.",
          "A loving option can still have a boundary. A boundary can still be kind.",
          "The goal is not to be perfectly understood by everyone. The goal is to stay honest with yourself."
        ],
        turn
      ),
      practice: pickCoachVariant(
        [
          "Name what you need, what you can control, and what you are no longer available to carry alone.",
          "Write the sentence you wish you could say, then soften it without abandoning the truth.",
          "Separate the facts, the feeling, and the request before you respond."
        ],
        turn
      ),
      action: pickCoachVariant(
        [
          "Choose one honest sentence you can say or one boundary you can practice with kindness.",
          "Decide whether this needs a conversation, a pause, a request, or a boundary.",
          "Protect your peace with one clear action instead of replaying the whole story."
        ],
        turn
      ),
      question: pickCoachVariant(
        [
          "What would future you say if she could protect both peace and connection?",
          "What part of this is yours to own, and what part is not yours to carry?",
          "What truth needs to be said kindly?"
        ],
        turn
      )
    },
    wellbeing: {
      reflection: `Your body and energy are part of this, not separate from it.`,
      reframe: "Your next level has to be livable. If your nervous system cannot hold the pace, the option is not truly yours yet.",
      practice: "Pick one signal your body is asking for: rest, water, movement, food, space, breath, or a simpler expectation.",
      action: "Give your body one supportive action before you ask it for more output.",
      question: "What would feel like care today instead of pressure?"
    },
    business: {
      reflection: `I hear the business and income thread in this.`,
      reframe: "Business is not separate from your life. It is one option that can support peace, family, freedom, purpose, and aligned income.",
      practice: premiumAccess
        ? "Use the Aligned Income Reframe: selling is not pressure; it is offering an option that may support someone's life."
        : "Ask: what do I need my work to support in my actual life?",
      action: "Choose one clean business action: invite, follow up, share a story, clarify an offer, or learn the next step.",
      question: "Which action would create income without abandoning your peace?"
    },
    confidence: {
      reflection: `This sounds like a self-trust and confidence moment.`,
      reframe: "Confidence is not always a feeling first. Sometimes confidence is the evidence you build after you move.",
      practice: premiumAccess
        ? "Use Evidence Stacking: list five times you followed through, then act from that proof."
        : "Name one time you already did something hard and let that become evidence.",
      action: "Do one visible action today, even if it is small.",
      question: "What would you do next if you trusted yourself 5 percent more?"
    },
    future: {
      reflection: `This connects directly to your future self.`,
      reframe: "Future self work is not pretending. It is rehearsing the identity until your choices start matching it.",
      practice: premiumAccess
        ? "Use Anchor the Future Self: choose one future-self feeling, anchor it with breath, then take one action from that state."
        : "Read your future self statement once, then choose one action that matches it.",
      action: "Ask what future you would stop negotiating with, then act on one piece of that standard.",
      question: "What option would your future self own in the next 20 minutes?"
    },
    default: {
      reflection: `I hear you bringing ${messageFocus} into the room.`,
      reframe: "Let us bring this back to the whole life you are building, not just the problem in front of you.",
      practice: "Name the life area, name the option, then name the next honest action.",
      action: "Choose one step that creates peace or evidence today.",
      question: "What do you want this situation to help you become?"
    }
  };

  const reply = replies[topic] || replies.default;
  const format = pickCoachVariant(["standard", "compact", "deeper"], turn);
  const answerLine =
    directQuestion || intent !== "share"
      ? `Answer: ${answerSpecificQuestion({ topic, intent, text, premiumAccess, intro, growth })}`
      : "";
  if (format === "compact") {
    return [
      `${opener} ${tone}`,
      answerLine,
      `${reply.reflection}`,
      `Your compass says: ${intro.shortMemory}.`,
      `What I am learning from your app: ${intro.livedMemory}`,
      `Here is the option: ${reply.reframe}`,
      `Do this next: ${reply.action}`,
      `Answer this: ${reply.question}`
    ].filter(Boolean).join("\n\n");
  }
  if (format === "deeper") {
    return [
      `${opener} ${tone}`,
      answerLine,
      `${reply.reflection} ${memoryLine}`,
      `Your compass says: ${intro.shortMemory}. ${topic === "business" ? intro.businessSentence : ""}`,
      `What I am learning from your app: ${intro.livedMemory}`,
      `What I notice: ${reply.reframe}`,
      `Practice to try now: ${reply.practice}`,
      `Your next owned option: ${reply.action}`,
      `Before you reply, check in with this: ${reply.question}`
    ].filter(Boolean).join("\n\n");
  }
  return [
    `${opener} ${tone}`,
    answerLine,
    `${reply.reflection} ${memoryLine}`,
    `Your compass says: ${intro.shortMemory}.`,
    `What I am learning from your app: ${intro.livedMemory}`,
    `Reframe: ${reply.reframe}`,
    `Practice: ${reply.practice}`,
    `Next step: ${reply.action}`,
    `Question for you: ${reply.question}`
  ].filter(Boolean).join("\n\n");
}

function isDirectQuestion(text) {
  return /\?$|^(how|what|why|when|where|should|can|could|do|does|is|are|am)\b/i.test(text.trim());
}

function detectQuestionIntent(lower) {
  if (/(what should i do|what do i do|next step|where do i start|start|begin)/.test(lower)) return "nextStep";
  if (/(how do i|how can i|help me|walk me through|steps|plan)/.test(lower)) return "howTo";
  if (/(why am i|why do i|why can.t i|why can't i|keep doing|again)/.test(lower)) return "whyPattern";
  if (/(should i|do i choose|decide|decision|which option|either)/.test(lower)) return "decision";
  if (/(what do i say|message|text them|talk to|conversation|script|word)/.test(lower)) return "words";
  if (/(i feel|i am feeling|i'm feeling|i feel like|sad|angry|hurt|lonely|overwhelmed|anxious)/.test(lower)) return "emotion";
  if (/(affirmation|mantra|card|journal prompt|prompt)/.test(lower)) return "prompt";
  return "share";
}

function answerSpecificQuestion({ topic, intent, text, premiumAccess, intro, growth }) {
  const subject = extractQuestionSubject(text);
  const options = {
    nextStep: {
      stuck: `Your next step is to make ${subject} smaller. Regulate first, then choose one action that can be completed in 10 minutes or less.`,
      business: `Your next step is one clean business move connected to your life goal: invite, follow up, clarify your offer, or review the LWA pathway when you are ready.`,
      relationships: `Your next step is to separate what you feel, what you need, and what request or boundary would protect your peace.`,
      wellbeing: `Your next step is body-first: water, breath, food, rest, movement, or lowering the demand before solving the whole thing.`,
      confidence: `Your next step is evidence. Do one small visible thing that proves you can trust yourself with ${subject}.`,
      future: `Your next step is to ask what your future self would do in the next 20 minutes, then choose the smallest version of that.`,
      goals: `Your next step is to turn ${subject} into one action for today and one action for this week.`,
      default: `Your next step is to name the option, choose the smallest honest action, and create one piece of evidence today.`
    },
    howTo: {
      stuck: `Move through this by naming the feeling, lowering the pressure, and taking one safe action before trying to feel fully ready.`,
      business: `Build this by tying the business action to the life you want, then doing one income-producing step: invite, follow up, share, or learn.`,
      relationships: `Handle this by writing the truth first, softening the delivery second, and choosing a clear request or boundary third.`,
      wellbeing: `Support this by treating your energy as information. Care first, then decide from a steadier body.`,
      confidence: `Build confidence by stacking proof: choose a small action, complete it, record it, then repeat.`,
      future: `Practice future self by choosing one identity, one standard, and one action that matches that standard today.`,
      goals: `Make progress by choosing one goal, one reason it matters, one tiny action, and one time you will do it.`,
      default: `Start with your real life: what matters, what feels hard, what option is available, and what action would create evidence.`
    },
    whyPattern: {
      default: `This pattern is probably trying to protect you from discomfort, disappointment, judgment, or overwhelm. We do not shame it; we thank it, then choose a smaller option that proves you are safe to move.`
    },
    decision: {
      default: `Choose the option that best matches your future self, protects your peace, and creates honest evidence. If both choices are imperfect, pick the one that keeps you in self-respect.`
    },
    words: {
      default: `Use simple words: "I want to be honest about what I need. I am choosing a calmer, clearer option here, and this is what I can do next." Adjust the sentence so it sounds like you.`
    },
    emotion: {
      default: `The feeling gets to be here, but it does not get to own every option. Name it, breathe, then choose one kind action that supports the person you are becoming.`
    },
    prompt: {
      default: `Use this prompt: "The option I am ready to own today is ____. The part of me that needs support is ____. The smallest evidence I can create is ____."`
    },
    share: {
      default: directCoachAnswer(topic, premiumAccess)
    }
  };
  const byIntent = options[intent] || options.share;
  const answer = byIntent[topic] || byIntent.default || options.share.default;
  return `${answer} I am matching this to your compass: ${intro.shortMemory}. Your current growth stage is ${growth.stage}.`;
}

function extractQuestionSubject(text) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[?.!]+$/, "");
  if (!clean) return "this";
  const withoutLead = clean.replace(/^(how do i|how can i|what should i do about|what do i do about|should i|can i|could i|help me|i need help with)\s+/i, "");
  return withoutLead.length > 80 ? "this" : withoutLead || "this";
}

function personalizedWelcomeMessage() {
  const coach = selectedCoach();
  const intro = onboardingInsights();
  return `${coach.name} here, ${state.user?.name || "there"}. I read your compass setup, and I will keep learning from your future self, vision board, journal, daily notes, gratitude, goals, and actions. Right now I am holding this: ${intro.shortMemory}. Start by telling me what is happening today, and I will help you choose the next option that fits your real life.`;
}

function onboardingInsights() {
  const onboarding = state.onboarding || starterState.onboarding;
  const areas = (onboarding.lifeAreas || []).slice(0, 4).join(", ") || "whole-life alignment";
  const desiredFeeling = onboarding.desiredFeeling || "more aligned";
  const goal = onboarding.biggestGoal || "build more self-trust";
  const challenge = onboarding.currentChallenge || state.coachProfile.resistance || "finding the next honest step";
  const supportStyle = onboarding.supportStyle || state.coachProfile.preferredStyle || "warm and practical";
  const businessInterest = onboarding.businessInterest || "Maybe later";
  const latestJournal = state.journal?.[0]
    ? `${state.journal[0].title}: ${summarizeMemoryText(state.journal[0].body, 90)}`
    : "no journal entry yet";
  const latestNote = state.notes?.[0]
    ? `${state.notes[0].title}: ${summarizeMemoryText(state.notes[0].body, 90)}`
    : "no daily note yet";
  const visionTheme = state.vision?.[0] || "a life that feels peaceful, free, and fully mine";
  const activeGoal = state.goals?.[0]?.title || goal;
  const nextAction = state.actions?.find((action) => !action.done)?.text || "choose one honest next step";
  const gratitudeAnchor = state.gratitude?.[0] || "new choices";
  const futureSelf = summarizeMemoryText(state.futureSelf, 110);
  return {
    shortMemory: `${areas}; desired feeling: ${desiredFeeling}; goal: ${activeGoal}; current challenge: ${challenge}`,
    livedMemory: `Future self: ${futureSelf}. Vision: ${visionTheme}. Latest journal: ${latestJournal}. Latest note: ${latestNote}. Gratitude anchor: ${gratitudeAnchor}. Next action: ${nextAction}.`,
    contextSentence: `Your setup says you want ${supportStyle.toLowerCase()} support with ${areas}, while moving toward ${activeGoal}. I am also learning from your future self, vision board, journal, daily notes, gratitude, goals, and daily actions.`,
    businessSentence:
      businessInterest.includes("Yes") || businessInterest.includes("curious")
        ? "Business can be included as one option, but it should serve the life you want, not take over the whole compass."
        : "I will keep business in the background unless you ask for it, because your setup says life coaching comes first."
  };
}

function summarizeMemoryText(text, limit) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit - 3)}...` : clean;
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function directCoachAnswer(topic, premiumAccess) {
  const answers = {
    stuck: "Start smaller than your fear expects. Regulate first, then take one visible action that proves you are not frozen.",
    goals: "Pick one goal, one reason it matters, and one action you can finish today. Do not choose five goals at once.",
    relationships: "Choose the honest conversation, boundary, or pause that protects your peace without abandoning your values.",
    wellbeing: "Care for your body before demanding more output. The next right step may be rest, food, water, movement, or a simpler expectation.",
    business: premiumAccess
      ? "Choose one income action: invite, follow up, share a story, clarify your offer, or open the LWA pathway when your link is ready."
      : "Choose one business action that supports your actual life, not just pressure: invite, follow up, or clarify your offer.",
    confidence: "Build confidence with evidence. Do one small visible thing today and let that become proof.",
    future: "Act as the future self for one decision today. Pick the option she would own, then make it practical.",
    default: "Name the life area, name the option, and choose the next honest action. That is the fastest way back into ownership."
  };
  return answers[topic] || answers.default;
}

function detectCoachTopic(lower) {
  if (/(stuck|fear|scared|overwhelm|anxious|anxiety|panic|frozen|blocked|behind)/.test(lower)) return "stuck";
  if (/(business|income|lwa|sales|client|offer|launch|lead|customer|money|premium)/.test(lower)) return "business";
  if (/(relationship|family|marriage|partner|friend|kids|children|home|love|boundary)/.test(lower)) return "relationships";
  if (/(health|body|wellbeing|well-being|energy|sleep|routine|stress|tired|burnout)/.test(lower)) return "wellbeing";
  if (/(confidence|visible|visibility|belief|trust|doubt|worthy|worth)/.test(lower)) return "confidence";
  if (/(future|identity|manifest|manifestation|vision|dream|becoming)/.test(lower)) return "future";
  if (/(goal|action|today|next|plan|steps|focus|finish|complete)/.test(lower)) return "goals";
  return "default";
}

function recentUserTopics() {
  return state.coachMessages
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => detectCoachTopic(message.text.toLowerCase()));
}

function coachTone(coachId) {
  const tones = {
    maya: "I am going to keep this gentle, but honest.",
    elena: "Let us listen for the future-self signal underneath this.",
    marcus: "I am going to make this practical and clear.",
    noah: "Let us turn this into a grounded strategy that still protects your purpose."
  };
  return tones[coachId] || tones.maya;
}

function pickCoachVariant(options, salt = 0) {
  return options[Math.abs(salt) % options.length];
}

function summarizeUserMessage(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 90) return `"${clean}"`;
  return `"${clean.slice(0, 87)}..."`;
}

function growthInsights() {
  const completed = state.actions.filter((action) => action.done).length;
  const totalEvidence = completed + state.journal.length + state.gratitude.length + state.goals.length;
  const businessSignals = countSignals(["business", "income", "sales", "client", "lwa", "offer"]);
  const lifeSignals = countSignals([
    "life",
    "family",
    "relationship",
    "health",
    "body",
    "peace",
    "home",
    "purpose",
    "freedom",
    "wellbeing",
    "routine"
  ]);
  const identitySignals = countSignals(["future", "identity", "confidence", "belief", "trust", "self"]);
  const resistanceSignals = countSignals(["stuck", "fear", "overwhelm", "anxious", "behind"]);
  const score = Math.min(100, Math.max(10, totalEvidence * 8 + completed * 10));
  const stage = score > 74 ? "Expansion" : score > 42 ? "Momentum" : "Clarity";
  const focus =
    lifeSignals >= businessSignals
      ? "Whole-life alignment and future self"
      : businessSignals > identitySignals + 2
        ? "Business as one part of life and freedom"
        : state.coachProfile.focus || "Whole-life alignment and future self";
  const pattern =
    resistanceSignals > 1
      ? state.coachProfile.resistance
      : completed >= 2
        ? "You respond well to small evidence-based actions"
        : "You are building self-trust through clarity before action";
  const nextStep =
    stage === "Expansion"
      ? "Choose a bolder life-giving step"
      : stage === "Momentum"
        ? "Repeat the action that created the strongest peace or evidence"
        : "Name the next honest option and take one tiny step";
  const stageNote =
    stage === "Expansion"
      ? "The person has enough evidence to practice bigger alignment, visibility, and freedom."
      : stage === "Momentum"
        ? "The person is moving from insight into repeatable aligned action."
        : "The person is clarifying identity, life direction, desire, and the safest next action.";

  return { focus, nextStep, pattern, score, stage, stageNote };
}

function countSignals(words) {
  const text = [
    state.futureSelf,
    state.coachProfile.focus,
    state.coachProfile.resistance,
    ...state.journal.map((entry) => `${entry.title} ${entry.body}`),
    ...state.actions.map((action) => action.text),
    ...state.goals.map((goal) => `${goal.title} ${goal.area}`),
    ...state.coachMessages.map((message) => message.text)
  ]
    .join(" ")
    .toLowerCase();
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function updateGrowthProfile() {
  const growth = growthInsights();
  state.coachProfile.stage = growth.stage;
  state.coachProfile.focus = state.coachProfile.focus || growth.focus;
  state.coachProfile.lastCheckIn = "Today";
}

function addEvidence(text) {
  if (!text || state.coachProfile.evidenceLog.includes(text)) return;
  state.coachProfile.evidenceLog.unshift(text);
  state.coachProfile.evidenceLog = state.coachProfile.evidenceLog.slice(0, 8);
}

function addMilestone(label) {
  if (!label || state.coachProfile.milestones.some((milestone) => milestone.label === label)) return;
  state.coachProfile.milestones.unshift({ label, date: "Today" });
  state.coachProfile.milestones = state.coachProfile.milestones.slice(0, 8);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations?.().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.active?.scriptURL && !registration.active.scriptURL.includes("sw.js")) {
          registration.unregister();
        }
      });
    });
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

boot();

async function boot() {
  firebaseEnabled = isFirebaseReady();
  if (!firebaseEnabled) {
    state.user = null;
    render();
    return;
  }

  state.user = null;
  render();
  showNotice("Connecting securely to Firebase...");

  try {
    authReady = await startFirebaseAuth(async (user) => {
      try {
        cloudUser = user;
        if (!user) {
          state.user = null;
          render();
          return;
        }

        const cloudState = await loadCloudState(user.uid);
        try {
          publicSettings = (await loadPublicSettings()) || {};
        } catch (settingsError) {
          publicSettings = {};
        }
        let communityPosts = [];
        try {
          communityPosts = await loadCommunityPosts();
        } catch (communityError) {
          communityPosts = [];
        }
        if (cloudState && isTrustedPrivateState(cloudState, user.uid)) {
          state = normalizeState(cloudState);
          state.user = {
            ...(state.user || {}),
            name: state.user?.name || user.displayName || user.email.split("@")[0],
            email: user.email,
            uid: user.uid
          };
        } else {
          state = cloudState ? clone(starterState) : loadStateForUser(user.uid);
          state.user = {
            name: state.user?.name || user.displayName || user.email.split("@")[0],
            email: user.email,
            uid: user.uid
          };
          await saveCloudState(user.uid, privateStateForSave(state));
        }
        state.community = communityPosts.length ? communityPosts : clone(starterState.community);
        localStorage.setItem(userStateKey(user.uid), JSON.stringify(privateStateForSave(state)));
        render();
      } catch (error) {
        state.user = null;
        render();
        showNotice(`Firebase connected, but user data could not load: ${error.message}`);
      }
    });

    if (!authReady) {
      state.user = null;
      render();
    }
  } catch (error) {
    state.user = null;
    render();
    showNotice(`Firebase could not start: ${error.message}`);
  }
}
