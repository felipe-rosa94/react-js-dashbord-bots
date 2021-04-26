import React from 'react'
import '../styles/categorias.css'
import {
    Box,
    CardContent,
    CardMedia,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormLabel
} from '@material-ui/core'
import {Cancel, ExpandLess, ExpandMore, Search} from '@material-ui/icons'
import {Button, Card, Dialog, DialogActions, TextField, Input} from '@material-ui/core'
import {request, cleanAccents} from '../util'
import MenuInferior from '../components/MenuInferior'
import Categoria from '../components/Categoria'

const {REACT_APP_URL_MONGODB} = process.env
let tabela

class Categorias extends React.Component {

    state = {
        vizualizar: true,
        imageBase64: '',
        buscando: false,
        busca: '',
        categoria: '',
        categorias: [],
        dados: []
    }

    handleImage = async e => {
        try {
            let file = e.target.files[0]
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                this.setState({imagem: reader.result.replace(/=/g, ''), imageBase64: reader.result.replace(/=/g, '')})
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value.toUpperCase()})

    handleCategoria = async objeto => {
        let {acao, dados: {_id, categoria, ativo, imagem, ordem}} = objeto
        const {dados} = this.state
        if (acao === 'ativo') {
            this.alterarCategoria(_id, {ativo: ativo})
        } else if (acao === 'imagem') {
            this.setState({dialogImagem: true, imagemCategoria: imagem, tituloCategoria: categoria})
        } else if (acao === 'sobe') {
            if (ordem === 0) return
            let novaOrdem = (ordem - 1)
            await this.alterarCategoria(_id, {ordem: novaOrdem})
            await this.alterarCategoria(dados[novaOrdem]._id, {ordem: ordem})
        } else if (acao === 'desce') {
            if (ordem === (dados.length - 1)) return
            let novaOrdem = (ordem + 1)
            await this.alterarCategoria(_id, {ordem: novaOrdem})
            await this.alterarCategoria(dados[novaOrdem]._id, {ordem: ordem})
        } else if (acao === 'editar') {
            this.setState({
                vizualizar: true,
                editando: true,
                _id: _id,
                categoria: categoria,
                imagem: imagem
            })
        } else if (acao === 'deletar') {
            this.setState({
                busca: '',
                buscando: false,
                dialogCaterogia: true,
                idDeletar: _id,
                categoriaDeletar: categoria
            })
        }
    }

    visualizar = () => {
        const {vizualizar} = this.state
        this.setState({vizualizar: !vizualizar})
    }

