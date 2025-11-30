const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Mock data storage
const users = [];
let nextUserId = 1;

// Health checks
app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'SecondWind Backend - Full Functionality'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend running with full functionality and mock data',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    features: ['auth', 'dashboards', 'donations', 'intake', 'chat']
  });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, role, profile } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const user = {
      id: nextUserId++,
      email,
      password,
      role,
      profile,
      created_at: new Date().toISOString()
    };
    users.push(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      accessToken: 'mock-jwt-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      accessToken: 'mock-jwt-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard endpoints
app.get('/api/dashboards/donor', (req, res) => {
  // Mock donor dashboard data
  res.json({
    profile: {
      email: 'donor@example.com',
      memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      totalDonations: 5,
      totalDonated: 250.00,
      impactScore: 85
    },
    recentDonations: [
      { id: 1, amount: 50.00, impactType: 'housing', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), beneficiariesHelped: 1 },
      { id: 2, amount: 25.00, impactType: 'food', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), beneficiariesHelped: 2 },
      { id: 3, amount: 75.00, impactType: 'transportation', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), beneficiariesHelped: 1 }
    ],
    impactByCategory: [
      { impactType: 'housing', donationsCount: 2, totalAmount: 125.00, beneficiariesHelped: 3 },
      { impactType: 'food', donationsCount: 2, totalAmount: 75.00, beneficiariesHelped: 4 },
      { impactType: 'transportation', donationsCount: 1, totalAmount: 50.00, beneficiariesHelped: 1 }
    ],
    impactScore: 85
  });
});

app.get('/api/dashboards/beneficiary', (req, res) => {
  // Mock beneficiary dashboard data
  res.json({
    profile: {
      email: 'beneficiary@example.com',
      memberSince: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      daysSober: 45,
      medicaidStatus: 'eligible',
      applicationStatus: 'approved',
      sobrietyStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      nextCheckIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    supportReceived: [
      { id: 1, amount: 150.00, type: 'housing', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), provider: 'Housing Aid Co' },
      { id: 2, amount: 75.00, type: 'food', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), provider: 'Food Bank Network' },
      { id: 3, amount: 200.00, type: 'transportation', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), provider: 'Transit Support' }
    ],
    totalSupportReceived: 425.00,
    lastSupportDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    upcomingAppointments: [
      { id: 1, type: 'counseling', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), provider: 'Recovery Center' },
      { id: 2, type: 'medical', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), provider: 'Community Clinic' }
    ]
  });
});

// Intake endpoint
app.post('/api/intake/qualify', (req, res) => {
  const { daysSober, residency, income, medicaidStatus } = req.body;

  // Mock qualification algorithm
  let score = 0;
  const factors = {};

  // Residency check
  if (residency === 'colorado') {
    score += 25;
    factors.residency = 'verified';
  } else {
    factors.residency = 'not_eligible';
  }

  // Sobriety check
  if (daysSober >= 30) {
    score += 25;
    factors.sobriety = daysSober;
  } else {
    factors.sobriety = 'insufficient';
  }

  // Income check
  if (income < 30000) {
    score += 25;
    factors.income = 'qualified';
  } else {
    factors.income = 'over_limit';
  }

  // Medicaid check
  if (medicaidStatus === 'eligible' || medicaidStatus === 'enrolled') {
    score += 25;
    factors.medicaid = medicaidStatus;
  } else {
    factors.medicaid = 'not_eligible';
  }

  const eligible = score >= 50;

  res.json({
    eligible,
    score,
    factors,
    recommendations: eligible ? [
      'housing assistance',
      'food support',
      'transportation aid',
      'counseling services',
      'medical care support'
    ] : ['continue sobriety journey', 'apply for medicaid', 'seek local support services'],
    nextSteps: eligible ?
      ['Complete full application', 'Schedule intake interview', 'Begin support services'] :
      ['Continue recovery program', 'Gather required documents', 'Reapply when eligible']
  });
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message, context } = req.body;

  // Mock AI responses based on context
  let response = '';

  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('support')) {
    response = "I'm here to help you navigate the SecondWind recovery support platform. I can assist with:\n\n• Understanding eligibility requirements\n• Finding appropriate support services\n• Answering questions about the recovery process\n• Connecting you with local resources\n\nWhat specific support are you looking for?";
  } else if (message.toLowerCase().includes('donat')) {
    response = "Thank you for your interest in supporting recovery! SecondWind connects donors directly with beneficiaries through transparent, impactful giving. You can:\n\n• Choose specific support categories (housing, food, transportation)\n• Track the real impact of your donations\n• Receive updates on beneficiary success stories\n• Join our community of impact-driven donors\n\nWould you like me to guide you through making your first donation?";
  } else if (message.toLowerCase().includes('benefit')) {
    response = "Welcome to SecondWind! We're here to support your recovery journey. Our platform provides:\n\n• Comprehensive eligibility assessment\n• Direct connections to housing, food, and transportation support\n• Personalized recovery planning\n• Ongoing support and check-ins\n• Transparent progress tracking\n\nLet's start by understanding your current situation. Are you ready to begin the intake process?";
  } else {
    response = `Thank you for your message: "${message}". SecondWind is committed to supporting recovery through transparent, direct connections between donors and beneficiaries. Our AI assistant is here to help you navigate the platform and find the support you need.\n\nHow can I assist you today?`;
  }

  res.json({
    response,
    timestamp: new Date().toISOString(),
    conversationId: 'mock-conversation-' + Date.now()
  });
});

