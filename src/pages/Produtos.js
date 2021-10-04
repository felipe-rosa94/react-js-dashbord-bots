import React from 'react'
import '../styles/produtos.css'
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
    TextField,
    FormControlLabel,
    Checkbox, CircularProgress
} from '@material-ui/core'
import Produto from '../components/Produto'
import {chave, cleanAccents, request} from '../util'
import {withStyles} from '@material-ui/core/styles'
import {Cancel, Search, ExpandMore, ExpandLess} from '@material-ui/icons'
import firebase from '../firebase'

const {REACT_APP_URL_MONGODB} = process.env
let tabela

const CheckButton = withStyles({
    checked: {},
})(props => <Checkbox color="default" {...props} />)

class Produtos extends React.Component {

    state = {
        editando: false,
        vizualizar: true,
        arquivoImagem: '',
        busca: '',
        buscando: false,
        produto: '',
        codigo: '',
        categoria: 999,
        descricao: '',
        preco: '',
        produtos: [],
        categorias: [],
        adicionais: [],
        etapasProduto: [],
        dados: [],
        ativo: true,
        mensagemCarregendo: 'Carregando',
        dialogEtapas: false,
        dialogAviso: false,
        dialogImagem: false,
        dialogProduto: false,
        dialogCarregando: false,
        listaEtapas: false
    }

    handleImage = e => {
        let file = e.target.files[0]
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => this.setState({imagem: reader.result.replace(/=/g, ''), arquivoImagem: file})
    }

    uploadImage = async (key, image) => {
        this.setState({dialogCarregando: true, mensagemCarregendo: 'Aguarde, fazendo upload da imagem...'})
        const {_delegate: {state}} = await firebase.storage().ref(`imagens/${key}`).put(image)
        this.setState({dialogCarregando: true, mensagemCarregendo: 'Aguarde, obtendo URL...'})
        if (state === 'success') {
            this.setState({dialogCarregando: false})
            return await firebase.storage().ref(`imagens/${key}`).getDownloadURL()
        }
        return ''
    }

    handleInput = e => this.setState({[e.target.name]: isNaN(e.target.value) ? e.target.value : e.target.value})

