import React from 'react'
import '../styles/site.css'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormLabel, Input,
    TextField
} from '@material-ui/core'
import {phoneMask, cepMask, request} from '../util'
import {AddCircleOutline, Delete} from '@material-ui/icons'

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

class Site extends React.Component {

    state = {
        dialogAviso: false,
        dialogCeps: false,
        dialogRaios: false,
        mensagemAviso: '',
        cep: '',
        metro: '',
        taxa: '',
        ceps: [],
        cepsFiltro: [],
        raios: [],
        raiosFiltro: [],
        imagem: '',
        banners: []
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
                if (c.metro.includes(value)) array.push(c)
            })
            this.setState({raiosFiltro: array})
        } else {
            this.setState({raiosFiltro: raios})
        }
    }

    onClickBloquear = () => this.bloquear()

    bloquear = async () => {
        try {
            const {cep} = this.state
            if (cep === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque um cep válido'})
            let url = `${REACT_APP_URL_MONGODB}/ceps-${tabela}`
            const conexao = {method: 'post', body: JSON.stringify({cep: cep})}
            const {returnCode} = await request(url, conexao)
            if (returnCode) {
                await this.consultaCepsBloqueados()
                this.setState({cep: ''})
            }
        } catch (e) {
            console.log(e.message)
        }
    }

    onClickRaio = () => this.raio()

    raio = async () => {
        try {
            const {metro, taxa} = this.state
            if (metro === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque um metro válido'})
            if (taxa === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque uma taxa válida'})
            let url = `${REACT_APP_URL_MONGODB}/raio-${tabela}`
            const conexao = {method: 'post', body: JSON.stringify({metro: metro, taxa: taxa})}
            const {returnCode} = await request(url, conexao)
            if (returnCode) {
                await this.consultaRaios()
                this.setState({metro: '', taxa: ''})
            }
        } catch (e) {
            console.log(e.message)
        }
    }

    onClickBloqueaRaios = () => this.setState({dialogRaios: true})

    onClickBloqueaCeps = () => this.setState({dialogCeps: true})

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
            let url = `${REACT_APP_URL_MONGODB}/ceps-${tabela}/?id=${objeto._id}`
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
            let url = `${REACT_APP_URL_MONGODB}/raio-${tabela}/?id=${objeto._id}`
            let conexao = {method: 'delete'}
            const {returnCode} = await request(url, conexao)
            if (returnCode) await this.consultaRaios()
        } catch (e) {
            console.log(e.message)
        }
    }

    consultaCepsBloqueados = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/ceps-${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, data} = await request(url, conexao)
            if (returnCode) this.setState({ceps: data, cepsFiltro: data})
        } catch (e) {
            console.log(e.message)
        }
    }

    consultaRaios = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/raio-${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, data} = await request(url, conexao)
            if (returnCode) this.setState({raios: data, raiosFiltro: data})
        } catch (e) {
            console.log(e.message)
        }
    }

    consultarConfiguracoes = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/site-${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (!returnCode) return this.setState({dialogAviso: true, mensagemAviso: message})
            const {_id, tituloSite, whatsApp, raio, banners} = data[0]
            this.setState({
                _id: _id,
                tituloSite: tituloSite,
                whatsApp: whatsApp,
                raio: raio,
                banners: banners
            })
        } catch (e) {
            console.log(e.message)
        }
    }

    salvarAlteracoes = async () => {
        const {_id, tituloSite, whatsApp, raio, banners} = this.state
        let json = {
            tituloSite: tituloSite,
            whatsApp: whatsApp,
            raio: raio,
            banners: banners
        }
        let url
        let conexao
        if (_id) {
            url = `${REACT_APP_URL_MONGODB}/site-${tabela}/?id=${_id}`
            conexao = {method: 'put', body: JSON.stringify(json)}
        } else {
            json.banners = []
            url = `${REACT_APP_URL_MONGODB}/site-${tabela}`
            conexao = {method: 'post', body: JSON.stringify(json)}
        }
        const {returnCode, message} = await request(url, conexao)
        if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
    }

    componentDidMount() {
        tabela = localStorage.getItem(`gp:tabela`)
        this.consultaRaios()
        this.consultaCepsBloqueados()
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
            metro,
            taxa,
            raiosFiltro
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
                            <TextField variant="outlined" fullWidth={true} placeholder="Raio" name="metro" value={metro}
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
                                                id="">{`Metros ${r.metro}, Taxa: ${parseFloat(r.taxa).toLocaleString('pt-BR', {
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