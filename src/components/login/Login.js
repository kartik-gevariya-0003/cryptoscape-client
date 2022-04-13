import "./login.css"
import PlainHeaderComponent from "../PlainHeaderComponent";
import ParticlesBg from "particles-bg";
import {Button, Card, Col, Container, Form, Image, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import React from "react";
import {LOGIN} from "../../config";
import axios from "axios";
import {toast} from "react-toastify";

class Login extends PlainHeaderComponent {

  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      this.props.history.push({
        pathname: '/portfolio'
      });
    }
    this.state = {
      email : '',
      password : '',
      isError: {
        email : '',
        password : ''
      }
    }
  }
  onSubmit = async (e) => {
    e.preventDefault();

    let isError = {...this.state.isError};

    Object.keys(this.state).forEach(key => {
      if (key !== 'isError') {
        this.validator(key, this.state[key], isError);
        this.setState({
          isError,
          [key]: this.state[key]
        });
      }
    });

    let isValid = true;
    Object.values(isError).forEach(error => {
      if (error.length > 0) {
        isValid = false
      }
    });

    console.log(isValid);
    if (isValid) {
      let bodyData = {
        email: this.state.email,
        password: this.state.password
      }

      this.setState({loading: true});

      await axios
          .post(LOGIN, bodyData)
          .then((response) => {
            this.setState({loading: false});
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success(response.data.message);
            this.props.history.push({
              pathname: '/portfolio'
            });
          })
          .catch((error) => {
            this.setState({loading: false});
            toast.error(error.response.data.message);
          });
    }
  };

  commonValueChangeListener = e => {
    e.preventDefault();
    const {name, value} = e.target;
    let isError = {...this.state.isError};

    this.validator(name, value, isError);

    this.setState({
      isError,
      [name]: value
    });
  };

  validator = (name, value, isError) => {
    switch (name) {
      case "email":
        if (value.length === 0) {
          isError.email = "Email is required";
        } else {
          isError.email = RegExp(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ).test(value) ? "" : "Email address is invalid";
        }
        break;
      case "password":
        isError.password = "";
        if (value.length === 0) {
          isError.password = "Password is required";
        }
        break;
      default:
        break;
    }
  }


  render() {
    const {isError} = this.state;
    return (
      <section>
        {super.render()}
        <ParticlesBg type="cobweb" bg={true} color={"#636ea0"}/>
        <Container fluid={"sm"}>
          <Row className={"justify-content-center mt-3"}>
            <Col sm={10}>
              <Card>
                <Row className={"login-row"}>
                  <Col sm={6} className={"justify-content-center login-image-col"}>
                    <Image src={"/login.svg"} alt={"Login Image"} className={"login-image"}/>
                  </Col>
                  <Col sm={6} className={"p-4"}>
                    <Row className={"text-left"}>
                      <Col sm={12}>
                        <h2>Login</h2>
                      </Col>
                    </Row>
                    <Form  onSubmit={this.onSubmit} noValidate>
                      <Row className={"text-left mt-4"}>
                        <Col sm={12}>
                          <Form.Group controlId="formBasicEmail">
                            <Form.Label><strong>Email</strong></Form.Label>
                            <Form.Control type="email" placeholder="Enter email"
                                          name="email" value={this.state.email}
                            onChange={this.commonValueChangeListener}
                            className={isError.email.length > 0 ? "is-invalid" : ""}/>
                            {isError.email.length > 0 && (
                                <Form.Control.Feedback type={"invalid"}>
                                  {isError.email}
                                </Form.Control.Feedback>
                            )}
                          </Form.Group>
                          <Form.Group controlId="formBasicPassword">
                            <Form.Label><strong>Password</strong></Form.Label>
                            <Form.Control type="password" placeholder="Password"
                                          name="password" value={this.state.password}
                            onChange={this.commonValueChangeListener}
                            className={isError.password.length > 0 ? "is-invalid" : ""}/>
                            {isError.password.length > 0 && (
                                <Form.Control.Feedback type={"invalid"}>
                                  {isError.password}
                                </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className={"text-left mt-3"}>
                        <Col sm={12}>
                            <Button type="submit" variant={"primary"}>Login</Button>
                        </Col>
                      </Row>
                      <Row className={"text-left mt-2"}>
                        <Col sm={12}>
                          <span>Don't have an account?</span>
                          <Link to={"/register"} className={"ml-2"}>
                            <span>Register Here</span>
                          </Link>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    )
  }
}

export default Login
