import React from 'react'
import '../styles/produtos.css'
import MenuInferior from '../components/MenuInferior'
import {Button, Box, Card, CardContent, Divider, TextField} from '@material-ui/core'
import Produto from '../components/Produto'
import {request} from '../util'

const {REACT_APP_URL_MONGODB} = process.env

class Produtos extends React.Component {

    state = {
        produto: '',
        preco: '',
        produtos: []
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value.toUpperCase()})

    handleDeleta = () => this.consultarProdutos()

    onClickAdicionar = () => this.adicionar()

    adicionar = async () => {
        try {
            const {produto, preco} = this.state
            const tabela = localStorage.getItem(`gp:tabela`)
            let url = `${REACT_APP_URL_MONGODB}/products${tabela}`
            const conexao = {
                method: 'post',
                body: JSON.stringify({produto: produto, preco: preco})
            }
            const {returnCode, message} = await request(url, conexao)
            if (returnCode) {
                this.setState({produto: '', preco: ''})
                this.consultarProdutos()
            } else {
                alert(message)
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    consultarProdutos = async () => {
        try {
            const tabela = localStorage.getItem(`gp:tabela`)
            let url = `${REACT_APP_URL_MONGODB}/products${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (returnCode) {
                this.setState({produtos: data})
            } else {
                alert(message)
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    componentDidMount() {
        this.consultarProdutos()
    }

    render() {
        const {produto, preco, produtos} = this.state
        return (
            <div>
                <section id="section-body-produtos">
                    <Card id="card-produtos">
                        <CardContent id="card-content-produtos">
                            <TextField variant="outlined" fullWidth={true} placeholder="Produto" value={produto}
                                       name="produto" onChange={this.handleInput}/>
                            <Box p={1}/>
                            <TextField variant="outlined" placeholder="Preço" type="number" value={preco}
                                       name="preco" onChange={this.handleInput}/>
                            <Box p={1}/>
                            <Button variant="outlined" id="button-adicionar"
                                    onClick={this.onClickAdicionar}>Adicionar</Button>
                        </CardContent>
                    </Card>
                    <Divider id="divider"/>
                    <div id="div-produtos">
                        {produtos.map((i, index) => (
                            <Produto key={index} data={i} handleChange={this.handleDeleta.bind(this)}/>))}
                    </div>
                    <MenuInferior pagina="produtos"/>
                </section>
            </div>
        )
    }
}

export default Produtos
