import "./header.css"
import React, {Component} from "react";
import {Button, Col, Nav, NavDropdown, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserCircle} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

class LogoHeader extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      activeLink: window.location.pathname
    }
    this.showUserIcon = this.state.activeLink === '/home';
    this.showLoginButton = this.state.activeLink === '/';

    this.logoImageClasses = "logo-image center";
    if (this.showUserIcon) {
      this.logoImageClasses = "logo-image center home-position";
    } else if (this.showLoginButton) {
      this.logoImageClasses = "logo-image center main-position";
    }
  }

  navigateToLogin = () => {
    this.props.history.push({
      pathname: '/login'
    });
  }

  render() {
    const navDropDownTitle = (<FontAwesomeIcon size={"2x"} icon={faUserCircle} color={"#119696"}/>)
    return (
      <section>
        <Row className={"m-0"}>
          <Col sm={12}>
            <Row className={"m-0"}>
              {this.showUserIcon && (
                <Nav className={"justify-content-end"}>
                  <NavDropdown title={navDropDownTitle} id="navbarScrollingDropdown" className="dropdown-toggle-custom">
                    <NavDropdown.Item href={"/login"}>Log out</NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              )}
              {this.showLoginButton && (
                <section className="button-group">
                  <Link to={"/login"}>
                    <Button variant={"info mt-3 mr-2"}>Login / Register</Button>
                  </Link>
                </section>
              )}
            </Row>
            <Row className={"justify-content-center mt-5"}>
              <h1 className={"logo-name"}>Crypto Scape</h1>
            </Row>
          </Col>
        </Row>
      </section>
    )
  }
}

export default LogoHeader