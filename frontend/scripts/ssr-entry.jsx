import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './src/App.jsx';
import { AppProvider } from './src/context/AppContext.jsx';

const routes = ['/', '/sensors', '/weather', '/satellite', '/crops', '/protection', '/marketplace', '/gov', '/account'];
let failed = 0;
for (const route of routes) {
  try {
    const html = renderToString(
      <StaticRouter location={route}>
        <AppProvider>
          <App />
        </AppProvider>
      </StaticRouter>
    );
    console.log(`PASS  render ${route.padEnd(14)} ${html.length} chars`);
  } catch (e) {
    failed++;
    console.log(`FAIL  render ${route.padEnd(14)} ${e.message}`);
  }
}
console.log(failed ? `\n${failed} route(s) failed to render` : '\nAll routes rendered');
process.exit(failed ? 1 : 0);
