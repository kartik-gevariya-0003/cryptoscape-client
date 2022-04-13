import React from "react";
import {Button, Card, Col, Form, Image, Modal, Row, Table} from "react-bootstrap";
import ApplicationContainer from "../ApplicationContainer";
import {Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, YAxis} from "recharts";
import axios from "axios";
import {GET_CRYPTO_MARKET_DATA, GET_PORTFOLIO, GET_WATCHLIST, POST_SELL_CRYPTO, POST_BUY_CRYPTO} from "../../config";
import {toast} from "react-toastify";

class Portfolio extends ApplicationContainer {
  constructor(props) {
    super(props);
    this.state = {
      portfolio: [],
      totalCurrentValue: 0,
      totalInvestedValue: 0,
      portfolioChartData: [],
      watchList: [],
      sellModal: {
        show: false,
        selectedCryptoCurrency: null,
        selectedCryptoCurrencyQuantity: null
      },
      buyModal: {
        show: false,
        selectedCryptoCurrency: null,
        selectedCryptoCurrencyQuantity: null
      },
      errors: {
        selectedCryptoCurrencyQuantity: ''
      },
      pieChartColors: [
        '#035384AA',
        '#4EA1D3',
        '#BC3347AA',
        '#119696AA',
        '#32499EAA',
        '#931CA0AA',
        '#DD9A05AA',
        '#6919A3AA'
      ]
    }
  }

  componentDidMount() {
    this.getPortfolioData();
    this.getWatchListData();
    this.createChartData();
  }

