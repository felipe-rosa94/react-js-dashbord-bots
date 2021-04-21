import React from 'react'
import '../styles/pedido.css'
import {Card, CardContent, Divider, FormLabel} from '@material-ui/core'

class Pedido extends React.Component {
    render() {
        const {name, phone, dateTime, orders} = this.props.data
        return (
            <div>
                <Card id="card-pedido">
                    <CardContent id="card-content-pedido">
                        <FormLabel id="nome-pedido">{`Nome: ${name}`}</FormLabel>
                        <FormLabel id="telefone-pedido">{`Telefone: ${phone}`}</FormLabel>
                        <FormLabel id="data-pedido">{`Data: ${dateTime}`}</FormLabel>
                        <Divider id="divider"/>
                        {
                            orders.map((i, index) => (
                                <div id="div-itens" key={index}>
                                    <FormLabel id="item-pedido">
                                        {`${i.flavor}, Qtde: ${i.amount}`}
                                    </FormLabel>
                                </div>
                            ))
                        }
                    </CardContent>
                </Card>
            </div>
        )
    }
}

export default Pedido

