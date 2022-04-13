import ApplicationContainer from "../ApplicationContainer";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import React from "react";
import {faExchangeAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from "axios";
import {GET_CRYPTO_MARKET_DATA, GET_PORTFOLIO, POST_CONVERT_CRYPTO} from "../../config";
import {toast} from "react-toastify";

class Converter extends ApplicationContainer {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      cryptoCurrencies: [],
      portfolio: [],
      availableQuantity: 0,
      currentSourcePrice: 0,
      currentSourceName: 'Bitcoin',
      currentDestinationPrice: 0,
      currentDestinationName: 'Bitcoin',
      conversionPrice: 1,
      inverseConversionPrice: 1,
      formFields: {
        sourceCurrency: 'bitcoin',
        sourceAmount: 1,
        destinationCurrency: 'bitcoin',
        destinationAmount: 1,
      },
      errors: {
        sourceCurrency: '',
        sourceAmount: '',
        destinationCurrency: '',
        destinationAmount: '',
        availableQuantity: ''
      }
    }
  }

  componentDidMount() {
    this.getCryptoCurrencies();
    this.getPortfolio();
  }

  getCryptoCurrencies() {
    axios.get(GET_CRYPTO_MARKET_DATA, {
      params: {
        vs_currency: 'usd',
        per_page: '250'
      }
    }).then(result => {
      const cryptoCurrencies = result.data
      this.setState({cryptoCurrencies});
    })
  }

  getPortfolio() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      const headers = {
        'Authorization': 'Bearer ' + user.token
      }

      axios.get(GET_PORTFOLIO, {headers: headers}).then(result => {
        const portfolio = result.data.portfolio
        let availableQuantity = 0;
        const portfolioItem = portfolio.filter(portfolioItem => portfolioItem.cryptoId === this.state.formFields.sourceCurrency)[0];
        if (portfolioItem) {
          availableQuantity = portfolioItem.totalQuantity;
        }
        this.setState({portfolio, availableQuantity});
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          toast.error('Session is expired. Please login again.');
          localStorage.removeItem('user');
          this.props.history.push({
            pathname: '/login'
          });
        } else {
          const errorMessage = (error.response && error.response.data && error.response.data.message) || "Error occurred."
          toast.error(errorMessage);
        }
      });
    }
  }

  handleSourceCurrencyChange(event) {
    let state = this.state;
    const selectedSourceCurrency = event.target.value
    let availableQuantity = 0;
    const portfolioItem = this.state.portfolio.filter(portfolioItem => portfolioItem.cryptoId === selectedSourceCurrency)[0];
    if (portfolioItem) {
      availableQuantity = portfolioItem.totalQuantity;
    } else {
      availableQuantity = 0
    }
    if (state.formFields.destinationCurrency) {
      if (state.formFields.sourceAmount) {
        let destinationCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.destinationCurrency)[0]
        let destinationCurrencyCurrentPrice = destinationCurrency.current_price;
        state.currentDestinationPrice = destinationCurrencyCurrentPrice
        state.currentDestinationName = destinationCurrency.name

        let sourceCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === selectedSourceCurrency)[0]
        let sourceCurrencyCurrentPrice = sourceCurrency.current_price;
        state.currentSourcePrice = sourceCurrencyCurrentPrice;
        state.currentSourceName = sourceCurrency.name

        state.formFields.destinationAmount = Number((state.formFields.sourceAmount * sourceCurrencyCurrentPrice) / destinationCurrencyCurrentPrice).toFixed(4)
        state.conversionPrice = Number (sourceCurrencyCurrentPrice / destinationCurrencyCurrentPrice).toFixed(4);
        state.inverseConversionPrice = Number (destinationCurrencyCurrentPrice/ sourceCurrencyCurrentPrice).toFixed(4);
      }
    }
    state.availableQuantity = availableQuantity;
    state.formFields.sourceCurrency = selectedSourceCurrency
    this.validateForm('sourceCurrency', state);
    this.setState(state);
  }

  handleSourceAmountChange(event) {
    let state = this.state;
    state.formFields.sourceAmount = event.target.value
    if (state.formFields.destinationCurrency) {
      if (state.formFields.sourceAmount) {
        let destinationCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.destinationCurrency)[0]
        let destinationCurrencyCurrentPrice = destinationCurrency.current_price;

        let sourceCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.sourceCurrency)[0]
        let sourceCurrencyCurrentPrice = sourceCurrency.current_price;

        state.formFields.destinationAmount = Number((state.formFields.sourceAmount * sourceCurrencyCurrentPrice) / destinationCurrencyCurrentPrice).toFixed(4)
      } else {
        state.formFields.destinationAmount = null
      }
    } else {
      state.formFields.destinationAmount = null
    }
    this.validateForm('sourceAmount', state);
    this.setState(state);
  }

  handleDestinationCurrencyChange(event) {
    let state = this.state;
    state.formFields.destinationCurrency = event.target.value
    if (state.formFields.sourceCurrency) {
      if (state.formFields.sourceAmount) {
        let destinationCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.destinationCurrency)[0]
        let destinationCurrencyCurrentPrice = destinationCurrency.current_price;
        state.currentDestinationPrice = destinationCurrencyCurrentPrice;
        state.currentDestinationName = destinationCurrency.name;

        let sourceCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.sourceCurrency)[0]
        let sourceCurrencyCurrentPrice = sourceCurrency.current_price;
        state.currentSourcePrice = sourceCurrencyCurrentPrice;
        state.currentSourceName = sourceCurrency.name

        state.formFields.destinationAmount = Number((state.formFields.sourceAmount * sourceCurrencyCurrentPrice) / destinationCurrencyCurrentPrice).toFixed(4)
        state.conversionPrice = Number (sourceCurrencyCurrentPrice / destinationCurrencyCurrentPrice).toFixed(4);
        state.inverseConversionPrice = Number (destinationCurrencyCurrentPrice/ sourceCurrencyCurrentPrice).toFixed(4);
      }
    }
    this.validateForm('destinationCurrency', state);
    this.setState(state);
  }

  handleDestinationAmountChange(event) {
    let state = this.state;
    state.formFields.destinationAmount = event.target.value
    if (state.formFields.sourceCurrency) {
      let destinationCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.destinationCurrency)[0]
      let destinationCurrencyCurrentPrice = destinationCurrency.current_price;

      let sourceCurrency = this.state.cryptoCurrencies.filter(cryptoCurrency => cryptoCurrency.id === state.formFields.sourceCurrency)[0]
      let sourceCurrencyCurrentPrice = sourceCurrency.current_price;

      state.formFields.sourceAmount = Number((state.formFields.destinationAmount * destinationCurrencyCurrentPrice) / sourceCurrencyCurrentPrice).toFixed(4)
    }
    this.validateForm('destinationAmount', state);
    this.setState(state);
  }

  validateForm(name, state) {
    let isValid = true;
    switch (name) {
      case 'sourceCurrency':
        state.errors.sourceCurrency = '';
        if (!state.formFields.sourceCurrency) {
          isValid = false;
          state.errors.sourceCurrency = "Please select the currency that you want to convert from."
        }
        break;
      case 'destinationCurrency':
        state.errors.destinationCurrency = '';
        if (!state.formFields.destinationCurrency) {
          isValid = false;
          state.errors.destinationCurrency = "Please select the currency that you want to convert from."
        }
        break;
      case 'sourceAmount':
        state.errors.sourceAmount = '';
        if (!state.formFields.sourceAmount) {
          isValid = false;
          state.errors.sourceAmount = "Please enter the amount of currency that you want to convert from."
        }
        break;
      case 'destinationAmount':
        state.errors.destinationAmount = '';
        if (!state.formFields.destinationAmount) {
          isValid = false;
          state.errors.destinationAmount = "Please enter the amount of currency that you want to convert to."
        }
        break;
      case 'availableQuantity':
        state.errors.availableQuantity = '';
        if (state.formFields.sourceAmount && state.formFields.sourceAmount > state.availableQuantity) {
          isValid = false;
          state.errors.availableQuantity = "You do not have enough balance for conversion."
        }
        break;
    }
    this.setState(state);
    return isValid;
  }

  convertCrypto() {
    let state = this.state
    const isValid = this.validateForm('sourceCurrency', state) && this.validateForm('sourceAmount', state) &&
      this.validateForm('destinationCurrency', state) && this.validateForm('destinationAmount', state) && this.validateForm('availableQuantity', state);
    if (isValid) {
      const postObject = {
        sourceCurrency: state.formFields.sourceCurrency,
        sourceAmount: parseFloat(state.formFields.sourceAmount),
        sourcePrice: parseFloat(state.formFields.sourceAmount) * state.currentSourcePrice,
        destinationCurrency: state.formFields.destinationCurrency,
        destinationAmount: parseFloat(state.formFields.destinationAmount),
        destinationPrice: parseFloat(state.formFields.destinationAmount) * state.currentDestinationPrice,
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        const headers = {
          'Authorization': 'Bearer ' + user.token
        }

        axios.post(POST_CONVERT_CRYPTO, postObject, {headers: headers}).then(result => {
          this.props.history.push({
            pathname: '/portfolio'
          });
        }).catch((error) => {
          if (error.response && error.response.status === 401) {
            toast.error('Session is expired. Please login again.');
            localStorage.removeItem('user');
            this.props.history.push({
              pathname: '/login'
            });
          } else {
            const errorMessage = (error.response && error.response.data && error.response.data.message) || "Error occurred."
            toast.error(errorMessage);
          }
        });
      }
    }
  }

  render() {
    return (
      <section>
        {super.render()}
        <Row className={"mt-3"}>
          <Col sm={12}>
            <h2>Convert</h2>
            <hr/>
          </Col>
          <Col sm={7}>
            <Card>
              <Card.Body>
                <Form>
                  <Row className={"text-left mt-4"}>
                    <Col sm={4}>
                      <Form.Group controlId="formBasicFrom">
                        <Form.Label><strong>From</strong></Form.Label>
                        <select className={this.state.errors.sourceCurrency.length > 0 ? "form-control is-invalid" : "form-control"}
                                onChange={this.handleSourceCurrencyChange.bind(this)}
                                value={this.state.formFields.sourceCurrency}>
                          {this.state.cryptoCurrencies.map(cryptoCurrency => {
                            return <option key={cryptoCurrency.id} value={cryptoCurrency.id}>
                              {cryptoCurrency.name + ' (' + cryptoCurrency.symbol.toUpperCase() + ')'}
                            </option>
                          })}
                        </select>
                        {this.state.errors.sourceCurrency.length > 0 && (
                          <Form.Control.Feedback type={"invalid"}>
                            {this.state.errors.sourceCurrency}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                    <Col sm={8}>
                      <Form.Group controlId="formBasicFrom">
                        <Form.Label className={"float-right"}><strong>Available: {Number(this.state.availableQuantity).toFixed(2)}</strong></Form.Label>
                        <Form.Control type="text" placeholder="Enter amount"
                                      className={this.state.errors.sourceAmount.length > 0 ? "is-invalid": ""}
                                      onChange={this.handleSourceAmountChange.bind(this)}
                                      value={this.state.formFields.sourceAmount}/>
                        {this.state.errors.sourceAmount.length > 0 && (
                          <Form.Control.Feedback type={"invalid"}>
                            {this.state.errors.sourceAmount}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                    <Col sm={12} className={"text-center"}>
                      <FontAwesomeIcon
                        size={"2x"}
                        rotation={90}
                        icon={faExchangeAlt}
                        className={"secondary"}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Group controlId="formBasicTo">
                        <Form.Label><strong>To</strong></Form.Label>
                        <select className={this.state.errors.destinationCurrency.length > 0 ? "form-control is-invalid" : "form-control"}
                          onChange={this.handleDestinationCurrencyChange.bind(this)}
                          value={this.state.formFields.destinationCurrency}>
                          {this.state.cryptoCurrencies.map(cryptoCurrency => {
                            return <option key={cryptoCurrency.id} value={cryptoCurrency.id}>{cryptoCurrency.name + ' (' + cryptoCurrency.symbol.toUpperCase() + ')'}</option>
                          })}
                        </select>
                        {this.state.errors.destinationCurrency.length > 0 && (
                          <Form.Control.Feedback type={"invalid"}>
                            {this.state.errors.destinationCurrency}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                    <Col sm={8}>
                      <Form.Group controlId="formBasicTo">
                        <Form.Label><strong>&nbsp;</strong></Form.Label>
                        <Form.Control type="text" placeholder="Enter amount"
                                      className={this.state.errors.destinationAmount.length > 0 ? "is-invalid": ""}
                                      onChange={this.handleDestinationAmountChange.bind(this)}
                                      value={this.state.formFields.destinationAmount}/>
                        {this.state.errors.destinationAmount.length > 0 && (
                          <Form.Control.Feedback type={"invalid"}>
                            {this.state.errors.destinationAmount}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={5}>
            <Card className={"h-100"}>
              <Card.Body>
                <Card.Title>Conversion Details</Card.Title>
                <hr/>
                <Row className={"ml-0 mt-2"}>
                  <Col sm={4} className={"pl-0"}>
                    <span><strong>Current Rate:</strong></span>
                  </Col>
                  <Col sm={8}>
                    <span>1 {this.state.currentSourceName} = {this.state.conversionPrice} {this.state.currentDestinationName}</span>
                  </Col>
                </Row>
                <Row className={"mt-2"}>
                  <Col sm={4} className={"pl-0"}>
                    <span><strong>Inverse Rate:</strong></span>
                  </Col>
                  <Col sm={8}>
                    <span>1 {this.state.currentDestinationName} = {this.state.inverseConversionPrice} {this.state.currentSourceName}</span>
                  </Col>
                </Row>
                <Row className={"ml-0 mt-2"}>
                  <Col sm={4} className={"pl-0"}>
                    <span><strong>You will receive:</strong></span>
                  </Col>
                  <Col sm={8}>
                    <span>{this.state.formFields.destinationAmount} {this.state.currentDestinationName}</span>
                  </Col>
                </Row>
                <Row className={"ml-0 mt-2"}>
                  <Col sm={12} className={"pl-0"}>
                    <Form.Group>
                      <Form.Control type="text" placeholder="Enter amount" hidden
                                    className={this.state.errors.availableQuantity.length > 0 ? "is-invalid": ""}/>
                      {this.state.errors.availableQuantity.length > 0 && (
                        <Form.Control.Feedback type={"invalid"}>
                          {this.state.errors.availableQuantity}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row className={"mt-4"}>
                  <Col sm={3}>

                  </Col>
                  <Col sm={3} className={"mt-2 text-center"}>
                    <Button variant={"danger"} type={"button"} block>Refresh</Button>
                  </Col>
                  <Col sm={3} className={"mt-2 text-center"}>
                    <Button variant={"primary"} type={"button"} block onClick={this.convertCrypto.bind(this)}>Convert</Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    )
  }

}
export default Converter