    alterarCategoria = async (id, json) => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/category${tabela}/?id=${id}`
            let conexao = {method: 'put', body: JSON.stringify(json)}
            const {returnCode, message} = await request(url, conexao)
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            await this.consultarCategoria()
        } catch (e) {
            console.error(e.message)
        }
    }

    onClickCancelaEdicao = () => window.location.reload()

    cancelaDeletar = () => this.setState({dialogCaterogia: false, idDeletar: '', categoriaDeletar: ''})

    confirmaDeletar = () => this.deletarCategoria()

    deletarCategoria = async () => {
        try {
            const {idDeletar} = this.state
            let url = `${REACT_APP_URL_MONGODB}/category${tabela}/?id=${idDeletar}`
            let conexao = {method: 'delete'}
            const {returnCode, message} = await request(url, conexao)
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            this.setState({dialogCaterogia: false})
            this.consultarCategoria()
        } catch (e) {
            console.error(e.message)
        }
    }

    cancelaImagem = () => this.setState({dialogImagem: false})

    cancelaAviso = () => this.setState({dialogAviso: false})

    onClickCancelaBusca = () => this.cancelaBusca()

    cancelaBusca = () => {
        const {dados} = this.state
        this.setState({busca: '', buscando: false, categorias: dados})
    }

    onClickBusca = () => this.busca()

    busca = () => {
        const {dados, busca} = this.state
        if (busca === '') return
        let array = []
        dados.forEach(i => {
            if (cleanAccents(i.categoria).includes(cleanAccents(busca))) array.push(i)
        })
        this.setState({buscando: true, categorias: array})
    }

    onClickAdicionar = async () => {
        const {editando, _id, imagem, imageBase64, categoria} = this.state
        if (editando) {
            let json = {
                categoria: categoria,
                imagem: imageBase64 !== '' ? imageBase64 : imagem
            }
            await this.alterarCategoria(_id, json)
            document.getElementById('input-image').value = ''
            this.setState({
                categoria: '',
                editando: false,
                imagem: '',
                imageBase64: '',
            })
        } else {
            await this.adicionar()
        }
    }

    adicionar = async () => {
        try {
            const {dados, categoria, imageBase64} = this.state
            if (!categoria) return this.setState({dialogAviso: true, mensagemAviso: 'Coloque o nome de categoria'})
            let url = `${REACT_APP_URL_MONGODB}/category${tabela}`
            let ordem = dados.length
            const conexao = {
                method: 'post',
                body: JSON.stringify({categoria: categoria, imagem: imageBase64, ativo: true, ordem: ordem})
            }
            const {returnCode, message} = await request(url, conexao)
            if (returnCode) {
                this.setState({categoria: ''})
                await this.consultarCategoria()
            } else {
                this.setState({dialogAviso: true, mensagemAviso: message})
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    consultarCategoria = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/category${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (returnCode) {
                data.sort((a, b) => {
                    if (b.ordem > a.ordem) return -1
                    if (b.ordem < a.ordem) return 1
                    return 0
                })
                this.setState({categorias: data, dados: data})
            } else {
                this.setState({dialogAviso: true, mensagemAviso: message})
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    componentDidMount() {
        tabela = localStorage.getItem(`gp:tabela`)
        this.consultarCategoria()
    }

    render() {
        const {
            categoria,
            categorias,
            buscando,
            busca,
            dialogCaterogia,
            categoriaDeletar,
            dialogAviso,
            mensagemAviso,
            dialogImagem,
            imagemCategoria,
            tituloCategoria,
            vizualizar,
            imagem,
            editando
        } = this.state
        return (
            <div>
                <div id="categorias">
                    <section id="section-body-categorias">
                        <div id="div-menu-categorias">
                            <Card id="card-categorias">
                                <CardContent id="card-content-categorias">
                                    <TextField variant="outlined" fullWidth={true} placeholder="Buscar Categorias"
                                               value={busca} id="input-categoria" name="busca"
                                               onChange={this.handleInput}/>
                                    <Box p={1}/>
                                    {buscando && <Cancel id="icone" onClick={this.onClickCancelaBusca}/>}
                                    <Search id="icone" onClick={this.onClickBusca}/>
                                </CardContent>
                            </Card>
                            {
                                vizualizar &&
                                <Card id="card-categorias">
                                    <CardContent id="card-content-categorias">
                                        <div id="div-formulario-inputs-categoria">
                                            <div id="div-inputs-categorias">
                                                <TextField variant="outlined" fullWidth={true} placeholder="Categoria"
                                                           value={categoria}
                                                           id="input-categoria" name="categoria"
                                                           onChange={this.handleInput}/>
                                            </div>
                                            <div id="div-inputs-categorias">
                                                <Input id="input-image" type="file"
                                                       onChange={(e) => this.handleImage(e)}/>
                                                <Box p={1}/>
                                                {imagem && <CardMedia id="card-media-imagem-pequena" image={imagem}/>}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div id="div-botao-salvar-categorias">
                                        <Button variant="outlined" onClick={this.onClickAdicionar}>Salvar</Button>
                                        {editando && <Box p={1}/>}
                                        {
                                            editando &&
                                            <Button variant="outlined" onClick={this.onClickCancelaEdicao}>
                                                Cancelar
                                            </Button>
                                        }
                                    </div>
                                </Card>
                            }
                            <div id="div-vizualizar-cadastro" onClick={this.visualizar}>
                                <div id="div-botao-vizualizar">
                                    <FormLabel
                                        id="label-vizualizar">{!vizualizar ? 'Maximizar' : 'Minimizar'}</FormLabel>
                                    {!vizualizar ? <ExpandMore/> : <ExpandLess/>}
                                </div>
                            </div>
                            <Divider id="divider"/>
                        </div>
                        <div id="div-categorias">
                            {
                                categorias.map((i, index) => (
                                    <Categoria key={index} data={i} handleChange={this.handleCategoria.bind(this)}/>))
                            }
                        </div>
                    </section>
                </div>
                <MenuInferior pagina="categorias"/>
                <Dialog open={dialogCaterogia} onClose={this.cancelaDeletar}>
                    <DialogTitle>Deletar</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{`Deseja deletar a categoria ${categoriaDeletar} ?`}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={this.confirmaDeletar}>Sim</Button>
                        <Button color="primary" onClick={this.cancelaDeletar}>Não</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogImagem} onClose={this.cancelaImagem}>
                    <DialogTitle>{tituloCategoria}</DialogTitle>
                    <DialogContent id="card-content-imagem">
                        <CardMedia id="card-image" image={imagemCategoria}/>
                    </DialogContent>
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

export default Categorias
