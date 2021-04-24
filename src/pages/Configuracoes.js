import React from 'react'
import '../styles/configuracoes.css'
import MenuInferior from '../components/MenuInferior'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup, Switch,
    TextField
} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {request, phoneMask, cleanPhone} from '../util'

const {REACT_APP_URL_MONGODB} = process.env
const tabela = localStorage.getItem(`gp:tabela`)

const RadioButton = withStyles({
    root: {
        color: '#000000',
        '&$checked': {
            color: '#000000',
        },
    },
    checked: {},
})(props => <Radio color="default" {...props} />)

class Configuracoes extends React.Component {

    state = {
        _id: '',
        intervalo: '0',
        boasVindas: '',
        agradecimento: '',
        whatsApp: '',
        email: '',
        ativo: true,
        dialogAviso: false,
        mensagemAviso: ''
    }

    handleInput = e => this.setState({[e.target.name]: (e.target.name === 'whatsApp') ? phoneMask(e.target.value) : e.target.value})

    onClickAtivo = e => this.setState({ativo: e.target.checked})

    onClickRadio = e => this.setState({intervalo: e.target.value})

    cancelaAviso = () => this.setState({dialogAviso: false})

    salvarAlteracoes = async () => {
        try {
            const {_id, intervalo, boasVindas, agradecimento, whatsApp, email, ativo} = this.state

            if (!boasVindas) return this.setState({
                dialogAviso: true,
                mensagemAviso: 'Adicione uma mensagem de boas vindas'
            })
            if (!agradecimento) return this.setState({
                dialogAviso: true,
                mensagemAviso: 'Adicione uma mensagem de agradecimento'
            })

            if (!whatsApp && (cleanPhone(whatsApp).length === 11)) return this.setState({
                dialogAviso: true,
                mensagemAviso: 'Adicione um número que recebera as notificações'
            })

            let json = {
                intervalo: intervalo,
                boasVindas: boasVindas,
                agradecimento: agradecimento,
                whatsApp: cleanPhone(whatsApp),
                email: email,
                ativo: ativo
            }
            let url
            let conexao
            if (_id) {
                url = `${REACT_APP_URL_MONGODB}/settings${tabela}/?id=${_id}`
                conexao = {method: 'put', body: JSON.stringify(json)}
            } else {
                url = `${REACT_APP_URL_MONGODB}/settings${tabela}`
                conexao = {method: 'post', body: JSON.stringify(json)}
            }
            const {message} = await request(url, conexao)
            this.setState({dialogAviso: true, mensagemAviso: message})

        } catch (e) {
            console.log(e.message)
        }
    }

    consultarConfiguracoes = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/settings${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (!returnCode) return this.setState({dialogAviso: true, mensagemAviso: message})
            const {_id, intervalo, boasVindas, agradecimento, whatsApp, email, ativo} = data[0]
            this.setState({
                _id: _id,
                intervalo: intervalo,
                boasVindas: boasVindas,
                agradecimento: agradecimento,
                whatsApp: phoneMask(whatsApp),
                email: email,
                ativo: ativo
            })
            document.getElementById('input-boas-vindas').value = boasVindas
            document.getElementById('input-agradecimento').value = agradecimento
        } catch (e) {
            console.log(e.message)
        }
    }

    componentDidMount() {
        this.consultarConfiguracoes()
    }

    render() {
        const {intervalo, whatsApp, email, ativo, dialogAviso, mensagemAviso} = this.state
        return (
            <div>
                <div id="configuracoes">
                    <section id="section-body-configuracoes">
                        <div id="div-menu-configuracoes">
                            <div id="div-configuracoes-esquerdo">
                                <TextField variant="outlined" fullWidth={true} multiline={true}
                                           placeholder="Mensagem de boas vindas" id="input-boas-vindas"
                                           name="boasVindas" onChange={this.handleInput}/>
                                <Box p={1}/>
                                <TextField variant="outlined" fullWidth={true} multiline={true}
                                           placeholder="Mensagem de agradecimento" id="input-agradecimento"
                                           name="agradecimento" onChange={this.handleInput}/>
                            </div>
                            <Box p={1}/>
                            <div id="div-configuracoes-direito">
                                <TextField variant="outlined" fullWidth={true}
                                           placeholder="WhatsApp para notificações" id="input-telfone" name="whatsApp"
                                           value={whatsApp}
                                           onChange={this.handleInput}/>
                                <Box p={1}/>
                                <TextField variant="outlined" fullWidth={true} placeholder="E-mail (Opcional)"
                                           id="input-email" name="email" value={email} onChange={this.handleInput}/>
                            </div>
                        </div>
                        <div id="div-menu-configuracoes">
                            <div id="div-configuracoes-esquerdo">
                                <FormLabel>
                                    Defina um intervalo de tempo que mensagem pessoais não receberam a resposta
                                    automatima
                                </FormLabel>
                                <RadioGroup id="radio-group">
                                    <FormControlLabel value="0" label="Nenhum" checked={intervalo === '0'}
                                                      control={<RadioButton/>} onChange={(e) => this.onClickRadio(e)}/>
                                    <FormControlLabel value="1h" label="1 Hora" checked={intervalo === '1h'}
                                                      control={<RadioButton/>} onChange={(e) => this.onClickRadio(e)}/>
                                    <FormControlLabel value="5h" label="5 Horas" checked={intervalo === '5h'}
                                                      control={<RadioButton/>} onChange={(e) => this.onClickRadio(e)}/>
                                    <FormControlLabel value="1d" label="1 Dia" checked={intervalo === '1d'}
                                                      control={<RadioButton/>} onChange={(e) => this.onClickRadio(e)}/>
                                    <FormControlLabel value="1s" label="1 Semana" checked={intervalo === '1s'}
                                                      control={<RadioButton/>} onChange={(e) => this.onClickRadio(e)}/>
                                    <FormControlLabel value="1a" label="Indeterminado" checked={intervalo === '1a'}
                                                      control={<RadioButton/>} onChange={(e) => this.onClickRadio(e)}/>
                                </RadioGroup>
                            </div>
                        </div>
                        <div id="div-menu-configuracoes">
                            <div id="div-configuracoes-esquerdo">
                                <FormLabel>Defina a ativação ou desativação das mensagens</FormLabel>
                                <FormControlLabel
                                    control={<Switch checked={ativo} label={ativo ? 'Ativada' : 'Desativada'}
                                                     onChange={(e) => this.onClickAtivo(e)}/>}
                                />
                            </div>
                        </div>
                        <div id="div-menu-configuracoes">
                            <div id="div-botao-salvar-configuracoes">
                                <Button variant="outlined" onClick={this.salvarAlteracoes}>Salvar alterações</Button>
                            </div>
                        </div>
                    </section>
                </div>
                <MenuInferior pagina="configuracoes"/>
                <Dialog open={dialogAviso} onClose={this.cancelaAviso}>
                    <DialogTitle>Aviso</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{mensagemAviso}</DialogContentText>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}

export default Configuracoes
