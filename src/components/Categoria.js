import React from 'react'
import '../styles/categoria.css'
import {Card, CardContent, FormControlLabel, FormLabel, Switch} from '@material-ui/core'
import {Delete, ArrowUpward, ArrowDownward} from '@material-ui/icons'

class Categoria extends React.Component {

    onClickAtivo = (e, id) => this.props.handleChange({acao: 'alterar', dados: {ativo: e.target.checked, id: id}})

    onClickDeletar = objeto => this.props.handleChange({acao: 'deletar', dados: objeto})

    onClickImagem = objeto => this.props.handleChange({acao: 'imagem', dados: objeto})

    onClickOrdem = (acao, objeto) => this.props.handleChange({acao: acao, dados: objeto})

    render() {
        const {_id, categoria, ativo, imagem, ordem} = this.props.data
        return (
            <Card id="card-categoria">
                <CardContent id="card-content-categoria">
                    <FormLabel id="label-categoria">{categoria}</FormLabel>
                    {
                        imagem &&
                        <FormLabel id="label-imagem"
                                   onClick={() => this.onClickImagem({imagem: imagem, categoria: categoria})}>
                            Ver imagem
                        </FormLabel>
                    }
                    <div id="div-acoes-categoria">
                        <FormControlLabel
                            control={<Switch checked={ativo}
                                             onChange={(e) => this.onClickAtivo(e, _id, categoria)}/>}
                            label={ativo ? 'Categoria ativada' : 'Categoria desativada'}
                        />
                        <Delete id="icone" onClick={() => this.onClickDeletar({id: _id, categoria: categoria})}/>
                        <ArrowUpward id="icone" onClick={() => this.onClickOrdem('sobe', {id: _id, ordem: ordem})}/>
                        <ArrowDownward id="icone" onClick={() => this.onClickOrdem('desce', {id: _id, ordem: ordem})}/>
                    </div>
                </CardContent>
            </Card>
        )
    }
}

export default Categoria
