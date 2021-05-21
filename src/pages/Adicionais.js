import React from 'react'
import '../styles/adicionais.css'
import {
    RadioGroup,
    Radio,
    FormControlLabel,
    TextField,
    Button,
    FormLabel,
    DialogTitle,
    DialogContent,
    Dialog,
    Card,
    CardContent, DialogContentText, DialogActions, Box, Switch
} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {cleanAccents, request} from '../util'
import {Edit, Delete, AddCircleOutline, Cancel, Search} from '@material-ui/icons'
import {
    createMuiTheme,
    MuiThemeProvider
} from '@material-ui/core/styles'

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#212121'
        }
    },
})

const {REACT_APP_URL_MONGODB} = process.env
let tabela

const RadioButton = withStyles({
    checked: {},
})(props => <Radio color="default" {...props} />)


class Adicionais extends React.Component {

    state = {
        dados: [],
        tipo: '',
        adicionais: [],
        itens: [],
        exibirValores: false,
        dialogDeletar: false,
        dialogAviso: false,
        dialogAdicionais: false,
        tituloAdicional: '',
        dialogTituloAdicionais: '',
        adicional: '',
        valor: '',
        busca: ''
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value})

    onRadio = e => this.setState({tipo: e.target.value})

    onClickBusca = () => this.busca()

    busca = () => {
        const {dados, busca} = this.state
        if (busca === '') return
        let array = []
        dados.forEach(i => {
            let superBusca = `${i.tituloAdicional}${i.tipo}`
            if (cleanAccents(superBusca).includes(cleanAccents(busca))) array.push(i)
        })
        this.setState({buscando: true, adicionais: array})
    }

    onClickCancelaBusca = () => this.cancelaBusca()

    cancelaBusca = () => {
        const {dados} = this.state
        this.setState({busca: '', buscando: false, adicionais: dados})
    }

    cancelaAviso = () => this.setState({dialogAviso: false})

    onClickValores = e => this.setState({exibirValores: e.target.checked})

    onClickAdicionar = () => this.adicionar()

    onClickAdicional = () => this.adicional()

    adicional = async () => {
        const {id, itens, adicional, valor} = this.state
        let json = {adicional: adicional, valor: valor !== '' ? valor : 0}
        itens.push(json)
        let url = `${REACT_APP_URL_MONGODB}/adicionais-${tabela}/?id=${id}`
        let conexao = {method: 'put', body: JSON.stringify({itens: itens})}
        const {returnCode, message} = await request(url, conexao)
        if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
        this.consultaAdicionais()
        this.setState({adicional: '', valor: ''})
    }

    onClickAdicionarItens = i => {
        this.setState({dialogAdicionais: true, dialogTituloAdicionais: i.tituloAdicional, itens: i.itens, id: i._id})
    }

    onClickDeletar = objeto => {
        this.setState({dialogDeletar: true, id: objeto._id, adicionalDeletar: objeto.tituloAdicional})
    }

    deletarAdicional = async objeto => {
        try {
            const {id} = this.state
            let url = `${REACT_APP_URL_MONGODB}/adicionais-${tabela}/?id=${id}`
            let conexao = {method: 'delete'}
            const {returnCode, message} = await request(url, conexao)
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            this.setState({dialogDeletar: false})
            this.consultaAdicionais()
        } catch (e) {
            console.error(e.message)
        }
    }

    onClickDeletaItem = async (itens, index) => {
        try {
            const {id} = this.state
            let url = `${REACT_APP_URL_MONGODB}/adicionais-${tabela}/?id=${id}`
            itens.splice(index, 1)
            let json = {itens: itens}
            let conexao = {method: 'put', body: JSON.stringify(json)}
            const {returnCode, message} = await request(url, conexao)
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            this.consultaAdicionais()
        } catch (e) {

        }
    }

    cancelaAdicionais = () => this.setState({dialogAdicionais: false})

    adicionar = async () => {
        const {tituloAdicional, tipo, exibirValores} = this.state

        if (tituloAdicional === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque um nome na Etapa'})

        if (tipo === '') return this.setState({
            dialogAviso: true,
            mensagemAviso: 'Escolha um tipo.Exemplo Observações.'
        })

        let url = `${REACT_APP_URL_MONGODB}/adicionais-${tabela}`
        let json = {
            exibirValores: exibirValores,
            tituloAdicional: tituloAdicional,
            tipo: tipo,
            itens: []
        }
        const conexao = {method: 'post', body: JSON.stringify(json)}
        const {returnCode, message} = await request(url, conexao)
        if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
        this.consultaAdicionais()
        this.setState({tipo: '', tituloAdicional: '', exibirValores: false})
    }

    consultaAdicionais = async () => {
        let url = `${REACT_APP_URL_MONGODB}/adicionais-${tabela}`
        const conexao = {method: 'get'}
        const {data} = await request(url, conexao)
        this.setState({adicionais: data, dados: data})
    }

    componentDidMount() {
        tabela = localStorage.getItem(`gp:tabela`)
        this.consultaAdicionais()
    }

    render() {
        const {
            dialogDeletar,
            dialogAdicionais,
            dialogAviso,
            mensagemAviso,
            adicionais,
            itens,
            adicionalDeletar,
            tipo,
            tituloAdicional,
            exibirValores,
            dialogTituloAdicionais,
            adicional,
            valor,
            busca,
            buscando
        } = this.state
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <div id="adicionais">
                        <div id="section-body-adicionais">
                            <div>
                                <Card id="card-produtos">
                                    <CardContent id="card-content-produtos">
                                        <TextField variant="outlined" fullWidth={true} placeholder="Buscar Etapa"
                                                   value={busca} name="busca" onChange={this.handleInput}/>
                                        <Box p={1}/>
                                        {buscando && <Cancel id="icone" onClick={this.onClickCancelaBusca}/>}
                                        <Search id="icone" onClick={this.onClickBusca}/>
                                    </CardContent>
                                </Card>
                                <Card id="card-produtos">
                                    <CardContent id="card-content-produtos">
                                        <div id="div-formulario-inputs-adicionais">
                                            <div id="div-cadastro-etapas">
                                                <TextField value={tituloAdicional} variant="outlined" fullWidth={true}
                                                           placeholder="Nome Etapa"
                                                           name="tituloAdicional"
                                                           onChange={this.handleInput}/>
                                            </div>
                                            <div id="div-cadastro-etapas">
                                                <FormControlLabel checked={exibirValores} label="Monstrar valores"
                                                                  control={<Switch color="primary"
                                                                                   onChange={(e) => this.onClickValores(e)}/>}
                                                />
                                                <RadioGroup id="radio-group-adicionais">
                                                    <FormControlLabel checked={tipo === '0'} value="0"
                                                                      control={<RadioButton color="primary"/>}
                                                                      label="Adicionais"
                                                                      onChange={this.onRadio}/>
                                                    <FormControlLabel checked={tipo === '1'} value="1"
                                                                      control={<RadioButton color="primary"/>}
                                                                      label="Observações"
                                                                      onChange={this.onRadio}/>
                                                    <FormControlLabel checked={tipo === '2'} value="2"
                                                                      control={<RadioButton color="primary"/>}
                                                                      label="Opcionais"
                                                                      onChange={this.onRadio} color="primary"/>
                                                </RadioGroup>
                                            </div>
                                            <Button variant="outlined" onClick={this.onClickAdicionar}>Salvar</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div>
                                {
                                    adicionais.map((i, index) => (
                                        <Card key={index} id="card-produtos">
                                            <CardContent id="card-content-produtos">
                                                <div id="div-grupo-adicionais">
                                                    <FormLabel>{i.tituloAdicional}</FormLabel>
                                                    <div>
                                                        <Edit id="icone" onClick={() => this.onClickAdicionarItens(i)}/>
                                                        <Delete id="icone" onClick={() => this.onClickDeletar(i)}/>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <Dialog open={dialogAdicionais} onClose={this.cancelaAdicionais}>
                        <DialogTitle>{dialogTituloAdicionais}</DialogTitle>
                        <DialogContent id="card-content-dialog-adicionais">
                            <div id="div-dialog-adicionais">
                                <TextField variant="outlined" value={adicional} fullWidth={true} placeholder="Adicional"
                                           name="adicional"
                                           onChange={this.handleInput}/>
                                <Box p={1}/>
                                <TextField variant="outlined" value={valor} fullWidth={true} placeholder="Valor"
                                           name="valor"
                                           onChange={this.handleInput}/>
                                <Box p={1}/>
                                <AddCircleOutline id="icone" onClick={this.onClickAdicional}/>
                            </div>
                            {
                                itens.map((i, index) => (
                                    <Card id="card-adicionais">
                                        <CardContent id="card-content-dialog-itens-adicional">
                                            <div id="div-nome-valor-item-adicional">
                                                <FormLabel id="nome-adicional">{i.adicional}</FormLabel>
                                                <FormLabel id="valor-adicional">
                                                    {parseFloat(i.valor).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    })}
                                                </FormLabel>
                                            </div>
                                            <div>
                                                <Delete id="icone"
                                                        onClick={() => this.onClickDeletaItem(itens, index)}/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </DialogContent>
                    </Dialog>
                    <Dialog open={dialogDeletar} onClose={this.cancelaDeletar}>
                        <DialogTitle>Deletar</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{`Deseja deletar a produto ${adicionalDeletar} ?`}</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={this.deletarAdicional}>Sim</Button>
                            <Button color="primary" onClick={this.cancelaDeletar}>Não</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={dialogAviso} onClose={this.cancelaAviso}>
                        <DialogTitle>Aviso</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{mensagemAviso}</DialogContentText>
                        </DialogContent>
                    </Dialog>
                </div>
            </MuiThemeProvider>
        )
    }
}

export default Adicionais