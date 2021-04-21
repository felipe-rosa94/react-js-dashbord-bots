import React from 'react'
import '../styles/produto.css'
import {Card, CardContent, FormLabel} from '@material-ui/core'
import {Delete} from '@material-ui/icons'
import {request} from '../util'

const {REACT_APP_URL_MONGODB} = process.env

class Produto extends React.Component {

    onClickDeletar = produto => this.deletar(produto)

    deletar = async produto => {
        const tabela = localStorage.getItem(`gp:tabela`)
        let url = `${REACT_APP_URL_MONGODB}/products${tabela}/?produto=${produto}`
        let conexao = {method: 'delete'}
        const {returnCode, message} = await request(url, conexao)
        if (!returnCode) return alert(message)
        this.props.handleChange()
    }

    render() {
        const {produto, preco} = this.props.data
        return (
            <Card id="card-produto">
                <CardContent id="card-content-produto">
                    <div id="div-produtos">
                        <FormLabel id="label-produto">{produto}</FormLabel>
                        <FormLabel id="label-preco">
                            {parseFloat(preco).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </FormLabel>
                    </div>
                    <Delete id="icone" onClick={() => this.onClickDeletar(produto)}/>
                </CardContent>
            </Card>
        )
    }
}

export default Produto
