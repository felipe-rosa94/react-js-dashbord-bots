import React from 'react'
import '../styles/produto.css'
import {
    Card,
    CardContent,
    FormControlLabel,
    FormLabel,
    Switch
} from '@material-ui/core'
import {
    ArrowDownward,
    ArrowUpward,
    Delete,
    Edit
} from '@material-ui/icons'

class Produto extends React.Component {

    onClick = (acao, objeto, e = null) => {
        if (e) {
            objeto.ativo = e.target.checked
            this.props.handleChange({acao: acao, dados: objeto})
        } else {
            this.props.handleChange({acao: acao, dados: objeto})
        }
    }

    render() {
        const {produto, categoria, descricao, preco, ativo, imagem} = this.props.data
        return (
            <Card id="card-produto">
                <CardContent id="card-content-produto">
                    <div id="div-produto">
                        <FormLabel id="label-produto">{produto}</FormLabel>
                        {categoria && <FormLabel id="label-descricao">{categoria}</FormLabel>}
                        {descricao && <FormLabel id="label-descricao">{descricao}</FormLabel>}
                        <FormLabel id="label-preco">
                            {parseFloat(preco).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </FormLabel>
                    </div>
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
                            label={ativo ? 'Produto ativada' : 'Produto desativada'}
                        />
                        <Edit id="icone" onClick={() => this.onClick('editar', this.props.data)}/>
                        <Delete id="icone" onClick={() => this.onClick('deletar', this.props.data)}/>
                        <ArrowUpward id="icone" onClick={() => this.onClick('sobe', this.props.data)}/>
                        <ArrowDownward id="icone" onClick={() => this.onClick('desce', this.props.data)}/>
                    </div>
                </CardContent>
            </Card>
        )
    }
}

export default Produto
