import React from "react";
import ApplicationContainer from "../ApplicationContainer";
import {
  Row,
  Col,
  Table,
  Image,
  Button,
  FormControl,
  Modal,
  Form,
  InputGroup,
} from "react-bootstrap";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import "./currentMarketTrend.css";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { POST_BUY_CRYPTO } from "../../config";
import {toast} from "react-toastify";
const MARKET_TREND_API_CALL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true";

export class CurrentMarketTrend extends ApplicationContainer {
  constructor(props) {
    super(props);
    this.state = {
      currencies: [],
      originalCurrencies: [],
      buyModal: {
        show: false,
        selectedCryptoCurrency: null,
        selectedCryptoCurrencyQuantity: null,
      },
      errors: {
        selectedCryptoCurrencyQuantity: "",
      },
    };
  }

  componentDidMount() {
    this.get50Currencies();
  }
  async get50Currencies() {
    await axios.get(MARKET_TREND_API_CALL).then((response) => {
      const currencies = response.data;
      const originalCurrencies = currencies;
      this.setState({ currencies, originalCurrencies });
      this.createPastPerformanceChartData();
    });
  }

  searchCurrency = (value) => {
    var state = { ...this.state };
    console.log(state);
    this.setState({
      currencies: this.state.originalCurrencies.filter((currency) =>
        currency.name.toLowerCase().includes(value.toLowerCase())
      ),
    });
    console.log(state);
  };

  createPastPerformanceChartData() {
    const currencies = this.state.currencies;
    console.log(currencies);
    currencies.forEach((currency) => {
      let pastPerformanceChart = [];
      currency.sparkline_in_7d.price.forEach((sparkLineData) => {
        pastPerformanceChart.push({ pv: sparkLineData });
      });
      currency.sparkline_in_7d.price = pastPerformanceChart;
    });
    this.setState({ currencies });
  }

  goToPastPerformance = (currency) => {
    console.log(currency);
    this.props.history.push({ pathname: "/past-performance", state: currency });
  };

  cryptoCurrencyQuantityChangeListener = (e) => {
    const value = e.target.value;
    let state = { ...this.state };
    state.buyModal.selectedCryptoCurrencyQuantity = value;
    this.validateQuantity();
    this.setState(state);
  };

  showModal = (event, item) => {
    let state = { ...this.state };
    state.buyModal.show = true;
    state.buyModal.selectedCryptoCurrency = event;
    this.setState(state);
  };

  closeModal = () => {
    let state = this.state;
    state.buyModal.show = false;
    this.setState(state);
  };

  validateQuantity() {
    let state = this.state;
    state.errors.selectedCryptoCurrencyQuantity = "";
    if (!state.buyModal.selectedCryptoCurrencyQuantity) {
      state.errors.selectedCryptoCurrencyQuantity =
        "Please enter quantity greater than 0.";
    }
    this.setState(state);
  }

  buyCryptoCurrency = () => {
    this.validateQuantity();
    let state = this.state;
    console.log(state.buyModal)
    if (!state.errors.selectedCryptoCurrencyQuantity) {
      const postData = {
        cryptoId: state.buyModal.selectedCryptoCurrency.id,
        transactionQuantity: state.buyModal.selectedCryptoCurrencyQuantity,
        transactionPrice:
          state.buyModal.selectedCryptoCurrencyQuantity *
          state.buyModal.selectedCryptoCurrency.current_price,
      };
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        const headers = {
          'Authorization': 'Bearer ' + user.token
        }

      axios
        .post(POST_BUY_CRYPTO, postData, {
          headers: headers
        })
        .then((result) => {
          this.props.history.push("/portfolio");
          this.closeModal();
        })
        .catch((error) => {
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
  };

  render() {
    return (
      <section>
        {super.render()}
        <Row className={"mt-3"}>
          <Col sm={8}>
            <h2>Browse Currencies</h2>
          </Col>
          <Col sm={4}>
            <InputGroup>
              <FormControl
                placeholder="Search"
                aria-label="Search"
                aria-describedby="search-control"
                className={"float-right"}
                onChange={(e) => {
                  this.searchCurrency(e.target.value);
                }}
              />
              <InputGroup.Append>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Col>
            <hr></hr>
          </Col>
        </Row>
        <Row className={"mt-3"}>
          <Col sm>
            <Table bordered variant={"light"}>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Price (Past 24h)</th>
                  <th>Past 7 Days Performance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.state.currencies.map((cryptoCurrency) => {
                  return (
                    <tr key={cryptoCurrency.id}>
                      <td
                        onClick={() => {
                          this.goToPastPerformance(cryptoCurrency);
                        }}
                      >
                        <Image
                          src={cryptoCurrency.image}
                          className={"browse-table-image"}
                        />{" "}
                        <span>{cryptoCurrency.name}</span>
                        <span className={"ml-2 text-secondary"}>
                          {cryptoCurrency.symbol.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            cryptoCurrency.price_change_percentage_24h >= 0
                              ? "positive"
                              : "negative"
                          }
                        >
                          {cryptoCurrency.price_change_percentage_24h.toFixed(
                            2
                          )}{" "}
                          %
                        </span>
                        <span
                          className={
                            cryptoCurrency.price_change_24h >= 0
                              ? "positive ml-1"
                              : "negative ml-1"
                          }
                        >
                          ({cryptoCurrency.price_change_24h.toFixed(2)})
                        </span>
                        <span className={"ml-2"}>
                          ${cryptoCurrency.current_price}
                        </span>
                      </td>
                      <td
                        onClick={() => {
                          this.goToPastPerformance(cryptoCurrency);
                        }}
                      >
                        <ResponsiveContainer width={200} height={20}>
                          <LineChart
                            width="100%"
                            height={100}
                            data={cryptoCurrency.sparkline_in_7d.price}
                          >
                            <Line
                              type="monotone"
                              dataKey="pv"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={false}
                            />
                            <YAxis
                              type="number"
                              domain={["dataMin", "dataMax"]}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </td>
                      <td>
                        <Button
                          variant={"primary"}
                          onClick={() => this.showModal(cryptoCurrency)}
                        >
                          Buy
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Modal
          show={this.state.buyModal.show}
          animation={false}
          onHide={this.closeModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Enter Quantity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className={"m-0"}>
                <strong>Currency</strong>
              </Form.Label>
              <Form.Control
                plaintext
                readOnly
                defaultValue={this.state.buyModal.selectedCryptoCurrency?.name}
                className={"p-0"}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                <strong>Quantity : </strong>
              </Form.Label>
              <Form.Control
                name={"modalRawMaterialQuantity"}
                type="number"
                step=".01"
                onChange={this.cryptoCurrencyQuantityChangeListener}
                className={
                  this.state.errors.selectedCryptoCurrencyQuantity.length > 0
                    ? "is-invalid"
                    : ""
                }
                placeholder="Enter Quantity"
              />
              {this.state.errors.selectedCryptoCurrencyQuantity.length > 0 && (
                <Form.Control.Feedback type={"invalid"}>
                  {this.state.errors.selectedCryptoCurrencyQuantity}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.buyCryptoCurrency}>
              Confirm Order
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }
}

export default CurrentMarketTrend;
