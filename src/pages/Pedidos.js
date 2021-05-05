import React from 'react'
import '../styles/pedidos.css'
import MenuInferior from '../components/MenuInferior'
import Pedido from '../components/Pedido'
import {request} from '../util'

const {REACT_APP_URL_MONGODB} = process.env

class Pedidos extends React.Component {

    state = {
        pedidos: []
    }

    consultarPedidos = async () => {
        const tabela = localStorage.getItem(`gp:tabela`)
        let url = `${REACT_APP_URL_MONGODB}/pedidos-${tabela}`
        let conexao = {method: 'get'}
        const {data} = await request(url, conexao)
        this.setState({pedidos: data})
    }

    componentDidMount() {
        this.consultarPedidos()
    }

    render() {
        const {pedidos} = this.state
        return (
            <div>
                <section id="section-body">
                    <section id="section-body-pedidos">
                        {pedidos.map((i, index) => (<Pedido key={index} data={i}/>))}
                    </section>
                    <MenuInferior pagina="pedidos"/>
                </section>
            </div>
        )
    }
}

export default Pedidos
