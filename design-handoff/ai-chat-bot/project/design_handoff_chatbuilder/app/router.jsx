// router.jsx — screen registry, navigation, persistence, mount
const { useState: useStateR, useEffect: useEffectR } = React;

const STORE_KEY = 'chatbuilder_nav';

function loadNav() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    if (s && s.screen) return s;
  } catch (e) {}
  return { screen: 'login', params: {} };
}

function App() {
  const [nav, setNav] = useStateR(loadNav);
  const go = (screen, params = {}) => {
    const next = { screen, params };
    setNav(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) {}
    window.scrollTo(0, 0);
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
  };

  const { screen, params } = nav;
  let view;
  switch (screen) {
    case 'login':         view = <LoginScreen go={go} />; break;
    case 'register':      view = <RegisterScreen go={go} />; break;
    case 'dashboard':
    case 'mychatbots':    view = <Dashboard go={go} />; break;
    case 'detail':        view = <ChatbotDetail go={go} params={params} />; break;
    case 'conversations': view = <Conversations go={go} />; break;
    case 'embed':         view = <Embed go={go} params={params} />; break;
    case 'widget':        view = <PublicWidget go={go} />; break;
    case 'stats':         view = <Analytics go={go} />; break;
    case 'settings':      view = <ChatbotSettings go={go} params={params} />; break;
    case 'account':       view = <Account go={go} />; break;
    default:              view = <Dashboard go={go} />;
  }

  return <NavCtx.Provider value={{ screen, go }}>{view}</NavCtx.Provider>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
