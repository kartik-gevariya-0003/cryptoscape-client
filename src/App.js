import "./App.css";
import React from "react";
import { Route, Switch } from "react-router-dom";
import Main from "./components/main/Main";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Portfolio from "./components/portfolio/Portfolio";
import Converter from "./components/converter/Converter";
import PastPerformance from "./components/past-performance/PastPerformance";
import CurrentMarketTrend from "./components/current-market-trend/CurrentMarketTrend";
import Transactions from "./components/transactions/Transactions";
function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Main} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/portfolio" component={Portfolio} />
        <Route exact path="/convert-currencies" component={Converter} />
        <Route exact path="/transactions" component={Transactions} />
        <Route
          exact
          path="/past-performance"
          component={PastPerformance}
        ></Route>
        <Route exact path="/browse-currencies" component={CurrentMarketTrend} />
      </Switch>
    </div>
  );
}

export default App;