// Donations endpoint
app.post('/api/donations', (req, res) => {
  const { amount, impactType, donorInfo, isAnonymous } = req.body;

  // Mock donation processing
  const donationId = Math.floor(Math.random() * 10000);

  res.json({
    id: donationId,
    amount: parseFloat(amount),
    impactType,
    status: 'completed',
    createdAt: new Date().toISOString(),
    transactionId: 'txn_' + donationId,
    message: `Thank you for your ${impactType} donation of $${amount}! Your support will help beneficiaries in recovery.`,
    impact: {
      estimatedBeneficiaries: Math.floor(parseFloat(amount) / 50), // Rough estimate
      categories: [impactType],
      transparency: {
        trackingId: 'track_' + donationId,
        publicLedger: true
      }
    }
  });
});

// Transparency endpoint
app.get('/api/transparency/ledger', (req, res) => {
  // Mock transparency ledger
  res.json({
    transactions: [
      {
        id: 1,
        donorId: 'anon_123',
        beneficiaryId: 'ben_456',
        amount: 100.00,
        impactType: 'housing',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        outcome: '3 nights of housing secured'
      },
      {
        id: 2,
        donorId: 'anon_789',
        beneficiaryId: 'ben_012',
        amount: 50.00,
        impactType: 'food',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        outcome: '2 weeks of grocery support'
      }
    ],
    totalTransactions: 245,
    totalAmount: 45670.00,
    beneficiariesHelped: 189,
    successRate: 94.2,
    lastUpdated: new Date().toISOString()
  });
});

// Vendors endpoint
app.get('/api/vendors', (req, res) => {
  // Mock vendors list
  res.json({
    vendors: [
      {
        id: 1,
        name: 'Hope Housing Co-op',
        type: 'housing',
        location: 'Denver, CO',
        rating: 4.8,
        verified: true,
        services: ['emergency housing', 'transitional housing'],
        contact: 'contact@hopehousing.org'
      },
      {
        id: 2,
        name: 'Recovery Food Bank',
        type: 'food',
        location: 'Denver, CO',
        rating: 4.9,
        verified: true,
        services: ['grocery support', 'meal programs'],
        contact: 'support@recoveryfoodbank.org'
      }
    ],
    totalVendors: 25,
    verifiedVendors: 23
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'SecondWind Backend API is fully functional!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/dashboards/donor',
      'GET /api/dashboards/beneficiary',
      'POST /api/intake/qualify',
      'POST /api/chat',
      'POST /api/donations',
      'GET /api/transparency/ledger',
      'GET /api/vendors'
    ]
  });
});

// Catch-all route
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    availableEndpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/dashboards/donor',
      'GET /api/dashboards/beneficiary',
      'POST /api/intake/qualify',
      'POST /api/chat',
      'POST /api/donations',
      'GET /api/transparency/ledger',
      'GET /api/vendors',
      'GET /api/health',
      'GET /api/health/live'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SecondWind Backend running on port ${PORT}`);
  console.log(`✅ Full functionality enabled with mock data`);
  console.log(`💚 Health check: /api/health/live`);
  console.log(`🔧 Available endpoints:`);
  console.log(`   • POST /api/auth/register - User registration`);
  console.log(`   • POST /api/auth/login - User login`);
  console.log(`   • GET /api/dashboards/donor - Donor dashboard`);
  console.log(`   • GET /api/dashboards/beneficiary - Beneficiary dashboard`);
  console.log(`   • POST /api/intake/qualify - Beneficiary intake`);
  console.log(`   • POST /api/chat - AI chat support`);
  console.log(`   • POST /api/donations - Process donations`);
  console.log(`   • GET /api/transparency/ledger - Public transaction ledger`);
  console.log(`   • GET /api/vendors - Available service providers`);
});
