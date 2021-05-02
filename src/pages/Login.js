import React from 'react'
import '../styles/login.css'
import {Button, Card, CardContent, TextField} from '@material-ui/core'
import {request} from '../util'

const {REACT_APP_URL_MONGODB} = process.env

class Login extends React.Component {

    state = {
        usuario: '',
        senha: ''
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value})

    onClickEntrar = async () => {
        const {usuario, senha} = this.state
        const url = `${REACT_APP_URL_MONGODB}/user/?user=${usuario}&password=${senha}`
        const conexao = {method: 'get'}
        const {returnCode, data, message} = await request(url, conexao)
        if (!returnCode) return alert(message)
        if (data.length === 0) return alert('Usuário ou senha incorretos')
        const {table} = data[0]
        localStorage.setItem(`gp:tabela`, table)
        sessionStorage.setItem(`gp:usuario`, usuario)
        sessionStorage.setItem(`gp:senha`, senha)
        this.props.history.replace('/pedidos')
    }

    render() {
        return (
            <div id="login">
                <Card id="card-login">
                    <CardContent id="card-content-login">
                        <div id="div-formulario-login">
                            <TextField variant="outlined" fullWidth placeholder="Usuário"
                                       onChange={this.handleInput} id="label-usuario" name="usuario"/>
                        </div>
                        <div id="div-formulario-login">
                            <TextField variant="outlined" fullWidth placeholder="Senha"
                                       onChange={this.handleInput} id="label-senha" name="senha"/>
                        </div>
                        <div id="div-formulario-login">
                            <Button variant="outlined" fullWidth onClick={this.onClickEntrar}>Entrar</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
}

export default Login
