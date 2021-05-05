import React from 'react'
import '../styles/site.css'
import {
    Box,
    Button,
    Card,
    CardContent, CardMedia,
    Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle,
    Divider,
    FormLabel, Input,
    TextField
} from '@material-ui/core'
import {phoneMask, cepMask, request} from '../util'
import {Delete} from "@material-ui/icons";

const {REACT_APP_URL_MONGODB} = process.env
let tabela

class Site extends React.Component {

    state = {
        dialogAviso: false,
        dialogCeps: false,
        mensagemAviso: '',
        cep: '',
        ceps: [],
        cepsFiltro: [],
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

    handleFilter = e => {
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

    onClickBloquear = () => this.bloquear()

    bloquear = async () => {
        try {
            const {cep} = this.state
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

    onClickBloqueaCeps = () => this.setState({dialogCeps: true})

    cancelaCeps = () => this.setState({dialogCeps: false})

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
            raio,
            banners
        } = this.state
        return (
            <div>
                <div id="site">
                    <section id="section-body-site">
                        <div id="div-menu-site">
                            <div id="div-site-esquerdo">
                                <FormLabel id="label-descricao">Título que aparecera no site</FormLabel>
                                <TextField variant="outlined" fullWidth={true} placeholder="Título no site"
                                           value={tituloSite} name="tituloSite" onChange={this.handleInput}/>
                                <Box p={1}/>
                                <FormLabel id="label-descricao">WhatsApp de contato</FormLabel>
                                <TextField variant="outlined" fullWidth={true} placeholder="WhatsApp"
                                           value={whatsApp} name="whatsApp" onChange={this.handleInput}/>
                            </div>
                            <Box p={1}/>
                            <div id="div-site-direito">
                                <FormLabel id="label-descricao">Raio de distância em metros</FormLabel>
                                <TextField variant="outlined" fullWidth={true} multiline={true}
                                           value={raio} placeholder="Raio de atendimento" name="raio"
                                           onChange={this.handleInput}/>
                                <Box p={1}/>
                                <div id="div-bloqueio-ceps">
                                    <FormLabel id="label-descricao">Restrição de CEPS</FormLabel>
                                    <Button variant="outlined" onClick={this.onClickBloqueaCeps}>Bloquear CEP</Button>
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
                                        <Card id="card-banner">
                                            <CardContent id="card-content-banner">
                                                <CardMedia image={b} id="card-media-banners"/>
                                                <Delete id="icone" onClick={() => this.onClickDeleteBanner(b)}/>
                                            </CardContent>
                                        </Card>
                                    ))
                                }
                            </div>
                        </div>

                        <div id="div-menu-site">
                            <div id="div-botao-salvar-site">
                                <Button variant="outlined" onClick={this.salvarAlteracoes}>Salvar alterações</Button>
                            </div>
                        </div>
                    </section>
                </div>
                <Dialog open={dialogCeps} onClose={this.cancelaCeps}>
                    <DialogTitle>CEPS Bloqueados</DialogTitle>
                    <div id="div-formularios-ceps">
                        <TextField variant="outlined" fullWidth={true} placeholder="Busca ceps" name="cep"
                                   onChange={this.handleFilter}/>
                    </div>
                    <Divider/>
                    <div id="div-formularios-ceps">
                        <TextField variant="outlined" fullWidth={true} placeholder="CEP" name="cep" value={cep}
                                   onChange={this.handleInput}/>
                        <Box p={1}/>
                        <Button variant="outlined" onClick={this.onClickBloquear}>Bloquear</Button>
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
                        <Button fullWidth={true} variant="outlined" onClick={this.cancelaCeps}>Fechar</Button>
                    </DialogActions>
                </Dialog>
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

export default Site