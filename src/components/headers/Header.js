import "./header.css"
import {Component} from "react";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {faUserCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {toast} from "react-toastify";
import {withRouter} from "react-router-dom";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerLinks: [
        {id: 'portfolio', link: '/portfolio', name: 'Portfolio'},
        {id: 'browse-currencies', link: '/browse-currencies', name: 'Browse Currencies'},
        {id: 'converter', link: '/convert-currencies', name: 'Converter'},
        {id: 'transactions', link: '/transactions', name: 'Transactions'},
      ],
      activeLink: window.location
    }
  }

  handleLinkClick(item, event) {
    this.setState({activeLink: item.id});
  }

  invalidateSession = () => {
    localStorage.removeItem('user');
    toast.success('User logged out successfully.');
    this.props.history.push({
      pathname: '/login'
    });
  }

  render() {
    const navDropDownTitle = (
      <FontAwesomeIcon
        size={"2x"}
        icon={faUserCircle}
        className={"secondary"}
      />
    );
    return (
      <Navbar bg="dark" expand="lg" variant={"dark"} sticky={"top"}>
        <Navbar.Brand href="/portfolio" className={"mr-5"}>
          <h3 className={"ml-2"}>Crypto Scape</h3>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            {
              this.state.headerLinks.map(headerLink => {
                return <Nav.Link href={headerLink.link} key={headerLink.id}
                                 className={this.state.activeLink.pathname === headerLink.link ? 'active' : ''}
                                 onClick={this.handleLinkClick.bind(this, headerLink)}>
                  {headerLink.name}
                </Nav.Link>

              })}
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <NavDropdown
              title={navDropDownTitle}
              id="navbarScrollingDropdown"
              alignRight
            >
              <NavDropdown.Item onClick={this.invalidateSession}>Log out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withRouter(Header);
