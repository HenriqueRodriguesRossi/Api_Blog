const Comments = require("../models/Comments")
const router = require("express").Router()
const checkToken = require("../utils/checkToken")

router.post("/new-comments/:postId", checkToken, async (req, res)=>{
    try{
        const postId = req.params.postId
        const userId = req.user.userId
        const {content} = req.body

        const regexPalavrasOfensivas = /Cú|Cu|cu|cú|pau|Pau|Puta|puta/gi;

        if(!content){
            return res.status(400).send({
                mensagem: "Digite um comentário!"
            })
        }else if(content.match(regexPalavrasOfensivas)){
            return res.status(422).send({
                mensagem: "Não aceitamos palavras de baixo calão nos comentários!"
            })
        }
    
        const newComment = new Comments({
            content,
            post: postId,
            commnet_author: userId
        })

        await newComment.save()

        return res.status(201).send({
            mensagem: "Comentário cadastrado!",
            comentario: newComment.content
        })
    }catch(error){
        console.log(error)
        return res.status(500).send({
            mensagem: "Erro ao cadastrar comentário!"
        })
    }
})

module.exports = router