import React from 'react'
import '../styles/login.css'
import {Button, Card, CardMedia, CardContent, FormLabel, TextField} from '@material-ui/core'
import {request} from '../util'
import logo from '../imagens/logo512.png'
import firebase from 'firebase'

const versao = '1.2'

const {REACT_APP_URL_MONGODB} = process.env

class Login extends React.Component {

    state = {
        usuario: '',
        senha: ''
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value})

    onClickEntrar = async () => {
        const {usuario, senha} = this.state
        firebase
            .database()
            .ref('usuarios')
            .child(usuario)
            .once('value')
            .then((data) => {
                if (data.val().senha === senha) {
                    sessionStorage.setItem(`gp:usuario`, usuario)
                    sessionStorage.setItem(`gp:senha`, senha)
                    this.props.history.replace('/pedidos')
                } else {
                    alert('Usuário ou senha incorretos')
                }
            })
            .catch((e) => {

            })
    }

    render() {
        return (
            <div id="login">
                <CardMedia id="logo-login" image={logo}/>
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
                <FormLabel>{`versão: ${versao}`}</FormLabel>
            </div>
        )
    }
}

export default Login
