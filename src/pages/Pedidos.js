import React from 'react'
import '../styles/pedidos.css'
import MenuInferior from '../components/MenuInferior'
import Pedido from '../components/Pedido'
import {request, idPedido} from '../util'
import firebase from '../firebase'
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core'

const {REACT_APP_URL_MONGODB} = process.env

class Pedidos extends React.Component {

    state = {
        pedidos: [],
        dialogPedido: false
    }

    handlePedido = objeto => {
        this.setState({
            pedido: objeto.pedido,
            status: objeto.status,
            dialogPedido: true,
            id_pedido: idPedido(objeto.pedido.id_pedido)
        })
    }

    confirmaEntragaPedido = () => {
        const {pedido, status} = this.state
        this.setState({dialogPedido: false})
        this.alterarStatusPedidos(pedido, status)
        this.arquivaPedido(pedido)
    }

    cancelaEntragaPedido = () => this.setState({dialogPedido: false, id_pedido: ''})

    consultarPedidos = () => {
        const tabela = localStorage.getItem(`gp:tabela`)
        firebase
            .database()
            .ref('pedidos')
            .orderByChild('loja')
            .equalTo(tabela)
            .on('value', data => {
                if (data.val() !== null) this.gravaPedido(Object.values(data.val()))
            })
    }

    gravaPedido = pedidos => {
        pedidos.sort((a, b) => {
            if (a.data > b.data) return -1
            if (a.data < b.data) return 1
            return 0
        })
        pedidos.forEach(i => {
            if (i.status === 'ENVIADO') this.alterarStatusPedidos(i, 'RECEBIDO')
        })
        this.setState({pedidos: pedidos})
    }

    arquivaPedido = pedido => {
        const tabela = localStorage.getItem(`gp:tabela`)
        let url = `${REACT_APP_URL_MONGODB}/pedidos-${tabela}`
        let conexao = {method: 'post', body: JSON.stringify(pedido)}
        request(url, conexao)
    }

    alterarStatusPedidos = async (pedido, status) => {
        pedido.status = status
        await firebase
            .database()
            .ref('pedidos')
            .child(pedido.id_pedido)
            .update(pedido)
    }

    componentDidMount() {
        this.consultarPedidos()
    }

    render() {
        const {pedidos, dialogPedido, id_pedido} = this.state
        return (
            <div>
                <section id="section-body">
                    <section id="section-body-pedidos">
                        {
                            // eslint-disable-next-line array-callback-return
                            pedidos.map((i, index) => {
                                if (i.status === 'ENVIADO' || i.status === 'RECEBIDO')
                                    return (<Pedido key={index} data={i} handleChange={this.handlePedido.bind(this)}/>)
                            })
                        }
                    </section>
                    <MenuInferior pagina="pedidos"/>
                </section>
                <Dialog open={dialogPedido} onClose={this.cancelaEntragaPedido}>
                    <DialogTitle>Deletar</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{`Confirma troca de status do pedido ${id_pedido} ?`}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={this.cancelaEntragaPedido}>Não</Button>
                        <Button color="primary" onClick={this.confirmaEntragaPedido}>Sim</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default Pedidos
