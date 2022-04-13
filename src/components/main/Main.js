import './main.css';
import PlainHeaderComponent from "../PlainHeaderComponent";
import ParticlesBg from "particles-bg";
import React from "react";
import {Button, Col, Container, Image, Row} from "react-bootstrap";
import {Link} from "react-router-dom";

class Main extends PlainHeaderComponent {

  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <section className={"main-section"}>
        <ParticlesBg type="cobweb" bg={true} color={"#636ea0"}/>
        <Container fluid={"sm"}>
          <Row className={"justify-content-center mt-5 ml-0 mr-0"}>
            <h1 className={"logo-name"}>Crypto Scape</h1>
          </Row>
          <Row className={"justify-content-center text-center mt-5"}>
            <Col sm={6} className={"mt-4"}>
              <h2>All-in-one trading platform for your Bitcoins and other Cryptocurrency</h2>
              <br/>
              <p>Trading, Portfolio, Conversion, Watchlist - everything you need to easily manage crypto assets, within one interface.</p>
              <Link to={"/login"}>
                <Button variant={"info mt-3 mr-2"}>Login / Register</Button>
              </Link>
            </Col>
            <Col sm={6}>
              <Image src={"/logo.svg"} alt={"Plain Logo"} className={"logo-image"}/>
            </Col>
          </Row>
        </Container>
      </section>
    )
  }
}

export default Main
