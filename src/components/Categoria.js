import React from 'react'
import '../styles/categoria.css'
import {Card, CardContent, FormLabel} from '@material-ui/core'
import {Delete} from '@material-ui/icons'
import {request} from '../util'

const {REACT_APP_URL_MONGODB} = process.env

class Categoria extends React.Component {

    onClickDeletar = categoria => this.deletar(categoria)

    deletar = async categoria => {
        const tabela = localStorage.getItem(`gp:tabela`)
        let url = `${REACT_APP_URL_MONGODB}/category${tabela}/?categoria=${categoria}`
        let conexao = {method: 'delete'}
        const {returnCode, message} = await request(url, conexao)
        if (!returnCode) return alert(message)
        this.props.handleChange()
    }

    render() {
        const {categoria} = this.props.data
        return (
            <Card id="card-categoria">
                <CardContent id="card-content-categoria">
                    <FormLabel id="label-categoria">{categoria}</FormLabel>
                    <Delete id="icone" onClick={() => this.onClickDeletar(categoria)}/>
                </CardContent>
            </Card>
        )
    }
}

export default Categoria
