import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import { useEffect } from 'react';

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import BookTrip from "./views/BookTrip";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import MyTrips from "./views/MyTrips";
import AdminPanel from "./views/AdminPanel";
// styles
import "./App.css";
// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();


const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/bookTrip" component={BookTrip} />
            <Route path="/myTrips" component={MyTrips} />
            <Route path="/adminPanel" component={AdminPanel} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
