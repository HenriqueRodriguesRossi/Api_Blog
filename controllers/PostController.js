const Posts = require("../models/Posts")
const router = require("express").Router()
const checkToken = require("../utils/checkToken")

router.post("/new-post",checkToken, async (req, res)=>{
    try{
        const {title, content} = req.body

        const user_id = req.params

        if(!title || !content){
            return res.status(400).send({
                mensagem: "Título e conteúdo são obrigatórios!"
            })
        }else if(title.length < 3){
            return res.status().send({
                mensagem: "Título deve ter no mínimo 3 caracteres!"
            })
        }else if(content.length < 10){
            return res.status().send({
                mensagem: "Conteúdo deve ter no mínimo 10 caracteres!"
            })
        }

        const newPost = new Posts({
            title,
            content,
            id: user_id
        })

        await newPost.save()
        
        return res.status(201).send({
            mensagem: "Post cadastrado com sucesso!",
            newPost
        })
    }catch(error){
        return res.status(500).send({
            mensagem: "Erro ao cadastrar post!"
        })
    }
})

router.get("/", checkToken, async (req, res)=>{
    const userId = req.user.id

    const postsResult = await Posts.find({
        user: {$ne: userId}
    })

    if(!postsResult){
        return res.status(404).send({
            mensagem: "Nenhum post encontrado!"
        })
    }else{
        return res.status(200).send({
            postsResult
        })
    }
})

module.exports = router