export const event = {
  name: 'NASA International Space Apps Challenge 2026',
  brand: 'ASTROVERSE',
  dates: '14–16 November 2026',
  venue: 'Birla Institute of Applied Sciences',
  location: 'Bhimtal, Uttarakhand',
  startsAt: '2026-11-14T00:00:00+05:30',
  endsAt: '2026-11-16T23:59:59+05:30',
};

export const siteName = 'ASTROVERSE';

export const siteDescription = 'NASA Space Apps Challenge 2026 at Birla Institute of Applied Sciences, Bhimtal, on 14–16 November 2026.';

export const captions = [
  'A room full of possibilities',
  'Sharing ideas at Space Apps',
  'Celebrating the innovators',
  'Our Space Apps community',
  'Ideas take the stage',
  'Learning together',
  'Recognizing creative solutions',
  'The teams behind the ideas',
  'Building real-world prototypes',
  'A new generation of problem solvers',
  'From concepts to code',
  'One team. Many possibilities.',
  'Mentorship in action',
  'Collaboration at the workstations',
  'Working through the challenge',
  'The campus comes together',
  'Engineering a new perspective',
  'Stories from the launchpad',
  'A moment of discovery',
  'Exploring beyond the classroom',
];

export const photos = captions.map((caption, index) => ({
  id: index + 1,
  path: `/gallery/event-${String(index + 1).padStart(2, '0')}.jpeg`,
  caption,
  position: index + 1,
}));

export const faqs = [
  [
    'What is NASA Space Apps Challenge?',
    'An international innovation hackathon where teams use NASA and other open data to explore real-world challenges on Earth and in space. You bring the curiosity; your team brings the different perspectives.',
  ],
  [
    'Who can participate?',
    'Students, developers, designers, researchers, storytellers, and curious problem solvers are welcome. Choose School, College, or Open when registering your team.',
  ],
  [
    'How many people can be in a team?',
    'Each ASTROVERSE team must have 4–6 participants, including one team leader. A mentor is optional and does not count toward the team size.',
  ],
  [
    'How do I register?',
    'Create an account, confirm your email, and complete the team registration form with real details for all 4–6 members. Your registration ID appears in your dashboard after the form is saved.',
  ],
  [
    'Can I participate individually?',
    'Registration is team-based. Form a team of 4–6 members before submitting your registration.',
  ],
  [
    'Is there a registration fee?',
    'The organizers have not yet supplied fee information. Check this page for updates before making any payment; this website does not collect payments.',
  ],
  [
    'What should I bring?',
    'Bring your laptop, charger, any tools your project needs, and your digital or printed event ID card. Further venue instructions will be shared by the organizers.',
  ],
  [
    'Where and when is the event?',
    'ASTROVERSE takes place on 14–16 November 2026 at Birla Institute of Applied Sciences, Bhimtal, Uttarakhand.',
  ],
  [
    'What happens after registration?',
    'Your team receives a unique registration ID and a QR-linked digital ID card. Organizers review the registration. You can check the current approval status in your dashboard.',
  ],
  [
    'How does QR verification work?',
    'Your QR code opens a secure, database-backed verification page. It shows your team name, institution, registration status, and check-in state without revealing emails or mobile numbers.',
  ],
];

export const schedule = [
  {
    day: '14',
    month: 'NOVEMBER',
    title: 'The ideas take off.',
    stages: [
      {
        label: 'Arrival',
        title: 'Registration & check-in',
        text: 'Meet your team, collect event details, and get ready for the challenge.',
      },
      {
        label: 'Opening',
        title: 'Inauguration & challenge briefing',
        text: 'Discover the challenges, available open data, and the path ahead.',
      },
      {
        label: 'Build',
        title: 'Development, workshops & mentorship',
        text: 'Explore your idea, build your first prototype, and connect with mentors.',
      },
    ],
  },
  {
    day: '15',
    month: 'NOVEMBER',
    title: 'Make the possibility real.',
    stages: [
      {
        label: 'Develop',
        title: 'Hacking & mentor sessions',
        text: 'Refine your solution, test the details, and bring the team’s thinking together.',
      },
      {
        label: 'Present',
        title: 'Project presentations & evaluation',
        text: 'Tell your story and demonstrate what your team has built.',
      },
      {
        label: 'Celebrate',
        title: 'Closing & awards',
        text: 'Celebrate the ideas, the collaborations, and everything you learned.',
      },
    ],
  },
];

export const questions = [
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Neptune'],
    answer: 1,
    explanation:
      'Iron minerals on Mars oxidize, giving its surface a rusty red appearance.',
  },
  {
    question: 'What does NASA stand for?',
    options: [
      'National Astronomy and Science Agency',
      'North American Space Association',
      'National Aeronautics and Space Administration',
      'National Aerospace and Satellite Authority',
    ],
    answer: 2,
    explanation:
      'NASA stands for National Aeronautics and Space Administration.',
  },
  {
    question: 'Which is the largest planet in our solar system?',
    options: ['Earth', 'Saturn', 'Neptune', 'Jupiter'],
    answer: 3,
    explanation:
      'Jupiter is the largest planet in our solar system.',
  },
  {
    question: 'What keeps the planets in orbit around the Sun?',
    options: [
      'Gravity',
      'Solar wind',
      'Magnetism alone',
      'Earth’s rotation',
    ],
    answer: 0,
    explanation:
      'The Sun’s gravity, together with each planet’s forward motion, keeps planets in orbit.',
  },
  {
    question: 'Which mission first landed humans on the Moon?',
    options: [
      'Voyager 1',
      'Apollo 11',
      'Artemis I',
      'Hubble',
    ],
    answer: 1,
    explanation:
      'Apollo 11 landed the first humans on the Moon in July 1969.',
  },
  {
    question: 'What is a light-year a measure of?',
    options: [
      'Time',
      'Brightness',
      'Distance',
      'Temperature',
    ],
    answer: 2,
    explanation:
      'A light-year is the distance light travels in one year.',
  },
  {
    question: 'Which planet is famous for its spectacular rings?',
    options: [
      'Mercury',
      'Mars',
      'Venus',
      'Saturn',
    ],
    answer: 3,
    explanation:
      'Saturn is famous for its extensive ring system, made mostly of ice and rock.',
  },
  {
    question: 'How can satellite data help us on Earth?',
    options: [
      'Track weather and changes in the environment',
      'Stop Earth from rotating',
      'Remove gravity',
      'Make the Sun brighter',
    ],
    answer: 0,
    explanation:
      'Satellite observations help monitor weather, oceans, forests, and many other features of Earth.',
  },
];

export const videos: {
  title: string;
  type: 'youtube' | 'local';
  source: string;
}[] = [];
