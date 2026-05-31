// data.jsx — mock data for ChatBuilder

const ACCENTS = {
  indigo: { bg: '#6366f1', soft: '#e0e7ff', text: '#4f46e5' },
  purple: { bg: '#8b5cf6', soft: '#ede9fe', text: '#7c3aed' },
  green:  { bg: '#10b981', soft: '#d1fae5', text: '#047857' },
  amber:  { bg: '#f59e0b', soft: '#fef3c7', text: '#b45309' },
};

const BOTS = [
  { id: 'support',    name: 'Support Bot',      color: 'indigo', desc: 'Answers customer support questions from your help center articles.', docs: 4, msgs: 213, live: true },
  { id: 'sales',      name: 'Sales Assistant',  color: 'purple', desc: 'Qualifies leads and answers pricing questions from sales collateral.', docs: 6, msgs: 184, live: true },
  { id: 'docs',       name: 'Docs Helper',      color: 'green',  desc: 'Guides developers through your API reference and integration guides.', docs: 12, msgs: 421, live: true },
  { id: 'onboarding', name: 'Onboarding Bot',   color: 'amber',  desc: 'Walks new users through setup steps and best-practice playbooks.', docs: 3, msgs: 96, live: true },
  { id: 'hr',         name: 'HR FAQ',           color: 'indigo', desc: 'Resolves common HR and benefits questions from the employee handbook.', docs: 5, msgs: 58, live: false },
  { id: 'pricing',    name: 'Pricing Bot',      color: 'purple', desc: 'Explains plans, billing, and upgrade paths from the pricing sheet.', docs: 2, msgs: 142, live: true },
];

const DOCS_BY_BOT = {
  support: [
    { name: 'refund-policy.pdf', type: 'pdf', size: '142 KB', chunks: 18 },
    { name: 'getting-started.docx', type: 'docx', size: '88 KB', chunks: 24 },
    { name: 'troubleshooting.txt', type: 'txt', size: '31 KB', chunks: 21 },
    { name: 'shipping-faq.pdf', type: 'pdf', size: '96 KB', chunks: 24 },
  ],
};

const DOC_DEFAULT = DOCS_BY_BOT.support;

// Conversation for the chat-test / chat-interface screens
const SAMPLE_CHAT = [
  { from: 'bot',  text: "Hi! I'm Support Bot 👋 Ask me anything about our products, billing, or policies." },
  { from: 'user', text: "What's your refund policy?" },
  { from: 'bot',  text: "We offer a full refund within 30 days of purchase, no questions asked. After 30 days, refunds are evaluated case by case. You can start a refund right from your account billing page.", cites: ['refund-policy.pdf'] },
  { from: 'user', text: "How long does it take to get my money back?" },
  { from: 'bot',  text: "Once approved, refunds are processed within 5–7 business days and returned to your original payment method. You'll get an email confirmation when it's done.", cites: ['refund-policy.pdf', 'billing-faq.pdf'] },
  { from: 'user', text: "Do you ship internationally?" },
  { from: 'bot',  text: "Yes — we ship to over 40 countries. International orders typically arrive in 7–14 business days, and any customs fees are calculated at checkout.", cites: ['shipping-faq.pdf'] },
];

// canned responses for the live test
const CANNED = [
  { match: ['refund', 'money back', 'return'], text: "We offer a full refund within 30 days of purchase. After that, refunds are reviewed case by case. You can start one from your billing page anytime.", cites: ['refund-policy.pdf'] },
  { match: ['ship', 'delivery', 'international'], text: "We ship to 40+ countries. Standard delivery takes 7–14 business days, and customs fees are shown at checkout.", cites: ['shipping-faq.pdf'] },
  { match: ['price', 'cost', 'plan', 'billing', 'upgrade'], text: "Our plans start at $19/mo for Starter and $49/mo for Pro. You can upgrade or downgrade anytime from the billing page.", cites: ['pricing.pdf'] },
  { match: ['start', 'setup', 'install', 'begin'], text: "Getting started takes about 2 minutes: create a chatbot, upload your docs, then paste the embed snippet on your site. Want me to walk you through it?", cites: ['getting-started.docx'] },
];
const CANNED_FALLBACK = { text: "Great question! Based on the documents in my knowledge base, the best place to find that is in our help center. Could you give me a little more detail so I can point you to the right article?", cites: ['troubleshooting.txt'] };

// Analytics
const MSGS_30D = [120,138,142,131,158,176,162,149,168,184,201,193,178,166,205,221,214,232,218,241,255,247,263,258,272,289,276,294,308,321];
const MSGS_PER_BOT = [
  { name: 'Docs Helper', v: 421, color: 'green' },
  { name: 'Support Bot', v: 213, color: 'indigo' },
  { name: 'Sales Assistant', v: 184, color: 'purple' },
  { name: 'Pricing Bot', v: 142, color: 'purple' },
  { name: 'Onboarding Bot', v: 96, color: 'amber' },
  { name: 'HR FAQ', v: 58, color: 'indigo' },
];
const KPIS = [
  { label: 'Messages', num: '6,284', trend: +12.4, spark: [10,12,11,14,13,16,18,17,20,22,21,24], color: 'indigo' },
  { label: 'Conversations', num: '1,847', trend: +8.1, spark: [8,9,9,11,10,12,13,13,15,16,15,17], color: 'purple' },
  { label: 'Avg response time', num: '1.3s', trend: -5.6, spark: [18,17,17,15,16,14,13,14,12,11,12,10], color: 'green', good: 'down' },
  { label: 'Active users', num: '942', trend: +3.2, spark: [12,13,12,14,15,14,16,15,17,18,17,19], color: 'amber' },
];
const CONVERSATIONS = [
  { bot: 'support', first: "What's your refund policy?", started: '2 min ago', msgs: 6, last: 'just now' },
  { bot: 'docs', first: 'How do I authenticate API requests?', started: '14 min ago', msgs: 11, last: '3 min ago' },
  { bot: 'sales', first: 'Do you offer annual billing?', started: '38 min ago', msgs: 4, last: '22 min ago' },
  { bot: 'pricing', first: 'What is included in the Pro plan?', started: '1 hr ago', msgs: 7, last: '48 min ago' },
  { bot: 'onboarding', first: 'Where do I add my team members?', started: '2 hr ago', msgs: 5, last: '1 hr ago' },
  { bot: 'docs', first: 'Is there a rate limit on the API?', started: '3 hr ago', msgs: 9, last: '2 hr ago' },
  { bot: 'support', first: 'My widget is not showing up', started: '5 hr ago', msgs: 8, last: '4 hr ago' },
  { bot: 'hr', first: 'How many vacation days do I get?', started: 'Yesterday', msgs: 3, last: 'Yesterday' },
];

function botById(id) { return BOTS.find(b => b.id === id) || BOTS[0]; }

Object.assign(window, {
  ACCENTS, BOTS, DOCS_BY_BOT, DOC_DEFAULT, SAMPLE_CHAT, CANNED, CANNED_FALLBACK,
  MSGS_30D, MSGS_PER_BOT, KPIS, CONVERSATIONS, botById,
});
