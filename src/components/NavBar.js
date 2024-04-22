import React, { useState, useEffect } from "react";
import { NavLink as RouterNavLink, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useAuth0 } from "@auth0/auth0-react";





const NavBar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();
  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

useEffect(() => {
    if (isAuthenticated && user) {
        async function registerUser(username, email, password) {
          try {
            const response = await fetch('http://localhost:6060/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (response.ok) {
              console.log('Registration successful:', data);
            } else {
              console.error('Registration failed:', data.message);
            }
          } catch (error) {
            console.error('Network error:', error);
          }
        }
        registerUser(user.nickname, user.email, user.nickname)
    }

}, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user.name === "xanaji9685@rartg.com") {
      history.push("/adminPanel");
    }
  }, [isAuthenticated, user, history]);

  return (
    <div className="nav-container">
      <Navbar color="light" light expand="md" container={false}>
        <Container>
          <NavbarBrand><b>MA3SYNC</b></NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
      {isAuthenticated ? (
        user.email === "xanaji9685@rartg.com" ? (
          // Admin Panel link for specific authenticated user
          <NavItem>
            <NavLink
              tag={RouterNavLink}
              to="/adminPanel"
              exact
              activeClassName="router-link-exact-active"
            >
              <b>Admin Panel</b>
            </NavLink>
          </NavItem>
        ) : (
          // Navigation links for other authenticated users
          <>
            <NavItem>
              <NavLink
                tag={RouterNavLink}
                to="/"
                exact
                activeClassName="router-link-exact-active"
              >
                <b>Home</b>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={RouterNavLink}
                to="/bookTrip"
                exact
                activeClassName="router-link-exact-active"
              >
                <b>Book Trip</b>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={RouterNavLink}
                to="/myTrips"
                exact
                activeClassName="router-link-exact-active"
              >
                <b>My Trips</b>
              </NavLink>
            </NavItem>
          </>
        )
      ) : null}
    </Nav>
            <Nav className="d-none d-md-block" navbar>
              {isAuthenticated ? (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.name}</DropdownItem>
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                      <FontAwesomeIcon icon="user" className="mr-3" /> Profile
                    </DropdownItem>
                    <DropdownItem
                      id="qsLogoutBtn"
                      onClick={() => logoutWithRedirect()}
                    >
                      <FontAwesomeIcon icon="power-off" className="mr-3" /> Log out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              ) : (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    className="btn-margin"
                    onClick={() => loginWithRedirect()}
                  >
                    Log in
                  </Button>
                </NavItem>
              )}
            </Nav>
            {!isAuthenticated && (
              <Nav className="d-md-none" navbar>
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    block
                    onClick={() => loginWithRedirect({})}
                  >
                    Log in
                  </Button>
                </NavItem>
              </Nav>
            )}
            {isAuthenticated && (
              <Nav
                className="d-md-none justify-content-between"
                navbar
                style={{ minHeight: 170 }}
              >
                <NavItem>
                  <span className="user-info">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile d-inline-block rounded-circle mr-3"
                      width="50"
                    />
                    <h6 className="d-inline-block">{user.name}</h6>
                  </span>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="user" className="mr-3" />
                  <RouterNavLink
                    to="/profile"
                    activeClassName="router-link-exact-active"
                  >
                    Profile
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="power-off" className="mr-3" />
                  <RouterNavLink
                    to="#"
                    id="qsLogoutBtn"
                    onClick={() => logoutWithRedirect()}
                  >
                    Log out
                  </RouterNavLink>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
