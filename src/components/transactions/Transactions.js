import React from "react";
import {Col, Image, Row, Table,} from "react-bootstrap";
import ApplicationContainer from "../ApplicationContainer";
import axios from "axios";
import {GET_CRYPTO_MARKET_DATA, GET_TRANSACTIONS} from "../../config";
import {toast} from "react-toastify";
import Moment from 'moment';


class Transactions extends ApplicationContainer {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
    };
  }

  componentDidMount() {
    this.getTransactionData();
  }

  getTransactionData() {
    let transactions = [];

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      const headers = {
        'Authorization': 'Bearer ' + user.token
      }

      axios
        .get(GET_TRANSACTIONS, {
          headers: headers
        })
        .then((result) => {
          const cryptoIds = [];
          result.data.transactions.forEach((transaction) => {
            transactions.push({
              id: transaction.id,
              cryptoId: transaction.cryptoId,
              date: transaction["transactionDate"],
              transactionType: transaction["transactionType"],
              transactionAmount: transaction["transactionAmount"],
              transactionQuantity: transaction["transactionQuantity"],
            });
            cryptoIds.push(transaction["cryptoId"]);
          })
          axios.get(GET_CRYPTO_MARKET_DATA, {
            params: {
              vs_currency: 'usd',
              ids: cryptoIds.join(),
            }
          }).then(result => {
            transactions.forEach(transaction=>{
              result.data.forEach(dataItem=>{
                if(dataItem.id===transaction.cryptoId){
                  transaction.name=dataItem.name;
                  transaction.imgUrl=dataItem.image;
                  transaction.code=dataItem.symbol.toUpperCase();
                }
              })
            })
            this.setState({transactions});
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
        });
    }
  }

  render() {
    return (
      <section>
        {super.render()}
        <section>
          <Row className={"mt-3"}>
            <Col sm={12}>
              <h2>Transactions</h2>
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
                  <th>Date</th>
                  <th>Transaction Type</th>
                  <th>Transaction Quantity</th>
                  <th>Transaction Amount</th>
                  <th/>
                </tr>
                </thead>
                <tbody className={"w-100"}>
                {this.state.transactions.map((transaction) => {
                  return (
                    <tr key={transaction.id}>
                      <td>
                        <div>
                          <Image src={transaction.imgUrl} width="20px"/>
                          <span className={"ml-2 align-middle"}>
                              {transaction.name}
                            </span>
                        </div>
                      </td>
                      <td>
                          <span className={"ml-2 align-middle text-secondary"}>
                            {transaction.code}
                          </span>
                      </td>
                      <td>{Moment(transaction.date).format('YYYY-MM-DD')}</td>
                      <td>
                        {transaction.transactionType}
                      </td>
                      <td>
                        {Number(transaction.transactionQuantity).toFixed(4)}
                      </td>
                      <td>
                        ${Number(transaction.transactionAmount).toFixed(4)}
                      </td>
                      <td className={"justify-content-end"}></td>
                    </tr>
                  );
                })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </section>
      </section>
    );
  }
}

export default Transactions;
