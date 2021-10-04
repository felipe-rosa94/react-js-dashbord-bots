import React from 'react'
import '../styles/site.css'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia, Checkbox, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider, FormControlLabel,
    FormLabel, Input, Switch,
    TextField
} from '@material-ui/core'
import {phoneMask, cepMask, request} from '../util'
import {AddCircleOutline, Delete} from '@material-ui/icons'

import {
    createMuiTheme,
    MuiThemeProvider, withStyles
} from '@material-ui/core/styles'
import firebase from "firebase";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#212121'
        }
    },
})

const CheckButton = withStyles({
    checked: {},
})(props => <Checkbox color="default" {...props} />)

const {REACT_APP_URL_MONGODB} = process.env
let usuario

class Site extends React.Component {

    state = {
        dialogAviso: false,
        dialogCeps: false,
        dialogRaios: false,
        mensagemAviso: '',
        cep: '',
        distancia: '',
        taxa: '',
        ceps: [],
        cepsFiltro: [],
        raios: [],
        raiosFiltro: [],
        imagem: '',
        banners: [],
        observacao: true,
        dinheiro: true,
        cartao: true,
        online: false,
        statusLoja: false,
        dialogCarregando: false,
        retirada: true,
        entrega: true,
        mensagemCarregendo: ''
    }

