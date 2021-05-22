import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { RecoilRoot } from 'recoil';
import HomePage from './pages/HomePage';

function App() {
  return (
    <RecoilRoot>
      <Router>
        <Switch>
          <Route path="*">
            <HomePage/>
          </Route>
        </Switch>
      </Router>
    </RecoilRoot>
  );
}

export default App;
