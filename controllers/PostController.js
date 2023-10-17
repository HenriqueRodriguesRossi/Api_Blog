const Posts = require("../models/Posts")
const router = require("express").Router()
const checkToken = require("../utils/checkToken")
const mongoose = require("mongoose")
//
router.post("/new-post", checkToken, async (req, res) => {
    try {
        const { title, content, category } = req.body

        const user_id = req.user.id

        if (!title || !content || !category) {
            return res.status(400).send({
                mensagem: "Título, conteúdo e categoria são obrigatórios!"
            })
        } else if (title.length < 3) {
            return res.status(422).send({
                mensagem: "Título deve ter no mínimo 3 caracteres!"
            })
        } else if (content.length < 10) {
            return res.status(422).send({
                mensagem: "Conteúdo deve ter no mínimo 10 caracteres!"
            })
        }

        const newPost = new Posts({
            title,
            content,
            user: user_id
        })

        await newPost.save()

        return res.status(201).send({
            mensagem: "Post cadastrado com sucesso!",
            newPost
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            mensagem: "Erro ao cadastrar post!"
        })
    }
})

router.get("/", checkToken, async (req, res) => {
    const userId = req.user.id

    try {
        const postsResult = await Posts.find({
            user: { $ne: userId }
        })

        if (postsResult.length === 0) {
            return res.status(404).send({
                mensagem: "Nenhum post encontrado!"
            })
        } else {
            return res.status(200).send({
                postsResult
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            mensagem: "Erro ao buscar os posts!"
        })
    }
});


router.get("/find-post", checkToken, async (req, res) => {
    const { title } = req.body
    const userId = req.user.id;

    const termRegex = new RegExp(title, 'i')

    if (!title) {
        return res.status(400).send({
            mensagem: "Para pesquisar um post, digite o termo de busca!"
        });
    }

    try {
        const findPosts = await Posts.find({
            title: { $regex: termRegex },
            user: { $ne: userId } 
        });

        if (!findPosts || findPosts.length === 0) {
            return res.status(404).send({
                mensagem: "Nenhum post encontrado!"
            });
        }

        return res.status(200).send({
            Result: findPosts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            mensagem: "Erro ao buscar posts!"
        });
    }
});


module.exports = router