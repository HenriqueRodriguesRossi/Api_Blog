const router = require("express").Router()
const yup = require("yup")
const captureErrorYup = require("../utils/captureErrorYup")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const speakeasy = require('speakeasy');
const checkToken = require("../utils/checkToken")

router.post("/new_user", async (req, res) => {
    try {
        const { full_name, name_of_user, email, password } = req.body

        const userSchema = yup.object().shape({
            full_name: yup.string().required('O nome completo é obrigatório!'),
            name_of_user: yup
                .string()
                .required('O nome de usuário é obrigatório!')
                .min(5, 'O nome de usuário deve ter pelo menos 5 caracteres')
                .max(20, 'O nome de usuário deve ter no máximo 20 caracteres')
                .matches(/@.+/, 'O nome de usuário deve conter um "@"'),
            email: yup.string().email('Digite um email válido!').required('O email é obrigatório!'),
            password: yup
                .string()
                .required('A senha é obrigatória!')
                .min(6, 'A senha deve ter pelo menos 6 caracteres')
                .max(30, 'A senha deve ter no máximo 30 caracteres')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                    'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um símbolo'
                ),
        });

        await userSchema.validate(req.body, { abortEarly: false })

        const checkEmail = await User.findOne({ email })
        const checkUserName = await User.findOne({ name_of_user })

        if (checkEmail) {
            return res.status(422).send({
                mensagem: "Esse email já está em uso!"
            })
        } else if (checkUserName) {
            return res.status(422).send({
                mensagem: "Esse nome de usuário já está em uso!"
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = new User({
            full_name,
            name_of_user,
            email,
            password: passwordHash
        })

        await newUser.save()

        return res.status(201).send({
            mensagem: "Usuário cadastrado com sucesso!"
        })
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors = [captureErrorYup(error)]

            return res.status(500).send({
                errors
            })
        } else {
            console.log(error)
            return res.status(500).send({
                mensagem: "Erro ao cadastrar usuário!"
            })
        }
    }
})

router.post("/login", async (req, res) => {
    try {
        const { name_of_user, password, otp } = req.body

        if (!name_of_user || !password) {
            return res.status(400).send({
                mensagem: "Todos os campos devem ser preenchidos!"
            })
        }

        const checkEmail = await User.findOne({ email })
        const checkPass = await bcrypt.compareSync(password, checkEmail.password)

        if (!checkEmail || !checkPass) {
            return res.status(433).send({
                mensagem: "Email ou senha estão incorretos!"
            })
        }

        // Verificar se a autenticação de dois fatores está ativada
        if (user.isTwoFactorEnabled) {
            // Verificar o código OTP
            const isOTPValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'ascii',
                token: otp,
                window: 1,
            });

            if (!isOTPValid) {
                return res.status(433).send({
                    mensagem: 'Código OTP incorreto!',
                });
            }
        }
        
        const secret = process.env.SECRET

        const token = jwt.sign({
            id: checkEmail._id
        }, secret)

        return res.status(200).send({
            mensagem: "Login efetuado com sucesso!",
            token: token,
            user_id: checkEmail._id
        })
    } catch (error) {
        return res.status(500).send({
            mensagem: "Erro ao efetuar o login!"
        })
    }   
})

router.put("/activate-2FA", checkToken, async (req, res)=>{
    const {email} = req.body
    const checkEmail = await User.findOne({email})

    if(!checkEmail){
        return res.status(404).send({
            mensagem: "Nenhum usuário com esse email encontrado!"
        })
    }else{
        await User.findOneAndUpdate({
            email, 
            isTwoFactorEnabled: true
        })

        return res.status(200).send({
            mensagem: "Autenticação de dois fatores ativada!"
        })
    }
})

module.exports = router