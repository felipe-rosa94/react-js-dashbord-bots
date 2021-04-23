import React from 'react'
import '../styles/categoria.css'
import {Card, CardContent, FormControlLabel, FormLabel, Switch} from '@material-ui/core'
import {Delete, ArrowUpward, ArrowDownward} from '@material-ui/icons'

class Categoria extends React.Component {

    onClick = (acao, objeto, e = null) => {
        if (e) {
            objeto.ativo = e.target.checked
            this.props.handleChange({acao: acao, dados: objeto})
        } else {
            this.props.handleChange({acao: acao, dados: objeto})
        }
    }

    render() {
        const {categoria, ativo, imagem} = this.props.data
        return (
            <Card id="card-categoria">
                <CardContent id="card-content-categoria">
                    <FormLabel id="label-categoria">{categoria}</FormLabel>
                    {
                        imagem &&
                        <FormLabel id="label-imagem"
                                   onClick={() => this.onClick('imagem', this.props.data)}>
                            Ver imagem
                        </FormLabel>
                    }
                    <div id="div-acoes-categoria">
                        <FormControlLabel
                            control={<Switch checked={ativo}
                                             onChange={(e) => this.onClick('ativo', this.props.data, e)}/>}
                            label={ativo ? 'Categoria ativada' : 'Categoria desativada'}
                        />
                        <Delete id="icone" onClick={() => this.onClick('deletar', this.props.data)}/>
                        <ArrowUpward id="icone" onClick={() => this.onClick('sobe', this.props.data)}/>
                        <ArrowDownward id="icone" onClick={() => this.onClick('desce', this.props.data)}/>
                    </div>
                </CardContent>
            </Card>
        )
    }
}

export default Categoria
