import React from 'react'
import '../styles/produtos.css'
import MenuInferior from '../components/MenuInferior'
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
    FormControl, FormLabel,
    Input,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@material-ui/core'
import Produto from '../components/Produto'
import {cleanAccents, request} from '../util'
import {Cancel, Search, ExpandMore, ExpandLess} from '@material-ui/icons'

const {REACT_APP_URL_MONGODB} = process.env
const tabela = localStorage.getItem(`gp:tabela`)

class Produtos extends React.Component {

    state = {
        editando: false,
        vizualizar: true,
        imageBase64: '',
        busca: '',
        buscando: false,
        produto: '',
        categoria: 999,
        descricao: '',
        preco: '',
        produtos: [],
        categorias: [],
        dados: [],
        ativo: true
    }

    handleImage = e => {
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

    handleInput = e => this.setState({[e.target.name]: isNaN(e.target.value) ? e.target.value.toUpperCase() : e.target.value})

    handleProdutos = async objeto => {
        let {acao, dados: {_id, produto, ativo, imagem, ordem, preco, descricao, indexCategoria}} = objeto
        const {dados} = this.state
        if (acao === 'ativo') {
            await this.alterarProduto(_id, {ativo: ativo})
        } else if (acao === 'imagem') {
            this.setState({dialogImagem: true, imagemProduto: imagem, tituloProduto: produto})
        } else if (acao === 'sobe') {
            if (ordem === 0) return
            let novaOrdem = (ordem - 1)
            await this.alterarProduto(_id, {ordem: novaOrdem})
            await this.alterarProduto(dados[novaOrdem]._id, {ordem: ordem})
        } else if (acao === 'desce') {
            if (ordem === (dados.length - 1)) return
            let novaOrdem = (ordem + 1)
            await this.alterarProduto(_id, {ordem: novaOrdem})
            await this.alterarProduto(dados[novaOrdem]._id, {ordem: ordem})
        } else if (acao === 'editar') {
            this.setState({
                vizualizar: true,
                editando: true,
                _id: _id,
                produto: produto,
                preco: preco,
                imagem: imagem,
                categoria: indexCategoria
            })
            setTimeout(() => {
                document.getElementById('descricao').value = descricao
            }, 200)
        } else if (acao === 'deletar') {
            this.setState({
                busca: '',
                buscando: false,
                dialogProduto: true,
                idDeletar: _id,
                produtoDeletar: produto
            })
        }
    }

    visualizar = () => {
        const {vizualizar} = this.state
        this.setState({vizualizar: !vizualizar})
    }

    cancelaImagem = () => this.setState({dialogImagem: false})

    cancelaAviso = () => this.setState({dialogAviso: false})

    cancelaDeletar = () => this.setState({dialogProduto: false, idDeletar: '', produtoDeletar: ''})

    confirmaDeletar = () => this.deletarCategoria()

    deletarCategoria = async () => {
        try {
            const {idDeletar} = this.state
            let url = `${REACT_APP_URL_MONGODB}/products${tabela}/?id=${idDeletar}`
            let conexao = {method: 'delete'}
            const {returnCode, message} = await request(url, conexao)
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            this.setState({dialogProduto: false})
            await this.consultarProdutos()
        } catch (e) {
            console.error(e.message)
        }
    }

    alterarProduto = async (id, json) => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/products${tabela}/?id=${id}`
            let conexao = {method: 'put', body: JSON.stringify(json)}
            const {returnCode, message} = await request(url, conexao)
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            await this.consultarProdutos()
        } catch (e) {
            console.error(e.message)
        }
    }

    onClickCancelaEdicao = () => window.location.reload()

    onClickCancelaBusca = () => this.cancelaBusca()

    cancelaBusca = () => {
        const {dados} = this.state
        this.setState({busca: '', buscando: false, produtos: dados})
    }

    onClickBusca = () => this.busca()

    busca = () => {
        const {dados, busca} = this.state
        if (busca === '') return
        let array = []
        dados.forEach(i => {
            let superBusca = `${i.produto}${i.categoria}${i.descricao}${i.preco}${i.ativo}`
            if (cleanAccents(superBusca).includes(cleanAccents(busca))) array.push(i)
        })
        this.setState({buscando: true, produtos: array})
    }

    onClickAdicionar = async () => {
        const {editando, _id, produto, imagem, imageBase64, preco, categoria, categorias} = this.state
        if (editando) {
            let descricao = document.getElementById('descricao').value
            let json = {
                produto: produto,
                preco: preco,
                imagem: imageBase64 !== '' ? imageBase64 : imagem,
                descricao: descricao,
                categoria: (categorias.length !== 0 && categoria !== 999) ? categorias[categoria].categoria : 'Nenhum',
                indexCategoria: categoria
            }
            await this.alterarProduto(_id, json)
            document.getElementById('descricao').value = ''
            document.getElementById('input-image').value = ''
            this.setState({
                produto: '',
                preco: '',
                descricao: '',
                categoria: 999,
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
            const {produto, preco, categorias, categoria, imageBase64, dados, ativo} = this.state
            let url = `${REACT_APP_URL_MONGODB}/products${tabela}`
            let ordem = dados.length
            let descricao = document.getElementById('descricao').value
            const conexao = {
                method: 'post',
                body: JSON.stringify({
                    produto: produto,
                    categoria: (categorias.length !== 0 && categoria !== 999) ? categorias[categoria].categoria : 'Nenhum',
                    indexCategoria: categoria,
                    descricao: descricao,
                    preco: preco,
                    ativo: ativo,
                    imagem: imageBase64,
                    ordem: ordem
                })
            }
            const {returnCode, message} = await request(url, conexao)
            if (returnCode) {
                this.setState({produto: '', preco: '', descricao: '', categoria: 999})
                await this.consultarProdutos()
            } else {
                this.setState({dialogAviso: true, mensagemAviso: message})
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    consultarProdutos = async () => {
        try {
            let url = `${REACT_APP_URL_MONGODB}/products${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (returnCode) {
                data.sort((a, b) => {
                    if (b.ordem > a.ordem) return -1
                    if (b.ordem < a.ordem) return 1
                    return 0
                })
                this.setState({produtos: data, dados: data})
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
                this.setState({categorias: data})
            } else {
                this.setState({dialogAviso: true, mensagemAviso: message})
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    componentDidMount() {
        this.consultarProdutos()
        this.consultarCategoria()
    }

    render() {
        const {
            imagem,
            produto,
            preco,
            produtos,
            busca,
            buscando,
            dialogProduto,
            produtoDeletar,
            dialogImagem,
            tituloProduto,
            imagemProduto,
            dialogAviso,
            mensagemAviso,
            categorias,
            categoria,
            vizualizar,
            editando
        } = this.state
        return (
            <div>
                <div id="produtos">
                    <section id="section-body-produtos">
                        <div id="div-menu-produtos">
                            <Card id="card-produtos">
                                <CardContent id="card-content-produtos">
                                    <TextField variant="outlined" fullWidth={true} placeholder="Buscar Produtos"
                                               value={busca} id="input-produtos" name="busca"
                                               onChange={this.handleInput}/>
                                    <Box p={1}/>
                                    {buscando && <Cancel id="icone" onClick={this.onClickCancelaBusca}/>}
                                    <Search id="icone" onClick={this.onClickBusca}/>
                                </CardContent>
                            </Card>
                            {
                                vizualizar &&
                                <Card id="card-produtos">
                                    <CardContent id="card-content-produtos">
                                        <div id="div-formulario-inputs-produto">
                                            <div id="div-inputs-produtos">
                                                <TextField variant="outlined" fullWidth={true} placeholder="Produto"
                                                           id="produto" value={produto} name="produto"
                                                           onChange={this.handleInput}/>
                                                <Box p={1}/>
                                                <TextField variant="outlined" fullWidth={true} placeholder="Preço"
                                                           type="number" id="preco"
                                                           value={preco} name="preco" onChange={this.handleInput}/>
                                            </div>
                                            <div id="div-inputs-produtos">
                                                <TextField variant="outlined" fullWidth={true} placeholder="Descrição"
                                                           name="descricao" id="descricao"
                                                           onChange={this.handleInput}/>
                                                <Box p={1}/>
                                                <FormControl variant="outlined" fullWidth={true}>
                                                    <InputLabel id="demo-simple-select-label">Categoria</InputLabel>
                                                    <Select
                                                        labelId="demo-simple-select-outlined-label"
                                                        id="demo-simple-select-outlined"
                                                        label="Categoria"
                                                        name="categoria"
                                                        onChange={this.handleInput}
                                                        value={categoria}>
                                                        <MenuItem value={999}>Nenhum</MenuItem>
                                                        {categorias.map((i, index) => (
                                                            <MenuItem key={index}
                                                                      value={index}>{i.categoria}</MenuItem>))}
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div id="div-inputs-produtos">
                                                <Input id="input-image" type="file"
                                                       onChange={(e) => this.handleImage(e)}/>
                                                <Box p={1}/>
                                                {imagem && <CardMedia id="card-media-imagem-pequena" image={imagem}/>}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div id="div-botao-salvar-produtos">
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
                        <div id="div-produtos">
                            {produtos.map((i, index) => (
                                <Produto key={index} data={i} handleChange={this.handleProdutos.bind(this)}/>))}
                        </div>
                    </section>
                </div>
                <MenuInferior pagina="produtos"/>
                <Dialog open={dialogProduto} onClose={this.cancelaDeletar}>
                    <DialogTitle>Deletar</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{`Deseja deletar a produto ${produtoDeletar} ?`}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={this.confirmaDeletar}>Sim</Button>
                        <Button color="primary" onClick={this.cancelaDeletar}>Não</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogImagem} onClose={this.cancelaImagem}>
                    <DialogTitle>{tituloProduto}</DialogTitle>
                    <DialogContent id="card-content-imagem">
                        <CardMedia id="card-image" image={imagemProduto}/>
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

export default Produtos
