import "./register.css"
import PlainHeaderComponent from "../PlainHeaderComponent";
import {Button, Card, Col, Container, Form, Image, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import React from "react";
import ParticlesBg from "particles-bg";
import axios from "axios";
import {toast} from "react-toastify";
import {REGISTER} from "../../config";

class Register extends PlainHeaderComponent {

  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isError: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        password: this.state.password
      }
      this.setState({loading: true});

      await axios
          .post(REGISTER, bodyData)
          .then((response) => {
            this.setState({loading: false});
            toast.success(response.data.message);
            this.props.history.push({
              pathname: '/login'
            });
          })
          .catch((error) => {
            this.setState({loading: false});
            if (error.response.status === 412) {
              isError.email = error.response.data.message;
              this.setState({
                isError: isError
              });
            } else {
              toast.error(error.response.data.message);
            }
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
      case "firstName":
        isError.firstName = "";
        if (value.length === 0) {
          isError.firstName = "First Name is required";
        } else if (!RegExp(/^[a-zA-Z0-9]+$/).test(value)) {
          isError.firstName = "Only alpha-numeric characters are allowed"
        }
        break;
      case "lastName":
        isError.lastName = "";
        if (value.length === 0) {
          isError.lastName = "Last Name is required";
        } else if (!RegExp(/^[a-zA-Z0-9]+$/).test(value)) {
          isError.lastName = "Only alpha-numeric characters are allowed"
        }
        break;
      case "email":
        isError.email = RegExp(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ).test(value) ? "" : "Email address is invalid";
        break;
      case "password":
        isError.password = "";
        if (value.length < 8) {
          isError.password = "Password must contain at least 8 characters";
        } else if (!RegExp(/^[a-zA-Z0-9!@#$%^&*(){}\-`.+,;=_/"']*$/).test(value)) {
          isError.password = "One or more invalid characters.\nAllowed special characters are\n!@#$%^&*(){}-`.+,;=_/\"'"
        }
        break;
      case "confirmPassword":
        isError.confirmPassword = "";
        if (value.length < 8) {
          isError.confirmPassword = "Confirm Password must contain at least 8 characters";
        } else if (!RegExp(/^[a-zA-Z0-9!@#$%^&*(){}\-`.+,;=_/"']*$/).test(value)) {
          isError.confirmPassword = "One or more invalid characters.\nAllowed special characters are\n!@#$%^&*(){}-`.+,;=_/\"'"
        } else if (this.state.password !== value) {
          isError.confirmPassword = "Confirm password is not matching with password"
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
                      <Image src={"/register.svg"} alt={"Login Image"} className={"register-image"}/>
                    </Col>
                    <Col sm={6} className={"p-4"}>
                      <Row className={"text-left"}>
                        <Col sm={12}>
                          <h2>Register</h2>
                        </Col>
                      </Row>
                      <Form onSubmit={this.onSubmit}>
                        <Row className={"text-left mt-4"}>
                          <Col sm={6}>
                            <Form.Group controlId="formFirstName">
                              <Form.Label><strong>First Name</strong></Form.Label>
                              <Form.Control type="text" name="firstName" placeholder="Enter First name"
                                            onChange={this.commonValueChangeListener}
                                            className={isError.firstName.length > 0 ? "is-invalid" : ""}/>
                              {isError.firstName.length > 0 && (
                                  <Form.Control.Feedback type={"invalid"}>
                                    {isError.firstName}
                                  </Form.Control.Feedback>
                              )}
                            </Form.Group>
                          </Col>
                          <Col sm={6}>
                            <Form.Group controlId="formLastName">
                              <Form.Label><strong>Last Name</strong></Form.Label>
                              <Form.Control type="text" name="lastName" placeholder="Enter Last name"
                                            onChange={this.commonValueChangeListener}
                                            className={isError.lastName.length > 0 ? "is-invalid" : ""}/>
                              {isError.lastName.length > 0 && (
                                  <Form.Control.Feedback type={"invalid"}>
                                    {isError.lastName}
                                  </Form.Control.Feedback>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className={"text-left"}>
                          <Col sm={12}>
                            <Form.Group controlId="formBasicEmail">
                              <Form.Label><strong>Email</strong></Form.Label>
                              <Form.Control type="email" name="email" placeholder="Enter Email"
                                            onChange={this.commonValueChangeListener}
                                            className={isError.email.length > 0 ? "is-invalid" : ""}/>
                              {isError.email.length > 0 && (
                                  <Form.Control.Feedback type={"invalid"}>
                                    {isError.email}
                                  </Form.Control.Feedback>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className={"text-left"}>
                          <Col sm={6}>
                            <Form.Group controlId="formBasicPassword">
                              <Form.Label><strong>Password</strong></Form.Label>
                              <Form.Control type="password" name="password" placeholder="Password"
                                            onChange={this.commonValueChangeListener}
                                            className={isError.password.length > 0 ? "is-invalid" : ""} />
                              {isError.password.length > 0 && (
                                  <Form.Control.Feedback type={"invalid"}>
                                    {isError.password}
                                  </Form.Control.Feedback>
                              )}
                            </Form.Group>
                          </Col>
                          <Col sm={6}>
                            <Form.Group controlId="formBasicConfirmPassword">
                              <Form.Label><strong>Confirm Password</strong></Form.Label>
                              <Form.Control type="password" name="confirmPassword" placeholder="Confirm Password"
                                            onChange={this.commonValueChangeListener}
                                            className={isError.confirmPassword.length > 0 ? "is-invalid" : ""}/>
                              {isError.confirmPassword.length > 0 && (
                                  <Form.Control.Feedback type={"invalid"}>
                                    {isError.confirmPassword}
                                  </Form.Control.Feedback>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className={"text-left mt-3"}>
                          <Col sm={8}>
                              <Button type="submit" variant={"primary"}>Register</Button>
                          </Col>
                        </Row>
                        <Row className={"text-left mt-2"}>
                          <Col sm={12}>
                            <span>Already have an account?</span>
                            <Link to={"/login"} className={"ml-2"}>
                              <span>Login</span>
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

export default Register