    handleImage = e => {
        try {
            const {banners} = this.state
            let file = e.target.files[0]
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                let img = reader.result.replace(/=/g, '')
                banners.push(img)
                this.setState({banners: banners})
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    handleInput = e => {
        let name = e.target.name
        let value = e.target.value
        if (name === 'whatsApp') {
            this.setState({[name]: phoneMask(value)})
        } else if (name === 'cep') {
            this.setState({[name]: cepMask(value)})
        } else {
            this.setState({[name]: value})
        }
    }

    handleFilterCeps = e => {
        let value = e.target.value
        const {ceps} = this.state
        if (value !== '') {
            let array = []
            ceps.forEach(c => {
                if (c.cep.includes(value)) array.push(c)
            })
            this.setState({cepsFiltro: array})
        } else {
            this.setState({cepsFiltro: ceps})
        }
    }

    handleFilterRaios = e => {
        let value = e.target.value
        const {raios} = this.state
        if (value !== '') {
            let array = []
            raios.forEach(c => {
                if (c.distancia.toString().includes(value)) array.push(c)
            })
            this.setState({raiosFiltro: array})
        } else {
            this.setState({raiosFiltro: raios})
        }
    }

    onCheck = e => this.setState({[e.target.name]: e.target.checked})

    onClickBloquear = () => this.bloquear()

    bloquear = () => {
        const {cep} = this.state
        if (cep === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque um cep válido'})
        let json = {cep: cep}
        firebase
            .database()
            .ref(`ceps/${usuario}/${cep}`)
            .set(json)
            .then((data) => {
                this.consultaCepsBloqueados()
                this.setState({cep: ''})
            })
            .catch((e) => {

            })
    }

    onClickRaio = () => this.raio()

    raio = async () => {
        const {distancia, taxa} = this.state
        if (distancia === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque um metro válido'})
        if (taxa === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque uma taxa válida'})

        let json = {distancia: parseInt(distancia), taxa: parseInt(taxa)}

        firebase
            .database()
            .ref(`raios/${usuario}/${distancia}`)
            .set(json)
            .then((data) => {
                this.consultaRaios()
                this.setState({distancia: '', taxa: ''})
            })
            .catch((e) => {
                console.error(e)
            })
    }

    onClickStatusLoja = e => {
        this.setState({statusLoja: e.target.checked})
    }

    onClickBloqueaRaios = () => {
        this.consultaRaios()
        this.setState({dialogRaios: true})
    }

    onClickBloqueaCeps = () => {
        this.consultaCepsBloqueados()
        this.setState({dialogCeps: true})
    }

    cancelaCeps = () => {
        const {ceps} = this.state
        this.setState({dialogCeps: false, cepsFiltro: ceps})
    }

    cancelaRaios = () => {
        const {raios} = this.state
        this.setState({dialogRaios: false, raiosFiltro: raios})
    }

    onClickDeleteBanner = banner => this.deletarBanner(banner)

    deletarBanner = banner => {
        const {banners} = this.state
        let index = banners.indexOf(banner)
        banners.splice(index, 1)
        this.setState({banners: banners})
    }

    cancelaAviso = () => this.setState({dialogAviso: false})

    onClickDeleteCep = objeto => this.deletarCep(objeto)

    deletarCep = async objeto => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/ceps-${usuario}/?id=${objeto._id}`
            let conexao = {method: 'delete'}
            const {returnCode} = await request(url, conexao)
            if (returnCode) await this.consultaCepsBloqueados()
        } catch (e) {
            console.log(e.message)
        }
    }

    onClickDeleteRaio = objeto => this.deletarRaio(objeto)

    deletarRaio = async objeto => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/raio-${usuario}/?id=${objeto._id}`
            let conexao = {method: 'delete'}
            const {returnCode} = await request(url, conexao)
            if (returnCode) await this.consultaRaios()
        } catch (e) {
            console.log(e.message)
        }
    }

    consultaCepsBloqueados = () => {
        firebase
            .database()
            .ref('ceps')
            .child(usuario)
            .once('value')
            .then((data) => {
                if (data.val() !== null) {
                    let ceps = Object.values(data.val())
                    this.setState({ceps: ceps, cepsFiltro: ceps})
                }
            })
            .catch((e) => {
                console.error(e)
            })
    }

    consultaRaios = () => {
        firebase
            .database()
            .ref('raios')
            .child(usuario)
            .once('value')
            .then((data) => {
                if (data.val() != null) {
                    let raios = Object.values(data.val())
                    this.setState({raios: raios, raiosFiltro: raios})
                }
            })
            .catch((e) => {

            })
    }

    consultarConfiguracoes = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/site-${usuario}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (!returnCode) return this.setState({dialogAviso: true, mensagemAviso: message})
            const {
                _id,
                tituloSite,
                whatsApp,
                raio,
                banners,
                observacao,
                dinheiro,
                cartao,
                online,
                endereco,
                statusLoja,
                retirada,
                entrega
            } = data[0]
            this.setState({
                _id: _id,
                tituloSite: tituloSite,
                whatsApp: whatsApp,
                raio: raio,
                banners: banners,
                observacao: observacao,
                dinheiro: dinheiro,
                cartao: cartao,
                online: online,
                endereco: endereco,
                statusLoja: statusLoja,
                retirada: retirada,
                entrega: entrega
            })
        } catch (e) {
            console.log(e.message)
        }
    }

    salvarAlteracoes = async () => {
        let {
            tituloSite,
            whatsApp,
            banners,
            observacao,
            dinheiro,
            cartao,
            online,
            endereco,
            statusLoja,
            retirada,
            entrega
        } = this.state

        let json = {
            tituloSite: tituloSite,
            whatsApp: whatsApp,
            banners: banners,
            observacao: observacao,
            dinheiro: dinheiro,
            cartao: cartao,
            online: online,
            endereco: endereco,
            statusLoja: statusLoja,
            retirada: retirada,
            entrega: entrega
        }

        this.setState({dialogCarregando: true, mensagemCarregendo: 'Aguarde, salvando configurações...'})

        firebase
            .database()
            .ref(`configuracoes/${usuario}`)
            .set(json)
            .then((data) => {
                this.setState({dialogCarregando: false})
            })
            .catch((e) => {
                console.error(e)
            })
        //this.consultarConfiguracoes()
    }

    componentDidMount() {
        usuario = sessionStorage.getItem(`gp:usuario`)
        this.consultarConfiguracoes()
    }

    render() {
        const {
            dialogAviso,
            dialogCeps,
            mensagemAviso,
            cep,
            cepsFiltro,
            tituloSite,
            whatsApp,
            banners,
            dialogRaios,
            distancia,
            taxa,
            raiosFiltro,
            observacao,
            dinheiro,
            cartao,
            online,
            endereco,
            statusLoja,
            dialogCarregando,
            mensagemCarregendo,
            retirada,
            entrega
        } = this.state
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <div id="site">
                        <Card id="card-categorias">
                            <CardContent id="card-content-categorias">
                                <section id="section-body-site">

                                    <div id="div-menu-site">
                                        <div id="div-site-esquerdo">
                                            <div>
                                                <FormLabel id="label-descricao">Endereço loja</FormLabel>
                                                <TextField variant="outlined" fullWidth={true} placeholder="Endereço"
                                                           value={endereco} name="endereco"
                                                           onChange={this.handleInput}/>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="div-menu-site">
                                        <div id="div-site-esquerdo">
                                            <div>
                                                <FormLabel id="label-descricao">Título que aparecera no site</FormLabel>
                                                <TextField variant="outlined" fullWidth={true}
                                                           placeholder="Título no site"
                                                           value={tituloSite} name="tituloSite"
                                                           onChange={this.handleInput}/>
                                            </div>
                                            <Box p={1}/>
                                            <div>
                                                <FormLabel id="label-descricao">WhatsApp de contato</FormLabel>
                                                <TextField variant="outlined" fullWidth={true} placeholder="WhatsApp"
                                                           value={whatsApp} name="whatsApp"
                                                           onChange={this.handleInput}/>
                                            </div>
                                        </div>
                                        <Box p={1}/>
                                        <div id="div-site-direito">
                                            <div id="div-bloqueio-ceps">
                                                <FormLabel id="label-descricao">Raios de atendimento</FormLabel>
                                                <Button variant="outlined" onClick={this.onClickBloqueaRaios}>Adicionar
                                                    Raio</Button>
                                            </div>
                                            <Box p={1}/>
                                            <div id="div-bloqueio-ceps">
                                                <FormLabel id="label-descricao">Restrição de CEPS</FormLabel>
                                                <Button variant="outlined" onClick={this.onClickBloqueaCeps}>Bloquear
                                                    CEP</Button>
                                            </div>
                                        </div>
                                    </div>


                                    <div id="div-menu-site">
                                        <FormLabel id="label-descricao">Status da loja</FormLabel>
                                        <FormControlLabel
                                            control={<Switch checked={statusLoja} color="primary"
                                                             onChange={this.onClickStatusLoja}/>}
                                            label={statusLoja ? 'Loja aberta' : 'Loja fechada'}
                                        />

                                        <FormLabel id="label-descricao">Permissões</FormLabel>
                                        <FormControlLabel control={<CheckButton/>} name="observacao"
                                                          label="Permitir obsevação na sacola" checked={observacao}
                                                          onChange={this.onCheck}/>

                                        <FormLabel id="label-descricao">Formas de pagamento</FormLabel>
                                        <FormControlLabel control={<CheckButton/>} name="dinheiro"
                                                          label="Dinheiro" checked={dinheiro}
                                                          onChange={this.onCheck}/>
                                        <FormControlLabel control={<CheckButton/>} name="cartao"
                                                          label="Cartão (maquininha)" checked={cartao}
                                                          onChange={this.onCheck}/>
                                        <FormControlLabel control={<CheckButton/>} name="online"
                                                          label="Pagamento Online" checked={online}
                                                          onChange={this.onCheck}/>

                                        <FormLabel id="label-descricao">Modo de entrega</FormLabel>
                                        <FormControlLabel control={<CheckButton/>} name="retirada"
                                                          label="Retirada" checked={retirada}
                                                          onChange={this.onCheck}/>
                                        <FormControlLabel control={<CheckButton/>} name="entrega"
                                                          label="Entrega" checked={entrega}
                                                          onChange={this.onCheck}/>
                                    </div>

                                    <div id="div-menu-site-banners">
                                        <Input id="input-image" type="file"
                                               onChange={(e) => this.handleImage(e)}/>
                                        <Box p={1}/>
                                        <div id="div-banners">
                                            {
                                                banners.map((b, index) => (
                                                    <Card id="card-banner" key={index}>
                                                        <CardContent id="card-content-banner">
                                                            <CardMedia image={b} id="card-media-banners"/>
                                                            <Delete id="icone"
                                                                    onClick={() => this.onClickDeleteBanner(b)}/>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            }
                                        </div>
                                    </div>


                                    <div id="div-menu-site">
                                        <div id="div-botao-salvar-site">
                                            <Button variant="outlined" onClick={this.salvarAlteracoes}>Salvar
                                                alterações</Button>
                                        </div>
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    </div>
                    <Dialog open={dialogCeps} onClose={this.cancelaCeps}>
                        <DialogTitle>CEPS Bloqueados</DialogTitle>
                        <div id="div-formularios-ceps">
                            <TextField variant="outlined" fullWidth={true} placeholder="Busca ceps" name="cep"
                                       onChange={this.handleFilterCeps}/>
                        </div>
                        <Divider/>
                        <div id="div-formularios-ceps">
                            <TextField variant="outlined" fullWidth={true} placeholder="CEP" name="cep" value={cep}
                                       onChange={this.handleInput}/>
                            <Box p={1}/>
                            <AddCircleOutline id="icone" onClick={this.onClickBloquear}/>
                        </div>
                        <Divider/>
                        <div id="div-ceps">
                            {
                                cepsFiltro.map((c, index) => (
                                    <Card id="card-cep" key={index}>
                                        <CardContent id="card-content-cep">
                                            <FormLabel id="">{c.cep}</FormLabel>
                                            <Delete id="icone" onClick={() => this.onClickDeleteCep(c)}/>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                        <DialogActions>
                            <Button onClick={this.cancelaCeps}>Fechar</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={dialogRaios} onClose={this.cancelaCeps}>
                        <DialogTitle>Raios de atendimento</DialogTitle>
                        <div id="div-formularios-ceps">
                            <TextField variant="outlined" fullWidth={true} placeholder="Busca raio" name="raio"
                                       onChange={this.handleFilterRaios}/>
                        </div>
                        <Divider/>
                        <div id="div-formularios-ceps">
                            <TextField variant="outlined" fullWidth={true} placeholder="Raio" name="distancia"
                                       value={distancia}
                                       onChange={this.handleInput}/>
                            <Box p={1}/>
                            <TextField variant="outlined" fullWidth={true} placeholder="Taxa" name="taxa" value={taxa}
                                       onChange={this.handleInput}/>
                            <Box p={1}/>
                            <AddCircleOutline id="icone" onClick={this.onClickRaio}/>
                        </div>
                        <Divider/>
                        <div id="div-ceps">
                            {
                                raiosFiltro.map((r, index) => (
                                    <Card id="card-cep" key={index}>
                                        <CardContent id="card-content-cep">
                                            <FormLabel
                                                id="">{`Metros ${r.distancia}, Taxa: ${parseFloat(r.taxa).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}`}</FormLabel>
                                            <Delete id="icone" onClick={() => this.onClickDeleteRaio(r)}/>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                        <DialogActions>
                            <Button onClick={this.cancelaRaios}>Fechar</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={dialogCarregando}>
                        <DialogContent id="dialog-carregando">
                            <CircularProgress size={30}/>
                            <DialogContentText id="label-carregando">{mensagemCarregendo}</DialogContentText>
                        </DialogContent>
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

export default Site