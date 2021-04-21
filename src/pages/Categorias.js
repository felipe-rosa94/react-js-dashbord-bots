import React from 'react'
import '../styles/categorias.css'
import {Box, CardContent, Divider} from '@material-ui/core'
import {AddCircle, Cancel, Search} from '@material-ui/icons'
import {Card, TextField, Input} from '@material-ui/core'
import {request, cleanAccents} from '../util'
import MenuInferior from '../components/MenuInferior'
import Categoria from '../components/Categoria'

const {REACT_APP_URL_MONGODB} = process.env

class Categorias extends React.Component {

    state = {
        imageBase64: '',
        buscando: false,
        busca: '',
        categoria: '',
        categorias: [],
        dados: []
    }

    handleImage = async e => {
        let file = e.target.files[0]
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => this.setState({imageBase64: reader.result})
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value.toUpperCase()})

    handleDeleta = () => this.deleta()

    deleta = () => {
        this.setState({busca: '', buscando: false})
        this.consultarCategoria()
    }

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

    onClickAdicionar = () => this.adicionar()

    adicionar = async () => {
        try {
            const {categoria, imageBase64} = this.state
            const tabela = localStorage.getItem(`gp:tabela`)
            let url = `${REACT_APP_URL_MONGODB}/category${tabela}`

            const conexao = {
                method: 'post',
                body: JSON.stringify({categoria: categoria, imagem: imageBase64})
            }

            const {returnCode, message} = await request(url, conexao)
            if (returnCode) {
                this.setState({categoria: ''})
                this.consultarCategoria()
            } else {
                alert(message)
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    consultarCategoria = async () => {
        try {
            const tabela = localStorage.getItem(`gp:tabela`)
            let url = `${REACT_APP_URL_MONGODB}/category${tabela}`
            const conexao = {method: 'get'}
            const {returnCode, message, data} = await request(url, conexao)
            if (returnCode) {
                this.setState({categorias: data, dados: data})
            } else {
                alert(message)
            }
        } catch (e) {
            console.error(e.message)
        }
    }

    componentDidMount() {
        this.consultarCategoria()
    }

    render() {
        const {categoria, categorias, buscando, busca} = this.state
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

                            <Card id="card-categorias">
                                <CardContent id="card-content-categorias">

                                    <div>
                                        <TextField variant="outlined" fullWidth={true} placeholder="Categoria"
                                                   value={categoria}
                                                   id="input-categoria" name="categoria" onChange={this.handleInput}/>

                                        <Input id="input-image" type="file" onChange={(e) => this.handleImage(e)}/>
                                    </div>

                                    <Box p={1}/>
                                    <AddCircle id="icone" onClick={this.onClickAdicionar}>Adicionar</AddCircle>
                                </CardContent>
                            </Card>

                            <Divider id="divider"/>
                        </div>
                        <div id="div-categorias">
                            {
                                categorias.map((i, index) => (
                                    <Categoria key={index} data={i} handleChange={this.handleDeleta.bind(this)}/>))
                            }
                        </div>
                    </section>
                </div>
                <MenuInferior pagina="categorias"/>
            </div>
        )
    }
}

export default Categorias