  getPortfolioData() {
    let portfolio = [];
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      const headers = {
        'Authorization': 'Bearer ' + user.token
      }

      axios.get(GET_PORTFOLIO, {headers: headers}).then(result => {
        const cryptoIds = [];
        result.data.portfolio.forEach(portfolioItem => {
          portfolio.push({
            id: portfolioItem.id,
            cryptoId: portfolioItem.cryptoId,
            availableQuantity: portfolioItem['totalQuantity'],
            investedBalance: portfolioItem['totalPrice']
          })
          cryptoIds.push(portfolioItem['cryptoId']);
        })
        axios.get(GET_CRYPTO_MARKET_DATA, {
          params: {
            vs_currency: 'usd',
            ids: cryptoIds.join(),
          }
        }).then(result => {
          result.data.forEach(dataItem => {
            const indexOfPortfolioItem = portfolio.map(item => item.cryptoId).indexOf(dataItem.id);
            if (indexOfPortfolioItem > -1) {
              portfolio[indexOfPortfolioItem].name = dataItem.name;
              portfolio[indexOfPortfolioItem].currentPrice = dataItem.current_price;
              portfolio[indexOfPortfolioItem].imgUrl = dataItem.image;
              portfolio[indexOfPortfolioItem].code = dataItem.symbol.toUpperCase();
              portfolio[indexOfPortfolioItem].currentBalance = Number(portfolio[indexOfPortfolioItem].availableQuantity * dataItem['current_price']).toFixed(2);
            }
          })
          this.setState({portfolio});
          this.createChartData();
          this.calculateTotalValues();
        })
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

  getWatchListData() {
    let watchList;
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      const headers = {
        'Authorization': 'Bearer ' + user.token
      }

      axios.get(GET_WATCHLIST, {headers: headers}).then(result => {
        watchList = result.data.watchList;
        const cryptoIds = [];
        watchList.forEach(watchListItem => {
          cryptoIds.push(watchListItem['cryptoId']);
        })
        if (cryptoIds.length > 0) {
          axios.get(GET_CRYPTO_MARKET_DATA, {
            params: {
              vs_currency: 'usd',
              ids: cryptoIds.join(),
              order: 'market_cap_desc',
              sparkline: true
            }
          }).then(result => {
            watchList = result.data;
            this.setState({watchList});
            this.createPastPerformanceChartData();
          })
        }
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

  calculateTotalValues() {
    let totalCurrentValue = 0;
    let totalInvestedValue = 0;
    this.state.portfolio.forEach(portfolioItem => {
      totalCurrentValue += parseFloat(portfolioItem.currentBalance);
      totalInvestedValue += parseFloat(portfolioItem.investedBalance);
    })
    this.setState({
      totalCurrentValue: Number(totalCurrentValue).toFixed(2),
      totalInvestedValue: Number(totalInvestedValue).toFixed(2)
    });
  }

  createChartData() {
    const portfolioChartData = []
    this.state.portfolio.forEach((portfolioItem, index) => {
      portfolioChartData.push({
        name: portfolioItem.name,
        value: parseFloat(Number(portfolioItem.availableQuantity).toFixed(4)),
        fill: this.state.pieChartColors[index]
      })
    });
    this.setState({portfolioChartData});
  }

  createPastPerformanceChartData() {
    const watchList = this.state.watchList
    watchList.forEach(watchListItem => {
      let pastPerformanceChart = []
      const sparkLineData = watchListItem['sparkline_in_7d'].price
      sparkLineData.forEach(sparkLineDataItem => {
        pastPerformanceChart.push({pv: sparkLineDataItem})
      })
      watchListItem.sparkLine = pastPerformanceChart;
    });
    this.setState({watchList})
  }

  cryptoCurrencyQuantityChangeListener = (e) => {
    const value = e.target.value;
    let state = {...this.state};
    state.sellModal.selectedCryptoCurrencyQuantity = value;
    this.validateQuantity();
    this.setState(state)
  }

  buyCryptoCurrencyQuantityChangeListener= (e) => {
    const value = e.target.value;
    let state = {...this.state};
    state.buyModal.selectedCryptoCurrencyQuantity = value;
    this.buyValidateQuantity();
    this.setState(state)
  }

  showModal = (event, item) => {
    let state = {...this.state};
    state.sellModal.show = true;
    state.sellModal.selectedCryptoCurrency = event;
    this.setState(state);
  }

  buyShowModal= (event, item) => {
    let state = {...this.state};
    state.buyModal.show = true;
    state.buyModal.selectedCryptoCurrency = event;
    this.setState(state);
  }

  buyCloseModal = () => {
    let state = this.state;
    state.buyModal.show = false;
    this.setState(state);
  }

  buyCryptoCurrency = () => {
    this.buyValidateQuantity();
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
          toast.success('Transaction completed successfully.');
          this.getPortfolioData();
          this.buyCloseModal();
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
    // this.props.history.push("/portfolio");
  };

  buyValidateQuantity() {
    let state = this.state;
    state.errors.selectedCryptoCurrencyQuantity = "";
    if (!state.buyModal.selectedCryptoCurrencyQuantity) {
      state.errors.selectedCryptoCurrencyQuantity =
        "Please enter quantity greater than 0.";
    }
    this.setState(state);
  }

  closeModal = () => {
    let state = this.state;
    state.sellModal.show = false;
    this.setState(state);
  }

  validateQuantity() {
    let state = this.state;
    state.errors.selectedCryptoCurrencyQuantity = '';
    if (!state.sellModal.selectedCryptoCurrencyQuantity) {
      state.errors.selectedCryptoCurrencyQuantity = "Please enter quantity greater than 0."
    } else if (state.sellModal.selectedCryptoCurrencyQuantity && state.sellModal.selectedCryptoCurrencyQuantity > state.sellModal.selectedCryptoCurrency.availableQuantity) {
      state.errors.selectedCryptoCurrencyQuantity = "You cannot enter value that is greater than available quantity."
    }
    this.setState(state);
  }

  sellCryptoCurrency = () => {
    this.validateQuantity()
    let state = this.state;
    if (!state.errors.selectedCryptoCurrencyQuantity) {
      const postData = {
        cryptoId: state.sellModal.selectedCryptoCurrency.cryptoId,
        transactionQuantity: state.sellModal.selectedCryptoCurrencyQuantity,
        transactionPrice: state.sellModal.selectedCryptoCurrencyQuantity * state.sellModal.selectedCryptoCurrency.currentPrice
      }
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        const headers = {
          'Authorization': 'Bearer ' + user.token
        }

        axios.post(POST_SELL_CRYPTO, postData, {headers: headers}).then(result => {
          toast.success('Transaction completed successfully.');
          this.getPortfolioData();
          this.closeModal();
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
        <section>
          <Row className={"mt-3"}>
            <Col sm={12}>
              <h2>Portfolio</h2>
              <hr/>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <span><strong>Total Invested Value:</strong></span>
              <span className={"ml-1"}>${this.state.totalInvestedValue}</span>
            </Col>
            <Col sm={12} className={"mt-1"}>
              <span><strong>Total Current Value:</strong></span>
              <span className={"ml-1"}>${this.state.totalCurrentValue}</span>
            </Col>
          </Row>
          <Row className={"mt-3"}>
            <Col sm={8}>
              <Table bordered variant={"light"}>
                <thead>
                <tr>
                  <th>Currency</th>
                  <th/>
                  <th>Available Quantity</th>
                  <th>Current Balance</th>
                  <th>Invested Balance</th>
                  <th/>
                </tr>
                </thead>
                <tbody className={"w-100"}>
                {
                  this.state.portfolio.map(portfolioItem => {
                    return <tr key={portfolioItem.id}>
                      <td>
                        <div>
                          <Image src={portfolioItem.imgUrl} width="20px"/>
                          <span className={"ml-2 align-middle"}>{portfolioItem.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={"ml-2 align-middle text-secondary"}>{portfolioItem.code}</span>
                      </td>
                      <td className={"text-center"}>
                        {Number(portfolioItem.availableQuantity).toFixed(4)}
                      </td>
                      <td className={"text-center"}>
                        ${Number(portfolioItem.currentBalance).toFixed(4)}
                      </td>
                      <td className={"text-center"}>
                        ${Number(portfolioItem.investedBalance).toFixed(4)}
                      </td>
                      <td className={"justify-content-end"}>
                        <Button variant={"primary"} onClick={this.showModal.bind(this, portfolioItem)}>Sell</Button>
                      </td>
                    </tr>
                  })
                }
                </tbody>
              </Table>
            </Col>
            <Col sm={4}>
              <Card>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={262}>
                    <PieChart width="100%" height={220}>
                      <Pie data={this.state.portfolioChartData} dataKey={"value"} nameKey={"name"} label/>
                      <Tooltip/>
                      <Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
        <section>
          <Row className={"mt-3"}>
            <Col sm={12}>
              <h2>Watchlist</h2>
              <hr/>
            </Col>
          </Row>
          <Row className={"mt-3"}>
            <Col sm={12}>
              <Table bordered variant={"light"}>
                <thead>
                <tr>
                  <th>Currency</th>
                  <th/>
                  <th>24h Change</th>
                  <th>Current Price</th>
                  <th>Past Performance (Last 7 days)</th>
                  <th/>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.watchList.map(watchListItem => {
                    return <tr key={watchListItem.id}>
                      <td>
                        <div>
                          <Image src={watchListItem.image} width="20px"/>
                          <span className={"ml-2 align-middle"}>{watchListItem.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={"ml-2 align-middle text-secondary"}>{watchListItem.symbol.toUpperCase()}</span>
                      </td>
                      <td>
                        <div className={
                          Number(watchListItem['price_change_percentage_24h']) >= 0
                            ? "positive"
                            : "negative"
                        }>
                          <span
                            className={
                              Number(watchListItem['price_change_percentage_24h']) >= 0
                                ? "align-middle positive"
                                : "align-middle negative"
                            }
                          >{Number(watchListItem['price_change_percentage_24h']).toFixed(3)}</span>
                          <span className={"ml-1 align-middle"}>%</span>
                          <span className={"align-middle text-secondary ml-2"}>(</span>
                          <span
                            className={"ml-1 align-middle text-secondary"}>{Number(watchListItem['price_change_24h']).toFixed(3)}</span>
                          <span className={"ml-1 align-middle text-secondary"}>)</span>
                        </div>
                      </td>
                      <td>
                        <span className={"ml-1 align-middle"}>${watchListItem['current_price']}</span>
                      </td>
                      <td>
                        <ResponsiveContainer width={200} height={20}>
                          <LineChart width="100%" height={100} data={watchListItem.sparkLine}>
                            <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={2} dot={false}/>
                            <YAxis type="number" domain={['dataMin', 'dataMax']} axisLine={false}/>
                          </LineChart>
                        </ResponsiveContainer>
                      </td>
                      <td>
                        <Button variant={"primary"} onClick={this.buyShowModal.bind(this, watchListItem)}>Buy</Button>
                      </td>
                    </tr>
                  })
                }
                </tbody>
              </Table>
            </Col>
          </Row>
        </section>
        <Modal show={this.state.sellModal.show} animation={false} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Enter Quantity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className={"m-0"}><strong>Currency</strong></Form.Label>
              <Form.Control plaintext readOnly
                            defaultValue={this.state.sellModal.selectedCryptoCurrency?.name}
                            className={"p-0"}/>
            </Form.Group>
            <Form.Group>
              <Form.Label><strong>Quantity : </strong></Form.Label>
              <Form.Control
                name={"modalRawMaterialQuantity"}
                type="number"
                step=".01"
                onChange={this.cryptoCurrencyQuantityChangeListener}
                className={this.state.errors.selectedCryptoCurrencyQuantity.length > 0 ? "is-invalid" : ""}
                placeholder="Enter Quantity"/>
              {this.state.errors.selectedCryptoCurrencyQuantity.length > 0 && (
                <Form.Control.Feedback
                  type={"invalid"}>{this.state.errors.selectedCryptoCurrencyQuantity}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.sellCryptoCurrency}>Sell</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.buyModal.show} animation={false} onHide={this.buyCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Enter Quantity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label className={"m-0"}><strong>Currency</strong></Form.Label>
              <Form.Control plaintext readOnly
                            defaultValue={this.state.buyModal.selectedCryptoCurrency?.name}
                            className={"p-0"}/>
            </Form.Group>
            <Form.Group>
              <Form.Label><strong>Quantity : </strong></Form.Label>
              <Form.Control
                name={"modalRawMaterialQuantity"}
                type="number"
                step=".01"
                onChange={this.buyCryptoCurrencyQuantityChangeListener}
                className={this.state.errors.selectedCryptoCurrencyQuantity.length > 0 ? "is-invalid" : ""}
                placeholder="Enter Quantity"/>
              {this.state.errors.selectedCryptoCurrencyQuantity.length > 0 && (
                <Form.Control.Feedback
                  type={"invalid"}>{this.state.errors.selectedCryptoCurrencyQuantity}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.buyCryptoCurrency}>Buy</Button>
          </Modal.Footer>
        </Modal>
      </section>
    )
  }
}

export default Portfolio