    handleProdutos = async objeto => {
        let {
            acao,
            dados: {
                _id,
                produto,
                ativo,
                imagem,
                chaveImagem,
                ordem,
                preco,
                descricao,
                indexCategoria,
                codigo,
                etapasProduto
            }
        } = objeto
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
            let date = new Date()
            let chave = date.getTime()
            this.setState({
                vizualizar: true,
                editando: true,
                _id: _id,
                produto: produto,
                etapasProduto: etapasProduto,
                preco: preco,
                imagem: imagem,
                categoria: indexCategoria,
                codigo: codigo,
                listaEtapas: true,
                chaveImagem: (chaveImagem !== undefined) ? chaveImagem : chave
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

    confirmaDeletar = () => this.deletarProduto()

    deletarProduto = async () => {
        try {
            const {idDeletar} = this.state
            this.setState({
                dialogProduto: false,
                dialogCarregando: true,
                mensagemCarregendo: 'Aguarde, deletando produto...'
            })
            let url = `${REACT_APP_URL_MONGODB}/produtos-${tabela}/?id=${idDeletar}`
            let conexao = {method: 'delete'}
            const {returnCode, message} = await request(url, conexao)
            this.setState({dialogCarregando: false})
            if (!returnCode) this.setState({dialogAviso: true, mensagemAviso: message})
            await this.consultarProdutos()
        } catch (e) {
            console.error(e.message)
        }
    }

    alterarProduto = async (id, json) => {
        try {
            this.setState({dialogCarregando: true, mensagemCarregendo: 'Aguarde, alterando produto...'})
            let url = `${REACT_APP_URL_MONGODB}/produtos-${tabela}/?id=${id}`
            let conexao = {method: 'put', body: JSON.stringify(json)}
            const {returnCode, message} = await request(url, conexao)
            this.setState({dialogCarregando: false})
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

    onCheckEtapas = (objeto, e) => {
        let {etapasProduto} = this.state
        if (e.target.checked) {
            etapasProduto.push(objeto)
            this.setState({etapasProduto: etapasProduto})
        } else {
            let index = etapasProduto.indexOf(objeto)
            etapasProduto.splice(index, 1)
            this.setState({etapasProduto: etapasProduto})
        }
    }

    confirmarEtapas = () => this.setState({dialogEtapas: false})

    cancelaEtapas = () => this.setState({dialogEtapas: false, etapasProduto: []})

    onClickListaEtapas = () => this.setState({dialogEtapas: true, etapasProduto: []})

    limpar = () => {
        document.getElementById('descricao').value = ''
        document.getElementById('input-image').value = ''
        this.setState({
            produto: '',
            preco: '',
            descricao: '',
            categoria: 999,
            editando: false,
            imagem: '',
            arquivoImagem: '',
            etapasProduto: [],
            codigo: ''
        })
    }

    onClickAdicionar = async () => {
        const {
            editando,
            _id,
            produto,
            imagem,
            arquivoImagem,
            preco,
            categoria,
            categorias,
            etapasProduto,
            codigo,
            chaveImagem
        } = this.state
        if (editando) {
            let descricao = document.getElementById('descricao').value
            let item = {
                produto: produto,
                preco: preco !== '' ? parseFloat(preco) : 0,
                imagem: arquivoImagem !== '' ? await this.uploadImage(chaveImagem, arquivoImagem) : imagem,
                descricao: descricao,
                etapasProduto: etapasProduto,
                categoria: (categorias.length !== 0 && categoria !== 999) ? categorias[categoria].categoria : 'Nenhum',
                indexCategoria: categoria,
                codigo: codigo !== undefined ? codigo : '',
                chaveImagem: chaveImagem
            }
            await this.alterarProduto(_id, item)
            this.limpar()
        } else {
            await this.adicionar()
        }
    }

    adicionar = async () => {
        try {
            const {
                produto,
                preco,
                categorias,
                categoria,
                arquivoImagem,
                dados,
                ativo,
                etapasProduto,
                codigo
            } = this.state
            if (produto === '') return this.setState({dialogAviso: true, mensagemAviso: 'Coloque um nome no produto'})
            if (categoria === 999) return this.setState({
                dialogAviso: true,
                mensagemAviso: 'Escolhe uma categoria para o produto'
            })
            this.setState({dialogCarregando: true, mensagemCarregendo: 'Aguarde, adicionando produto...'})
            let url = `${REACT_APP_URL_MONGODB}/produtos-${tabela}`
            let ordem = dados.length
            let descricao = document.getElementById('descricao').value

            let chaveImagem = chave()
            let imagem = await this.uploadImage(chaveImagem, arquivoImagem)

            let item = {
                produto: produto,
                categoria: (categorias.length !== 0 && categoria !== 999) ? categorias[categoria].categoria : 'Nenhum',
                indexCategoria: categoria,
                descricao: descricao,
                preco: preco !== '' ? parseFloat(preco) : 0,
                ativo: ativo,
                etapasProduto: etapasProduto,
                imagem: imagem,
                ordem: ordem,
                codigo: codigo !== undefined ? codigo : '',
                chaveImagem: chaveImagem
            }

            const conexao = {method: 'post', body: JSON.stringify(item)}

            const {returnCode, message} = await request(url, conexao)
            this.setState({dialogCarregando: false})
            if (returnCode) {
                this.limpar()
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
            this.setState({dialogCarregando: true, mensagemCarregendo: 'Aguarde, baixando produtos...'})
            let url = `${REACT_APP_URL_MONGODB}/produtos-${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            this.setState({dialogCarregando: false})
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
            let url = `${REACT_APP_URL_MONGODB}/categoria-${tabela}`
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

    consultaAdicionais = async () => {
        let url = `${REACT_APP_URL_MONGODB}/adicionais-${tabela}`
        const conexao = {method: 'get'}
        const {data} = await request(url, conexao)
        this.setState({adicionais: data})
    }

    componentDidMount() {
        tabela = localStorage.getItem(`gp:tabela`)
        this.consultarProdutos()
        this.consultarCategoria()
        this.consultaAdicionais()
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
            editando,
            dialogEtapas,
            adicionais,
            codigo,
            dialogCarregando,
            mensagemCarregendo,
            listaEtapas,
            etapasProduto
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
                                                <TextField variant="outlined" placeholder="Código"
                                                           id="codigo" value={codigo} name="codigo"
                                                           onChange={this.handleInput}/>
                                                <Box p={1}/>
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
                                            </div>
                                            <div id="div-inputs-produtos">
                                                <Button variant="outlined" fullWidth={true}
                                                        onClick={this.onClickListaEtapas}>Adicionais</Button>
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
                                                {
                                                    (listaEtapas) &&
                                                    <div>
                                                        {
                                                            etapasProduto.map((i, index) => (
                                                                <div key={index}>
                                                                    <FormLabel
                                                                        id="label-titulo-adicional">{i.tituloAdicional}</FormLabel>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                }
                                            </div>

                                            <div id="div-inputs-produtos-image">
                                                <div id="div-input-image">
                                                    <Input id="input-image" type="file"
                                                           onChange={(e) => this.handleImage(e)}/>
                                                </div>
                                                <div id="div-input-image">
                                                    {
                                                        imagem &&
                                                        <Card>
                                                            <CardMedia id="card-media-imagem-pequena" image={imagem}/>
                                                        </Card>
                                                    }
                                                </div>
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
                <Dialog open={dialogEtapas} onClose={this.cancelaEtapas}>
                    <DialogTitle>Escolha as Etapas</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Escolhas as etapas para vincular a esse produto</DialogContentText>
                        <div id="div-escolher-etapas">
                            {
                                adicionais.map((i, index) => (
                                    <FormControlLabel key={index} control={<CheckButton/>} label={i.tituloAdicional}
                                                      onChange={(e) => this.onCheckEtapas(i, e)}/>
                                ))
                            }
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={this.cancelaEtapas}>Cancelar</Button>
                        <Button color="primary" onClick={this.confirmarEtapas}>Confirmar</Button>
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
        )
    }
}

export default Produtos
