import React from "react";
import ApplicationContainer from "../ApplicationContainer";
import {Button, ButtonGroup, ButtonToolbar, Card, Col, Row,Modal,
  Form,} from "react-bootstrap";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import "./past-performance.css";
import axios from "axios";
import {ADD_TO_WATCHLIST, GET_WATCHLIST,POST_BUY_CRYPTO} from "../../config";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export class PastPerformance extends ApplicationContainer {
  constructor(props) {
    super(props);
    this.state = {
      currency: this.props.location.state,
      selectedOption: "1d",
      data: [],
      isInWatchList: false,
      buyModal: {
        show: false,
        selectedCryptoCurrency: null,
        selectedCryptoCurrencyQuantity: null,
      },
      errors: {
        selectedCryptoCurrencyQuantity: "",
      },
    };
    this.chartOptions = ["1d", "1w", "1m", "6m", "1y", "5y"];
    console.log(this.state.currency);
  }

  componentDidMount = () => {
    // this.getCurrencyData();
    this.loadData(this.state.selectedOption);
    this.getWatchListData();
  };

  formatDate = (date) => {
    var a = new Date(date);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = "";
    if (this.state.selectedOption === "1d") {
      time =
        date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    } else {
      time = date + " " + month + " " + year;
    }

    return time;
  };

  getData = (URL) => {
    var finalData = [];
    axios
      .get(URL)
      .then((result) => {
        var data = result.data.prices;
        data.forEach((price) => {
          var final_date = this.formatDate(price[0]);

          finalData.push({pv: price[1], time: final_date});
        });
        this.setState({data: finalData});
      })
      .catch((error) => {
        console.error(error);
      });
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


  getWatchListData = () => {
    let watchList;
    let cryptoIds = [];
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      const headers = {
        'Authorization': 'Bearer ' + user.token
      }

      axios
        .get(GET_WATCHLIST, {headers: headers})
        .then((result) => {
          watchList = result.data.watchList;
          cryptoIds = [];
          watchList.forEach((watchListItem) => {
            cryptoIds.push(watchListItem["cryptoId"]);
          });
          let state = {...this.state};
          if (cryptoIds.includes(state.currency.id)) {
            state.isInWatchList = true;
          }
          this.setState(state);
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
  };

  loadData = (selectedOption) => {
    let state = {...this.state};
    state.selectedOption = selectedOption;
    let coin_id = this.state.currency.id;
    var data = [];
    let URL = "";
    switch (selectedOption) {
      case "1d":
        URL =
          "https://api.coingecko.com/api/v3/coins/" +
          coin_id +
          "/market_chart?vs_currency=usd&days=1&interval=hourly";
        data = this.getData(URL);
        break;
      case "1w":
        URL =
          "https://api.coingecko.com/api/v3/coins/" +
          coin_id +
          "/market_chart?vs_currency=usd&days=7&interval=hourly";
        data = this.getData(URL);
        break;
      case "1m":
        URL =
          "https://api.coingecko.com/api/v3/coins/" +
          coin_id +
          "/market_chart?vs_currency=usd&days=30";
        data = this.getData(URL);
        break;
      case "6m":
        URL =
          "https://api.coingecko.com/api/v3/coins/" +
          coin_id +
          "/market_chart?vs_currency=usd&days=183";
        data = this.getData(URL);
        break;
      case "1y":
        URL =
          "https://api.coingecko.com/api/v3/coins/" +
          coin_id +
          "/market_chart?vs_currency=usd&days=365";
        data = this.getData(URL);
        break;
      case "5y":
        URL =
          "https://api.coingecko.com/api/v3/coins/" +
          coin_id +
          "/market_chart?vs_currency=usd&days=1825";
        data = this.getData(URL);
        break;
    }
    state.data = data;
    this.setState(state);
  };

  addToWatchList = (cryptoId) => {
    const postData = {cryptoId};
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      const headers = {
        'Authorization': 'Bearer ' + user.token
      }

      axios
        .post(ADD_TO_WATCHLIST, postData, {headers: headers})
        .then((result) => {
          console.log(result);
          let state = {...this.state};
          state.isInWatchList = true;
          this.setState(state);
          toast.success(
            this.state.currency.name + " added to watchlist successfully!"
          );
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
  };

  render() {
    let currency = {...this.state.currency};
    return (
      <section>
        {super.render()}
        <Row className={"mt-3"}>
          <Col sm={12}>
            <h2>
              {currency.name} ({currency.symbol.toUpperCase()})
            </h2>
            <hr/>
          </Col>
        </Row>
        <Row className={"mt-3"}>
          <Col>
            <h5>
              <strong>Performance</strong>
              <br></br>
              <h6 className={"text-secondary"}>All prices are in USD</h6>
            </h5>
          </Col>
        </Row>
        <section>
          <Row className={"mt-3"}>
            <Col sm={5}>
              <ButtonToolbar aria-label="Toolbar with button groups">
                <ButtonGroup className="mr-2" aria-label="First group">
                  {this.chartOptions.map((chartOption) => {
                    return (
                      <Button
                        key={chartOption}
                        variant={
                          chartOption === this.state.selectedOption
                            ? "primary"
                            : "outline-primary"
                        }
                        onClick={() => {
                          this.loadData(chartOption);
                        }}
                      >
                        {chartOption}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </ButtonToolbar>
            </Col>
          </Row>
        </section>
        <section>
          <Row className={"mt-2"}>
            <Col sm={8}>
              <ResponsiveContainer height={400}>
                <LineChart data={this.state.data}>
                  <XAxis dataKey={"time"}/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Line
                    name={this.state.currency.name}
                    type="monotone"
                    dataKey="pv"
                    stroke="#8884d8"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Col>
            <Col sm={4} height={200}>
              <Card className={"performance mt-2"}>
                <Card.Body>
                  <Row className={"mt-2"}>
                    <Col>
                      <h5 className={"high"}>
                        <u>24h High</u>
                      </h5>
                      <span>${this.state.currency.high_24h}</span>
                    </Col>
                    <Col>
                      <h5 className={"low"}>
                        <u>24h Low</u>
                      </h5>
                      <span>${this.state.currency.low_24h}</span>
                    </Col>
                  </Row>
                  <Row className={"mt-2"}>
                    <Col>
                      <h5>
                        <u>Market Capital</u>
                      </h5>
                      <span>{this.state.currency.market_cap}</span>
                    </Col>
                    <Col>
                      <h5>
                        <u>Capital Rank</u>
                      </h5>
                      <span>{this.state.currency.market_cap_rank}</span>
                    </Col>
                  </Row>
                  <Row className={"mt-2"}>
                    <Col>
                      <h5>
                        <u>Current Price</u>
                      </h5>
                      <span>$ {this.state.currency.current_price}</span>
                    </Col>
                  </Row>
                  <Row className={"mt-2"}>
                    <Col className={"text-center"}>
                      <Button variant={"primary"} onClick={() =>
                            this.showModal(this.state.currency)
                          }>Buy</Button>
                    </Col>
                  </Row>
                  {!this.state.isInWatchList ? (
                    <Row className={"mt-2"}>
                      <Col className={"text-center"}>
                        <Button
                          variant={"secondary"}
                          onClick={() =>
                            this.addToWatchList(this.state.currency.id)
                          }
                        >
                          Add to Watchlist
                        </Button>
                      </Col>
                    </Row>
                  ) : (
                    <></>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
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

export default PastPerformance;
